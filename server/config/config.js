const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const db = process.env.MONGODB_NAME;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri);

async function connect() {
  try {
    client.db(db);
  } catch (error) {
    await client.close();
  }
}

async function getDB() {
  return client.db(db);
}

module.exports = { connect, getDB };
