const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
// setup env, fallback to 'development'
dotenv.config({ path: `.env.${process.NODE_ENV || "development"}` });

// setup express app
const app = express();

// enable cors
app.use(cors());

//add router(s)
const { configureRouter } = require("./files");
configureRouter(app);

app.listen(process.env.PORT || 3001, () =>
  console.log(`Listening on port 3001`)
);
