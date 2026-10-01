(() => {
  "use strict";

  const CROWD_LABEL = { empty: "Quiet", moderate: "Busy", crowded: "Full" };
  const CROWD_CYCLE = { empty: "moderate", moderate: "crowded", crowded: "empty" };
  const LOCATION_LABEL = { on_campus: "On campus", off_campus: "Off campus" };

  const state = {
    token: null,
    profile: null, // { first_name, last_name, major, class_year } once the card is issued
    spots: [],
    crowdFilter: "all",
    locationFilter: "all",
  };

  // Supabase client, created once /api/config resolves (see initAuth below).
  // It persists its own session in localStorage, so we don't manage tokens ourselves.
  let sb = null;
  let resolvedUserId = null;

  // ---------- Screens ----------
  const screens = {
    gate: document.getElementById("gateScreen"),
    onboard: document.getElementById("onboardScreen"),
    app: document.getElementById("appScreen"),
  };

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
  }

  // ---------- DOM refs ----------
  const catalogEl = document.getElementById("catalog");
  const emptyStateEl = document.getElementById("emptyState");
  const spotCountEl = document.getElementById("spotCount");
  const authSlotEl = document.getElementById("authSlot");
  const clockEl = document.getElementById("clock");
  const toastStackEl = document.getElementById("toastStack");

  const loginBackdrop = document.getElementById("loginBackdrop");
  const addBackdrop = document.getElementById("addBackdrop");

  // ---------- Helpers ----------
  function authHeaders() {
    return state.token ? { Authorization: `Bearer ${state.token}` } : {};
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function relativeTime(isoString) {
    if (!isoString) return "just now";
    const date = new Date(isoString);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 45) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function toast(message, type = "success") {
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    el.textContent = message;
    toastStackEl.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  async function api(path, options = {}) {
    const res = await fetch(path, options);
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    if (!res.ok) {
      const message = (data && data.error) || `Request failed (${res.status})`;
      throw new Error(message);
    }
    return data;
  }

  // ---------- Modals ----------
  let lastFocused = null;

  function openModal(backdrop) {
    lastFocused = document.activeElement;
    backdrop.hidden = false;
    const firstField = backdrop.querySelector("input, select, button");
    if (firstField) firstField.focus();
    document.addEventListener("keydown", onModalKeydown);
  }

  function closeModal(backdrop) {
    backdrop.hidden = true;
    document.removeEventListener("keydown", onModalKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onModalKeydown(e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop").forEach((b) => {
        if (!b.hidden) closeModal(b);
      });
    }
  }

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal-backdrop")));
  });

  [loginBackdrop, addBackdrop].forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  document.getElementById("openAddSpot").addEventListener("click", () => {
    openModal(addBackdrop);
  });

  document.getElementById("gateLoginBtn").addEventListener("click", () => {
    resetLoginModal();
    openModal(loginBackdrop);
  });

  // ---------- Auth (magic-link email sign-in, via Supabase) ----------
  const emailForm = document.getElementById("emailForm");
  const loginSubEl = document.getElementById("loginSub");
  const linkSentPanel = document.getElementById("linkSentPanel");
  const sentToEmailEl = document.getElementById("sentToEmail");
  const changeEmailBtn = document.getElementById("changeEmailBtn");

  function resetLoginModal() {
    emailForm.reset();
    emailForm.hidden = false;
    linkSentPanel.hidden = true;
    changeEmailBtn.hidden = true;
    loginSubEl.textContent = "We'll email you a secure sign-in link — no password needed.";
  }

  function renderAuthArea() {
    authSlotEl.innerHTML = "";
    if (!state.token) return;

    const label = state.profile
      ? `${state.profile.first_name} ${state.profile.last_name.charAt(0)}.`
      : "…";

    const chip = document.createElement("div");
    chip.className = "auth-chip";
    chip.innerHTML = `<span class="auth-chip__dot" aria-hidden="true"></span><span>${escapeHtml(label)}</span>`;
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Log out";
    logoutBtn.addEventListener("click", logout);
    chip.appendChild(logoutBtn);
    authSlotEl.appendChild(chip);
  }

  async function logout() {
    if (sb) await sb.auth.signOut();
    toast("Logged out.", "success");
  }

  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!sb) {
      toast("Still starting up — try again in a second.", "error");
      return;
    }
    const email = document.getElementById("loginEmail").value.trim();
    const submitBtn = e.target.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: "http://localhost:3000" },
      });
      if (error) throw error;
      sentToEmailEl.textContent = email;
      emailForm.hidden = true;
      linkSentPanel.hidden = false;
      changeEmailBtn.hidden = false;
      toast(`Sign-in link sent to ${email}.`, "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  changeEmailBtn.addEventListener("click", resetLoginModal);

  // Routes the app to the right screen whenever the session changes: signed
  // out -> gate, signed in but no card yet -> onboarding, card issued -> app.
  async function applySession(session) {
    state.token = session ? session.access_token : null;

    if (!session) {
      resolvedUserId = null;
      state.profile = null;
      renderAuthArea();
      showScreen("gate");
      return;
    }

    renderAuthArea();

    // Supabase also fires this on token refresh; skip re-routing if we've
    // already resolved this same user during the current page load.
    if (session.user.id === resolvedUserId) return;
    resolvedUserId = session.user.id;

    try {
      const profile = await api("/api/profile", { headers: authHeaders() });
      state.profile = profile;
      renderAuthArea();

      if (profile) {
        showScreen("app");
        loadSpots().catch((err) => toast(`Could not load spots: ${err.message}`, "error"));
      } else {
        showScreen("onboard");
        resetOnboardForm();
      }
    } catch (err) {
      console.error("Could not load profile:", err);
      toast(`Could not load your card: ${err.message}`, "error");
    }
  }

  async function initAuth() {
    try {
      const config = await fetch("/api/config").then((r) => r.json());
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error("Supabase is not configured on the server yet.");
      }
      sb = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

      // Fires on sign-in, sign-out, and — crucially — when the page loads
      // after the user clicks the magic link in their email (supabase-js
      // parses the redirect URL for us and reports the new session here).
      sb.auth.onAuthStateChange((_event, session) => {
        applySession(session);
      });

      const { data } = await sb.auth.getSession();
      await applySession(data.session);
    } catch (err) {
      console.error("initAuth failed:", err);
      toast(`Login is unavailable: ${err.message}`, "error");
    }
  }

  // ---------- Onboarding ("issue your card") ----------
  const onboardForm = document.getElementById("onboardForm");
  const previewNameEl = document.getElementById("previewName");
  const previewMajorEl = document.getElementById("previewMajor");
  const previewYearEl = document.getElementById("previewYear");
  const previewIssuedEl = document.getElementById("previewIssued");

  function resetOnboardForm() {
    onboardForm.reset();
    updateCardPreview();
  }

  function updateCardPreview() {
    const first = document.getElementById("obFirstName").value.trim();
    const last = document.getElementById("obLastName").value.trim();
    const major = document.getElementById("obMajor").value.trim();
    const year = document.getElementById("obYear").value;

    const fullName = `${first} ${last}`.trim();
    previewNameEl.textContent = fullName || "Your Name Here";
    previewNameEl.classList.toggle("id-card__name--placeholder", !fullName);
    previewMajorEl.textContent = major || "—";
    previewYearEl.textContent = year || "—";
    previewIssuedEl.textContent = `Issued ${new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  }

  ["obFirstName", "obLastName", "obMajor", "obYear"].forEach((id) => {
    document.getElementById(id).addEventListener("input", updateCardPreview);
  });
  updateCardPreview();

  onboardForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const first_name = document.getElementById("obFirstName").value.trim();
    const last_name = document.getElementById("obLastName").value.trim();
    const major = document.getElementById("obMajor").value.trim();
    const class_year = document.getElementById("obYear").value;
    const submitBtn = e.target.querySelector("button[type=submit]");

    submitBtn.disabled = true;
    try {
      const profile = await api("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ first_name, last_name, major, class_year }),
      });
      state.profile = profile;
      renderAuthArea();
      showScreen("app");
      toast(`Welcome to the stacks, ${profile.first_name}.`, "success");
      loadSpots().catch((err) => toast(`Could not load spots: ${err.message}`, "error"));
    } catch (err) {
      toast(err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------- Spots ----------
  async function loadSpots() {
    state.spots = await api("/api/spots");
    renderCatalog();
  }

  function filteredSpots() {
    return state.spots.filter((s) => {
      const crowdOk = state.crowdFilter === "all" || s.crowd_level === state.crowdFilter;
      const locationOk = state.locationFilter === "all" || s.location_type === state.locationFilter;
      return crowdOk && locationOk;
    });
  }

  function renderCatalog() {
    spotCountEl.textContent = String(state.spots.length).padStart(2, "0");

    const spots = filteredSpots();
    catalogEl.innerHTML = "";
    emptyStateEl.hidden = spots.length > 0;

    for (const spot of spots) {
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `
        ${window.SpotArt ? window.SpotArt.render(spot) : ""}
        <div class="card__body">
          <div class="card__top-row">
            <span class="card__catalog-no">NO. ${String(spot.id).padStart(3, "0")}</span>
            <span class="location-tag" data-type="${spot.location_type}">${LOCATION_LABEL[spot.location_type] || spot.location_type}</span>
          </div>
          <h3 class="card__name">${escapeHtml(spot.name)}</h3>
          <p class="card__building">${escapeHtml(spot.building)}</p>
          <span class="stamp" data-level="${spot.crowd_level}">${CROWD_LABEL[spot.crowd_level] || spot.crowd_level}</span>
          <div class="card__meta">
            <span class="card__noise">${escapeHtml(spot.noise_level)}</span>
            <span>updated ${relativeTime(spot.updated_at)}</span>
          </div>
          <div class="card__actions">
            <span class="card__reporter">reported by ${escapeHtml(spot.created_by)}</span>
            <div class="card__buttons">
              <button class="check-in-btn" data-action="check-in" data-id="${spot.id}">I'm here</button>
              <button class="icon-btn" data-action="delete" data-id="${spot.id}" aria-label="Delete spot">&times;</button>
            </div>
          </div>
        </div>
      `;
      catalogEl.appendChild(li);
    }
  }

  catalogEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn || btn.disabled) return;
    const id = btn.dataset.id;

    if (btn.dataset.action === "check-in") {
      await checkIn(id, btn);
    } else if (btn.dataset.action === "delete") {
      await removeSpot(id, btn);
    }
  });

  async function checkIn(id, btn) {
    const spot = state.spots.find((s) => String(s.id) === String(id));
    if (!spot) return;
    const next = CROWD_CYCLE[spot.crowd_level] || "empty";

    btn.disabled = true;
    try {
      const updated = await api(`/api/spots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ crowd_level: next }),
      });
      const idx = state.spots.findIndex((s) => String(s.id) === String(id));
      state.spots[idx] = updated;
      renderCatalog();
      const stampEl = catalogEl.querySelector(`.stamp[data-level="${updated.crowd_level}"]`);
      if (stampEl) {
        stampEl.classList.add("is-updating");
        setTimeout(() => stampEl.classList.remove("is-updating"), 300);
      }
      toast(`Marked "${spot.name}" as ${CROWD_LABEL[next]}.`, "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.disabled = false;
    }
  }

  async function removeSpot(id, btn) {
    const spot = state.spots.find((s) => String(s.id) === String(id));
    btn.disabled = true;
    try {
      const res = await fetch(`/api/spots/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      state.spots = state.spots.filter((s) => String(s.id) !== String(id));
      renderCatalog();
      toast(`Removed "${spot ? spot.name : "spot"}" from the catalog.`, "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.disabled = false;
    }
  }

  document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("newName").value.trim();
    const building = document.getElementById("newBuilding").value.trim();
    const location_type = document.getElementById("newLocation").value;
    const crowd_level = document.getElementById("newCrowd").value;
    const noise_level = document.getElementById("newNoise").value;
    const submitBtn = e.target.querySelector("button[type=submit]");

    submitBtn.disabled = true;
    try {
      const spot = await api("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, building, location_type, crowd_level, noise_level }),
      });
      state.spots.unshift(spot);
      renderCatalog();
      closeModal(addBackdrop);
      e.target.reset();
      toast(`Added "${spot.name}" to the catalog.`, "success");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------- Filters ----------
  // Each .filters group (crowd status, location) is its own set of exclusive
  // chips — clicking one only clears the "active" state within that group.
  document.querySelectorAll(".filters").forEach((group) => {
    group.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        group.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
        chip.classList.add("is-active");
        if (chip.dataset.filterType === "crowd") state.crowdFilter = chip.dataset.filter;
        if (chip.dataset.filterType === "location") state.locationFilter = chip.dataset.filter;
        renderCatalog();
      });
    });
  });

  // ---------- Clock ----------
  function tickClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour12: false });
  }
  tickClock();
  setInterval(tickClock, 1000);

  // Re-render every 30s so "updated Xm ago" stays fresh even with no new data.
  setInterval(renderCatalog, 30000);

  // ---------- Init ----------
  showScreen("gate");
  initAuth();
})();
