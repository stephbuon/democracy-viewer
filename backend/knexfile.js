require('dotenv').config();

module.exports = {
  development: {
    client: "mssql",
    debug: true,
    connection: {
      host: process.env.HOST,
      user: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      options: {
        port: parseInt(process.env.PORT),
        encrypt: true
      }
    },
    pool: {
      min: 0,
      max: 15
    }
  }
}