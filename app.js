//17. Advanced Authentication
const path = require("path");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

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
//image name of the input filed hold the file.
app.use(multer({dest:'images'}).single("image"));
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
  // throw new Error("dummy");//make your code go to the next error middleware
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      // console.log("login1", req.session.user.getCart);//undefinded
      // req.session.user = user;
      // console.log("login1", req.session.user.getCart);//[Function (anonymous)]
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
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

app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Page Not Found",
    path: "/500",
    isAuthenticated: req.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URL)
  .then((result) => {
    console.log("conneted to the db");
    app.listen(3000);
    // app.listen(3000,'192.168.1.6');
    console.log("listenning");
  })
  .catch((err) => {
    err.setHttpStatus = 500;
    next(err);
  });
