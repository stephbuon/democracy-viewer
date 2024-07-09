const encryption = require("../util/encryption");
const encryptor = new encryption;
const databases = require("../models/databases");
const jwt = require("jsonwebtoken");

// Establish a new external database connection
const newConnection = async(knex, name, owner, params) => {
    const model = new databases(knex);

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
    creds.region = encryptor.decrypt(creds.region);
    creds.dir = creds.dir ? encryptor.decrypt(creds.dir) : creds.dir;
    creds.bucket = encryptor.decrypt(creds.bucket);
    creds.key_ = creds.key_ ? encryptor.decrypt(creds.key_) : creds.key_;
    creds.secret = creds.secret ? encryptor.decrypt(creds.secret) : creds.secret;

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