const mysql = require("");

const pool = mysql.createPool({
  host: "localhost",
  usre: "root",
  database: "node-complete",
  password: "nodecomplete",
});

module.exports = pool.promise();