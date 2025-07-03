const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "*" // Remplace "*" par ton domaine de front si tu veux renforcer : ex "https://TON_FRONT.neocities.org"
}));
app.use(bodyParser.json());

const ADMIN_PASSWORD = "LECASINOMEILLEURTAHLESFOURPFRANCE";
let codes = []; // Ex: { code: "ABC123", used: false }
let gagnants = []; // Ex: { nom: "", prenom: "", gain: 0 }

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
app.post("/api/admin/add-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  gagnants.push({ nom, prenom, gain });
  res.json({ success: true });
});

// Clear gagnants
app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ Serveur Royale Casino actif !");
});

app.listen(PORT, () => {
  console.log(`🎲 Serveur lancé sur le port ${PORT}`);
});
