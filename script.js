const SERVER_URL = "https://royale-casino-server.onrender.com";

// 🔒 Bloque retour arrière (renforcé)
(function() {
  history.pushState(null, null, location.href);
  window.onpopstate = () => {
    history.pushState(null, null, location.href);
    alert("Vous ne pouvez pas revenir en arrière !");
  };
})();

// Loader
function showLoader(callback) {
  const loader = document.getElementById("loader");
  if (loader) loader.classList.remove("hidden");
  setTimeout(() => {
    if (loader) loader.classList.add("hidden");
    callback();
  }, 1000);
}

// Connexion joueur
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

// Vérification code joueur
function verifierCode() {
  const code = document.getElementById("code").value.trim();
  fetch(`${SERVER_URL}/api/admin/codes`)
    .then(res => res.json())
    .then(codes => {
      const index = codes.findIndex(c => c.code === code && !c.used);
      if (index === -1) {
        alert("Code invalide ou déjà utilisé");
        return;
      }
      alert("Code accepté !");
      let joueur = JSON.parse(localStorage.getItem("joueur"));
      joueur.codeValide = true;
      localStorage.setItem("joueur", JSON.stringify(joueur));
      showLoader(() => window.location.href = "choix.html");
    })
    .catch(() => alert("Erreur serveur"));
}

// Empêche re-jeu
function checkSiDejaJoue() {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  if (joueur.aJoue) {
    alert("Vous avez déjà joué !");
    window.location.href = "index.html";
    return true;
  }
  return false;
}

// Enregistre gagnant
function enregistrerGagnant(gain, gagne) {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  if (gagne) {
    fetch(`${SERVER_URL}/api/admin/add-gagnant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nom: joueur.nom, prenom: joueur.prenom, gain })
    }).catch(() => alert("Erreur serveur"));
  }
  joueur.aJoue = true;
  localStorage.setItem("joueur", JSON.stringify(joueur));
}

// ADMIN : connexion
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

// ADMIN : générer un code
function genererCode() {
  fetch(`${SERVER_URL}/api/admin/generate-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert(`Code généré : ${data.code}`);
      loadCodes();
    } else {
      alert("Erreur génération code");
    }
  })
  .catch(() => alert("Erreur serveur"));
}

// ADMIN : charger les codes
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
        btn.onclick = () => supprimerCode(c.code);
        div.appendChild(btn);
        container.appendChild(div);
      });
    })
    .catch(() => alert("Erreur serveur"));
}

// ADMIN : supprimer un code
function supprimerCode(code) {
  fetch(`${SERVER_URL}/api/admin/delete-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  })
  .then(() => loadCodes())
  .catch(() => alert("Erreur serveur"));
}

// ADMIN : charger gagnants
function loadGagnants() {
  fetch(`${SERVER_URL}/api/admin/gagnants`)
    .then(res => res.json())
    .then(gagnants => {
      const container = document.getElementById("gagnantsList");
      container.innerHTML = gagnants.map(g => `${g.nom} ${g.prenom} - ${g.gain} €`).join("<br>");
    })
    .catch(() => alert("Erreur serveur"));
}

// ADMIN : clear gagnants
function clearGagnants() {
  if (confirm("Effacer la liste des gagnants ?")) {
    fetch(`${SERVER_URL}/api/admin/clear-gagnants`, {
      method: "POST"
    })
    .then(() => loadGagnants())
    .catch(() => alert("Erreur serveur"));
  }
}
