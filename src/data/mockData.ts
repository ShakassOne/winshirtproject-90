
// Add this code if the mockData.ts file doesn't exist or append to it

// If you already have a mockLotteries export, replace it with this one
export const mockLotteries = [
  {
    id: 1,
    title: "Grand Tirage Été",
    description: "Gagnez des produits exclusifs avec ce tirage au sort estival !",
    value: 250,
    image: "https://placehold.co/600x400/555/fff?text=Lottery+1",
    targetParticipants: 50, // Changed from target_participants to match ExtendedLottery type
    currentParticipants: 12, // Changed from current_participants to match ExtendedLottery type
    target_participants: 50, // Keep for backward compatibility
    current_participants: 12, // Keep for backward compatibility
    status: "active",
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    draw_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days from now
    featured: true,
    linked_products: [1, 2]
  },
  {
    id: 2,
    title: "Tirage Spécial",
    description: "Une chance unique de gagner des articles rares et exclusifs !",
    value: 500,
    image: "https://placehold.co/600x400/444/fff?text=Lottery+2",
    targetParticipants: 100, // Changed
    currentParticipants: 35, // Changed
    target_participants: 100, // Keep for backward compatibility
    current_participants: 35, // Keep for backward compatibility
    status: "active",
    end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
    draw_date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(), // 50 days from now
    featured: true,
    linked_products: [1, 3]
  },
  {
    id: 3,
    title: "Tirage Hiver",
    description: "Participez pour tenter de gagner notre collection hiver !",
    value: 350,
    image: "https://placehold.co/600x400/333/fff?text=Lottery+3",
    targetParticipants: 75, // Changed
    currentParticipants: 20, // Changed
    target_participants: 75, // Keep for backward compatibility
    current_participants: 20, // Keep for backward compatibility
    status: "upcoming",
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    draw_date: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000).toISOString(), // 65 days from now
    featured: false,
    linked_products: [2, 4]
  }
];

// Add mock products export with 'type' property added
export const mockProducts = [
  {
    id: 1,
    name: "T-Shirt 3D",
    description: "Un t-shirt moderne avec un design en 3D unique.",
    price: 29.99,
    image: "https://placehold.co/600x400/555/fff?text=T-Shirt+3D",
    secondaryImage: "https://placehold.co/600x400/333/fff?text=T-Shirt+3D+Back",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Noir", "Blanc", "Rouge"],
    type: "standard", // Ajout de la propriété manquante
    productType: "T-Shirt",
    sleeveType: "Courtes",
    gender: "unisex",
    material: "Coton, Polyester",
    fit: "Regular",
    brand: "WinShirt",
    allowCustomization: true,
    tickets: 3,
    linkedLotteries: [1, 2],
    printAreas: [
      {
        id: Date.now(),
        name: "Recto",
        position: "front",
        format: "custom",
        bounds: {
          x: 100,
          y: 100,
          width: 200,
          height: 250
        },
        allowCustomPosition: true
      },
      {
        id: Date.now() + 1,
        name: "Verso",
        position: "back",
        format: "custom",
        bounds: {
          x: 100,
          y: 100,
          width: 200,
          height: 250
        },
        allowCustomPosition: true
      }
    ]
  },
  {
    id: 2,
    name: "Sweatshirt Premium",
    description: "Un sweatshirt confortable et chaud pour l'hiver.",
    price: 49.99,
    image: "https://placehold.co/600x400/444/fff?text=Sweatshirt",
    secondaryImage: "https://placehold.co/600x400/222/fff?text=Sweatshirt+Back",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Bleu", "Gris", "Noir"],
    type: "premium", // Ajout de la propriété manquante
    productType: "Sweatshirt",
    sleeveType: "Longues",
    popularity: 4,
    tickets: 1,
    linkedLotteries: [1, 3]
  }
];

// Make sure mock products are linked to lotteries
export const updateMockProducts = () => {
  try {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      let products = JSON.parse(storedProducts);
      
      // Make sure the T-Shirt 3D (ID: 1) is linked to lotteries
      const tshirtIndex = products.findIndex((p: any) => p.name === "T-Shirt 3D" || p.id === 1);
      if (tshirtIndex !== -1) {
        products[tshirtIndex].linkedLotteries = [1, 2]; // Link to the first two lotteries
        products[tshirtIndex].allowCustomization = true;
        products[tshirtIndex].tickets = 3; // Give it 3 tickets
        products[tshirtIndex].type = "standard"; // Ajouter aussi la propriété type
        
        if (!products[tshirtIndex].printAreas || products[tshirtIndex].printAreas.length === 0) {
          products[tshirtIndex].printAreas = [
            {
              id: Date.now(),
              name: "Recto",
              position: "front",
              format: "custom",
              bounds: {
                x: 100,
                y: 100,
                width: 200,
                height: 250
              },
              allowCustomPosition: true
            },
            {
              id: Date.now() + 1,
              name: "Verso",
              position: "back",
              format: "custom",
              bounds: {
                x: 100,
                y: 100,
                width: 200,
                height: 250
              },
              allowCustomPosition: true
            }
          ];
        }
      }
      
      localStorage.setItem('products', JSON.stringify(products));
      console.log('Products updated with lottery links and print areas');
      return products;
    }
  } catch (error) {
    console.error('Error updating mock products:', error);
  }
  return null;
};

// Initialize lottery data in localStorage
export const initializeLotteryData = () => {
  try {
    // Check if lotteries already exist in localStorage
    const storedLotteries = localStorage.getItem('lotteries');
    if (!storedLotteries || JSON.parse(storedLotteries).length === 0) {
      // If not, store the mock lotteries
      localStorage.setItem('lotteries', JSON.stringify(mockLotteries));
      console.log('Mock lotteries initialized in localStorage');
      
      // Update mock products to link to lotteries
      updateMockProducts();
    }
    
    // Assurons-nous que les produits ont également la propriété 'type'
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      let products = JSON.parse(storedProducts);
      let updated = false;
      
      products.forEach((product: any) => {
        if (!product.type) {
          product.type = product.productType === "Sweatshirt" ? "premium" : "standard";
          updated = true;
        }
      });
      
      if (updated) {
        localStorage.setItem('products', JSON.stringify(products));
        console.log('Products updated with type property');
      }
    } else {
      // Stockons nos mockProducts si aucun produit n'existe
      localStorage.setItem('products', JSON.stringify(mockProducts));
      console.log('Mock products initialized in localStorage');
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};
