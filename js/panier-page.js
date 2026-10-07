// ============================================
// GNINOU_FOOD — Page panier (Outils_site/panier.html)
// ============================================
(function () {
  const zoneContenu = document.getElementById('contenuPanier');
  let confirmationVider = false;

  function rendre() {
    const lignes = Panier.lignes();
    if (!lignes.length) {
      zoneContenu.innerHTML = `
        <div class="etat-vide carte-blanche">
          <i class="fa-solid fa-bowl-rice" aria-hidden="true"></i>
          <p>Ton panier est vide... et ton ventre aussi ?</p>
          <div class="boutons-vide">
            ${CATEGORIES.map(c => `<a class="bouton bouton-secondaire" href="${chemin(c.page)}"><i class="${c.icone}" aria-hidden="true"></i> ${c.nom}</a>`).join('')}
          </div>
        </div>`;
      return;
    }

    const zone = lire('zone', '');
    const code = lire('promo', '');
    const totaux = calculerTotaux(zone, code);
    const dansPanier = new Set(lignes.map(l => l.id));
    const suggestions = PLATS.filter(p => ['boissons', 'douceurs'].includes(p.categorie) && p.tags.includes('duJour') && !dansPanier.has(p.id)).slice(0, 3);

    zoneContenu.innerHTML = `
      <div class="grille-panier">
        <section class="carte-blanche" aria-labelledby="titreArticles">
          <div class="entete-bloc">
            <h2 id="titreArticles">${Panier.nombreArticles()} article${Panier.nombreArticles() > 1 ? 's' : ''}</h2>
            <button class="bouton-texte" id="boutonVider"><i class="fa-solid fa-trash" aria-hidden="true"></i> <span>Vider le panier</span></button>
          </div>
          <ul class="lignes-panier">
            ${lignes.map((l, i) => {
              const plat = trouverPlat(l.id);
              return `
                <li class="ligne-panier">
                  <button class="ligne-visuel" data-voir="${plat.id}" aria-label="Voir ${echapper(plat.nom)}">${htmlVisuelPlat(plat)}</button>
                  <div class="ligne-infos">
                    <h3>${echapper(plat.nom)}</h3>
                    <p class="ligne-unitaire">${formaterPrix(plat.prix)} l'unité</p>
                    ${l.note ? `<p class="note-ligne"><i class="fa-solid fa-pen" aria-hidden="true"></i> ${echapper(l.note)}</p>` : ''}
                  </div>
                  <div class="quantite" role="group" aria-label="Quantité de ${echapper(plat.nom)}">
                    <button data-index="${i}" data-action="moins" aria-label="Retirer un"><i class="fa-solid fa-minus" aria-hidden="true"></i></button>
                    <output>${l.quantite}</output>
                    <button data-index="${i}" data-action="plus" aria-label="Ajouter un"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
                  </div>
                  <p class="ligne-total">${formaterPrix(plat.prix * l.quantite)}</p>
                  <button class="bouton-icone ligne-supprimer" data-index="${i}" data-action="supprimer" aria-label="Supprimer ${echapper(plat.nom)}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                </li>`;
            }).join('')}
          </ul>
          ${suggestions.length ? `
            <div class="suggestions-panier">
              <h3><i class="fa-solid fa-wand-magic-sparkles" aria-hidden="true"></i> Ça va avec ta commande</h3>
              <div class="liste-suggestions">
                ${suggestions.map(p => `
                  <div class="suggestion-mini">
                    ${htmlVisuelPlat(p, 'suggestion-mini-visuel')}
                    <span><strong>${echapper(p.nom)}</strong><small>${formaterPrix(p.prix)}</small></span>
                    <button class="bouton-icone" data-ajouter-mini="${p.id}" aria-label="Ajouter ${echapper(p.nom)}"><i class="fa-solid fa-plus" aria-hidden="true"></i></button>
                  </div>`).join('')}
              </div>
            </div>` : ''}
        </section>

        <aside class="carte-blanche resume" aria-labelledby="titreResume">
          <h2 id="titreResume">Résumé</h2>
          <div class="champ">
            <label for="panierZone">Commune de livraison</label>
            <select id="panierZone">
              <option value="">Choisir ma commune...</option>
              ${CONFIG.zones.map(z => `<option value="${z.nom}" ${z.nom === zone ? 'selected' : ''}>${z.nom} (${z.delai} min)</option>`).join('')}
            </select>
          </div>
          <form class="champ-promo" id="formulairePromo">
            <label for="champPromo" class="visuellement-cache">Code promo</label>
            <input type="text" id="champPromo" placeholder="Code promo" value="${echapper(code)}" autocomplete="off">
            <button class="bouton bouton-secondaire" type="submit">Appliquer</button>
          </form>
          <p class="message-promo" id="messagePromo">${totaux.pourcentage ? `<i class="fa-solid fa-circle-check" aria-hidden="true"></i> Code ${echapper(code.toUpperCase())} : -${totaux.pourcentage} %` : ''}</p>
          ${htmlTotaux(totaux)}
          <a class="bouton bouton-principal bouton-large bouton-commander" href="commande.html"><i class="fa-solid fa-lock" aria-hidden="true"></i> Passer la commande</a>
          <ul class="reassurance">
            <li><i class="fa-solid fa-mobile-screen" aria-hidden="true"></i> Mobile Money ou espèces</li>
            <li><i class="fa-solid fa-motorcycle" aria-hidden="true"></i> Livraison rapide</li>
            <li><i class="fa-solid fa-headset" aria-hidden="true"></i> Service client disponible</li>
          </ul>
        </aside>
      </div>`;
    brancher();
  }

  function brancher() {
    zoneContenu.querySelector('.lignes-panier').addEventListener('click', e => {
      const bouton = e.target.closest('[data-action]');
      if (!bouton) return;
      const index = Number(bouton.dataset.index);
      const ligne = Panier.lignes()[index];
      if (bouton.dataset.action === 'plus') Panier.changerQuantite(index, ligne.quantite + 1);
      else if (bouton.dataset.action === 'moins' && ligne.quantite > 1) Panier.changerQuantite(index, ligne.quantite - 1);
      else supprimer(index);
    });
    zoneContenu.querySelectorAll('[data-ajouter-mini]').forEach(b => b.addEventListener('click', () => {
      Panier.ajouter(b.dataset.ajouterMini, 1);
      animerVersPanier(b);
      toast(`${echapper(trouverPlat(b.dataset.ajouterMini).nom)} ajouté !`);
    }));
    document.getElementById('panierZone').addEventListener('change', e => { ecrire('zone', e.target.value); rendre(); });
    document.getElementById('formulairePromo').addEventListener('submit', e => {
      e.preventDefault();
      const code = document.getElementById('champPromo').value.trim().toUpperCase();
      if (!code) { ecrire('promo', ''); rendre(); return; }
      if (CONFIG.codesPromo[code]) {
        ecrire('promo', code);
        rendre();
        toast(`Code ${code} appliqué : -${CONFIG.codesPromo[code]} %`, { icone: 'fa-solid fa-tag' });
      } else {
        const message = document.getElementById('messagePromo');
        message.innerHTML = '<i class="fa-solid fa-circle-xmark" aria-hidden="true"></i> Ce code n\'existe pas.';
        message.classList.add('erreur');
      }
    });
    document.getElementById('boutonVider').addEventListener('click', e => {
      const bouton = e.currentTarget;
      if (!confirmationVider) {
        confirmationVider = true;
        bouton.querySelector('span').textContent = 'Confirmer ?';
        bouton.classList.add('a-confirmer');
        window.setTimeout(() => { confirmationVider = false; if (document.contains(bouton)) { bouton.querySelector('span').textContent = 'Vider le panier'; bouton.classList.remove('a-confirmer'); } }, 3000);
        return;
      }
      const sauvegarde = Panier.lignes();
      Panier.vider();
      confirmationVider = false;
      toast('Panier vidé', { type: 'info', icone: 'fa-solid fa-trash', action: { libelle: 'Annuler', rappel: () => Panier.enregistrer(sauvegarde) } });
    });
  }

  function supprimer(index) {
    const ligne = Panier.retirer(index);
    toast(`${echapper(trouverPlat(ligne.id).nom)} retiré`, {
      type: 'info', icone: 'fa-solid fa-trash',
      action: { libelle: 'Annuler', rappel: () => Panier.restaurer(ligne, index) }
    });
  }

  document.addEventListener('panierChange', rendre);
  document.addEventListener('panierChangeExterne', rendre);
  rendre();
})();
