const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité CORS (tu peux remplacer * par ton domaine front pour restreindre)
app.use(cors({
  origin: "*"
}));
app.use(bodyParser.json());

// Données en mémoire (à remplacer par une BDD si tu veux persister)
const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = []; // { code, used }
let gagnants = []; // { nom, prenom, gain }
let probConfig = {
  probMachine: 10,     // % victoire machine
  probRoulette: 10,    // % victoire roulette
  gainMachine: 50000,  // gain max machine
  gainRoulette: 50000  // gain max roulette
};

// === ROUTES ADMIN ===

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

// Lister les codes
app.get("/api/admin/codes", (req, res) => {
  res.json(codes);
});

// Supprimer un code
app.post("/api/admin/delete-code", (req, res) => {
  const { code } = req.body;
  codes = codes.filter(c => c.code !== code);
  res.json({ success: true });
});

// Lister les gagnants
app.get("/api/admin/gagnants", (req, res) => {
  res.json(gagnants);
});

// Ajouter un gagnant
app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  if (nom && prenom && gain >= 0) {
    gagnants.push({ nom, prenom, gain });
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Données invalides" });
  }
});

// Vider gagnants
app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

// Obtenir les probabilités / gains
app.get("/api/admin/prob", (req, res) => {
  res.json(probConfig);
});

// Sauver les probabilités / gains
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

// === ROUTE TEST SERVEUR ===
app.get("/", (req, res) => {
  res.send("✅ Serveur Royale Casino actif !");
});

// Lancer serveur
app.listen(PORT, () => {
  console.log(`🎲 Serveur lancé sur le port ${PORT}`);
});
