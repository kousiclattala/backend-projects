require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const User = require("./model/user");

const auth = require("./middleware/auth");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Hello From Auth System</h1>");
});

//* register
app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (!(firstname && lastname && email && password)) {
      res.status(400).send("All fields are required");
    } else if (existingUser) {
      res.status(401).send("User already exists");
    } else {
      const myEncPassword = await bcrypt.hash(password, 10);

      //* it will create a object in the db and the reference of it can get with the 'user' param
      const user = await User.create({
        firstname,
        lastname,
        email,
        password: myEncPassword,
      });

      //* generating jwt token
      const token = jwt.sign(
        {
          user_id: user._id,
          email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      //* adding token to the user object.
      user.token = token;
      user.password = undefined;
      //* sending response to the user
      res.status(201).json(user);
    }
  } catch (error) {
    console.log(error);
  }
});

//* login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        {
          user_id: user._id,
          email,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;
      user.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.status(200).cookie("token", token, options).json({
        success: true,
        user: user,
      });
    } else {
      res.status(400).send("email or password is incorrect");
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", auth, (req, res) => {
  //* sending the status and also removing the cookie
  res.status(200).clearCookie("token").send("Welcome to secret information");
});

module.exports = app;
