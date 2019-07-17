const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const {check, validationResult}  = require('express-validator');



const app = express();

app.use(express.static("public"));
app.use(morgan("dev"));
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
 [ check('https://purl.imsglobal.org/spec/lti/claim/message_type').exists().isString().not().isEmpty().withMessage("There is an error in the message type"),
    check('https://purl.imsglobal.org/spec/lti/claim/version').exists().isString().not().isEmpty().withMessage("There is an error with the version"),
    check('https://purl.imsglobal.org/spec/lti/claim/deployment_id').exists().isString().not().isEmpty().withMessage("There is an error with the deployment_id"),
    check('https://purl.imsglobal.org/spec/lti/claim/resource_link').exists().withMessage("There is an error with the resource_link"),
    check('client_id').exists().isString().not().isEmpty().withMessage("There is an error with the clietn_id"),
    check('sub').exists().isString().withMessage("There is an error with the sub"),
    check('https://purl.imsglobal.org/spec/lti/claim/roles').exists().isArray().withMessage("There is error with the roles array"),
    check('redirect_uri').exists().isString().not().isEmpty().withMessage("There is an error with the redirect_uri"),
    check('response_type').exists().isString().not().isEmpty().withMessage("There is is an error with the response type"),
    check('scope').exists().isString().not().isEmpty().withMessage("There is an error with the scope"),
    check('custom_user_role').exists().isString().not().isEmpty().withMessage("There is an error with the user role"),
    check('custom_project_name').exists().isString().not().isEmpty().withMessage("There is an error with the project name"),
    check('user_id').exists().isString().not().isEmpty().withMessage("There is an error with the user id"),
    check('user_role').exists().isString().contains("Learner").withMessage("The role of the user is not learner or undefined"),
    check('project_name').exists().isString().not().isEmpty().withMessage("There is an error with the project_name")
],(req, res) => {
    
    const errors= validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({errors: errors.array()});
    }
    
  res.send(200).json(req.body);
});



module.exports = app;
