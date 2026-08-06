// Long-tail SEO guide content — French only, deliberately. Unlike the rest of the app (which is
// translated ln/fr/en via next-intl message files), this content targets French-language search
// queries specifically: French carries more Google search volume in DRC than Lingala even among
// Lingala speakers (see CLAUDE.md "Local SEO"), so these guides are hand-written French articles,
// not translated strings — there's no ln/en equivalent to keep in sync. The [locale]/guides routes
// 404 outside "fr" rather than serving a half-translated or English fallback.

export type GuideFaq = { question: string; answer: string };
export type GuideSection = { heading: string; paragraphs: string[] };

export type Guide = {
  slug: string;
  title: string; // <h1> and <title> base — kept the same, since there's no separate SEO-title need here
  metaDescription: string;
  updatedAt: string; // ISO date, shown on-page and in Article JSON-LD
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
};

const GUIDES: Guide[] = [
  {
    slug: "comment-installer-esim-rdc",
    title: "Comment installer une eSIM en RDC : guide étape par étape",
    metaDescription:
      "Guide complet pour installer une eSIM en République Démocratique du Congo : téléphones compatibles, étapes d'activation, et astuces pour éviter les erreurs courantes.",
    updatedAt: "2026-08-06",
    intro:
      "L'eSIM (SIM électronique) permet de se connecter à Internet en RDC sans passer par une carte SIM physique, une file d'attente en boutique, ou un enregistrement d'identité sur place. Voici comment l'installer, étape par étape.",
    sections: [
      {
        heading: "Votre téléphone est-il compatible eSIM ?",
        paragraphs: [
          "La plupart des smartphones récents supportent l'eSIM : iPhone (XS et modèles plus récents), Samsung Galaxy (S20 et plus récents, ainsi que les modèles Z Flip/Fold), Google Pixel (3 et plus récents), et de nombreux autres modèles haut et moyen de gamme sortis depuis 2019.",
          "Pour vérifier rapidement : sur iPhone, allez dans Réglages > Général > Informations et cherchez « EID ». Sur Android, cherchez « eSIM » dans les paramètres de réseau mobile. Si l'option existe, votre téléphone est compatible.",
          "Attention : un téléphone acheté « débloqué opérateur » aux États-Unis ou en Chine ne supporte pas toujours l'eSIM, même sur un modèle récent — certaines versions régionales la désactivent. En cas de doute, vérifiez le modèle exact avant d'acheter.",
        ],
      },
      {
        heading: "Étape 1 : choisir et payer votre forfait",
        paragraphs: [
          "Comparez les forfaits eSIM disponibles pour la RDC (réseau Vodacom ou Orange, selon la couverture souhaitée), puis payez avec un portefeuille Bitcoin Lightning ou directement depuis votre solde M-Pesa ou mobile money via Machankura — sans carte bancaire internationale.",
        ],
      },
      {
        heading: "Étape 2 : recevoir votre code QR",
        paragraphs: [
          "Une fois le paiement confirmé, vous recevez immédiatement par e-mail un code QR ainsi qu'un code d'activation manuel. Gardez cet e-mail : le code QR est ce que votre téléphone va scanner pour installer l'eSIM.",
        ],
      },
      {
        heading: "Étape 3 : installer l'eSIM sur votre téléphone",
        paragraphs: [
          "Connectez d'abord votre téléphone au Wi-Fi — l'installation d'une eSIM nécessite une connexion Internet active (vous ne pouvez pas encore utiliser les données mobiles de l'eSIM elle-même à ce stade).",
          "Sur iPhone : Réglages > Cellulaire > Ajouter un forfait cellulaire > scannez le code QR reçu par e-mail.",
          "Sur Android (Samsung, Pixel, et la plupart des autres marques) : Paramètres > Connexions (ou Réseau et Internet) > Gestionnaire de cartes SIM > Ajouter un forfait mobile > scannez le code QR.",
          "Si le scan du code QR échoue, utilisez l'option « Saisir les détails manuellement » et entrez le code d'activation reçu dans le même e-mail.",
        ],
      },
      {
        heading: "Étape 4 : activer et utiliser votre eSIM",
        paragraphs: [
          "Une fois l'eSIM installée, activez-la comme ligne de données. Votre téléphone peut garder votre carte SIM physique active en parallèle (pour les appels et SMS) tout en utilisant l'eSIM pour Internet — c'est la configuration double SIM, disponible sur presque tous les téléphones compatibles eSIM.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien de temps faut-il pour recevoir mon eSIM après paiement ?",
        answer:
          "Le code QR et les instructions arrivent par e-mail immédiatement après la confirmation du paiement, généralement en quelques secondes.",
      },
      {
        question: "Puis-je utiliser l'eSIM avec ma carte SIM physique en même temps ?",
        answer:
          "Oui. La quasi-totalité des téléphones compatibles eSIM supportent la double SIM : vous gardez votre carte physique pour les appels/SMS et utilisez l'eSIM pour les données, ou l'inverse.",
      },
      {
        question: "Que faire si mon téléphone ne scanne pas le code QR ?",
        answer:
          "Utilisez l'option de saisie manuelle disponible dans le même menu d'installation (Réglages > Cellulaire sur iPhone, Gestionnaire de cartes SIM sur Android) et entrez le code d'activation texte fourni dans l'e-mail, à la place du QR code.",
      },
    ],
  },
  {
    slug: "esim-vs-carte-sim-physique-rdc",
    title: "eSIM vs carte SIM physique en RDC : quelle est la meilleure option ?",
    metaDescription:
      "eSIM ou carte SIM physique pour se connecter en RDC ? Comparatif détaillé : rapidité d'activation, couverture réseau, prix, et cas d'usage pour voyageurs et diaspora.",
    updatedAt: "2026-08-06",
    intro:
      "Se connecter à Internet en RDC est possible avec une carte SIM physique achetée en boutique, ou avec une eSIM activée à distance. Voici les différences concrètes entre les deux options.",
    sections: [
      {
        heading: "Rapidité d'activation",
        paragraphs: [
          "Une carte SIM physique nécessite de se déplacer en boutique Vodacom ou Orange, de présenter une pièce d'identité pour l'enregistrement (obligatoire en RDC), et parfois d'attendre en file. Cela peut prendre de 30 minutes à plusieurs heures selon l'affluence.",
          "Une eSIM s'achète et s'installe en ligne, sans déplacement : le code QR arrive par e-mail dans les secondes qui suivent le paiement, et l'installation elle-même prend deux à trois minutes.",
        ],
      },
      {
        heading: "Pour qui l'eSIM est-elle particulièrement adaptée ?",
        paragraphs: [
          "Pour la diaspora congolaise qui visite la RDC ponctuellement et ne veut pas gérer une carte SIM physique à chaque séjour.",
          "Pour les voyageurs internationaux qui veulent une connexion dès l'arrivée à l'aéroport, sans chercher une boutique.",
          "Pour toute personne qui préfère payer en Bitcoin Lightning ou en mobile money plutôt qu'en espèces sur place.",
        ],
      },
      {
        heading: "Quand une carte SIM physique reste pertinente",
        paragraphs: [
          "Si vous avez besoin d'un numéro de téléphone local pour recevoir des appels ou SMS sur le long terme, une carte SIM physique classique reste la solution standard — les forfaits eSIM présentés ici sont orientés données mobiles.",
          "Si votre téléphone ne supporte pas l'eSIM (modèles plus anciens ou certaines versions régionales), la carte physique reste votre seule option.",
        ],
      },
      {
        heading: "Couverture réseau : identique dans les deux cas",
        paragraphs: [
          "Une eSIM Vodacom ou Orange utilise exactement le même réseau physique qu'une carte SIM classique du même opérateur — la couverture (Kinshasa, Lubumbashi, et les grands axes) est identique. Le choix eSIM vs carte physique ne change rien à la qualité du signal.",
        ],
      },
    ],
    faq: [
      {
        question: "L'eSIM est-elle plus chère qu'une carte SIM physique en RDC ?",
        answer:
          "Le prix dépend du forfait de données choisi, pas du format (eSIM ou physique) — les deux options utilisent la même infrastructure réseau et sont généralement dans la même fourchette de prix pour un volume de données équivalent.",
      },
      {
        question: "Puis-je recevoir des appels avec une eSIM de données ?",
        answer:
          "Les forfaits eSIM proposés ici sont orientés données mobiles (Internet). Pour un numéro local avec appels/SMS, une carte SIM physique classique reste nécessaire en complément.",
      },
    ],
  },
  {
    slug: "payer-esim-bitcoin-mobile-money-rdc",
    title: "Comment payer votre eSIM en RDC avec Bitcoin Lightning ou Mobile Money",
    metaDescription:
      "Pas de carte bancaire internationale ? Découvrez comment payer une eSIM en RDC directement depuis votre solde M-Pesa ou mobile money, ou avec un portefeuille Bitcoin Lightning.",
    updatedAt: "2026-08-06",
    intro:
      "Beaucoup de sites de vente d'eSIM exigent une carte bancaire internationale (Visa, Mastercard) — une contrainte réelle pour une grande partie du marché congolais. Il existe une alternative : payer directement depuis un solde mobile money ou un portefeuille Bitcoin Lightning, sans carte bancaire.",
    sections: [
      {
        heading: "Pourquoi le paiement par carte bancaire pose problème en RDC",
        paragraphs: [
          "L'accès à une carte bancaire internationale reste limité en RDC — beaucoup de personnes utilisent le mobile money (M-Pesa, Airtel Money, Orange Money) comme moyen de paiement principal, sans compte bancaire classique associé à une carte Visa ou Mastercard.",
          "Cela exclut de fait une grande partie des acheteurs potentiels des sites d'eSIM classiques, qui n'acceptent souvent que la carte bancaire.",
        ],
      },
      {
        heading: "La solution : une facture Bitcoin Lightning payable en mobile money",
        paragraphs: [
          "Le paiement fonctionne via une facture Bitcoin Lightning (un type de paiement Bitcoin quasi instantané et à frais très bas), générée automatiquement au moment de l'achat.",
          "Cette facture peut être payée de deux façons : directement depuis un portefeuille Bitcoin Lightning si vous en possédez un, ou — pour la majorité des acheteurs — via Machankura, un service qui fait le pont entre votre solde M-Pesa ou mobile money et le réseau Lightning, par USSD, sans application à installer.",
        ],
      },
      {
        heading: "Payer avec Machankura, étape par étape",
        paragraphs: [
          "Au moment du paiement, un code QR et une facture Lightning s'affichent sur la page de paiement.",
          "Composez le code USSD Machankura depuis votre téléphone (indiqué sur la page de paiement), suivez les instructions pour coller ou saisir la facture Lightning affichée, puis confirmez le paiement depuis votre solde mobile money habituel.",
          "Dès que le paiement est confirmé sur le réseau Lightning — généralement en quelques secondes — la commande passe automatiquement au statut « payé » et l'eSIM est envoyée par e-mail.",
        ],
      },
      {
        heading: "Est-ce sécurisé ?",
        paragraphs: [
          "Le paiement Lightning est confirmé de façon cryptographique sur le réseau Bitcoin — une fois la facture payée, la confirmation est immédiate et vérifiable, sans intermédiaire capable de la falsifier. Machankura ne fait que convertir votre solde mobile money en paiement Lightning ; il ne stocke pas votre argent au-delà de cette conversion ponctuelle.",
        ],
      },
    ],
    faq: [
      {
        question: "Ai-je besoin d'un compte bancaire pour payer ?",
        answer:
          "Non. Le paiement via Machankura fonctionne directement depuis un solde mobile money (M-Pesa, Airtel Money, Orange Money) par USSD, sans compte bancaire ni carte associée.",
      },
      {
        question: "Ai-je besoin de connaître le Bitcoin pour utiliser ce mode de paiement ?",
        answer:
          "Non — Machankura gère la conversion en arrière-plan. Du point de vue de l'acheteur, l'expérience ressemble à un paiement mobile money classique par USSD.",
      },
      {
        question: "Que faire si mon paiement mobile money échoue ?",
        answer:
          "La facture Lightning reste valable pendant une durée limitée affichée sur la page de paiement. En cas d'échec, réessayez la procédure Machankura ; si la facture expire, relancez simplement une nouvelle commande pour en générer une nouvelle.",
      },
    ],
  },
];

export function getGuides(): Guide[] {
  return GUIDES;
}

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
