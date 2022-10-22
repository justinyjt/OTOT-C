//guide used https://www.youtube.com/watch?v=mbsmsi7l3r4&ab_channel=WebDevSimplified
//https://github.com/WebDevSimplified/JWT-Authentication
//https://stackoverflow.com/questions/49503124/how-to-combine-passport-jwt-with-aclaccess-control-list-pattern

let jwt = require("jsonwebtoken");
let userModel = require("../model/userModel");
let userController = require("./userController");
let bcrypt = require("bcryptjs");
let tokenModel = require("../model/refreshtokenModel");

const ACCESS_TOKEN = process.env.JWT_SECRET_KEY
const REFRESH_TOKEN = process.env.JWT_REFRESH_KEY
const User = userModel.User;
const ROLES = userController.ROLES;
const RefreshToken = tokenModel.RefreshToken;

//Authentication
function createAccessToken({
  username,
  userPassword,
}) {
  return jwt.sign({ username, userPassword }, ACCESS_TOKEN, {
    expiresIn: "30m",
  });

  //return jwt.sign({ username, userPassword }, ACCESS_TOKEN);
}

//Authentication
function createRefreshToken({
  username,
  userPassword,
}) {
  //return jwt.sign({ username, userPassword }, REFRESH_TOKEN);

  return jwt.sign({ username, userPassword }, REFRESH_TOKEN, {
    expiresIn: "1h",
  });
}
/*
User credentials sent to /signin
/signin returns a JWT (signed with a key)
JWT is stored in localStorage
JWT is sent on every request (to API)
The server can read the JWT and extract user ID out of it
*/

async function signin(req, res) {
  try {
    const name = req.body.name;
    const hashPassword = req.body.hashPassword;

    const user = await User.findOne({ name: req.body.name });

    if (!user) {
      return res.status(409).send("User does not exist");
    }
    try {
        bcrypt.compare(req.body.hashPassword, user.hashPassword, function(err, result) {
            if (err){
              // handle error
              console.log(err);
            }
            if (result) {
              // Send JWT

               //password same
                const accessToken = createAccessToken({
                    username: name,
                    userPassword: hashPassword,
                });
        
                const refreshToken = createRefreshToken({
                    username: name,
                    userPassword: hashPassword,
                });
        
                //Save token locally
                const token = new RefreshToken();
                token.rtoken = accessToken;
                token.save((err) => {
                    if (err) {
                    console.log(err);
                    return res.status(500).json({
                        code: "500",
                        status: "error",
                        message: "Internal server error",
                    });
                    }
                });
                res
                    .status(200)
                    .json({ accessToken: accessToken, refreshToken: refreshToken });
            } else {
              // response is OutgoingMessage object that server response http request
              return res.status(401).json({
                code: "401",
                status: "error",
                message: "Invalid credentials",
              });
            }
          });
      if (await bcrypt.compare(hashPassword, user.hashPassword)) {
       
      } else {
        //Wrong password
        return res.status(401).json({
          code: "401",
          status: "error",
          message: "Invalid credentials",
        });
      }
    } catch (err) {
      return res
        .status(401)
        .json({ code: "401", status: "error", message: "Invalid credentials" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ code: "500", status: "error", message: "Internal server error" });
  }
}

async function signout(req, res) {
  try {
    const token = req.body.token;
    RefreshToken.deleteMany({ token }, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: "error",
          code: "500",
          message: "Internal server error, cant save new user",
        });
      }
    });
    return res.status(200).json({
      code: "200",
      status: "success",
      message: "successfully signout",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      code: "500",
      status: "error",
      message: "Internal server error, cant save new user",
    });
  }
}

async function adminOnly(req, res) {
  return res.status(200).json({
    code: "200",
    status: "success",
    message: "Admin Only Test",
  });
}

async function  getAccessToken(req, res) {
  try {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    const tokens = await RefreshToken.find({ token: refreshToken });
    if (tokens.length == 0) {
      return res.sendStatus(403);
    }
    const verification = jwt.verify(refreshToken, REFRESH_TOKEN);
    const { username, userPassword } = verification;
    console.log(username);
    const accessToken = createAccessToken({
      username: username,
      userPassword: userPassword,
    });
    return res.status(200).json({ accessToken: accessToken });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

function AuthenticateRole(roles){
  return async (
    req,
    res,
    next
  ) => {
    const authHeader = req.headers["authorization"];
    console.log(authHeader)
    const token = authHeader; //Undefined or actual token
    if (!token) {
      return res.status(401).json({ status: "error", message: "Unauthorized" }); //No token
    }

    try {
      const reqToken = jwt.verify(token, ACCESS_TOKEN);

      console.log(reqToken.username);
      const findUser = await User.findOne({ name: reqToken.username });
      console.log(`user: ${findUser.name}, ${findUser.hashPassword}`);

      if (!findUser.userRole || !findUser.userRole.includes(ROLES.Admin)) {
        return res
          .status(403)
          .json({ code: "403", status: "error", message: "Forbidden" });
      }
      req.user = findUser;
      next();
    } catch (err) {
        console.log(err)
      return res.status(500).json({
        code: "500",
        status: "error",
        message: "Internal server error",
      });
    }
  };
};

module.exports = {
    signin,
    signout,
    adminOnly,
    getAccessToken,
    AuthenticateRole
}