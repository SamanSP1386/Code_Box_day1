const express = require("express");
const { getUserClient } = require("../supabaseClient");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const CLASS_YEARS = ["Freshman", "Sophomore", "Junior", "Senior", "Grad Student"];

router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await getUserClient(req.token)
    .from("profiles")
    .select("*")
    .eq("id", req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post("/", requireAuth, async (req, res) => {
  const { first_name, last_name, major, class_year } = req.body;

  if (!first_name || !last_name || !major || !class_year) {
    return res.status(400).json({ error: "first_name, last_name, major, and class_year are required" });
  }
  if (!CLASS_YEARS.includes(class_year)) {
    return res.status(400).json({ error: `class_year must be one of ${CLASS_YEARS.join(", ")}` });
  }

  const { data, error } = await getUserClient(req.token)
    .from("profiles")
    .upsert({ id: req.user.id, first_name, last_name, major, class_year })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

module.exports = router;
