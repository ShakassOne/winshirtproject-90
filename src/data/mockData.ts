
import { ExtendedProduct } from '@/types/product';
import { Visual } from '@/types/visual';
import { Client } from '@/types/client';
import { Order } from '@/types/order';

/**
 * Mock data for lotteries
 */
export const getMockLotteries = () => {
  return [
    {
      id: 1,
      title: "T-shirt imprimé personnalisé",
      description: "Gagnez un t-shirt unique, conçu par vous-même.",
      image: "/img/products/tshirt-print.jpg",
      endDate: "2024-08-15T23:59:59",
      ticketPrice: 5,
      totalParticipants: 500,
      currentParticipants: 125,
      current_participants: 125, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 1,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 2,
      title: "Sweat à capuche personnalisé",
      description: "Portez votre propre design sur un sweat à capuche de qualité.",
      image: "/img/products/hoodie-print.jpg",
      endDate: "2024-09-20T23:59:59",
      ticketPrice: 8,
      totalParticipants: 300,
      currentParticipants: 75,
      current_participants: 75, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 2,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 3,
      title: "Mug personnalisé",
      description: "Savourez votre café dans un mug unique, créé par vous.",
      image: "/img/products/mug-print.jpg",
      endDate: "2024-07-10T23:59:59",
      ticketPrice: 3,
      totalParticipants: 1000,
      currentParticipants: 350,
      current_participants: 350, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 3,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 4,
      title: "Coque de téléphone personnalisée",
      description: "Protégez votre téléphone avec une coque designée par vos soins.",
      image: "/img/products/phone-case-print.jpg",
      endDate: "2024-08-01T23:59:59",
      ticketPrice: 6,
      totalParticipants: 400,
      currentParticipants: 100,
      current_participants: 100, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 4,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 5,
      title: "Poster personnalisé",
      description: "Décorez votre intérieur avec un poster unique, créé par vous.",
      image: "/img/products/poster-print.jpg",
      endDate: "2024-09-05T23:59:59",
      ticketPrice: 4,
      totalParticipants: 600,
      currentParticipants: 200,
      current_participants: 200, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 5,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 6,
      title: "Casquette personnalisée",
      description: "Affichez votre style avec une casquette designée par vous-même.",
      image: "/img/products/cap-print.jpg",
      endDate: "2024-07-20T23:59:59",
      ticketPrice: 7,
      totalParticipants: 250,
      currentParticipants: 60,
      current_participants: 60, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 6,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 7,
      title: "Sac à dos personnalisé",
      description: "Transportez vos affaires avec un sac à dos unique, créé par vous.",
      image: "/img/products/backpack-print.jpg",
      endDate: "2024-08-25T23:59:59",
      ticketPrice: 9,
      totalParticipants: 350,
      currentParticipants: 90,
      current_participants: 90, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 7,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 8,
      title: "Tote bag personnalisé",
      description: "Faites vos courses avec un tote bag unique, designé par vous-même.",
      image: "/img/products/tote-bag-print.jpg",
      endDate: "2024-09-10T23:59:59",
      ticketPrice: 4,
      totalParticipants: 700,
      currentParticipants: 250,
      current_participants: 250, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 8,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 9,
      title: "Bouteille d'eau personnalisée",
      description: "Hydratez-vous avec une bouteille unique, créée par vous-même.",
      image: "/img/products/water-bottle-print.jpg",
      endDate: "2024-07-05T23:59:59",
      ticketPrice: 6,
      totalParticipants: 550,
      currentParticipants: 180,
      current_participants: 180, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 9,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
    {
      id: 10,
      title: "Carnet personnalisé",
      description: "Notez vos idées dans un carnet unique, designé par vous-même.",
      image: "/img/products/notebook-print.jpg",
      endDate: "2024-08-10T23:59:59",
      ticketPrice: 5,
      totalParticipants: 450,
      currentParticipants: 110,
      current_participants: 110, // For backward compatibility
      winningNumber: null,
      status: "active",
      productId: 10,
      createdAt: "2024-05-01T10:00:00",
      updatedAt: "2024-05-01T10:00:00",
    },
  ];
};

// Export a constant for backward compatibility
export const mockLotteries = getMockLotteries();

/**
 * Get a lottery by its ID
 * @param id The ID of the lottery to retrieve
 * @returns The lottery object if found, undefined otherwise
 */
export const getLotteryById = (id: number) => {
  try {
    // First, try to get from localStorage
    const lotteriesStr = localStorage.getItem('lotteries');
    if (lotteriesStr) {
      const lotteries = JSON.parse(lotteriesStr);
      const lottery = lotteries.find((l: any) => l.id === id);
      if (lottery) return lottery;
    }
    
    // If not found in localStorage, check mock data (fallback)
    const mockLotteries = getMockLotteries();
    return mockLotteries.find(lottery => lottery.id === id);
  } catch (error) {
    console.error(`Error getting lottery with ID ${id}:`, error);
    return undefined;
  }
};

/**
 * Initialize lottery data if it doesn't exist in localStorage
 */
export const initializeLotteryData = () => {
  try {
    const lotteriesData = localStorage.getItem('lotteries');
    if (!lotteriesData) {
      localStorage.setItem('lotteries', JSON.stringify(getMockLotteries()));
      console.log('Initialized lottery data in localStorage');
    }
  } catch (error) {
    console.error('Error initializing lottery data:', error);
  }
};

/**
 * Mock data for products
 */
export const getMockProducts = (): ExtendedProduct[] => {
  const products = [
    {
      id: 1,
      name: "T-shirt imprimé personnalisé",
      description: "Créez votre propre t-shirt personnalisé avec notre outil de design facile à utiliser. Ajoutez du texte, des images et des logos pour un look unique.",
      price: 25.00,
      image: "/img/products/tshirt-print.jpg",
      secondaryImage: "/img/products/tshirt-print-2.jpg",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["blanc", "noir", "gris", "bleu", "rouge"],
      type: "standard",
      productType: "T-shirts",
      sleeveType: "courtes",
      linkedLotteries: [1],
      lotteryName: "T-shirt imprimé personnalisé",
      lotteryImage: "/img/products/tshirt-print.jpg",
      popularity: 95,
      tickets: 3,
      deliveryInfo: {
        weight: 150,
        dimensions: { length: 25, width: 20, height: 3 },
        handlingTime: 2,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 4.99,
      weight: 150,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "homme",
      material: "coton",
      fit: "regular",
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Recto",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
        {
          id: 2,
          name: "Verso",
          position: "back" as "back",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 2,
      name: "Sweat à capuche personnalisé",
      description: "Restez au chaud et stylé avec notre sweat à capuche personnalisé. Choisissez votre couleur, ajoutez votre design et créez un sweat à capuche unique.",
      price: 45.00,
      image: "/img/products/hoodie-print.jpg",
      secondaryImage: "/img/products/hoodie-print-2.jpg",
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["noir", "gris", "bleu marine", "bordeaux"],
      type: "premium",
      productType: "Sweatshirt",
      sleeveType: "longues",
      linkedLotteries: [2],
      lotteryName: "Sweat à capuche personnalisé",
      lotteryImage: "/img/products/hoodie-print.jpg",
      popularity: 88,
      tickets: 5,
      deliveryInfo: {
        weight: 400,
        dimensions: { length: 30, width: 25, height: 6 },
        handlingTime: 3,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 6.99,
      weight: 400,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "coton bio",
      fit: "regular",
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Recto",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
        {
          id: 2,
          name: "Verso",
          position: "back" as "back",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
        {
          id: 3,
          name: "Manche gauche",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
        {
          id: 4,
          name: "Manche droite",
          position: "back" as "back",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 3,
      name: "Mug personnalisé",
      description: "Commencez votre journée avec un mug personnalisé. Ajoutez votre photo, votre texte ou votre logo pour un mug unique.",
      price: 15.00,
      image: "/img/products/mug-print.jpg",
      secondaryImage: "/img/products/mug-print-2.jpg",
      sizes: ["unique"],
      colors: ["blanc"],
      type: "standard",
      productType: "Mugs",
      sleeveType: null,
      linkedLotteries: [3],
      lotteryName: "Mug personnalisé",
      lotteryImage: "/img/products/mug-print.jpg",
      popularity: 75,
      tickets: 2,
      deliveryInfo: {
        weight: 300,
        dimensions: { length: 12, width: 9, height: 10 },
        handlingTime: 1,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 3.99,
      weight: 300,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "céramique",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 4,
      name: "Coque de téléphone personnalisée",
      description: "Protégez votre téléphone avec style grâce à notre coque personnalisée. Téléchargez votre image et créez une coque unique.",
      price: 20.00,
      image: "/img/products/phone-case-print.jpg",
      secondaryImage: "/img/products/phone-case-print-2.jpg",
      sizes: ["iPhone", "Samsung", "Huawei"],
      colors: ["transparent", "noir", "blanc"],
      type: "standard",
      productType: "Phone Cases",
      sleeveType: null,
      linkedLotteries: [4],
      lotteryName: "Coque de téléphone personnalisée",
      lotteryImage: "/img/products/phone-case-print.jpg",
      popularity: 82,
      tickets: 3,
      deliveryInfo: {
        weight: 50,
        dimensions: { length: 15, width: 8, height: 2 },
        handlingTime: 2,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 2.99,
      weight: 50,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "plastique",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 5,
      name: "Poster personnalisé",
      description: "Décorez votre maison avec un poster personnalisé. Téléchargez votre photo et créez un poster unique.",
      price: 30.00,
      image: "/img/products/poster-print.jpg",
      secondaryImage: "/img/products/poster-print-2.jpg",
      sizes: ["A4", "A3", "A2", "A1"],
      colors: ["unique"],
      type: "premium",
      productType: "Posters",
      sleeveType: null,
      linkedLotteries: [5],
      lotteryName: "Poster personnalisé",
      lotteryImage: "/img/products/poster-print.jpg",
      popularity: 68,
      tickets: 4,
      deliveryInfo: {
        weight: 200,
        dimensions: { length: 30, width: 21, height: 1 },
        handlingTime: 3,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 5.99,
      weight: 200,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "papier",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 6,
      name: "Casquette personnalisée",
      description: "Affichez votre style avec une casquette personnalisée. Ajoutez votre texte, votre logo ou votre image pour une casquette unique.",
      price: 22.00,
      image: "/img/products/cap-print.jpg",
      secondaryImage: "/img/products/cap-print-2.jpg",
      sizes: ["unique"],
      colors: ["noir", "blanc", "bleu", "rouge"],
      type: "standard",
      productType: "Caps",
      sleeveType: null,
      linkedLotteries: [6],
      lotteryName: "Casquette personnalisée",
      lotteryImage: "/img/products/cap-print.jpg",
      popularity: 78,
      tickets: 3,
      deliveryInfo: {
        weight: 80,
        dimensions: { length: 20, width: 15, height: 8 },
        handlingTime: 2,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 3.49,
      weight: 80,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "coton",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 7,
      name: "Sac à dos personnalisé",
      description: "Créez votre propre sac à dos personnalisé avec notre outil de design facile à utiliser. Ajoutez du texte, des images et des logos pour un look unique.",
      price: 55.00,
      image: "/img/products/backpack-print.jpg",
      secondaryImage: "/img/products/backpack-print-2.jpg",
      sizes: ["unique"],
      colors: ["noir", "bleu", "rouge", "vert"],
      type: "premium",
      productType: "Backpacks",
      sleeveType: null,
      linkedLotteries: [7],
      lotteryName: "Sac à dos personnalisé",
      lotteryImage: "/img/products/backpack-print.jpg",
      popularity: 70,
      tickets: 5,
      deliveryInfo: {
        weight: 600,
        dimensions: { length: 40, width: 30, height: 12 },
        handlingTime: 3,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 7.99,
      weight: 600,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "polyester",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 8,
      name: "Tote bag personnalisé",
      description: "Faites vos courses avec style grâce à notre tote bag personnalisé. Ajoutez votre design et créez un tote bag unique.",
      price: 18.00,
      image: "/img/products/tote-bag-print.jpg",
      secondaryImage: "/img/products/tote-bag-print-2.jpg",
      sizes: ["unique"],
      colors: ["naturel", "noir", "blanc"],
      type: "standard",
      productType: "Tote Bags",
      sleeveType: null,
      linkedLotteries: [8],
      lotteryName: "Tote bag personnalisé",
      lotteryImage: "/img/products/tote-bag-print.jpg",
      popularity: 85,
      tickets: 2,
      deliveryInfo: {
        weight: 120,
        dimensions: { length: 35, width: 30, height: 2 },
        handlingTime: 1,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 2.49,
      weight: 120,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "femme",
      material: "coton",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 9,
      name: "Bouteille d'eau personnalisée",
      description: "Hydratez-vous avec une bouteille d'eau personnalisée. Ajoutez votre nom, votre logo ou votre image pour une bouteille unique.",
      price: 28.00,
      image: "/img/products/water-bottle-print.jpg",
      secondaryImage: "/img/products/water-bottle-print-2.jpg",
      sizes: ["unique"],
      colors: ["argent", "noir", "bleu", "rose"],
      type: "standard",
      productType: "Water Bottles",
      sleeveType: null,
      linkedLotteries: [9],
      lotteryName: "Bouteille d'eau personnalisée",
      lotteryImage: "/img/products/water-bottle-print.jpg",
      popularity: 73,
      tickets: 3,
      deliveryInfo: {
        weight: 250,
        dimensions: { length: 25, width: 8, height: 8 },
        handlingTime: 2,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 4.49,
      weight: 250,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "acier inoxydable",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
    {
      id: 10,
      name: "Carnet personnalisé",
      description: "Notez vos pensées et idées dans un carnet personnalisé. Ajoutez votre nom, votre logo ou votre image pour un carnet unique.",
      price: 12.00,
      image: "/img/products/notebook-print.jpg",
      secondaryImage: "/img/products/notebook-print-2.jpg",
      sizes: ["A5", "A6"],
      colors: ["noir", "naturel", "bleu", "rouge"],
      type: "standard",
      productType: "Notebooks",
      sleeveType: null,
      linkedLotteries: [10],
      lotteryName: "Carnet personnalisé",
      lotteryImage: "/img/products/notebook-print.jpg",
      popularity: 80,
      tickets: 2,
      deliveryInfo: {
        weight: 180,
        dimensions: { length: 21, width: 15, height: 2 },
        handlingTime: 1,
        freeShipping: false,
        shippingRestrictions: [],
      },
      deliveryPrice: 1.99,
      weight: 180,
      allowCustomization: true,
      defaultVisualId: null,
      defaultVisualSettings: null,
      visualCategoryId: 1,
      gender: "unisexe",
      material: "papier",
      fit: null,
      brand: "Winshirt",
      participants: [],
      printAreas: [
        {
          id: 1,
          name: "Zone d'impression",
          position: "front" as "front",
          format: "custom",
          bounds: { x: 10, y: 10, width: 80, height: 80 },
          allowCustomPosition: true,
        },
      ],
    },
  ];

  // Make sure all products have a participants array
  return products.map(product => ({
    ...product,
    participants: product.participants || []
  }));
};

// Export a constant for backward compatibility
export const mockProducts = getMockProducts();

/**
 * Get a visual by its ID
 * @param id The ID of the visual to retrieve
 * @returns The visual object if found, undefined otherwise
 */
export const getVisualById = (id: number) => {
  try {
    // First, try to get from localStorage
    const visualsStr = localStorage.getItem('visuals');
    if (visualsStr) {
      const visuals = JSON.parse(visualsStr);
      const visual = visuals.find((v: any) => v.id === id);
      if (visual) return visual;
    }
    
    // If not found in localStorage, check mock data (fallback)
    const mockVisuals = getMockVisuals();
    return mockVisuals.find(visual => visual.id === id);
  } catch (error) {
    console.error(`Error getting visual with ID ${id}:`, error);
    return undefined;
  }
};

/**
 * Mock data for visuals - Updated to use categoryId and categoryName instead of category
 */
export const getMockVisuals = (): Visual[] => {
  return [
    {
      id: 1,
      name: "Flammes",
      image: "/img/visuals/flames.png",
      categoryId: 4, // "Abstrait" category
      categoryName: "Abstrait",
      tags: ["feu", "chaud", "abstrait"],
    },
    {
      id: 2,
      name: "Etoiles",
      image: "/img/visuals/stars.png",
      categoryId: 2, // "Espace" category
      categoryName: "Espace",
      tags: ["nuit", "ciel", "galaxie"],
    },
    {
      id: 3,
      name: "Vagues",
      image: "/img/visuals/waves.png",
      categoryId: 3, // "Nature" category
      categoryName: "Nature",
      tags: ["mer", "océan", "bleu"],
    },
    {
      id: 4,
      name: "Coeurs",
      image: "/img/visuals/hearts.png",
      categoryId: 5, // "Amour" category
      categoryName: "Amour",
      tags: ["saint valentin", "romantique", "rouge"],
    },
    {
      id: 5,
      name: "Fleurs",
      image: "/img/visuals/flowers.png",
      categoryId: 3, // "Nature" category
      categoryName: "Nature",
      tags: ["printemps", "floral", "couleurs"],
    },
    {
      id: 6,
      name: "Animaux",
      image: "/img/visuals/animals.png",
      categoryId: 2, // "Animaux" category
      categoryName: "Animaux",
      tags: ["faune", "mignon", "sauvage"],
    },
    {
      id: 7,
      name: "Technologie",
      image: "/img/visuals/technology.png",
      categoryId: 6, // "Technologie" category
      categoryName: "Technologie",
      tags: ["futuriste", "électronique", "innovation"],
    },
    {
      id: 8,
      name: "Musique",
      image: "/img/visuals/music.png",
      categoryId: 2, // "Musique" category
      categoryName: "Musique",
      tags: ["notes", "instruments", "mélodie"],
    },
    {
      id: 9,
      name: "Voyage",
      image: "/img/visuals/travel.png",
      categoryId: 7, // "Voyage" category
      categoryName: "Voyage",
      tags: ["aventure", "monde", "exploration"],
    },
    {
      id: 10,
      name: "Nourriture",
      image: "/img/visuals/food.png",
      categoryId: 8, // "Nourriture" category
      categoryName: "Nourriture",
      tags: ["cuisine", "gastronomie", "délicieux"],
    }
  ];
};

/**
 * Export a constant for backwards compatibility
 */
export const mockVisuals = getMockVisuals();
