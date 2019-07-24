const express = require("express");
const morgan = require("morgan");
require("dotenv").config();
const { valid_oauth2_request } = require("../lti_lib/oauth2_validation");
const { keyValidator, targetRedirect } = require("../lti_lib/launch_validation");
const { tokenMaker } = require("../lti_lib/token_generator");
const { grade_project } = require("../tool/grading_tool");

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
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
  
});

app.post("/project/submit/:project", (req, res) => {
  keyValidator(req, res);
});

app.get("/project/submit/:projectname", (req, res) => {
  res.render("submit", {
    projectName: req.params.projectname,
    formData: req.body.formData
  });
});

app.post(`/:module/grading/:projectname`, (req, res) => {
  grade_project(req).then(grading => {
    res.render("submit", {
      projectName: req.params.projectname,
      formData: grading
    });
  });
});

module.exports = app;
