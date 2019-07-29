const express = require("express");
const morgan = require("morgan");
const session = require('express-session')
const url = require('url');    
require("dotenv").config();
const { valid_oauth2_request } = require("../lti_lib/oauth2_validation");
const { create_oidc_response, is_valid_oidc_launch } = require("../lti_lib/oidc");
const { launchTool } = require("../lti_lib/launch_validation");
const { tokenMaker } = require("../lti_lib/token_generator");
const { grade_project } = require("../tool/grading_tool");
const { registerPlatform } = require('../lti_lib/register_platform');
const mongoose = require('mongoose');
const { send_score } = require("../lti_lib/student_score");

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
  // httpOnly: true
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
    'https://www.sandiegocode.school/',
    'SanDiegocode.school',
    'uuYLGWBmhhuZvBf',
    'https://www.sandiegocode.school/mod/lti/auth.php',
    'https://www.sandiegocode.school/mod/lti/token.php', 
    { method: 'JWK_SET', key: 'https://www.sandiegocode.school/mod/lti/certs.php' }
  );
  
app.get("/", (req, res) => {
  console.log('/ with get');
  res.render("index");
});

app.post('/', (req, res) => {
  console.log('/ with post');
});

app.get('/oidc', (req, res) => {
  req.session.login_request = req.body;
  req.session.login_response = create_oidc_response(req);
  console.log('/oidc GET, session id is: ', req.session.id);
    // let platform = await Database.Get('platforms', platformSchema, { consumerUrl: req.body.iss });
  res.redirect(url.format({
    pathname: req.session.login_request.iss + '/mod/lti/auth.php',  // TODO:  Pull from DB (platform.consumerAuthorizationURL) after registration data is stored
    query: req.session.login_response
   }));
 });

app.post('/oidc', (req, res) => {
  req.session.login_request = req.body;
  req.session.login_response = create_oidc_response(req);
  console.log('/oidc POST, session id is: ', req.session.id);
    // let platform = await Database.Get('platforms', platformSchema, { consumerUrl: req.session.login_request.iss });
    res.redirect(url.format({
      pathname: req.session.login_request.iss + '/mod/lti/auth.php',  // TODO:  Pull from DB (platform.consumerAuthorizationURL) after registration data is stored
      // pathname: 'https://demo.moodle.net/mod/lti/auth.php',
    query: req.session.login_response
  }));
});

app.post("/oauth2/token", (req, res) => {
  console.log('oauth2/token');
  var errors = valid_oauth2_request(req);
  tokenMaker(errors, res);
});

app.post("/project/submit", (req, res) => {
  console.log('post for project/submit');
  if (is_valid_oidc_launch(req)) {
    req.session.payload = req.body;
    launchTool(req, res);
  } else {
    res.send('invalid request');
  }
});

app.get("/project/submit", (req, res) => {
  console.log('get for project/submit');
  res.render("submit", {
    payload: req.session.payload, 
    formData: req.body.formData
  });
});

app.post(`/project/grading`, (req, res) => {
  console.log('post /project/grading');
  grade_project(req)
    .then(grading => {
      send_score(grading.grade, req.session.payload)
      res.render("submit", {
        payload: req.session.payload, 
        formData: grading
      });
    });
});

app.post('/project/return', (req, res) => {
  console.log('in return route');
  res.redirect(req.session.decoded_launch["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url);
  req.session.destroy();
});

app.get('/demo/oidc', (req, res) => {
  req.body = { 
    iss: 'https://www.sandiegocode.school',
    target_link_uri: 'https://piedpiper.localtunnel.me/project/submit',
    login_hint: '9',
    lti_message_hint: '377' 
  };
  res.send(create_oidc_response(req));
})

app.get('/demo/project/submit', (req, res) => {
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
