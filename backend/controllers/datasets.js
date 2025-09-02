const util = require("../util/file_management");
const axios = require("axios").default;
const runPython = require("../util/python_config");
const datasets = require("../models/datasets");
const knex = require('knex')(require("../util/database_config").defaultConfig());
const { getName } = require("../util/user_name");
const emails = require("../util/email_management");
const dataQueries = require("../util/data_queries");
const aws = require("../util/aws");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../util/aws");
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Add simple file storage functions to track session info
const getSessionPath = (sessionId) => {
    return path.join(os.tmpdir(), `upload_session_${sessionId}.json`);
};

const saveSession = (sessionId, sessionData) => {
    const filePath = getSessionPath(sessionId);
    const dataToStore = {
        ...sessionData,
        uploadedChunks: Array.from(sessionData.uploadedChunks)
    };
    fs.writeFileSync(filePath, JSON.stringify(dataToStore));
};

const loadSession = (sessionId) => {
    const filePath = getSessionPath(sessionId);
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const sessionData = JSON.parse(data);
        sessionData.uploadedChunks = new Set(sessionData.uploadedChunks);
        return sessionData;
    } catch (error) {
        return null; // Session doesn't exist or expired
    }
};

const deleteSessionFile = (sessionId) => {
    const filePath = getSessionPath(sessionId);
    try {
        fs.unlinkSync(filePath);
    } catch (error) {
    }
};

// Update createChunkSession
const createChunkSession = (tableName, totalChunks, email) => {
    const sessionId = `${tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = {
        sessionId,
        tableName,
        totalChunks: parseInt(totalChunks),
        email,
        uploadedChunks: new Set(),
        createdAt: Date.now(),
        s3ChunkKeys: []
    };
    
    // Save chuncked info to file -- DO NOT store full chunck in memory
    saveSession(sessionId, session);
    return session;
};

// Upload a new dataset from a csv file
const createDataset = async(email) => {
    // Get the file name from the user's email and a time stamp
    const table_name = `${ email.replace(/\W+/g, "_") }_${ Date.now() }`;
    // Get a signed url to upload the file
    const url = await aws.uploadFileDirect(table_name)

    return {
        table_name,
        url
    };
}

// Initialize chunked upload session
const initializeChunkedUpload = async(email, totalChunks, originalFileName) => {
    console.log('Chunked upload initialization hit');
    const table_name = `${ email.replace(/\W+/g, "_") }_${ Date.now() }`;
    const session = createChunkSession(table_name, totalChunks, email);
    
    console.log(`Initialized chunked upload session: ${session.sessionId} for ${originalFileName}`);
    
    return {
        sessionId: session.sessionId,
        table_name,
        totalChunks: parseInt(totalChunks)
    };
};

// Goes through each chunck, uploads it to s3, and saves info to session storage
const uploadChunk = async(sessionId, chunkIndex, chunkBuffer) => {
    const session = loadSession(sessionId);
    
    if (!session) {
        throw new Error('Upload session not found or expired');
    }
    
    const chunkKey = `temp_chunks/${session.tableName}/chunk_${chunkIndex}`;
    
    try {
        // Upload chunk directly to S3
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: chunkKey,
            Body: chunkBuffer,
            ContentType: "application/octet-stream"
        });
        
        await s3Client.send(uploadCommand);
        
        // Track uploaded chunk
        session.uploadedChunks.add(parseInt(chunkIndex));
        session.s3ChunkKeys[parseInt(chunkIndex)] = chunkKey;
        
        // Save updated session to file
        saveSession(sessionId, session);
        
        console.log(`Uploaded chunk ${chunkIndex}/${session.totalChunks - 1} for session ${sessionId}`);
        
        return {
            chunkIndex: parseInt(chunkIndex),
            uploaded: true,
            totalReceived: session.uploadedChunks.size,
            totalExpected: session.totalChunks
        };
        
    } catch (error) {
        console.error(`Failed to upload chunk ${chunkIndex}:`, error);
        throw new Error(`Failed to upload chunk: ${error.message}`);
    }
};

// Checks for all chunks, puts them together in S3, and moves them into temp-uploads folder in AWS 
const finalizeChunkedUpload = async(sessionId) => {
    console.log('=== STARTING finalizeChunkedUpload ===');
    console.log('SessionId:', sessionId);

    const session = loadSession(sessionId);
    console.log('Session loaded:', session ? '✅ SUCCESS' : '❌ FAILED');
    console.log(`Session totalChunks: ${session.totalChunks}, uploadedChunks size: ${session.uploadedChunks.size}`);
    console.log('Uploaded chunks:', Array.from(session.uploadedChunks).sort((a,b) => a-b));
    
    if (!session) {
        throw new Error('Upload session not found or expired');
    }

    console.log('Session details:');
    console.log(`  - totalChunks: ${session.totalChunks}`);
    console.log(`  - uploadedChunks.size: ${session.uploadedChunks.size}`);
    console.log(`  - tableName: ${session.tableName}`);
    console.log(`  - Uploaded chunks: [${Array.from(session.uploadedChunks).sort((a,b) => a-b).join(', ')}]`);
    
    // Verify all chunks are uploaded
    if (session.uploadedChunks.size !== session.totalChunks) {
        console.log('CHUNK COUNT MISMATCH!');
        console.log(`Expected: ${session.totalChunks}, Got: ${session.uploadedChunks.size}`);
        
        // Find missing chunks
        const expectedChunks = new Set(Array.from({length: session.totalChunks}, (_, i) => i));
        const missingChunks = [...expectedChunks].filter(chunk => !session.uploadedChunks.has(chunk));
        console.log('Missing chunks:', missingChunks);

        throw new Error(`Missing chunks. Expected ${session.totalChunks}, got ${session.uploadedChunks.size}`);
    }

    console.log('All chunks verified, starting S3 assembly...');
    
    try {
        // Use streaming upload to avoid memory issues with large files
        const { Upload } = require('@aws-sdk/lib-storage');
        const { Readable } = require('stream');
        
        const finalKey = `temp_uploads/${session.tableName}.csv`;
        console.log('Final S3 key will be:', finalKey);

        let currentChunk = 0;
        let headers = null;
        
        // Create a stream that reads chunks one by one
        const combinedStream = new Readable({
            async read() {
                if (currentChunk >= session.totalChunks) {
                    this.push(null); // End of stream
                    return;
                }
                
                try {
                    const chunkKey = session.s3ChunkKeys[currentChunk];
                    
                    const getCommand = new GetObjectCommand({
                        Bucket: process.env.S3_BUCKET,
                        Key: chunkKey
                    });
                    
                    const chunkResponse = await s3Client.send(getCommand);
                    const chunkBuffer = await streamToBuffer(chunkResponse.Body);
                    
                    // Get headers from first chunk
                    if (currentChunk === 0) {
                        const csvString = chunkBuffer.toString('utf8');
                        const lines = csvString.trim().split('\n');
                        headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));

                        // Insert headers into temp_cols table
                        console.log('Inserting headers into dataset_temp_cols:', headers);
                        
                        try {
                            // Insert each header as a temporary column
                            const tempColInserts = headers.map(header => ({
                                table_name: session.tableName,
                                col: header
                            }));
                            
                            await knex('dataset_temp_cols').insert(tempColInserts);
                            console.log(' Headers successfully inserted into database');
                        } catch (dbError) {
                            console.error('Failed to insert headers into database:', dbError);
                            throw new Error(`Database insertion failed: ${dbError.message}`);
                        }
                    }
                    
                    this.push(chunkBuffer);
                    currentChunk++;
                    
                } catch (error) {
                    this.emit('error', error);
                }
            }
        });
        
        // Upload the combined stream
        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: process.env.S3_BUCKET,
                Key: finalKey,
                Body: combinedStream,
                ContentType: "text/csv"
            }
        });
        
        await upload.done();
        
        // Clean up chunk files from S3
        await cleanupChunkFiles(session);
        
        // Remove session file
        deleteSessionFile(sessionId);
        
        console.log(`Successfully assembled chunked upload for ${session.tableName}`);
        
        return {
            table_name: session.tableName,
            headers,
            fileSize: 'streamed',
            chunksProcessed: session.totalChunks
        };
        
    } catch (error) {
        console.error(`Failed to finalize chunked upload:`, error);
        
        // Clean up on error
        await cleanupChunkFiles(session);
        deleteSessionFile(sessionId);
        
        throw new Error(`Failed to finalize upload: ${error.message}`);
    }
};

// Helper function to convert stream to buffer
const streamToBuffer = async (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
};

// Helper function to clean up chunk files from S3
const cleanupChunkFiles = async (session) => {
    try {
        const deletePromises = session.s3ChunkKeys.map(async (chunkKey) => {
            if (chunkKey) {
                const deleteCommand = new DeleteObjectCommand({
                    Bucket: process.env.S3_BUCKET,
                    Key: chunkKey
                });
                await s3Client.send(deleteCommand);
            }
        });
        
        await Promise.all(deletePromises);
        console.log(`Cleaned up ${session.s3ChunkKeys.length} chunk files`);
    } catch (error) {
        console.error('Error cleaning up chunk files:', error);
    }
};

// Cleans up expired chunck in temp-chunk AWS folder (protects storage incase upload fails)
const cleanupExpiredSessions = () => {
    try {
        const tmpDir = os.tmpdir();
        const files = fs.readdirSync(tmpDir);
        const sessionFiles = files.filter(f => f.startsWith('upload_session_'));
        const now = Date.now();
        const MAX_SESSION_AGE = 12 * 60 * 60 * 1000; // 12 hours
        
        sessionFiles.forEach(async (file) => {
            const filePath = path.join(tmpDir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > MAX_SESSION_AGE) {
                const sessionId = file.replace('upload_session_', '').replace('.json', '');
                console.log(`Cleaning up expired session: ${sessionId}`);
                
                try {
                    const session = loadSession(sessionId);
                    if (session) {
                        await cleanupChunkFiles(session);
                    }
                } catch (error) {
                    console.error('Error during session cleanup:', error);
                }
                
                deleteSessionFile(sessionId);
            }
        });
    } catch (error) {
        console.error('Error during expired session cleanup:', error);
    }
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

// Import a new dataset from an api
const createDatasetAPI = async(endpoint, email, token = null) => {
    // Add token if passed
    let apiConfig = {};
    if (token) {
        apiConfig = {
            headers: {
                Authorization: `Bearer ${ token }`
            }
        }
    }

    // Get the data from the api
    const res = await axios.get(endpoint, apiConfig);
    // If the request failed, throw an error
    if (res.status !== 200) {
        throw new Error(`External API status code ${ res.status }: ${ res.statusText }`);
    }
    // If the request succeeded, store data
    const data = res.data;

    // Create table name using user's email
    const table_name = `${ email.replace(/\W+/g, "_") }_${ Date.now() }`;
    
    let csvData = '';
    let headers = [];
    
    if (typeof data === "string") {
        // Data is already a CSV string
        csvData = data;
        
        // Parse the CSV string to extract headers for validation
        const lines = data.trim().split('\n');
        if (lines.length === 0) {
            throw new Error("No records retrieved from API");
        }
        
        // Extract headers from first line
        const firstLine = lines[0];
        headers = firstLine.split(',').map(header => header.trim().replace(/"/g, ''));
        
    } else if (typeof data === "object" && Array.isArray(data)) {
        // Data is an array of objects, convert to CSV
        if (data.length === 0) {
            throw new Error("No records retrieved from API");
        }
        
        // Get headers from first object
        headers = Object.keys(data[0]);
        
        // Convert to CSV format
        const csvRows = [];
        // Add header row
        csvRows.push(headers.join(','));
        
        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Handle values that might contain commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            });
            csvRows.push(values.join(','));
        });
        
        csvData = csvRows.join('\n');
        
    } else {
        // If the request data is not in the correct format, throw an error
        throw new Error(`Type ${ typeof data } is not valid`);
    }

    // Upload CSV data directly to S3
    try {
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `temp_uploads/${ table_name }.csv`,
            Body: csvData,
            ContentType: "text/csv"
        });
        
        await s3Client.send(uploadCommand);
    } catch (error) {
        throw new Error(`Failed to upload data to S3: ${error.message}`);
    }

    return {
        table_name,
        headers
    };
}

// Upload dataset records using Python
const uploadDataset = async(knex, name, metadata, textCols, embedCols, tags, user) => {
    const model = new datasets(knex);

    // Extract email from user
    const email = user.email;

    // If the user of this dataset does not match the user, throw error
    if (!name.includes(email.replace(/\W+/g, "_"))) {
        throw new Error(`User ${ email } is not the owner of this dataset`);
    }

    // Upload metadata
    await model.createMetadata(name, email, metadata);
    // Upload all columns
    const headers = await getTempCols(knex, name);
    await model.addCols(name, headers);
    // Upload text columns
    await model.addTextCols(name, textCols);
    // Upload embedding columns
    if (embedCols && embedCols.length > 0) {
        await model.addEmbedCols(name, embedCols);
    }
    // Upload tags
    if (tags && tags.length > 0) {
        await model.addTag(name, tags);
    }

    // Delete temp columns
    await model.deleteTempCols(name);

    // Start batch preprocessing
    console.log(">>> [uploadDataset] Submitting batch job for:", name);
    await aws.submitBatchJob(name);
}

// Trigger reprocessing for a dataset
const reprocessDataset = async(knex, table, email) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== email) {
        throw new Error(`User ${ email } is not the owner of this dataset`);
    }

    // Check if enough changes have been made to allow reprocessing
    const threshold = 5;
    if (metadata.unprocessed_updates < threshold) {
        throw new Error(`This dataset requires ${ threshold } changes to enable reprocessing. Only ${ metadata.unprocessed_updates } have been made.`);
    }

    // Start batch job to reprocess the dataset
    console.log(">>> [reprocessDataset] Submitting batch job for:", table);
    await aws.submitBatchJob(table);

    // Update metadata to indicate reprocessing has begun
    await model.updateMetadata(table, { reprocess_start: true });
}

// Create signed url to upload a new batch for a dataset
const createBatch = async(knex, table, email) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== email) {
        throw new Error(`User ${ email } is not the owner of this dataset`);
    }

    // Get a signed url to upload the file
    const batch = metadata.num_batches + 1;
    const url = await aws.uploadFileDirect(table, batch)

    return {
        batch,
        url
    };
}

// Start processing a new batch for a dataset
const uploadBatch = async(knex, table, batch, email) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== email) {
        throw new Error(`User ${ email } is not the owner of this dataset`);
    }

    // Get the old column names for this dataset
    let oldCols = await model.getColumnNames(table);
    oldCols = oldCols.map(x => x.col);
    // Get the new column names from the temp cols table
    const newCols = await getTempCols(knex, table);

    // Delete temp columns as they are no longer needed
    await model.deleteTempCols(table);

    // Check if the old and new columns match
    const columnsMatch = (cols1 = [], cols2 = []) => {
        if (cols1.length !== cols2.length) {
            return false;
        }

        return cols1.every(x => cols2.includes(x));
    }

    // Throw error if columns don't match and delete dataset from s3
    if (!columnsMatch(oldCols, newCols)) {
        await aws.deleteTempUpload(table, batch);
        await model.deleteTempCols(table);
        throw new Error(`
            Column names of given file do not match existing data.
            Old columns: ${ oldCols }
            New columns: ${ newCols }
        `);
    }

    // Start processing job for new data
    console.log(">>> [uploadBatch] Submitting batch job for:", table, "Batch:", batch);
    await aws.submitBatchJob(table, batch);
}

// Add a tag for a dataset
const addTag = async(knex, user, table, tags) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // If cols is not an array, make it an array
    if (!Array.isArray(tags)) {
        tags = [ tags ];
    }

    // Add tags to db
    await model.addTag(table, tags);

    // Return all tags for this dataset
    const records = await getTags(knex, table);
    return records;
}

// Like a dataset
const addLike = async(knex, user, table) => {
    const model = new datasets(knex);

    await model.addLike(user, table);
}

// Add a text suggestions
const addSuggestion = async(knex, user, params) => {
    const model = new datasets(knex);

    const post_date = new Date();
    const suggestion = await model.addSuggestion(user, { ...params, post_date });
    
    // Send an email to the owner of the dataset
    const curr = await model.getMetadata(suggestion.table_name);
    await emails.suggestionEmail(
        knex, curr.email, suggestion.email, curr.title,
        suggestion.old_text, suggestion.new_text, suggestion.id, "add"
    );
}

// Upload a stopwords list to s3
const uploadStopwords = async(localPath, table_name = "", email = "") => {
    if (!table_name.includes(email.replace(/\W+/g, "_"))) {
        throw new Error(`User ${ email } did not create dataset ${ table_name }`);
    }

    const s3Path = `stopwords/${ table_name }.txt`
    await aws.uploadFile(localPath, s3Path);
}

// Update a dataset's metadata
const updateMetadata = async(knex, user, table, params) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Update metadata record
    const record = await model.updateMetadata(table, params);
    return record;
}

// Increment a dataset's clicks
const incClicks = async(knex, table) => {
    const model = new datasets(knex);

    const result = await model.incClicks(table);
    return result;
}

// Update the text of a dataset
const updateText = async(knex, id, user) => {
    const model = new datasets(knex);

    const suggestion = await model.getSuggestion(id);
    const curr = await model.getMetadata(suggestion.table_name);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Run python program to replace text
    const paramsFile = `files/python/input/${ suggestion.table_name }_${ Date.now() }.json`
    util.generateJSON(paramsFile, suggestion);
    await runPython("update_text", [paramsFile], curr.distributed);

    // Update updates count
    await model.incUpdates(suggestion.table_name);

    // Send an email to the person who made the suggestion
    await emails.suggestionEmail(
        knex, suggestion.email, curr.email, curr.title,
        suggestion.old_text, suggestion.new_text, suggestion.id, "confirm"
    );

    // Delete all files for this dataset to reset them
    util.deleteDatasetFiles(suggestion.table_name);
    // Delete the suggestion record
    await model.deleteSuggestionById(id);
}

// Get dataset metadata
const getMetadata = async(knex, table) => {
    const model = new datasets(knex);

    const result = await model.getMetadata(table);
    return result;
}

// Get metadata including data from other columns
const getFullMetadata = async(knex, table, email) => {
    const model = new datasets(knex);

    const result = await getMetadata(knex, table);

    result.tags = await getTags(knex, table);
    if (email) {
        result.liked = await model.getLike(email, result.table_name);
    } else {
        result.liked = false;
    }
    result.likes = await model.getLikeCount(result.table_name);

    return result;
}

// Get unique tags
const getUniqueTags = async(knex, query) => {
    const model = new datasets(knex);

    // Get tag names from table
    const records = await model.getUniqueTags(query.search, query.page, query.pageLength);
    // Convert objects to strings with tag names
    const results = records.map(x => x.tag_name);
    return results;
} 

// Get tags by dataset
const getTags = async(knex, table) => {
    const model = new datasets(knex);

    // Get tag names from table
    const records = await model.getTags(table);
    // Convert objects to strings with tag names
    const results = records.map(x => x.tag_name);
    return results;
} 

// Get text columns by dataset
const getTextCols = async(knex, table) => {
    const model = new datasets(knex);

    // Get col names from table
    const records = await model.getTextCols(table);
    // Convert objects to strings with col names
    const results = records.map(x => x.col);
    return results;
}

// Get embedding columns by dataset
const getEmbedCols = async(knex, table) => {
    const model = new datasets(knex);

    // Get col names from table
    const records = await model.getEmbedCols(table);
    // Convert objects to strings with col names
    const results = records.map(x => x.col);
    return results;
}

// Get dataset column names (excluding text columns)
const getColumnNames = async(knex, table) => {
    const model = new datasets(knex);

    // Get all column names
    const names = await model.getColumnNames(table);
    // Get text columns
    const textCols = await getTextCols(knex, table);
    // Filter out text columns
    const results = names.map(x => x.col).filter(x => !textCols.includes(x));
    return results;
}

// Get unique values in a dataset column
const getColumnValues = async(knex, table, column, search = undefined, page = 1, pageLength = 10) => {
    const model = new datasets(knex);

    // Get metadata to check for a distributed connection
    const metadata = await model.getMetadata(table);

    // Check to see if cache of values exists
    const path = `files/nodejs/values/${ table }_${ column }.json`;
    let data;
    if (util.fileExists(path)) {
        // If file already exists, load data from file
        data = util.readJSON(path, false);
    } else {
        // Else, download dataset from S3
        const scan = await dataQueries.uniqueColValues(metadata.table_name, column);
        data = scan
            .collectSync()
            .getColumn(column)
            .unique()
            .toArray();

        // Store cache of data
        util.generateJSON(path, data);
    }

    // Filter and grab first 10 results
    const start = pageLength * (page - 1);
    const end = pageLength * page;
    let results;
    if (search) {
        // Filter for search term
        search = search.toLowerCase();
        results = data.filter(val => String(val).toLowerCase().includes(search)).slice(start, end);
    } else {
        // Return unique values in given column
        results = data.slice(start, end);
    }

    return results;
}

// Get filtered datasets
const getFilteredDatasets = async(knex, query, email, page) => {
    const model = new datasets(knex);

    const results = await model.getFilteredDatasets(query, email, true, page);
    // Get tags and likes for search results
    for (let i = 0; i < results.length; i++) {
        results[i].tags = await getTags(knex, results[i].table_name);
        if (email) {
            results[i].liked = await model.getLike(email, results[i].table_name);
        } else {
            results[i].liked = false;
        }
        results[i].likes = await model.getLikeCount(results[i].table_name);
    }

    return results;
}

// Get count of dataset filter
const getFilteredDatasetsCount = async(knex, query, email) => {
    const model = new datasets(knex);

    const result = await model.getFilteredDatasetsCount(query, email);
    return result;
}

// Get a subset of a table
const getSubset = async(knex, table, query, user = undefined, page = 1, pageLength = 50) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }
    
    const cols = await model.getColumnNames(metadata.table_name);
    const columns = cols.map(x => x.col);
    const dataScan = await dataQueries.subsetSearch(metadata.table_name, query, false, page, pageLength);
    const countScan = await dataQueries.subsetSearch(metadata.table_name, query, true);
    const count = countScan
        .collectSync()
        .getColumn("count")
        .toArray()[0];
    const data = dataScan
        .collectSync()
        .toRecords();

    return {
        columns,
        data,
        count
    }
}

// Download a subset of a dataset
const downloadSubset = async(knex, table, query, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    return await dataQueries.downloadSubset(table, query);
}

// Get dataset records by ids
const getRecordsByIds = async(knex, table, ids, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    const scan = await dataQueries.getRecordsByIds(metadata.table_name, ids);
    const data = scan
        .collectSync()
        .toRecords();

    return data;
}

// Get dataset records by ids
const downloadIds = async(knex, table, name, user = undefined) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (!metadata.is_public && (!user || metadata.email !== user.email)) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    const fileName = `files/zoom/${ name }.json`
    if (util.fileExists(fileName)) {
        const ids = util.readJSON(fileName, false);
        return await dataQueries.downloadRecordsByIds(table, ids);
    } else {
        throw new Error(`Graph zoom file not found: ${ fileName }`);
    }
}

// Get text suggestions from a given user
const getSuggestionsFrom = async(knex, user, params) => {
    const model = new datasets(knex);

    const records = await model.getSuggestionsFrom(user, params.page, params.pageLength, params.sort_col, params.ascending);

    // Return early if total is 0
    if (records.total === 0) {
        return records;
    }

    // Get user names and old text
    const names = {};
    for (let i = 0; i < records.data.length; i++) {
        // Update date formatting
        records.data[i].post_date = records.data[i].post_date.toLocaleDateString();

        // User name
        const email = records.data[i].owner_email;
        let name = names[email]; 
        if (!name) {
            name = await getName(knex, email);
            names[email] = name;
        }
        records.data[i].name = name;
    }

    return records;
}

// Get text suggestions for a given user
const getSuggestionsFor = async(knex, user, params) => {
    const model = new datasets(knex);

    const records = await model.getSuggestionsFor(user, params.page, params.pageLength, params.sort_col, params.ascending);

    // Return early if total is 0
    if (records.total === 0) {
        return records;
    }

    // Get user names and old text
    const names = {};
    for (let i = 0; i < records.data.length; i++) {
        // Update date formatting
        records.data[i].post_date = records.data[i].post_date.toLocaleDateString();
        
        // User name
        const email = records.data[i].email;
        let name = names[email]; 
        if (!name) {
            name = await getName(knex, email);
            names[email] = name;
        }
        records.data[i].name = name;
    }

    return records;
}

// Get a suggestion by its id
const getSuggestion = async(knex, user, id) => {
    const model = new datasets(knex);

    const record = await model.getSuggestion(id);
    
    // Get the current metadata for this table
    const metadata = await model.getMetadata(record.table_name);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== user && record.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Update date formatting
    record.post_date = record.post_date.toLocaleDateString();
        
    // User name
    const email = record.email;
    record.name = await getName(knex, email);

    return record;
}

const getTopWords = async(table_name, search, column, values, page, pageLength) => {
    const lf = await dataQueries.getTopWords(
        table_name, 
        search ? search : "", column, values, 
        page ? page : 1, 
        pageLength ? pageLength : 5
    );
    const df = lf.collectSync();

    return df.getColumn("word").toArray();
}

// Check for temporary columns
const getTempCols = async(knex, table_name) => {
    const model = new datasets(knex);

    const maxAttempts = 5 * 60;
    let attempts = 0;
    while (attempts < maxAttempts) {
        const records = await model.getTempCols(table_name);

        if (records.length > 0) {
            return records.map(x => x.col);
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts += 1;
    }

    throw new Error(`Failed to find temporary columns after ${ maxAttempts } attempts`);
}

// Delete a dataset and its metadata
const deleteDataset = async(knex, user, table) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const metadata = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (metadata.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    // Delete datasets from s3
    await runPython("delete_dataset", [table]);

    // Delete metadata
    // This will delete tags and columns via cascade
    await model.deleteMetadata(table);

    // Delete local files for dataset
    util.deleteDatasetFiles(table);
}

// Delete the given tag for the given dataset
const deleteTag = async(knex, user, table, tag) => {
    const model = new datasets(knex);

    // Get the current metadata for this table
    const curr = await model.getMetadata(table);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user) {
        throw new Error(`User ${ user } is not the owner of this dataset`);
    }

    await model.deleteTag(table, tag);
}

// Unlike a dataset
const deleteLike = async(knex, user, table) => {
    const model = new datasets(knex);

    await model.deleteLike(user, table);
}

// Delete a suggestion by id
const deleteSuggestionById = async(knex, user, id) => {
    const model = new datasets(knex);

    // Get suggestion record to check email
    const record = await model.getSuggestion(id);

    // Get the current metadata for this table
    const curr = await model.getMetadata(record.table_name);

    // If the user of this table does not match the user, throw error
    if (curr.email !== user && record.email !== user) {
        throw new Error(`User ${ user } is not permitted to delete this suggestion`);
    }

    await model.deleteSuggestionById(id);

    // Send reject/cancel email depending on who submitted delete request
    // Don't send email if the same user
    if (curr.email !== record.email) {
        // Send appropriate email
        await emails.suggestionEmail(
            knex, curr.email, record.email, curr.title,
            record.old_text, record.new_text, record.id,
            curr.email === user ? "reject" : "cancel"
        );
    }
}

module.exports = {
    createDataset,
    initializeChunkedUpload,
    uploadChunk,
    finalizeChunkedUpload,
    createDatasetAPI,
    uploadDataset,
    reprocessDataset,
    addTag,
    addSuggestion,
    createBatch,
    uploadBatch,
    updateMetadata,
    incClicks,
    updateText,
    addLike,
    uploadStopwords,
    getMetadata,
    getFullMetadata,
    getSubset,
    downloadSubset,
    getUniqueTags,
    getTags,
    getTextCols,
    getEmbedCols,
    getColumnNames,
    getColumnValues,
    getFilteredDatasets,
    getFilteredDatasetsCount,
    getRecordsByIds,
    downloadIds,
    getSuggestionsFor,
    getSuggestionsFrom,
    getSuggestion,
    getTopWords,
    getTempCols,
    deleteDataset,
    deleteTag,
    deleteLike,
    deleteSuggestionById
};