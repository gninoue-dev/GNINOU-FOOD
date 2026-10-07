// ============================================
// GNINOU_FOOD — Connexion et inscription
// ?retour=page.html : page où revenir après succès.
// ============================================
(function () {
  const parametres = new URLSearchParams(window.location.search);
  // seules les pages du dossier Outils_site sont acceptées comme retour
  const retour = /^[\w-]+\.html(#\w+)?$/.test(parametres.get('retour') || '') ? parametres.get('retour') : 'compte.html';
  const lienAutre = document.getElementById('lienAutre');
  if (parametres.get('retour')) lienAutre.href += `?retour=${encodeURIComponent(retour)}`;

  if (Compte.courant()) {
    window.location.replace(retour);
    return;
  }

  // Afficher / masquer le mot de passe
  document.querySelectorAll('[data-voir-mdp]').forEach(bouton => {
    bouton.addEventListener('click', () => {
      const champ = document.getElementById(bouton.dataset.voirMdp);
      const visible = champ.type === 'password';
      champ.type = visible ? 'text' : 'password';
      bouton.setAttribute('aria-pressed', visible);
      bouton.setAttribute('aria-label', visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      bouton.innerHTML = `<i class="fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}" aria-hidden="true"></i>`;
    });
  });

  function erreur(id, message) {
    document.getElementById(`bloc-${id}`).classList.toggle('invalide', !!message);
    document.getElementById(`erreur-${id}`).textContent = message || '';
    return !message;
  }

  const emailValide = email => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const message = document.getElementById('messageFormulaire');

  function attendreBouton(formulaire, actif) {
    const bouton = formulaire.querySelector('[type="submit"]');
    bouton.disabled = actif;
    if (actif) {
      bouton.dataset.texte = bouton.innerHTML;
      bouton.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Un instant...';
    } else if (bouton.dataset.texte) {
      bouton.innerHTML = bouton.dataset.texte;
    }
  }

  // ---------- Connexion ----------
  const formulaireConnexion = document.getElementById('formulaireConnexion');
  if (formulaireConnexion) {
    formulaireConnexion.addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const motDePasse = document.getElementById('motDePasse').value;
      const ok = [
        erreur('email', emailValide(email) ? '' : 'Email invalide.'),
        erreur('motDePasse', motDePasse ? '' : 'Saisis ton mot de passe.')
      ].every(Boolean);
      message.textContent = '';
      if (!ok) { formulaireConnexion.querySelector('.invalide input').focus(); return; }
      attendreBouton(formulaireConnexion, true);
      try {
        await Compte.connecter(email, motDePasse);
        toast(`Content de te revoir, ${echapper(Compte.courant().nom.split(' ')[0])} !`);
        window.setTimeout(() => window.location.assign(retour), 600);
      } catch (erreurConnexion) {
        message.textContent = erreurConnexion.message;
        formulaireConnexion.classList.remove('secoue');
        void formulaireConnexion.offsetWidth;
        formulaireConnexion.classList.add('secoue');
        attendreBouton(formulaireConnexion, false);
      }
    });
  }

  // ---------- Inscription ----------
  const formulaireInscription = document.getElementById('formulaireInscription');
  if (formulaireInscription) {
    const champMdp = document.getElementById('motDePasse');
    const libellesForce = ['Trop court', 'Faible', 'Moyen', 'Solide', 'Excellent'];
    champMdp.addEventListener('input', () => {
      const v = champMdp.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/\d/.test(v)) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v) || v.length >= 12) score++;
      const force = formulaireInscription.querySelector('.force');
      force.dataset.niveau = v ? score : '';
      document.getElementById('aideForce').textContent = v ? `Sécurité : ${libellesForce[score]}` : '8 caractères minimum, avec un chiffre.';
    });

    formulaireInscription.addEventListener('submit', async e => {
      e.preventDefault();
      const valeurs = Object.fromEntries(['nom', 'email', 'telephone', 'motDePasse', 'confirmation']
        .map(id => [id, document.getElementById(id).value]));
      const chiffresTel = valeurs.telephone.replace(/\D/g, '').replace(/^225/, '');
      const ok = [
        erreur('nom', valeurs.nom.trim().length >= 2 ? '' : 'Indique ton nom.'),
        erreur('email', emailValide(valeurs.email) ? '' : 'Email invalide.'),
        erreur('telephone', !valeurs.telephone || /^(01|05|07|21|25|27)\d{8}$/.test(chiffresTel) ? '' : 'Numéro invalide (10 chiffres).'),
        erreur('motDePasse', valeurs.motDePasse.length >= 8 && /\d/.test(valeurs.motDePasse) ? '' : '8 caractères minimum, avec au moins un chiffre.'),
        erreur('confirmation', valeurs.confirmation === valeurs.motDePasse && valeurs.confirmation ? '' : 'Les deux mots de passe ne correspondent pas.')
      ].every(Boolean);
      message.textContent = '';
      if (!ok) { formulaireInscription.querySelector('.invalide input').focus(); return; }
      attendreBouton(formulaireInscription, true);
      try {
        await Compte.inscrire(valeurs);
        toast(`Bienvenue ${echapper(valeurs.nom.trim().split(' ')[0])} ! Ton compte est créé.`, { icone: 'fa-solid fa-champagne-glasses' });
        window.setTimeout(() => window.location.assign(retour), 700);
      } catch (erreurInscription) {
        message.textContent = erreurInscription.message;
        attendreBouton(formulaireInscription, false);
      }
    });
  }
})();
