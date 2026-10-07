// ============================================
// GNINOU_FOOD — Pages menus (services_pr/menu_*.html)
// Paramètres d'URL : ?recherche=texte&tout=1 (recherche dans tous les menus)
// ============================================
(function () {
  const parametres = new URLSearchParams(window.location.search);
  const categorie = trouverCategorie(document.body.dataset.categorie);
  const toutLeMenu = parametres.get('tout') === '1';
  const base = toutLeMenu ? PLATS : PLATS.filter(p => p.categorie === categorie.id);
  const prixMax = Math.ceil(Math.max(...base.map(p => p.prix)) / 500) * 500;

  const etat = {
    texte: parametres.get('recherche') || '',
    tags: new Set(),
    prix: prixMax,
    tri: 'defaut'
  };

  // ---------- Bannière ----------
  document.getElementById('banniereMenu').innerHTML = toutLeMenu
    ? `<div class="conteneur banniere-contenu">
         <p class="banniere-sur"><i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i> Recherche</p>
         <h1>Tous nos menus</h1>
         <p>Résultats pour « ${echapper(etat.texte)} » dans les ${CATEGORIES.length} menus.</p>
       </div>`
    : `<img src="${cheminImage(categorie.image)}" alt="" class="banniere-image">
       <div class="banniere-voile" style="--couleur-categorie:${categorie.couleur}"></div>
       <div class="conteneur banniere-contenu">
         <p class="banniere-sur"><i class="${categorie.icone}" aria-hidden="true"></i> ${base.length} choix</p>
         <h1>${categorie.nom}</h1>
         <p>${categorie.accroche}.</p>
       </div>`;
  if (toutLeMenu) document.getElementById('banniereMenu').classList.add('banniere-recherche');

  // ---------- Onglets des autres menus ----------
  document.getElementById('ongletsMenus').innerHTML = CATEGORIES.map(c => `
    <a href="${chemin(c.page)}" class="onglet-menu ${!toutLeMenu && c.id === categorie.id ? 'actif' : ''}" style="--couleur-categorie:${c.couleur}"
      ${!toutLeMenu && c.id === categorie.id ? 'aria-current="page"' : ''}>
      <i class="${c.icone}" aria-hidden="true"></i> ${c.nom}
    </a>`).join('');

  // ---------- Filtres ----------
  const tagsPresents = Object.keys(TAGS).filter(t => base.some(p => p.tags.includes(t)));
  document.getElementById('filtresTags').innerHTML = tagsPresents.map(t => `
    <button class="puce-filtre" data-tag="${t}" aria-pressed="false"><i class="${TAGS[t].icone}" aria-hidden="true"></i> ${TAGS[t].nom}</button>`).join('');

  const champTexte = document.getElementById('filtreTexte');
  const champPrix = document.getElementById('filtrePrix');
  const champTri = document.getElementById('filtreTri');
  champTexte.value = etat.texte;
  champPrix.min = Math.floor(Math.min(...base.map(p => p.prix)) / 500) * 500;
  champPrix.max = prixMax;
  champPrix.value = prixMax;

  function platsFiltres() {
    const correspondants = etat.texte ? new Set(rechercherPlats(etat.texte).map(p => p.id)) : null;
    const liste = base.filter(p =>
      (!correspondants || correspondants.has(p.id)) &&
      [...etat.tags].every(t => p.tags.includes(t)) &&
      p.prix <= etat.prix);
    if (etat.tri === 'prix-croissant') liste.sort((a, b) => a.prix - b.prix);
    if (etat.tri === 'prix-decroissant') liste.sort((a, b) => b.prix - a.prix);
    if (etat.tri === 'nom') liste.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    return liste;
  }

  function rendre() {
    const liste = platsFiltres();
    document.getElementById('valeurPrix').textContent = formaterPrix(etat.prix);
    document.getElementById('compteResultats').textContent =
      `${liste.length} plat${liste.length > 1 ? 's' : ''} sur ${base.length}`;
    const grille = document.getElementById('grilleMenu');
    grille.innerHTML = liste.length
      ? liste.map(htmlCartePlat).join('')
      : `<div class="etat-vide etat-vide-large">
           <i class="fa-solid fa-bowl-rice" aria-hidden="true"></i>
           <p>Aucun plat ne correspond à ces filtres.</p>
           <button class="bouton bouton-principal" id="reinitialiserFiltres"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Réinitialiser les filtres</button>
         </div>`;
    grille.querySelectorAll('.carte-plat').forEach((carte, i) => {
      carte.classList.add('entree-carte');
      carte.style.setProperty('--delai', `${Math.min(i, 12) * 40}ms`);
    });
    document.getElementById('reinitialiserFiltres')?.addEventListener('click', reinitialiser);
  }

  function reinitialiser() {
    etat.texte = '';
    etat.tags.clear();
    etat.prix = prixMax;
    etat.tri = 'defaut';
    champTexte.value = '';
    champPrix.value = prixMax;
    champTri.value = 'defaut';
    document.querySelectorAll('.puce-filtre').forEach(b => { b.classList.remove('actif'); b.setAttribute('aria-pressed', 'false'); });
    rendre();
  }

  champTexte.addEventListener('input', () => { etat.texte = champTexte.value; rendre(); });
  champPrix.addEventListener('input', () => { etat.prix = Number(champPrix.value); rendre(); });
  champTri.addEventListener('change', () => { etat.tri = champTri.value; rendre(); });
  document.getElementById('filtresTags').addEventListener('click', e => {
    const bouton = e.target.closest('[data-tag]');
    if (!bouton) return;
    const actif = !etat.tags.has(bouton.dataset.tag);
    if (actif) etat.tags.add(bouton.dataset.tag); else etat.tags.delete(bouton.dataset.tag);
    bouton.classList.toggle('actif', actif);
    bouton.setAttribute('aria-pressed', actif);
    rendre();
  });

  rendre();

  // ?plat=id ouvre directement la fiche
  if (parametres.get('plat')) ouvrirFichePlat(parametres.get('plat'));
})();
