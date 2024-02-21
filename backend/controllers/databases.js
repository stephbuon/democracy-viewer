const encryption = require("../util/encryption");
const encryptor = new encryption;
const databases = require("../models/databases");
const jwt = require("jsonwebtoken");
const config = require("../util/database_config");

// Establish a new external database connection
const newConnection = async(knex, name, owner, is_public, host, port, db, username, password, client) => {
    const model = new databases(knex);

    // Test new connection and throw error if it fails
    try {
      if (client === "mssql") {
          conn = require("knex")(config.mssql(host, db, username, port, password));
      } else if (client === "mysql") {
          conn = require("knex")(config.mysql(host, db, username, port, password));
      } else {
          throw new Error(`Unknown client: ${ client }`);
      }
      await conn.raw("SELECT 1");
    } catch(err) {
      throw new Error("Failed to connect to new database connection");
    }

    // Encrypt all database fields
    host = encryptor.encrypt(host);
    port = port ? encryptor.encrypt(String(port)) : port;
    db = encryptor.encrypt(db);
    username = encryptor.encrypt(username);
    password = password ? encryptor.encrypt(password) : password;

    // Add credentials to db
    return await model.newConnection(name, owner, is_public, host, port, db, username, password, client);
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

// Load an external database connection
const loadConnection = async(knex, id) => {
    const creds = await getCredentials(knex, id);

    // Return config based on client
    if (creds["client"] === "mssql") {
        return config.mssql(creds["host"], creds["db"], creds["username"], creds["port"], creds["password"]);
    } else if (creds["client"] === "mysql") {
        return config.mysql(creds["host"], creds["db"], creds["username"], creds["port"], creds["password"]);
    } else {
        throw new Error(`Unknown client: ${ creds["client"] }`);
    }
}

// Encode a connection in a JWT token 
const encodeConnection = async(knex, id) => {
    const accessTokenSecret = process.env.TOKEN_SECRET;
    const creds = await getCredentials(knex, id);
    const token = jwt.sign({ ...creds }, accessTokenSecret);
    return token;
}

module.exports = {
    newConnection,
    loadConnection,
    encodeConnection
}