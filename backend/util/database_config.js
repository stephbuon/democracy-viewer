require("dotenv").config();

const defaultConfig = () => {
    return mssql(
        process.env.HOST, process.env.DATABASE, process.env.DATABASE_USERNAME,
        process.env.PORT, process.env.PASSWORD
    );
}

const getConfig = (client, host, db, username, port = undefined, password = undefined) => {
    if (client === "mssql") {
        return mssql(host, db, username, port, password);
    } else if (client === "mysql") {
        return mysql(host, db, username, port, password);
    } else {
        throw new Error(`Unknown client: ${ client }`);
    }
}

const mssql = (host, database, username, port = undefined, password = undefined) => {
    return {
        client: "mssql",
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

const mysql = (host, database, username, port = undefined, password = undefined) => {
    return {
        client: "mysql",
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
    }
}

module.exports = {
    defaultConfig,
    getConfig
}