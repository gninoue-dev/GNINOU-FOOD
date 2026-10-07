// ============================================
// GNINOU_FOOD — Script commun à toutes les pages
// En-tête, pied de page, panier, tiroir panier, recherche,
// fiche plat, favoris, comptes simulés, thème sombre, toasts.
// Les pages des sous-dossiers ont <body data-racine="../">.
// ============================================
const RACINE = document.body.dataset.racine || '';
const mouvementReduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Utilitaires ----------
function chemin(relatif) {
  return RACINE + relatif;
}

function cheminImage(relatif) {
  return encodeURI(RACINE + relatif);
}

function formaterPrix(montant) {
  return `${Math.round(montant).toLocaleString('fr-FR')} ${CONFIG.devise}`;
}

function echapper(texte) {
  return String(texte ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function sansAccents(texte) {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function trouverPlat(id) {
  return PLATS.find(p => p.id === id);
}

function trouverCategorie(id) {
  return CATEGORIES.find(c => c.id === id);
}

// localStorage peut être indisponible (navigation privée, etc.)
function lire(cle, defaut) {
  try {
    const valeur = window.localStorage.getItem(`gf.${cle}`);
    return valeur === null ? defaut : JSON.parse(valeur);
  } catch (erreur) {
    return defaut;
  }
}

function ecrire(cle, valeur) {
  try {
    window.localStorage.setItem(`gf.${cle}`, JSON.stringify(valeur));
  } catch (erreur) {
    // stockage indisponible : le site fonctionne, sans mémoriser
  }
}

// ============================================
// Panier
// ============================================
const Panier = {
  lignes() {
    return lire('panier', []).filter(l => trouverPlat(l.id));
  },
  enregistrer(lignes) {
    ecrire('panier', lignes);
    document.dispatchEvent(new CustomEvent('panierChange'));
  },
  ajouter(id, quantite = 1, note = '') {
    const lignes = this.lignes();
    const existante = lignes.find(l => l.id === id && (l.note || '') === note);
    if (existante) existante.quantite = Math.min(99, existante.quantite + quantite);
    else lignes.push({ id, quantite, note });
    this.enregistrer(lignes);
  },
  changerQuantite(index, quantite) {
    const lignes = this.lignes();
    if (!lignes[index]) return;
    if (quantite <= 0) lignes.splice(index, 1);
    else lignes[index].quantite = Math.min(99, quantite);
    this.enregistrer(lignes);
  },
  retirer(index) {
    const lignes = this.lignes();
    const retiree = lignes.splice(index, 1)[0];
    this.enregistrer(lignes);
    return retiree;
  },
  restaurer(ligne, index) {
    const lignes = this.lignes();
    lignes.splice(index, 0, ligne);
    this.enregistrer(lignes);
  },
  vider() {
    this.enregistrer([]);
  },
  nombreArticles() {
    return this.lignes().reduce((total, l) => total + l.quantite, 0);
  },
  sousTotal() {
    return this.lignes().reduce((total, l) => total + trouverPlat(l.id).prix * l.quantite, 0);
  },
  contientAlcool() {
    return this.lignes().some(l => trouverPlat(l.id).tags.includes('alcool'));
  }
};

// Calcul complet (remise, livraison) partagé par le panier et la commande
function calculerTotaux(nomZone, codePromo) {
  const sousTotal = Panier.sousTotal();
  const pourcentage = CONFIG.codesPromo[(codePromo || '').toUpperCase()] || 0;
  const remise = Math.round(sousTotal * pourcentage / 100);
  const zone = CONFIG.zones.find(z => z.nom === nomZone);
  const gratuite = CONFIG.livraisonGratuiteDes > 0 && sousTotal - remise >= CONFIG.livraisonGratuiteDes;
  const livraison = !zone || sousTotal === 0 ? 0 : gratuite ? 0 : zone.frais;
  return { sousTotal, pourcentage, remise, zone, gratuite, livraison, total: sousTotal - remise + livraison };
}

// Bloc des totaux, partagé avec la page commande
function htmlTotaux(totaux) {
  const reste = CONFIG.livraisonGratuiteDes - (totaux.sousTotal - totaux.remise);
  return `
    <dl class="totaux">
      <div><dt>Sous-total</dt><dd>${formaterPrix(totaux.sousTotal)}</dd></div>
      ${totaux.remise ? `<div class="ligne-remise"><dt>Réduction (-${totaux.pourcentage} %)</dt><dd>- ${formaterPrix(totaux.remise)}</dd></div>` : ''}
      <div><dt>Livraison${totaux.zone ? ` · ${totaux.zone.nom}` : ''}</dt><dd>${!totaux.zone ? '<span class="a-choisir">Choisir la commune</span>' : totaux.gratuite ? '<span class="offerte">Offerte</span>' : formaterPrix(totaux.livraison)}</dd></div>
      <div class="ligne-total-general"><dt>Total</dt><dd>${formaterPrix(totaux.total)}</dd></div>
    </dl>
    ${CONFIG.livraisonGratuiteDes > 0 && reste > 0 ? `
      <div class="jauge-livraison">
        <p>Plus que <strong>${formaterPrix(reste)}</strong> pour la livraison offerte</p>
        <span class="jauge"><span style="width:${Math.min(100, (totaux.sousTotal - totaux.remise) / CONFIG.livraisonGratuiteDes * 100)}%"></span></span>
      </div>` : ''}`;
}

// ============================================
// Favoris
// ============================================
const Favoris = {
  liste() { return lire('favoris', []); },
  contient(id) { return this.liste().includes(id); },
  basculer(id) {
    const liste = this.liste();
    const index = liste.indexOf(id);
    if (index >= 0) liste.splice(index, 1); else liste.push(id);
    ecrire('favoris', liste);
    document.dispatchEvent(new CustomEvent('favorisChange'));
    return index < 0;
  }
};

// ============================================
// Comptes (simulés dans le navigateur, sans serveur)
// ============================================
async function hacherMotDePasse(motDePasse) {
  const texte = `gninoufood:${motDePasse}`;
  if (window.crypto && window.crypto.subtle) {
    const empreinte = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
    return [...new Uint8Array(empreinte)].map(o => o.toString(16).padStart(2, '0')).join('');
  }
  // page ouverte en file:// : repli non cryptographique (démo uniquement)
  let h = 0;
  for (const c of texte) h = (h * 31 + c.charCodeAt(0)) | 0;
  return `simple-${h}`;
}

const Compte = {
  comptes() { return lire('comptes', {}); },
  courant() {
    const email = lire('session', null);
    return email ? this.comptes()[email] || null : null;
  },
  async inscrire({ nom, email, telephone, motDePasse }) {
    const comptes = this.comptes();
    email = email.trim().toLowerCase();
    if (comptes[email]) throw new Error('Un compte existe déjà avec cet email.');
    comptes[email] = { nom: nom.trim(), email, telephone: telephone || '', commune: '', adresse: '', empreinte: await hacherMotDePasse(motDePasse), creeLe: Date.now() };
    ecrire('comptes', comptes);
    ecrire('session', email);
    this.rattacherCommandes(email);
  },
  // Les commandes passées sans compte sur cet appareil rejoignent le compte
  rattacherCommandes(email) {
    const commandes = lire('commandes', []);
    commandes.forEach(c => { if (!c.email) c.email = email; });
    ecrire('commandes', commandes);
  },
  async connecter(email, motDePasse) {
    email = email.trim().toLowerCase();
    const compte = this.comptes()[email];
    if (!compte || compte.empreinte !== await hacherMotDePasse(motDePasse)) throw new Error('Email ou mot de passe incorrect.');
    ecrire('session', email);
    this.rattacherCommandes(email);
  },
  mettreAJour(champs) {
    const comptes = this.comptes();
    const email = lire('session', null);
    if (!email || !comptes[email]) return;
    Object.assign(comptes[email], champs);
    ecrire('comptes', comptes);
  },
  deconnecter() {
    ecrire('session', null);
  }
};

const Commandes = {
  toutes() { return lire('commandes', []); },
  duCompte() {
    const compte = Compte.courant();
    return this.toutes().filter(c => compte ? c.email === compte.email : !c.email);
  },
  ajouter(commande) {
    const toutes = this.toutes();
    toutes.unshift(commande);
    ecrire('commandes', toutes.slice(0, 50));
  },
  trouver(numero) {
    return this.toutes().find(c => c.numero === numero);
  }
};

// Suivi simulé : le statut avance avec le temps écoulé depuis la commande
const ETAPES_SUIVI = [
  { nom: 'Commande reçue', icone: 'fa-solid fa-receipt', minutes: 0 },
  { nom: 'En préparation', icone: 'fa-solid fa-fire-burner', minutes: 2 },
  { nom: 'En route', icone: 'fa-solid fa-motorcycle', minutes: 15 },
  { nom: 'Livrée', icone: 'fa-solid fa-house-circle-check', minutes: 35 }
];

function etapeCommande(commande) {
  const minutes = (Date.now() - commande.date) / 60000;
  let etape = 0;
  ETAPES_SUIVI.forEach((e, i) => { if (minutes >= e.minutes) etape = i; });
  return etape;
}

// ============================================
// Thème sombre
// ============================================
function appliquerTheme(theme) {
  document.documentElement.dataset.theme = theme;
  ecrire('theme', theme);
  const bouton = document.getElementById('boutonTheme');
  if (bouton) {
    bouton.innerHTML = `<i class="fa-solid ${theme === 'sombre' ? 'fa-sun' : 'fa-moon'}" aria-hidden="true"></i>`;
    bouton.setAttribute('aria-label', theme === 'sombre' ? 'Passer en thème clair' : 'Passer en thème sombre');
    bouton.title = bouton.getAttribute('aria-label');
  }
}

// ============================================
// Toasts
// ============================================
function toast(message, options = {}) {
  let zone = document.getElementById('zoneToasts');
  if (!zone) {
    zone = document.createElement('div');
    zone.id = 'zoneToasts';
    zone.className = 'zone-toasts';
    zone.setAttribute('aria-live', 'polite');
    document.body.appendChild(zone);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${options.type || 'succes'}`;
  el.innerHTML = `<i class="${options.icone || 'fa-solid fa-circle-check'}" aria-hidden="true"></i><span>${message}</span>`;
  if (options.action) {
    const bouton = document.createElement('button');
    bouton.className = 'toast-action';
    bouton.textContent = options.action.libelle;
    bouton.addEventListener('click', () => { options.action.rappel(); fermer(); });
    el.appendChild(bouton);
  }
  zone.appendChild(el);
  const fermer = () => {
    el.classList.add('sortie');
    window.setTimeout(() => el.remove(), 300);
  };
  window.setTimeout(fermer, options.duree || 3200);
}

// ============================================
// Visuels et cartes de plats (réutilisés par toutes les pages)
// ============================================
function htmlVisuelPlat(plat, classe = '') {
  if (plat.image) {
    return `<img class="visuel-plat ${classe}" src="${cheminImage(plat.image)}" alt="${echapper(plat.nom)}" loading="lazy">`;
  }
  const categorie = trouverCategorie(plat.categorie);
  return `<div class="visuel-plat visuel-reserve ${classe}" style="--couleur-categorie:${categorie.couleur}" role="img" aria-label="${echapper(plat.nom)}">
    <i class="${categorie.icone}" aria-hidden="true"></i>
    <span>${echapper(plat.nom)}</span>
  </div>`;
}

function htmlTags(plat) {
  return plat.tags.filter(t => TAGS[t]).map(t =>
    `<span class="pastille pastille-${t}"><i class="${TAGS[t].icone}" aria-hidden="true"></i> ${TAGS[t].nom}</span>`).join('');
}

function htmlCartePlat(plat) {
  const favori = Favoris.contient(plat.id);
  return `
    <article class="carte-plat" data-id="${plat.id}">
      <button class="carte-plat-visuel" data-voir="${plat.id}" aria-label="Voir le détail : ${echapper(plat.nom)}">
        ${htmlVisuelPlat(plat)}
        <span class="carte-plat-loupe" aria-hidden="true"><i class="fa-solid fa-eye"></i> Détails</span>
      </button>
      <button class="bouton-favori ${favori ? 'actif' : ''}" data-favori="${plat.id}" aria-pressed="${favori}"
        aria-label="${favori ? 'Retirer des favoris' : 'Ajouter aux favoris'} : ${echapper(plat.nom)}">
        <i class="fa-${favori ? 'solid' : 'regular'} fa-heart" aria-hidden="true"></i>
      </button>
      <div class="carte-plat-corps">
        <div class="carte-plat-tags">${htmlTags(plat)}</div>
        <h3 class="carte-plat-nom">${echapper(plat.nom)}</h3>
        <p class="carte-plat-description">${echapper(plat.description)}</p>
        <div class="carte-plat-pied">
          <span class="prix">${formaterPrix(plat.prix)}</span>
          <button class="bouton bouton-principal bouton-ajouter" data-ajouter="${plat.id}">
            <i class="fa-solid fa-plus" aria-hidden="true"></i> <span>Ajouter</span>
          </button>
        </div>
      </div>
    </article>`;
}

// ============================================
// En-tête et pied de page
// ============================================
function injecterEntete() {
  const page = document.body.dataset.page || '';
  const lien = (cible, libelle, cle) =>
    `<a href="${chemin(cible)}" class="lien-nav ${page === cle ? 'actif' : ''}" ${page === cle ? 'aria-current="page"' : ''}>${libelle}</a>`;
  const entete = document.createElement('header');
  entete.className = 'entete';
  entete.id = 'entete';
  entete.innerHTML = `
    <div class="entete-conteneur">
      <a href="${chemin('index.html')}" class="logo" aria-label="GNINOU_FOOD, accueil">
        <img src="${chemin('res/logo.png')}" alt="GNINOU_FOOD" width="736" height="552">
      </a>

      <nav class="nav-principale" id="navPrincipale" aria-label="Navigation principale">
        ${lien('index.html', '<i class="fa-solid fa-house" aria-hidden="true"></i> Accueil', 'accueil')}
        <div class="menu-categories">
          <button class="lien-nav ${page.startsWith('menu') ? 'actif' : ''}" id="boutonMenus" aria-expanded="false" aria-controls="listeMenus">
            <i class="fa-solid fa-utensils" aria-hidden="true"></i> Nos menus <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
          </button>
          <div class="liste-menus" id="listeMenus">
            ${CATEGORIES.map(c => `
              <a href="${chemin(c.page)}" class="lien-categorie ${page === 'menu-' + c.id ? 'actif' : ''}">
                <span class="lien-categorie-icone" style="--couleur-categorie:${c.couleur}"><i class="${c.icone}" aria-hidden="true"></i></span>
                <span><strong>${c.nom}</strong><small>${PLATS.filter(p => p.categorie === c.id).length} choix</small></span>
              </a>`).join('')}
          </div>
        </div>
        ${lien('index.html#livraison', '<i class="fa-solid fa-motorcycle" aria-hidden="true"></i> Livraison', 'livraison')}
        ${lien('index.html#contact', '<i class="fa-solid fa-envelope" aria-hidden="true"></i> Contact', 'contact')}
      </nav>

      <div class="recherche" role="search">
        <label for="champRecherche" class="visuellement-cache">Rechercher un plat</label>
        <i class="fa-solid fa-magnifying-glass recherche-icone" aria-hidden="true"></i>
        <input type="search" id="champRecherche" placeholder="Rechercher un plat..." autocomplete="off"
          role="combobox" aria-expanded="false" aria-controls="suggestions" aria-autocomplete="list">
        <ul class="suggestions" id="suggestions" role="listbox" hidden></ul>
      </div>

      <div class="actions-entete">
        <button class="bouton-icone" id="boutonTheme"></button>
        <a href="${chemin('Outils_site/compte.html')}" class="bouton-icone" id="lienCompte" aria-label="Mon compte"></a>
        <button class="bouton-icone bouton-panier" id="boutonPanier" aria-label="Ouvrir le panier" aria-controls="tiroirPanier" aria-expanded="false">
          <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i>
          <span class="compteur" id="compteurPanier">0</span>
        </button>
        <button class="bouton-icone bouton-burger" id="boutonBurger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="navPrincipale">
          <i class="fa-solid fa-bars" aria-hidden="true"></i>
        </button>
      </div>
    </div>`;
  document.body.prepend(entete);

  const evitement = document.createElement('a');
  evitement.href = '#contenu';
  evitement.className = 'lien-evitement';
  evitement.textContent = 'Aller au contenu';
  document.body.prepend(evitement);
}

function injecterPiedDePage() {
  const pied = document.createElement('footer');
  pied.className = 'pied-page';
  pied.innerHTML = `
    <div class="pied-conteneur">
      <div class="pied-marque">
        <img src="${chemin('res/logo.png')}" alt="GNINOU_FOOD" class="pied-logo" width="736" height="552" loading="lazy">
        <p>${CONFIG.slogan}.</p>
      </div>
      <div>
        <h2 class="pied-titre">Nos menus</h2>
        <ul class="pied-liste">
          ${CATEGORIES.map(c => `<li><a href="${chemin(c.page)}">${c.nom}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h2 class="pied-titre">Mon espace</h2>
        <ul class="pied-liste">
          <li><a href="${chemin('Outils_site/panier.html')}">Mon panier</a></li>
          <li><a href="${chemin('Outils_site/compte.html')}">Mon compte</a></li>
          <li><a href="${chemin('Outils_site/compte.html#commandes')}">Suivre une commande</a></li>
          <li><a href="${chemin('Outils_site/page_inscription.html')}">Créer un compte</a></li>
        </ul>
      </div>
      <div>
        <h2 class="pied-titre">Nous joindre</h2>
        <ul class="pied-liste pied-infos">
          <li><i class="fa-solid fa-envelope" aria-hidden="true"></i> <a href="mailto:${CONFIG.email}">${CONFIG.email}</a></li>
          ${CONFIG.telephoneAffiche ? `<li><i class="fa-solid fa-phone" aria-hidden="true"></i> ${CONFIG.telephoneAffiche}</li>` : ''}
          <li><i class="fa-solid fa-location-dot" aria-hidden="true"></i> ${CONFIG.adresse}</li>
          <li><i class="fa-solid fa-clock" aria-hidden="true"></i> ${CONFIG.horaires}</li>
        </ul>
        <div class="pied-paiements" aria-label="Moyens de paiement acceptés">
          ${CONFIG.paiements.map(p => `<span title="${p.nom}">${p.nom}</span>`).join('')}
        </div>
      </div>
    </div>
    <p class="pied-bas">${CONFIG.nom} · &copy; ${new Date().getFullYear()} ${CONFIG.titulaireDroits} · Tous droits réservés · Abidjan · <a href="${chemin('Outils_site/credits.html')}">Crédits photos</a></p>`;
  document.body.appendChild(pied);
}

function majEntete() {
  const compteur = document.getElementById('compteurPanier');
  const nombre = Panier.nombreArticles();
  compteur.textContent = nombre > 99 ? '99+' : nombre;
  compteur.hidden = nombre === 0;
  document.getElementById('boutonPanier').setAttribute('aria-label', `Ouvrir le panier (${nombre} article${nombre > 1 ? 's' : ''})`);

  const compte = Compte.courant();
  const lienCompte = document.getElementById('lienCompte');
  if (compte) {
    const initiales = compte.nom.split(/\s+/).map(m => m[0]).slice(0, 2).join('').toUpperCase();
    lienCompte.innerHTML = `<span class="avatar">${echapper(initiales)}</span>`;
    lienCompte.href = chemin('Outils_site/compte.html');
    lienCompte.setAttribute('aria-label', `Mon compte (${compte.nom})`);
  } else {
    lienCompte.innerHTML = '<i class="fa-regular fa-user" aria-hidden="true"></i>';
    lienCompte.href = chemin('Outils_site/page_connexion.html');
    lienCompte.setAttribute('aria-label', 'Se connecter');
  }
  lienCompte.title = lienCompte.getAttribute('aria-label');
}

function brancherEntete() {
  const entete = document.getElementById('entete');
  const surDefilement = () => entete.classList.toggle('reduit', window.scrollY > 30);
  surDefilement();
  window.addEventListener('scroll', surDefilement, { passive: true });

  // menu mobile
  const burger = document.getElementById('boutonBurger');
  const nav = document.getElementById('navPrincipale');
  const ouvrirNav = ouvert => {
    nav.classList.toggle('ouvert', ouvert);
    burger.setAttribute('aria-expanded', ouvert);
    burger.innerHTML = `<i class="fa-solid ${ouvert ? 'fa-xmark' : 'fa-bars'}" aria-hidden="true"></i>`;
    document.body.classList.toggle('nav-ouverte', ouvert);
  };
  burger.addEventListener('click', () => ouvrirNav(!nav.classList.contains('ouvert')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) ouvrirNav(false); });

  // sous-menu des catégories
  const boutonMenus = document.getElementById('boutonMenus');
  const listeMenus = document.getElementById('listeMenus');
  boutonMenus.addEventListener('click', e => {
    e.stopPropagation();
    const ouvert = listeMenus.classList.toggle('ouvert');
    boutonMenus.setAttribute('aria-expanded', ouvert);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.menu-categories')) {
      listeMenus.classList.remove('ouvert');
      boutonMenus.setAttribute('aria-expanded', 'false');
    }
  });

  document.getElementById('boutonTheme').addEventListener('click', () => {
    appliquerTheme(document.documentElement.dataset.theme === 'sombre' ? 'clair' : 'sombre');
  });

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (nav.classList.contains('ouvert')) { ouvrirNav(false); burger.focus(); }
    listeMenus.classList.remove('ouvert');
    boutonMenus.setAttribute('aria-expanded', 'false');
  });
}

// ============================================
// Recherche globale avec suggestions
// ============================================
function rechercherPlats(texte) {
  const mots = sansAccents(texte.trim()).split(/\s+/).filter(Boolean);
  if (!mots.length) return [];
  return PLATS.filter(p => {
    const contenu = sansAccents(`${p.nom} ${p.description} ${trouverCategorie(p.categorie).nom}`);
    return mots.every(m => contenu.includes(m));
  });
}

function brancherRecherche() {
  const champ = document.getElementById('champRecherche');
  const liste = document.getElementById('suggestions');
  let actif = -1;

  const fermer = () => { liste.hidden = true; champ.setAttribute('aria-expanded', 'false'); actif = -1; };
  const surligner = () => {
    [...liste.children].forEach((li, i) => li.setAttribute('aria-selected', i === actif));
    if (actif >= 0) champ.setAttribute('aria-activedescendant', liste.children[actif].id);
  };

  champ.addEventListener('input', () => {
    const resultats = rechercherPlats(champ.value).slice(0, 6);
    if (!champ.value.trim()) { fermer(); return; }
    liste.innerHTML = resultats.length
      ? resultats.map((p, i) => `
        <li id="suggestion-${i}" role="option" data-voir="${p.id}" aria-selected="false">
          ${htmlVisuelPlat(p, 'suggestion-visuel')}
          <span class="suggestion-texte"><strong>${echapper(p.nom)}</strong><small>${trouverCategorie(p.categorie).nom}</small></span>
          <span class="suggestion-prix">${formaterPrix(p.prix)}</span>
        </li>`).join('')
      : `<li class="suggestion-vide" role="option" aria-disabled="true">Aucun plat trouvé pour « ${echapper(champ.value)} »</li>`;
    liste.hidden = false;
    champ.setAttribute('aria-expanded', 'true');
    actif = -1;
  });

  champ.addEventListener('keydown', e => {
    const options = [...liste.querySelectorAll('[data-voir]')];
    if (e.key === 'ArrowDown' && options.length) { e.preventDefault(); actif = (actif + 1) % options.length; surligner(); }
    else if (e.key === 'ArrowUp' && options.length) { e.preventDefault(); actif = (actif - 1 + options.length) % options.length; surligner(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (actif >= 0) { ouvrirFichePlat(options[actif].dataset.voir); fermer(); }
      else if (champ.value.trim()) {
        window.location.href = `${chemin('services_pr/menu_local.html')}?recherche=${encodeURIComponent(champ.value.trim())}&tout=1`;
      }
    } else if (e.key === 'Escape') { fermer(); }
  });

  document.addEventListener('click', e => { if (!e.target.closest('.recherche')) fermer(); });
  liste.addEventListener('click', e => { if (e.target.closest('[data-voir]')) fermer(); });
}

// ============================================
// Fiche plat (fenêtre modale)
// ============================================
let elementAvantModale = null;

function ouvrirFichePlat(id) {
  const plat = trouverPlat(id);
  if (!plat) return;
  const categorie = trouverCategorie(plat.categorie);
  const similaires = PLATS.filter(p => p.categorie === plat.categorie && p.id !== plat.id).slice(0, 3);
  elementAvantModale = document.activeElement;

  let modale = document.getElementById('modalePlat');
  if (!modale) {
    modale = document.createElement('div');
    modale.id = 'modalePlat';
    modale.className = 'modale';
    modale.setAttribute('role', 'dialog');
    modale.setAttribute('aria-modal', 'true');
    modale.setAttribute('aria-labelledby', 'modaleTitre');
    document.body.appendChild(modale);
    modale.addEventListener('click', e => { if (e.target === modale || e.target.closest('[data-fermer]')) fermerFichePlat(); });
    modale.addEventListener('keydown', e => {
      if (e.key === 'Escape') fermerFichePlat();
      if (e.key === 'Tab') {
        const focusables = [...modale.querySelectorAll('button, a[href], input, textarea')];
        const premier = focusables[0], dernier = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
        else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
      }
    });
  }

  modale.innerHTML = `
    <div class="modale-boite">
      <button class="modale-fermer" data-fermer aria-label="Fermer"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      <div class="fiche-visuel">${htmlVisuelPlat(plat)}</div>
      <div class="fiche-contenu">
        <a class="fiche-categorie" href="${chemin(categorie.page)}" style="--couleur-categorie:${categorie.couleur}">
          <i class="${categorie.icone}" aria-hidden="true"></i> ${categorie.nom}
        </a>
        <h2 id="modaleTitre">${echapper(plat.nom)}</h2>
        <div class="carte-plat-tags">${htmlTags(plat)}</div>
        <p class="fiche-description">${echapper(plat.description)}</p>
        ${plat.tags.includes('alcool') ? '<p class="fiche-alerte"><i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i> Vente d\'alcool interdite aux moins de 18 ans. L\'abus d\'alcool est dangereux pour la santé.</p>' : ''}
        <p class="fiche-prix" id="fichePrix">${formaterPrix(plat.prix)}</p>
        <label class="fiche-label" for="ficheNote">Une précision ? <small>(facultatif)</small></label>
        <textarea id="ficheNote" rows="2" maxlength="120" placeholder="Ex. : sans piment, bien chaud..."></textarea>
        <div class="fiche-actions">
          <div class="quantite" role="group" aria-label="Quantité">
            <button data-quantite="-1" aria-label="Diminuer la quantité"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
            <output id="ficheQuantite" aria-live="polite">1</output>
            <button data-quantite="1" aria-label="Augmenter la quantité"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
          </div>
          <button class="bouton bouton-principal bouton-large" id="ficheAjouter">
            <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i> Ajouter · <span id="ficheTotal">${formaterPrix(plat.prix)}</span>
          </button>
        </div>
        ${similaires.length ? `
          <h3 class="fiche-similaires-titre">Dans la même catégorie</h3>
          <div class="fiche-similaires">
            ${similaires.map(s => `
              <button class="fiche-similaire" data-voir="${s.id}">
                ${htmlVisuelPlat(s, 'similaire-visuel')}
                <span><strong>${echapper(s.nom)}</strong><small>${formaterPrix(s.prix)}</small></span>
              </button>`).join('')}
          </div>` : ''}
      </div>
    </div>`;

  let quantite = 1;
  const majQuantite = () => {
    modale.querySelector('#ficheQuantite').textContent = quantite;
    modale.querySelector('#ficheTotal').textContent = formaterPrix(plat.prix * quantite);
  };
  modale.querySelectorAll('[data-quantite]').forEach(b => b.addEventListener('click', () => {
    quantite = Math.max(1, Math.min(20, quantite + Number(b.dataset.quantite)));
    majQuantite();
  }));
  modale.querySelector('#ficheAjouter').addEventListener('click', e => {
    const note = modale.querySelector('#ficheNote').value.trim();
    Panier.ajouter(plat.id, quantite, note);
    animerVersPanier(modale.querySelector('.fiche-visuel'));
    toast(`${quantite} × ${echapper(plat.nom)} ajouté${quantite > 1 ? 's' : ''} au panier`, {
      action: { libelle: 'Voir le panier', rappel: () => ouvrirTiroir() }
    });
    fermerFichePlat();
  });

  modale.classList.add('ouverte');
  document.body.classList.add('modale-active');
  window.requestAnimationFrame(() => modale.querySelector('#ficheAjouter').focus());
}

function fermerFichePlat() {
  const modale = document.getElementById('modalePlat');
  if (!modale || !modale.classList.contains('ouverte')) return;
  modale.classList.remove('ouverte');
  document.body.classList.remove('modale-active');
  if (elementAvantModale && document.contains(elementAvantModale)) elementAvantModale.focus();
}

// Petite image qui "vole" jusqu'au panier
function animerVersPanier(source) {
  const cible = document.getElementById('boutonPanier');
  cible.classList.remove('rebond');
  void cible.offsetWidth;
  cible.classList.add('rebond');
  if (mouvementReduit || !source) return;
  const depart = source.getBoundingClientRect();
  const arrivee = cible.getBoundingClientRect();
  const volant = document.createElement('div');
  volant.className = 'volant-panier';
  volant.innerHTML = '<i class="fa-solid fa-bowl-food" aria-hidden="true"></i>';
  volant.style.left = `${depart.left + depart.width / 2 - 22}px`;
  volant.style.top = `${depart.top + depart.height / 2 - 22}px`;
  document.body.appendChild(volant);
  volant.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${arrivee.left - depart.left - depart.width / 2 + 22}px, ${arrivee.top - depart.top - depart.height / 2 + 4}px) scale(.3)`, opacity: .6 }
  ], { duration: 700, easing: 'cubic-bezier(.5,-0.3,.7,1)' }).onfinish = () => volant.remove();
}

// ============================================
// Tiroir panier (aperçu rapide sur toutes les pages)
// ============================================
function creerTiroir() {
  const tiroir = document.createElement('aside');
  tiroir.className = 'tiroir';
  tiroir.id = 'tiroirPanier';
  tiroir.setAttribute('aria-labelledby', 'tiroirTitre');
  tiroir.innerHTML = `
    <div class="tiroir-fond" data-fermer-tiroir></div>
    <div class="tiroir-panneau" role="dialog" aria-modal="true" aria-labelledby="tiroirTitre">
      <div class="tiroir-entete">
        <h2 id="tiroirTitre"><i class="fa-solid fa-basket-shopping" aria-hidden="true"></i> Mon panier</h2>
        <button class="bouton-icone" data-fermer-tiroir aria-label="Fermer le panier"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
      </div>
      <div class="tiroir-contenu" id="tiroirContenu"></div>
      <div class="tiroir-pied" id="tiroirPied"></div>
    </div>`;
  document.body.appendChild(tiroir);

  tiroir.addEventListener('click', e => {
    if (e.target.closest('[data-fermer-tiroir]')) fermerTiroir();
    const bouton = e.target.closest('[data-ligne]');
    if (!bouton) return;
    const index = Number(bouton.dataset.ligne);
    const ligne = Panier.lignes()[index];
    if (bouton.dataset.action === 'plus') Panier.changerQuantite(index, ligne.quantite + 1);
    if (bouton.dataset.action === 'moins') Panier.changerQuantite(index, ligne.quantite - 1);
  });
  tiroir.addEventListener('keydown', e => { if (e.key === 'Escape') fermerTiroir(); });
  document.getElementById('boutonPanier').addEventListener('click', ouvrirTiroir);
}

function rendreTiroir() {
  const contenu = document.getElementById('tiroirContenu');
  const pied = document.getElementById('tiroirPied');
  if (!contenu) return;
  const lignes = Panier.lignes();
  if (!lignes.length) {
    contenu.innerHTML = `
      <div class="etat-vide">
        <i class="fa-solid fa-bowl-rice" aria-hidden="true"></i>
        <p>Ton panier est vide.</p>
        <a class="bouton bouton-principal" href="${chemin('services_pr/menu_local.html')}">Découvrir les menus</a>
      </div>`;
    pied.innerHTML = '';
    return;
  }
  contenu.innerHTML = `<ul class="tiroir-lignes">${lignes.map((l, i) => {
    const plat = trouverPlat(l.id);
    return `
      <li class="tiroir-ligne">
        ${htmlVisuelPlat(plat, 'tiroir-visuel')}
        <div class="tiroir-ligne-infos">
          <strong>${echapper(plat.nom)}</strong>
          ${l.note ? `<small class="note-ligne">« ${echapper(l.note)} »</small>` : ''}
          <span class="prix-petit">${formaterPrix(plat.prix * l.quantite)}</span>
        </div>
        <div class="quantite quantite-petite" role="group" aria-label="Quantité de ${echapper(plat.nom)}">
          <button data-ligne="${i}" data-action="moins" aria-label="Retirer un ${echapper(plat.nom)}"><i class="fa-solid ${l.quantite === 1 ? 'fa-trash-can' : 'fa-minus'}" aria-hidden="true"></i></button>
          <output>${l.quantite}</output>
          <button data-ligne="${i}" data-action="plus" aria-label="Ajouter un ${echapper(plat.nom)}"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
        </div>
      </li>`;
  }).join('')}</ul>`;
  const sousTotal = Panier.sousTotal();
  const reste = CONFIG.livraisonGratuiteDes - sousTotal;
  pied.innerHTML = `
    ${CONFIG.livraisonGratuiteDes > 0 ? `
      <div class="jauge-livraison">
        <p>${reste > 0 ? `Plus que <strong>${formaterPrix(reste)}</strong> pour la livraison offerte` : '<i class="fa-solid fa-gift" aria-hidden="true"></i> Livraison offerte débloquée !'}</p>
        <span class="jauge"><span style="width:${Math.min(100, sousTotal / CONFIG.livraisonGratuiteDes * 100)}%"></span></span>
      </div>` : ''}
    <p class="tiroir-total"><span>Sous-total</span><strong>${formaterPrix(sousTotal)}</strong></p>
    <a class="bouton bouton-principal bouton-large" href="${chemin('Outils_site/commande.html')}"><i class="fa-solid fa-check" aria-hidden="true"></i> Commander</a>
    <a class="bouton bouton-secondaire bouton-large" href="${chemin('Outils_site/panier.html')}">Voir le panier détaillé</a>`;
}

let elementAvantTiroir = null;
function ouvrirTiroir() {
  const tiroir = document.getElementById('tiroirPanier');
  elementAvantTiroir = document.activeElement;
  rendreTiroir();
  tiroir.classList.add('ouvert');
  document.body.classList.add('modale-active');
  document.getElementById('boutonPanier').setAttribute('aria-expanded', 'true');
  window.requestAnimationFrame(() => tiroir.querySelector('.tiroir-entete .bouton-icone').focus());
}

function fermerTiroir() {
  const tiroir = document.getElementById('tiroirPanier');
  if (!tiroir.classList.contains('ouvert')) return;
  tiroir.classList.remove('ouvert');
  document.body.classList.remove('modale-active');
  document.getElementById('boutonPanier').setAttribute('aria-expanded', 'false');
  if (elementAvantTiroir) elementAvantTiroir.focus();
}

// ============================================
// Actions délégués (fonctionnent sur tout contenu injecté)
// ============================================
function brancherActionsGlobales() {
  document.addEventListener('click', e => {
    const ajouter = e.target.closest('[data-ajouter]');
    if (ajouter) {
      const plat = trouverPlat(ajouter.dataset.ajouter);
      Panier.ajouter(plat.id, 1);
      animerVersPanier(ajouter.closest('.carte-plat') || ajouter);
      ajouter.classList.add('ajoute');
      ajouter.querySelector('span').textContent = 'Ajouté';
      window.setTimeout(() => {
        ajouter.classList.remove('ajoute');
        ajouter.querySelector('span').textContent = 'Ajouter';
      }, 1200);
      toast(`${echapper(plat.nom)} ajouté au panier`, { action: { libelle: 'Voir', rappel: () => ouvrirTiroir() } });
      return;
    }
    const voir = e.target.closest('[data-voir]');
    if (voir) { ouvrirFichePlat(voir.dataset.voir); return; }
    const favori = e.target.closest('[data-favori]');
    if (favori) {
      const ajoute = Favoris.basculer(favori.dataset.favori);
      document.querySelectorAll(`[data-favori="${favori.dataset.favori}"]`).forEach(b => {
        b.classList.toggle('actif', ajoute);
        b.setAttribute('aria-pressed', ajoute);
        b.innerHTML = `<i class="fa-${ajoute ? 'solid' : 'regular'} fa-heart" aria-hidden="true"></i>`;
      });
      toast(ajoute ? 'Ajouté à tes favoris' : 'Retiré de tes favoris', { icone: ajoute ? 'fa-solid fa-heart' : 'fa-regular fa-heart', type: 'info', duree: 1800 });
    }
  });

  document.addEventListener('panierChange', () => { majEntete(); rendreTiroir(); });
  // synchronisation entre onglets
  window.addEventListener('storage', e => {
    if (e.key === 'gf.panier') { majEntete(); rendreTiroir(); document.dispatchEvent(new CustomEvent('panierChangeExterne')); }
  });
}

// Apparition douce des éléments .apparition au défilement
function observerApparitions(racine = document) {
  const elements = racine.querySelectorAll('.apparition:not(.visible)');
  if (mouvementReduit || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }
  const observateur = new IntersectionObserver(entrees => {
    entrees.forEach(entree => {
      if (entree.isIntersecting) { entree.target.classList.add('visible'); observateur.unobserve(entree.target); }
    });
  }, { threshold: 0.12 });
  elements.forEach(el => observateur.observe(el));
}

// ============================================
// Démarrage
// ============================================
(function demarrer() {
  appliquerTheme(lire('theme', null) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair'));
  injecterEntete();
  injecterPiedDePage();
  creerTiroir();
  brancherEntete();
  brancherRecherche();
  brancherActionsGlobales();
  appliquerTheme(document.documentElement.dataset.theme);
  majEntete();
  observerApparitions();
})();
