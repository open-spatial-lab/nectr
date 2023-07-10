const duckdb = require("duckdb");

const db = new duckdb.Database(":memory:", {
  allow_unsigned_extensions: 'true'
});
const connection = db.connect();

const main = async () => {
  await connection.all(`
    INSTALL '/extensions/httpfs.duckdb_extension'; 
    LOAD '/extensions/httpfs.duckdb_extension';
    INSTALL '/extensions/spatial.duckdb_extension';
    LOAD '/extensions/spatial.duckdb_extension';
  `);

  connection.all(`call pragma_version();`, (err, res) => {
    console.log(res);
    console.log("Installed extensions");
    process.exit(0);
  })
};

main();
