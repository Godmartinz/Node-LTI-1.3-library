const express = require("express");
const morgan = require("morgan");
const session = require('express-session')
const url = require('url');    
require("dotenv").config();
const { valid_oauth2_request } = require("../lti_lib/oauth2_validation");
const { create_oidc_response, is_valid_oidc_launch } = require("../lti_lib/oidc");
const { launchTool } = require("../lti_lib/launch_validation");
const { tokenMaker } = require("../lti_lib/token_generator");
const { send_score } = require("../lti_lib/student_score");
const { registerPlatform } = require('../lti_lib/register_platform');
const mongoose = require('mongoose');
const Database = require('../lti_lib/mongoDB/Database.js');
const { platformSchema } = require('../lti_lib/register_platform');
const { grade_project } = require("../tool/grading_tool");

const app = express();

app.use(morgan("dev"));

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use('/favicon.ico', express.static('./favicon.ico'));

app.use(session({
  name: 'lti_13_library',
  secret: 'iualcoelknasfnk',
  saveUninitialized: true,
  resave: true,
  // secure: true,
  // ephemeral: true,
  // httpOnly: true,
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

mongoose.connect('mongodb://localhost:27017/TESTLTI', {
  useNewUrlParser: true},
  (err) => {
    if(err) {
      return console.log(err);
    }
  }
);
mongoose.Promise = Promise;

registerPlatform(
  'https://www.sandiegocode.school',
  'SanDiegocode.school',
  'uuYLGWBmhhuZvBf',
  'https://www.sandiegocode.school/mod/lti/auth.php',
  'https://www.sandiegocode.school/mod/lti/token.php', 
  { method: 'JWK_SET', key: 'https://www.sandiegocode.school/mod/lti/certs.php' }
);

registerPlatform(
  'https://demo.moodle.net',
  'Moodles demo',
  'BMe642xnf4ag3Pd',
  'https://demo.moodle.net/mod/lti/auth.php',
  'https://demo.moodle.net/mod/lti/token.php', 
  { method: 'JWK_SET', key: 'https://demo.moodle.net/mod/lti/certs.php' }
);

app.get("/", (req, res) => {
  res.render("index");
});

app.get('/oidc', (req, res) => {
  console.log('only POSTs to /oidc are implemented at this time')
});

app.post('/oidc', (req, res) => {
  //Save the OIDC Login Request to reference later during current session
  req.session.login_request = req.body;

  Database.Get('platforms', platformSchema, { consumerUrl: req.session.login_request.iss })
  .then(dbResult => {
    if (dbResult.length === 1) return dbResult[0]
    else res.send(['Issuer invalid: not registered']);
  }).then(platform => {
    //Save the Platform information from the database to reference later during current session
    req.session.platform_DBinfo = platform;

    //Save the OIDC Login Response to reference later during current session
    req.session.login_response = create_oidc_response(req);

    if (Array.isArray(req.session.login_response)) {   
      //errors were found, so return the errors
      res.send(req.session.login_response);
    } else {
      //no errors, send the OIDC Login Response
      res.redirect(url.format({
        pathname: platform.consumerAuthorizationURL, 
        query: req.session.login_response
      }));
    }
  });
});

app.post("/oauth2/token", (req, res) => {
  //Route not currently being used
  var errors = valid_oauth2_request(req);
  tokenMaker(errors, res);
});

app.post("/project/submit", (req, res) => {
  //Ensure Validity of OIDC Launch Request before launching Tool
  if (is_valid_oidc_launch(req)) {
    //Save OIDC Launch Request for later reference during current session
    req.session.payload = req.body;
    launchTool(req, res, '/project/submit');
  } else {
    res.send('invalid request');
  }
});

app.get("/project/submit", (req, res) => {
  //Display the Project Submission page
  res.render("submit", {
    payload: req.session.payload, 
    formData: req.body.formData
  });
});

app.post(`/project/grading`, (req, res) => {
  //Grade the project and if there aren't errors with the grading, send the score.  Re-render Grading page.
  grade_project(req)
    .then(grading => {
      if (!grading.error) {
        send_score(grading.grade, req.session.decoded_launch)
      }
      res.render("submit", {
        payload: req.session.payload, 
        formData: grading
      });
    });
});

app.post('/project/return', (req, res) => {
  //When user is done with Tool, return to LMS 
  res.redirect(req.session.decoded_launch["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url);
  req.session.destroy();
});

app.get('/demo/oidc', (req, res) => {
  //Sends an OIDC Login Response for demo purposes
  req.body = { 
    iss: 'https://www.sandiegocode.school',
    target_link_uri: 'https://piedpiper.localtunnel.me/project/submit',
    login_hint: '9',
    lti_message_hint: '377' 
  };
  req.session.platform_DBinfo = {'consumerToolClientID': 'SDF7ASDLSFDS9'};
  res.send(create_oidc_response(req));
})

app.get('/demo/project/submit', (req, res) => {
  //Launches the Grading Tool for demo purposes
  let request_object = {
    'sub': 'a6d5c443-1f51-4783-ba1a-7686ffe3b54a',
    'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    given_name: 'Joe',
    family_name: 'Schmoo',
    name: 'Joe Schmoo',    
    'client_id': 'uuYLGWBmhhuZvBf',
    'redirect_uri': 'redirect uri',
    'response_type': 'response type',
    'scope': 'scope',
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '07940580-b309-415e-a37c-914d387c1150',
    'https://purl.imsglobal.org/spec/lti/claim/roles': 
    [ 'http://purl.imsglobal.org/vocab/lis/v2/institution/person#Student',
    'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner',
    'http://purl.imsglobal.org/vocab/lis/v2/membership#Mentor' ],
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform': {
      'url': "https://platform.example.edu",
    },    
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': 
    { id: '200d101f-2c14-434a-a0f3-57c2a42369fd',
    description: 'Assignment to introduce who you are',
    title: 'Introduction Assignment' },
    'https://purl.imsglobal.org/spec/lti/claim/context': {
      id: 'random-id-with-cha.dfokasdf',
      label: 'react100',
      title: 'React for Beginners',
      type: [ 'http://purl.imsglobal.org/vocab/lis/v2/course#CourseOffering' ]
    },
    "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint": {
      scope: ["https://purl.imsglobal.org/spec/lti-ags/scope/score"],
      "lineitems": "https://www.myuniv.example.com/2344/lineitems/",
      "lineitem": "https://www.myuniv.example.com/2344/lineitems/1234/lineitem"
    }
  };  
  res.render("submit", {
    payload: request_object, 
    formData: null
  });
})

module.exports = app;
