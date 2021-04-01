require('dotenv').config();
const mongoose = require('mongoose');
const mongoUrl = process.env.MONGO_URL;

mongoose.Promise = global.Promise;

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => console.log('Successfuly connected to MongoDB.'))
  .catch(err => console.log(err));
