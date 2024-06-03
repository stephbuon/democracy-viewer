require("dotenv").config();

const defaultConfig = () => {
    return getConfig(
        "mssql", process.env.HOST, process.env.DATABASE, 
        process.env.DATABASE_USERNAME, process.env.PORT, 
        process.env.PASSWORD
    );
}

const getConfig = (client, host, db, username, port = undefined, password = undefined) => {
    if (client === "mssql") {
        return mssql(client, host, db, username, port, password);
    } else if (client === "mysql" || client === "pg") {
        return mysql(client, host, db, username, port, password);
    } else {
        throw new Error(`Unknown client: ${ client }`);
    }
}

const mssql = (client, host, database, username, port = undefined, password = undefined) => {
    return {
        client: client,
        debug: true,
        connection: {
            host: host,
            user: username,
            password: password,
            database: database,
            options: {
            port: port ? parseInt(process.env.PORT) : port,
            encrypt: true
            },
            requestTimeout: 60000
        },
        pool: {
            min: 0,
            max: 15
        }
    };
}

const mysql = (client, host, database, username, port = undefined, password = undefined) => {
    return {
        client: client,
        debug: true,
        connection: {
            host: host,
            user: username,
            password: password,
            database: database,
            port: port,
            requestTimeout: 60000
        },
        pool: {
            min: 0,
            max: 15
        }
    };
}

module.exports = {
    defaultConfig,
    getConfig
}