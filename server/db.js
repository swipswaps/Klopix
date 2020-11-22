const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

exports.connectDatabase = () => {
  try {
    mongoose.connect(
      process.env.MONGO_KEY,
      { useNewUrlParser: true, useUnifiedTopology: true },
      () => {
        console.log("Connected To Database");
      }
    );
  } catch (err) {
    console.log(`Can't Connect To Database ${err}`);
  }
};
