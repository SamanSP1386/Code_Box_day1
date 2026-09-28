const express = require("express");
const userService = require("../services/userService");

const router = express.Router();

// req.params holds route placeholders like :id from the URL.
router.get("/", (req, res) => {
  res.json(userService.getAllUsers());
});

router.get("/:id", (req, res) => {
  const user = userService.getUserById(req.params.id);

  if (!user) {
    // res.json() sends a JSON body; status() sets the HTTP status code first.
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});

module.exports = router;
