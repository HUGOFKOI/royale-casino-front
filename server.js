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
let configProba = {
  probMachine: 10,
  probRoulette: 10,
  gainMachine: 50000,
  gainRoulette: 50000
};

// Authentification admin
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

// Liste codes
app.get("/api/admin/codes", (req, res) => {
  res.json(codes);
});

// Supprimer un code
app.post("/api/admin/delete-code", (req, res) => {
  const { code } = req.body;
  codes = codes.filter(c => c.code !== code);
  res.json({ success: true });
});

// Liste gagnants
app.get("/api/admin/gagnants", (req, res) => {
  res.json(gagnants);
});

// Ajouter gagnant
app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  gagnants.push({ nom, prenom, gain });
  res.json({ success: true });
});

// Effacer gagnants
app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

// Sauvegarde proba + gains
app.post("/api/admin/save-prob", (req, res) => {
  const { probMachine, probRoulette, gainMachine, gainRoulette } = req.body;
  if (
    typeof probMachine !== "number" || typeof probRoulette !== "number" ||
    typeof gainMachine !== "number" || typeof gainRoulette !== "number"
  ) {
    return res.status(400).json({ success: false, message: "Données invalides" });
  }
  configProba = { probMachine, probRoulette, gainMachine, gainRoulette };
  res.json({ success: true });
});

// Retour config proba
app.get("/api/admin/prob", (req, res) => {
  res.json(configProba);
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ Serveur Royale Casino actif !");
});

app.listen(PORT, () => {
  console.log(`🎲 Serveur lancé sur le port ${PORT}`);
});
