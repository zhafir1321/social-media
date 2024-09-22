const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

const signToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

const verify = (token) => {
  return jwt.verify(token, secretKey);
};

module.exports = { signToken, verify };
