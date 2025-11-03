"use strict";

var express = require("express");
var cors = require("cors");
var cookieParser = require("cookie-parser");
var app = express();
var port = 3000;

app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
