// ===================================================
// MookyPlus - Content Script Global (Multi-Page & Persistant)
// ===================================================

if (!window.location.hostname.includes("mooky.live")) {
  console.log("[MookyPlus] Site non compatible.");
} else {
  console.log("[MookyPlus] Actif sur cette URL :", window.location.href);

  const GITHUB_REMOTE_CSS_URL = "https://raw.githubusercontent.com/Snipepro08/MookyPlus/main/remote-theme.css";
  let matrixInterval = null;
  let lastUrl = location.href;

  // Lancement dès que le DOM commence à se charger
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMookyPlus);
  } else {
    initMookyPlus();
  }

  function initMookyPlus() {
    fetchRemoteStyles();
    applyAllSavedSettings();
    addCustomButton();
  }

  // Surveillance des changements d'URL internes (SPA/Navigation dynamique)
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(applyAllSavedSettings, 150);
    }
    addCustomButton();
  }).observe(document.body, { childList: true, subtree: true });

  // Restauration globale des paramètres sauvegardés dans le navigateur
  function applyAllSavedSettings() {
    loadSavedCursor();
    loadSavedButtonPosition();

    if (localStorage.getItem("mookyplus_matrix_enabled") === "true") {
      if (!document.getElementById("mooky-matrix-canvas")) {
        enableMatrixEffect(false);
      }
    } else {
      loadSavedBackground();
    }

    if (localStorage.getItem("mookyplus_absolute_minimal") === "true") {
      enableAbsoluteMinimal(false);
    }
  }

  // 1. Injections des styles distants (GitHub)
  async function fetchRemoteStyles() {
    try {
      const response = await fetch(`${GITHUB_REMOTE_CSS_URL}?t=${Date.now()}`);
      if (response.ok) {
        const cssText = await response.text();
        let styleTag = document.getElementById("mookyplus-remote-style");
        if (!styleTag) {
          styleTag = document.createElement("style");
          styleTag.id = "mookyplus-remote-style";
          document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = cssText;
      }
    } catch (error) {
      console.warn("[MookyPlus] Erreur chargement styles distants :", error);
    }
  }

  // 2. Gestion de l'Arrière-plan
  function setAndSaveBackground(bgValue, save = true) {
    if (save) disableMatrixEffect(true);
    const targets = [document.body, document.querySelector('.desktop-shell'), document.querySelector('.app-shell')];

    if (bgValue === "none") {
      targets.forEach(el => { if (el) el.style.setProperty('background', 'none', 'important'); });
      if (save) localStorage.removeItem("mookyplus_custom_bg");
    } else {
      targets.forEach(el => {
        if (el) {
          el.style.setProperty('background', bgValue, 'important');
          el.style.setProperty('background-size', 'cover', 'important');
          el.style.setProperty('background-attachment', 'fixed', 'important');
          el.style.setProperty('background-position', 'center', 'important');
        }
      });
      if (save) localStorage.setItem("mookyplus_custom_bg", bgValue);
    }
  }

  function loadSavedBackground() {
    const savedBg = localStorage.getItem("mookyplus_custom_bg");
    if (savedBg) setAndSaveBackground(savedBg, false);
  }

  // 3. Curseurs Personnalisés
  function setAndSaveCursor(cursorType, customUrl = "") {
    let cursorStyle = "auto";
    switch (cursorType) {
      case "cyber":
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%2300f3ff' stroke='%23000' stroke-width='1.5'><polygon points='0,0 0,18 5,14 8,21 12,19 9,13 16,13'/></svg>"), auto`;
        break;
      case "neon":
        cursorStyle = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23ff007f' stroke='%23fff' stroke-width='1.5'><polygon points='0,0 0,18 5,14 8,21 12,19 9,13 16,13'/></svg>"), auto`;
        break;
      case "crosshair": cursorStyle = "crosshair"; break;
      case "custom": if (customUrl) cursorStyle = `url('${customUrl}'), auto`; break;
      default: cursorStyle = "auto"; break;
    }

    const styleTag = document.getElementById("mooky-cursor-style") || document.createElement("style");
    styleTag.id = "mooky-cursor-style";
    styleTag.innerHTML = `* { cursor: ${cursorStyle} !important; }`;
    if (!document.getElementById("mooky-cursor-style")) document.head.appendChild(styleTag);

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
    if (savedType) setAndSaveCursor(savedType, savedUrl);
  }

  // 4. Bouton Flottant M+
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

  // 5. Mode Absolute Minimal
  function enableAbsoluteMinimal(save = true) {
    if (save) localStorage.setItem("mookyplus_absolute_minimal", "true");
    for (let i = 0; i < document.styleSheets.length; i++) {
      try { document.styleSheets[i].disabled = true; } catch (e) {}
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
      try { document.styleSheets[i].disabled = false; } catch (e) {}
    }
    const restoreBtn = document.getElementById("mooky-restore-styles-btn");
    if (restoreBtn) restoreBtn.remove();
  }

  // 6. Pluie de Code Matrix Animée
  function enableMatrixEffect(save = true) {
    if (save) localStorage.setItem("mookyplus_matrix_enabled", "true");
    disableMatrixEffect(false);

    const canvas = document.createElement("canvas");
    canvas.id = "mooky-matrix-canvas";
    canvas.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:-1; pointer-events:none;";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f0";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    matrixInterval = setInterval(draw, 33);
    const targets = [document.body, document.querySelector('.desktop-shell'), document.querySelector('.app-shell')];
    targets.forEach(el => { if (el) el.style.setProperty('background', 'transparent', 'important'); });

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  function disableMatrixEffect(clearStorage = true) {
    if (clearStorage) localStorage.removeItem("mookyplus_matrix_enabled");
    if (matrixInterval) {
      clearInterval(matrixInterval);
      matrixInterval = null;
    }
    const canvas = document.getElementById("mooky-matrix-canvas");
    if (canvas) canvas.remove();
  }

  // 7. Modale de Configuration UI
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
          <section class="mookyplus-section">
            <h3>🖱️ Curseur Personnalisé</h3>
            <div class="mookyplus-presets">
              <button class="mookyplus-cursor-btn" data-cursor="cyber">Glow Cyber</button>
              <button class="mookyplus-cursor-btn" data-cursor="neon">Neon Pink</button>
              <button class="mookyplus-cursor-btn" data-cursor="crosshair">Viseur (+)</button>
              <button class="mookyplus-cursor-btn" data-cursor="reset">Par défaut</button>
            </div>
            <label>URL image custom (.png, .cur) :</label>
            <div class="mookyplus-gradient-picker">
              <input type="text" id="mooky-cursor-url" placeholder="https://..." style="flex:1; padding:6px; background:#2a2e3d; color:#fff; border:1px solid #3d4356; border-radius:4px;">
              <button id="mooky-apply-cursor-url" class="mookyplus-action-btn" style="width:auto;">Appliquer</button>
            </div>
          </section>
          <section class="mookyplus-section">
            <h3>⚡ Thèmes & Styles Spéciaux</h3>
            <div class="mookyplus-presets">
              <button id="mooky-absolute-minimal-btn" class="mookyplus-action-btn" style="background-color: #34495e;">Absolute Minimal</button>
              <button id="mooky-matrix-btn" class="mookyplus-action-btn" style="background-color: #000; color:#0f0; border: 1px solid #0f0;">🟢 Matrix Animé</button>
            </div>
          </section>
          <section class="mookyplus-section">
            <h3>🎨 Arrière-plan Personnalisé</h3>
            <div class="mookyplus-presets">
              <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #0f2027, #203a43, #2c5364)">Synthwave</button>
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
          <section class="mookyplus-section">
            <h3>🔀 Position du Bouton Flottant</h3>
            <button id="mooky-toggle-drag" class="mookyplus-action-btn">Activer le Déplacement Libre</button>
            <button id="mooky-reset-btn-pos" class="mookyplus-action-btn" style="background-color:#7f8c8d; margin-top:6px;">Réinitialiser la Position</button>
          </section>
          <section class="mookyplus-section">
            <h3>💻 Invite de Commandes MookyTerm</h3>
            <button id="mooky-open-terminal" class="mookyplus-action-btn" style="background-color:#00b894;">Ouvrir la Console</button>
          </section>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("mookyplus-close-btn").addEventListener("click", () => modal.style.display = "none");

    modal.querySelectorAll(".mookyplus-cursor-btn").forEach((btn) => {
      btn.addEventListener("click", () => setAndSaveCursor(btn.getAttribute("data-cursor")));
    });

    document.getElementById("mooky-apply-cursor-url").addEventListener("click", () => {
      const url = document.getElementById("mooky-cursor-url").value.trim();
      if (url) setAndSaveCursor("custom", url);
    });

    document.getElementById("mooky-absolute-minimal-btn").addEventListener("click", () => enableAbsoluteMinimal());

    document.getElementById("mooky-matrix-btn").addEventListener("click", () => {
      enableMatrixEffect();
      modal.style.display = "none";
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

  // 8. Console MookyTerm
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
        <div>Bienvenue sur <b>MookyTerm</b> ! Tapez <span class="term-highlight">/help</span>.</div>
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
      if (isHtml) line.innerHTML = text; else line.textContent = text;
      output.appendChild(line);
      output.scrollTop = output.scrollHeight;
    };

    log(`mooky> ${cmd}`);
    const parts = cmd.split(" ");
    const mainCmd = parts[0].toLowerCase();

    switch (mainCmd) {
      case "/help":
        log("📋 <b>Commandes :</b> /help, /cursor, /minimal, /matrix, /clear, /stats, /theme", true);
        break;
      case "/cursor":
        if (["cyber", "neon", "crosshair", "reset"].includes(parts[1])) {
          setAndSaveCursor(parts[1]);
          log(`🖱️ Curseur mis à jour : ${parts[1]}`);
        } else {
          log("Usage: /cursor <cyber|neon|crosshair|reset>");
        }
        break;
      case "/minimal":
        enableAbsoluteMinimal();
        log("⚡ Mode Absolute Minimal activé.");
        break;
      case "/matrix":
        if (document.getElementById("mooky-matrix-canvas")) {
          disableMatrixEffect();
          log("🔴 Matrix désactivé.");
        } else {
          enableMatrixEffect();
          log("🟢 Matrix activé !");
        }
        break;
      case "/clear":
      case "/cls":
        output.innerHTML = "";
        break;
      case "/stats":
        log(`📊 Posts sur la page : ${document.querySelectorAll("article.post").length}`);
        break;
      case "/theme":
        const t = parts[1];
        if (t === "dark") setAndSaveBackground("linear-gradient(135deg, #121212, #1f1f1f)");
        else if (t === "cyber") setAndSaveBackground("linear-gradient(135deg, #050505, #00f3ff)");
        else if (t === "neon") setAndSaveBackground("linear-gradient(135deg, #2b0036, #ff007f)");
        else if (t === "reset") setAndSaveBackground("none");
        else log("Thèmes : dark, cyber, neon, reset");
        break;
      default:
        log(`❌ Commande inconnue. Tapez /help.`);
        break;
    }
  }

  // 9. Glisser-déposer du Bouton Flottant
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
      btn.style.left = (pageX - shiftX) + "px";
      btn.style.top = (pageY - shiftY) + "px";
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
        localStorage.setItem("mookyplus_btn_pos", JSON.stringify({ left: btn.style.left, top: btn.style.top }));
      }
    };
  }
}
