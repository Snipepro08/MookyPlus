// URL du CSS brut sur ton GitHub
const GITHUB_REMOTE_CSS_URL = "https://raw.githubusercontent.com/Snipepro08/MookyPlus/main/remote-theme.css";

// Charger et appliquer le CSS distant depuis GitHub
async function fetchRemoteStyles() {
  try {
    // On ajoute un paramètre timestamp pour éviter que le navigateur mette en cache la vieille version
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
      console.log("[MookyPlus] Styles distants GitHub appliqués avec succès !");
    }
  } catch (error) {
    console.warn("[MookyPlus] Impossible de charger les styles distants :", error);
  }
}

// Appeler la fonction au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  fetchRemoteStyles();
  loadSavedBackground();
  loadSavedCursor();
  loadSavedButtonPosition();
  if (localStorage.getItem("mookyplus_absolute_minimal") === "true") {
    enableAbsoluteMinimal(false);
  }
});
