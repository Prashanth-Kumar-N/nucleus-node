const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
// setup env, fallback to 'development'
dotenv.config({ path: `.env.${process.NODE_ENV || "development"}` });

// setup express app
let app = express();

// enable cors
app.use(cors());

//add logger middleware
const loggerMiddleWare = (req, res, next) => {
  console.log("Request made to - ", req.path);
  next();
};
app.use(loggerMiddleWare);

//add router(s)
const setupExpress = async () => {
  const { configureRouter } = require("./files");
  app = await configureRouter(app);

  app.listen(process.env.PORT || 443, () =>
    console.log(`Listening on port ${process.env.PORT || 443}`)
  );
};

setupExpress();
