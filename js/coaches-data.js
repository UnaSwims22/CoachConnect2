//Prototype data
export const coaches = [
  {
    id: 1, name: "Thabo Mokoena", sport: "Basketball", location: "Johannesburg, Gauteng", level: "Intermediate", sessions: ["Individual", "Group"], focus: "Guard development · Skills & fundamentals", experience: "6 years", price: 350,
    //Replace image
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=85", alt: "Basketball player preparing to shoot",
    bio: "Individual sessions focused on decision-making, ball control and confident all-round play.",
    about: "Thabo's sample profile focuses on helping developing basketball players become more confident with the ball and make clearer decisions during play. Sessions are structured around a player's current experience and the areas they want to improve.",
    approach: ["Build strong fundamentals before adding complexity", "Use game-like situations to practise decision-making", "Set clear session goals and reflect on progress"],
    suitableFor: "Intermediate players who want to develop their guard skills, ball control and on-court decision-making.",
    sessionDetails: "Individual skill development and small-group training.",
    preparation: "Bring basketball shoes, comfortable training clothing and a water bottle. A basketball can be discussed when arranging a session."
  },
  {
    id: 2, name: "Amara Dlamini", sport: "Football", location: "Pretoria, Gauteng", level: "Beginner", sessions: ["Individual", "Group"], focus: "Technical development · Youth coaching", experience: "5 years", price: 300,
    //Replace image
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85", alt: "Football training on a green pitch",
    bio: "Structured technical sessions to improve first touch, movement and confidence on the ball.",
    about: "Amara's sample profile is designed around accessible football sessions for players building their technical foundations. The emphasis is on learning at a steady pace and applying skills in simple game situations.",
    approach: ["Break technical skills into manageable steps", "Practise first touch, passing and movement", "Build confidence through supportive repetition"],
    suitableFor: "Beginner players who want to become more comfortable with the ball and understand basic movement in the game.",
    sessionDetails: "Individual coaching and group-based technical sessions.",
    preparation: "Bring football boots or suitable training shoes, shin guards, comfortable clothing and water."
  },
  {
    id: 3, name: "Leila Jacobs", sport: "Tennis", location: "Johannesburg, Gauteng", level: "All levels", sessions: ["Individual", "Group"], focus: "Technique · Match play", experience: "8 years", price: 400,
    //Replace image
    image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85", alt: "Tennis court ready for a training session",
    bio: "Progressive coaching to develop sound technique and tactical awareness.",
    about: "Leila's sample profile combines technical practice with opportunities to apply skills in match-play situations. Training can be adapted to the player's current experience and learning goals.",
    approach: ["Develop repeatable stroke technique", "Connect technical practice to tactical choices", "Use match-play activities to apply learning"],
    suitableFor: "Players at different stages who want to improve technique, court awareness or match confidence.",
    sessionDetails: "Individual lessons and group practice sessions.",
    preparation: "Bring a racket, court-appropriate shoes, comfortable clothing and water."
  },
  {
    id: 4, name: "Sipho Ndlovu", sport: "Swimming", location: "Sandton, Gauteng", level: "Beginner", sessions: ["Individual"], focus: "Water confidence · Stroke technique", experience: "7 years", price: 450,
    //Replace image
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=85", alt: "Indoor swimming pool",
    bio: "Patient sessions for swimmers developing water confidence and efficient technique.",
    about: "Sipho's sample profile is intended for swimmers who are developing confidence and learning foundational movement in the water. Sessions are presented as gradual and focused on the swimmer's comfort and current ability.",
    approach: ["Work progressively at the swimmer's pace", "Build familiarity with basic water skills", "Introduce stroke technique in manageable stages"],
    suitableFor: "Beginner swimmers looking to develop water confidence and foundational stroke skills.",
    sessionDetails: "Individual sessions.",
    preparation: "Bring swimwear, a towel, goggles if preferred and any facility-required swim equipment. Confirm pool access and supervision arrangements before attending."
  },
  {
    id: 5, name: "Naledi Khumalo", sport: "Athletics", location: "Pretoria, Gauteng", level: "Advanced", sessions: ["Individual", "Online"], focus: "Sprint mechanics · Running technique", experience: "9 years", price: 500,
    //Replace image
    image: "https://images.unsplash.com/photo-1533561052604-c3beb6d55b8d?auto=format&fit=crop&w=1200&q=85", alt: "Athlete running on an athletics track",
    bio: "Technique-led coaching for athletes working on sprint mechanics and race preparation.",
    about: "Naledi's sample profile centres on sprint technique and structured running practice. The profile describes a technique-led approach that can be discussed in relation to an athlete's event and experience.",
    approach: ["Focus on efficient running technique", "Use purposeful drills and feedback", "Relate training activities to event-specific goals"],
    suitableFor: "Experienced athletes who want to refine sprint mechanics and prepare for competition.",
    sessionDetails: "Individual in-person sessions and online guidance.",
    preparation: "Bring running shoes, suitable training clothing and water. Share relevant event goals before the first session."
  },
  {
    id: 6, name: "Daniel Petersen", sport: "Basketball", location: "Centurion, Gauteng", level: "All levels", sessions: ["Group", "Online"], focus: "Team concepts · Shooting fundamentals", experience: "4 years", price: 280,
    //Replace image
    image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=85", alt: "Basketball court during training",
    bio: "Group and remote sessions covering spacing, shooting fundamentals and team decisions.",
    about: "Daniel's sample profile highlights group learning and accessible basketball concepts. Sessions are framed around understanding spacing, improving shooting fundamentals and recognising team options.",
    approach: ["Explain team concepts through practical examples", "Practise shooting fundamentals", "Encourage communication and shared decision-making"],
    suitableFor: "Players of different experience levels who want to develop shooting fundamentals and team understanding.",
    sessionDetails: "Group sessions and online coaching.",
    preparation: "Bring basketball shoes, comfortable training clothing and water. For online sessions, have a stable connection and a space to participate."
  },
  {
    id: 7, name: "Zanele Maseko", sport: "Football", location: "Johannesburg, Gauteng", level: "Intermediate", sessions: ["Individual", "Online"], focus: "Midfield development · Game awareness", experience: "6 years", price: 380,
    //Replace image
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=85", alt: "Football players training together",
    bio: "Sessions on scanning, decision-making and technical confidence in midfield roles.",
    about: "Zanele's sample profile focuses on midfield development and understanding what is happening around the player. Activities connect technical work with scanning, movement and decision-making.",
    approach: ["Practise scanning and awareness before receiving", "Develop passing choices and movement", "Use scenarios to explore midfield decisions"],
    suitableFor: "Intermediate players who want to improve midfield awareness, positioning and confidence in possession.",
    sessionDetails: "Individual sessions and online coaching.",
    preparation: "Bring football boots or suitable training shoes, shin guards, comfortable clothing and water."
  },
  {
    id: 8, name: "Mia van der Merwe", sport: "Tennis", location: "Pretoria, Gauteng", level: "Beginner", sessions: ["Individual", "Online"], focus: "Beginner development · Movement", experience: "5 years", price: 320,
    //Replace image
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85", alt: "Tennis player on an outdoor court",
    bio: "Foundational sessions introducing technique, court movement and confidence for new players.",
    about: "Mia's sample profile is designed for people starting tennis or returning to its fundamentals. The focus is on learning basic technique and becoming more comfortable moving around the court.",
    approach: ["Introduce fundamental strokes step by step", "Practise movement and court positioning", "Build confidence through achievable activities"],
    suitableFor: "Beginner players who want an introduction to tennis technique and court movement.",
    sessionDetails: "Individual lessons and online coaching.",
    preparation: "Bring a racket if available, court-appropriate shoes, comfortable clothing and water."
  }
];

   