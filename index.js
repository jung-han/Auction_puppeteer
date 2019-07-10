const express = require('express');
const readline = require('readline');
const crawler = require('./crawler');
const app = express();

const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const server = app.listen(process.env.PORT || 3000);

r.question('whatsup ID: ', (id) => {
  r.question('whatsup password: ', (password) => {
    crawler.crawler(id, password,);
    r.close();
    server.close();
  });
});
