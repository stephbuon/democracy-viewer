require('dotenv').config();

module.exports = {
  development: {
    client: "mssql",
    debug: true,
    connection: {
      host: process.env.HOST,
      user: process.env.DATABASE_USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      options: {
        port: parseInt(process.env.PORT),
        encrypt: true
      },
      requestTimeout: 60000
    },
    pool: {
      min: 0,
      max: 15
    }
  }
}