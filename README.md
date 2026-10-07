# GNINOU_FOOD

Site de commande et de livraison de repas à Abidjan : plats ivoiriens, plats du monde, douceurs et boissons.
Site statique en HTML, CSS et JavaScript, sans framework et sans étape de build.

## Fonctionnalités

- 4 menus (plats ivoiriens, étrangers, douceurs, boissons) avec recherche, filtres (épicé, végétarien, 18+), tri et prix maximum.
- Recherche globale avec suggestions et fiche détaillée de chaque plat (quantité, précision pour la cuisine, plats similaires).
- Panier enregistré dans le navigateur, tiroir panier sur toutes les pages, code promo, frais de livraison par commune et livraison offerte à partir d'un montant.
- Commande en 3 étapes (livraison, paiement Mobile Money ou espèces, confirmation) avec suivi animé de la commande.
- Comptes clients, favoris, historique de commandes et bouton « Recommander ».
- Thème clair et sombre, version mobile, accessibilité au clavier.

C'est un site de démonstration : comptes et commandes sont enregistrés uniquement dans le navigateur, et aucun paiement n'est réellement débité.

## Lancer le site

```
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Modifier le contenu

Tout se règle dans `js/donnees.js` :

- **Plats :** nom, prix, description, photo, tags.
- **Communes livrées :** frais et délais.
- **Réglages :** codes promo, seuil de la livraison offerte, numéro WhatsApp.

## Crédits

Les photos de `res/images/` viennent de Wikimedia Commons, sous licences libres ; la liste complète est sur la page `Outils_site/credits.html`.
Les autres photos et le logo appartiennent à DEV-GNINOUE.

© DEV-GNINOUE. Tous droits réservés.
