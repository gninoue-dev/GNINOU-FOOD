// Crédits des photos téléchargées depuis Wikimedia Commons (licences libres).
// Affichés sur la page Crédits du site.
const CREDITS_PHOTOS = [
  {
    "id": "pizza",
    "auteur": "Fabryx98",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pizza-napoletana.jpg"
  },
  {
    "id": "sushi",
    "auteur": "chidorian from Japan",
    "licence": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sushi_platter.jpg"
  },
  {
    "id": "tacos",
    "auteur": "Larry Miller",
    "licence": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:001_Tacos_de_carnitas,_carne_asada_y_al_pastor.jpg"
  },
  {
    "id": "paella",
    "auteur": "Kgbo",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Seafood_paella_in_Brisbane,_Queensland.jpg"
  },
  {
    "id": "burger",
    "auteur": "Horacio Cambeiro",
    "licence": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Homemade_hamburger_with_french_fries_in_Argentina.jpg"
  },
  {
    "id": "chowmein",
    "auteur": "Gaurav Dhwaj Khadka",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chow_mein_1.jpg"
  },
  {
    "id": "curry",
    "auteur": "stu_spivack",
    "licence": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chicken_makhani.jpg"
  },
  {
    "id": "kebab",
    "auteur": "Cyapoj",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Beef_Kebab_and_Pita.jpg"
  },
  {
    "id": "falafel",
    "auteur": "Charles Haynes from Hobart, Australia",
    "licence": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Mixed_Plate_(3186676853).jpg"
  },
  {
    "id": "schnitzel",
    "auteur": "Holger.Ellgaard",
    "licence": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wiener_Schnitzel_2012.jpg"
  },
  {
    "id": "tempura",
    "auteur": "毒島みるく",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Shrimp_tempura_bowl_of_Japanese_National_Diet_Library.jpg"
  },
  {
    "id": "gbofloto",
    "auteur": "Albertoblaq",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Puff-Puff_2.jpg"
  },
  {
    "id": "attieke-sucre",
    "auteur": "daSupremo",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Packaged_Attieke.jpg"
  },
  {
    "id": "banane-caramel",
    "auteur": "Globalgab",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:African_Fried_Rice_with_Fried_Plantain_and_Beef.jpg"
  },
  {
    "id": "coco-grille",
    "auteur": "Choo Yut Shing from Singapore, Singapore",
    "licence": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Coconut_Candy_(52311610055).jpg"
  },
  {
    "id": "akassa",
    "auteur": "Ciaro pictures",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Plat_d%27akassa.jpg"
  },
  {
    "id": "galette-manioc",
    "auteur": "Obsidian Soul",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Cassava_cake_(Philippines)_-_Bibingkang_kamoteng_kahoy_01.jpg"
  },
  {
    "id": "salade-fruits",
    "auteur": "Nethuzara",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Tropical_fruits.jpg"
  },
  {
    "id": "yaourt",
    "auteur": "T.Tseng",
    "licence": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Yogurt,_fruit,_granola_bowl_(34999358091).jpg"
  },
  {
    "id": "bonbon-cacahuete",
    "auteur": "Evan-Amos",
    "licence": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Peco-Peanut-Brittle-Bar.jpg"
  },
  {
    "id": "tiramisu",
    "auteur": "Sharon Chen from Austin, United States",
    "licence": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Classic_Italian_Tiramisu-3_(29989504485).jpg"
  },
  {
    "id": "cheesecake",
    "auteur": "Sirabellas",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Raised_slice_of_cheesecake.jpg"
  },
  {
    "id": "mousse-chocolat",
    "auteur": "Lu from Seattle, USA",
    "licence": "CC BY 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chocolate_coffee_mousse.jpg"
  },
  {
    "id": "dorayaki",
    "auteur": "Ocdp",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Dorayaki_004.jpg"
  },
  {
    "id": "mochi",
    "auteur": "Ocdp",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Daifuku_001.jpg"
  },
  {
    "id": "macarons",
    "auteur": "Tatiana Lapina veila",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Colorful_Macarons_(Unsplash).jpg"
  },
  {
    "id": "panna-cotta",
    "auteur": "hiro",
    "licence": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Panna_Cotta_with_cream_and_garnish.jpg"
  },
  {
    "id": "brownie",
    "auteur": "Auteur inconnu",
    "licence": "CC BY-SA 3.0",
    "source": "https://commons.wikimedia.org/wiki/File:Chocolate_brownies_without_table.jpg"
  },
  {
    "id": "strudel",
    "auteur": "Burkhard Mücke",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Wiener_Apfelstrudel.jpg"
  },
  {
    "id": "gingembre",
    "auteur": "Andy Li",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Apple_carrot_ginger_juice_-_Lily%27s_Cafe,_Brighton_2024-02-03.jpg"
  },
  {
    "id": "tamarin",
    "auteur": "Catherine Amia",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Fresh_Tamarind_Juice.jpg"
  },
  {
    "id": "eau-coco",
    "auteur": "Superraptor123",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Coconut_water_at_restaurant_in_Ko_Samui.jpg"
  },
  {
    "id": "jus-mangue",
    "auteur": "Mx. Granger",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Rubicon_mango_drink.jpg"
  },
  {
    "id": "jus-ananas",
    "auteur": "Srini297",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pineapple_Juice_in_Glass_Jar.jpg"
  },
  {
    "id": "baobab",
    "auteur": "T.K. Naliaka",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Baobab_juice_-_color.jpg"
  },
  {
    "id": "jus-cola",
    "auteur": "Ighophua",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Kola_Nut_in_Niger_Delta.jpg"
  },
  {
    "id": "papaye",
    "auteur": "Dhivya Bharathi Official",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Papaya_Juice_at_pothys.jpg"
  },
  {
    "id": "citronnade",
    "auteur": "E4024",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Lemonade_in_Ankara,_Turkey.jpg"
  },
  {
    "id": "fanta",
    "auteur": "MisterSanderson",
    "licence": "Public domain",
    "source": "https://commons.wikimedia.org/wiki/File:Logo_da_Fanta_na_garrafa.jpg"
  },
  {
    "id": "sprite",
    "auteur": "User:Msdalr1",
    "licence": "CC0",
    "source": "https://commons.wikimedia.org/wiki/File:Sprite_bottle_Shenzhen_China.jpeg"
  },
  {
    "id": "guinness",
    "auteur": "Acabashi",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Pint_of_Guinness_Ledger_Building_Wetherspoons_North_Quay_Canary_Wharf_London_England.jpg"
  },
  {
    "id": "redbull",
    "auteur": "JonathanAaronBridgemohan",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Red_Bell_Energy_Drink_250ml_can.jpg"
  },
  {
    "id": "sake",
    "auteur": "Claire H. from New York City, USA",
    "licence": "CC BY-SA 2.0",
    "source": "https://commons.wikimedia.org/wiki/File:Sake_Set_Bunnies.jpg"
  },
  {
    "id": "vin",
    "auteur": "Auctor quaerendae",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:020260524_140002_Red_wine_in_glass.jpg"
  },
  {
    "id": "champagne",
    "auteur": "SWT666",
    "licence": "CC BY-SA 4.0",
    "source": "https://commons.wikimedia.org/wiki/File:Calice_a_tulipano_per_spumante_03.jpg"
  }
];
