const express = require("express");
const morgan = require("morgan");
const session = require('express-session')
require("dotenv").config();
const { valid_oauth2_request } = require("../lti_lib/oauth2_validation");
const { launchTool } = require("../lti_lib/launch_validation");
const { tokenMaker } = require("../lti_lib/token_generator");
const { grade_project } = require("../tool/grading_tool");
const generate = require('../lti_lib/keyGenerator');
const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  name: 'server-session-cookie-id',
  secret: 'iualcoelknasfnk',
  saveUninitialized: true,
  resave: true,
  // TODO:  use connect-mongo to store session in our MongoDB once it is up and running
  // Right now it is being stored in memory, and should not be used in production this way
  // store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use( (req,res,next) => {
  res.locals.formData = null;
  next();
});

app.set("views", "./views");
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/oauth2/token", (req, res) => {
  var errors = valid_oauth2_request(req);
  tokenMaker(errors, res);
  var keys = generate();
  console.log(keys);
});

app.post("/project/submit", (req, res) => {
  req.session.payload = req.body;
  launchTool(req, res);
});

app.get("/project/submit", (req, res) => {
  res.render("submit", {
    payload: req.session.payload, 
    formData: req.body.formData
  });
});

app.post(`/project/grading`, (req, res) => {
  grade_project(req)
    .then(grading => {
      res.render("submit", {
        payload: req.session.payload, 
        formData: grading
      });
    });
});

module.exports = app;
