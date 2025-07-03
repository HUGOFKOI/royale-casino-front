// 🔒 Bloque retour arrière renforcé
(function() {
  history.pushState(null, null, location.href);
  window.onpopstate = () => {
    history.pushState(null, null, location.href);
    alert("Vous ne pouvez pas revenir en arrière !");
  };
})();

// 🌐 Adresse de ton serveur Render
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
      // Passe à la suite sans message inutile
      let joueur = JSON.parse(localStorage.getItem("joueur"));
      joueur.codeValide = true;
      localStorage.setItem("joueur", JSON.stringify(joueur));
      showLoader(() => window.location.href = "choix.html");
    })
    .catch(() => alert("Erreur serveur"));
}

// Sécurité : bloque accès manuel aux pages
document.addEventListener("DOMContentLoaded", () => {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  const page = location.pathname.split("/").pop();

  if (page === "code.html") {
    if (!joueur || !joueur.nom || !joueur.prenom) {
      alert("Connexion requise");
      window.location.href = "index.html";
    }
  }

  if (["choix.html"].includes(page)) {
    if (!joueur || !joueur.codeValide) {
      alert("Accès refusé");
      window.location.href = "index.html";
    }
  }

  if (["roulette.html", "machine.html"].includes(page)) {
    if (!joueur || !joueur.codeValide || joueur.aJoue) {
      alert("Accès refusé");
      window.location.href = "index.html";
    }
  }
});

// Empêche de rejouer
function checkSiDejaJoue() {
  const joueur = JSON.parse(localStorage.getItem("joueur"));
  if (joueur.aJoue) {
    alert("Vous avez déjà joué !");
    window.location.href = "index.html";
    return true;
  }
  return false;
}

// Enregistrer un gagnant
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

// Machine à sous
function jouerMachine() {
  if (checkSiDejaJoue()) return;
  if (window.enCoursMachine) return;
  window.enCoursMachine = true;

  const bouton = document.getElementById("machineButton");
  if (bouton) bouton.disabled = true;

  const symbols = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
  let slots = ['', '', ''];
  let steps = 20;
  let current = 0;

  function spin() {
    slots = slots.map(() => symbols[Math.floor(Math.random() * symbols.length)]);
    document.getElementById("slots").innerHTML = slots.join(' ');
    current++;
    if (current < steps) {
      setTimeout(spin, 100);
    } else {
      const gagne = (slots[0] === slots[1] && slots[1] === slots[2]);
      const gain = gagne ? 50000 : Math.floor(Math.random() * 50000);
      document.getElementById("result").innerHTML = `🎯 Gain : ${gain} €`;
      enregistrerGagnant(gain, gagne);
      window.enCoursMachine = false;
    }
  }

  spin();
}

// Roulette
function jouerRoulette() {
  if (checkSiDejaJoue()) return;
  if (window.enCoursRoulette) return;
  window.enCoursRoulette = true;

  const bouton = document.getElementById("rouletteButton");
  if (bouton) bouton.disabled = true;

  const choixNumero = document.getElementById("choixNumero")?.value.trim();
  const choixCouleur = document.getElementById("choixCouleur")?.value;
  const numChoisi = choixNumero ? parseInt(choixNumero) : null;

  if (numChoisi !== null && (isNaN(numChoisi) || numChoisi < 0 || numChoisi > 36)) {
    alert("Numéro invalide (0-36)");
    if (bouton) bouton.disabled = false;
    window.enCoursRoulette = false;
    return;
  }

  const canvas = document.getElementById("rouletteCanvas");
  const ctx = canvas.getContext("2d");
  const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
  const colors = {0: 'green'};
  numbers.forEach(n => {
    if (n !== 0) colors[n] = n % 2 === 0 ? 'black' : 'red';
  });

  let rotation = 0;
  const totalRotation = Math.PI * 10 + Math.random() * Math.PI * 4;
  let start = null;

  function draw(rot) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = cx;
    const anglePer = (2 * Math.PI) / numbers.length;

    for (let i = 0; i < numbers.length; i++) {
      const startAngle = i * anglePer + rot;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + anglePer);
      ctx.fillStyle = colors[numbers[i]];
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + anglePer / 2);
      ctx.fillStyle = "#fff";
      ctx.font = "12px Arial";
      ctx.textAlign = "right";
      ctx.fillText(numbers[i], radius - 10, 0);
      ctx.restore();
    }
  }

  function animate(timestamp) {
    if (!start) start = timestamp;
    const elapsed = timestamp - start;
    const duration = 4000;
    const progress = Math.min(elapsed / duration, 1);
    rotation = totalRotation * progress;

    draw(rotation);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      draw(totalRotation);
      const finalAngle = totalRotation % (2 * Math.PI);
      const sectorAngle = (2 * Math.PI) / numbers.length;
      const index = Math.floor((numbers.length - (finalAngle / sectorAngle)) % numbers.length);
      const winNumber = numbers[index];
      const winColor = winNumber === 0 ? "Vert" : (colors[winNumber] === "red" ? "Rouge" : "Noir");

      let gagne = false;
      if ((numChoisi !== null && numChoisi === winNumber) || (choixCouleur && choixCouleur === winColor)) {
        gagne = true;
      }

      document.getElementById("result").innerHTML = `🎯 Résultat : ${winNumber} (${winColor})<br>${gagne ? "🎉 Gagné !" : "😢 Perdu !"}`;
      const gain = Math.floor(Math.random() * 50000) + 1;
      enregistrerGagnant(gain, gagne);
      window.enCoursRoulette = false;
    }
  }

  requestAnimationFrame(animate);
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
