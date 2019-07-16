const express = require("express");
const morgan = require("morgan");
const bodyParser = require('body-parser');
const routes = require("./routes");
const {check, validationResult}  = require('express-validator');
const bodyParser = require('body-parser');


const app = express();

app.use(express.static("public"));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/routes', routes);
app.use(express.json());


app.set('views', './views');
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
  res.status(200).send(`Turn around ...Look at what you see...A slash route at.../project/submit/:projectName...Is where i'll be...`);
});

app.get("/project/submit/:projectname", (req, res) => {
  const food = { candy: 'candy' };
  res.render('submit', food);

});

/* Validates all required keys are strings and are populated. These may need to be updated moving forward. */
app.post("/project/authenticate/:projectname", 
 [ check('https://purl.imsglobal.org/spec/lti/claim/message_type').exists().isString().not().isEmpty(),
    check('https://purl.imsglobal.org/spec/lti/claim/version').exists().isString().not().isEmpty(),
    check('https://purl.imsglobal.org/spec/lti/claim/deployment_id').exists().isString().not().isEmpty(),
    check('https://purl.imsglobal.org/spec/lti/claim/resource_link').exists(),
    check('client_id').exists().isString().not().isEmpty(),
    check('sub').exists().isString(),
    check('https://purl.imsglobal.org/spec/lti/claim/roles').exists().isArray(),
    check('redirect_uri').exists().isString().not().isEmpty(),
    check('response_type').exists().isString().not().isEmpty(),
    check('scope').exists().isString().not().isEmpty(),
    check('custom_user_role').exists().isString().not().isEmpty(),
    check('custom_project_name').exists().isString().not().isEmpty()
],(req, res) => {

  const url = req.body;
  if (url.github.includes('github', 'heroku')) {
    res.status(200).send(grade, 'ok');
    let grade = {grade: 100}
  } else {
    res.status(200).send(grade, 'invalid url')
    let grade = {grade: 0}
  };

    const errors= validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({errors: errors.array()});
    }
    
  res.send(200).json(req);
});





module.exports = app;
