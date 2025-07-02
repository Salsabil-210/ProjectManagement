const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
  };
  
  const client = new Client(dbConfig);
  
  client
    .connect()
    .then(() => {
      console.log("Connected to PostgreSQL database");
  
    })