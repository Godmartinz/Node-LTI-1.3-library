const express = require("express");
const morgan = require("morgan");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
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

app.use( (req,res,next) => {
  res.locals.formData = null;
  next();
});

app.set("views", "./views");
app.set("view engine", "ejs");


mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true, 
  auth: {
    user: process.env.MONGO_USER,
    password: process.env.MONGO_PASSWORD
  },
  useNewUrlParser: true},

  (err) => {
    if(err) {
      return console.log(err);
    }

// registerPlatform(
//   'https://www.sandiegocode.school',
//   'SanDiegocode.school',
//   'uuYLGWBmhhuZvBf',
//   'https://www.sandiegocode.school/mod/lti/auth.php',
//   'https://www.sandiegocode.school/mod/lti/token.php',
//   'https://www.sandiegocode.school/project/submit',
//   { method: 'JWK_SET', key: 'https://www.sandiegocode.school/mod/lti/certs.php' }
// );

registerPlatform(
  'https://demo.moodle.net',
  'Moodles demo',
  'BMe642xnf4ag3Pd',
  'https://demo.moodle.net/mod/lti/auth.php',
  'https://demo.moodle.net/mod/lti/token.php',
  'https://demo.moodle.net/<tool launch url>',
  { method: 'JWK_SET', key: 'https://demo.moodle.net/mod/lti/certs.php' }
);

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", (req, res) => {
  console.log(req.body);
});


app.get('/oidc', (req, res) => {
  console.log('only POSTs to /oidc are implemented at this time')
});

app.post('/oidc', (req, res) => {
  //Save the OIDC Login Request to reference later during current session
  req.session.login_request = req.body;

  Database.Get('platforms', platformSchema, { consumerUrl: req.session.login_request.iss })
  .then(dbResult => {
console.log(dbResult); // take out
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
    iss: 'https://demo.moodle.net',
    target_link_uri: 'https://node-lti-v1p3.herokuapp.com/',
    login_hint: '9',
    lti_message_hint: '377' 
  };
  req.session.platform_DBinfo = {'consumerToolClientID': 'SDF7ASDLSFDS9'};
  res.send(create_oidc_response(req));
})

app.get('/demo/project/submit', (req, res) => {
  //Launches the Grading Tool for demo purposes
  let request_object = { nonce: 'g2f2cdPpYqPK7AwHcyXhjf5VL',
    iat: 1564506231,
    exp: 1564506291,
    iss: 'https://demo.moodle.net',
    aud: 'uuYLGWBmhhuZvBf',
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '2',
    'https://purl.imsglobal.org/spec/lti/claim/target_link_uri': 'https://node-lti-v1p3.herokuapp.com//',
    sub: '9',
    'https://purl.imsglobal.org/spec/lti/claim/roles':
     [ 'http://purl.imsglobal.org/vocab/lis/v2/membership#Learner' ],
    'https://purl.imsglobal.org/spec/lti/claim/context':
     { id: '47',
       label: 'AGILE200',
       title: 'Internship',
       type: [ 'CourseSection' ] },
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': { title: 'Test LTI for Team Pied Piper', id: '4' },
    given_name: 'John',
    family_name: 'Smith',
    name: 'John Smith',
    'https://purl.imsglobal.org/spec/lti/claim/ext':
     { user_username: 'john.smith@gmail.com', lms: 'moodle-2' },
    email: 'john.smith@gmail.com',
    'https://purl.imsglobal.org/spec/lti/claim/launch_presentation':
     { locale: 'en',
       document_target: 'window',
       return_url:
        'https://www.sandiegocode.school/mod/lti/return.php?course=47&launch_container=4&instanceid=4&sesskey=xcsU4krTwV' },
    'https://purl.imsglobal.org/spec/lti/claim/tool_platform':
     { family_code: 'moodle',
       version: '2019052000.01',
       guid: 'demo.moodle.net',
       name: 'Moodle Demo',
       description: 'Moodle Demo Sandbox' },
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
    'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint':
     { scope:
        [ 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly',
          'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
          'https://purl.imsglobal.org/spec/lti-ags/scope/score' ],
       lineitems:
        'https://www.sandiegocode.school/mod/lti/services.php/47/lineitems?type_id=2',
       lineitem:
        'https://www.sandiegocode.school/mod/lti/services.php/47/lineitems/109/lineitem?type_id=2' },
    'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice':
     { context_memberships_url:
        'https://www.sandiegocode.school/mod/lti/services.php/CourseSection/47/bindings/2/memberships',
       service_versions: [ '1.0', '2.0' ] }
  };  
  res.render("submit", {
    payload: request_object, 
    formData: null
  });
})

module.exports = app;
