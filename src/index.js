const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config();

const routes = require("./routes/index");
const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(routes);

const server = app.listen(process.env.PORT, () => {
  console.log("On na porta " + process.env.PORT);
});
