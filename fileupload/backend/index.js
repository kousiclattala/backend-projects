const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const User = require("./model");
const path = require("path");
const url = require("url");
const cloudinary = require("cloudinary");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: "<your-aws-access-key>",
  secretAccessKey: "<your-aws-secret-key>",
});

cloudinary.config({
  cloud_name: "<your-cloud-name>",
  api_key: "<your-cloudinary-apikey>",
  api_secret: "<your-cloudinary-apisecret>",
});

//* middle ware
app.use(express.json());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
// app.use("/allusers", express.static(path.join(__dirname, "/pictures")));

//* initializing database
mongoose
  .connect("mongodb://localhost:27017/fileupload", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log("Error in DB connection"));

//* routes

//* posting picture
app.post("/uploadpicture", async (req, res) => {
  try {
    const { firstname, lastname } = req.body;

    console.log("body", req.body);
    console.log("files", req.files);

    const file = req.files.samplefile;

    const file_path = __dirname + "\\pictures\\" + file.name;
    console.log(file_path);

    // const fileUrl = url.pathToFileURL(file_path);
    // console.log("file url | ", fileUrl);

    file.mv(file_path, (err) => {
      if (err) {
        console.log("err in moving file | ", err);
      }
    });

    const user = new User({
      firstname,
      lastname,
      profilePic: "http://localhost:4000/allusers/" + file.name,
    });

    await user.save((err, user) => {
      if (err) {
        return res.status(400).json({
          error: err,
          message: "unable to save the user",
        });
      }

      res.status(200).json(user);
    });
  } catch (error) {
    console.log(error);
  }

  //   res.json({
  //     firstname,
  //     lastname,
  //     file,
  //   });
});

//* cloudinary upload
app.post("/cloudinaryupload", async (req, res) => {
  try {
    const { firstname, lastname } = req.body;
    const file = req.files.samplefile;

    const cloudres = await cloudinary.v2.uploader.upload(file.tempFilePath, {
      folder: "photos",
    });

    console.log(cloudres);

    const user = new User({
      firstname,
      lastname,
      profilePic: cloudres.url,
    });

    await user.save((err, user) => {
      if (err) {
        return res.status(500).json("error in saving user");
      }

      res.status(200).json(user);
    });
  } catch (error) {
    console.log(error);
  }
});

//* aws s3 upload
app.post("/awsupload", async (req, res) => {
  try {
    const { firstname, lastname } = req.body;

    const file = req.files.samplefile;

    const params = {
      Bucket: "picturesaws123",
      Key: file.name, // File name you want to save as in S3
      Body: file.tempFilePath,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        return res.status(500).json(err);
      }
      console.log(data);

      const user = new User({
        firstname,
        lastname,
        profilePic: data.Location,
      });

      user.save((err, user) => {
        if (err) {
          return res.status(500).json({
            err: err,
            msg: "error in saving the user",
          });
        }

        res.status(200).json(user);
      });
    });
  } catch (error) {
    console.log(error);
  }
});

//* get all data
app.get("/allusers", async (req, res) => {
  const users = await User.find();

  res.status(200).json(users);
});

//* listening to server
app.listen(4000, () => console.log("Server started successfully..."));
