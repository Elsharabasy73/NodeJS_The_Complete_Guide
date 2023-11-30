const path = require("path");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({ secret: "my secret", resave: false, saveUninitialized: false })
);

app.use((req, res, next) => {
  User.findById("65639f553e44f96de15b9436")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://abdomake73:xlsgzIvu2CYeOTrg@cluster0.vclsggt.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    console.log("conneted to the db");
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "abdo",
          email: "abdo@test.com",
          cart: { items: [] },
        });
        user.save();
      }
    });
    app.listen(3000);
    console.log("listenning");
  })
  .catch((err) => console.log(err));
