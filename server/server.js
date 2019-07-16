const express = require("express");
const morgan = require("morgan");
const routes = require("./routes");

const app = express();

app.use(express.static("public"));
app.use(morgan("dev"));
app.use('/routes', routes);

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

app.post(`/project/authentication/test`, validate(validation.userInfo) , (req,res) => {

  res.json(200);
});




module.exports = app;
