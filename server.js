const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*" // Remplace par ton domaine front si tu veux restreindre, ex : "https://TON_FRONT.render.com"
}));
app.use(bodyParser.json());

const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = []; // Ex: { code: "ABC123", used: false }
let gagnants = []; // Ex: { nom: "", prenom: "", gain: 0 }
let probas = { probMachine: 10, probRoulette: 10 }; // Par défaut 10% de victoire

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

// Ajouter un gagnant
app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  if (nom && prenom && typeof gain === "number") {
    gagnants.push({ nom, prenom, gain });
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: "Données invalides" });
  }
});

// Effacer les gagnants
app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

// Récupérer les probabilités
app.get("/api/admin/prob", (req, res) => {
  res.json(probas);
});

// Modifier les probabilités
app.post("/api/admin/save-prob", (req, res) => {
  const { probMachine, probRoulette } = req.body;
  if (
    typeof probMachine === "number" && probMachine >= 0 && probMachine <= 100 &&
    typeof probRoulette === "number" && probRoulette >= 0 && probRoulette <= 100
  ) {
    probas.probMachine = probMachine;
    probas.probRoulette = probRoulette;
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
