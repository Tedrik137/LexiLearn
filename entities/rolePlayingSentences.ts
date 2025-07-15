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
  doctor:
    "In this scenario, you are at a hospital where you can see a doctor and discuss your health concerns.",
  hotel:
    "This scenario is set in a hotel where you can check in, ask for room details, and interact with the staff.",
  airport:
    "In this scenario, you are at an airport where you can check in for your flight and go through security.",
};

export type ScenarioSentence = {
  name: string;
  character: string;
  prompt: string;
  response: string;
};

interface ScenarioSentences {
  [key: string]: ScenarioSentence[];
}

export const sentences: ScenarioSentences = {
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
  doctor: [
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
