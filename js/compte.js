// ============================================
// GNINOU_FOOD — Espace client (Outils_site/compte.html)
// Onglets : #profil, #commandes, #favoris
// ============================================
(function () {
  const compte = Compte.courant();
  if (!compte) {
    window.location.replace(`page_connexion.html?retour=compte.html${encodeURIComponent(window.location.hash)}`);
    return;
  }
  const zone = document.getElementById('contenuCompte');
  const ONGLETS = [
    { id: 'commandes', nom: 'Mes commandes', icone: 'fa-solid fa-receipt' },
    { id: 'favoris', nom: 'Mes favoris', icone: 'fa-solid fa-heart' },
    { id: 'profil', nom: 'Mon profil', icone: 'fa-solid fa-user-pen' }
  ];
  let ongletActif = ONGLETS.some(o => `#${o.id}` === window.location.hash) ? window.location.hash.slice(1) : 'commandes';

  function rendre() {
    const c = Compte.courant();
    const commandes = Commandes.duCompte();
    const totalDepense = commandes.reduce((t, cmd) => t + cmd.total, 0);
    const initiales = c.nom.split(/\s+/).map(m => m[0]).slice(0, 2).join('').toUpperCase();
    zone.innerHTML = `
      <section class="compte-entete">
        <span class="compte-avatar">${echapper(initiales)}</span>
        <div>
          <p class="compte-sur">Akwaba,</p>
          <h1>${echapper(c.nom)}</h1>
          <p class="compte-email">${echapper(c.email)}</p>
        </div>
        <dl class="compte-chiffres">
          <div><dt>Commandes</dt><dd>${commandes.length}</dd></div>
          <div><dt>Favoris</dt><dd>${Favoris.liste().length}</dd></div>
          <div><dt>Total commandé</dt><dd>${formaterPrix(totalDepense)}</dd></div>
        </dl>
        <button class="bouton bouton-secondaire" id="deconnexion"><i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i> Déconnexion</button>
      </section>

      <div class="onglets-compte" role="tablist" aria-label="Mon espace">
        ${ONGLETS.map(o => `
          <button role="tab" id="onglet-${o.id}" aria-controls="panneau-${o.id}" aria-selected="${o.id === ongletActif}" tabindex="${o.id === ongletActif ? 0 : -1}" data-onglet="${o.id}">
            <i class="${o.icone}" aria-hidden="true"></i> ${o.nom}
          </button>`).join('')}
      </div>
      ${ONGLETS.map(o => `<section class="panneau-compte" role="tabpanel" id="panneau-${o.id}" aria-labelledby="onglet-${o.id}" ${o.id === ongletActif ? '' : 'hidden'}></section>`).join('')}`;

    rendreCommandes(commandes);
    rendreFavoris();
    rendreProfil(c);
    brancher();
  }

  function rendreCommandes(commandes) {
    const panneau = document.getElementById('panneau-commandes');
    if (!commandes.length) {
      panneau.innerHTML = `
        <div class="etat-vide carte-blanche">
          <i class="fa-solid fa-receipt" aria-hidden="true"></i>
          <p>Aucune commande pour l'instant. Le garba t'attend !</p>
          <a class="bouton bouton-principal" href="../services_pr/menu_local.html">Commander</a>
        </div>`;
      return;
    }
    panneau.innerHTML = `<ul class="liste-commandes">${commandes.map(cmd => {
      const etape = etapeCommande(cmd);
      return `
        <li class="carte-commande">
          <div class="carte-commande-entete">
            <div>
              <strong>${cmd.numero}</strong>
              <small>${new Date(cmd.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</small>
            </div>
            <span class="statut statut-${etape}"><i class="${ETAPES_SUIVI[etape].icone}" aria-hidden="true"></i> ${ETAPES_SUIVI[etape].nom}</span>
          </div>
          <div class="carte-commande-plats">
            ${cmd.lignes.slice(0, 4).map(l => {
              const plat = trouverPlat(l.id);
              return plat ? `<span class="mini-plat" title="${echapper(l.nom)}">${htmlVisuelPlat(plat, 'mini-plat-visuel')}<b>${l.quantite}</b></span>` : '';
            }).join('')}
            ${cmd.lignes.length > 4 ? `<span class="mini-plus">+${cmd.lignes.length - 4}</span>` : ''}
            <p>${cmd.lignes.map(l => `${l.quantite}× ${echapper(l.nom)}`).join(', ')}</p>
          </div>
          <div class="carte-commande-pied">
            <strong class="prix">${formaterPrix(cmd.total)}</strong>
            <div>
              <a class="bouton bouton-secondaire" href="commande.html?numero=${cmd.numero}"><i class="fa-solid fa-location-crosshairs" aria-hidden="true"></i> Suivre</a>
              <button class="bouton bouton-principal" data-recommander="${cmd.numero}"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i> Recommander</button>
            </div>
          </div>
        </li>`;
    }).join('')}</ul>`;
  }

  function rendreFavoris() {
    const panneau = document.getElementById('panneau-favoris');
    const favoris = Favoris.liste().map(trouverPlat).filter(Boolean);
    panneau.innerHTML = favoris.length
      ? `<div class="grille-plats">${favoris.map(htmlCartePlat).join('')}</div>`
      : `<div class="etat-vide carte-blanche">
           <i class="fa-regular fa-heart" aria-hidden="true"></i>
           <p>Touche le cœur d'un plat pour le retrouver ici.</p>
           <a class="bouton bouton-principal" href="../index.html#plats-du-jour">Voir les plats du jour</a>
         </div>`;
  }

  function rendreProfil(c) {
    document.getElementById('panneau-profil').innerHTML = `
      <form class="carte-blanche formulaire-profil" id="formulaireProfil" novalidate>
        <h2>Mes informations</h2>
        <div class="deux-colonnes">
          <div class="champ"><label for="profilNom">Nom complet</label><input id="profilNom" autocomplete="name" value="${echapper(c.nom)}" required></div>
          <div class="champ"><label for="profilTelephone">Téléphone</label><input id="profilTelephone" type="tel" autocomplete="tel" value="${echapper(c.telephone)}" placeholder="07 00 00 00 00"></div>
        </div>
        <h2>Adresse de livraison par défaut</h2>
        <div class="deux-colonnes">
          <div class="champ"><label for="profilCommune">Commune</label>
            <select id="profilCommune"><option value="">Choisir...</option>${CONFIG.zones.map(z => `<option ${z.nom === c.commune ? 'selected' : ''}>${z.nom}</option>`).join('')}</select>
          </div>
          <div class="champ"><label for="profilAdresse">Adresse et repère</label><input id="profilAdresse" autocomplete="street-address" value="${echapper(c.adresse)}"></div>
        </div>
        <button class="bouton bouton-principal" type="submit"><i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Enregistrer</button>
      </form>
      <div class="carte-blanche zone-danger">
        <h2>Zone sensible</h2>
        <p>Supprime ton compte et tes données de ce navigateur.</p>
        <button class="bouton bouton-secondaire" id="supprimerCompte"><i class="fa-solid fa-user-xmark" aria-hidden="true"></i> <span>Supprimer mon compte</span></button>
      </div>`;
  }

  function changerOnglet(id, focus) {
    ongletActif = id;
    history.replaceState(null, '', `#${id}`);
    document.querySelectorAll('[role="tab"]').forEach(t => {
      const actif = t.dataset.onglet === id;
      t.setAttribute('aria-selected', actif);
      t.tabIndex = actif ? 0 : -1;
      if (actif && focus) t.focus();
    });
    document.querySelectorAll('[role="tabpanel"]').forEach(p => { p.hidden = p.id !== `panneau-${id}`; });
  }

  function brancher() {
    const onglets = [...document.querySelectorAll('[role="tab"]')];
    onglets.forEach((onglet, i) => {
      onglet.addEventListener('click', () => changerOnglet(onglet.dataset.onglet));
      onglet.addEventListener('keydown', e => {
        if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        const suivant = onglets[(i + (e.key === 'ArrowRight' ? 1 : -1) + onglets.length) % onglets.length];
        changerOnglet(suivant.dataset.onglet, true);
      });
    });

    document.getElementById('deconnexion').addEventListener('click', () => {
      Compte.deconnecter();
      window.location.assign('../index.html');
    });

    zone.addEventListener('click', e => {
      const bouton = e.target.closest('[data-recommander]');
      if (!bouton) return;
      const commande = Commandes.trouver(bouton.dataset.recommander);
      commande.lignes.forEach(l => { if (trouverPlat(l.id)) Panier.ajouter(l.id, l.quantite, l.note || ''); });
      animerVersPanier(bouton);
      toast('Commande ajoutée au panier', { action: { libelle: 'Voir', rappel: () => ouvrirTiroir() } });
    });

    document.getElementById('formulaireProfil').addEventListener('submit', e => {
      e.preventDefault();
      const nom = document.getElementById('profilNom').value.trim();
      if (nom.length < 2) { toast('Indique ton nom.', { type: 'erreur', icone: 'fa-solid fa-circle-exclamation' }); return; }
      Compte.mettreAJour({
        nom,
        telephone: document.getElementById('profilTelephone').value.trim(),
        commune: document.getElementById('profilCommune').value,
        adresse: document.getElementById('profilAdresse').value.trim()
      });
      majEntete();
      rendre();
      changerOnglet('profil');
      toast('Profil enregistré');
    });

    let confirmation = false;
    document.getElementById('supprimerCompte').addEventListener('click', e => {
      const bouton = e.currentTarget;
      if (!confirmation) {
        confirmation = true;
        bouton.classList.add('a-confirmer');
        bouton.querySelector('span').textContent = 'Cliquer encore pour confirmer';
        return;
      }
      const comptes = Compte.comptes();
      delete comptes[Compte.courant().email];
      ecrire('comptes', comptes);
      Compte.deconnecter();
      window.location.assign('../index.html');
    });
  }

  document.addEventListener('favorisChange', () => { if (ongletActif === 'favoris') rendreFavoris(); });
  rendre();
})();
