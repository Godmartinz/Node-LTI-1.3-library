const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");
const {check, validationResult}  = require('express-validator');
const bodyParser = require('body-parser');


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

app.post("/project/authenticate/:projectname", (req, res) => {
  const mockObject = {
    bob: "alsoBob"
  };
  res.status(200).json(mockObject);

});
/* Validates all required keys are strings and are populated */
app.post("/project/authenticate/:projectname", 
 [ check('lti_message_type').isString().not().isEmpty(),
    check('lti_version').isString().not().isEmpty(),
    check('Oauth_consumer_key').isString().not().isEmpty(),
    check('resource_link_id').isString().not().isEmpty(),
    check('client_id').isString().not().isEmpty(),
    check('redirect_uri').isString().not().isEmpty(),
    check('response_type').isString().not().isEmpty(),
    check('scope').isString().not().isEmpty(),
    check('custom_user_role').isString().not().isEmpty(),
    check('custom_project_name').isString().not().isEmpty()
],(req, res) => {
  
    const errors= validationResult(req);
    if(!errors.isEmpty()){
      return res.status(422).json({errors: errors.array()});
    }
    let userInfo={
      lti_message_type:req.body.lti_message_type,
      lti_version: req.body.lti_version,
      Oauth_consumer_key: req.body.Oauth_consumer_key,
      resource_link_id: req.body.resource_link_id,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri,
      response_type:req.body.response_type,
      scope:req.body.scope,
      custom_user_role:req.body.custom_user_role,
      custom_project_name:req.body.custom_project_name
    }
  res.send(200, userInfo).json(userInfo);
});





module.exports = app;
