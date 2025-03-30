
export const mockProducts = [
  {
    id: 1,
    name: "T-shirt Cosmique Noir",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000",
    lotteryName: "PlayStation 5",
    lotteryImage: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1000",
    colors: ["black", "white", "gray"],
    sizes: ["S", "M", "L", "XL"],
    description: "T-shirt en coton premium avec motif cosmique. Parfait pour les amateurs d'astronomie."
  },
  {
    id: 2,
    name: "T-shirt Galaxy Bleu",
    price: 32.99,
    image: "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=1000",
    lotteryName: "iPhone 15 Pro",
    lotteryImage: "https://images.unsplash.com/photo-1697403996161-4bdb1badf921?q=80&w=1000",
    colors: ["blue", "purple", "black"],
    sizes: ["S", "M", "L", "XL"],
    description: "T-shirt avec imprimé galaxie en bleu profond. Tissu ultra-doux et confortable."
  },
  {
    id: 3,
    name: "T-shirt Vintage Gaming",
    price: 27.99,
    image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?q=80&w=1000",
    lotteryName: "Vélo Mountain Bike",
    lotteryImage: "https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?q=80&w=1000",
    colors: ["gray", "black", "red"],
    sizes: ["S", "M", "L", "XL"],
    description: "T-shirt rétro avec design inspiré des jeux vidéo classiques. Pour les vrais gamers."
  },
  {
    id: 4,
    name: "T-shirt Tech Minimaliste",
    price: 25.99,
    image: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?q=80&w=1000",
    lotteryName: "Drone DJI",
    lotteryImage: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=1000", 
    colors: ["white", "black", "gray"],
    sizes: ["S", "M", "L", "XL"],
    description: "T-shirt épuré avec un design tech minimaliste. Idéal pour le quotidien."
  },
  {
    id: 5,
    name: "T-shirt Cosmic Elements",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?q=80&w=1000",
    lotteryName: "MacBook Air",
    lotteryImage: "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?q=80&w=1000",
    colors: ["purple", "blue", "black"],
    sizes: ["S", "M", "L", "XL"],
    description: "T-shirt premium avec éléments cosmiques. Coupe moderne et confortable."
  },
  {
    id: 6,
    name: "T-shirt Urban Style",
    price: 28.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000",
    lotteryName: "Montre Rolex",
    lotteryImage: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000",
    colors: ["black", "gray", "green"],
    sizes: ["S", "M", "L", "XL"],
    description: "T-shirt style urbain avec design contemporain. Parfait pour la ville."
  }
];

export const mockLotteries = [
  {
    id: 1,
    title: "PlayStation 5",
    image: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1000",
    value: 499.99,
    description: "Gagnez une PlayStation 5 édition standard avec manette DualSense et jeu au choix.",
    currentParticipants: 156,
    targetParticipants: 200,
    status: 'active' as const
  },
  {
    id: 2,
    title: "iPhone 15 Pro",
    image: "https://images.unsplash.com/photo-1697403996161-4bdb1badf921?q=80&w=1000",
    value: 999.99,
    description: "Le dernier iPhone 15 Pro avec 256 Go de stockage. Couleur au choix du gagnant.",
    currentParticipants: 320,
    targetParticipants: 400,
    status: 'active' as const
  },
  {
    id: 3,
    title: "Vélo Mountain Bike",
    image: "https://images.unsplash.com/photo-1593764592116-bfb2a97c642a?q=80&w=1000",
    value: 799.99,
    description: "Un vélo tout-terrain premium pour vos aventures en pleine nature.",
    currentParticipants: 120,
    targetParticipants: 180,
    status: 'active' as const
  },
  {
    id: 4,
    title: "Drone DJI",
    image: "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?q=80&w=1000",
    value: 649.99,
    description: "Drone DJI avec caméra 4K pour capturer vos plus beaux moments vue du ciel.",
    currentParticipants: 85,
    targetParticipants: 150,
    status: 'active' as const
  },
  {
    id: 5,
    title: "MacBook Air",
    image: "https://images.unsplash.com/photo-1537498425277-c283d32ef9db?q=80&w=1000",
    value: 1199.99,
    description: "Un MacBook Air ultra léger avec puce M2, parfait pour les créatifs.",
    currentParticipants: 210,
    targetParticipants: 250,
    status: 'active' as const
  },
  {
    id: 6,
    title: "Montre Rolex",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000",
    value: 7999.99,
    description: "Une montre Rolex Submariner, le summum de l'élégance et de la précision.",
    currentParticipants: 450,
    targetParticipants: 500,
    status: 'active' as const
  },
  {
    id: 7,
    title: "Voyage à Bali",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000",
    value: 2999.99,
    description: "Un voyage de rêve pour 2 personnes à Bali, tout inclus pendant 7 jours.",
    currentParticipants: 380,
    targetParticipants: 400,
    status: 'completed' as const
  },
  {
    id: 8,
    title: "Console Xbox Series X",
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?q=80&w=1000",
    value: 499.99,
    description: "La puissante Xbox Series X avec manette sans fil et abonnement Game Pass.",
    currentParticipants: 90,
    targetParticipants: 250,
    status: 'relaunched' as const
  }
];

export const mockParticipations = [
  {
    id: 1,
    userId: 1,
    productId: 3,
    lotteryId: 1,
    ticketNumber: "PS5-12345",
    date: "2023-10-15"
  },
  {
    id: 2,
    userId: 1,
    productId: 4,
    lotteryId: 5,
    ticketNumber: "MBA-54321",
    date: "2023-11-02"
  },
  {
    id: 3,
    userId: 1,
    productId: 2,
    lotteryId: 2,
    ticketNumber: "IP15-78901",
    date: "2023-11-15"
  }
];
