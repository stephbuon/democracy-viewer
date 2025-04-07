const express = require('express');
const router = express.Router();
const control = require("../controllers/datasets");
const { authenticateJWT } = require("../middleware/authentication");
const util = require("../util/file_management");

// Route to create a dataset
router.post('/', authenticateJWT, async(req, res, next) => {
    try {
        // Create dataset in database from file
        const result = await control.createDataset(req.user.email);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to create a dataset via an api
router.post('/api', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.createDatasetAPI(req.body.endpoint, req.user.email, req.body.token);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to create dataset via API:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to upload dataset records into database
router.post('/upload', authenticateJWT, async(req, res, next) => {
    try {
        await control.uploadDataset(req.knex, req.body.table_name, req.body.metadata, req.body.text, req.body.embed, req.body.tags, req.user);
        res.status(201).end();
    } catch (err) {
        console.error('Failed to upload dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to add a tag for a dataset
router.post('/tags', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.addTag(req.knex, req.user.email, req.body.dataset, req.body.tags);
        res.status(201).json(result);
    } catch (err) {
        console.error('Failed to add dataset tag:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to like a dataset
router.post('/like/:table', authenticateJWT, async(req, res, next) => {
    try {
        await control.addLike(req.knex, req.user.email, req.params.table);
        res.status(201).end();
    } catch (err) {
        console.error('Failed to add dataset text column(s):', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to create a text suggestions
router.post('/suggest', authenticateJWT, async(req, res, next) => {
    try {
        await control.addSuggestion(req.knex, req.user.email, req.body)
        res.status(201).end();
    } catch (err) {
        console.error('Failed to create text suggestion:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to upload a stopwords list
router.post('/upload/stopwords/:table', authenticateJWT, async(req, res, next) => {
    try {
        // Upload file to server
        await util.uploadFile(req, res);

        if (!req.file) {
            // If file failed to upload, throw error
            res.status(400).json({ message: "No uploaded file" });
        } else {
            // Create dataset in database from file
            await control.uploadStopwords(req.file.path, req.params.table, req.user.email);
            res.status(201).end();
        }
    } catch (err) {
        console.error('Failed to upload stopwords:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to reprocess a dataset
router.put('/reprocess/:table', authenticateJWT, async(req, res, next) => {
    try {
        await control.reprocessDataset(req.knex, req.params.table, req.user.email);
        res.status(200).end();
    } catch (err) {
        console.error('Failed to reprocess dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to change dataset metadata
router.put('/metadata/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.updateMetadata(req.knex, req.user.email, req.params.table, req.body);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to update dataset metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to increment a dataset's clicks
router.put('/click/:table', async(req, res, next) => {
    try {
        const result = await control.incClicks(req.knex, req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to click on dataset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to update text
router.put('/suggest/:id', authenticateJWT, async(req, res, next) => {
    try {
        await control.updateText(req.knex, req.params.id, req.user.email);
        res.status(200).end();
    } catch (err) {
        console.error('Failed to update dataset text:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get dataset metadata
router.get('/metadata/:table', async(req, res, next) => {
    try {
        const result = await control.getMetadata(req.knex, req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get full dataset metadata
router.get('/metadata/full/:table', async(req, res, next) => {
    try {
        const result = await control.getFullMetadata(req.knex, req.params.table, req.user ? req.user.email : undefined);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get full dataset metadata:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get all unique tags
router.get('/tags/unique', async(req, res, next) => {
    try {
        const results = await control.getUniqueTags(req.knex, req.query);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get unique tags:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get all tags for a dataset
router.get('/tags/dataset/:table', async(req, res, next) => {
    try {
        const results = await control.getTags(req.knex, req.params.table);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get dataset tags:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get text columns for a dataset
router.get('/text/:table', async(req, res, next) => {
    try {
        const results = await control.getTextCols(req.knex, req.params.table);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get dataset text columns:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get embedding columns for a dataset
router.get('/embeddings/:table', async(req, res, next) => {
    try {
        const results = await control.getEmbedCols(req.knex, req.params.table);
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get dataset embedding columns:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to filter datasets
router.get('/filter/:page', async(req, res, next) => {
    try {
        let results;
        if (req.user) {
            results = await control.getFilteredDatasets(req.knex, req.query, req.user.email, req.params.page);
        } else {
            results = await control.getFilteredDatasets(req.knex, req.query, undefined, req.params.page);
        }
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get filtered datasets:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get number of dataset filter results
router.get('/count/filter', async(req, res, next) => {
    try {
        let result;
        if (req.user) {
            result = await control.getFilteredDatasetsCount(req.knex, req.query, req.user.email);
        } else {
            result = await control.getFilteredDatasetsCount(req.knex, req.query, undefined);
        }
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get filtered datasets count:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to subset a dataset
router.get('/subset/:table/:page/:pageLength', async(req, res, next) => {
    try {
        const results = await control.getSubset(req.knex, req.params.table, req.query, req.user, Number(req.params.page), Number(req.params.pageLength));
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get dataset subset:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get the top words matching a search
router.get('/words/top/:table_name', async(req, res, next) => {
    try {
        const results = await control.getTopWords(
            req.params.table_name, req.query.search,
            req.query.column, req.query.values,
            req.query.page, req.query.pageLength
        );
        res.status(200).json(results);
    } catch (err) {
        console.error('Failed to get top words:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to download a subset of a dataset
router.post('/download/subset/:table', async(req, res, next) => {
    try {
        // Generate file
        const url = await control.downloadSubset(req.knex, req.params.table, req.body, req.user);
        // Download file
        res.status(200).json({ url });
    } catch (err) {
        console.error('Failed to download dataset subset:', err);
        res.status(500).json({ message: err.toString() });
        next();
    }
});

// Route to get dataset records by ids
router.get('/ids/:table', async(req, res, next) => {
    try {
        const result = await control.getRecordsByIds(req.knex, req.params.table, Array.isArray(req.query.id) ? req.query.id : [ req.query.id ], req.user);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset ids:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to download a subset of a dataset by ids
router.post('/download/ids/:table', async(req, res, next) => {
    try {
        // Generate file
        const url = await control.downloadIds(req.knex, req.params.table, Array.isArray(req.body.id) ? req.body.id : [ req.body.id ], req.user);
        // Download file
        res.status(200).json({ url });
    } catch (err) {
        console.error('Failed to download dataset ids:', err);
        res.status(500).json({ message: err.toString() });
        next();
    }
});

// Route to get dataset column names
router.get('/columns/:table', async(req, res, next) => {
    try {
        const result = await control.getColumnNames(req.knex, req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset column names:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get dataset temporary column names
router.get('/columns/:table/temp', async(req, res, next) => {
    try {
        const result = await control.getTempCols(req.knex, req.params.table);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset temporary column names:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get dataset column names
router.get('/columns/:table/values/:column', async(req, res, next) => {
    try {
        let result;
        if (req.query.page) {
            result = await control.getColumnValues(req.knex, req.params.table, req.params.column, req.query.search, req.query.page);
        } else {
            result = await control.getColumnValues(req.knex, req.params.table, req.params.column, req.query.search);
        }
        
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get dataset column names:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get suggestions (from)
router.get('/suggest/from', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getSuggestionsFrom(req.knex, req.user.email, req.query);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get suggestions from:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get suggestions (for)
router.get('/suggest/for', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getSuggestionsFor(req.knex, req.user.email, req.query);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get suggestions for:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to get a suggestion by id
router.get('/suggest/id/:id', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.getSuggestion(req.knex, req.user.email, req.params.id);
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to get suggestions for:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a datset and its metadata
router.delete('/:table', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.deleteDataset(req.knex, req.user.email, req.params.table);
        res.status(204).json(result);
    } catch (err) {
        console.error('Failed to get dataset records:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete the given tag on the given dataset
router.delete('/:table/tags/:tag', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.deleteTag(req.knex, req.user.email, req.params.table, req.params.tag);
        res.status(204).json(result);
    } catch (err) {
        console.error('Failed to delete tag:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a text col for a dataset
router.delete('/:table/text/:col', authenticateJWT, async(req, res, next) => {
    try {
        const result = await control.deleteTextCol(req.knex, req.user.email, req.params.table, req.params.col);
        res.status(204).json(result);
    } catch (err) {
        console.error('Failed to delete text column:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a user's like
router.delete('/like/:table', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteLike(req.knex, req.user.email, req.params.table);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete like:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

// Route to delete a suggestion
router.delete('/suggest/:id', authenticateJWT, async(req, res, next) => {
    try {
        await control.deleteSuggestionById(req.knex, req.user.email, req.params.id);
        res.status(204).end();
    } catch (err) {
        console.error('Failed to delete suggestion:', err);
        res.status(500).json({ message: err.toString() });
    }
    next();
});

module.exports = router;