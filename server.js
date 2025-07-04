const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*" // Tu peux remplacer par ton domaine front si tu veux : ex "https://TON_FRONT.neocities.org"
}));
app.use(bodyParser.json());

const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = [];
let gagnants = [];

let probConfig = {
  probMachine: 10,
  probRoulette: 10,
  gainMachine: 50000,
  gainRoulette: 50000
};

// Connexion admin
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: "Mot de passe incorrect" });
  }
});

// Générer un code
app.post("/api/admin/generate-code", (req, res) => {
  const code = Math.random().toString(36).substr(2, 6).toUpperCase();
  codes.push({ code, used: false });
  res.json({ success: true, code });
});

// Liste des codes
app.get("/api/admin/codes", (req, res) => {
  res.json(codes);
});

// Supprimer un code
app.post("/api/admin/delete-code", (req, res) => {
  const { code } = req.body;
  codes = codes.filter(c => c.code !== code);
  res.json({ success: true });
});

// Liste des gagnants
app.get("/api/admin/gagnants", (req, res) => {
  res.json(gagnants);
});

// Enregistrer un gagnant (depuis joueur)
app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  if (nom && prenom && gain >= 0) {
    gagnants.push({ nom, prenom, gain });
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Données invalides" });
  }
});

// Clear gagnants
app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

// Obtenir les probas/gains
app.get("/api/admin/prob", (req, res) => {
  res.json(probConfig);
});

// Sauvegarder les probas/gains
app.post("/api/admin/save-prob", (req, res) => {
  const { probMachine, probRoulette, gainMachine, gainRoulette } = req.body;
  if (
    probMachine >= 0 && probMachine <= 100 &&
    probRoulette >= 0 && probRoulette <= 100 &&
    gainMachine >= 0 &&
    gainRoulette >= 0
  ) {
    probConfig = { probMachine, probRoulette, gainMachine, gainRoulette };
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Valeurs invalides" });
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ Serveur Royale Casino actif !");
});

app.listen(PORT, () => {
  console.log(`🎲 Serveur lancé sur le port ${PORT}`);
});
