// ===================================================
// MookyPlus - Content Script avec Logo
// ===================================================

console.log("[MookyPlus] Le script est bien injecté sur Mooky.live !");

function addCustomButton() {
  const topActions = document.querySelector('.topbar .top-actions');

  if (topActions && !document.getElementById('mooky-plus-btn')) {
    
    // 1. Création du lien / bouton
    const customButton = document.createElement('a');
    customButton.id = 'mooky-plus-btn';
    customButton.className = 'top-pill home-top-action';
    customButton.style.borderRadius = '15px';
    customButton.style.backgroundColor = '#7289da';
    customButton.style.color = '#ffffff';
    customButton.style.cursor = 'pointer';
    customButton.style.display = 'flex';
    customButton.style.alignItems = 'center';
    customButton.style.gap = '6px';
    customButton.style.padding = '4px 10px';
    customButton.style.fontWeight = 'bold';
    customButton.style.fontSize = '13px';
    customButton.style.textDecoration = 'none';
    customButton.title = 'MookyPlus Actif';

    // 2. Création de la balise <img> pour le logo
    const logoImg = document.createElement('img');
    logoImg.src = chrome.runtime.getURL('logo.jpg'); // Charge logo.jpg depuis l'extension
    logoImg.alt = 'MookyPlus';
    logoImg.style.width = '20px';
    logoImg.style.height = '20px';
    logoImg.style.borderRadius = '50%';
    logoImg.style.objectFit = 'cover';

    // 3. Texte du bouton
    const btnText = document.createElement('span');
    btnText.innerText = 'M+';

    // Assemblage
    customButton.appendChild(logoImg);
    customButton.appendChild(btnText);

    // 4. Action au clic
    customButton.addEventListener('click', (e) => {
      e.preventDefault();
      alert('MookyPlus est actif !');
    });

    // 5. Insertion dans la barre du haut
    const avatarLink = topActions.querySelector('.top-avatar-link');
    if (avatarLink) {
      topActions.insertBefore(customButton, avatarLink);
    } else {
      topActions.appendChild(customButton);
    }
    
    console.log("[MookyPlus] Bouton avec logo ajouté !");
  }
}

// Observer pour le rechargement dynamique
const observer = new MutationObserver(addCustomButton);
observer.observe(document.body, { childList: true, subtree: true });
