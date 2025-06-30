const express = require("express");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const multerS3 = require("multer-s3");
const {
  SSMClient,
  GetParameterCommand,
  GetParametersCommand,
} = require("@aws-sdk/client-ssm");
//const streamifier = require("streamifier");

// setup router
const router = new express.Router();

// setup s3 client

// getting access keys tore in Parameter store in AWS
// https://ap-south-1.console.aws.amazon.com/systems-manager/parameters/?region=ap-south-1&tab=Table

const getAccessKeys = async () => {
  const ssmClient = new SSMClient({ region: "ap-south-1" });
  const params = {
    Names: ["S3_ACCESS_KEY", "S3_SECRET_ACCESS_KEY"],
    WithDecryption: true,
  };
  const command = new GetParametersCommand(params);
  const paramsData = await ssmClient.send(command);
  const aws_params = {};
  paramsData.Parameters.forEach((param) => {
    process.env[param.Name] = param.Value;
    aws_params[param.Name] = param.Value;
  });
  return aws_params;
};

const paramsData = getAccessKeys();

// Using the fetched params to configure S3Client

console.log("from-function:", paramsData);
console.log("from-process:", process.env.S3_ACCESS_KEY);
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

//setup multer for S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKETNAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${process.env.AWS_S3_FILES_FOLDER}/${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * Number(process.env.MAX_FILE_SIZE), // Max file size in MB
  },
});

// add routes

//test-route
router.get("/", (req, res) => {
  res.send("Working!!!");
});

// test route - getaccesskeyparam
router.get("/get-access-key-param", async (req, res) => {
  res.send(data);
});

//get max allowed file size
router.get("/max-file-size", (req, res) => {
  res.send(process.env.MAX_FILE_SIZE || null);
});

// upload files to s3
router.post("/upload-file", upload.array("file", 5), async (req, res) => {
  // multer is setup with sulter-s3 as middelware which takes care of the uploading in its function call. Nothing to do here
  // This function is only called on success,
  // Error is called through an error middleware we  setup below

  res.send(`Successfully uploaded ${req.files.length} files`);
});

//setup error middleware which will catch all the errors middlware throws
const errorMiddleWare = (err, req, res, next) => {
  if (err) {
    const resErrObject = {
      code: err.code,
      error: err.message,
      status: "Error Uploading!!!",
    };
    res.status(500).send(resErrObject);
  }
};

// configure app with router and error middleware
const configureRouter = (app) => {
  app.use(router);
  app.use(errorMiddleWare);
  return app;
};

module.exports = { configureRouter };

/**
 * CODE FOR FUTURE REFERENCE
 * 
 * DIDN'T WORK
 * 1. Create a stream from buffer (use 'streamifier' if using multer) and then pass the stream to Body, but his needs a HEADER which tells S3 the size of the chunk, which we will have to calculate
 * TRY THIS and SOLVE!!!!!!!!!
 * 
 * const uploadToS3 = async (file) => {
  try {
    const fileStream = streamifier.createReadStream(file.buffer);
    // upload to s3 bucket
    const s3Response = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKETNAME,
        Body: fileStream,
        Key: `${process.env.AWS_S3_FILES_FOLDER}/${file.originalname}`,
      })
    );
    console.log(s3Response);
    } catch (e) {
      console.error(e);
    }
  };

  
 *
 * WORKED!!!
 * 2. Use memoryStorage() in multer and send the buffer object to S3 through 'Body' key in params,
 * but since it is using memory I think it will cost us more to upload, we need to stream the data,
 * this uses buffer object
 * 
 * try {
    const file = req.file;
    const { originalname, buffer, mimetype, size } = file;
    // upload to s3 bucket
     const s3Response = await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKETNAME,
        Body: buffer,
        Key: `${process.env.AWS_S3_FILES_FOLDER}/${originalname}`,
      })
    );
    console.log(s3Response);
    res.status(200).send(s3Response);
  } catch (e) {
    console.error(e);
    res.status(500).send("Error uploading file");
  }

 */
