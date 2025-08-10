const jwt = require('jsonwebtoken');
const JWT_SECRET = "0a866ede118c0818c0eac8c952d8b1220bd3a8972c366fcdb134243513117f9004ea244bd41801044b19db93b0f5cb606ef4abcfefa0f1cd9df449f95edd7886";

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

module.exports = verifyToken;
