const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 12;

router.post("/sign-up", async (req, res) => {
  try {
    const userInDB = await User.findOne({ username: req.body.username });
    // If a user with this username already exist, deny creating that user
    if (userInDB) {
      res.status(409);
      throw new Error(`User with username ${req.body.username} already exist`);
    }

    // If we get here we know we have a unique user, lets create it
    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
    });

    const payload = { username: user.username, _id: user._id };

    const token = jwt.sign({ payload }, process.env.SECRET);

    res.status(201).json({ token });
  } catch (error) {
    if (res.statusCode === 409) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});

router.post("/sign-in", async (req, res) => {
  console.log(req.body)
  try {
    const user = await User.findOne({ username: req.body.username });
    // If this user does not exist lets throw and return that error
    if (!user) {
      res.status(401);
      throw new Error(`User with username ${req.body.username} does not exist`);
    }
    // If we make here, lets check if the password is correct
    // compareSync will give use back true or false if the pw is correct or not
    const isCorrectPassword = bcrypt.compareSync(
      req.body.password,
      user.hashedPassword,
    );
    if (!isCorrectPassword) {
      res.status(401);
      throw new Error(`Incorrect password`);
    }

    console.log(user)

    const payload = { username: user.username, _id: user._id };
    const token = jwt.sign({ payload }, process.env.SECRET);

    res.status(200).json({ token });
  } catch (error) {
    if (res.statusCode === 401) {
      res.json({ err: error.message });
    } else {
      res.status(500).json({ err: error.message });
    }
  }
});
module.exports = router;
