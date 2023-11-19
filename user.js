const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')
const passport = require("passport-local-mongoose")
const userSchema = new mongoose.Schema({
    googleId:String,
    username:String
  });
  userSchema.plugin(findOrCreate)
  userSchema.plugin(passport)
  const User = mongoose.model('Users', userSchema);
  module.exports = User;