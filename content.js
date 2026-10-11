// ===================================================
// MookyPlus - Content Script (Floating Button, Custom Cursor & Features)
// ===================================================

console.log("[MookyPlus] Script chargé avec succès !");

document.addEventListener("DOMContentLoaded", () => {
  loadSavedBackground();
  loadSavedCursor();
  loadSavedButtonPosition();
  if (localStorage.getItem("mookyplus_absolute_minimal") === "true") {
    enableAbsoluteMinimal(false);
  }
});

// 1. Gestion de l'Arrière-plan
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

// 2. Gestion du Curseur Personnalisé
function setAndSaveCursor(cursorType, customUrl = "") {
  let cursorStyle = "auto";

  switch (cursorType) {
    case "cyber":
      cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%2300f3ff' stroke='%23000' stroke-width='1.5'><polygon points='0,0 0,18 5,14 8,21 12,19 9,13 16,13'/></svg>"), auto`;
      break;
    case "neon":
      cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23ff007f' stroke='%23fff' stroke-width='1.5'><polygon points='0,0 0,18 5,14 8,21 12,19 9,13 16,13'/></svg>"), auto`;
      break;
    case "crosshair":
      cursorStyle = "crosshair";
      break;
    case "custom":
      if (customUrl) cursorStyle = `url('${customUrl}'), auto`;
      break;
    case "reset":
    default:
      cursorStyle = "auto";
      break;
  }

  document.documentElement.style.setProperty("cursor", cursorStyle, "important");
  
  // Appliquer sur tous les éléments interactifs pour forcer l'effet
  const styleTag = document.getElementById("mooky-cursor-style") || document.createElement("style");
  styleTag.id = "mooky-cursor-style";
  styleTag.innerHTML = `* { cursor: ${cursorStyle} !important; }`;
  if (!document.getElementById("mooky-cursor-style")) {
    document.head.appendChild(styleTag);
  }

  if (cursorType === "reset") {
    localStorage.removeItem("mookyplus_cursor_type");
    localStorage.removeItem("mookyplus_cursor_url");
    if (styleTag) styleTag.remove();
  } else {
    localStorage.setItem("mookyplus_cursor_type", cursorType);
    if (customUrl) localStorage.setItem("mookyplus_cursor_url", customUrl);
  }
}

function loadSavedCursor() {
  const savedType = localStorage.getItem("mookyplus_cursor_type");
  const savedUrl = localStorage.getItem("mookyplus_cursor_url") || "";
  if (savedType) {
    setAndSaveCursor(savedType, savedUrl);
  }
}

// 3. Bouton Flottant MookyPlus (En bas à droite, déplaçable)
function addCustomButton() {
  if (!document.getElementById("mooky-plus-btn")) {
    const customButton = document.createElement("a");
    customButton.id = "mooky-plus-btn";
    customButton.className = "mookyplus-floating-btn";

    const logoImg = document.createElement("img");
    logoImg.src = chrome.runtime.getURL("logo.jpg");
    logoImg.style.cssText = "width:22px; height:22px; border-radius:50%; object-fit:cover;";

    const btnText = document.createElement("span");
    btnText.innerText = "M+";

    customButton.appendChild(logoImg);
    customButton.appendChild(btnText);

    customButton.addEventListener("click", (e) => {
      // Si le bouton n'a pas été glissé récemment, on ouvre le menu
      if (!customButton.dataset.wasDragged) {
        e.preventDefault();
        toggleMookyPlusModal();
      }
      delete customButton.dataset.wasDragged;
    });

    document.body.appendChild(customButton);
    loadSavedButtonPosition();
  }
}

function loadSavedButtonPosition() {
  const btn = document.getElementById("mooky-plus-btn");
  const savedPos = localStorage.getItem("mookyplus_btn_pos");
  if (btn && savedPos) {
    const pos = JSON.parse(savedPos);
    btn.style.left = pos.left;
    btn.style.top = pos.top;
    btn.style.bottom = "auto";
    btn.style.right = "auto";
  }
}

// 4. Mode Absolute Minimal
function enableAbsoluteMinimal(save = true) {
  if (save) localStorage.setItem("mookyplus_absolute_minimal", "true");

  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      document.styleSheets[i].disabled = true;
    } catch (e) {}
  }

  const modal = document.getElementById("mookyplus-modal");
  if (modal) modal.style.display = "none";

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

  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      document.styleSheets[i].disabled = false;
    } catch (e) {}
  }

  const restoreBtn = document.getElementById("mooky-restore-styles-btn");
  if (restoreBtn) restoreBtn.remove();
}

// 5. Fenêtre Modale de Configuration
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
        <!-- Section Curseur Personnalisé -->
        <section class="mookyplus-section">
          <h3>🖱️ Curseur Personnalisé</h3>
          <div class="mookyplus-presets">
            <button class="mookyplus-cursor-btn" data-cursor="cyber">Glow Cyber</button>
            <button class="mookyplus-cursor-btn" data-cursor="neon">Neon Pink</button>
            <button class="mookyplus-cursor-btn" data-cursor="crosshair">Viseur (+)</button>
            <button class="mookyplus-cursor-btn" data-cursor="reset">Par défaut</button>
          </div>
          <label>URL d'image custom (.cur, .png) :</label>
          <div class="mookyplus-gradient-picker">
            <input type="text" id="mooky-cursor-url" placeholder="https://.../cursor.png" style="flex:1; padding:6px; background:#2a2e3d; color:#fff; border:1px solid #3d4356; border-radius:4px;">
            <button id="mooky-apply-cursor-url" class="mookyplus-action-btn" style="width:auto;">Appliquer</button>
          </div>
        </section>

        <!-- Section Thèmes & Minimalisme -->
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

        <!-- Section Déplacement du Bouton M+ -->
        <section class="mookyplus-section">
          <h3>🔀 Position du Bouton Flottant</h3>
          <p class="mookyplus-tip">Active le mode déplacement pour glisser le bouton M+ n'importe où à l'écran.</p>
          <button id="mooky-toggle-drag" class="mookyplus-action-btn">Activer le Déplacement Libre</button>
          <button id="mooky-reset-btn-pos" class="mookyplus-action-btn" style="background-color:#7f8c8d; margin-top:6px;">Réinitialiser la Position</button>
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

  // Événements Curseur
  modal.querySelectorAll(".mookyplus-cursor-btn").forEach((btn) => {
    btn.addEventListener("click", () => setAndSaveCursor(btn.getAttribute("data-cursor")));
  });

  document.getElementById("mooky-apply-cursor-url").addEventListener("click", () => {
    const url = document.getElementById("mooky-cursor-url").value.trim();
    if (url) setAndSaveCursor("custom", url);
  });

  // Événement Absolute Minimal
  document.getElementById("mooky-absolute-minimal-btn").addEventListener("click", () => {
    enableAbsoluteMinimal();
  });

  // Événements Arrière-plan
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

  // Événements Déplacement
  document.getElementById("mooky-toggle-drag").addEventListener("click", (e) => toggleButtonDragging(e.target));
  document.getElementById("mooky-reset-btn-pos").addEventListener("click", () => {
    localStorage.removeItem("mookyplus_btn_pos");
    const btn = document.getElementById("mooky-plus-btn");
    if (btn) {
      btn.style.left = "auto";
      btn.style.top = "auto";
      btn.style.bottom = "20px";
      btn.style.right = "20px";
    }
  });

  document.getElementById("mooky-open-terminal").addEventListener("click", () => {
    modal.style.display = "none";
    toggleTerminal();
  });
}

// 6. Invite de Commandes (MookyTerm)
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
      <div>Bienvenue sur <b>MookyTerm</b> ! Tapez <span class="term-highlight">/help</span> pour la liste des commandes.</div>
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
      log("/cursor <cyber|neon|crosshair|reset> - Change le curseur");
      log("/minimal - Mode Absolute Minimal");
      log("/clear - Efface le terminal");
      log("/stats - Statistiques de la page");
      log("/theme <dark|cyber|neon|reset> - Thèmes de fond");
      log("/matrix - Mode Matrix");
      break;

    case "/cursor":
      const cur = parts[1];
      if (["cyber", "neon", "crosshair", "reset"].includes(cur)) {
        setAndSaveCursor(cur);
        log(`🖱️ Curseur changé en : ${cur}`);
      } else {
        log("Usage: /cursor <cyber|neon|crosshair|reset>");
      }
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

    default:
      log(`❌ Commande inconnue : "${cmd}". Tapez /help.`);
      break;
  }
}

// 7. Déplacement Libre du Bouton Flottant (Mouse & Touch)
let isDraggingBtn = false;

function toggleButtonDragging(triggerBtn) {
  const btn = document.getElementById("mooky-plus-btn");
  if (!btn) return;

  if (!btn.classList.contains("mookyplus-dragging-enabled")) {
    btn.classList.add("mookyplus-dragging-enabled");
    triggerBtn.innerText = "Désactiver le Déplacement";
    triggerBtn.style.backgroundColor = "#e74c3c";

    btn.addEventListener("mousedown", startDragButton);
  } else {
    btn.classList.remove("mookyplus-dragging-enabled");
    triggerBtn.innerText = "Activer le Déplacement Libre";
    triggerBtn.style.backgroundColor = "#7289da";

    btn.removeEventListener("mousedown", startDragButton);
  }
}

function startDragButton(e) {
  const btn = document.getElementById("mooky-plus-btn");
  let shiftX = e.clientX - btn.getBoundingClientRect().left;
  let shiftY = e.clientY - btn.getBoundingClientRect().top;

  let moved = false;

  function moveAt(pageX, pageY) {
    let newLeft = pageX - shiftX;
    let newTop = pageY - shiftY;

    btn.style.left = newLeft + "px";
    btn.style.top = newTop + "px";
    btn.style.bottom = "auto";
    btn.style.right = "auto";
  }

  function onMouseMove(event) {
    moved = true;
    moveAt(event.pageX, event.pageY);
  }

  document.addEventListener("mousemove", onMouseMove);

  document.onmouseup = function () {
    document.removeEventListener("mousemove", onMouseMove);
    document.onmouseup = null;

    if (moved) {
      btn.dataset.wasDragged = "true";
      const pos = { left: btn.style.left, top: btn.style.top };
      localStorage.setItem("mookyplus_btn_pos", JSON.stringify(pos));
    }
  };
}

const observer = new MutationObserver(addCustomButton);
observer.observe(document.body, { childList: true, subtree: true });
