require("dotenv").config();

const express = require("express");
const usersRouter = require("./routes/users");
const requireAuth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello from CodeBox!");
});

app.use("/api/users", usersRouter);

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ id: req.user.id, name: req.user.name });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
