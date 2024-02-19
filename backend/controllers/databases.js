const encryption = require("../util/encryption");
const encryptor = new encryption;
const databases = require("../models/databases");

// Establish a new external database connection
const newConnection = async(knex, name, owner, is_public, host, port, db, username, password, client) => {
    const model = new databases(knex);

    // Test new connection and throw error if it fails
    try {
      conn = require("knex")({
        client: client,
            debug: true,
            connection: {
              host: host,
              user: username,
              password: password,
              database: db,
              port: port,
              requestTimeout: 60000
            },
            pool: {
              min: 0,
              max: 15
            }
      });
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

// Load an external database connection
const loadConnection = async(knex, id) => {
    const model = new databases(knex);

    // Get connection credentials by id
    const creds = await model.getCredentials(id);
    console.log(creds)
    // Decrypt credentials
    creds.host = encryptor.decrypt(creds.host);
    creds.port = creds.port ? encryptor.decrypt(creds.port) : creds.port;
    creds.db = encryptor.decrypt(creds.db);
    creds.username = encryptor.decrypt(creds.username);
    creds.password = creds.password ? encryptor.decrypt(creds.password) : creds.password;

    // Create knex connection with credentials and test
    return {
      client: creds.client,
      debug: true,
      connection: {
        host: creds.host,
        user: creds.username,
        password: creds.password,
        database: creds.db,
        port: creds.port,
        requestTimeout: 60000
      },
      pool: {
        min: 0,
        max: 15
      }
    };
}

module.exports = {
    newConnection,
    loadConnection
}