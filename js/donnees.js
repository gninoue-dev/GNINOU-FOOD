// ============================================
// GNINOU_FOOD — Données du site
// Tout le contenu (catalogue, livraison, réglages) est ici.
// Pour ajouter un plat : copier une ligne dans "plats".
// ============================================
const CONFIG = {
  nom: 'GNINOU_FOOD',
  // Titulaire des droits d'auteur du site
  titulaireDroits: 'DEV-GNINOUE',
  slogan: 'Les saveurs de chez toi, livrées en un clic',
  email: 'info@gninoufood.com',
  // À COMPLÉTER : numéro de commande WhatsApp (format international sans +, ex. '2250700000000').
  // Vide = le bouton "Envoyer sur WhatsApp" n'apparaît pas.
  whatsapp: '',
  telephoneAffiche: '',
  adresse: 'Abidjan, Côte d\'Ivoire',
  horaires: 'Tous les jours, 10 h - 22 h',
  devise: 'FCFA',
  // Livraison offerte à partir de ce montant (0 = jamais)
  livraisonGratuiteDes: 15000,
  // Codes promo : CODE -> pourcentage de réduction
  codesPromo: { BIENVENUE: 10 },
  // Communes livrées (frais en FCFA, délai en minutes)
  zones: [
    { nom: 'Cocody', frais: 1000, delai: '30-45' },
    { nom: 'Plateau', frais: 1000, delai: '30-45' },
    { nom: 'Marcory', frais: 1000, delai: '30-45' },
    { nom: 'Treichville', frais: 1000, delai: '30-45' },
    { nom: 'Adjamé', frais: 1000, delai: '30-45' },
    { nom: 'Koumassi', frais: 1500, delai: '40-55' },
    { nom: 'Attécoubé', frais: 1500, delai: '40-55' },
    { nom: 'Yopougon', frais: 1500, delai: '45-60' },
    { nom: 'Abobo', frais: 1500, delai: '45-60' },
    { nom: 'Port-Bouët', frais: 1500, delai: '45-60' },
    { nom: 'Bingerville', frais: 2000, delai: '50-70' },
    { nom: 'Anyama', frais: 2000, delai: '50-70' }
  ],
  paiements: [
    { id: 'especes', nom: 'Espèces à la livraison', icone: 'fa-solid fa-money-bill-wave' },
    { id: 'orange', nom: 'Orange Money', icone: 'fa-solid fa-mobile-screen' },
    { id: 'mtn', nom: 'MTN MoMo', icone: 'fa-solid fa-mobile-screen' },
    { id: 'wave', nom: 'Wave', icone: 'fa-solid fa-water' },
    { id: 'moov', nom: 'Moov Money', icone: 'fa-solid fa-mobile-screen' }
  ]
};

// Catégories = les 4 pages du dossier services_pr
const CATEGORIES = [
  {
    id: 'local', nom: 'Plats Ivoiriens', page: 'services_pr/menu_local.html',
    accroche: 'Profite des plats de chez toi en un seul clic',
    image: 'res/garba.jpeg', icone: 'fa-solid fa-utensils', couleur: '#C2410C'
  },
  {
    id: 'etranger', nom: 'Plats Étrangers', page: 'services_pr/menu_etranger.html',
    accroche: 'Découvre des recettes d\'autres pays tout en restant chez toi',
    image: 'res/plats_japonais.png', icone: 'fa-solid fa-earth-africa', couleur: '#1E7B3A'
  },
  {
    id: 'douceurs', nom: 'Douceurs', page: 'services_pr/menu_douceurs.html',
    accroche: 'Régale-toi avec tes péchés mignons sucrés',
    image: 'res/douceur.jpeg', icone: 'fa-solid fa-cake-candles', couleur: '#C9184A'
  },
  {
    id: 'boissons', nom: 'Boissons', page: 'services_pr/menu_boisson.html',
    accroche: 'Un arsenal de boissons fraîches en un mouvement',
    image: 'res/boisson.jpeg', icone: 'fa-solid fa-wine-glass', couleur: '#0077B6'
  }
];

// image : photo dans res/ (photos de res/images : Wikimedia Commons, voir js/credits.js)
// null = visuel de remplacement dessiné.
// tags : duJour (accueil), epice, vegetarien, alcool (18+)
const PLATS = [
  // ---------- Plats ivoiriens ----------
  { id: 'attieke-poisson', categorie: 'local', nom: 'Attiéké Poisson', prix: 3500, description: 'Poisson braisé accompagné d\'attiéké, tomate, oignon et piment doux.', image: 'res/res_localmenu/attieképoisson.jpeg', tags: ['duJour', 'epice'] },
  { id: 'alloco-poulet', categorie: 'local', nom: 'Alloco Poulet', prix: 3000, description: 'Poulet grillé servi avec alloco croustillant.', image: 'res/res_localmenu/allocopoulet.jpeg', tags: [] },
  { id: 'sauce-bawhin', categorie: 'local', nom: 'Sauce Bawhin', prix: 3000, description: 'La sauce africaine qui fait sensation.', image: 'res/bawhin.jpeg', tags: ['duJour'] },
  { id: 'kedjenou', categorie: 'local', nom: 'Kedjenou de Poulet', prix: 4000, description: 'Poulet mijoté aux légumes dans une sauce parfumée.', image: 'res/res_localmenu/kedjenoupoulet.jpeg', tags: ['epice'] },
  { id: 'foutou', categorie: 'local', nom: 'Foutou Banane', prix: 3500, description: 'Foutou accompagné de sauce graine.', image: 'res/res_localmenu/foutou.jpeg', tags: [] },
  { id: 'placali', categorie: 'local', nom: 'Placali Sauce Gombo', prix: 3000, description: 'Placali servi avec sauce gombo et poisson fumé.', image: 'res/res_localmenu/placaliavegombo.jpeg', tags: [] },
  { id: 'riz-gras', categorie: 'local', nom: 'Riz Gras', prix: 2500, description: 'Riz parfumé à la tomate et à la viande.', image: 'res/res_localmenu/riz gras.jpeg', tags: [] },
  { id: 'garba', categorie: 'local', nom: 'Garba', prix: 1500, description: 'Semoule de manioc servie avec thon frit.', image: 'res/res_localmenu/garba2.jpeg', tags: ['epice'] },
  { id: 'sauce-arachide', categorie: 'local', nom: 'Sauce Arachide', prix: 3000, description: 'Délicieuse sauce aux arachides servie avec riz.', image: 'res/res_localmenu/Sauce_arachide.jpeg', tags: [] },
  { id: 'tiep', categorie: 'local', nom: 'Tiep Bou Dien', prix: 4000, description: 'Riz au poisson sénégalais, riche en saveurs.', image: 'res/res_localmenu/tieboudien.jpeg', tags: [] },

  // ---------- Plats étrangers ----------
  { id: 'pizza', categorie: 'etranger', nom: 'Pizza Margherita', prix: 4000, description: 'Pizza italienne classique avec tomate, mozzarella et basilic.', image: 'res/images/pizza.jpg', tags: ['vegetarien'] },
  { id: 'sushi', categorie: 'etranger', nom: 'Sushi Assortiment', prix: 5500, description: 'Assortiment de sushi japonais frais.', image: 'res/images/sushi.jpg', tags: [] },
  { id: 'tacos', categorie: 'etranger', nom: 'Tacos Mexicains', prix: 3500, description: 'Tortillas garnies de viande, légumes et sauce épicée.', image: 'res/images/tacos.jpg', tags: ['epice'] },
  { id: 'paella', categorie: 'etranger', nom: 'Paella Espagnole', prix: 6000, description: 'Riz safrané aux fruits de mer et légumes.', image: 'res/images/paella.jpg', tags: [] },
  { id: 'burger', categorie: 'etranger', nom: 'Burger Américain', prix: 4500, description: 'Burger classique avec steak, fromage et frites.', image: 'res/images/burger.jpg', tags: [] },
  { id: 'chowmein', categorie: 'etranger', nom: 'Chow Mein Chinois', prix: 3800, description: 'Nouilles sautées aux légumes et poulet.', image: 'res/images/chowmein.jpg', tags: [] },
  { id: 'curry', categorie: 'etranger', nom: 'Curry Indien', prix: 4200, description: 'Curry parfumé au poulet et riz basmati.', image: 'res/images/curry.jpg', tags: ['epice'] },
  { id: 'kebab', categorie: 'etranger', nom: 'Kebab Turc', prix: 3700, description: 'Viande grillée servie avec pain pita et légumes.', image: 'res/images/kebab.jpg', tags: [] },
  { id: 'falafel', categorie: 'etranger', nom: 'Falafel Libanais', prix: 3000, description: 'Boulettes de pois chiches servies avec houmous.', image: 'res/images/falafel.jpg', tags: ['vegetarien'] },
  { id: 'schnitzel', categorie: 'etranger', nom: 'Schnitzel Allemand', prix: 4800, description: 'Escalope panée servie avec pommes de terre.', image: 'res/images/schnitzel.jpg', tags: [] },
  { id: 'ramen', categorie: 'etranger', nom: 'Ramen Japonais', prix: 4200, description: 'Nouilles dans un bouillon parfumé avec porc, œuf et algues.', image: 'res/plats_japonais.png', tags: [] },
  { id: 'tempura', categorie: 'etranger', nom: 'Tempura Japonais', prix: 3800, description: 'Beignets légers de crevettes et légumes croustillants.', image: 'res/images/tempura.jpg', tags: [] },

  // ---------- Douceurs ----------
  { id: 'gateau-chocolat', categorie: 'douceurs', nom: 'Gâteau au Chocolat', prix: 2000, description: 'Moelleux au chocolat fondant.', image: 'res/GâteauChocolat.jpeg', tags: ['duJour', 'vegetarien'] },
  { id: 'crepes', categorie: 'douceurs', nom: 'Crêpes Sucrées', prix: 1800, description: 'Crêpes garnies de chocolat et banane.', image: 'res/crepe.jpeg', tags: ['duJour', 'vegetarien'] },
  { id: 'beignets', categorie: 'douceurs', nom: 'Beignets Ivoiriens', prix: 1000, description: 'Petits beignets sucrés croustillants.', image: 'res/beignet .jpeg', tags: ['duJour', 'vegetarien'] },
  { id: 'gbofloto', categorie: 'douceurs', nom: 'Gbofloto', prix: 1200, description: 'Boulettes sucrées ivoiriennes, dorées et moelleuses.', image: 'res/images/gbofloto.jpg', tags: ['vegetarien'] },
  { id: 'attieke-sucre', categorie: 'douceurs', nom: 'Attiéké Sucré', prix: 1500, description: 'Semoule de manioc sucrée, servie en dessert.', image: 'res/images/attieke-sucre.jpg', tags: ['vegetarien'] },
  { id: 'banane-caramel', categorie: 'douceurs', nom: 'Banane Caramélisée', prix: 1800, description: 'Bananes plantains grillées au caramel.', image: 'res/images/banane-caramel.jpg', tags: ['vegetarien'] },
  { id: 'coco-grille', categorie: 'douceurs', nom: 'Noix de Coco Grillée', prix: 1500, description: 'Coco râpé grillé et sucré.', image: 'res/images/coco-grille.jpg', tags: ['vegetarien'] },
  { id: 'akassa', categorie: 'douceurs', nom: 'Akassa Sucré', prix: 1700, description: 'Pâte de maïs sucrée servie en dessert.', image: 'res/images/akassa.jpg', tags: ['vegetarien'] },
  { id: 'galette-manioc', categorie: 'douceurs', nom: 'Galette de Manioc', prix: 1600, description: 'Galette sucrée à base de manioc.', image: 'res/images/galette-manioc.jpg', tags: ['vegetarien'] },
  { id: 'salade-fruits', categorie: 'douceurs', nom: 'Salade de Fruits Tropicaux', prix: 2000, description: 'Mangue, ananas, papaye et banane.', image: 'res/images/salade-fruits.jpg', tags: ['vegetarien'] },
  { id: 'yaourt', categorie: 'douceurs', nom: 'Yaourt Local', prix: 1800, description: 'Yaourt artisanal ivoirien, légèrement sucré.', image: 'res/images/yaourt.jpg', tags: ['vegetarien'] },
  { id: 'bonbon-cacahuete', categorie: 'douceurs', nom: 'Bonbons de Cacahuète', prix: 1200, description: 'Petits bonbons croquants aux arachides caramélisées.', image: 'res/images/bonbon-cacahuete.jpg', tags: ['vegetarien'] },
  { id: 'tiramisu', categorie: 'douceurs', nom: 'Tiramisu Italien', prix: 3500, description: 'Dessert italien au café et mascarpone.', image: 'res/images/tiramisu.jpg', tags: ['vegetarien'] },
  { id: 'cheesecake', categorie: 'douceurs', nom: 'Cheesecake Américain', prix: 3800, description: 'Gâteau au fromage crémeux sur biscuit.', image: 'res/images/cheesecake.jpg', tags: ['vegetarien'] },
  { id: 'mousse-chocolat', categorie: 'douceurs', nom: 'Mousse au Chocolat', prix: 3000, description: 'Dessert aérien au chocolat noir.', image: 'res/images/mousse-chocolat.jpg', tags: ['vegetarien'] },
  { id: 'dorayaki', categorie: 'douceurs', nom: 'Dorayaki Japonais', prix: 3200, description: 'Crêpes fourrées à la pâte de haricot rouge.', image: 'res/images/dorayaki.jpg', tags: ['vegetarien'] },
  { id: 'mochi', categorie: 'douceurs', nom: 'Mochi Japonais', prix: 3000, description: 'Boulettes de riz gluant sucrées.', image: 'res/images/mochi.jpg', tags: ['vegetarien'] },
  { id: 'macarons', categorie: 'douceurs', nom: 'Macarons Français', prix: 4000, description: 'Petits biscuits colorés à la crème.', image: 'res/images/macarons.jpg', tags: ['vegetarien'] },
  { id: 'panna-cotta', categorie: 'douceurs', nom: 'Panna Cotta Italienne', prix: 3500, description: 'Dessert crémeux à la vanille et coulis de fruits.', image: 'res/images/panna-cotta.jpg', tags: ['vegetarien'] },
  { id: 'brownie', categorie: 'douceurs', nom: 'Brownie Américain', prix: 3200, description: 'Gâteau au chocolat fondant avec noix.', image: 'res/images/brownie.jpg', tags: ['vegetarien'] },
  { id: 'strudel', categorie: 'douceurs', nom: 'Strudel Autrichien', prix: 3800, description: 'Pâtisserie feuilletée aux pommes.', image: 'res/images/strudel.jpg', tags: ['vegetarien'] },

  // ---------- Boissons ----------
  { id: 'bissap', categorie: 'boissons', nom: 'Jus de Bissap', prix: 1500, description: 'Jus naturel d\'hibiscus fait maison, servi frais.', image: 'res/jusbissap.jpeg', tags: ['duJour', 'vegetarien'] },
  { id: 'gingembre', categorie: 'boissons', nom: 'Jus de Gingembre', prix: 1500, description: 'Boisson piquante et rafraîchissante.', image: 'res/images/gingembre.jpg', tags: ['vegetarien', 'epice'] },
  { id: 'tamarin', categorie: 'boissons', nom: 'Jus de Tamarin', prix: 1500, description: 'Saveur acidulée et sucrée, typique d\'Afrique.', image: 'res/images/tamarin.jpg', tags: ['vegetarien'] },
  { id: 'eau-coco', categorie: 'boissons', nom: 'Eau de Coco', prix: 2000, description: 'Naturelle et désaltérante.', image: 'res/images/eau-coco.jpg', tags: ['vegetarien'] },
  { id: 'jus-mangue', categorie: 'boissons', nom: 'Jus de Mangue', prix: 1800, description: 'Pur jus de mangue ivoirienne.', image: 'res/images/jus-mangue.jpg', tags: ['vegetarien'] },
  { id: 'jus-ananas', categorie: 'boissons', nom: 'Jus d\'Ananas', prix: 1800, description: 'Jus tropical sucré et parfumé.', image: 'res/images/jus-ananas.jpg', tags: ['vegetarien'] },
  { id: 'baobab', categorie: 'boissons', nom: 'Jus de Baobab', prix: 2000, description: 'Boisson traditionnelle riche en vitamines.', image: 'res/images/baobab.jpg', tags: ['vegetarien'] },
  { id: 'jus-cola', categorie: 'boissons', nom: 'Jus de Cola', prix: 2000, description: 'Boisson locale énergisante.', image: 'res/images/jus-cola.jpg', tags: ['vegetarien'] },
  { id: 'papaye', categorie: 'boissons', nom: 'Jus de Papaye', prix: 1800, description: 'Saveur douce et tropicale.', image: 'res/images/papaye.jpg', tags: ['vegetarien'] },
  { id: 'citronnade', categorie: 'boissons', nom: 'Citronnade', prix: 1500, description: 'Boisson fraîche au citron.', image: 'res/images/citronnade.jpg', tags: ['vegetarien'] },
  { id: 'coca', categorie: 'boissons', nom: 'Coca-Cola', prix: 1000, description: 'Canette fraîche 33 cl.', image: 'res/cocacola.jpeg', tags: ['duJour', 'vegetarien'] },
  { id: 'fanta', categorie: 'boissons', nom: 'Fanta Orange', prix: 1000, description: 'Soda pétillant à l\'orange.', image: 'res/images/fanta.jpg', tags: ['vegetarien'] },
  { id: 'sprite', categorie: 'boissons', nom: 'Sprite', prix: 1000, description: 'Soda citron-lime rafraîchissant.', image: 'res/images/sprite.jpg', tags: ['vegetarien'] },
  { id: 'heineken', categorie: 'boissons', nom: 'Heineken', prix: 2500, description: 'Bière blonde importée, servie glacée.', image: 'res/heineken.jpeg', tags: ['duJour', 'alcool'] },
  { id: 'guinness', categorie: 'boissons', nom: 'Guinness', prix: 2800, description: 'Bière noire irlandaise.', image: 'res/images/guinness.jpg', tags: ['alcool'] },
  { id: 'redbull', categorie: 'boissons', nom: 'Red Bull', prix: 2000, description: 'Boisson énergisante.', image: 'res/images/redbull.jpg', tags: ['vegetarien'] },
  { id: 'sake', categorie: 'boissons', nom: 'Saké Japonais', prix: 3500, description: 'Alcool de riz traditionnel du Japon.', image: 'res/images/sake.jpg', tags: ['alcool'] },
  { id: 'vin', categorie: 'boissons', nom: 'Vin Français', prix: 5000, description: 'Vin rouge de Bordeaux.', image: 'res/images/vin.jpg', tags: ['alcool'] },
  { id: 'champagne', categorie: 'boissons', nom: 'Champagne', prix: 8000, description: 'Vin pétillant de prestige.', image: 'res/images/champagne.jpg', tags: ['alcool'] }
];

const TAGS = {
  epice: { nom: 'Épicé', icone: 'fa-solid fa-pepper-hot' },
  vegetarien: { nom: 'Végétarien', icone: 'fa-solid fa-leaf' },
  alcool: { nom: '18+', icone: 'fa-solid fa-wine-bottle' }
};
