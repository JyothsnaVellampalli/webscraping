const mongodb = require('mongodb');
var dotenv = require('dotenv');

require('dotenv').config()
const MongoClient = mongodb.MongoClient;
const dbName = 'users';
const dburl = process.env.MONGO_URL;
module.exports = {MongoClient,dburl,mongodb}
