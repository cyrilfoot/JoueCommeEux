/* Comparateur « Trouver mon équipement » — Joue comme eux.
   Aucune IA, aucune API : une liste de produits vérifiés + des règles simples.
   Aucun prix, aucune disponibilité affichés. Les boutons ouvrent une recherche Amazon.fr
   sur le nom exact du modèle, avec le tag partenaire. */
(function () {
  "use strict";

  var TAG = "jouecommeeux-21";
  var cmpEl = document.getElementById("cmp");
  var SITE = ((cmpEl && cmpEl.getAttribute("data-site")) || "").replace(/\/$/, "");

  /* ---------- Questions ---------- */
  var QUESTIONS = [
    { id: "cat", titre: "Quel équipement cherchez-vous ?", options: [
      ["crampons", "Des chaussures de foot"],
      ["ballon", "Un ballon"],
      ["tibias", "Des protège-tibias"] ] },
    { id: "age", titre: "Quel âge a le joueur ?", options: [
      ["petit", "Moins de 8 ans"],
      ["enfant", "De 8 à 12 ans"],
      ["grand", "13 ans et plus, ou adulte"] ] },
    { id: "niveau", titre: "Quel est son niveau de pratique ?", options: [
      ["decouverte", "Il découvre le foot ou joue pour le plaisir"],
      ["club", "Il joue en club chaque semaine"],
      ["competition", "Il joue en compétition, à bon niveau"] ] },
    { id: "terrain", titre: "Sur quel terrain joue-t-il le plus souvent ?", sauf: ["tibias"], options: [
      ["herbe", "Herbe naturelle"],
      ["synthe", "Synthétique"],
      ["plusieurs", "Herbe et synthétique, selon les matchs"],
      ["stabilise", "Stabilisé, five ou terrain dur"],
      ["salle", "En salle, futsal ou gymnase"] ] },
    { id: "budget", titre: "Quel budget visez-vous ?", options: [
      ["entree", "Petit budget : entrée de gamme"],
      ["milieu", "Budget moyen : milieu de gamme"],
      ["haut", "Sans limite : haut de gamme"] ] }
  ];

  /* ---------- Produits (vérifiés le 15 octobre 2026) ----------
     ages : petit (moins de 8 ans), enfant (8-12), grand (13+ et adulte)
     terrains : herbe, synthe, stabilise, salle
     gamme : entree, milieu, haut */
  var P = [
    // Chaussures — herbe et synthétique
    { cat: "crampons", nom: "Nike Jr. Mercurial Vapor 16 Club MG à scratch", q: "Nike Mercurial Vapor 16 Club MG scratch enfant", marque: "Nike",
      ages: ["petit"], terrains: ["herbe", "synthe"], gamme: "entree", niveaux: ["decouverte", "club"], scratch: true, semelle: "MG",
      fort: "Fermeture à scratch : l'enfant se chausse seul, sans lacets à refaire.",
      limite: "Génération précédente de la gamme : vérifiez que la pointure est disponible sur la fiche." },
    { cat: "crampons", nom: "Nike Jr. Mercurial Vapor 17 Club MG", q: "Nike Jr Mercurial Vapor 17 Club MG", marque: "Nike",
      ages: ["petit", "enfant"], terrains: ["herbe", "synthe"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "MG",
      fort: "Tige en cuir synthétique et semelle multi-surfaces : une seule paire pour l'herbe et le synthétique.",
      limite: "Lacets classiques : à réserver aux enfants qui savent les nouer." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 17 Club FG", q: "Nike Mercurial Vapor 17 Club FG", marque: "Nike",
      ages: ["grand"], terrains: ["herbe"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "FG",
      fort: "L'entrée de gamme de la Mercurial actuelle, avec une semelle pour l'herbe naturelle.",
      limite: "Semelle FG : à éviter sur synthétique et sur terrain dur." },
    { cat: "crampons", nom: "adidas Predator Club FxG", q: "adidas Predator Club FxG", marque: "adidas",
      ages: ["enfant", "grand"], terrains: ["herbe", "synthe"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "FxG",
      fort: "Semelle polyvalente pour l'herbe et le synthétique, en version enfant (J) et adulte.",
      limite: "Tige d'entrée de gamme : moins de toucher de balle qu'un modèle plus haut de gamme." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 17 Academy FG/MG", q: "Nike Mercurial Vapor 17 Academy MG", marque: "Nike",
      ages: ["enfant", "grand"], terrains: ["herbe", "synthe"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "MG",
      fort: "Empeigne NikeSkin et chaussure légère, pensée pour les joueurs rapides.",
      limite: "Coupe ajustée : Nike conseille de prendre une demi-pointure de plus." },
    { cat: "crampons", nom: "adidas Predator League FG/MG", q: "adidas Predator League FG/MG", marque: "adidas",
      ages: ["enfant", "grand"], terrains: ["herbe", "synthe"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "MG",
      fort: "Le milieu de gamme de la Predator, en version enfant (J) et adulte.",
      limite: "Semelle à crampons : pas faite pour le stabilisé ni la salle." },
    { cat: "crampons", nom: "Nike Tiempo Maestro Academy FG/MG", q: "Nike Tiempo Maestro Academy FG/MG", marque: "Nike",
      ages: ["enfant", "grand"], terrains: ["herbe", "synthe"], gamme: "milieu", niveaux: ["decouverte", "club"], semelle: "MG",
      fort: "Tige Techleather, dans la lignée confort de la gamme Tiempo.",
      limite: "Pensée pour le confort et le toucher plutôt que pour la légèreté maximale." },
    { cat: "crampons", nom: "Nike Phantom 6 Low Academy MG", q: "Nike Phantom 6 Low Academy MG", marque: "Nike",
      ages: ["grand"], terrains: ["herbe", "synthe"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "MG",
      fort: "Tige NikeSkin sur mesh, pour les joueurs qui cherchent du toucher de balle.",
      limite: "Semelle à crampons : à éviter sur stabilisé." },
    { cat: "crampons", nom: "Puma Ultra 6 Match FG/AG", q: "Puma Ultra 6 Match FG/AG", marque: "Puma",
      ages: ["enfant", "grand"], terrains: ["herbe", "synthe"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "FG/AG",
      fort: "Tige synthétique légère et semelle FG/AG pour l'herbe comme pour le synthétique.",
      limite: "Sur stabilisé ou five, une semelle à picots (TT) sera plus confortable." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 17 Academy AG", q: "Nike Mercurial Vapor 17 Academy AG", marque: "Nike",
      ages: ["grand"], terrains: ["synthe"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "AG",
      fort: "Semelle conçue spécialement pour le gazon synthétique.",
      limite: "Moins adaptée à l'herbe naturelle, surtout quand elle est grasse." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 17 Pro FG", q: "Nike Mercurial Vapor 17 Pro FG", marque: "Nike",
      ages: ["enfant", "grand"], terrains: ["herbe"], gamme: "haut", niveaux: ["competition"], semelle: "FG",
      fort: "Tige synthétique texturée et ajustement étroit, pour les joueurs exigeants.",
      limite: "Semelle FG : réservée à l'herbe naturelle sèche, pas au synthétique." },
    // Chaussures — stabilisé et five
    { cat: "crampons", nom: "adidas Predator Club à scratch TF (enfant)", q: "adidas Predator Club Velcro TF enfant", marque: "adidas",
      ages: ["petit", "enfant"], terrains: ["stabilise"], gamme: "entree", niveaux: ["decouverte", "club"], scratch: true, semelle: "TF",
      fort: "Scratch, boucle au talon et petits picots confortables sur terrain dur.",
      limite: "Accroche limitée sur herbe naturelle." },
    { cat: "crampons", nom: "Nike Jr. Mercurial Vapor 17 Club TF", q: "Nike Jr Mercurial Vapor 17 Club TF", marque: "Nike",
      ages: ["petit", "enfant"], terrains: ["stabilise"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "TF",
      fort: "Petits picots en caoutchouc, confortables sur le stabilisé et le five.",
      limite: "Lacets : pour les plus petits, un modèle à scratch est plus pratique." },
    { cat: "crampons", nom: "Puma Ultra 6 Play TT Jr", q: "Puma Ultra 6 Play TT Jr", marque: "Puma",
      ages: ["enfant"], terrains: ["stabilise"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "TT",
      fort: "Semelle en caoutchouc à multiples picots pour le stabilisé, avec au moins 30 % de matériaux recyclés.",
      limite: "Peu d'accroche sur herbe naturelle humide." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 17 Academy TF", q: "Nike Mercurial Vapor 17 Academy TF", marque: "Nike",
      ages: ["enfant", "grand"], terrains: ["stabilise"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "TF",
      fort: "La tige de la Vapor 17 Academy avec une semelle Turf pour le five et le stabilisé.",
      limite: "Coupe ajustée : Nike conseille de prendre une demi-pointure de plus." },
    { cat: "crampons", nom: "Nike Tiempo Maestro Academy TF", q: "Nike Tiempo Maestro Academy TF", marque: "Nike",
      ages: ["enfant", "grand"], terrains: ["stabilise"], gamme: "milieu", niveaux: ["decouverte", "club"], semelle: "TF",
      fort: "Tige Techleather confortable et semelle Turf pour les surfaces dures.",
      limite: "Peu d'accroche sur herbe naturelle." },
    { cat: "crampons", nom: "adidas Predator League TF", q: "adidas Predator League TF", marque: "adidas",
      ages: ["grand"], terrains: ["stabilise"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "TF",
      fort: "Le milieu de gamme de la Predator, en semelle Turf pour le five et le stabilisé.",
      limite: "Peu d'accroche sur herbe naturelle." },
    { cat: "crampons", nom: "Puma Future 8 Match TT Mid (jeune)", q: "Puma Future 8 Match TT Mid Jr", marque: "Puma",
      ages: ["enfant"], terrains: ["stabilise"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "TT",
      fort: "Col tricoté montant, se porte avec ou sans lacets.",
      limite: "Taillée pour les 8-16 ans : vérifiez la pointure sur la fiche." },
    { cat: "crampons", nom: "adidas F50 Hyperfast League TF (enfant)", q: "adidas F50 Hyperfast League TF enfant", marque: "adidas",
      ages: ["enfant"], terrains: ["stabilise"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "TF",
      fort: "Tige légère HALOSKIN et languette flottante, pour les joueurs rapides.",
      limite: "Peu d'accroche sur herbe naturelle." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 17 Pro TF", q: "Nike Mercurial Vapor 17 Pro TF", marque: "Nike",
      ages: ["grand"], terrains: ["stabilise"], gamme: "haut", niveaux: ["competition"], semelle: "TF",
      fort: "Le haut de gamme Mercurial en version Turf, pour le five et le stabilisé.",
      limite: "Inutile sur herbe naturelle, où une semelle à crampons accroche mieux." },
    // Chaussures — salle
    { cat: "crampons", nom: "Nike Jr. Mercurial Vapor 17 Club IC", q: "Nike Jr Mercurial Vapor 17 Club IC", marque: "Nike",
      ages: ["petit", "enfant"], terrains: ["salle"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "IC",
      fort: "Semelle plate en caoutchouc qui ne marque pas le sol du gymnase.",
      limite: "Aucune accroche en extérieur sur herbe." },
    { cat: "crampons", nom: "Puma Future 8 Play IT (enfant)", q: "Puma Future 8 Play IT enfant", marque: "Puma",
      ages: ["enfant"], terrains: ["salle"], gamme: "entree", niveaux: ["decouverte", "club"], scratch: true, semelle: "IT",
      fort: "Scratch et semelle non marquante, pour les 8-16 ans.",
      limite: "Pensée uniquement pour la salle." },
    { cat: "crampons", nom: "Nike Jr. Mercurial Vapor 17 Academy IC", q: "Nike Jr Mercurial Vapor 17 Academy IC", marque: "Nike",
      ages: ["enfant"], terrains: ["salle"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "IC",
      fort: "Le milieu de gamme Mercurial en version salle, pour le futsal en club.",
      limite: "Pensée uniquement pour la salle." },
    { cat: "crampons", nom: "Nike Mercurial Vapor 16 Club IC", q: "Nike Mercurial Vapor 16 Club IC", marque: "Nike",
      ages: ["grand"], terrains: ["salle"], gamme: "entree", niveaux: ["decouverte", "club"], semelle: "IC",
      fort: "Une chaussure de salle simple, à semelle plate non marquante.",
      limite: "Génération précédente de la gamme : vérifiez que la pointure est disponible sur la fiche." },
    { cat: "crampons", nom: "Nike Gato", q: "Nike Gato chaussures futsal", marque: "Nike",
      ages: ["grand"], terrains: ["salle"], gamme: "milieu", niveaux: ["decouverte", "club"], semelle: "IC",
      fort: "Le modèle de futsal classique de Nike, avec une tige en cuir ou en suède selon les versions.",
      limite: "Pensée uniquement pour la salle." },
    { cat: "crampons", nom: "adidas Predator League IN", q: "adidas Predator League IN", marque: "adidas",
      ages: ["grand"], terrains: ["salle"], gamme: "milieu", niveaux: ["club", "competition"], semelle: "IN",
      fort: "Le milieu de gamme de la Predator en version salle.",
      limite: "Pensée uniquement pour la salle." },

    // Ballons (tailles disponibles dans « tailles »)
    { cat: "ballon", nom: "Nike Pitch", q: "ballon Nike Pitch", marque: "Nike", tailles: [3, 4, 5],
      gamme: "entree", niveaux: ["decouverte", "club"], resistant: true,
      fort: "Revêtement résistant, pensé pour l'entraînement de tous les jours.",
      limite: "Toucher moins fin qu'un ballon de match." },
    { cat: "ballon", nom: "Puma Orbita 6 MS", q: "ballon Puma Orbita 6 MS", marque: "Puma", tailles: [3, 4, 5],
      gamme: "entree", niveaux: ["decouverte", "club"], resistant: true,
      fort: "Ballon d'entraînement cousu machine, avec une chambre en caoutchouc.",
      limite: "Un ballon cousu absorbe plus l'eau qu'un ballon thermocollé." },
    { cat: "ballon", nom: "Select Classic", q: "ballon Select Classic", marque: "Select", tailles: [3, 4, 5],
      gamme: "entree", niveaux: ["decouverte"], resistant: true,
      fort: "Ballon loisir cousu, pour le jardin, la rue ou le city.",
      limite: "Pensé pour le loisir plutôt que pour les matchs en club." },
    { cat: "ballon", nom: "Uhlsport 290 Ultra Lite Synergy", q: "ballon Uhlsport 290 Ultra Lite Synergy", marque: "Uhlsport", tailles: [3, 4],
      gamme: "entree", niveaux: ["decouverte", "club"], leger: true, agesMax: "enfant",
      fort: "Seulement 290 grammes : moins lourd et moins impressionnant pour les jeunes enfants.",
      limite: "Plus léger qu'un ballon standard : à réserver aux plus jeunes." },
    { cat: "ballon", nom: "Nike Academy", q: "ballon Nike Academy", marque: "Nike", tailles: [3, 4, 5],
      gamme: "milieu", niveaux: ["club", "competition"],
      fort: "Surface à rainures pour une trajectoire plus stable.",
      limite: "Ballon d'entraînement plutôt que ballon de match." },
    { cat: "ballon", nom: "Select Brillant Training", q: "ballon Select Brillant Training", marque: "Select", tailles: [4, 5],
      gamme: "milieu", niveaux: ["club", "competition"],
      fort: "Panneaux cousus puis thermocollés : il absorbe moins l'eau.",
      limite: "Version entraînement : toucher un cran en dessous du Brillant Super." },
    { cat: "ballon", nom: "adidas Trionda League", q: "ballon adidas Trionda League", marque: "adidas", tailles: [4, 5],
      gamme: "milieu", niveaux: ["club", "competition"], label: "FIFA Quality",
      fort: "Label FIFA Quality et construction sans couture.",
      limite: "Ballon de terrain : gardez-le pour l'herbe et le synthétique, pas pour le bitume." },
    { cat: "ballon", nom: "Puma Orbita 4 Hybrid", q: "ballon Puma Orbita 4 Hybrid", marque: "Puma", tailles: [5],
      gamme: "milieu", niveaux: ["club", "competition"], label: "FIFA Basic",
      fort: "Label FIFA Basic, construction hybride sans coutures visibles.",
      limite: "Taille 5 uniquement." },
    { cat: "ballon", nom: "Select Brillant Super TB", q: "ballon Select Brillant Super TB", marque: "Select", tailles: [3, 4, 5],
      gamme: "haut", niveaux: ["competition"], label: "FIFA Quality Pro (taille 5)",
      fort: "Ballon de match thermocollé, label FIFA Quality Pro en taille 5.",
      limite: "Ballon de match : moins adapté au bitume ou aux frappes contre un mur." },
    { cat: "ballon", nom: "Puma Orbita 1 TB FIFA Quality Pro", q: "ballon Puma Orbita 1 TB FIFA Quality Pro", marque: "Puma", tailles: [5],
      gamme: "haut", niveaux: ["competition"], label: "FIFA Quality Pro",
      fort: "Ballon de match à 12 panneaux moulés, label FIFA Quality Pro.",
      limite: "Ballon de match : moins adapté au bitume ou aux frappes contre un mur." },
    // Ballons de futsal
    { cat: "ballon", futsal: true, nom: "adidas Tiro League Sala", q: "ballon adidas Tiro League Sala", marque: "adidas", tailles: [3],
      gamme: "milieu", niveaux: ["decouverte", "club", "competition"],
      fort: "Ballon de futsal à rebond réduit, en taille 3 pour les jeunes.",
      limite: "Pour les adultes, il faut un ballon de futsal taille 4." },
    { cat: "ballon", futsal: true, nom: "Select Futsal Mimas", q: "ballon Select Futsal Mimas", marque: "Select", tailles: [4],
      gamme: "entree", niveaux: ["decouverte", "club"], label: "FIFA Basic",
      fort: "Taille officielle du futsal, cousu main, label FIFA Basic.",
      limite: "Rebond volontairement faible : il n'est pas fait pour jouer dehors." },
    { cat: "ballon", futsal: true, nom: "Nike Maestro (futsal)", q: "ballon futsal Nike Maestro", marque: "Nike", tailles: [4],
      gamme: "entree", niveaux: ["decouverte", "club"],
      fort: "Ballon de futsal à la taille et au poids officiels.",
      limite: "Rebond volontairement faible : il n'est pas fait pour jouer dehors." },
    { cat: "ballon", futsal: true, nom: "Select Futsal Super", q: "ballon Select Futsal Super", marque: "Select", tailles: [4],
      gamme: "haut", niveaux: ["club", "competition"], label: "FIFA Quality Pro",
      fort: "Ballon de match de futsal, label FIFA Quality Pro.",
      limite: "Ballon de match : inutile pour un usage loisir." },

    // Protège-tibias
    { cat: "tibias", nom: "Puma ULTRA Flex, protège-tibias et chevilles", q: "Puma ULTRA Flex protège-tibias chevilles", marque: "Puma",
      ages: ["petit", "enfant", "grand"], gamme: "entree", niveaux: ["decouverte", "club"], type: "cheville",
      fort: "Chaussette rembourrée qui protège aussi la cheville, conforme à la norme EN 13061.",
      limite: "Plus chaud et plus encombrant qu'un modèle à manchon." },
    { cat: "tibias", nom: "Nike Charge (enfant)", q: "protège-tibias Nike Charge enfant", marque: "Nike",
      ages: ["petit", "enfant"], gamme: "entree", niveaux: ["decouverte", "club"], type: "coque",
      fort: "Coque rigide et mousse de confort, en tailles enfant S, M et L.",
      limite: "Pas de protection de la cheville." },
    { cat: "tibias", nom: "Puma ULTRA Flex Sleeve", q: "Puma ULTRA Flex Sleeve protège-tibias", marque: "Puma",
      ages: ["petit", "enfant", "grand"], gamme: "entree", niveaux: ["decouverte", "club", "competition"], type: "manchon",
      fort: "Manchon de compression, avec des tailles dès moins de 1 mètre.",
      limite: "Coque souple : protection plus légère qu'une coque rigide." },
    { cat: "tibias", nom: "adidas Tiro League", q: "protège-tibias adidas Tiro League", marque: "adidas",
      ages: ["enfant", "grand"], gamme: "milieu", niveaux: ["decouverte", "club"], type: "scratch",
      fort: "Coque rigide en polypropylène et rembourrage EVA, en tailles enfant et adulte.",
      limite: "Fixation par scratch à bien serrer pour qu'il ne tourne pas." },
    { cat: "tibias", nom: "Puma ULTRA Light Sleeve", q: "Puma ULTRA Light Sleeve protège-tibias", marque: "Puma",
      ages: ["grand"], gamme: "entree", niveaux: ["club", "competition"], type: "manchon",
      fort: "Très léger, maintenu par un manchon.",
      limite: "Disponible seulement en tailles S, M et L." },
    { cat: "tibias", nom: "Nike Mercurial Lite", q: "protège-tibias Nike Mercurial Lite", marque: "Nike",
      ages: ["grand"], gamme: "milieu", niveaux: ["club", "competition"], type: "manchon",
      fort: "Coque fine et basse, maintenue par des manchons extensibles.",
      limite: "Protège moins les côtés et la cheville qu'un modèle à chevillère." },
    { cat: "tibias", nom: "G-Form Pro-S Vento", q: "protège-tibias G-Form Pro-S Vento", marque: "G-Form",
      ages: ["enfant", "grand"], gamme: "haut", niveaux: ["club", "competition"], type: "manchon",
      fort: "Protection souple intégrée au manchon, qui durcit au choc. Lavable en machine.",
      limite: "Marque moins répandue : vérifiez bien la taille sur le guide G-Form." },
    { cat: "tibias", nom: "Nike Mercurial FlyLite SuperLock", q: "protège-tibias Nike Mercurial FlyLite SuperLock", marque: "Nike",
      ages: ["grand"], gamme: "haut", niveaux: ["competition"], type: "manchon",
      fort: "Coque souple qui épouse le tibia, avec un modèle gauche et un modèle droit.",
      limite: "Protection plus légère qu'une coque rigide classique." }
  ];

  /* ---------- Textes d'explication ---------- */
  var GAMME = { entree: "entrée de gamme", milieu: "milieu de gamme", haut: "haut de gamme" };
  var RANG = { entree: 0, milieu: 1, haut: 2 };
  var SEMELLE = {
    MG: "Semelle MG (multi-surfaces) : adaptée à l'herbe naturelle et au synthétique.",
    FxG: "Semelle FxG (multi-surfaces) : adaptée à l'herbe naturelle et au synthétique.",
    "FG/AG": "Semelle FG/AG : adaptée à l'herbe naturelle et au synthétique.",
    FG: "Semelle FG : conçue pour l'herbe naturelle.",
    AG: "Semelle AG : conçue pour le gazon synthétique.",
    TF: "Semelle TF à petits picots : adaptée au stabilisé, au five et aux terrains durs.",
    TT: "Semelle TT à petits picots : adaptée au stabilisé et aux terrains durs.",
    IC: "Semelle de salle plate, qui ne marque pas le sol.",
    IN: "Semelle de salle plate, qui ne marque pas le sol.",
    IT: "Semelle de salle plate, qui ne marque pas le sol."
  };
  var TYPE_PT = {
    cheville: "Avec protection de la cheville : le plus protecteur, facile à enfiler.",
    coque: "Coque rigide classique, simple à utiliser.",
    scratch: "Coque rigide fixée par scratch : elle reste bien en place.",
    manchon: "Maintenu par un manchon : léger et peu gênant en courant."
  };
  var GUIDES = {
    crampons: ["articles/crampons-fg-ag-sg-tf-quel-terrain/", "Crampons FG, AG, SG, TF : quelle semelle pour quel terrain ?"],
    crampons_enfant: ["articles/pointure-chaussures-foot-enfant/", "Chaussures de foot pour enfant : comment choisir la pointure ?"],
    ballon: ["articles/taille-ballon-foot-selon-age/", "Quelle taille de ballon de foot selon l'âge ?"],
    tibias: ["articles/choisir-protege-tibias/", "Protège-tibias : comment bien les choisir ?"]
  };

  function tailleBallon(r) {
    if (r.terrain === "salle") return r.age === "grand" ? 4 : 3;
    return r.age === "petit" ? 3 : r.age === "enfant" ? 4 : 5;
  }

  /* ---------- Règles de recommandation ---------- */
  function terrainOk(p, t) {
    if (t === "plusieurs") return p.terrains.indexOf("herbe") > -1 && p.terrains.indexOf("synthe") > -1;
    return p.terrains.indexOf(t) > -1;
  }

  function candidats(r) {
    return P.filter(function (p) {
      if (p.cat !== r.cat) return false;
      if (r.cat === "crampons") return p.ages.indexOf(r.age) > -1 && terrainOk(p, r.terrain);
      if (r.cat === "ballon") {
        if (!!p.futsal !== (r.terrain === "salle")) return false;
        if (p.agesMax === "enfant" && r.age === "grand") return false;
        var t = tailleBallon(r);
        if (r.terrain === "salle" && r.age === "enfant") return p.tailles.indexOf(3) > -1 || p.tailles.indexOf(4) > -1;
        return p.tailles.indexOf(t) > -1;
      }
      return p.ages.indexOf(r.age) > -1;
    });
  }

  function score(p, r) {
    var s = 0, d = Math.abs(RANG[p.gamme] - RANG[r.budget]);
    s += d === 0 ? 6 : d === 1 ? 2 : 0;
    if (p.niveaux.indexOf(r.niveau) > -1) s += 3;
    if (r.cat === "crampons") {
      if (r.age === "petit") s += p.scratch ? 3 : 0;
      if (r.terrain === "plusieurs" && /MG|FxG|FG\/AG/.test(p.semelle)) s += 1;
    }
    if (r.cat === "ballon") {
      if (r.age === "petit" && p.leger) s += 3;
      if ((r.terrain === "stabilise" || r.terrain === "synthe") && p.resistant) s += 2;
      if (r.terrain === "stabilise" && p.gamme === "haut") s -= 3;
      if (r.terrain === "salle" && r.age === "enfant" && p.tailles.indexOf(3) > -1) s += 1;
    }
    if (r.cat === "tibias") {
      if ((r.age === "petit" || r.niveau === "decouverte") && (p.type === "cheville" || p.type === "coque" || p.type === "scratch")) s += 2;
      if (r.niveau === "competition" && p.type === "manchon") s += 2;
    }
    return s;
  }

  function recommander(r) {
    var liste = candidats(r).map(function (p, i) { return { p: p, s: score(p, r), i: i }; });
    liste.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    var choix = [], marques = {};
    // 1er passage : varier les marques quand les scores sont proches
    liste.forEach(function (x) {
      if (choix.length >= 3) return;
      var meilleur = liste[0] ? liste[0].s : 0;
      if (!marques[x.p.marque] || x.s < meilleur - 2) { choix.push(x); marques[x.p.marque] = 1; }
    });
    liste.forEach(function (x) { if (choix.length < 3 && choix.indexOf(x) < 0) choix.push(x); });
    choix.sort(function (a, b) { return b.s - a.s || a.i - b.i; });
    return choix.map(function (x) { return x.p; });
  }

  function raisons(p, r) {
    var out = [];
    if (r.cat === "crampons") {
      out.push(SEMELLE[p.semelle]);
      if (p.scratch && r.age !== "grand") out.push("Fermeture à scratch : pratique pour un enfant.");
      else if (r.age !== "grand") out.push("Existe en version enfant.");
    }
    if (r.cat === "ballon") {
      var t = tailleBallon(r);
      if (r.terrain === "salle") {
        out.push(r.age === "grand"
          ? "Ballon de futsal taille 4, la taille officielle en salle."
          : (p.tailles.indexOf(3) > -1 ? "Ballon de futsal taille 3, souvent utilisé chez les jeunes. Demandez à l'éducateur la taille utilisée au club."
                                        : "Ballon de futsal taille 4. Chez les jeunes, certains clubs jouent en taille 3 : demandez à l'éducateur."));
      } else {
        out.push("Existe en taille " + t + ", la taille " + (t === 3 ? "conseillée jusqu'à 8 ans environ (U6 à U9)." : t === 4 ? "conseillée de 8 à 12 ans environ (U10 à U13)." : "des 13 ans et plus et des adultes."));
      }
      if (p.label) out.push("Label " + p.label + ".");
    }
    if (r.cat === "tibias") out.push(TYPE_PT[p.type]);
    var d = RANG[p.gamme] - RANG[r.budget];
    if (d === 0) out.push("Gamme : " + GAMME[p.gamme] + ", comme demandé.");
    else out.push("Gamme : " + GAMME[p.gamme] + ". C'est " + (d > 0 ? "un cran au-dessus" : "un cran en dessous") + " de votre budget : c'est le modèle le plus proche de vos réponses dans notre sélection.");
    return out;
  }

  function amazon(p, r) {
    var q = p.q;
    if (r.cat === "ballon" && p.tailles.length > 1) {
      var t = tailleBallon(r);
      if (p.tailles.indexOf(t) < 0) t = p.tailles[0];
      q += " taille " + t;
    }
    return "https://www.amazon.fr/s?k=" + encodeURIComponent(q) + "&tag=" + TAG;
  }

  /* ---------- Interface ---------- */
  var root = document.getElementById("cmp");
  if (!root) return;
  var form = root.querySelector("form");
  var zone = root.querySelector(".cmp-step");
  var res = root.querySelector(".cmp-res");
  var etat = {}, pos = 0;

  function etapes() {
    return QUESTIONS.filter(function (q) { return !q.sauf || q.sauf.indexOf(etat.cat) < 0; });
  }

  function el(tag, attrs, txt) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (txt != null) e.textContent = txt;
    return e;
  }

  function afficherQuestion(focus) {
    var liste = etapes(), q = liste[pos];
    res.hidden = true; form.hidden = false;
    zone.textContent = "";
    var fs = el("fieldset", { "class": "cmp-fs", "aria-describedby": "cmp-err" });
    var lg = el("legend", { "class": "cmp-legend" });
    var qh = el("span", { "class": "cmp-q", id: "cmp-q", tabindex: "-1" });
    qh.appendChild(el("span", { "class": "cmp-count" }, "Question " + (pos + 1) + " sur " + liste.length + ". "));
    qh.appendChild(el("span", { "class": "cmp-qt" }, q.titre));
    lg.appendChild(qh);
    fs.appendChild(lg);
    var box = el("div", { "class": "cmp-opts" });
    q.options.forEach(function (o, i) {
      var id = "cmp-" + q.id + "-" + o[0];
      var lab = el("label", { "class": "cmp-opt", "for": id });
      var inp = el("input", { type: "radio", name: q.id, id: id, value: o[0] });
      if (etat[q.id] === o[0]) inp.checked = true;
      lab.appendChild(inp);
      lab.appendChild(el("span", {}, o[1]));
      box.appendChild(lab);
    });
    fs.appendChild(box);
    zone.appendChild(fs);
    var err = root.querySelector("#cmp-err");
    err.textContent = "";
    root.querySelector(".cmp-prev").hidden = pos === 0;
    root.querySelector(".cmp-next").textContent = pos === liste.length - 1 ? "Voir mes suggestions" : "Suivant";
    if (focus) root.querySelector("#cmp-q").focus();
  }

  function afficherResultats() {
    var r = etat, liste = recommander(r);
    form.hidden = true; res.hidden = false;
    res.textContent = "";
    var h = el("h2", { id: "cmp-res-h", tabindex: "-1" },
      liste.length ? (liste.length === 1 ? "Notre suggestion pour vous" : "Nos " + liste.length + " suggestions pour vous") : "Aucun modèle ne correspond");
    res.appendChild(h);
    var resume = QUESTIONS.filter(function (q) { return r[q.id] && etapes().indexOf(q) > -1; })
      .map(function (q) { return q.options.filter(function (o) { return o[0] === r[q.id]; })[0][1]; }).join(", ");
    res.appendChild(el("p", { "class": "cmp-recap" }, "Vos réponses : " + resume + "."));
    if (liste.length < 3 && liste.length > 0) {
      res.appendChild(el("p", { "class": "cmp-note" }, "Peu de modèles de notre sélection correspondent exactement à ces réponses. Nous préférons vous en montrer moins que vous proposer un équipement inadapté."));
    }
    if (!liste.length) {
      res.appendChild(el("p", {}, "Nous n'avons pas encore de modèle vérifié pour ce cas. Le guide ci-dessous vous aidera à choisir."));
    }
    var ol = el("ol", { "class": "cmp-list" });
    liste.forEach(function (p, i) {
      var li = el("li", { "class": "prod cmp-prod" });
      li.appendChild(el("h3", { "class": "prod-name" }, "Suggestion " + (i + 1) + " : " + p.nom));
      li.appendChild(el("p", { "class": "cmp-sub" }, "Pourquoi pour vous"));
      var ul = el("ul", { "class": "cmp-why" });
      raisons(p, r).forEach(function (t) { ul.appendChild(el("li", {}, t)); });
      li.appendChild(ul);
      var pf = el("p", {}); pf.appendChild(el("strong", {}, "Point fort : ")); pf.appendChild(document.createTextNode(p.fort)); li.appendChild(pf);
      var pl = el("p", {}); pl.appendChild(el("strong", {}, "À savoir : ")); pl.appendChild(document.createTextNode(p.limite)); li.appendChild(pl);
      var pa = el("p", { "class": "aff" });
      var a = el("a", { "class": "aff-btn", href: amazon(p, r), rel: "sponsored nofollow noopener", target: "_blank" }, "Voir " + p.nom + " sur Amazon");
      a.appendChild(el("span", { "class": "aff-tag" }, " (lien affilié, nouvel onglet)"));
      pa.appendChild(a); li.appendChild(pa);
      ol.appendChild(li);
    });
    res.appendChild(ol);
    res.appendChild(el("p", { "class": "cmp-note" }, "Prix et disponibilité : vérifiez-les sur Amazon, ils changent souvent. Vérifiez aussi la taille ou la pointure sur la fiche avant de commander."));
    var g = [GUIDES[r.cat]];
    if (r.cat === "crampons" && r.age !== "grand") g.push(GUIDES.crampons_enfant);
    var gp = el("p", {}); gp.appendChild(document.createTextNode(g.length > 1 ? "Pour aller plus loin, lisez nos guides : " : "Pour aller plus loin, lisez notre guide : "));
    g.forEach(function (x, i) {
      if (i) gp.appendChild(document.createTextNode(" et "));
      gp.appendChild(el("a", { href: SITE + "/" + x[0] }, x[1]));
    });
    gp.appendChild(document.createTextNode("."));
    res.appendChild(gp);
    var actions = el("div", { "class": "cmp-actions" });
    var b1 = el("button", { type: "button", "class": "cmp-btn cmp-btn-ghost" }, "Modifier mes réponses");
    var b2 = el("button", { type: "button", "class": "cmp-btn" }, "Recommencer");
    b1.addEventListener("click", function () { pos = etapes().length - 1; afficherQuestion(true); });
    b2.addEventListener("click", function () { etat = {}; pos = 0; afficherQuestion(true); });
    actions.appendChild(b1); actions.appendChild(b2);
    res.appendChild(actions);
    h.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = etapes()[pos];
    var c = form.querySelector('input[name="' + q.id + '"]:checked');
    if (!c) {
      var err = root.querySelector("#cmp-err");
      err.textContent = "Choisissez une réponse pour continuer.";
      form.querySelector('input[name="' + q.id + '"]').focus();
      return;
    }
    etat[q.id] = c.value;
    if (q.id === "cat" && etat.cat === "tibias") delete etat.terrain;
    if (pos < etapes().length - 1) { pos++; afficherQuestion(true); }
    else afficherResultats();
  });
  root.querySelector(".cmp-prev").addEventListener("click", function () {
    if (pos > 0) { pos--; afficherQuestion(true); }
  });

  root.hidden = false;
  var ns = document.getElementById("cmp-nojs"); if (ns) ns.hidden = true;
  afficherQuestion(false);

  // Exposé pour les tests automatiques
  window.__cmp = { recommander: recommander, P: P, raisons: raisons };
})();
