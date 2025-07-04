const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*" // Remplace par ton domaine front si tu veux sécuriser ex: "https://TON_FRONT"
}));
app.use(bodyParser.json());

const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = [];
let gagnants = [];
let config = {
  machine: {
    probas: { win: 0.1 }, // 10% par défaut
    gains: { win: 50000, loseMin: 0, loseMax: 5000 }
  },
  roulette: {
    probas: { win: 0.1 },
    gains: { win: 50000, loseMin: 0, loseMax: 5000 }
  }
};

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: "Mot de passe incorrect" });
  }
});

// Set config (probabilités / gains)
app.post("/api/admin/set-config", (req, res) => {
  const { machine, roulette } = req.body;
  if (machine && roulette) {
    config.machine = machine;
    config.roulette = roulette;
    res.json({ success: true, message: "Configuration mise à jour" });
  } else {
    res.status(400).json({ success: false, message: "Données incomplètes" });
  }
});

// Get config (pour affichage si tu veux plus tard)
app.get("/api/admin/config", (req, res) => {
  res.json(config);
});

// Code routes
app.post("/api/admin/generate-code", (req, res) => {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  codes.push({ code, used: false });
  res.json({ success: true, code });
});

app.get("/api/admin/codes", (req, res) => res.json(codes));

app.post("/api/admin/delete-code", (req, res) => {
  const { code } = req.body;
  codes = codes.filter(c => c.code !== code);
  res.json({ success: true });
});

// Gagnants
app.get("/api/admin/gagnants", (req, res) => res.json(gagnants));

app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  if (nom && prenom) {
    gagnants.push({ nom, prenom, gain });
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Données invalides" });
  }
});

app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

app.get("/", (req, res) => {
  res.send("✅ Serveur Royale Casino actif !");
});

app.listen(PORT, () => {
  console.log(`🎲 Serveur lancé sur le port ${PORT}`);
});
