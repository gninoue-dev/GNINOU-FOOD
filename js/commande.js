// ============================================
// GNINOU_FOOD — Commande en 3 étapes et suivi (Outils_site/commande.html)
// ?numero=GF-XXXXXX affiche le suivi d'une commande passée.
// Aucun paiement réel : site de démonstration sans serveur.
// ============================================
(function () {
  const zone = document.getElementById('contenuCommande');
  const parametres = new URLSearchParams(window.location.search);
  let minuteurSuivi = null;

  const ETAPES = ['Livraison', 'Paiement', 'Confirmation'];
  const brouillon = Object.assign({
    nom: '', telephone: '', commune: lire('zone', ''), adresse: '', instructions: '',
    paiement: 'especes', numeroMobile: '', majeur: false
  }, lire('brouillonCommande', {}));
  const compte = Compte.courant();
  if (compte) {
    brouillon.nom = brouillon.nom || compte.nom;
    brouillon.telephone = brouillon.telephone || compte.telephone;
    brouillon.commune = brouillon.commune || compte.commune;
    brouillon.adresse = brouillon.adresse || compte.adresse;
  }
  let etape = 0;

  // Numéro ivoirien : 10 chiffres commençant par 01, 05, 07, 21, 25 ou 27
  function telephoneValide(numero) {
    const chiffres = numero.replace(/\D/g, '').replace(/^225/, '');
    return /^(01|05|07|21|25|27)\d{8}$/.test(chiffres);
  }

  function formaterTelephone(numero) {
    const chiffres = numero.replace(/\D/g, '').replace(/^225/, '');
    return chiffres.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }

  // ============================================
  // Formulaire
  // ============================================
  function rendreFormulaire() {
    if (!Panier.lignes().length) {
      zone.innerHTML = `
        <div class="etat-vide carte-blanche">
          <i class="fa-solid fa-basket-shopping" aria-hidden="true"></i>
          <p>Ton panier est vide : ajoute quelques plats avant de commander.</p>
          <a class="bouton bouton-principal" href="${chemin('services_pr/menu_local.html')}">Voir les menus</a>
        </div>`;
      return;
    }
    const totaux = calculerTotaux(brouillon.commune, lire('promo', ''));
    zone.innerHTML = `
      <h1 class="titre-page"><i class="fa-solid fa-lock" aria-hidden="true"></i> Finaliser ma commande</h1>
      <ol class="progression" aria-label="Étapes de la commande">
        ${ETAPES.map((nom, i) => `<li class="${i < etape ? 'faite' : i === etape ? 'en-cours' : ''}" ${i === etape ? 'aria-current="step"' : ''}>
          <span>${i < etape ? '<i class="fa-solid fa-check" aria-hidden="true"></i>' : i + 1}</span>${nom}</li>`).join('')}
      </ol>
      <div class="grille-panier">
        <form class="carte-blanche formulaire-commande" id="formulaireCommande" novalidate>
          ${[htmlEtapeLivraison, htmlEtapePaiement, htmlEtapeConfirmation][etape]()}
          <div class="navigation-etapes">
            ${etape > 0 ? '<button type="button" class="bouton bouton-secondaire" id="etapePrecedente"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Retour</button>' : `<a class="bouton bouton-secondaire" href="panier.html"><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Panier</a>`}
            <button type="submit" class="bouton bouton-principal">
              ${etape < 2 ? 'Continuer <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>' : `<i class="fa-solid fa-check" aria-hidden="true"></i> Confirmer · ${formaterPrix(totaux.total)}`}
            </button>
          </div>
        </form>
        <aside class="carte-blanche resume" aria-labelledby="titreResumeCommande">
          <h2 id="titreResumeCommande">Ma commande</h2>
          <ul class="resume-lignes">
            ${Panier.lignes().map(l => {
              const plat = trouverPlat(l.id);
              return `<li><span class="resume-quantite">${l.quantite}×</span><span>${echapper(plat.nom)}${l.note ? `<small>« ${echapper(l.note)} »</small>` : ''}</span><strong>${formaterPrix(plat.prix * l.quantite)}</strong></li>`;
            }).join('')}
          </ul>
          ${htmlTotaux(totaux)}
          <a href="panier.html" class="bouton-texte"><i class="fa-solid fa-pen" aria-hidden="true"></i> Modifier le panier</a>
        </aside>
      </div>`;
    brancherFormulaire();
  }

  function champ(id, libelle, contenu, aide = '') {
    return `<div class="champ" id="bloc-${id}">
      <label for="${id}">${libelle}</label>
      ${contenu}
      ${aide ? `<p class="champ-aide">${aide}</p>` : ''}
      <p class="champ-erreur" id="erreur-${id}"></p>
    </div>`;
  }

  function htmlEtapeLivraison() {
    return `
      <h2 class="titre-etape"><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Où livrer ?</h2>
      ${!compte ? `<p class="encart-info"><i class="fa-solid fa-user" aria-hidden="true"></i> <span>Déjà client ? <a href="page_connexion.html?retour=commande.html">Connecte-toi</a> pour remplir ce formulaire automatiquement.</span></p>` : ''}
      <div class="deux-colonnes">
        ${champ('nom', 'Nom complet', `<input type="text" id="nom" autocomplete="name" value="${echapper(brouillon.nom)}" required>`)}
        ${champ('telephone', 'Téléphone', `<input type="tel" id="telephone" autocomplete="tel" inputmode="tel" placeholder="07 00 00 00 00" value="${echapper(brouillon.telephone)}" required>`, 'Le livreur t\'appelle à l\'arrivée.')}
      </div>
      ${champ('commune', 'Commune', `<select id="commune" required>
          <option value="">Choisir...</option>
          ${CONFIG.zones.map(z => `<option value="${z.nom}" ${z.nom === brouillon.commune ? 'selected' : ''}>${z.nom} · ${formaterPrix(z.frais)} · ${z.delai} min</option>`).join('')}
        </select>`)}
      ${champ('adresse', 'Adresse et point de repère', `<input type="text" id="adresse" autocomplete="street-address" placeholder="Ex. : Riviera 2, en face de la pharmacie" value="${echapper(brouillon.adresse)}" required>`)}
      ${champ('instructions', 'Instructions pour le livreur <small>(facultatif)</small>', `<textarea id="instructions" rows="2" placeholder="Ex. : portail bleu, 2e étage">${echapper(brouillon.instructions)}</textarea>`)}`;
  }

  function htmlEtapePaiement() {
    return `
      <h2 class="titre-etape"><i class="fa-solid fa-wallet" aria-hidden="true"></i> Comment payer ?</h2>
      <fieldset class="choix-paiement">
        <legend class="visuellement-cache">Moyen de paiement</legend>
        ${CONFIG.paiements.map(p => `
          <label class="option-paiement option-${p.id}">
            <input type="radio" name="paiement" value="${p.id}" ${brouillon.paiement === p.id ? 'checked' : ''}>
            <span class="option-paiement-icone"><i class="${p.icone}" aria-hidden="true"></i></span>
            <span>${p.nom}</span>
          </label>`).join('')}
      </fieldset>
      <div id="blocNumeroMobile" ${brouillon.paiement === 'especes' ? 'hidden' : ''}>
        ${champ('numeroMobile', 'Numéro du compte Mobile Money', `<input type="tel" id="numeroMobile" inputmode="tel" placeholder="07 00 00 00 00" value="${echapper(brouillon.numeroMobile || brouillon.telephone)}">`, 'Tu recevras une demande de paiement à valider sur ton téléphone.')}
      </div>
      ${Panier.contientAlcool() ? `
        <div class="champ" id="bloc-majeur">
          <label class="case-a-cocher"><input type="checkbox" id="majeur" ${brouillon.majeur ? 'checked' : ''}> Je certifie avoir 18 ans ou plus (ma commande contient de l'alcool).</label>
          <p class="champ-erreur" id="erreur-majeur"></p>
        </div>` : ''}`;
  }

  function htmlEtapeConfirmation() {
    const paiement = CONFIG.paiements.find(p => p.id === brouillon.paiement);
    const zoneLivraison = CONFIG.zones.find(z => z.nom === brouillon.commune);
    return `
      <h2 class="titre-etape"><i class="fa-solid fa-clipboard-check" aria-hidden="true"></i> On vérifie ?</h2>
      <div class="recapitulatif">
        <div>
          <h3><i class="fa-solid fa-location-dot" aria-hidden="true"></i> Livraison <button type="button" class="bouton-texte" data-aller-etape="0">Modifier</button></h3>
          <p><strong>${echapper(brouillon.nom)}</strong> · ${formaterTelephone(brouillon.telephone)}</p>
          <p>${echapper(brouillon.adresse)}, ${echapper(brouillon.commune)}</p>
          ${brouillon.instructions ? `<p class="note-ligne">« ${echapper(brouillon.instructions)} »</p>` : ''}
          <p class="delai"><i class="fa-solid fa-stopwatch" aria-hidden="true"></i> Livraison estimée : ${zoneLivraison ? zoneLivraison.delai : '?'} min</p>
        </div>
        <div>
          <h3><i class="fa-solid fa-wallet" aria-hidden="true"></i> Paiement <button type="button" class="bouton-texte" data-aller-etape="1">Modifier</button></h3>
          <p><i class="${paiement.icone}" aria-hidden="true"></i> ${paiement.nom}${brouillon.paiement !== 'especes' ? ` · ${formaterTelephone(brouillon.numeroMobile)}` : ''}</p>
        </div>
      </div>
      <p class="encart-info"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Site de démonstration : aucun paiement n'est réellement débité.</span></p>`;
  }

  function erreur(id, message) {
    const bloc = document.getElementById(`bloc-${id}`);
    if (!bloc) return true;
    bloc.classList.toggle('invalide', !!message);
    document.getElementById(`erreur-${id}`).textContent = message || '';
    return !message;
  }

  function validerEtape() {
    let premierInvalide = null;
    const verifier = (id, message) => {
      const ok = erreur(id, message);
      if (!ok && !premierInvalide) premierInvalide = document.getElementById(id);
    };
    if (etape === 0) {
      ['nom', 'telephone', 'commune', 'adresse', 'instructions'].forEach(id => { brouillon[id] = document.getElementById(id).value.trim(); });
      verifier('nom', brouillon.nom.length < 2 ? 'Indique ton nom.' : '');
      verifier('telephone', !telephoneValide(brouillon.telephone) ? 'Numéro invalide : 10 chiffres, ex. 07 00 00 00 00.' : '');
      verifier('commune', !brouillon.commune ? 'Choisis ta commune.' : '');
      verifier('adresse', brouillon.adresse.length < 5 ? 'Donne une adresse ou un point de repère.' : '');
      if (brouillon.commune) ecrire('zone', brouillon.commune);
    } else if (etape === 1) {
      brouillon.paiement = document.querySelector('input[name="paiement"]:checked').value;
      if (brouillon.paiement !== 'especes') {
        brouillon.numeroMobile = document.getElementById('numeroMobile').value.trim();
        verifier('numeroMobile', !telephoneValide(brouillon.numeroMobile) ? 'Numéro Mobile Money invalide.' : '');
      }
      if (Panier.contientAlcool()) {
        brouillon.majeur = document.getElementById('majeur').checked;
        verifier('majeur', !brouillon.majeur ? 'Obligatoire pour commander de l\'alcool.' : '');
      }
    }
    ecrire('brouillonCommande', brouillon);
    if (premierInvalide) { premierInvalide.focus(); return false; }
    return true;
  }

  function brancherFormulaire() {
    const formulaire = document.getElementById('formulaireCommande');
    formulaire.addEventListener('submit', e => {
      e.preventDefault();
      if (!validerEtape()) return;
      if (etape < 2) { etape++; rendreEtSuivre(); }
      else passerCommande();
    });
    document.getElementById('etapePrecedente')?.addEventListener('click', () => { validerEtapeSansErreur(); etape--; rendreEtSuivre(); });
    formulaire.querySelectorAll('[data-aller-etape]').forEach(b => b.addEventListener('click', () => { etape = Number(b.dataset.allerEtape); rendreEtSuivre(); }));
    formulaire.querySelectorAll('input[name="paiement"]').forEach(r => r.addEventListener('change', () => {
      document.getElementById('blocNumeroMobile').hidden = r.value === 'especes' && r.checked;
      if (r.checked) brouillon.paiement = r.value;
    }));
    const commune = document.getElementById('commune');
    commune?.addEventListener('change', () => { brouillon.commune = commune.value; ecrire('zone', commune.value); majResume(); });
    const telephone = document.getElementById('telephone');
    telephone?.addEventListener('blur', () => { if (telephoneValide(telephone.value)) telephone.value = formaterTelephone(telephone.value); });
  }

  function validerEtapeSansErreur() {
    if (etape === 1) brouillon.paiement = document.querySelector('input[name="paiement"]:checked')?.value || brouillon.paiement;
    ecrire('brouillonCommande', brouillon);
  }

  function majResume() {
    const totaux = calculerTotaux(brouillon.commune, lire('promo', ''));
    const ancien = document.querySelector('.resume .totaux');
    const jauge = document.querySelector('.resume .jauge-livraison');
    if (jauge) jauge.remove();
    ancien.outerHTML = htmlTotaux(totaux);
  }

  function rendreEtSuivre() {
    rendreFormulaire();
    window.scrollTo({ top: 0, behavior: mouvementReduit ? 'auto' : 'smooth' });
    document.querySelector('.titre-etape')?.setAttribute('tabindex', '-1');
    document.querySelector('.titre-etape')?.focus({ preventScroll: true });
  }

  // ============================================
  // Validation finale
  // ============================================
  function passerCommande() {
    const code = lire('promo', '');
    const totaux = calculerTotaux(brouillon.commune, code);
    const numero = `GF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const commande = {
      numero,
      date: Date.now(),
      email: compte ? compte.email : null,
      lignes: Panier.lignes().map(l => ({ ...l, nom: trouverPlat(l.id).nom, prix: trouverPlat(l.id).prix })),
      nom: brouillon.nom,
      telephone: formaterTelephone(brouillon.telephone),
      commune: brouillon.commune,
      adresse: brouillon.adresse,
      instructions: brouillon.instructions,
      paiement: brouillon.paiement,
      codePromo: totaux.pourcentage ? code.toUpperCase() : '',
      sousTotal: totaux.sousTotal,
      remise: totaux.remise,
      livraison: totaux.livraison,
      total: totaux.total,
      delai: totaux.zone ? totaux.zone.delai : ''
    };
    Commandes.ajouter(commande);
    if (compte) Compte.mettreAJour({ telephone: brouillon.telephone, commune: brouillon.commune, adresse: brouillon.adresse });
    Panier.vider();
    ecrire('promo', '');
    ecrire('brouillonCommande', { ...brouillon, instructions: '' });
    history.replaceState(null, '', `?numero=${numero}`);
    rendreSuivi(commande, true);
    lancerConfettis();
  }

  // ============================================
  // Suivi de commande
  // ============================================
  function messageWhatsapp(commande) {
    const lignes = commande.lignes.map(l => `- ${l.quantite} x ${l.nom}${l.note ? ` (${l.note})` : ''}`).join('\n');
    return `Bonjour ${CONFIG.nom} ! Commande ${commande.numero}\n${lignes}\nTotal : ${formaterPrix(commande.total)}\nLivraison : ${commande.adresse}, ${commande.commune}\nNom : ${commande.nom} - ${commande.telephone}`;
  }

  function rendreSuivi(commande, nouvelle) {
    const paiement = CONFIG.paiements.find(p => p.id === commande.paiement);
    const etapeActuelle = etapeCommande(commande);
    zone.innerHTML = `
      <section class="carte-blanche suivi" aria-labelledby="titreSuivi">
        ${nouvelle ? `<div class="suivi-merci"><span class="suivi-merci-icone"><i class="fa-solid fa-check" aria-hidden="true"></i></span>
          <h1 id="titreSuivi">Merci ${echapper(commande.nom.split(' ')[0])}, c'est validé !</h1>
          <p>On est ensemble : ta commande part en cuisine.</p></div>`
        : `<h1 id="titreSuivi" class="titre-page"><i class="fa-solid fa-motorcycle" aria-hidden="true"></i> Suivi de commande</h1>`}
        <p class="suivi-numero">Commande <strong>${commande.numero}</strong> · ${new Date(commande.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>

        <ol class="frise" aria-label="Avancement de la commande">
          ${ETAPES_SUIVI.map((e, i) => `
            <li class="${i < etapeActuelle ? 'faite' : i === etapeActuelle ? 'en-cours' : ''}" ${i === etapeActuelle ? 'aria-current="step"' : ''}>
              <span class="frise-icone"><i class="${e.icone}" aria-hidden="true"></i></span>
              <span class="frise-nom">${e.nom}</span>
            </li>`).join('')}
        </ol>
        <p class="suivi-statut" aria-live="polite">${etapeActuelle < 3 ? `<i class="fa-solid fa-stopwatch" aria-hidden="true"></i> Livraison estimée dans ${commande.delai || '30-45'} min` : '<i class="fa-solid fa-face-smile" aria-hidden="true"></i> Livrée. Bon appétit !'}</p>

        <div class="suivi-details">
          <div>
            <h2>Articles</h2>
            <ul class="resume-lignes">
              ${commande.lignes.map(l => `<li><span class="resume-quantite">${l.quantite}×</span><span>${echapper(l.nom)}</span><strong>${formaterPrix(l.prix * l.quantite)}</strong></li>`).join('')}
            </ul>
            <dl class="totaux">
              <div><dt>Sous-total</dt><dd>${formaterPrix(commande.sousTotal)}</dd></div>
              ${commande.remise ? `<div class="ligne-remise"><dt>Code ${commande.codePromo}</dt><dd>- ${formaterPrix(commande.remise)}</dd></div>` : ''}
              <div><dt>Livraison</dt><dd>${commande.livraison ? formaterPrix(commande.livraison) : '<span class="offerte">Offerte</span>'}</dd></div>
              <div class="ligne-total-general"><dt>Total</dt><dd>${formaterPrix(commande.total)}</dd></div>
            </dl>
          </div>
          <div>
            <h2>Livraison</h2>
            <p><strong>${echapper(commande.nom)}</strong><br>${commande.telephone}<br>${echapper(commande.adresse)}, ${echapper(commande.commune)}</p>
            <h2>Paiement</h2>
            <p><i class="${paiement.icone}" aria-hidden="true"></i> ${paiement.nom}</p>
          </div>
        </div>

        <div class="suivi-actions">
          ${CONFIG.whatsapp ? `<a class="bouton bouton-vert" target="_blank" rel="noopener" href="https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(messageWhatsapp(commande))}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Envoyer sur WhatsApp</a>` : ''}
          <button class="bouton bouton-principal" id="recommander"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Commander à nouveau</button>
          <a class="bouton bouton-secondaire" href="${compte ? 'compte.html#commandes' : '../index.html'}">${compte ? 'Mes commandes' : 'Retour à l\'accueil'}</a>
        </div>
        <p class="encart-info"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> <span>Site de démonstration : le suivi avance automatiquement pour la démo.</span></p>
      </section>`;

    document.getElementById('recommander').addEventListener('click', () => {
      commande.lignes.forEach(l => { if (trouverPlat(l.id)) Panier.ajouter(l.id, l.quantite, l.note || ''); });
      toast('Articles ajoutés au panier', { action: { libelle: 'Voir', rappel: () => ouvrirTiroir() } });
    });

    window.clearTimeout(minuteurSuivi);
    if (etapeActuelle < 3) minuteurSuivi = window.setTimeout(() => rendreSuivi(commande, false), 15000);
  }

  function lancerConfettis() {
    if (mouvementReduit) return;
    const couleurs = ['#F77F00', '#FFFFFF', '#009E60', '#D62828', '#FFB703'];
    const conteneur = document.createElement('div');
    conteneur.className = 'confettis';
    conteneur.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 90; i++) {
      const piece = document.createElement('span');
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = couleurs[i % couleurs.length];
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.animationDuration = `${2.2 + Math.random() * 1.6}s`;
      piece.style.setProperty('--derive', `${(Math.random() - 0.5) * 240}px`);
      conteneur.appendChild(piece);
    }
    document.body.appendChild(conteneur);
    window.setTimeout(() => conteneur.remove(), 4500);
  }

  // ---------- Démarrage ----------
  const numero = parametres.get('numero');
  const commandeExistante = numero && Commandes.trouver(numero);
  if (commandeExistante) rendreSuivi(commandeExistante, false);
  else rendreFormulaire();
})();
