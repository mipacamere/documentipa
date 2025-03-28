import React, { useState, useEffect, FC } from "react";
import {
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Bike,
  Waves,
  Sailboat,
} from "lucide-react";

// Type Declarations
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}

const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered successfully:", registration);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }
};

// Language type
type Language = "en" | "it" | "fr" | "es" | "de" | "zh" | "ru";

// Breakfast Item Type
type BreakfastItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

const AccommodationApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [documentsSentViaWhatsApp, setDocumentsSentViaWhatsApp] =
    useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  // Language and Breakfast State
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState("info");

  // Translations
  const translations = {
    en: {
      tabs: {
        info: "For You",
        breakfast: "Breakfast",
        map: "City Map",
        checkout: "Check Out",
      },
      info: {
        generalInfo: "General Info",
        contactUs: "Contact Us",
        additionalServices: "Additional Services",
        checkin: "Check-in: 3:00 PM - 10:00 PM",
        checkout: "Check-out: By 10:30 AM",
        address: "Via San Giovanni 42, Milazzo (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "Contact via WhatsApp",
        services: {
          bikeRental: {
            title: "Bike Rental",
            description: "From €10 per day - Ask us for more information",
          },
          scubaDiving: {
            title: "Scuba Diving",
            description:
              "From €60 per person, book 24h in advance - Ask us for more information",
          },
          miniCruise: {
            title: "Minicruises Tour (2/3 Islands) at the Aeolian Islands",
            description: "From €40 per person - Book with: Navisal or Tarnav",
          },
          privateTour: {
            title: "Private Tour at the Aeolian Islands",
            description: "From €100 per person - Ask us for more information",
          },
        },
      },
      map: {
        title: "City Map",
        openInMaps: "Open in Google Maps",
      },
      checkout: {
        title: "Check-Out Instructions",
        instructions: [
          "Leave all room keys inside the room.",
          "Gather all of your personal belongings, including chargers and electronics.",
          "Double-check the room for any items you may have left behind.",
          "Settle any outstanding payments, including the city tax.",
        ],
        description1:
          "Thank you for choosing to stay with us! We hope you had a wonderful experience. Before you check out, please take a moment to:",
        description2:
          "If you happen to forget any items, don't worry—we offer a mail-back service (additional charges apply) to return any lost belongings.",
        description3:
          "Once you're ready to check out, simply click the button below to notify us. If you need any assistance before you leave, please don't hesitate to reach out. We're here to help!",
        buttonText: "Complete Check Out",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "Plain Croissant",
            description: "Classic empty croissant",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "Chocolate Croissant",
            description: "Croissant filled with chocolate",
            price: 1.5,
          },
        ],
      },
    },

    it: {
      tabs: {
        info: "Per Te",
        breakfast: "Colazione",
        map: "Mappa della Città",
        checkout: "Check-Out",
      },
      info: {
        generalInfo: "Informazioni Generali",
        contactUs: "Contattaci",
        additionalServices: "Servizi Aggiuntivi",
        checkin: "Check-in: 15:00 - 22:00",
        checkout: "Check-out: Entro le 10:30",
        address: "Via San Giovanni 42, Milazzo (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "Contatta su WhatsApp",
        services: {
          bikeRental: {
            title: "Noleggio Biciclette",
            description: "Da €10 al giorno - Chiedici ulteriori informazioni",
          },
          scubaDiving: {
            title: "Immersioni Subacquee",
            description:
              "Da €60 a persona, prenota 24h in anticipo - Chiedici ulteriori informazioni",
          },
          miniCruise: {
            title: "Tour Minicrociere (2/3 Isole) alle Isole Eolie",
            description: "Da €40 a persona - Prenota con: Navisal o Tarnav",
          },
          privateTour: {
            title: "Tour Privato alle Isole Eolie",
            description: "Da €100 a persona - Chiedici ulteriori informazioni",
          },
        },
      },
      map: {
        title: "Mappa della Città",
        openInMaps: "Apri su Google Maps",
      },
      checkout: {
        title: "Istruzioni per il Check-Out",
        instructions: [
          "Lascia tutte le chiavi della stanza all'interno della stanza.",
          "Raccogli tutti i tuoi oggetti personali, compresi caricabatterie ed elettroniche.",
          "Controlla accuratamente la stanza per eventuali oggetti dimenticati.",
          "Regola tutti i pagamenti in sospeso, inclusa la tassa di soggiorno.",
        ],
        description1:
          "Grazie per aver scelto di soggiornare con noi! Speriamo che la tua esperienza sia stata meravigliosa. Prima di effettuare il check-out, ti preghiamo di:",
        description2:
          "Se dimentichi alcuni oggetti, non preoccuparti: offriamo un servizio di rispedizione (con costi aggiuntivi) per restituire gli oggetti smarriti.",
        description3:
          "Una volta pronto per il check-out, clicca semplicemente il pulsante qui sotto per avvisarci. Se hai bisogno di assistenza prima di partire, non esitare a contattarci. Siamo qui per aiutarti!",
        buttonText: "Completa Check-Out",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "Cornetto Classico",
            description: "Cornetto vuoto tradizionale",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "Cornetto al Cioccolato",
            description: "Cornetto ripieno di cioccolato",
            price: 1.5,
          },
        ],
      },
    },

    fr: {
      tabs: {
        info: "Pour Vous",
        breakfast: "Petit-déjeuner",
        map: "Plan de la Ville",
        checkout: "Check-Out",
      },
      info: {
        generalInfo: "Informations Générales",
        contactUs: "Contactez-nous",
        additionalServices: "Services Supplémentaires",
        checkin: "Check-in : 15h00 - 22h00",
        checkout: "Check-out : Avant 10h30",
        address: "Via San Giovanni 42, Milazzo (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "Contactez via WhatsApp",
        services: {
          bikeRental: {
            title: "Location de Vélos",
            description:
              "À partir de 10€ par jour - Demandez plus d'informations",
          },
          scubaDiving: {
            title: "Plongée Sous-Marine",
            description:
              "À partir de 60€ par personne, réservez 24h à l'avance - Demandez plus d'informations",
          },
          miniCruise: {
            title: "Croisière Miniature (2/3 Îles) aux Îles Éoliennes",
            description:
              "À partir de 40€ par personne - Réservez avec : Navisal ou Tarnav",
          },
          privateTour: {
            title: "Visite Privée aux Îles Éoliennes",
            description:
              "À partir de 100€ par personne - Demandez plus d'informations",
          },
        },
      },
      map: {
        title: "Plan de la Ville",
        openInMaps: "Ouvrir dans Google Maps",
      },
      checkout: {
        title: "Instructions de Check-Out",
        instructions: [
          "Laissez toutes les clés de la chambre à l'intérieur de la chambre.",
          "Rassemblez tous vos effets personnels, y compris chargeurs et appareils électroniques.",
          "Vérifiez soigneusement la chambre pour tout objet que vous pourriez avoir laissé.",
          "Réglez tous les paiements en suspens, y compris la taxe de séjour.",
        ],
        description1:
          "Merci d'avoir choisi de séjourner chez nous ! Nous espérons que votre expérience a été merveilleuse. Avant de procéder au check-out, prenez un moment pour :",
        description2:
          "Si vous oubliez des objets, ne vous inquiétez pas : nous proposons un service de renvoi par courrier (frais supplémentaires applicables) pour retourner les objets perdus.",
        description3:
          "Une fois prêt à faire le check-out, cliquez simplement sur le bouton ci-dessous pour nous en informer. Si vous avez besoin d'aide avant de partir, n'hésitez pas à nous contacter. Nous sommes là pour vous aider !",
        buttonText: "Terminer le Check-Out",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "Croissant Nature",
            description: "Croissant classique vide",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "Croissant au Chocolat",
            description: "Croissant rempli de chocolat",
            price: 1.5,
          },
        ],
      },
    },
    es: {
      tabs: {
        info: "Para Ti",
        breakfast: "Desayuno",
        map: "Mapa de la Ciudad",
        checkout: "Check-Out",
      },
      info: {
        generalInfo: "Información General",
        contactUs: "Contáctanos",
        additionalServices: "Servicios Adicionales",
        checkin: "Check-in: 15:00 - 22:00",
        checkout: "Check-out: Antes de las 10:30",
        address: "Via San Giovanni 42, Milazzo (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "Contactar por WhatsApp",
        services: {
          bikeRental: {
            title: "Alquiler de Bicicletas",
            description: "Desde €10 por día - Solicite más información",
          },
          scubaDiving: {
            title: "Buceo",
            description:
              "Desde €60 por persona, reserve con 24h de antelación - Solicite más información",
          },
          miniCruise: {
            title: "Tour de Mini Cruceros (2/3 Islas) en las Islas Eolias",
            description:
              "Desde €40 por persona - Reserve con: Navisal o Tarnav",
          },
          privateTour: {
            title: "Tour Privado en las Islas Eolias",
            description: "Desde €100 por persona - Solicite más información",
          },
        },
      },
      map: {
        title: "Mapa de la Ciudad",
        openInMaps: "Abrir en Google Maps",
      },
      checkout: {
        title: "Instrucciones de Check-Out",
        instructions: [
          "Deje todas las llaves de la habitación dentro de la habitación.",
          "Recoja todas sus pertenencias personales, incluidos cargadores y dispositivos electrónicos.",
          "Revise cuidadosamente la habitación para verificar que no haya dejado ningún objeto.",
          "Liquide todos los pagos pendientes, incluido el impuesto turístico.",
        ],
        description1:
          "¡Gracias por elegir alojarse con nosotros! Esperamos que haya tenido una experiencia maravillosa. Antes de hacer el check-out, por favor:",
        description2:
          "Si olvida algún objeto, no se preocupe: ofrecemos un servicio de devolución por correo (con cargos adicionales) para devolver los objetos perdidos.",
        description3:
          "Una vez que esté listo para hacer el check-out, simplemente haga clic en el botón de abajo para notificarnos. Si necesita ayuda antes de irse, no dude en contactarnos. ¡Estamos aquí para ayudarle!",
        buttonText: "Completar Check-Out",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "Croissant Clásico",
            description: "Croissant tradicional vacío",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "Croissant de Chocolate",
            description: "Croissant relleno de chocolate",
            price: 1.5,
          },
        ],
      },
    },

    de: {
      tabs: {
        info: "Für Sie",
        breakfast: "Frühstück",
        map: "Stadtplan",
        checkout: "Check-Out",
      },
      info: {
        generalInfo: "Allgemeine Informationen",
        contactUs: "Kontaktieren Sie uns",
        additionalServices: "Zusätzliche Dienstleistungen",
        checkin: "Check-in: 15:00 - 22:00 Uhr",
        checkout: "Check-out: Bis 10:30 Uhr",
        address: "Via San Giovanni 42, Milazzo (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "Kontakt über WhatsApp",
        services: {
          bikeRental: {
            title: "Fahrradverleih",
            description:
              "Ab €10 pro Tag - Fragen Sie nach weiteren Informationen",
          },
          scubaDiving: {
            title: "Tauchen",
            description:
              "Ab €60 pro Person, 24h im Voraus buchen - Fragen Sie nach weiteren Informationen",
          },
          miniCruise: {
            title: "Minikreuzfahrt (2/3 Inseln) auf den Äolischen Inseln",
            description:
              "Ab €40 pro Person - Buchen Sie bei: Navisal oder Tarnav",
          },
          privateTour: {
            title: "Privattour auf den Äolischen Inseln",
            description:
              "Ab €100 pro Person - Fragen Sie nach weiteren Informationen",
          },
        },
      },
      map: {
        title: "Stadtplan",
        openInMaps: "In Google Maps öffnen",
      },
      checkout: {
        title: "Check-Out-Anweisungen",
        instructions: [
          "Lassen Sie alle Zimmerschlüssel im Zimmer.",
          "Sammeln Sie alle persönlichen Gegenstände, einschließlich Ladegeräte und elektronischer Geräte.",
          "Überprüfen Sie das Zimmer sorgfältig auf vergessene Gegenstände.",
          "Begleichen Sie alle offenen Zahlungen, einschließlich der Touristensteuer.",
        ],
        description1:
          "Vielen Dank, dass Sie sich für uns entschieden haben! Wir hoffen, Sie hatten eine wunderbare Erfahrung. Bevor Sie auschecken, nehmen Sie sich einen Moment Zeit für:",
        description2:
          "Sollten Sie etwas vergessen haben, keine Sorge: Wir bieten einen Rücksendeservice (zusätzliche Gebühren fallen an) für verlorene Gegenstände an.",
        description3:
          "Wenn Sie bereit sind auszuchecken, klicken Sie einfach auf den Knopf unten, um uns zu benachrichtigen. Wenn Sie Hilfe benötigen, bevor Sie abreisen, zögern Sie nicht, uns zu kontaktieren. Wir sind hier, um Ihnen zu helfen!",
        buttonText: "Check-Out abschließen",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "Klassisches Croissant",
            description: "Traditionelles leeres Croissant",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "Schokoladen-Croissant",
            description: "Croissant gefüllt mit Schokolade",
            price: 1.5,
          },
        ],
      },
    },

    zh: {
      tabs: {
        info: "为您",
        breakfast: "早餐",
        map: "城市地图",
        checkout: "退房",
      },
      info: {
        generalInfo: "基本信息",
        contactUs: "联系我们",
        additionalServices: "额外服务",
        checkin: "入住时间：15:00 - 22:00",
        checkout: "退房时间：10:30前",
        address: "Via San Giovanni 42, Milazzo (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "通过WhatsApp联系",
        services: {
          bikeRental: {
            title: "自行车租赁",
            description: "每天€10起 - 询问更多详情",
          },
          scubaDiving: {
            title: "潜水",
            description: "每人€60起，提前24小时预订 - 询问更多详情",
          },
          miniCruise: {
            title: "埃奥利安群岛迷你游船（2/3个岛屿）",
            description: "每人€40起 - 通过Navisal或Tarnav预订",
          },
          privateTour: {
            title: "埃奥利安群岛私人游",
            description: "每人€100起 - 询问更多详情",
          },
        },
      },
      map: {
        title: "城市地图",
        openInMaps: "在Google地图中打开",
      },
      checkout: {
        title: "退房指南",
        instructions: [
          "将所有房间钥匙留在房间内。",
          "收拾所有个人物品，包括充电器和电子设备。",
          "仔细检查房间，确保没有遗漏任何物品。",
          "结清所有未付款项，包括城市税。",
        ],
        description1:
          "感谢您选择入住！希望您度过了美好的时光。退房前，请注意：",
        description2:
          "如果遗忘了物品，不用担心 - 我们提供邮寄返回服务（需额外付费）。",
        description3:
          "准备退房时，只需点击下方按钮通知我们。如需任何帮助，随时与我们联系。我们随时为您服务！",
        buttonText: "完成退房",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "原味可颂",
            description: "传统空心可颂",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "巧克力可颂",
            description: "巧克力馅可颂",
            price: 1.5,
          },
        ],
      },
    },

    ru: {
      tabs: {
        info: "Для Вас",
        breakfast: "Завтрак",
        map: "Карта Города",
        checkout: "Выезд",
      },
      info: {
        generalInfo: "Общая Информация",
        contactUs: "Свяжитесь с Нами",
        additionalServices: "Дополнительные Услуги",
        checkin: "Заезд: 15:00 - 22:00",
        checkout: "Выезд: До 10:30",
        address: "Via San Giovanni 42, Милаццо (ME)",
        phone: "+393339201524",
        email: "studiosmipa@gmail.com",
        whatsapp: "Связаться через WhatsApp",
        services: {
          bikeRental: {
            title: "Прокат Велосипедов",
            description: "От €10 в день - Узнайте подробности",
          },
          scubaDiving: {
            title: "Дайвинг",
            description:
              "От €60 за человека, бронируйте за 24 часа - Узнайте подробности",
          },
          miniCruise: {
            title: "Мини-круиз (2/3 Острова) по Эолийским Островам",
            description:
              "От €40 за человека - Бронируйте через: Navisal или Tarnav",
          },
          privateTour: {
            title: "Частный Тур по Эолийским Островам",
            description: "От €100 за человека - Узнайте подробности",
          },
        },
      },
      map: {
        title: "Карта Города",
        openInMaps: "Открыть в Google Картах",
      },
      checkout: {
        title: "Инструкции по Выезду",
        instructions: [
          "Оставьте все ключи от комнаты внутри комнаты.",
          "Соберите все личные вещи, включая зарядные устройства и электронику.",
          "Тщательно проверьте комнату на наличие забытых вещей.",
          "Урегулируйте все незакрытые платежи, включая городской налог.",
        ],
        description1:
          "Спасибо, что выбрали нас! Надеемся, вам понравилось. Перед выездом, пожалуйста:",
        description2:
          "Если вы забыли какие-либо вещи, не волнуйтесь - мы предлагаем услугу возврата по почте (взимается дополнительная плата).",
        description3:
          "Когда будете готовы выехать, просто нажмите кнопку ниже, чтобы уведомить нас. Если вам нужна помощь перед отъездом, не стесняйтесь обращаться. Мы здесь, чтобы помочь!",
        buttonText: "Завершить Выезд",
      },
      breakfast: {
        items: [
          {
            id: "plain-croissant",
            name: "Классический Круассан",
            description: "Традиционный пустой круассан",
            price: 1.5,
          },
          {
            id: "chocolate-croissant",
            name: "Шоколадный Круассан",
            description: "Круассан с шоколадной начинкой",
            price: 1.5,
          },
        ],
      },
    },
  };

  // Get breakfast items based on current language
  const breakfastItems = translations[language].breakfast.items;

  const [breakfastQuantities, setBreakfastQuantities] = useState<
    Record<string, number>
  >(breakfastItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}));

  // Map URL State
  const [mapUrl, setMapUrl] = useState(
    "https://www.google.com/maps/d/embed?mid=15vrvCbCRnWxkxZrUN1FkFf96XWx7sUyc&hl=it&ehbc=2E312F"
  );

  // Online/Offline and PWA Event Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );

    // Load data from localStorage on component mount
    const storedCheckedInStatus = localStorage.getItem("isCheckedIn");
    const storedImages = localStorage.getItem("uploadedDocuments");
    const storedWhatsAppSent = localStorage.getItem("documentsSentViaWhatsApp");

    if (storedCheckedInStatus) {
      setIsCheckedIn(JSON.parse(storedCheckedInStatus));
    }

    if (storedImages) {
      setUploadedImages(JSON.parse(storedImages));
    }

    if (storedWhatsAppSent) {
      setDocumentsSentViaWhatsApp(JSON.parse(storedWhatsAppSent));
    }

    // Register service worker
    registerServiceWorker();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
    };
  }, []);

  // Save check-in status to localStorage
  useEffect(() => {
    localStorage.setItem("isCheckedIn", JSON.stringify(isCheckedIn));
  }, [isCheckedIn]);

  // Save uploaded images to localStorage
  useEffect(() => {
    localStorage.setItem("uploadedDocuments", JSON.stringify(uploadedImages));
  }, [uploadedImages]);

  // Save WhatsApp sent status to localStorage
  useEffect(() => {
    localStorage.setItem(
      "documentsSentViaWhatsApp",
      JSON.stringify(documentsSentViaWhatsApp)
    );
  }, [documentsSentViaWhatsApp]);

  // PWA Installation Handler
  const handleInstallPWA = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt();
        const result = await installPrompt.userChoice;
        if (result.outcome === "accepted") {
          console.log("App installed successfully");
        }
        setInstallPrompt(null);
      } catch (error) {
        console.error("PWA installation failed", error);
      }
    }
  };

  const handleCheckInChoice = (isNewGuest: boolean) => {
    if (isNewGuest) {
      setCurrentPage("upload-id");
    } else {
      setCurrentPage("property-info");
      setIsCheckedIn(true);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setUploadedImages((prev) => [...prev, ...newImageUrls]);
      setDocumentsSentViaWhatsApp(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
    setDocumentsSentViaWhatsApp(false);
  };

  const handleWhatsAppShare = () => {
    const phoneNumber = "+3154896131616";
    const message = "Check-in documents for accommodation:";

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
    setDocumentsSentViaWhatsApp(true);
  };

  // Breakfast-related methods
  const updateBreakfastQuantity = (itemId: string, change: number) => {
    setBreakfastQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + change),
    }));
  };

  const calculateBreakfastTotal = () => {
    return breakfastItems.reduce(
      (total, item) => total + breakfastQuantities[item.id] * item.price,
      0
    );
  };

  const sendBreakfastOrder = () => {
    const roomSelect = document.getElementById(
      "room-select"
    ) as HTMLSelectElement;
    const guestNameInput = document.getElementById(
      "guest-name"
    ) as HTMLInputElement;

    const room = roomSelect?.value;
    const guestName = guestNameInput?.value;

    if (!room || room === "none") {
      alert("Please select your room");
      return;
    }

    if (!guestName) {
      alert("Please enter your name");
      return;
    }

    const orderItems = breakfastItems
      .filter((item) => breakfastQuantities[item.id] > 0)
      .map((item) => `${breakfastQuantities[item.id]}x ${item.name}`);

    const message =
      `Breakfast order for ${guestName}, Room ${room}:\n` +
      orderItems.join("\n") +
      `\n\nTotal: €${calculateBreakfastTotal().toFixed(2)}`;

    window.open(
      `https://wa.me/393339201524?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  // Check-out method
  const handleCheckOut = () => {
    const roomSelect = document.getElementById(
      "checkout-room-select"
    ) as HTMLSelectElement;
    const guestNameInput = document.getElementById(
      "checkout-guest-name"
    ) as HTMLInputElement;

    const room = roomSelect?.value;
    const guestName = guestNameInput?.value;

    if (!room || room === "none") {
      alert("Please select your room");
      return;
    }

    if (!guestName) {
      alert("Please enter your name");
      return;
    }

    const message = `Check-out request:\nName: ${guestName}\nRoom: ${room}\n\nI would like to proceed with the check-out process.`;

    const phoneNumber = "+31254878946";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  // Render methods
  const renderHomePage = () => (
    <div className="container">
      <h1>Welcome to Our Accommodation</h1>
      <div className="button-group">
        <button onClick={() => handleCheckInChoice(true)}>
          I Have to Check In
        </button>
        <button onClick={() => handleCheckInChoice(false)}>
          I Have Already Checked In
        </button>
      </div>
    </div>
  );

  const renderUploadPage = () => (
    <div className="container">
      <h2>Upload Your ID Documents</h2>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />

      {uploadedImages.length > 0 && (
        <div className="image-preview">
          {uploadedImages.map((imageUrl, index) => (
            <div key={index} className="preview-item">
              <img src={imageUrl} alt={`Uploaded ${index}`} />
              <button onClick={() => removeImage(index)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="button-group">
          <button onClick={handleWhatsAppShare} className="whatsapp-share">
            Send Documents via WhatsApp
          </button>
          <button
            onClick={() => setCurrentPage("property-info")}
            disabled={!documentsSentViaWhatsApp}
            className={!documentsSentViaWhatsApp ? "disabled" : ""}
          >
            Continue to Property Info
          </button>
        </div>
      )}
    </div>
  );

  const renderPropertyInfoPage = () => (
    <div className="container">
      <div className="language-switcher">
        {["en", "it", "es", "fr", "de", "zh", "ru"].map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang as Language)}
            className={language === lang ? "active" : ""}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="tabs">
        <div className="tab-headers">
          <button
            className={activeTab === "info" ? "active" : ""}
            onClick={() => setActiveTab("info")}
          >
            {translations[language].tabs.info}
          </button>
          <button
            className={activeTab === "breakfast" ? "active" : ""}
            onClick={() => setActiveTab("breakfast")}
          >
            {translations[language].tabs.breakfast}
          </button>
          <button
            className={activeTab === "map" ? "active" : ""}
            onClick={() => setActiveTab("map")}
          >
            {translations[language].tabs.map}
          </button>
          <button
            className={activeTab === "checkout" ? "active" : ""}
            onClick={() => setActiveTab("checkout")}
          >
            {translations[language].tabs.checkout}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "info" && (
            <div className="for-you-tab">
              <div className="info-section">
                <h2>{translations[language].info.generalInfo}</h2>
                <div className="info-item">
                  <Clock className="icon" />
                  <p>
                    <strong>{translations[language].info.checkin}</strong>
                  </p>
                </div>
                <div className="info-item">
                  <Clock className="icon" />
                  <p>
                    <strong>{translations[language].info.checkout}</strong>
                  </p>
                </div>
                <div className="info-item">
                  <MapPin className="icon" />
                  <p>
                    <strong>Address:</strong>{" "}
                    <a
                      href="https://maps.google.com/maps?q=Via+San+Giovanni+42,+Milazzo+(ME)"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {translations[language].info.address}
                    </a>
                  </p>
                </div>
              </div>

              <div className="contact-section">
                <h2>{translations[language].info.contactUs}</h2>
                <div className="info-item">
                  <Phone className="icon" />
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={`tel:${translations[language].info.phone}`}>
                      {translations[language].info.phone}
                    </a>
                  </p>
                </div>
                <div className="info-item">
                  <Mail className="icon" />
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${translations[language].info.email}`}>
                      {translations[language].info.email}
                    </a>
                  </p>
                </div>
                <div className="info-item">
                  <MessageCircle className="icon" />
                  <p>
                    <strong>Chat:</strong>{" "}
                    <a
                      href={`https://wa.me/${translations[language].info.phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {translations[language].info.whatsapp}
                    </a>
                  </p>
                </div>
              </div>

              <div className="services-section">
                <h2>{translations[language].info.additionalServices}</h2>
                <div className="service-item">
                  <Bike className="icon" />
                  <div>
                    <strong>
                      {translations[language].info.services.bikeRental.title}
                    </strong>
                    <p>
                      {
                        translations[language].info.services.bikeRental
                          .description
                      }
                    </p>
                  </div>
                </div>
                <div className="service-item">
                  <Waves className="icon" />
                  <div>
                    <strong>
                      {translations[language].info.services.scubaDiving.title}
                    </strong>
                    <p>
                      {
                        translations[language].info.services.scubaDiving
                          .description
                      }
                    </p>
                  </div>
                </div>
                <div className="service-item">
                  <Sailboat className="icon" />
                  <div>
                    <strong>
                      {translations[language].info.services.miniCruise.title}
                    </strong>
                    <p>
                      {
                        translations[language].info.services.miniCruise
                          .description
                      }
                    </p>
                  </div>
                </div>
                <div className="service-item">
                  <Sailboat className="icon" />
                  <div>
                    <strong>
                      {translations[language].info.services.privateTour.title}
                    </strong>
                    <p>
                      {
                        translations[language].info.services.privateTour
                          .description
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "breakfast" && (
            <div>
              <h2>Order Your Breakfast</h2>
              <div>
                <label htmlFor="guest-name">Your Name</label>
                <input
                  type="text"
                  id="guest-name"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="room-select">Select Room</label>
                <select id="room-select">
                  <option value="none">-- Select Room --</option>
                  <option value="MiPA1">MiPA1</option>
                  <option value="MiPA2">MiPA2</option>
                  <option value="MiPA3">MiPA3</option>
                  <option value="MiPA4">MiPA4</option>
                </select>
              </div>

              {breakfastItems.map((item) => (
                <div key={item.id} className="breakfast-item">
                  <div>
                    <div>{item.name}</div>
                    <div>{item.description}</div>
                    <div>€{item.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <button
                      onClick={() => updateBreakfastQuantity(item.id, -1)}
                    >
                      -
                    </button>
                    <span>{breakfastQuantities[item.id]}</span>
                    <button onClick={() => updateBreakfastQuantity(item.id, 1)}>
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div>
                <span>Total:</span>
                <span>€{calculateBreakfastTotal().toFixed(2)}</span>
              </div>

              <button onClick={sendBreakfastOrder}>
                Place Order via WhatsApp
              </button>
            </div>
          )}

          {activeTab === "map" && (
            <div className="map-section">
              <h2>{translations[language].map.title}</h2>
              <div className="map-container">
                <iframe
                  className="map-iframe"
                  src={mapUrl}
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="map-button"
              >
                {translations[language].map.openInMaps}
              </a>
            </div>
          )}

          {activeTab === "checkout" && (
            <div className="checkout-section">
              <h2>{translations[language].checkout.title}</h2>
              <p>{translations[language].checkout.description1}</p>

              <div>
                <label htmlFor="checkout-guest-name">Your Name</label>
                <input
                  type="text"
                  id="checkout-guest-name"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label htmlFor="checkout-room-select">Select Room</label>
                <select id="checkout-room-select">
                  <option value="none">-- Select Room --</option>
                  <option value="MiPA1">MiPA1</option>
                  <option value="MiPA2">MiPA2</option>
                  <option value="MiPA3">MiPA3</option>
                  <option value="MiPA4">MiPA4</option>
                </select>
              </div>

              <ul>
                {translations[language].checkout.instructions.map(
                  (instruction, index) => (
                    <li key={index}>{instruction}</li>
                  )
                )}
              </ul>
              <p>{translations[language].checkout.description2}</p>
              <p>{translations[language].checkout.description3}</p>

              <button onClick={handleCheckOut} className="checkout-button">
                {translations[language].checkout.buttonText}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isCheckedIn) return renderPropertyInfoPage();

    switch (currentPage) {
      case "home":
        return renderHomePage();
      case "upload-id":
        return renderUploadPage();
      case "property-info":
        return renderPropertyInfoPage();
      default:
        return renderHomePage();
    }
  };

  // Render the Offline Warning Component
  const OfflineWarning = () => (
    <div className="offline-warning">
      You are currently offline. Some features may be limited.
    </div>
  );

  return (
    <div className="app">
      {!isOnline && <OfflineWarning />}
      {renderContent()}
      {installPrompt && <button onClick={handleInstallPWA}>Install App</button>}
    </div>
  );
};

export default AccommodationApp;
