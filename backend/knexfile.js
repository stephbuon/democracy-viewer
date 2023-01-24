require('dotenv').config();
module.exports = {
  development: {
    client: "mysql",
    debug: true,
    connection: {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASS,
      ssl: true,
      database: process.env.MYSQL_DB,
      socketPath: "/tmp/mysql.sock"
    },
    pool: {
      min: 0,
      max: 15
    }
    // seeds: {
    //   directory: './seeds'
    // },
    // migrations: {
    //   directory: './migrations'
    // }
  }
}