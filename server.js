const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = [];
let gagnants = [];
let config = { probMachine: 10, probRoulette: 10, gainMachine: 50000, gainRoulette: 50000 };

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: "Mot de passe incorrect" });
  }
});

// Générer code
app.post("/api/admin/generate-code", (req, res) => {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  codes.push({ code, used: false });
  res.json({ success: true, code });
});

// Codes list
app.get("/api/admin/codes", (req, res) => {
  res.json(codes);
});

// Delete code
app.post("/api/admin/delete-code", (req, res) => {
  const { code } = req.body;
  codes = codes.filter(c => c.code !== code);
  res.json({ success: true });
});

// Gagnants
app.get("/api/admin/gagnants", (req, res) => {
  res.json(gagnants);
});

app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  gagnants.push({ nom, prenom, gain });
  res.json({ success: true });
});

// Probas
app.get("/api/admin/prob", (req, res) => {
  res.json(config);
});

app.post("/api/admin/save-prob", (req, res) => {
  const { probMachine, probRoulette, gainMachine, gainRoulette } = req.body;
  if (
    [probMachine, probRoulette, gainMachine, gainRoulette].some(v => typeof v !== "number")
  ) {
    return res.status(400).json({ success: false, message: "Données invalides" });
  }
  config = { probMachine, probRoulette, gainMachine, gainRoulette };
  res.json({ success: true });
});

// Test route
app.get("/", (req, res) => {
  res.send("🎲 Serveur Royale Casino actif !");
});

app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur le port ${PORT}`);
});
