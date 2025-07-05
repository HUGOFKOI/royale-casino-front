const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*" // Remplace * par ton domaine front si besoin, ex : "https://TON_FRONT_URL"
}));
app.use(bodyParser.json());

// Données en mémoire
const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = []; // { code, used }
let gagnants = []; // { nom, prenom, gain }
let config = {
  probMachine: 10,
  gainMachine: 50000,
  probRoulette: 10,
  gainRoulette: 50000
};

// ➡️ Connexion admin
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: "Mot de passe incorrect" });
  }
});

// ➡️ Gérer les codes
app.post("/api/admin/generate-code", (req, res) => {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  codes.push({ code, used: false });
  res.json({ success: true, code });
});

app.get("/api/admin/codes", (req, res) => {
  res.json(codes);
});

app.post("/api/admin/delete-code", (req, res) => {
  const { code } = req.body;
  codes = codes.filter(c => c.code !== code);
  res.json({ success: true });
});

// ➡️ Gagnants
app.get("/api/admin/gagnants", (req, res) => {
  res.json(gagnants);
});

app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  if (nom && prenom && gain >= 0) {
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

// ➡️ Config : probas et gains
app.post("/api/admin/save-prob", (req, res) => {
  const { probMachine, gainMachine, probRoulette, gainRoulette } = req.body;
  if (
    typeof probMachine === 'number' && probMachine >= 0 && probMachine <= 100 &&
    typeof gainMachine === 'number' && gainMachine >= 0 &&
    typeof probRoulette === 'number' && probRoulette >= 0 && probRoulette <= 100 &&
    typeof gainRoulette === 'number' && gainRoulette >= 0
  ) {
    config = { probMachine, gainMachine, probRoulette, gainRoulette };
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Données invalides" });
  }
});

app.get("/api/admin/prob", (req, res) => {
  res.json(config);
});

// ➡️ Vérif code joueur
app.post("/api/player/verify-code", (req, res) => {
  const { code } = req.body;
  const found = codes.find(c => c.code === code && !c.used);
  if (found) {
    found.used = true;
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Code invalide ou déjà utilisé" });
  }
});

// ➡️ Test route
app.get("/", (req, res) => {
  res.send("✅ Serveur Royale Casino actif !");
});

// ➡️ Start
app.listen(PORT, () => {
  console.log(`🎲 Serveur lancé sur le port ${PORT}`);
});
