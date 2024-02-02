const encryption = require("../util/encryption");
const encryptor = new encryption;

const knex = require('knex');
const knex_conn = require("../db/knex");
const databases = require("../models/databases");
const model = new databases(knex_conn);

// Establish a new external database connection
const newConnection = async(name, owner, is_public, host, port, db, username, password, client) => {
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
const loadConnection = async(id) => {
    // Get connection credentials by id
    const creds = await model.getCredentials(id);
    // Decrypt credentials
    creds.host = encryptor.decrypt(creds.host);
    creds.port = creds.port ? encryptor.decrypt(creds.port) : creds.port;
    creds.db = encryptor.decrypt(creds.db);
    creds.username = encryptor.decrypt(creds.username);
    creds.password = creds.password ? encryptor.decrypt(creds.password) : creds.password;

    // Create knex connection with credentials
    return knex({
        development: {
            client: creds.client,
            debug: true,
            connection: {
              host: creds.host,
              user: creds.username,
              password: creds.password,
              database: creds.db,
              options: {
                port: parseInt(creds.port),
                encrypt: true
              },
              requestTimeout: 60000
            },
            pool: {
              min: 0,
              max: 15
            }
        }
    });
}

module.exports = {
    newConnection,
    loadConnection
}