let User = require('../model/userModel').User
let bcrypt = require("bcryptjs");

const ROLES = {
  User : "user",
  Admin : "admin",
}
async function hashPassword(password) {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
}

//Register user
async function registerUser(req, res) {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (user) {
      return res.status(409).send("User already exists!");
    }
    //Bcrypting the password
    const userPassword = req.body.hashPassword;
    const hashed = await hashPassword(userPassword);
    const newUser = new User();
    newUser.name = req.body.name;
    newUser.hashPassword = hashed;
    newUser.userRole.push(ROLES.User);
    newUser.save((err) => {
      if (err)
        return res.status(500).json({
          status: "error",
          message: "Internal server error, cant save new user",
        });
      res.status(201).json({
        status: "success",
        message: "New user created!",
        data: newUser,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
}

//Register admin
async function registerAdmin(req, res) {
  try {
    const user = await User.findOne({ name: req.body.name });
    if (user) {
      return res.status(409).send("User already exists");
    }

    //Bcrypting the password
    const userPassword = req.body.hashPassword;
    const hashed = await hashPassword(userPassword);
    const newUser = new User();
    newUser.name = req.body.name;
    newUser.hashPassword = hashed;
    newUser.userRole.push(ROLES.User, ROLES.Admin);
    newUser.save((err) => {
      if (err)
        return res.status(500).json({
          status: "error",
          message: "Internal server error, cant save new user",
        });
      res.status(201).json({
        status: "success",
        message: "New Admin created!",
        data: newUser,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal server error");
  }
}

module.exports = {
    ROLES,
    hashPassword,
    registerUser,
    registerAdmin
}