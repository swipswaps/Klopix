const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const cookie_parser = require("cookie-parser");
const http_errors = require("http-errors");

const User_Schema = require("../models/User_Schema.js");

const validation = Joi.object({
  name: Joi.string().max(50).min(5).required(),
  email: Joi.string().email().min(5).required(),
  password: Joi.string().min(5).max(1024).required(),
  profile_picture: Joi.string().min(5).required(),
});

const login = async (req, res) => {
  try {
    const { logInemail, logInpassword } = req.body;

    // Check if email exist

    const user = await User_Schema.findOne({ email: logInemail });
    
    if(!logInemail && !logInpassword) {
      console.log('empty')
      res.status(404).send('Email and Password Fields Are Empty');
    }

    if (!user) {
      res.status(404).send(`Email doesn't not exist`);
    } else {
      const match = await bcrypt.compare(logInpassword, user.password);

      if (match) {
        const token = jwt.sign(
          { email: logInemail, userId: user._id },
          process.env.AUTH_TOKEN,
          {
            expiresIn: "1h",
          }
        );
        const cook = res.cookie("COOKIE_TOKEN", token, {httpOnly: true} , {
          expire: new Date() + 9999,
        });

        res.redirect('profile')
      } else {
        res.status(400).send("Incorrect Password");
      }
    }
  } catch (err) {
    res.status(404).send(err);
  }
};

const register = async (req, res, next) => {
  const { error } = await validation.validate(req.body);

  if (error) {
    return res.status(404).send(error.details[0].message);
  }

  checkEmail = await User_Schema.findOne({ email: req.body.email });

  if (checkEmail) return res.status(404).send("Email already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User_Schema({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
    profile_picture: req.body.profile_picture,
  });

  try {
    const userSaved = await user.save();
    res.send("Account created successfully.");
  } catch (err) {
    res.status(404).send("There is a error: " + err);
  }
};

const profile = (req, res) => {
  res.send("Welcome you just logged in");
};

const signOut = (req, res) => {
  const resCookie = res.clearCookie("COOKIE_TOKEN");

  if(resCookie != '') {
    res.send("Signed Out"); 
  } else {
    res.status(404).send(`Account wasn't logged in.`)
  }
};

module.exports = {
  register,
  login,
  signOut,
  profile,
};
