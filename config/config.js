const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  local: {
    username: process.env.LOCAL_DB_USER_NAME,
    password: process.env.LOCAL_DB_PASS,
    database: process.env.LOCAL_DB,
    host: process.env.LOCAL_DB_HOST,
    logging: console.log,
    dialect: "postgres",
  },
  staging: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE,
    host: process.env.DB_HOST,
    logging: console.log,
    dialect: "postgres",
  },
  // staging: {
  //   username : process.env.DB_USER,
  //   password : process.env.DB_PASS,
  //   database :  process.env.DATABASE,
  //   host : process.env.DB_HOST,
  //   logging: false,
  //   dialect: "postgres"
  // },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE,
    host: process.env.DB_HOST,
    logging: false,
    dialect: "postgres",
  },
};
