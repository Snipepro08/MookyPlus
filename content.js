// ===================================================
// MookyPlus - Content Script
// ===================================================

console.log("[MookyPlus] Le script est bien injecté sur Mooky.live !");

// Fonction pour initialiser tes modifications
function initMookyPlus() {
  // Ton code personnalisé ira ici
  console.log("[MookyPlus] Initialisation des fonctionnalités...");
}

// Observer pour gérer le contenu dynamique (Single Page Application)
const observer = new MutationObserver((mutations) => {
  // Cette fonction s'exécute à chaque fois que la page charge de nouveaux éléments
  initMookyPlus();
});

// Lancement de l'observateur sur la page
observer.observe(document.body, {
  childList: true,
  subtree: true
});
