const express = require("express");
const { getAnonClient, getUserClient } = require("../supabaseClient");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const CROWD_LEVELS = ["empty", "moderate", "crowded"];
const NOISE_LEVELS = ["silent", "quiet", "moderate", "loud"];
const LOCATION_TYPES = ["on_campus", "off_campus"];

router.get("/", async (req, res) => {
  const { data, error } = await getAnonClient()
    .from("spots")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get("/:id", async (req, res) => {
  const { data, error } = await getAnonClient()
    .from("spots")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Spot not found" });
  res.json(data);
});

router.post("/", requireAuth, async (req, res) => {
  const { name, building, crowd_level, noise_level, location_type } = req.body;

  if (!name || !building) {
    return res.status(400).json({ error: "name and building are required" });
  }
  if (crowd_level && !CROWD_LEVELS.includes(crowd_level)) {
    return res.status(400).json({ error: `crowd_level must be one of ${CROWD_LEVELS.join(", ")}` });
  }
  if (noise_level && !NOISE_LEVELS.includes(noise_level)) {
    return res.status(400).json({ error: `noise_level must be one of ${NOISE_LEVELS.join(", ")}` });
  }
  if (location_type && !LOCATION_TYPES.includes(location_type)) {
    return res.status(400).json({ error: `location_type must be one of ${LOCATION_TYPES.join(", ")}` });
  }

  const client = getUserClient(req.token);

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", req.user.id)
    .maybeSingle();

  if (profileError) return res.status(500).json({ error: profileError.message });
  if (!profile) return res.status(400).json({ error: "Finish issuing your card before reporting a spot." });

  const { data, error } = await client
    .from("spots")
    .insert({
      name,
      building,
      crowd_level: crowd_level || "empty",
      noise_level: noise_level || "quiet",
      location_type: location_type || "on_campus",
      // Store a display name, not the reporter's email — spots are publicly readable.
      created_by: `${profile.first_name} ${profile.last_name.charAt(0)}.`,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { crowd_level, noise_level } = req.body;

  if (crowd_level && !CROWD_LEVELS.includes(crowd_level)) {
    return res.status(400).json({ error: `crowd_level must be one of ${CROWD_LEVELS.join(", ")}` });
  }
  if (noise_level && !NOISE_LEVELS.includes(noise_level)) {
    return res.status(400).json({ error: `noise_level must be one of ${NOISE_LEVELS.join(", ")}` });
  }

  const patch = { updated_at: new Date().toISOString() };
  if (crowd_level) patch.crowd_level = crowd_level;
  if (noise_level) patch.noise_level = noise_level;

  const { data, error } = await getUserClient(req.token)
    .from("spots")
    .update(patch)
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Spot not found" });
  res.json(data);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { data, error } = await getUserClient(req.token)
    .from("spots")
    .delete()
    .eq("id", req.params.id)
    .select()
    .maybeSingle();

  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Spot not found" });
  res.status(204).send();
});

module.exports = router;
