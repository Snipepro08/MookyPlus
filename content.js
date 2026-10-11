// ===================================================
// MookyPlus - Content Script Avancé
// ===================================================

console.log("[MookyPlus] Script chargé avec succès !");

// Initialisation au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  loadSavedBackground();
});

// Appliquer le fond sauvegardé
function loadSavedBackground() {
  const savedBg = localStorage.getItem("mookyplus_custom_bg");
  if (savedBg) {
    document.body.style.backgroundImage = savedBg;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
  }
}

// 1. Injection du bouton MookyPlus
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

    // Clic pour ouvrir le panneau de configuration
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

// 2. Création de la Fenêtre Modale de Configuration
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
        <!-- Section Arrière-plan -->
        <section class="mookyplus-section">
          <h3>🎨 Arrière-plan Personnalisé</h3>
          
          <label>Présets rapides :</label>
          <div class="mookyplus-presets">
            <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #0f2027, #203a43, #2c5364)">Sombre Synthwave</button>
            <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #654ea3, #eaafc8)">Violet Doux</button>
            <button class="mookyplus-preset-btn" data-bg="linear-gradient(135deg, #11998e, #38ef7d)">Émeraude</button>
            <button class="mookyplus-preset-btn" data-bg="none">Par défaut</button>
          </div>

          <label>Créateur de dégradé :</label>
          <div class="mookyplus-gradient-picker">
            <input type="color" id="mooky-color1" value="#7289da">
            <input type="color" id="mooky-color2" value="#00f3ff">
            <button id="mooky-apply-gradient">Appliquer le dégradé</button>
          </div>

          <label>Importer une image (URL ou Fichier) :</label>
          <input type="file" id="mooky-bg-file" accept="image/*">
        </section>

        <!-- Section Barre Latérale / Navigation -->
        <section class="mookyplus-section">
          <h3>🔀 Personnalisation des Éléments</h3>
          <p class="mookyplus-tip">Active le mode réorganisation pour glisser-déposer librement les éléments de la barre supérieure.</p>
          <button id="mooky-toggle-drag" class="mookyplus-action-btn">Activer le Glisser-Déposer (Drag & Drop)</button>
        </section>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Gestion de la fermeture
  document.getElementById("mookyplus-close-btn").addEventListener("click", () => {
    modal.style.display = "none";
  });

  // Événements Arrière-plan - Présets
  modal.querySelectorAll(".mookyplus-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const bg = btn.getAttribute("data-bg");
      setAndSaveBackground(bg);
    });
  });

  // Événements Arrière-plan - Dégradé
  document.getElementById("mooky-apply-gradient").addEventListener("click", () => {
    const c1 = document.getElementById("mooky-color1").value;
    const c2 = document.getElementById("mooky-color2").value;
    const gradient = `linear-gradient(135deg, ${c1}, ${c2})`;
    setAndSaveBackground(gradient);
  });

  // Événements Arrière-plan - Import Fichier
  document.getElementById("mooky-bg-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const bgUrl = `url('${event.target.result}')`;
        setAndSaveBackground(bgUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  // Événement Drag & Drop
  document.getElementById("mooky-toggle-drag").addEventListener("click", (e) => {
    toggleDragAndDrop(e.target);
  });
}

// Fonction pour sauvegarder le fond
function setAndSaveBackground(bgValue) {
  if (bgValue === "none") {
    document.body.style.backgroundImage = "none";
    localStorage.removeItem("mookyplus_custom_bg");
  } else {
    document.body.style.backgroundImage = bgValue;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundPosition = "center";
    localStorage.setItem("mookyplus_custom_bg", bgValue);
  }
}

// 3. Fonction Drag & Drop pour réorganiser les éléments
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
    button.innerText = "Activer le Glisser-Déposer (Drag & Drop)";
    button.style.backgroundColor = "#7289da";

    Array.from(items).forEach((item) => {
      item.draggable = false;
      item.classList.remove("mookyplus-draggable");
    });
  }
}

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function handleDrop(e) {
  e.preventDefault();
  if (draggedItem !== this) {
    const parent = this.parentNode;
    const children = Array.from(parent.children);
    const draggedIdx = children.indexOf(draggedItem);
    const targetIdx = children.indexOf(this);

    if (draggedIdx < targetIdx) {
      parent.insertBefore(draggedItem, this.nextSibling);
    } else {
      parent.insertBefore(draggedItem, this);
    }
  }
}

// Observateur pour maintenir l'injection du bouton
const observer = new MutationObserver(addCustomButton);
observer.observe(document.body, { childList: true, subtree: true });
