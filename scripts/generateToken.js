// Teaching shortcut only: signs a token for a sample user without any real
// credential check. A real login flow verifies a password before signing.
require("dotenv").config();
const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not set. Add it to your .env file.");
}

const token = jwt.sign({ id: 1, name: "Alex" }, secret, {
  algorithm: "HS256",
  expiresIn: "15m",
});

console.log(token);
