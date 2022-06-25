const mongoose = require("mongoose");

const connectToDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database started successfully"))
    .catch((err) => {
      console.log("Error in connecting DB");
      console.log(err);

      process.exit(1);
    });
};

module.exports = connectToDB;
