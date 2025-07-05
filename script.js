// 🔒 Bloque retour arrière renforcé et anti-spam
(function() {
  history.pushState(null, null, location.href);
  window.addEventListener("popstate", () => {
    history.pushState(null, null, location.href);
    alert("Vous ne pouvez pas revenir en arrière !");
  });
})();

const SERVER_URL = "https://royale-casino-server.onrender.com";

// Loader
function showLoader(callback) {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
  setTimeout(() => {
    if (loader) loader.classList.add("hidden");
    callback();
  }, 1000);
}

// Connexion
function connexion() {
  const nom = document.getElementById("nom").value.trim();
  const prenom = document.getElementById("prenom").value.trim();
  if (!nom || !prenom) {
    alert("Remplissez nom et prénom");
    return;
  }
  localStorage.setItem("joueur", JSON.stringify({ nom, prenom, codeValide: false, aJoue: false }));
  showLoader(() => window.location.href = "code.html");
}

// Vérifier le code
function verifierCode() {
  const code = document.getElementById("code").value.trim();
  fetch(`${SERVER_URL}/api/admin/codes`)
    .then(res => res.json())
    .then(codes => {
      const index = codes.findIndex(c => c.code === code && !c.used);
      if (index === -1) {
        alert("❌ Code invalide ou déjà utilisé");
        return;
      }
      let joueur = JSON.parse(localStorage.getItem("joueur"));
      joueur.codeValide = true;
      localStorage.setItem("joueur", JSON.stringify(joueur));
      showLoader(() => window.location.href = "choix.html");
    })
    .catch(() => alert("Erreur serveur"));
}

// Sécurité accès manuel
document.addEventListener("DOMContentLoaded", () => {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  const page = location.pathname.split("/").pop();
  if (page === "code.html" && (!joueur || !joueur.nom || !joueur.prenom)) {
    alert("Connexion requise");
    window.location.href = "index.html";
  }
  if (page === "choix.html" && (!joueur || !joueur.codeValide)) {
    alert("Accès refusé");
    window.location.href = "index.html";
  }
  if (["roulette.html", "machine.html"].includes(page) &&
      (!joueur || !joueur.codeValide || joueur.aJoue)) {
    alert("Accès refusé");
    window.location.href = "index.html";
  }
});

function checkSiDejaJoue() {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  if (joueur.aJoue) {
    alert("Vous avez déjà joué !");
    window.location.href = "index.html";
    return true;
  }
  return false;
}

function enregistrerGagnant(gain, gagne) {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  if (gagne) {
    fetch(`${SERVER_URL}/api/player/save-gagnant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: joueur.nom, prenom: joueur.prenom, gain })
    }).catch(() => alert("Erreur enregistrement gagnant"));
  }
  joueur.aJoue = true;
  localStorage.setItem("joueur", JSON.stringify(joueur));
}

// Machine
function jouerMachine() {
  if (checkSiDejaJoue()) return;
  fetch(`${SERVER_URL}/api/admin/prob`)
    .then(res => res.json())
    .then(data => {
      const gagne = Math.random() * 100 < data.probMachine;
      const gain = gagne ? data.gainMachine : Math.floor(Math.random() * 5000);
      document.getElementById("result").innerHTML = `🎯 Gain : ${gain} €`;
      enregistrerGagnant(gain, gagne);
    })
    .catch(() => alert("Erreur serveur"));
}

// Roulette
function jouerRoulette() {
  if (checkSiDejaJoue()) return;
  fetch(`${SERVER_URL}/api/admin/prob`)
    .then(res => res.json())
    .then(data => {
      const gagne = Math.random() * 100 < data.probRoulette;
      const gain = gagne ? data.gainRoulette : Math.floor(Math.random() * 5000);
      document.getElementById("result").innerHTML = `${gagne ? "🎉 Gagné !" : "😢 Perdu !"} Gain : ${gain} €`;
      enregistrerGagnant(gain, gagne);
    })
    .catch(() => alert("Erreur serveur"));
}

// ADMIN
function adminLogin() {
  const pass = document.getElementById("adminPass").value;
  fetch(`${SERVER_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pass })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        document.getElementById("adminPanel").classList.remove("hidden");
        loadCodes();
        loadGagnants();
      } else {
        alert("Mot de passe incorrect");
      }
    })
    .catch(() => alert("Erreur serveur"));
}

function saveProbabilites() {
  const probMachine = parseInt(document.getElementById("probMachine").value);
  const probRoulette = parseInt(document.getElementById("probRoulette").value);
  const gainMachine = parseInt(document.getElementById("gainMachine").value);
  const gainRoulette = parseInt(document.getElementById("gainRoulette").value);
  if ([probMachine, probRoulette, gainMachine, gainRoulette].some(isNaN)) {
    alert("Valeurs invalides");
    return;
  }
  fetch(`${SERVER_URL}/api/admin/save-prob`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ probMachine, probRoulette, gainMachine, gainRoulette })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) alert("Probas/gains enregistrés !");
      else alert("Erreur serveur");
    })
    .catch(() => alert("Erreur serveur"));
}

function genererCode() {
  fetch(`${SERVER_URL}/api/admin/generate-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) loadCodes();
    });
}

function loadCodes() {
  fetch(`${SERVER_URL}/api/admin/codes`)
    .then(res => res.json())
    .then(codes => {
      const container = document.getElementById("codesList");
      container.innerHTML = "";
      codes.forEach(c => {
        const div = document.createElement("div");
        div.textContent = `${c.code} - ${c.used ? "Utilisé" : "Valide"}`;
        const btn = document.createElement("button");
        btn.textContent = "Supprimer";
        btn.onclick = () => {
          if (confirm(`Supprimer le code ${c.code} ?`)) {
            fetch(`${SERVER_URL}/api/admin/delete-code`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code: c.code })
            }).then(() => loadCodes());
          }
        };
        div.appendChild(btn);
        container.appendChild(div);
      });
    });
}

function loadGagnants() {
  fetch(`${SERVER_URL}/api/admin/gagnants`)
    .then(res => res.json())
    .then(gagnants => {
      document.getElementById("gagnantsList").innerHTML = gagnants.map(g => `${g.nom} ${g.prenom} - ${g.gain} €`).join('<br>');
    });
}
