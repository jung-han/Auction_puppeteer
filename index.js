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
    r.question('찾고 싶은 단어가 있나요? 없으면 엔터: ', (query) => {
      crawler.crawler(id, password, query);
      r.close();
      server.close();
    });
  });
});
