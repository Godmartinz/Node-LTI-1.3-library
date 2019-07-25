const express = require("express");
const morgan = require("morgan");
const session = require('express-session')
const url = require('url');    
require("dotenv").config();
const { valid_oauth2_request } = require("../lti_lib/oauth2_validation");
const { oidc_response } = require("../lti_lib/oidc");
const { launchTool } = require("../lti_lib/launch_validation");
const { tokenMaker } = require("../lti_lib/token_generator");
const { grade_project } = require("../tool/grading_tool");

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

// app.get('/oidc', (req, res) => {
//   req.session.login_request = req.body;
//   req.session.login_response = oidc_response(req);
//   res.send(req.session.login_response);
// });

// app.post('/oidc', (req, res) => {
//   console.log(req.body);
//   req.session.login_request = req.body;
//   req.session.login_response = oidc_response(req);
//   res.send(req.session.login_response);
// });

app.post("/oauth2/token", (req, res) => {
  // console.log(req.body);
  // req.session.login_request = req.body;
  // req.session.login_response = oidc_response(req);
  // res.redirect(url.format({
  //   pathname:'https://www.sandiegocode.school/o/oauth2/v2/auth',
  //   // pathname:'https://www.sandiegocode.school/auth/oidc',
  //   query: req.session.login_response
  // }));
  var errors = valid_oauth2_request(req);
  tokenMaker(errors, res);  
});

app.post("/project/submit", (req, res) => {
  console.log('inside post to /project/submit');
  if (valid_oidc(req)) {
    console.log('IT WORKED!!!!')
    req.session.payload = req.body;
    launchTool(req, res);
  } else {
    res.send('invalid request');
  }
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
