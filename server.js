require("dotenv").config();

const path = require("path");
const express = require("express");
const usersRouter = require("./routes/users");
const spotsRouter = require("./routes/spots");
const profileRouter = require("./routes/profile");
const requireAuth = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/users", usersRouter);
app.use("/api/spots", spotsRouter);
app.use("/api/profile", profileRouter);

// Supabase's anon key is meant to be public (it's only ever as powerful as
// the Row Level Security policies in supabase/schema.sql), so it's safe to
// hand to the browser this way instead of hardcoding it into app.js.
app.get("/api/config", (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
