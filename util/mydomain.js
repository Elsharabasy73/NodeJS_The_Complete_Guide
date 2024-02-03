module.exports = (req) => {
  // => http://localhost:3000
  const domain = req.protocol + "://" + req.get("host");
  return domain;
};
