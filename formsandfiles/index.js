const express = require("express");
const app = express();
const ejs = require("ejs");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dcc0ltvjp",
  api_key: "188938761863674",
  api_secret: "Q2MacsxB3dfwOyfZ2CM98nHh4JE",
});

app.use(express.json());
app.use(express.urlencoded());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.set("view engine", "ejs");

//* used to render the ejs template
app.get("/myget", (req, res) => {
  res.render("myget");
});
app.get("/mypost", (req, res) => {
  res.render("mypost");
});

//*NOTE: when using ejs or any other engine the data getting from form is in query parameter
//* when using frameworks like react it will be in body.

app.get("/mygetform", (req, res) => {
  console.log(req.query);
  res.json(req.query);
});

app.post("/mypostform", async (req, res) => {
  console.log(req.body);

  const file = req.files.sampleFile;
  const details = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    file: {
      name: file.name,
      tempFilePath: file.tempFilePath,
      mimetype: file.mimetype,
      md5: file.md5,
    },
  };

  if (file) {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
    });

    console.log(result);
  }

  console.log(file);
  console.log(details);

  res.json(details);
});

app.listen(4000, () => console.log(`Server started on port 4000`));
