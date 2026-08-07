import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

// Long-tail SEO guide content, hand-written per locale (not run through next-intl's message-file
// pattern, since this is article prose, not short UI strings). Originally French-only — French
// carries more DRC search volume than Lingala even among Lingala speakers — then extended to
// ln/en on request. Same slug across all three locales (matching how plan IDs already work
// site-wide — routing.ts has no per-locale `pathnames` mapping), so a URL like
// /en/guides/comment-installer-esim-rdc keeps a French slug even for the English article. Not
// ideal for English/Lingala keyword targeting, but consistent with the rest of the app rather
// than introducing per-locale slugs just for this section.

export type GuideFaq = { question: string; answer: string };
export type GuideSection = { heading: string; paragraphs: string[] };

export type GuideTranslation = {
  title: string;
  metaDescription: string;
  intro: string;
  sections: GuideSection[];
  faq: GuideFaq[];
  ctaText: string;
  ctaButtonText: string;
};

export type Guide = {
  slug: string;
  updatedAt: string; // ISO date, shown on-page and in Article JSON-LD
  ctaHref: "/plans" | "/topups"; // bottom-of-article CTA target — not locale-specific, matches
  // unlocalized routing site-wide (routing.ts has no per-locale pathnames)
  translations: Record<string, GuideTranslation>; // keyed by locale — fr/ln/en
};

const GUIDES: Guide[] = [
  {
    slug: "comment-installer-esim-rdc",
    updatedAt: "2026-08-06",
    ctaHref: "/plans",
    translations: {
      fr: {
        title: "Comment installer une eSIM en RDC : guide étape par étape",
        metaDescription:
          "Guide complet pour installer une eSIM en République Démocratique du Congo : téléphones compatibles, étapes d'activation, et astuces pour éviter les erreurs courantes.",
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
        ctaText: "Prêt à vous connecter en RDC ?",
        ctaButtonText: "Voir les forfaits →",
      },
      en: {
        title: "How to Install an eSIM in DR Congo: Step-by-Step Guide",
        metaDescription:
          "Complete guide to installing an eSIM in the Democratic Republic of Congo: compatible phones, activation steps, and tips to avoid common mistakes.",
        intro:
          "An eSIM lets you get online in DR Congo without a physical SIM card, a shop queue, or on-site ID registration. Here's how to install one, step by step.",
        sections: [
          {
            heading: "Is your phone eSIM-compatible?",
            paragraphs: [
              "Most recent smartphones support eSIM: iPhone (XS and newer), Samsung Galaxy (S20 and newer, plus the Z Flip/Fold line), Google Pixel (3 and newer), and many other mid-to-high-end models released since 2019.",
              "Quick check: on iPhone, go to Settings > General > About and look for \"EID\". On Android, look for \"eSIM\" under mobile network settings. If the option exists, your phone is compatible.",
              "One catch: a phone bought \"carrier-unlocked\" in the US or China doesn't always support eSIM, even on a recent model — some regional versions disable it. If in doubt, check the exact model before buying.",
            ],
          },
          {
            heading: "Step 1: choose and pay for your plan",
            paragraphs: [
              "Compare the eSIM plans available for DR Congo (Vodacom or Orange network, depending on the coverage you want), then pay with a Bitcoin Lightning wallet or straight from your M-Pesa or mobile money balance via Machankura — no international bank card needed.",
            ],
          },
          {
            heading: "Step 2: receive your QR code",
            paragraphs: [
              "Once payment is confirmed, you immediately receive a QR code and a manual activation code by email. Keep that email — the QR code is what your phone scans to install the eSIM.",
            ],
          },
          {
            heading: "Step 3: install the eSIM on your phone",
            paragraphs: [
              "Connect your phone to Wi-Fi first — installing an eSIM needs an active internet connection (you can't yet use the eSIM's own mobile data at this stage).",
              "On iPhone: Settings > Cellular > Add Cellular Plan > scan the QR code from the email.",
              "On Android (Samsung, Pixel, and most other brands): Settings > Connections (or Network & Internet) > SIM Manager > Add Mobile Plan > scan the QR code.",
              "If scanning fails, use the \"Enter Details Manually\" option and type in the activation code from the same email.",
            ],
          },
          {
            heading: "Step 4: activate and use your eSIM",
            paragraphs: [
              "Once installed, activate the eSIM as your data line. Your phone can keep your physical SIM active in parallel (for calls and texts) while using the eSIM for data — that's the dual-SIM setup, available on nearly every eSIM-compatible phone.",
            ],
          },
        ],
        faq: [
          {
            question: "How long does it take to receive my eSIM after payment?",
            answer:
              "The QR code and instructions arrive by email immediately after payment is confirmed, usually within seconds.",
          },
          {
            question: "Can I use the eSIM alongside my physical SIM card?",
            answer:
              "Yes. Almost every eSIM-compatible phone supports dual SIM: keep your physical card for calls/texts and use the eSIM for data, or the other way around.",
          },
          {
            question: "What if my phone won't scan the QR code?",
            answer:
              "Use the manual entry option in the same install menu (Settings > Cellular on iPhone, SIM Manager on Android) and type in the text activation code from the email instead of scanning.",
          },
        ],
        ctaText: "Ready to get connected in DR Congo?",
        ctaButtonText: "View plans →",
      },
      ln: {
        title: "Ndenge ya kotia eSIM na Kongo: guide etape na etape",
        metaDescription:
          "Guide mobimba mpo na kotia eSIM na Republiki Demokratiki ya Kongo: ba téléphone oyo ekoki, ba etape ya activation, mpe ba conseil mpo na kokima mabunga oyo ekomonanaka mingi.",
        intro:
          "eSIM epesaka nzela ya kokangama na Internet na Kongo, na carte SIM ya physique te, na kotelema na molongo na boutique te, mpe na ko-enregistrer ID na esika te. Tala ndenge ya kotia yango, etape na etape.",
        sections: [
          {
            heading: "Téléphone na yo ekoki na eSIM?",
            paragraphs: [
              "Mingi ya ba smartphone ya sika esalaka na eSIM: iPhone (XS mpe oyo ya sika koleka), Samsung Galaxy (S20 mpe oyo ya sika koleka, na mpe série Z Flip/Fold), Google Pixel (3 mpe oyo ya sika koleka), mpe mingi ya ba modèle mosusu ya kitoko oyo ebimaki banda 2019.",
              "Mpo na koyeba noki: na iPhone, kende na Réglages > Général > Informations mpe luka «EID». Na Android, luka «eSIM» na ba paramètres ya réseau mobile. Soki option yango ezali, téléphone na yo ekoki.",
              "Keba: téléphone oyo osombaki «débloqué» na USA to na Chine ekokaka na eSIM tango nyonso te, ata soki ezali modèle ya sika — bamosusu ya région bakangaka yango. Soki ozali na ntembe, tala modèle exact liboso ya kosomba.",
            ],
          },
          {
            heading: "Etape 1: pona mpe futa forfait na yo",
            paragraphs: [
              "Kokanisa ba forfait ya eSIM oyo ezali mpo na Kongo (réseau Vodacom to Orange, engebene na couverture olingi), na nsima futa na portefeuille Bitcoin Lightning to mbala moko na mbongo ya M-Pesa to mobile money na yo na nzela ya Machankura — carte bancaire ya ba pays mosusu esengeli te.",
            ],
          },
          {
            heading: "Etape 2: kozua code QR na yo",
            paragraphs: [
              "Tango kaka paiement endimami, ozui mbala moko na email code QR mpe code ya activation na maboko. Batela email yango — code QR nde téléphone na yo ekotanga mpo na kotia eSIM.",
            ],
          },
          {
            heading: "Etape 3: kotia eSIM na téléphone na yo",
            paragraphs: [
              "Kanga téléphone na yo na Wi-Fi liboso — kotia eSIM esengaka connexion Internet ya solo (okoki nanu kosalela données ya eSIM yango moko te na moment oyo).",
              "Na iPhone: Réglages > Cellulaire > Ajouter un forfait cellulaire > tanga code QR oyo ezali na email.",
              "Na Android (Samsung, Pixel, mpe mingi ya ba marque mosusu): Paramètres > Connexions (to Réseau et Internet) > Gestionnaire de cartes SIM > Ajouter un forfait mobile > tanga code QR.",
              "Soki kotanga code QR elongi te, sala na option «Kokotisa ba détails na maboko» mpe kotisa code ya activation oyo ezali na email kaka wana.",
            ],
          },
          {
            heading: "Etape 4: kobanda mpe kosalela eSIM na yo",
            paragraphs: [
              "Tango eSIM esili kotiama, banda yango lokola ligne ya données. Téléphone na yo ekoki kobatela carte SIM ya physique na yo ya kobanda (mpo na ba appel mpe SMS) na tango eSIM ezali kosalela mpo na données — yango nde configuration double SIM, oyo ezali na kati ya pene nyonso ya ba téléphone oyo ekoki na eSIM.",
            ],
          },
        ],
        faq: [
          {
            question: "Ntango boni esengeli mpo na kozua eSIM na ngai nsima ya paiement?",
            answer:
              "Code QR mpe ba instructions ekoya na email mbala moko nsima ya kondimama ya paiement, mingi mingi na ba seconde.",
          },
          {
            question: "Nakoki kosalela eSIM elongo na carte SIM na ngai ya physique?",
            answer:
              "Ee. Pene nyonso ya ba téléphone oyo ekoki na eSIM esalaka na double SIM: batela carte na yo ya physique mpo na ba appel/SMS mpe salela eSIM mpo na données, to na lolenge mosusu.",
          },
          {
            question: "Soki téléphone na ngai etangi code QR te, nasala nini?",
            answer:
              "Sala na option ya kokotisa na maboko oyo ezali na kati ya menu kaka wana (Réglages > Cellulaire na iPhone, Gestionnaire de cartes SIM na Android) mpe kotisa code ya activation ya maloba oyo ezali na email, na esika ya kotanga code QR.",
          },
        ],
        ctaText: "Oyebi komikangisa na Kongo?",
        ctaButtonText: "Tala ba forfait →",
      },
    },
  },
  {
    slug: "esim-vs-carte-sim-physique-rdc",
    updatedAt: "2026-08-06",
    ctaHref: "/plans",
    translations: {
      fr: {
        title: "eSIM vs carte SIM physique en RDC : quelle est la meilleure option ?",
        metaDescription:
          "eSIM ou carte SIM physique pour se connecter en RDC ? Comparatif détaillé : rapidité d'activation, couverture réseau, prix, et cas d'usage pour voyageurs et diaspora.",
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
        ctaText: "Prêt à vous connecter en RDC ?",
        ctaButtonText: "Voir les forfaits →",
      },
      en: {
        title: "eSIM vs. Physical SIM in DR Congo: Which Is Right for You?",
        metaDescription:
          "eSIM or physical SIM card to get online in DR Congo? A detailed comparison: activation speed, network coverage, price, and use cases for travelers and the diaspora.",
        intro:
          "Getting online in DR Congo is possible with a physical SIM card bought in a shop, or an eSIM activated remotely. Here's the real difference between the two.",
        sections: [
          {
            heading: "Activation speed",
            paragraphs: [
              "A physical SIM card means visiting a Vodacom or Orange shop, showing ID for registration (mandatory in DRC), and sometimes queueing. That can take anywhere from 30 minutes to several hours depending on how busy the shop is.",
              "An eSIM is bought and installed online, no trip required: the QR code arrives by email within seconds of payment, and installation itself takes two to three minutes.",
            ],
          },
          {
            heading: "Who an eSIM makes the most sense for",
            paragraphs: [
              "Congolese diaspora visiting DRC occasionally who don't want to deal with a physical SIM card every trip.",
              "International travelers who want a connection the moment they land, without hunting for a shop.",
              "Anyone who'd rather pay with Bitcoin Lightning or mobile money than cash on the ground.",
            ],
          },
          {
            heading: "When a physical SIM still makes sense",
            paragraphs: [
              "If you need a local phone number for calls or texts long-term, a standard physical SIM remains the default option — the eSIM plans here are focused on mobile data.",
              "If your phone doesn't support eSIM (older models, or certain regional versions), a physical card is your only option.",
            ],
          },
          {
            heading: "Network coverage: identical either way",
            paragraphs: [
              "A Vodacom or Orange eSIM runs on exactly the same physical network as a standard SIM card from the same carrier — coverage (Kinshasa, Lubumbashi, and the main routes) is identical. Choosing eSIM over physical changes nothing about signal quality.",
            ],
          },
        ],
        faq: [
          {
            question: "Is an eSIM more expensive than a physical SIM in DRC?",
            answer:
              "Price depends on the data plan you choose, not the format (eSIM or physical) — both options run on the same network infrastructure and are generally in the same price range for an equivalent amount of data.",
          },
          {
            question: "Can I receive calls with a data eSIM?",
            answer:
              "The eSIM plans here are focused on mobile data (internet). For a local number with calls/texts, a standard physical SIM is still needed alongside it.",
          },
        ],
        ctaText: "Ready to get connected in DR Congo?",
        ctaButtonText: "View plans →",
      },
      ln: {
        title: "eSIM to carte SIM ya physique na Kongo: nini ekoki mpo na yo?",
        metaDescription:
          "eSIM to carte SIM ya physique mpo na kokangama na Internet na Kongo? Comparaison ya bozindo: vitesse ya activation, couverture ya réseau, ntalo, mpe ba cas ya basalelaka mpo na ba voyageurs mpe diaspora.",
        intro:
          "Kokangama na Internet na Kongo ekoki kosalema na carte SIM ya physique oyo osombi na boutique, to na eSIM oyo obandisi na mosika. Tala ndambo ya bokeseni ya solo kati na yango mibale.",
        sections: [
          {
            heading: "Vitesse ya activation",
            paragraphs: [
              "Carte SIM ya physique esengaka ozala na boutique ya Vodacom to Orange, olakisa ID mpo na enregistrement (esengeli na mibeko ya Kongo), mpe tango mosusu otelema na molongo. Yango ekoki kozwa ntango kobanda na miniti 30 tii na ba ngonga mingi engebene na bato ba ezali na boutique.",
              "eSIM esombamaka mpe etiamaka na Internet, mobembo te: code QR eyaka na email na ba seconde nsima ya paiement, mpe kotia yango moko esengaka kaka minute mibale to misato.",
            ],
          },
          {
            heading: "Mpo na banani eSIM ekoki mingi",
            paragraphs: [
              "Mpo na diaspora ya Kongo oyo ekendaka na Kongo mbala na mbala mpe elingi te ko-gérer carte SIM ya physique mbala na mbala.",
              "Mpo na ba voyageurs ya mikili mosusu oyo balingi kozala na connexion kobanda tango bakomi na aéroport, na koluka boutique te.",
              "Mpo na moto nyonso oyo alingi kofuta na Bitcoin Lightning to mobile money na esika ya mbongo na maboko na esika.",
            ],
          },
          {
            heading: "Tango carte SIM ya physique ezali kaka na tina",
            paragraphs: [
              "Soki osengeli na numéro ya téléphone ya kuna mpo na ba appel to SMS na tango molai, carte SIM ya physique ya kawaida etikalaka solution ya kawaida — ba forfait ya eSIM oyo ezali awa etali données mobile.",
              "Soki téléphone na yo ekoki na eSIM te (ba modèle ya kala, to ba version mosusu ya région), carte ya physique nde solution na yo kaka.",
            ],
          },
          {
            heading: "Couverture ya réseau: ekokani na ba lolenge nyonso mibale",
            paragraphs: [
              "eSIM ya Vodacom to Orange esalelaka kaka réseau moko ya physique lokola carte SIM ya kawaida ya opérateur wana — couverture (Kinshasa, Lubumbashi, mpe banzela minene) ekokani. Kopona eSIM to carte ya physique ebongolaka eloko moko te na qualité ya signal.",
            ],
          },
        ],
        faq: [
          {
            question: "eSIM ezali ntalo mingi koleka carte SIM ya physique na Kongo?",
            answer:
              "Ntalo etali forfait ya données oyo oponi, format (eSIM to physique) te — ba lolenge mibale esalelaka kaka infrastructure ya réseau moko mpe ezalaka pene na ntalo moko mpo na données ekokani.",
          },
          {
            question: "Nakoki kozua ba appel na eSIM ya données?",
            answer:
              "Ba forfait ya eSIM oyo ezali awa etali données mobile (Internet). Mpo na numéro ya kuna elongo na ba appel/SMS, carte SIM ya physique ya kawaida esengeli kaka.",
          },
        ],
        ctaText: "Oyebi komikangisa na Kongo?",
        ctaButtonText: "Tala ba forfait →",
      },
    },
  },
  {
    slug: "payer-esim-bitcoin-mobile-money-rdc",
    updatedAt: "2026-08-06",
    ctaHref: "/plans",
    translations: {
      fr: {
        title: "Comment payer votre eSIM en RDC avec Bitcoin Lightning ou Mobile Money",
        metaDescription:
          "Pas de carte bancaire internationale ? Découvrez comment payer une eSIM en RDC directement depuis votre solde M-Pesa ou mobile money, ou avec un portefeuille Bitcoin Lightning.",
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
        ctaText: "Prêt à vous connecter en RDC ?",
        ctaButtonText: "Voir les forfaits →",
      },
      en: {
        title: "How to Pay for Your eSIM in DR Congo with Bitcoin Lightning or Mobile Money",
        metaDescription:
          "No international bank card? Here's how to pay for an eSIM in DR Congo straight from your M-Pesa or mobile money balance, or with a Bitcoin Lightning wallet.",
        intro:
          "Many eSIM sites require an international bank card (Visa, Mastercard) — a real barrier for a large part of the Congolese market. There's an alternative: paying directly from a mobile money balance or a Bitcoin Lightning wallet, no bank card needed.",
        sections: [
          {
            heading: "Why card payment is a problem in DRC",
            paragraphs: [
              "Access to an international bank card is still limited in DRC — many people use mobile money (M-Pesa, Airtel Money, Orange Money) as their main payment method, without a traditional bank account tied to a Visa or Mastercard.",
              "That effectively locks out a large share of potential buyers from standard eSIM sites, which often only accept bank cards.",
            ],
          },
          {
            heading: "The solution: a Bitcoin Lightning invoice payable via mobile money",
            paragraphs: [
              "Payment works through a Bitcoin Lightning invoice (a near-instant, very low-fee type of Bitcoin payment), generated automatically at checkout.",
              "That invoice can be paid two ways: directly from a Bitcoin Lightning wallet if you have one, or — for most buyers — via Machankura, a service that bridges your M-Pesa or mobile money balance to the Lightning network over USSD, no app install needed.",
            ],
          },
          {
            heading: "Paying with Machankura, step by step",
            paragraphs: [
              "At checkout, a QR code and a Lightning invoice appear on the payment page.",
              "Dial the Machankura USSD code from your phone (shown on the payment page), follow the prompts to paste or enter the Lightning invoice shown, then confirm payment from your usual mobile money balance.",
              "As soon as payment is confirmed on the Lightning network — usually within seconds — the order automatically flips to \"paid\" and the eSIM is emailed to you.",
            ],
          },
          {
            heading: "Is it secure?",
            paragraphs: [
              "Lightning payment is confirmed cryptographically on the Bitcoin network — once an invoice is paid, confirmation is immediate and verifiable, with no intermediary able to fake it. Machankura only converts your mobile money balance into a Lightning payment; it doesn't hold your funds beyond that one-off conversion.",
            ],
          },
        ],
        faq: [
          {
            question: "Do I need a bank account to pay?",
            answer:
              "No. Paying via Machankura works directly from a mobile money balance (M-Pesa, Airtel Money, Orange Money) over USSD, with no bank account or card involved.",
          },
          {
            question: "Do I need to understand Bitcoin to use this payment method?",
            answer:
              "No — Machankura handles the conversion behind the scenes. From the buyer's side, it feels like a standard mobile money USSD payment.",
          },
          {
            question: "What if my mobile money payment fails?",
            answer:
              "The Lightning invoice stays valid for a limited time shown on the payment page. If it fails, just retry the Machankura process; if the invoice expires, simply start a new order to generate a fresh one.",
          },
        ],
        ctaText: "Ready to get connected in DR Congo?",
        ctaButtonText: "View plans →",
      },
      ln: {
        title: "Ndenge ya kofuta eSIM na yo na Kongo na Bitcoin Lightning to Mobile Money",
        metaDescription:
          "Ozali na carte bancaire ya mikili mosusu te? Yeba ndenge ya kofuta eSIM na Kongo mbala moko na mbongo ya M-Pesa to mobile money na yo, to na portefeuille Bitcoin Lightning.",
        intro:
          "Ba site mingi ya kotekisa eSIM esengaka carte bancaire ya mikili mosusu (Visa, Mastercard) — likambo ya solo mpo na ndambo monene ya marché ya Kongo. Ezali na esika mosusu: kofuta mbala moko na mbongo ya mobile money to na portefeuille Bitcoin Lightning, carte bancaire te.",
        sections: [
          {
            heading: "Mpo na nini paiement na carte bancaire ezali problème na Kongo",
            paragraphs: [
              "Kozua carte bancaire ya mikili mosusu ezali kaka pasi na Kongo — bato mingi basalelaka mobile money (M-Pesa, Airtel Money, Orange Money) lokola moyen ya kofuta ya liboso, na compte bancaire ya kawaida oyo elandani na Visa to Mastercard te.",
              "Yango ekangaka nzela na ndambo monene ya bato oyo bakoki kosomba na ba site ya eSIM ya kawaida, oyo mbala mingi endimaka kaka carte bancaire.",
            ],
          },
          {
            heading: "Solution: facture Bitcoin Lightning oyo ekoki kofutama na mobile money",
            paragraphs: [
              "Paiement esalemaka na nzela ya facture Bitcoin Lightning (lolenge ya paiement Bitcoin ya noki mpe na frais ya moke mingi), oyo ebimisamaka mbala moko na moment ya kosomba.",
              "Facture yango ekoki kofutama na ba lolenge mibale: mbala moko na portefeuille Bitcoin Lightning soki ozali na moko, to — mpo na mingi ya basombi — na nzela ya Machankura, service oyo esalaka pont kati ya mbongo na yo ya M-Pesa to mobile money mpe réseau Lightning, na USSD, application ya kotia te.",
            ],
          },
          {
            heading: "Kofuta na Machankura, etape na etape",
            paragraphs: [
              "Na moment ya paiement, code QR mpe facture Lightning emonanaka na page ya paiement.",
              "Beta code USSD ya Machankura na téléphone na yo (elakisami na page ya paiement), landa ba instructions mpo na kotia to kokotisa facture Lightning oyo emonani, na nsima kondima paiement na mbongo na yo ya mobile money ya momesano.",
              "Tango kaka paiement endimami na réseau Lightning — mingi mingi na ba seconde — commande ekokoma automatiquement na statut «efutami» mpe eSIM etindami na email.",
            ],
          },
          {
            heading: "Ezali na sécurité?",
            paragraphs: [
              "Paiement ya Lightning endimamaka na ndenge ya cryptographique na réseau Bitcoin — tango facture esili kofutama, kondimama ezali mbala moko mpe ekoki kotalama, moto moko te akoki kobongola yango na lokuta. Machankura ebongolaka kaka mbongo na yo ya mobile money na paiement Lightning; ebombaka mbongo na yo te koleka moment yango ya kobongola.",
            ],
          },
        ],
        faq: [
          {
            question: "Nasengeli na compte bancaire mpo na kofuta?",
            answer:
              "Te. Kofuta na nzela ya Machankura esalemaka mbala moko na mbongo ya mobile money (M-Pesa, Airtel Money, Orange Money) na USSD, compte bancaire to carte te.",
          },
          {
            question: "Nasengeli koyeba Bitcoin mpo na kosalela lolenge oyo ya paiement?",
            answer:
              "Te — Machankura ebongolaka na nsima. Mpo na mosombi, emonanaka lokola paiement ya mobile money ya kawaida na USSD.",
          },
          {
            question: "Soki paiement na ngai ya mobile money elongi te, nasala nini?",
            answer:
              "Facture Lightning etikalaka valable mpo na ntango moke oyo elakisami na page ya paiement. Soki elongi te, meka lisusu processus ya Machankura; soki facture esili, banda kaka commande ya sika mpo na kozua moko ya sika.",
          },
        ],
        ctaText: "Oyebi komikangisa na Kongo?",
        ctaButtonText: "Tala ba forfait →",
      },
    },
  },
  {
    slug: "comment-recharger-donnees-rdc",
    updatedAt: "2026-08-08",
    ctaHref: "/topups",
    translations: {
      fr: {
        title: "Comment recharger des données mobiles en RDC sans acheter d'eSIM",
        metaDescription:
          "Ajoutez des données à un numéro que vous avez déjà en RDC — sans nouvelle carte SIM, sans eSIM, sans installation. Comparez les recharges Vodacom et Airtel et payez en Bitcoin Lightning ou mobile money.",
        intro:
          "Si vous avez déjà une carte SIM active sur Vodacom ou Airtel en RDC, vous n'avez pas besoin d'une nouvelle eSIM pour obtenir plus de données — une recharge de données ajoute des données directement au numéro que vous utilisez déjà, sans rien à installer. Voici comment ça marche.",
        sections: [
          {
            heading: "Recharge ou eSIM : quelle différence ?",
            paragraphs: [
              "Une eSIM est une toute nouvelle ligne mobile — utile si vous arrivez en RDC sans carte SIM locale, ou si vous voulez une ligne données dédiée sur un téléphone compatible.",
              "Une recharge de données fait quelque chose de plus simple : elle ajoute des données directement à un numéro qui a déjà une carte SIM active en RDC — le vôtre, ou celui de quelqu'un d'autre, comme un proche que vous soutenez depuis l'étranger. Pas de nouvelle carte SIM, pas d'installation d'eSIM, rien à scanner.",
            ],
          },
          {
            heading: "Quels réseaux sont disponibles",
            paragraphs: [
              "Les recharges couvrent actuellement les numéros Vodacom et Airtel en RDC. Orange n'a pas encore d'option de recharge de données disponible chez nos fournisseurs — c'est affiché comme « bientôt disponible » plutôt que retiré, car cela peut changer.",
              "Chaque recharge affiche son prix par Go, pour comparer facilement la valeur entre les différentes tailles et durées de validité avant de choisir.",
            ],
          },
          {
            heading: "Étape 1 : choisissez une recharge et entrez le numéro",
            paragraphs: [
              "Parcourez les recharges disponibles, choisissez celle qui correspond au volume de données et à la durée de validité dont vous avez besoin, puis entrez le numéro de téléphone qui doit recevoir les données — au format international (ex. +243 8xx xxx xxx). Vous pouvez recharger votre propre numéro ou celui d'une autre personne.",
            ],
          },
          {
            heading: "Étape 2 : payez",
            paragraphs: [
              "Payez de la même manière que partout ailleurs sur MboteData : scannez le code QR Lightning avec un portefeuille Bitcoin, ou payez directement depuis votre solde mobile money via Machankura là où c'est disponible — sans carte bancaire internationale.",
            ],
          },
          {
            heading: "Étape 3 : les données arrivent automatiquement",
            paragraphs: [
              "Dès que le paiement est confirmé, les données sont ajoutées directement au numéro que vous avez saisi — généralement en quelques minutes. Il n'y a aucun code QR à scanner ni rien à installer ; le destinataire peut simplement commencer à utiliser ses données.",
            ],
          },
        ],
        faq: [
          {
            question: "Dois-je être moi-même en RDC pour envoyer une recharge ?",
            answer:
              "Non — vous pouvez recharger un numéro de RDC depuis n'importe où, c'est pourquoi c'est un moyen courant d'envoyer des données à la famille ou à des amis en RDC sans qu'ils aient besoin d'une carte bancaire ou d'un portefeuille Bitcoin eux-mêmes.",
          },
          {
            question: "Quelle est la différence avec offrir une eSIM à quelqu'un ?",
            answer:
              "Une eSIM n'aide que si le téléphone du destinataire est compatible eSIM et qu'il accepte d'en installer une. Une recharge fonctionne sur n'importe quel téléphone ayant déjà une carte SIM active sur un réseau disponible — aucune installation n'est nécessaire de son côté.",
          },
          {
            question: "Et si le numéro que je veux recharger est chez Orange ?",
            answer:
              "Orange n'est pas encore disponible — c'est indiqué « bientôt disponible » sur la page des recharges plutôt que masqué, car cela dépend de l'ajout du support par nos fournisseurs, pas de nous directement.",
          },
          {
            question: "À quelle vitesse les données arrivent-elles ?",
            answer:
              "Généralement en quelques minutes après la confirmation du paiement — il n'y a pas d'étape d'installation à attendre, contrairement à une eSIM.",
          },
        ],
        ctaText: "Prêt à recharger un numéro en RDC ?",
        ctaButtonText: "Voir les recharges →",
      },
      en: {
        title: "How to Top Up Mobile Data in DR Congo (No eSIM Needed)",
        metaDescription:
          "Add data to a phone number you already have in DR Congo — no new SIM, no eSIM, no installation. Compare Vodacom and Airtel top-ups and pay with Bitcoin Lightning or mobile money.",
        intro:
          "If you already have an active SIM card on Vodacom or Airtel in DR Congo, you don't need a new eSIM to get more data — a data top-up adds data directly to the number you already use, with nothing to install. Here's how it works.",
        sections: [
          {
            heading: "Top-up vs. eSIM: what's the difference?",
            paragraphs: [
              "An eSIM is a whole new mobile line — useful if you're arriving in DR Congo without a local SIM at all, or want a dedicated data-only line on a phone that supports it.",
              "A data top-up does something simpler: it adds data straight to a phone number that already has an active SIM in DR Congo — yours, or someone else's, like a family member you're supporting from abroad. No new SIM card, no eSIM installation, nothing to scan.",
            ],
          },
          {
            heading: "Which networks are supported",
            paragraphs: [
              "Top-ups currently cover Vodacom and Airtel numbers in DR Congo. Orange doesn't have a data top-up option available yet from either of our providers — it's shown as \"coming soon\" rather than removed, since that could change.",
              "Each top-up listing shows its price per GB, so you can compare value across sizes and validity periods at a glance before choosing.",
            ],
          },
          {
            heading: "Step 1: pick a top-up and enter the phone number",
            paragraphs: [
              "Browse the available top-ups, choose one that fits the data amount and validity period you need, and enter the phone number that should receive the data — in international format (e.g. +243 8xx xxx xxx). You can top up your own number or someone else's.",
            ],
          },
          {
            heading: "Step 2: pay",
            paragraphs: [
              "Pay the same way as everywhere else on MboteData: scan the Lightning QR code with a Bitcoin wallet, or pay straight from your mobile money balance via Machankura where available — no international bank card needed.",
            ],
          },
          {
            heading: "Step 3: data lands automatically",
            paragraphs: [
              "As soon as payment is confirmed, the data is added directly to the number you entered — usually within minutes. There's no QR code to scan and nothing to install; the recipient can just start using their data.",
            ],
          },
        ],
        faq: [
          {
            question: "Do I need to be in DR Congo myself to send a top-up?",
            answer:
              "No — you can top up a DR Congo number from anywhere, which is why this is a common way to send data to family or friends in DR Congo without them needing a bank card or a Bitcoin wallet themselves.",
          },
          {
            question: "How is this different from buying someone an eSIM?",
            answer:
              "An eSIM only helps if the recipient's phone supports eSIM and they're willing to install one. A top-up works on any phone with an existing SIM on a supported network — no installation required on their end.",
          },
          {
            question: "What if the number I want to top up is on Orange?",
            answer:
              "Orange isn't available yet — it's marked \"coming soon\" on the top-ups page rather than hidden, since it depends on our providers adding support, not something we control directly.",
          },
          {
            question: "How fast does the data arrive?",
            answer:
              "Typically within minutes of payment being confirmed — there's no installation step to wait on, unlike an eSIM.",
          },
        ],
        ctaText: "Ready to top up a number in DR Congo?",
        ctaButtonText: "View top-ups →",
      },
      ln: {
        title: "Ndenge ya kotondisa données ya mobile na Kongo (eSIM esengeli te)",
        metaDescription:
          "Bakisa données na numéro oyo ozali na yango déjà na Kongo — SIM ya sika te, eSIM te, kotia eloko te. Kokanisa ba recharge ya Vodacom na Airtel mpe futa na Bitcoin Lightning to mobile money.",
        intro:
          "Soki ozali déjà na SIM oyo ezali active na Vodacom to Airtel na Kongo, osengeli na eSIM ya sika te mpo na kozua données ebele — recharge ya données ebakisaka données mbala moko na numéro oyo osalelaka déjà, eloko ya kotia ezali te. Tala ndenge esalaka.",
        sections: [
          {
            heading: "Recharge to eSIM: bokeseni nini?",
            paragraphs: [
              "eSIM ezali ligne ya mobile ya sika mobimba — esungaka soki oyei na Kongo na SIM ya mboka te, to olingi ligne ya données kaka na téléphone oyo ekoki na yango.",
              "Recharge ya données esalaka eloko ya pete koleka: ebakisaka données mbala moko na numéro oyo ezali déjà na SIM active na Kongo — ya yo moko, to ya moto mosusu, lokola libota oyo ozali kosunga uta na mboka mosusu. SIM ya sika te, kotia eSIM te, eloko ya ko-scanner te.",
            ],
          },
          {
            heading: "Ba réseau nini ezali disponible",
            paragraphs: [
              "Ba recharge ezali sik'oyo mpo na ba numéro ya Vodacom na Airtel na Kongo. Orange ezali nanu na option ya recharge ya données te epai ya ba fournisseur na biso — emonisami lokola «ekoya kala te» na esika ya kolongolama, mpo yango ekoki kobongwana.",
              "Recharge moko na moko elakisaka ntalo na yango na Go, mpo okoka kokanisa valeur na kati ya ba taille na ba durée ya validité liboso ya kopona.",
            ],
          },
          {
            heading: "Etape 1: pona recharge mpe kotisa numéro",
            paragraphs: [
              "Tala ba recharge oyo ezali, pona oyo ekokani na données mpe durée ya validité oyo osengeli na yango, na nsima kotisa numéro ya téléphone oyo esengeli kozua données — na format internationale (ex. +243 8xx xxx xxx). Okoki kotondisa numéro na yo moko to ya moto mosusu.",
            ],
          },
          {
            heading: "Etape 2: futa",
            paragraphs: [
              "Futa ndenge moko na bisika mosusu nyonso na MboteData: tanga code QR ya Lightning na portefeuille Bitcoin, to futa mbala moko na mbongo ya mobile money na yo na nzela ya Machankura esika ezali disponible — carte bancaire ya mboka mosusu esengeli te.",
            ],
          },
          {
            heading: "Etape 3: données ekoya mbala moko",
            paragraphs: [
              "Tango kaka paiement endimami, données ebakisami mbala moko na numéro oyo otisaki — mingi mingi na ba minute. Code QR ya ko-scanner ezali te mpe eloko ya kotia ezali te; moto akozwa akoki kaka kobanda kosalela données na ye.",
            ],
          },
        ],
        faq: [
          {
            question: "Nasengeli kozala ngai moko na Kongo mpo na kotinda recharge?",
            answer:
              "Te — okoki kotondisa numéro ya Kongo uta esika nyonso, yango wana ezali lolenge ya boyokani mpo na kotindela libota to baninga na Kongo données, na kozanga ete bango bazala na carte bancaire to portefeuille Bitcoin bango moko.",
          },
          {
            question: "Bokeseni nini na kopesa moto eSIM?",
            answer:
              "eSIM esungaka kaka soki téléphone ya moto oyo akozwa yango ekoki na eSIM mpe andimi kotia yango. Recharge esalaka na téléphone nyonso oyo ezali déjà na SIM active na réseau oyo ezali disponible — kotia eloko esengeli te na ngambo na ye.",
          },
          {
            question: "Soki numéro oyo nalingi kotondisa ezali na Orange?",
            answer:
              "Orange ezali nanu disponible te — emonisami «ekoya kala te» na page ya ba recharge na esika ya kobombama, mpo yango etali ko-bakisama ya support na ba fournisseur na biso, likambo oyo biso moko tokambaka te mbala moko.",
          },
          {
            question: "Données ekoya noki boni?",
            answer:
              "Mbala mingi na ba minute nsima ya kondimama ya paiement — etape ya kotia eloko ezali te ya kozela, na bokeseni na eSIM.",
          },
        ],
        ctaText: "Oyebi kotondisa numéro na Kongo?",
        ctaButtonText: "Tala ba recharge →",
      },
    },
  },
  {
    slug: "recharge-vs-esim-rdc",
    updatedAt: "2026-08-08",
    ctaHref: "/topups",
    translations: {
      fr: {
        title: "Recharge de données vs eSIM en RDC : que choisir ?",
        metaDescription:
          "Recharge de données ou eSIM pour se connecter en RDC ? Comparatif pratique : pour qui chaque option est faite, réseaux couverts, rapidité, et comment choisir.",
        intro:
          "MboteData vend deux choses différentes : une toute nouvelle ligne de données eSIM, et une recharge de données pour un numéro que vous avez déjà. Elles répondent à des besoins différents — voici comment savoir laquelle vous convient.",
        sections: [
          {
            heading: "La différence de fond",
            paragraphs: [
              "Une eSIM vous donne une toute nouvelle ligne mobile, installée sur votre téléphone comme une SIM numérique — c'est pour quand vous n'avez pas encore de connexion en RDC, ou voulez une ligne données dédiée.",
              "Une recharge de données ajoute des données à un numéro déjà actif sur un réseau RDC pris en charge — le vôtre ou celui de quelqu'un d'autre. Rien à installer ; elle recharge simplement une ligne existante.",
            ],
          },
          {
            heading: "Choisissez une recharge si...",
            paragraphs: [
              "Vous (ou quelqu'un que vous soutenez) avez déjà une carte SIM Vodacom ou Airtel active en RDC et avez juste besoin de plus de données.",
              "Vous voulez envoyer des données à de la famille ou des amis en RDC depuis l'étranger, sans qu'ils aient besoin d'un portefeuille Bitcoin, d'une carte bancaire, ou d'aucune configuration technique de leur côté.",
              "Vous voulez que les données arrivent le plus vite possible — généralement en quelques minutes, puisqu'il n'y a pas d'étape d'installation.",
            ],
          },
          {
            heading: "Choisissez une eSIM si...",
            paragraphs: [
              "Vous voyagez en RDC et n'avez encore aucune carte SIM locale.",
              "Votre téléphone est compatible eSIM et vous voulez une ligne de données dédiée que vous contrôlez entièrement, séparée d'une carte SIM physique.",
              "Vous devez créer un nouveau numéro plutôt qu'ajouter des données à un numéro existant.",
            ],
          },
          {
            heading: "La couverture réseau diffère entre les deux",
            paragraphs: [
              "Les forfaits eSIM ici fonctionnent sur Vodacom ou Orange. Les recharges de données couvrent actuellement Vodacom et Airtel — les recharges Orange ne sont pas encore disponibles chez nos fournisseurs de recharge, affichées comme « bientôt disponible » plutôt que masquées. Vérifiez la couverture de votre réseau spécifique avant de choisir.",
            ],
          },
          {
            heading: "Le paiement est identique dans les deux cas",
            paragraphs: [
              "Les forfaits eSIM et les recharges de données se paient de la même manière sur MboteData : scannez un code QR Lightning avec un portefeuille Bitcoin, ou payez depuis votre solde mobile money via Machankura — sans carte bancaire internationale dans les deux cas.",
            ],
          },
        ],
        faq: [
          {
            question: "Puis-je acheter une recharge si je ne sais pas si la SIM du destinataire est active ?",
            answer:
              "La recharge est livrée au numéro que vous saisissez, mais elle n'a d'effet que si ce numéro a déjà une carte SIM active sur un réseau pris en charge — vérifiez d'abord avec le destinataire en cas de doute.",
          },
          {
            question: "Une recharge est-elle moins chère qu'une eSIM ?",
            answer:
              "Elles ne sont pas vraiment comparables sur le seul prix — une eSIM inclut une toute nouvelle ligne, tandis qu'une recharge ajoute seulement des données à une ligne déjà existante. Comparez le prix par Go affiché sur chaque offre pour une comparaison plus juste de la valeur des données spécifiquement.",
          },
          {
            question: "Puis-je passer d'une recharge à une eSIM plus tard ?",
            answer:
              "Oui — ce sont des achats indépendants. Acheter une recharge n'affecte en rien votre capacité à acheter aussi une eSIM plus tard, et inversement.",
          },
        ],
        ctaText: "Prêt à recharger un numéro en RDC ?",
        ctaButtonText: "Voir les recharges →",
      },
      en: {
        title: "Data Top-up vs. eSIM in DR Congo: Which Should You Choose?",
        metaDescription:
          "Data top-up or eSIM to get connected in DR Congo? A practical comparison: who each option is for, what networks are covered, speed, and how to choose.",
        intro:
          "MboteData sells two different things: a brand-new eSIM data line, and a data top-up for a phone number you already have. They solve different problems — here's how to tell which one you actually need.",
        sections: [
          {
            heading: "The core difference",
            paragraphs: [
              "An eSIM gives you a whole new mobile line, installed on your phone as a digital SIM — it's for when you don't already have connectivity in DR Congo, or want a dedicated data-only line.",
              "A data top-up adds data to a phone number that's already active on a supported DR Congo network — yours or someone else's. Nothing to install; it just tops up an existing line.",
            ],
          },
          {
            heading: "Choose a top-up if...",
            paragraphs: [
              "You (or someone you're supporting) already has an active Vodacom or Airtel SIM in DR Congo and just needs more data.",
              "You want to send data to family or friends in DR Congo from abroad, without them needing a Bitcoin wallet, a bank card, or any technical setup on their end.",
              "You want the data to land as fast as possible — usually within minutes, since there's no install step.",
            ],
          },
          {
            heading: "Choose an eSIM if...",
            paragraphs: [
              "You're traveling to DR Congo and don't have a local SIM at all yet.",
              "Your phone supports eSIM and you want a dedicated data line you fully control, separate from a physical SIM.",
              "You need to set up a new number rather than add data to an existing one.",
            ],
          },
          {
            heading: "Network coverage differs between the two",
            paragraphs: [
              "eSIM plans here run on Vodacom or Orange. Data top-ups currently cover Vodacom and Airtel — Orange top-ups aren't available yet from either top-up provider, shown as \"coming soon\" rather than hidden. Check the coverage for your specific network before choosing.",
            ],
          },
          {
            heading: "Payment is identical either way",
            paragraphs: [
              "Both eSIM plans and data top-ups are paid the same way on MboteData: scan a Lightning QR code with a Bitcoin wallet, or pay from your mobile money balance via Machankura — no international bank card needed for either.",
            ],
          },
        ],
        faq: [
          {
            question: "Can I buy a top-up if I don't know whether the recipient's SIM is active?",
            answer:
              "The top-up is delivered to whatever number you enter, but it only has an effect if that number already has an active SIM on a supported network — check with the recipient first if you're not sure.",
          },
          {
            question: "Is a top-up cheaper than an eSIM?",
            answer:
              "They're not really comparable on price alone — an eSIM includes a brand-new line, while a top-up only adds data to a line that already exists. Compare the $/GB shown on each listing for the fairest comparison of data value specifically.",
          },
          {
            question: "Can I switch from a top-up to an eSIM later?",
            answer:
              "Yes — they're independent purchases. Nothing about buying a top-up affects your ability to also buy an eSIM later, or vice versa.",
          },
        ],
        ctaText: "Ready to top up a number in DR Congo?",
        ctaButtonText: "View top-ups →",
      },
      ln: {
        title: "Recharge ya données to eSIM na Kongo: nini opona?",
        metaDescription:
          "Recharge ya données to eSIM mpo na kokangama na Kongo? Comparaison ya practique: mpo na banani lolenge na lolenge ekoki, ba réseau oyo ezali couvert, vitesse, mpe ndenge ya kopona.",
        intro:
          "MboteData etekisaka biloko mibale ekeseni: ligne ya données ya eSIM ya sika mobimba, mpe recharge ya données mpo na numéro oyo ozali na yango déjà. Ezali mpo na ba besoin ekeseni — tala ndenge ya koyeba oyo ekoki na yo.",
        sections: [
          {
            heading: "Bokeseni ya solo",
            paragraphs: [
              "eSIM epesaka yo ligne ya mobile ya sika mobimba, oyo etiami na téléphone na yo lokola SIM ya numérique — ezali mpo na tango ozali nanu na connexion te na Kongo, to olingi ligne ya données kaka.",
              "Recharge ya données ebakisaka données na numéro oyo ezali déjà active na réseau ya Kongo oyo ezali couvert — ya yo moko to ya moto mosusu. Eloko ya kotia ezali te; erecharge kaka ligne oyo ezali déjà.",
            ],
          },
          {
            heading: "Pona recharge soki...",
            paragraphs: [
              "Yo (to moto oyo ozali kosunga) ozali déjà na SIM ya Vodacom to Airtel active na Kongo mpe osengeli kaka na données ebele.",
              "Olingi kotindela libota to baninga na Kongo données uta na mboka mosusu, na kozanga ete bango bazala na portefeuille Bitcoin, carte bancaire, to configuration technique nini na ngambo na bango.",
              "Olingi ete données ekoma noki koleka — mingi mingi na ba minute, mpo etape ya kotia eloko ezali te.",
            ],
          },
          {
            heading: "Pona eSIM soki...",
            paragraphs: [
              "Ozali kokende na Kongo mpe ozali nanu na SIM ya kuna moko te.",
              "Téléphone na yo ekoki na eSIM mpe olingi ligne ya données oyo yo moko okambaka, ekeseni na SIM ya physique.",
              "Osengeli kosala numéro ya sika na esika ya kobakisa données na numéro oyo esili kozala.",
            ],
          },
          {
            heading: "Couverture ya réseau ekeseni kati na yango mibale",
            paragraphs: [
              "Ba forfait ya eSIM awa esalaka na Vodacom to Orange. Ba recharge ya données ezali sik'oyo mpo na Vodacom na Airtel — ba recharge ya Orange ezali nanu disponible te epai ya ba fournisseur ya recharge, emonisami lokola «ekoya kala te» na esika ya kobombama. Tala couverture ya réseau na yo liboso ya kopona.",
            ],
          },
          {
            heading: "Paiement ekokani na ba lolenge nyonso mibale",
            paragraphs: [
              "Ba forfait ya eSIM na ba recharge ya données efutamaka ndenge moko na MboteData: tanga code QR ya Lightning na portefeuille Bitcoin, to futa na mbongo ya mobile money na yo na nzela ya Machankura — carte bancaire ya mboka mosusu te na ba lolenge nyonso mibale.",
            ],
          },
        ],
        faq: [
          {
            question: "Nakoki kosomba recharge soki nayebi te soki SIM ya moto oyo akozwa yango ezali active?",
            answer:
              "Recharge etindamaka na numéro oyo otisaki, kasi ezali na effet kaka soki numéro yango ezali déjà na SIM active na réseau oyo ezali couvert — tuna moto oyo akozwa yango liboso soki ozali na ntembe.",
          },
          {
            question: "Recharge ezali ntalo moke koleka eSIM?",
            answer:
              "Ekokani mpenza te na ntalo kaka — eSIM ezali na ligne ya sika mobimba, na tango recharge ebakisaka kaka données na ligne oyo esili kozala. Kokanisa ntalo na Go oyo elakisami na offre moko na moko mpo na comparaison ya solo ya valeur ya données.",
          },
          {
            question: "Nakoki kobongwana uta na recharge tii na eSIM na nsima?",
            answer:
              "Ee — ezali ba achat ekeseni. Kosomba recharge ebongolaka eloko moko te na likoki na yo ya kosomba mpe eSIM na nsima, mpe lolenge mosusu.",
          },
        ],
        ctaText: "Oyebi kotondisa numéro na Kongo?",
        ctaButtonText: "Tala ba recharge →",
      },
    },
  },
];

export function getGuides(locale: string): (Guide & { translation: GuideTranslation })[] {
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return GUIDES.map((guide) => ({ ...guide, translation: guide.translations[resolved] }));
}

export function getGuide(
  slug: string,
  locale: string
): (Guide & { translation: GuideTranslation }) | undefined {
  const guide = GUIDES.find((g) => g.slug === slug);
  if (!guide) return undefined;
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  return { ...guide, translation: guide.translations[resolved] };
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
