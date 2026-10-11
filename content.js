// ===================================================
// MookyPlus - Content Script
// ===================================================

console.log("[MookyPlus] Le script est bien injecté sur Mooky.live !");

// Fonction pour ajouter le bouton dans la topbar
function addCustomButton() {
  // On cible la zone des actions dans la barre du haut
  const topActions = document.querySelector('.topbar .top-actions');

  // Vérifie que la zone existe et qu'on n'a pas déjà ajouté le bouton
  if (topActions && !document.getElementById('mooky-plus-btn')) {
    
    // 1. Création du bouton sous forme de "pill" (comme les autres boutons du site)
    const customButton = document.createElement('a');
    customButton.id = 'mooky-plus-btn';
    customButton.className = 'top-pill home-top-action';
    customButton.style.borderRadius = '15px !important';
    customButton.style.backgroundColor = '#7289da';
    customButton.style.color = '#ffffff';
    customButton.style.cursor = 'pointer';
    customButton.style.display = 'flex';
    customButton.style.alignItems = 'center';
    customButton.style.justifyContent = 'center';
    customButton.style.padding = '0 12px';
    customButton.style.fontWeight = 'bold';
    customButton.style.fontSize = '13px';
    customButton.innerText = 'M+'; // Texte court ou icône
    
    // Titre au survol
    customButton.title = 'MookyPlus Actif';

    // 2. Action au clic sur le bouton
    customButton.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Bravo ! Ton extension MookyPlus fonctionne à merveille sur Mooky !');
    });

    // 3. Insertion du bouton avant la photo de profil (ou à la fin avec appendChild)
    const avatarLink = topActions.querySelector('.top-avatar-link');
    if (avatarLink) {
      topActions.insertBefore(customButton, avatarLink);
    } else {
      topActions.appendChild(customButton);
    }
    
    console.log("[MookyPlus] Bouton ajouté dans la topbar avec succès !");
  }
}

// Observer pour s'assurer que le bouton s'ajoute dynamiquement
const observer = new MutationObserver(() => {
  addCustomButton();
});

// Lancer l'observation de la page
observer.observe(document.body, {
  childList: true,
  subtree: true
});
