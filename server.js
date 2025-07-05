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
let probMachine = 10;
let probRoulette = 10;
let gainMachine = 50000;
let gainRoulette = 50000;

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, message: "Mot de passe incorrect" });
  }
});

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

app.get("/api/admin/gagnants", (req, res) => res.json(gagnants));

app.post("/api/player/save-gagnant", (req, res) => {
  const { nom, prenom, gain } = req.body;
  gagnants.push({ nom, prenom, gain });
  res.json({ success: true });
});

app.post("/api/admin/clear-gagnants", (req, res) => {
  gagnants = [];
  res.json({ success: true });
});

app.get("/api/admin/prob", (req, res) => {
  res.json({ probMachine, probRoulette, gainMachine, gainRoulette });
});

app.post("/api/admin/save-prob", (req, res) => {
  const { probMachine: pM, probRoulette: pR, gainMachine: gM, gainRoulette: gR } = req.body;
  probMachine = pM;
  probRoulette = pR;
  gainMachine = gM;
  gainRoulette = gR;
  res.json({ success: true });
});

app.get("/", (req, res) => res.send("✅ Serveur Royale Casino actif !"));

app.listen(PORT, () => console.log(`🎲 Serveur lancé sur le port ${PORT}`));
