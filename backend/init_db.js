const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('Starting database initialization...');
  
  // Connection configuration without DB specified (to allow drop/create)
  const connectionConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('Connected to MySQL server successfully.');

    // Query data directory path
    const [rows] = await connection.query("SHOW VARIABLES LIKE 'datadir'");
    const datadir = rows[0] ? rows[0].Value : 'unknown';
    console.log('MySQL Data Directory:', datadir);

    const dbName = process.env.DB_NAME || 'web_dulich';
    
    // Drop database if exists
    console.log(`Dropping database if exists: ${dbName}...`);
    try {
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
      console.log(`Database ${dbName} dropped.`);
    } catch (dropDbError) {
      console.warn(`Failed to drop database: ${dropDbError.message}. Trying to clean tables instead...`);
      
      // Try to connect directly to the database and drop tables
      let tempConn;
      try {
        tempConn = await mysql.createConnection({ ...connectionConfig, database: dbName });
        const tables = ['payments', 'reviews', 'itineraries', 'bookings', 'flights', 'hotels', 'tours', 'users'];
        
        console.log('Disabling foreign key checks...');
        await tempConn.query('SET FOREIGN_KEY_CHECKS = 0');
        
        for (const table of tables) {
          try {
            console.log(`Dropping table ${table}...`);
            await tempConn.query(`DROP TABLE IF EXISTS \`${table}\``);
          } catch (tblErr) {
            console.error(`Error dropping table ${table}:`, tblErr.message);
          }
        }
        
        console.log('Enabling foreign key checks...');
        await tempConn.query('SET FOREIGN_KEY_CHECKS = 1');
      } catch (connErr) {
        console.error('Could not connect to database directly to drop tables:', connErr.message);
      } finally {
        if (tempConn) await tempConn.end();
      }

      // If we know the datadir, let's look at what files are in that directory
      if (datadir && datadir !== 'unknown') {
        const dbDirPath = path.join(datadir, dbName);
        console.log(`Checking DB folder on disk: ${dbDirPath}`);
        if (fs.existsSync(dbDirPath)) {
          try {
            const files = fs.readdirSync(dbDirPath);
            console.log(`Files inside database directory (${dbDirPath}):`, files);
            
            // Delete non-FRM, non-IBD files if any, or delete all if we want to force recreate
            // (Only delete if safe, or print list of files so we can decide)
            for (const file of files) {
              const filePath = path.join(dbDirPath, file);
              if (file.endsWith('.frm') || file.endsWith('.ibd') || file.endsWith('.opt')) {
                console.log(`Deleting file: ${filePath}`);
                try {
                  fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                  console.error(`Failed to delete file ${file}:`, unlinkErr.message);
                }
              } else {
                console.log(`Non-MySQL standard file found: ${file}. Trying to delete...`);
                try {
                  fs.unlinkSync(filePath);
                } catch (unlinkErr) {
                  console.error(`Failed to delete non-standard file ${file}:`, unlinkErr.message);
                }
              }
            }
            
            // Try dropping the database again
            console.log(`Retrying DROP DATABASE IF EXISTS \`${dbName}\`...`);
            await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
            console.log(`Database ${dbName} dropped successfully on second attempt.`);
          } catch (fsErr) {
            console.error('Error cleaning database folder on disk:', fsErr.message);
          }
        }
      }
    }

    // Create database if not exists (in case it was dropped, or if we kept it but emptied it)
    console.log(`Creating database: ${dbName} (if not exists)...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database ${dbName} ready.`);
    
    await connection.end();

    // Reconnect to the database to run the SQL dump with multipleStatements enabled
    console.log(`Connecting to database ${dbName} to import schema and seed data...`);
    connection = await mysql.createConnection({
      ...connectionConfig,
      database: dbName,
      multipleStatements: true
    });

    const sqlFilePath = path.join(__dirname, '..', 'database', 'web_dulich.sql');
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at path: ${sqlFilePath}`);
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('Executing SQL script...');
    await connection.query(sqlContent);
    console.log('Database initialized successfully with schema and seed data!');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    if (connection) {
      try {
        await connection.end();
        console.log('Database connection closed.');
      } catch (err) {
        // Ignore
      }
    }
  }
}

initDatabase();
