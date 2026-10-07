// ============================================
// GNINOU_FOOD — Page d'accueil
// ============================================
(function () {
  // ---------- Chiffres du hero ----------
  const chiffres = [
    { valeur: PLATS.length, libelle: 'plats et boissons' },
    { valeur: CONFIG.zones.length, libelle: 'communes livrées' },
    { valeur: CATEGORIES.length, libelle: 'univers culinaires' }
  ];
  document.getElementById('heroChiffres').innerHTML = chiffres.map(c => `
    <li><strong data-compteur="${c.valeur}">${mouvementReduit ? c.valeur : 0}</strong><span>${c.libelle}</span></li>`).join('');
  if (!mouvementReduit) {
    document.querySelectorAll('[data-compteur]').forEach(el => {
      const cible = Number(el.dataset.compteur);
      const debut = performance.now();
      const etape = maintenant => {
        const k = Math.min(1, (maintenant - debut) / 1200);
        el.textContent = Math.round(cible * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(etape);
      };
      requestAnimationFrame(etape);
    });
  }

  // ---------- Catégories ----------
  document.getElementById('grilleCategories').innerHTML = CATEGORIES.map((c, i) => `
    <a href="${c.page}" class="carte-categorie apparition" style="--delai:${i * 0.08}s; --couleur-categorie:${c.couleur}">
      <img src="${encodeURI(c.image)}" alt="" loading="lazy">
      <span class="carte-categorie-voile"></span>
      <span class="carte-categorie-contenu">
        <span class="carte-categorie-icone"><i class="${c.icone}" aria-hidden="true"></i></span>
        <strong>${c.nom}</strong>
        <small>${c.accroche}</small>
        <span class="carte-categorie-lien">${PLATS.filter(p => p.categorie === c.id).length} choix <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
      </span>
    </a>`).join('');

  // ---------- Plats du jour (carrousel) ----------
  const carrousel = document.getElementById('carrouselDuJour');
  carrousel.innerHTML = PLATS.filter(p => p.tags.includes('duJour')).map(htmlCartePlat).join('');
  document.querySelectorAll('[data-defiler]').forEach(bouton => {
    bouton.addEventListener('click', () => {
      const carte = carrousel.querySelector('.carte-plat');
      const pas = carte ? carte.offsetWidth + 24 : 300;
      carrousel.scrollBy({ left: pas * Number(bouton.dataset.defiler), behavior: mouvementReduit ? 'auto' : 'smooth' });
    });
  });

  // ---------- Favoris ----------
  function rendreFavoris() {
    const favoris = Favoris.liste().map(trouverPlat).filter(Boolean);
    document.getElementById('sectionFavoris').hidden = !favoris.length;
    document.getElementById('grilleFavoris').innerHTML = favoris.map(htmlCartePlat).join('');
  }
  rendreFavoris();
  document.addEventListener('favorisChange', rendreFavoris);

  // ---------- Zones de livraison ----------
  const choixZone = document.getElementById('choixZone');
  choixZone.innerHTML = '<option value="">Choisir ma commune...</option>' +
    CONFIG.zones.map(z => `<option value="${z.nom}">${z.nom}</option>`).join('');
  const zoneMemorisee = lire('zone', '');
  if (zoneMemorisee) choixZone.value = zoneMemorisee;
  function afficherZone() {
    const zone = CONFIG.zones.find(z => z.nom === choixZone.value);
    const resultat = document.getElementById('resultatZone');
    if (!zone) {
      resultat.innerHTML = `<p class="zone-astuce"><i class="fa-solid fa-circle-info" aria-hidden="true"></i> Nous livrons ${CONFIG.zones.length} communes d'Abidjan.</p>`;
      return;
    }
    ecrire('zone', zone.nom);
    resultat.innerHTML = `
      <div class="zone-infos">
        <div><i class="fa-solid fa-coins" aria-hidden="true"></i><span>Frais</span><strong>${formaterPrix(zone.frais)}</strong></div>
        <div><i class="fa-solid fa-stopwatch" aria-hidden="true"></i><span>Délai</span><strong>${zone.delai} min</strong></div>
      </div>
      <p class="zone-astuce"><i class="fa-solid fa-gift" aria-hidden="true"></i> Livraison offerte dès ${formaterPrix(CONFIG.livraisonGratuiteDes)} d'achat.</p>`;
  }
  choixZone.addEventListener('change', afficherZone);
  afficherZone();

  // ---------- Code promo ----------
  const [code, pourcentage] = Object.entries(CONFIG.codesPromo)[0] || [];
  if (code) {
    document.getElementById('codePromo').textContent = code;
    document.getElementById('promoPourcentage').textContent = `-${pourcentage} %`;
    document.getElementById('promoLivraison').textContent = `Et la livraison est offerte dès ${formaterPrix(CONFIG.livraisonGratuiteDes)}.`;
    document.getElementById('boutonCodePromo').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code);
        toast(`Code ${code} copié ! Colle-le dans ton panier.`, { icone: 'fa-solid fa-copy' });
      } catch (erreur) {
        toast(`Ton code : ${code}`, { icone: 'fa-solid fa-gift', type: 'info' });
      }
    });
  } else {
    document.querySelector('.carte-promo').hidden = true;
  }

  // ---------- Contact ----------
  document.getElementById('contactInfos').innerHTML = `
    <li><span class="contact-icone"><i class="fa-solid fa-envelope" aria-hidden="true"></i></span><span><small>Email</small><a href="mailto:${CONFIG.email}">${CONFIG.email}</a></span></li>
    ${CONFIG.whatsapp ? `<li><span class="contact-icone"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i></span><span><small>WhatsApp</small><a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">${CONFIG.telephoneAffiche || CONFIG.whatsapp}</a></span></li>` : ''}
    <li><span class="contact-icone"><i class="fa-solid fa-location-dot" aria-hidden="true"></i></span><span><small>Adresse</small>${CONFIG.adresse}</span></li>
    <li><span class="contact-icone"><i class="fa-solid fa-clock" aria-hidden="true"></i></span><span><small>Horaires</small>${CONFIG.horaires}</span></li>`;

  const formulaire = document.getElementById('formulaireContact');
  formulaire.addEventListener('submit', e => {
    e.preventDefault();
    const nom = document.getElementById('contactNom');
    const message = document.getElementById('contactMessage');
    let valide = true;
    [[nom, 'erreurContactNom', 'Indique ton nom.'], [message, 'erreurContactMessage', 'Écris ton message (10 caractères minimum).']].forEach(([champ, idErreur, texte]) => {
      const ok = champ === message ? champ.value.trim().length >= 10 : champ.value.trim().length > 0;
      champ.closest('.champ').classList.toggle('invalide', !ok);
      document.getElementById(idErreur).textContent = ok ? '' : texte;
      if (!ok && valide) { champ.focus(); valide = false; }
    });
    if (!valide) return;
    const sujet = document.getElementById('contactSujet').value;
    const corps = `${message.value.trim()}\n\n${nom.value.trim()}`;
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`[${CONFIG.nom}] ${sujet}`)}&body=${encodeURIComponent(corps)}`;
    toast('Ton application email va s\'ouvrir avec ton message.', { icone: 'fa-solid fa-paper-plane' });
  });

  // le lien #contact / #livraison du menu fonctionne aussi sur cette page
  observerApparitions();
})();
