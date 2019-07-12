const express = require("express");
const morgan = require("morgan");

const app = express();

app.use(morgan("dev"));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.status(200).send('Turn around ...');
});

module.exports = app;
