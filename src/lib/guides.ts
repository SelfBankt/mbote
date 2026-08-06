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
};

export type Guide = {
  slug: string;
  updatedAt: string; // ISO date, shown on-page and in Article JSON-LD
  translations: Record<string, GuideTranslation>; // keyed by locale — fr/ln/en
};

const GUIDES: Guide[] = [
  {
    slug: "comment-installer-esim-rdc",
    updatedAt: "2026-08-06",
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
      },
    },
  },
  {
    slug: "esim-vs-carte-sim-physique-rdc",
    updatedAt: "2026-08-06",
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
      },
    },
  },
  {
    slug: "payer-esim-bitcoin-mobile-money-rdc",
    updatedAt: "2026-08-06",
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
