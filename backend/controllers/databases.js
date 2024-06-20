const encryption = require("../util/encryption");
const encryptor = new encryption;
const databases = require("../models/databases");
const jwt = require("jsonwebtoken");
const config = require("../util/database_config");

// Establish a new external database connection
const newConnection = async(knex, name, owner, params) => {
    const model = new databases(knex);

    // Test new connection and throw error if it fails
    try {
        conn = require("knex")(config.getConfig(client, host, db, username, port, password));
        await conn.raw("SELECT 1");
    } catch(err) {
        console.error(err);
        throw new Error("Failed to connect to new database connection");
    }

   // Encrypt all database fields
   const encryptedParams = {};
   encryptedParams.region = encryptor.encrypt(params.region);
   encryptedParams.bucket = encryptor.encrypt(params.bucket);
   if (params.dir) {
       encryptedParams.dir = encryptor.encrypt(params.dir);
   }
   if (params.key_) {
       encryptedParams.key_ = encryptor.encrypt(params.key_);
   }
   if (params.secret) {
       encryptedParams.secret = encryptor.encrypt(params.secret);
   }

   // Add credentials to db
   return await model.newConnection(name, owner, encryptedParams);
}

// Get database credentials
const getCredentials = async(knex, id) => {
    const model = new databases(knex);

    // Get connection credentials by id
    const creds = await model.getCredentials(id);
    // Decrypt credentials
    creds.host = encryptor.decrypt(creds.host);
    creds.port = creds.port ? encryptor.decrypt(creds.port) : creds.port;
    creds.db = encryptor.decrypt(creds.db);
    creds.username = encryptor.decrypt(creds.username);
    creds.password = creds.password ? encryptor.decrypt(creds.password) : creds.password;

    return creds;
}

// Encode a connection in a JWT token 
const encodeConnection = async(knex, id) => {
    const creds = await getCredentials(knex, id);
    const token = jwt.sign({ ...creds }, process.env.TOKEN_SECRET);
    return token;
}

// Get all connections by user
const getConnectionsByUser = async(knex, username) => {
    const model = new databases(knex);

    const records = await model.getConnectionsByUser(username);
    return records.map(record => {
        return {
            id: record.id,
            name: record.name
        }
    })
}

module.exports = {
    newConnection,
    encodeConnection,
    getConnectionsByUser
}