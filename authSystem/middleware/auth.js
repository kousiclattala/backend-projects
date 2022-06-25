const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  //* get the token from frontend
  const token =
    req.cookies.token ||
    req.body.token ||
    req.header("Authorization").replace("Bearer ", "");

  //* check if token is present or not
  if (!token) {
    return res.status(403).send("Token is missing");
  }

  //* verify the token
  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    console.log(decode);

    // get info from DB
    res.user = decode;
  } catch (error) {
    return res.status(403).send("Token is invalid");
  }

  return next();
};

module.exports = auth;
