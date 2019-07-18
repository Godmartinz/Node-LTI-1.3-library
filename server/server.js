const express = require('express');
const morgan = require('morgan');
const routes = require('./routes');
require('dotenv').config();
const {check, validationResult}  = require('express-validator');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { valid_oauth2_request } = require('./oauth2_validation');

const app = express();

app.use(morgan('dev'));
app.use('/routes', routes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use( (req,res,next) => {
  res.locals.formData = null;
  next();
});

app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.status(200).send(`Turn around ...Look at what you see...A slash route at.../project/submit/:projectName...Is where i'll be...`);
});

app.post('/oauth2/token', (req, res) => {
  const errors = valid_oauth2_request(req);
  if (errors.length === 0) {  // no errors
    res.setHeader('Content-Type', 'application/json;charset=UTF-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    const payload = {
      sub: process.env.CLIENT_ID,
      expires_in: 3600,      // 1 hour per IMS spec
      token_type: 'bearer',
      scope: 'https://purl/imsglobal.org/spec/lti/v1p3/scope/grading.all'
    };
    const jwt_payload = jwt.sign(payload, process.env.CLIENT_SECRET, { algorithm: 'RS256'});
    res.status(200).send(jwt_payload);
  } else {
      if (errors.findIndex(e => e.includes('grant type invalid')) >= 0) {
        res.status(400).send({
          error: 'unsupported_grant_type',
          errors: errors
        });
      } else if (errors.findIndex(e => e.includes('invalid')) >= 0) {
        res.status(401).send({
          error: 'invalid_client',
          errors: errors
        });
      } else { 
        res.status(400).send({
          error: 'invalid_request',
          errors: errors
        });
      }
  }
});

app.get('/project/submit/:projectname', (req, res) => {
  const jwt_string = req.headers.authorization.split(' ')[1];
  jwt.verify(jwt_string, process.env.CLIENT_PUBLIC, { algorithm: ['RS256']}, (err, decoded) => {
    if (err) {
      res.status(401).send('invalid token');
    } else {
      //const errors = launch_validation(req); 
      const errors = [];
      if (errors.length === 0) {
        res.status(200).render('submit', {projectName: 'candy'});
      } else {
        res.status(400).send({
          error: 'invalid_request',
          error: errors
        })
      }
    }
  });
});

app.post(`/project/submit/projectname`, (req, res) => {
  const url = req.body;
  if ( url.github.includes('github.com') && (url.heroku.includes('.herokuapp.com') || url.heroku.includes('now.sh'))) {
    axios
    .get(url.github) 
      .then( response => {
        let grading = {
          gitUrl: url.github,
          heroUrl: url.heroku,
          urlStatus: response.status,
          grade: 1,
        };
        res.render('submit', {projectName: 'candy', formData: grading});
      })
      .catch( err => console.log(err))
  } else {
    let grading = {
      gitUrl: url.github,
      heroUrl: url.heroku,
      urlStatus: 'Sorry, the URLs you provided are not valid.',
      grade: 0
    };
    res.render('submit', {projectName: 'candy', formData: grading});
  }
})

/* Validates all required keys are strings and are populated. These may need to be updated moving forward. */
app.post('/project/authenticate/:projectname', 
  [ check('https://purl.imsglobal.org/spec/lti/claim/message_type').exists().isString().not().isEmpty().withMessage('There is an error in the message type'),
    check('https://purl.imsglobal.org/spec/lti/claim/version').exists().isString().not().isEmpty().withMessage('There is an error with the version'),
    check('https://purl.imsglobal.org/spec/lti/claim/deployment_id').exists().isString().not().isEmpty().withMessage('There is an error with the deployment_id'),
    check('https://purl.imsglobal.org/spec/lti/claim/resource_link').exists().withMessage('There is an error with the resource_link'),
    check('client_id').exists().isString().not().isEmpty().withMessage('There is an error with the client_id'),
    check('sub').exists().isString().withMessage('There is an error with the sub'),
    check('https://purl.imsglobal.org/spec/lti/claim/roles').exists().isArray().withMessage('There is error with the roles array'),
    check('redirect_uri').exists().isString().not().isEmpty().withMessage('There is an error with the redirect_uri'),
    check('response_type').exists().isString().not().isEmpty().withMessage('There is an error with the response type'),
    check('scope').exists().isString().not().isEmpty().withMessage('There is an error with the scope'),
    check('custom_user_role').exists().isString().not().isEmpty().withMessage('There is an error with the user role'),
    check('custom_project_name').exists().isString().not().isEmpty().withMessage('There is an error with the project name'),
    check('user_id').exists().isString().not().isEmpty().withMessage('There is an error with the user id'),
    check('user_role').exists().isString().contains('http://purl.imsglobal.org/vocab/lis/v2/membership#Learner').withMessage('The role of the user is not learner or undefined'),
    check('project_name').exists().isString().not().isEmpty().withMessage('There is an error with the project_name')
],(req, res) => {

  const errors= validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({errors: errors.array()});
  }
    
  res.send(200).json(req.body);
});

module.exports = app;
