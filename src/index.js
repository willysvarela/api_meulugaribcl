const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const routes = require("./routes/index");
const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(routes);

const server = app.listen(process.env.PORT, () => {
  console.log("On na porta " + process.env.PORT);
});
