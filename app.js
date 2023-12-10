//17. Advanced Authentication
const path = require("path");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URL =
  // "mongodb+srv://abdomake73:xlsgzIvu2CYeOTrg@cluster0.vclsggt.mongodb.net/shop"
  // "mongodb+srv://abdomake73:xlsgzIvu2CYeOTrg@cluster0.vclsggt.mongodb.net/shop?retryWrites=true&w=majority"
  "mongodb://localhost:27017/";

const app = express();
const store = new MongoDBStore({
  //uri not url be careful
  uri: MONGODB_URL,
  collection: "sessions",
});
const csrfProtection = csrf();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
//after initialising the session csrf will use that session
app.use(csrfProtection);
//flash need to be configure/initialize after initializing the session
app.use(flash());
//now we can yse that flash iddleware any ware in our req object

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      // console.log("login1", req.session.user.getCart);//undefinded
      // req.session.user = user;
      // console.log("login1", req.session.user.getCart);//[Function (anonymous)]
      next();
    })
    .catch((err) => console.log(err));
});

//add a local fields will be send to the views.
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  // const errorMessageList = req.flash("error");
  // const errorMessage = errorMessageList ? errorMessageList[0] : null;
  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    console.log("conneted to the db");
    app.listen(3000);
    // app.listen(3000,'192.168.1.6');
    console.log("listenning");
  })
  .catch((err) => console.log(err));
