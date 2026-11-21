const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const uri = process.env.MONGODB_URI;

console.log('Testing connection to MongoDB Atlas...');
console.log('URI target: sadguru.kftglmx.mongodb.net/sadguru_resort');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 8000
})
.then(() => {
  console.log('SUCCESS: Successfully connected to MongoDB Atlas!');
  console.log('Database name:', mongoose.connection.name);
  return mongoose.connection.db.admin().listDatabases();
})
.then((dbs) => {
  console.log('Available databases:', dbs.databases.map(d => d.name).join(', '));
  process.exit(0);
})
.catch((err) => {
  console.error('ERROR connecting to MongoDB Atlas:', err.message);
  process.exit(1);
});
