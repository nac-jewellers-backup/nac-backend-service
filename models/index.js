"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "staging";
const config = require(__dirname + "/../config/config");
const db = {};
console.log("env variable1");
console.log(env);
// let sequelize;
// if (config.use_env_variable) {
//   sequelize = new Sequelize(process.env[config.use_env_variable], config);
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }
var sequelize_logging = new Function();

let sequelize;
if (env === "production") {
  console.log(env);
  sequelize = new Sequelize(
    config.production.database,
    config.production.username,
    config.production.password,
    config.production,
    {
      host: config.production.host,
      logging: sequelize_logging(),
      dialect: config.production.dialect,
    }
  );
} else if (env === "staging") {
  console.log("i am " + env);
  sequelize = new Sequelize(
    config.staging.database,
    config.staging.username,
    config.staging.password,
    config.staging,
    {
      host: config.staging.host,
      logging: console.log,
      dialect: config.staging.dialect,
    }
  );
} else if (env === "local") {
  console.log("dsadasd" + config.local.database);

  sequelize = new Sequelize(
    config.local.database,
    config.local.username,
    config.local.password,
    config.local,
    {
      host: config.local.host,
      logging: false,
      dialect: config.local.dialect,
    }
  );
} else {
  // sequelize = new Sequelize(config.staging.database, config.staging.username, config.staging.password,
  //   {
  //     host:config.staging.host,
  //     dialect:config.staging.dialect
  //   });

  sequelize = new Sequelize(
    config.local.database,
    config.local.username,
    config.local.password,
    config.local,
    {
      host: config.local.host,
      logging: false,

      dialect: config.local.dialect,
    }
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
