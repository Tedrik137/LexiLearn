import { LanguageCode } from "@/types/languages";

interface ScenarioDescription {
  [key: string]: string;
}

export const descriptions: ScenarioDescription = {
  cafe: "This scenario takes place in a cafe where you can order coffee and interact with the staff.",
  library:
    "In this scenario, you are in a library looking for a book. You can ask for help from the librarian.",
  park: "This scenario is set in a park where you can enjoy various activities and ask for assistance if needed.",
  restaurant:
    "In this scenario, you are at a restaurant where you can order food and interact with the staff.",
  store:
    "This scenario takes place in a store where you can shop for items and ask for help from the staff.",
  hospital:
    "In this scenario, you are at a hospital where you can see a doctor and discuss your health concerns.",
  hotel:
    "This scenario is set in a hotel where you can check in, ask for room details, and interact with the staff.",
  airport:
    "In this scenario, you are at an airport where you can check in for your flight and go through security.",
};

interface ScenarioPictures {
  [key: string]: any;
}

export const scenarioPictures: ScenarioPictures = {
  cafe: require("../assets/images/cafe.jpg"),
  library: require("../assets/images/library.jpg"),
  park: require("../assets/images/park.jpg"),
  restaurant: require("../assets/images/restaurant.jpg"),
  store: require("../assets/images/store.jpg"),
  hospital: require("../assets/images/hospital.jpg"),
  hotel: require("../assets/images/hotel.jpg"),
  airport: require("../assets/images/airport.jpg"),
};

export interface ScenarioSentence {
  name: string;
  character: string;
  prompt: string;
  response: string;
}

interface ScenarioSentences {
  [key: string]: ScenarioSentence[];
}

const englishSentences: ScenarioSentences = {
  cafe: [
    {
      name: "Greeting",
      character: "Barista",
      prompt: "Welcome to the cafe! How can I help you today?",
      response: "Hello! I'd like to order a coffee.",
    },
    {
      name: "Order Coffee",
      character: "Barista",
      prompt: "What kind of coffee would you like?",
      response: "I'd like a cappuccino, please.",
    },
    {
      name: "Thank You",
      character: "Barista",
      prompt: "Thank you for your order! Enjoy your coffee!",
      response: "Thank you! I appreciate it.",
    },
  ],
  library: [
    {
      name: "Greeting",
      character: "Librarian",
      prompt: "Welcome to the library! How can I assist you?",
      response: "Hello! I'm looking for a book.",
    },
    {
      name: "Ask For Book",
      character: "Librarian",
      prompt: "What book are you looking for?",
      response: "I'm looking for 'The Great Gatsby'.",
    },
    {
      name: "Book Found",
      character: "Librarian",
      prompt: "I found 'The Great Gatsby'. Would you like to borrow it?",
      response: "Yes, please! I'd like to borrow it.",
    },
    {
      name: "Thank You",
      character: "Librarian",
      prompt: "Thank you for visiting the library! Have a great day!",
      response: "Thank you! You too!",
    },
  ],
  park: [
    {
      name: "Greeting",
      character: "Ranger",
      prompt: "Welcome to the park! How can I help you?",
      response:
        "Hello! I'm here to enjoy the park. What activities are available?",
    },
    {
      name: "Activities",
      character: "Ranger",
      prompt: "We have walking trails and a playground for children.",
      response: "Great! I'll take a walk on the trail.",
    },
    {
      name: "Ask for Directions",
      character: "Ranger",
      prompt: "Do you need any help with directions?",
      response: "Yes please, could you guide me to the nearest trail?",
    },
    {
      name: "Guiding To Trail",
      character: "Ranger",
      prompt:
        "Sure! Just follow the path to the right, and you'll see the trailhead.",
      response: "Thank you! I appreciate your help.",
    },
    {
      name: "Thank You",
      character: "Ranger",
      prompt: "Thank you for visiting the park!",
      response: "Thank you! Have a great day!",
    },
  ],
  restaurant: [
    {
      name: "Greeting",
      character: "Host",
      prompt: "Welcome to our restaurant! How many in your party?",
      response: "Hello! It's just me today.",
    },
    {
      name: "Ask for Menu",
      character: "Waiter",
      prompt: "Would you like to see the menu?",
      response: "Yes, please. I'd love to see the menu.",
    },
    {
      name: "Order Food",
      character: "Waiter",
      prompt: "What would you like to order?",
      response: "I'll have the grilled salmon, please.",
    },
    {
      name: "Thank You",
      character: "Host",
      prompt: "Thank you for dining with us! Enjoy your meal!",
      response: "Thank you! It looks delicious.",
    },
  ],
  store: [
    {
      name: "Greeting",
      character: "Salesperson",
      prompt: "Welcome to our store! How can I assist you today?",
      response: "Hello! I'm looking for some new shoes.",
    },
    {
      name: "Size of Shoes",
      character: "Salesperson",
      prompt: "What size do you wear?",
      response: "I wear a size 10.",
    },
    {
      name: "Try on Shoes",
      character: "Salesperson",
      prompt: "We have these shoes in size 10. Would you like to try them on?",
      response: "Yes, please! I'd like to try them on.",
    },
    {
      name: "Thank You",
      character: "Salesperson",
      prompt: "Thank you for shopping with us! Have a great day!",
      response: "Thank you! I appreciate your help.",
    },
  ],
  hospital: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "Welcome to the hospital! How can I help you?",
      response: "Hello! I need to see a doctor.",
    },
    {
      name: "Patient Symptoms",
      character: "Receptionist",
      prompt: "What seems to be the problem?",
      response: "I've been having a headache for a few days.",
    },
    {
      name: "Wait for Doctor",
      character: "Receptionist",
      prompt: "Please take a seat. The doctor will see you shortly.",
      response: "Thank you! I'll wait here.",
    },
    {
      name: "Thank You",
      character: "Doctor",
      prompt: "Thank you for visiting us. Take care!",
      response: "Thank you! I appreciate your help.",
    },
  ],
  hotel: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "Welcome to our hotel! Do you have a reservation?",
      response: "Hello! Yes, I have a reservation under the name Smith.",
    },
    {
      name: "Provide ID",
      character: "Receptionist",
      prompt: "Great! Let me check you in. Can I have your ID, please?",
      response: "Sure, here it is.",
    },
    {
      name: "Room Details",
      character: "Receptionist",
      prompt: "Your room is ready. It's on the second floor.",
      response: "Thank you! I appreciate it.",
    },
    {
      name: "Thank You",
      character: "Receptionist",
      prompt: "Thank you for choosing our hotel! Enjoy your stay!",
      response: "Thank you! I'm looking forward to it.",
    },
  ],
  airport: [
    {
      name: "Greeting",
      character: "Check-in Agent",
      prompt: "Welcome to the airport! How can I assist you?",
      response: "Hello! I'm here for my flight to New York.",
    },
    {
      name: "Proving Boarding Pass",
      character: "Check-in Agent",
      prompt: "Do you have your boarding pass?",
      response: "Yes, here it is.",
    },
    {
      name: "Security Check",
      character: "Check-in Agent",
      prompt: "Please proceed to the security check.",
      response: "Thank you! I'll go there now.",
    },
    {
      name: "Thank You",
      character: "Check-in Agent",
      prompt: "Thank you for flying with us! Have a safe journey!",
      response: "Thank you! I appreciate it.",
    },
  ],
};

const frenchSentences: ScenarioSentences = {
  cafe: [
    {
      name: "Greeting",
      character: "Barista",
      prompt: "Bienvenue au café ! Comment puis-je vous aider aujourd'hui ?",
      response: "Bonjour ! Je voudrais commander un café.",
    },
    {
      name: "Order Coffee",
      character: "Barista",
      prompt: "Quel type de café souhaitez-vous ?",
      response: "Je voudrais un cappuccino, s'il vous plaît.",
    },
    {
      name: "Thank You",
      character: "Barista",
      prompt: "Merci pour votre commande ! Profitez de votre café !",
      response: "Merci ! J'apprécie.",
    },
  ],
  library: [
    {
      name: "Greeting",
      character: "Librarian",
      prompt: "Bienvenue à la bibliothèque ! Comment puis-je vous aider ?",
      response: "Bonjour ! Je cherche un livre.",
    },
    {
      name: "Ask For Book",
      character: "Librarian",
      prompt: "Quel livre cherchez-vous ?",
      response: "Je cherche 'The Great Gatsby'.",
    },
    {
      name: "Book Found",
      character: "Librarian",
      prompt: "J'ai trouvé 'The Great Gatsby'. Voulez-vous l'emprunter ?",
      response: "Oui, s'il vous plaît ! J'aimerais l'emprunter.",
    },
    {
      name: "Thank You",
      character: "Librarian",
      prompt: "Merci de votre visite à la bibliothèque ! Bonne journée !",
      response: "Merci ! À vous aussi !",
    },
  ],
  park: [
    {
      name: "Greeting",
      character: "Ranger",
      prompt: "Bienvenue au parc ! Comment puis-je vous aider ?",
      response:
        "Bonjour ! Je suis ici pour profiter du parc. Quelles activités sont disponibles ?",
    },
    {
      name: "Activities",
      character: "Ranger",
      prompt:
        "Nous avons des sentiers de randonnée et une aire de jeux pour les enfants.",
      response: "Super ! Je vais me promener sur le sentier.",
    },
    {
      name: "Ask for Directions",
      character: "Ranger",
      prompt: "Avez-vous besoin d'aide pour vous orienter ?",
      response:
        "Oui s'il vous plaît, pourriez-vous m'indiquer le sentier le plus proche ?",
    },
    {
      name: "Guiding To Trail",
      character: "Ranger",
      prompt:
        "Bien sûr ! Suivez simplement le chemin à droite et vous verrez le début du sentier.",
      response: "Merci ! J'apprécie votre aide.",
    },
    {
      name: "Thank You",
      character: "Ranger",
      prompt: "Merci de votre visite au parc !",
      response: "Merci ! Bonne journée !",
    },
  ],
  restaurant: [
    {
      name: "Greeting",
      character: "Host",
      prompt: "Bienvenue dans notre restaurant ! Vous êtes combien ?",
      response: "Bonjour ! Je suis seul aujourd'hui.",
    },
    {
      name: "Ask for Menu",
      character: "Waiter",
      prompt: "Voulez-vous voir le menu ?",
      response: "Oui, s'il vous plaît. J'aimerais beaucoup voir le menu.",
    },
    {
      name: "Order Food",
      character: "Waiter",
      prompt: "Que souhaitez-vous commander ?",
      response: "Je vais prendre le saumon grillé, s'il vous plaît.",
    },
    {
      name: "Thank You",
      character: "Host",
      prompt: "Merci d'avoir dîné avec nous ! Bon appétit !",
      response: "Merci ! Ça a l'air délicieux.",
    },
  ],
  store: [
    {
      name: "Greeting",
      character: "Salesperson",
      prompt:
        "Bienvenue dans notre magasin ! Comment puis-je vous aider aujourd'hui ?",
      response: "Bonjour ! Je cherche de nouvelles chaussures.",
    },
    {
      name: "Size of Shoes",
      character: "Salesperson",
      prompt: "Quelle est votre pointure ?",
      response: "Je fais du 42.",
    },
    {
      name: "Try on Shoes",
      character: "Salesperson",
      prompt: "Nous avons ces chaussures en 42. Voulez-vous les essayer ?",
      response: "Oui, s'il vous plaît ! J'aimerais les essayer.",
    },
    {
      name: "Thank You",
      character: "Salesperson",
      prompt: "Merci pour vos achats ! Bonne journée !",
      response: "Merci ! J'apprécie votre aide.",
    },
  ],
  hospital: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "Bienvenue à l'hôpital ! Comment puis-je vous aider ?",
      response: "Bonjour ! Je dois voir un médecin.",
    },
    {
      name: "Patient Symptoms",
      character: "Receptionist",
      prompt: "Quel est le problème ?",
      response: "J'ai mal à la tête depuis quelques jours.",
    },
    {
      name: "Wait for Doctor",
      character: "Receptionist",
      prompt: "Veuillez vous asseoir. Le médecin va vous recevoir sous peu.",
      response: "Merci ! Je vais attendre ici.",
    },
    {
      name: "Thank You",
      character: "Doctor",
      prompt: "Merci de votre visite. Prenez soin de vous !",
      response: "Merci ! J'apprécie votre aide.",
    },
  ],
  hotel: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "Bienvenue à notre hôtel ! Avez-vous une réservation ?",
      response: "Bonjour ! Oui, j'ai une réservation au nom de Dubois.",
    },
    {
      name: "Provide ID",
      character: "Receptionist",
      prompt:
        "Parfait ! Laissez-moi vous enregistrer. Puis-je avoir votre pièce d'identité, s'il vous plaît ?",
      response: "Bien sûr, la voici.",
    },
    {
      name: "Room Details",
      character: "Receptionist",
      prompt: "Votre chambre est prête. Elle est au deuxième étage.",
      response: "Merci ! J'apprécie.",
    },
    {
      name: "Thank You",
      character: "Receptionist",
      prompt: "Merci d'avoir choisi notre hôtel ! Profitez de votre séjour !",
      response: "Merci ! J'ai hâte.",
    },
  ],
  airport: [
    {
      name: "Greeting",
      character: "Check-in Agent",
      prompt: "Bienvenue à l'aéroport ! Comment puis-je vous aider ?",
      response: "Bonjour ! Je suis ici pour mon vol vers Paris.",
    },
    {
      name: "Proving Boarding Pass",
      character: "Check-in Agent",
      prompt: "Avez-vous votre carte d'embarquement ?",
      response: "Oui, la voici.",
    },
    {
      name: "Security Check",
      character: "Check-in Agent",
      prompt: "Veuillez vous diriger vers le contrôle de sécurité.",
      response: "Merci ! J'y vais tout de suite.",
    },
    {
      name: "Thank You",
      character: "Check-in Agent",
      prompt: "Merci d'avoir volé avec nous ! Bon voyage !",
      response: "Merci ! J'apprécie.",
    },
  ],
};

const japaneseSentences: ScenarioSentences = {
  cafe: [
    {
      name: "Greeting",
      character: "Barista",
      prompt: "カフェへようこそ！ごちゅうもんは なに にしますか？",
      response: "こんにちは！コーヒーを ちゅうもん したいです。",
    },
    {
      name: "Order Coffee",
      character: "Barista",
      prompt: "どの しゅるい のコーヒーが よろしいですか？",
      response: "カプチーノを おねがいします。",
    },
    {
      name: "Thank You",
      character: "Barista",
      prompt:
        "ごちゅうもん ありがとうございます！コーヒーを おたのしみください！",
      response: "ありがとうございます！",
    },
  ],
  library: [
    {
      name: "Greeting",
      character: "Librarian",
      prompt: "としょかんへようこそ！なにか おさがしですか？",
      response: "こんにちは！ほんを さがしています。",
    },
    {
      name: "Ask For Book",
      character: "Librarian",
      prompt: "どの ほんを おさがしですか？",
      response: "「グレート・ギャツビー」を さがしています。",
    },
    {
      name: "Book Found",
      character: "Librarian",
      prompt: "「グレート・ギャツビー」が みつかりました。かりますか？",
      response: "はい、おねがいします！かりたいです。",
    },
    {
      name: "Thank You",
      character: "Librarian",
      prompt: "としょかんに きてくれて ありがとうございます！よい いちにちを！",
      response: "ありがとうございます！あなたも！",
    },
  ],
  park: [
    {
      name: "Greeting",
      character: "Ranger",
      prompt: "こうえんへようこそ！どうしましたか？",
      response:
        "こんにちは！こうえんを たのしみにきました。どんなことができますか？",
    },
    {
      name: "Activities",
      character: "Ranger",
      prompt: "さんぽみちと こどもむけの あそびばが あります。",
      response: "すばらしい！さんぽみちを あるいてみます。",
    },
    {
      name: "Ask for Directions",
      character: "Ranger",
      prompt: "みちあんないは いりますか？",
      response:
        "はい、おねがいします。いちばん ちかい さんぽみちまで あんないして もらえますか？",
    },
    {
      name: "Guiding To Trail",
      character: "Ranger",
      prompt:
        "もちろんです！みぎの みちを まっすぐ いけば、さんぽみちの いりぐちが みえますよ。",
      response: "ありがとうございます！たすかります。",
    },
    {
      name: "Thank You",
      character: "Ranger",
      prompt: "こうえんに きてくれて ありがとうございます！",
      response: "ありがとうございます！よい いちにちを！",
    },
  ],
  restaurant: [
    {
      name: "Greeting",
      character: "Host",
      prompt: "レストランへようこそ！なんめいさまですか？",
      response: "こんにちは！きょうは ひとりです。",
    },
    {
      name: "Ask for Menu",
      character: "Waiter",
      prompt: "メニューを ごらんになりますか？",
      response: "はい、おねがいします。ぜひ みたいです。",
    },
    {
      name: "Order Food",
      character: "Waiter",
      prompt: "なにを ごちゅうもんされますか？",
      response: "やきざかなを おねがいします。",
    },
    {
      name: "Thank You",
      character: "Host",
      prompt:
        "ごらいてん ありがとうございます！おしょくじを おたのしみください！",
      response: "ありがとうございます！おいしそうですね。",
    },
  ],
  store: [
    {
      name: "Greeting",
      character: "Salesperson",
      prompt: "おみせへようこそ！なにか おさがしですか？",
      response: "こんにちは！あたらしい くつを さがしています。",
    },
    {
      name: "Size of Shoes",
      character: "Salesperson",
      prompt: "サイズは いくつですか？",
      response: "27センチです。",
    },
    {
      name: "Try on Shoes",
      character: "Salesperson",
      prompt: "こちらの くつの 27センチが ございます。しちゃくされますか？",
      response: "はい、おねがいします！しちゃくしたいです。",
    },
    {
      name: "Thank You",
      character: "Salesperson",
      prompt: "おかいあげ ありがとうございます！よい いちにちを！",
      response: "ありがとうございます！たすかりました。",
    },
  ],
  hospital: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "びょういんへようこそ！どうしましたか？",
      response: "こんにちは！いしゃに みてもらいたいです。",
    },
    {
      name: "Patient Symptoms",
      character: "Receptionist",
      prompt: "どのような しょうじょうですか？",
      response: "すうじつかん、あたまが いたいです。",
    },
    {
      name: "Wait for Doctor",
      character: "Receptionist",
      prompt: "すわっておまちください。まもなく いしゃが まいります。",
      response: "ありがとうございます！ここで まちます。",
    },
    {
      name: "Thank You",
      character: "Doctor",
      prompt: "ご来院ありがとうございました。おだいじに！",
      response: "ありがとうございます！たすかりました。",
    },
  ],
  hotel: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "ホテルへようこそ！ごよやくは されていますか？",
      response: "こんにちは！はい、やまだという なまえで よやくしています。",
    },
    {
      name: "Provide ID",
      character: "Receptionist",
      prompt:
        "ありがとうございます！チェックインします。みぶんしょうめいしょを おねがいできますか？",
      response: "はい、どうぞ。",
    },
    {
      name: "Room Details",
      character: "Receptionist",
      prompt: "おへやの じゅんびが できました。にかいでございます。",
      response: "ありがとうございます！",
    },
    {
      name: "Thank You",
      character: "Receptionist",
      prompt:
        "このホテルを えらんでいただき ありがとうございます！ごたいざいを おたのしみください！",
      response: "ありがとうございます！たのしみにしています。",
    },
  ],
  airport: [
    {
      name: "Greeting",
      character: "Check-in Agent",
      prompt: "くうこうへようこそ！ごようけんは なんでしょうか？",
      response: "こんにちは！とうきょうゆきの びんで きました。",
    },
    {
      name: "Proving Boarding Pass",
      character: "Check-in Agent",
      prompt: "とうじょうけんは おもちですか？",
      response: "はい、こちらです。",
    },
    {
      name: "Security Check",
      character: "Check-in Agent",
      prompt: "ほあんけんさじょうへ おすすみください。",
      response: "ありがとうございます！いま いきます。",
    },
    {
      name: "Thank You",
      character: "Check-in Agent",
      prompt: "ごりよう いただき ありがとうございます！あんぜんなたびを！",
      response: "ありがとうございます！",
    },
  ],
};

const arabicSentences: ScenarioSentences = {
  cafe: [
    {
      name: "Greeting",
      character: "Barista",
      prompt: "مرحباً بك في المقهى! كيف يمكنني مساعدتك اليوم؟",
      response: "مرحباً! أود أن أطلب قهوة.",
    },
    {
      name: "Order Coffee",
      character: "Barista",
      prompt: "أي نوع من القهوة تود؟",
      response: "أود كابتشينو، من فضلك.",
    },
    {
      name: "Thank You",
      character: "Barista",
      prompt: "شكراً لطلبك! استمتع بقهوتك!",
      response: "شكراً لك! أقدر ذلك.",
    },
  ],
  library: [
    {
      name: "Greeting",
      character: "Librarian",
      prompt: "مرحباً بك في المكتبة! كيف يمكنني مساعدتك؟",
      response: "مرحباً! أنا أبحث عن كتاب.",
    },
    {
      name: "Ask For Book",
      character: "Librarian",
      prompt: "عن أي كتاب تبحث؟",
      response: "أبحث عن 'The Great Gatsby'.",
    },
    {
      name: "Book Found",
      character: "Librarian",
      prompt: "لقد وجدت 'The Great Gatsby'. هل تود استعارته؟",
      response: "نعم، من فضلك! أود استعارته.",
    },
    {
      name: "Thank You",
      character: "Librarian",
      prompt: "شكراً لزيارتك للمكتبة! أتمنى لك يوماً سعيداً!",
      response: "شكراً لك! وأنت أيضاً!",
    },
  ],
  park: [
    {
      name: "Greeting",
      character: "Ranger",
      prompt: "مرحباً بك في الحديقة! كيف يمكنني مساعدتك؟",
      response: "مرحباً! أنا هنا للاستمتاع بالحديقة. ما هي الأنشطة المتاحة؟",
    },
    {
      name: "Activities",
      character: "Ranger",
      prompt: "لدينا مسارات للمشي وملعب للأطفال.",
      response: "رائع! سأقوم بنزهة على المسار.",
    },
    {
      name: "Ask for Directions",
      character: "Ranger",
      prompt: "هل تحتاج إلى أي مساعدة في الاتجاهات؟",
      response: "نعم من فضلك، هل يمكنك إرشادي إلى أقرب مسار؟",
    },
    {
      name: "Guiding To Trail",
      character: "Ranger",
      prompt: "بالتأكيد! فقط اتبع الطريق إلى اليمين، وسترى بداية المسار.",
      response: "شكراً لك! أقدر مساعدتك.",
    },
    {
      name: "Thank You",
      character: "Ranger",
      prompt: "شكراً لزيارتك للحديقة!",
      response: "شكراً لك! أتمنى لك يوماً سعيداً!",
    },
  ],
  restaurant: [
    {
      name: "Greeting",
      character: "Host",
      prompt: "مرحباً بك في مطعمنا! كم عدد أفراد مجموعتك؟",
      response: "مرحباً! أنا وحدي اليوم.",
    },
    {
      name: "Ask for Menu",
      character: "Waiter",
      prompt: "هل تود رؤية القائمة؟",
      response: "نعم، من فضلك. أود أن أرى القائمة.",
    },
    {
      name: "Order Food",
      character: "Waiter",
      prompt: "ماذا تود أن تطلب؟",
      response: "سأطلب السلمون المشوي، من فضلك.",
    },
    {
      name: "Thank You",
      character: "Host",
      prompt: "شكراً لتناول الطعام معنا! استمتع بوجبتك!",
      response: "شكراً لك! يبدو شهياً.",
    },
  ],
  store: [
    {
      name: "Greeting",
      character: "Salesperson",
      prompt: "مرحباً بك في متجرنا! كيف يمكنني مساعدتك اليوم؟",
      response: "مرحباً! أبحث عن حذاء جديد.",
    },
    {
      name: "Size of Shoes",
      character: "Salesperson",
      prompt: "ما هو مقاسك؟",
      response: "مقاسي 42.",
    },
    {
      name: "Try on Shoes",
      character: "Salesperson",
      prompt: "لدينا هذا الحذاء بمقاس 42. هل تود تجربته؟",
      response: "نعم، من فضلك! أود تجربته.",
    },
    {
      name: "Thank You",
      character: "Salesperson",
      prompt: "شكراً لتسوقك معنا! أتمنى لك يوماً سعيداً!",
      response: "شكراً لك! أقدر مساعدتك.",
    },
  ],
  hospital: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "مرحباً بك في المستشفى! كيف يمكنني مساعدتك؟",
      response: "مرحباً! أحتاج إلى رؤية طبيب.",
    },
    {
      name: "Patient Symptoms",
      character: "Receptionist",
      prompt: "ما هي المشكلة؟",
      response: "أعاني من صداع منذ بضعة أيام.",
    },
    {
      name: "Wait for Doctor",
      character: "Receptionist",
      prompt: "من فضلك اجلس. سيراك الطبيب قريباً.",
      response: "شكراً لك! سأنتظر هنا.",
    },
    {
      name: "Thank You",
      character: "Doctor",
      prompt: "شكراً لزيارتك لنا. اعتنِ بنفسك!",
      response: "شكراً لك! أقدر مساعدتك.",
    },
  ],
  hotel: [
    {
      name: "Greeting",
      character: "Receptionist",
      prompt: "مرحباً بك في فندقنا! هل لديك حجز؟",
      response: "مرحباً! نعم، لدي حجز باسم أحمد.",
    },
    {
      name: "Provide ID",
      character: "Receptionist",
      prompt: "رائع! دعني أسجل دخولك. هل يمكنني الحصول على هويتك، من فضلك؟",
      response: "بالتأكيد، تفضل.",
    },
    {
      name: "Room Details",
      character: "Receptionist",
      prompt: "غرفتك جاهزة. إنها في الطابق الثاني.",
      response: "شكراً لك! أقدر ذلك.",
    },
    {
      name: "Thank You",
      character: "Receptionist",
      prompt: "شكراً لاختيارك فندقنا! استمتع بإقامتك!",
      response: "شكراً لك! أنا أتطلع لذلك.",
    },
  ],
  airport: [
    {
      name: "Greeting",
      character: "Check-in Agent",
      prompt: "مرحباً بك في المطار! كيف يمكنني مساعدتك؟",
      response: "مرحباً! أنا هنا لرحلتي إلى دبي.",
    },
    {
      name: "Proving Boarding Pass",
      character: "Check-in Agent",
      prompt: "هل لديك بطاقة الصعود إلى الطائرة؟",
      response: "نعم، تفضل.",
    },
    {
      name: "Security Check",
      character: "Check-in Agent",
      prompt: "من فضلك توجه إلى التفتيش الأمني.",
      response: "شكراً لك! سأذهب إلى هناك الآن.",
    },
    {
      name: "Thank You",
      character: "Check-in Agent",
      prompt: "شكراً للسفر معنا! أتمنى لك رحلة آمنة!",
      response: "شكراً لك! أقدر ذلك.",
    },
  ],
};

export const rolePlayingSentences: Record<LanguageCode, ScenarioSentences> = {
  "en-AU": englishSentences,
  "ar-XA": arabicSentences,
  "fr-FR": frenchSentences,
  "ja-JP": japaneseSentences,
};
