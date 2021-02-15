require('dotenv').config();
var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const secret = process.env.JWT_KEY;

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });

  try {
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Error registering new user.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      res.status(401).json({ error: 'Invalid or unregistered email address.'});
    else {
      user.checkPassword(password, function (err, same) {
        if (!same) 
          res.status(401).json({ error: 'Incorrect email or password.'});
        else {
          const token = jwt.sign({ email }, secret, { expiresIn: '7d' });
          res.json({ user: user, token: token });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal server error, please try again.' });
  }
});

module.exports = router;
