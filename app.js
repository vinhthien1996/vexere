const express = require("express");
const bodyParser = require("body-parser");
const config = require("config");
//package để xây đường dẫn
const path = require("path");
const passport = require('passport');
const passpoetStratery = require('passport-facebook-token');
const jwt = require('jsonwebtoken');
const User = require("./models/user");
const cors = require('cors');

require("./db/connect");

const tripRouter = require("./routers/trip");
const branchRouter = require("./routers/branch");
const carRouter = require("./routers/car");
const stationRouter = require("./routers/station");
const authRouter = require("./routers/auth");
const uploadRouter = require("./routers/upload");

const app = express();


passport.use("facebookToken", new passpoetStratery({
  clientID: "863402824438719",
  clientSecret: "68b9487586df35c577572478256c1798"
}, async (accessToken, refreshToken, profile, done) => {
  const userEmail = profile.emails[0].value;
  const userAvatar = profile.photos[0].value;

  try {

    const foundedUser = await User.findOne({ email: userEmail });
    const user = foundedUser;

    if (!foundedUser) {
      const newUser = new User({
        email: userEmail,
        role: "user",
        avatar: userAvatar,
      });
      const user = await newUser.save();
    }

    done(null, user);
  } catch (error) {
    console.log(error);
  }
}));

/**
 * TODO
 *  .CRUD Branch
 *  .CRUD Car
 *  .CRUD Station
 *  .CRUD Trip
 *  .signup, signin, jwt, track tokens , authorization, logout ,log out all
 *  .Booking Ticket
 *  .Refactor - mvc, router,
 *  .Giới thiệu buffer - stream
 *  .Upload file - filter type,limit size, serve static file
 *  .Send email
 *  .Chat module
 *
 */

//closure

console.log();

const imagesFolderPath = path.join(__dirname, "images");

app.use(cors({
  origin: 'http://localhost:5500',
  optionsSuccessStatus: 200
}));

app.use(bodyParser.json());
app.use('/images', express.static(imagesFolderPath));

app.use(tripRouter);
app.use(branchRouter);
app.use(carRouter);
app.use(stationRouter);
app.use(authRouter);
app.use(uploadRouter);
app.post('/login/facebook', passport.authenticate('facebookToken', { session: false }), async (req, res) => {
  const token = await jwt.sign(
    {
      _id: req.user,
    },
    "vexerejwt"
  );
  req.user.tokens.push(token);
  await req.user.save();
  res.send(token);
});

const port = config.get("port");

app.listen(port, () => {
  console.log("listening...");
});
