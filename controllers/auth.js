exports.getLogin = (req, res, next) => {
  let isLoggedIn = false;
  if (req.get("Cookie")) {
    isLoggedIn = req.get("Cookie").split("=")[1] == "true" ? true : false;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  res.setHeader("Set-Cookie", "isLoggedIn=true");
  res.redirect("/");
};
