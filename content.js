// ===================================================
// MookyPlus - Content Script (Option Absolute Minimal)
// ===================================================

console.log("[MookyPlus] Script chargé avec succès !");

document.addEventListener("DOMContentLoaded", () => {
  loadSavedBackground();
  if (localStorage.getItem("mookyplus_absolute_minimal") === "true") {
    enableAbsoluteMinimal(false);
  }
});

// Appliquer le fond
function setAndSaveBackground(bgValue) {
  const targets = [document.body, document.querySelector('.desktop-shell'), document.querySelector('.app-shell')];

  if (bgValue === "none") {
    targets.forEach(el => { if (el) el.style.setProperty('background', 'none', 'important'); });
    localStorage.removeItem("mookyplus_custom_bg");
  } else {
    targets.forEach(el => {
      if (el) {
        el.style.setProperty('background', bgValue, 'important');
        el.style.setProperty('background-size', 'cover', 'important');
        el.style.setProperty('background-attachment', 'fixed', 'important');
        el.style.setProperty('background-position', 'center', 'important');
      }
    });
    localStorage.setItem("mookyplus_custom_bg", bgValue);
  }
}

function loadSavedBackground() {
  const savedBg = localStorage.getItem("mookyplus_custom_bg");
  if (savedBg) setAndSaveBackground(savedBg);
}

// Bouton MookyPlus
function addCustomButton() {
  const topActions = document.querySelector(".topbar .top-actions");

  if (topActions && !document.getElementById("mooky-plus-btn")) {
    const customButton = document.createElement("a");
    customButton.id = "mooky-plus-btn";
    customButton.className = "top-pill home-top-action";
    customButton.style.cssText =
      "border-radius:15px; background-color:#7289da; color:#fff; cursor:pointer; display:flex; align-items:center; gap:6px; padding:4px 10px; font-weight:bold; font-size:13px; text-decoration:none;";

    const logoImg = document.createElement("img");
    logoImg.src = chrome.runtime.getURL("logo.jpg");
    logoImg.style.cssText = "width:20px; height:20px; border-radius:50%; object-fit:cover;";

    const btnText = document.createElement("span");
    btnText.innerText = "M+";

    customButton.appendChild(logoImg);
    customButton.appendChild(btnText);

    customButton.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMookyPlusModal();
    });

    const avatarLink = topActions.querySelector(".top-avatar-link");
    if (avatarLink) {
      topActions.insertBefore(customButton, avatarLink);
    } else {
      topActions.appendChild(customButton);
    }
  }
}

// Fonction : Activer / Désactiver le mode "Absolute Minimal"
function enableAbsoluteMinimal(save = true) {
  if (save) localStorage.setItem("mookyplus_absolute_minimal", "true");

  // Désactiver toutes les feuilles de style CSS
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      document.styleSheets[i].disabled = true;
    } catch (e) {
      // Ignorer les erreurs de règles cross-origin
    }
  }

  // Cacher la modale si elle est ouverte
  const modal = document.getElementById("mookyplus-modal");
  if (modal) modal.style.display = "none";

  // Ajouter un bouton flottant brut pour pouvoir restaurer les styles
  if (!document.getElementById("mooky-restore-styles-btn")) {
    const restoreBtn = document.createElement("button");
    restoreBtn.id = "mooky-restore-styles-btn";
    restoreBtn.innerText = "⚠️ Quitter Absolute Minimal";
    restoreBtn.style.cssText = "position:fixed; top:10px; right:10px; z-index:9999999; padding:8px 12px; background:#e74c3c; color:#fff; font-weight:bold; border:none; cursor:pointer;";
    restoreBtn.addEventListener("click", () => disableAbsoluteMinimal());
    document.body.appendChild(restoreBtn);
  }
}

function disableAbsoluteMinimal() {
  localStorage.removeItem("mookyplus_absolute_minimal");

  // Réactiver toutes les feuilles de style CSS
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      document.styleSheets[i].disabled = false;
    } catch (e) {}
  }

  const restoreBtn = document.getElementById("mooky-restore-styles-btn");
  if (restoreBtn) restoreBtn.remove();
}

// Fenêtre Modale de Configuration
function toggleMookyPlusModal() {
  let modal = document.getElementById("mookyplus-modal");

  if (modal) {
    modal.style.display = modal.style.display === "none" ? "flex" : "none";
    return;
  }

  modal = document.createElement("div");
  modal.id = "mookyplus-modal";
  modal.className = "mookyplus-modal-overlay";

  modal.innerHTML = `
    <div class="mookyplus-modal-content">
      <div class="mookyplus-modal-header">
        <h2>✨ Configuration MookyPlus</h2>
        <button id="mookyplus-close-btn">&times;</button>
      </div>

      <div class="mookyplus-modal-body">
        <!-- Section Thèmes & Styles Minimalistes -->
        <section class="mookyplus-section">
          <h3>⚡ Thèmes & Styles Spéciaux</h3>
          <button id="mooky-absolute-minimal-btn" class="mookyplus-action-btn" style="background-color: #34495e;">Mode Absolute Minimal (HTML Brut)</button>
        </section>

        <!-- Section Arrière-plan -->
        <section class="mookyplus-section">
          <h3>🎨 Arrière-plan Personnalisé</h3>
          <div class="mookyplus-presets">
            <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #0f2027, #203a43, #2c5364)">Sombre Synthwave</button>
            <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #654ea3, #eaafc8)">Violet Doux</button>
            <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #11998e, #38ef7d)">Émeraude</button>
            <button class="mookyplus-preset-btn" data-bg="none">Par défaut</button>
          </div>

          <label>Dégradé personnalisé :</label>
          <div class="mookyplus-gradient-picker">
            <input type="color" id="mooky-color1" value="#7289da">
            <input type="color" id="mooky-color2" value="#00f3ff">
            <button id="mooky-apply-gradient">Appliquer</button>
          </div>

          <label>Importer une image :</label>
          <input type="file" id="mooky-bg-file" accept="image/*">
        </section>

        <!-- Section Barre Latérale -->
        <section class="mookyplus-section">
          <h3>🔀 Réorganisation des Éléments</h3>
          <button id="mooky-toggle-drag" class="mookyplus-action-btn">Activer le Glisser-Déposer</button>
        </section>

        <!-- Section Console Terminal -->
        <section class="mookyplus-section">
          <h3>💻 Invite de Commandes MookyPlus</h3>
          <button id="mooky-open-terminal" class="mookyplus-action-btn" style="background-color:#00b894;">Ouvrir la Console MookyTerm</button>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("mookyplus-close-btn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Événement du bouton Absolute Minimal
  document.getElementById("mooky-absolute-minimal-btn").addEventListener("click", () => {
    enableAbsoluteMinimal();
  });

  modal.querySelectorAll(".mookyplus-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => setAndSaveBackground(btn.getAttribute("data-bg")));
  });

  document.getElementById("mooky-apply-gradient").addEventListener("click", () => {
    const c1 = document.getElementById("mooky-color1").value;
    const c2 = document.getElementById("mooky-color2").value;
    setAndSaveBackground(`linear-gradient(135deg, ${c1}, ${c2})`);
  });

  document.getElementById("mooky-bg-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAndSaveBackground(`url('${event.target.result}')`);
      reader.readAsDataURL(file);
    }
  });

  document.getElementById("mooky-toggle-drag").addEventListener("click", (e) => toggleDragAndDrop(e.target));
  document.getElementById("mooky-open-terminal").addEventListener("click", () => {
    modal.style.display = "none";
    toggleTerminal();
  });
}

// Invite de Commandes (MookyTerm)
function toggleTerminal() {
  let term = document.getElementById("mooky-terminal");
  if (term) {
    term.style.display = term.style.display === "none" ? "flex" : "none";
    if (term.style.display === "flex") document.getElementById("mooky-term-input").focus();
    return;
  }

  term = document.createElement("div");
  term.id = "mooky-terminal";
  term.className = "mooky-terminal-window";

  term.innerHTML = `
    <div class="mooky-term-header">
      <span>>_ MookyTerm v1.0</span>
      <button id="mooky-term-close">&times;</button>
    </div>
    <div class="mooky-term-output" id="mooky-term-output">
      <div>Bienvenue sur <b>MookyTerm</b> ! Tapez <span class="term-highlight">/help</span> pour afficher la liste des commandes.</div>
    </div>
    <div class="mooky-term-input-line">
      <span class="term-prompt">mooky></span>
      <input type="text" id="mooky-term-input" placeholder="Saisir une commande..." autocomplete="off">
    </div>
  `;

  document.body.appendChild(term);

  document.getElementById("mooky-term-close").addEventListener("click", () => term.style.display = "none");

  const input = document.getElementById("mooky-term-input");
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const cmd = input.value.trim();
      if (cmd) executeCommand(cmd);
      input.value = "";
    }
  });
}

// Logique des Commandes (Ajout de /minimal)
function executeCommand(cmd) {
  const output = document.getElementById("mooky-term-output");
  const log = (text, isHtml = false) => {
    const line = document.createElement("div");
    if (isHtml) line.innerHTML = text;
    else line.textContent = text;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
  };

  log(`mooky> ${cmd}`);

  const parts = cmd.split(" ");
  const mainCmd = parts[0].toLowerCase();

  switch (mainCmd) {
    case "/help":
      log("📋 <b>Commandes disponibles :</b>", true);
      log("/help - Affiche ce menu d'aide");
      log("/minimal - Active le mode Absolute Minimal");
      log("/clear - Efface le terminal");
      log("/stats - Affiche les statistiques de la page");
      log("/theme <dark|cyber|neon|reset> - Change le thème rapidement");
      log("/matrix - Active l'effet Matrix");
      log("/quote - Citation motivante");
      break;

    case "/minimal":
      log("⚡ Mode Absolute Minimal activé.");
      enableAbsoluteMinimal();
      break;

    case "/clear":
    case "/cls":
      output.innerHTML = "";
      break;

    case "/stats":
      const postsCount = document.querySelectorAll("article.post").length;
      log(`📊 <b>Statistiques :</b>`, true);
      log(`• Publications : ${postsCount}`);
      log(`• URL : ${window.location.href}`);
      break;

    case "/theme":
      const theme = parts[1];
      if (theme === "dark") setAndSaveBackground("linear-gradient(135deg, #121212, #1f1f1f)");
      else if (theme === "cyber") setAndSaveBackground("linear-gradient(135deg, #050505, #00f3ff)");
      else if (theme === "neon") setAndSaveBackground("linear-gradient(135deg, #2b0036, #ff007f)");
      else if (theme === "reset") setAndSaveBackground("none");
      else log("Thèmes : dark, cyber, neon, reset");
      break;

    case "/matrix":
      log("🟢 Mode Matrix activé !");
      setAndSaveBackground("linear-gradient(180deg, #001100, #003300)");
      break;

    case "/quote":
      const quotes = [
        "« La meilleure manière de se lancer, c’est d’arrêter de parler et commencer à agir. » — Walt Disney",
        "« Le succès est la somme de petits efforts, répétés jour après jour. » — Robert Collier",
        "« Ce n’est pas la plus forte des espèces qui survit, mais celle qui s’adapte le mieux. » — Charles Darwin"
      ];
      log(`💬 ${quotes[Math.floor(Math.random() * quotes.length)]}`);
      break;

    default:
      log(`❌ Commande inconnue : "${cmd}". Tapez /help.`);
      break;
  }
}

// Drag & Drop
let dragEnabled = false;
function toggleDragAndDrop(button) {
  dragEnabled = !dragEnabled;
  const topActions = document.querySelector(".topbar .top-actions");
  if (!topActions) return;

  const items = topActions.children;
  if (dragEnabled) {
    button.innerText = "Désactiver le Glisser-Déposer";
    button.style.backgroundColor = "#e74c3c";
    Array.from(items).forEach((item) => {
      item.draggable = true;
      item.classList.add("mookyplus-draggable");
      item.addEventListener("dragstart", handleDragStart);
      item.addEventListener("dragover", handleDragOver);
      item.addEventListener("drop", handleDrop);
    });
  } else {
    button.innerText = "Activer le Glisser-Déposer";
    button.style.backgroundColor = "#7289da";
    Array.from(items).forEach((item) => {
      item.draggable = false;
      item.classList.remove("mookyplus-draggable");
    });
  }
}

let draggedItem = null;
function handleDragStart(e) { draggedItem = this; e.dataTransfer.effectAllowed = "move"; }
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
function handleDrop(e) {
  e.preventDefault();
  if (draggedItem !== this) {
    const parent = this.parentNode;
    const children = Array.from(parent.children);
    if (children.indexOf(draggedItem) < children.indexOf(this)) {
      parent.insertBefore(draggedItem, this.nextSibling);
    } else {
      parent.insertBefore(draggedItem, this);
    }
  }
}

const observer = new MutationObserver(addCustomButton);
observer.observe(document.body, { childList: true, subtree: true });
