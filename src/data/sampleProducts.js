// Sample product data for testing
export const sampleProducts = [
  {
    id: "prod1",
    name: "Premium Running Shoes",
    category: "Running",
    description: "High-quality running shoes with advanced cushioning and breathable mesh upper.",
    sellingPrice: 2999,
    purchasePrice: 1800,
    gstPercentage: 12,
    stockQuantity: 25,
    brand: "SportMax",
    model: "RunPro X1",
    color: "Black/Red",
    size: "8-12",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        alt: "Premium Running Shoes"
      }
    ],
    specifications: {
      material: "Mesh and Synthetic",
      sole: "Rubber",
      weight: "280g",
      type: "Running Shoes"
    },
    isActive: true
  },
  {
    id: "prod2",
    name: "Yoga Mat Premium",
    category: "Yoga",
    description: "Non-slip premium yoga mat with excellent grip and cushioning for all yoga practices.",
    sellingPrice: 1499,
    purchasePrice: 800,
    gstPercentage: 18,
    stockQuantity: 40,
    brand: "ZenFit",
    model: "YogaPro Mat",
    color: "Purple",
    size: "6mm Thick",
    images: [
      {
        url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        alt: "Yoga Mat Premium"
      }
    ],
    specifications: {
      material: "TPE (Thermoplastic Elastomer)",
      dimensions: "183cm x 61cm x 6mm",
      weight: "900g",
      type: "Exercise Mat"
    },
    isActive: true
  },
  {
    id: "prod3",
    name: "Professional Cricket Bat",
    category: "Team Sports",
    description: "Grade 1 English willow cricket bat, handcrafted for professional players.",
    sellingPrice: 5999,
    purchasePrice: 3500,
    gstPercentage: 12,
    stockQuantity: 15,
    brand: "CricketKing",
    model: "Pro Elite",
    color: "Natural Wood",
    size: "Short Handle",
    images: [
      {
        url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        alt: "Professional Cricket Bat"
      }
    ],
    specifications: {
      material: "Grade 1 English Willow",
      weight: "1.2kg",
      handle: "Cane Handle",
      type: "Cricket Bat"
    },
    isActive: true
  },
  {
    id: "prod4",
    name: "Gym Dumbbells Set",
    category: "Fitness",
    description: "Adjustable dumbbell set with rubber coating, perfect for home gym workouts.",
    sellingPrice: 3499,
    purchasePrice: 2000,
    gstPercentage: 18,
    stockQuantity: 20,
    brand: "FitStrong",
    model: "AdjustPro",
    color: "Black/Silver",
    size: "10kg x 2",
    images: [
      {
        url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        alt: "Gym Dumbbells Set"
      }
    ],
    specifications: {
      material: "Cast Iron with Rubber Coating",
      weight: "10kg each",
      adjustable: "Yes",
      type: "Dumbbells"
    },
    isActive: true
  },
  {
    id: "prod5",
    name: "Swimming Goggles Pro",
    category: "Swimming",
    description: "Anti-fog swimming goggles with UV protection and comfortable silicone seal.",
    sellingPrice: 899,
    purchasePrice: 400,
    gstPercentage: 18,
    stockQuantity: 50,
    brand: "AquaVision",
    model: "SwimPro X2",
    color: "Blue",
    size: "Adult",
    images: [
      {
        url: "https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        alt: "Swimming Goggles Pro"
      }
    ],
    specifications: {
      material: "Silicone and Polycarbonate",
      features: "Anti-fog, UV Protection",
      lens: "Clear",
      type: "Swimming Goggles"
    },
    isActive: true
  },
  {
    id: "prod6",
    name: "Cycling Helmet Safety",
    category: "Cycling",
    description: "Lightweight cycling helmet with excellent ventilation and safety certification.",
    sellingPrice: 1999,
    purchasePrice: 1100,
    gstPercentage: 18,
    stockQuantity: 30,
    brand: "CycleSafe",
    model: "VentMax Pro",
    color: "Red/White",
    size: "M (54-58cm)",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        alt: "Cycling Helmet Safety"
      }
    ],
    specifications: {
      material: "EPS Foam with PC Shell",
      weight: "250g",
      certification: "CE Certified",
      type: "Cycling Helmet"
    },
    isActive: true
  }
];

// Helper function to add sample products to localStorage for testing
export const addSampleProductsToLocalStorage = () => {
  // This simulates having products from the admin system
  localStorage.setItem('sample-products', JSON.stringify(sampleProducts));
  console.log('🛍️ Sample products added to localStorage for testing');
};

// Helper function to get sample products
export const getSampleProducts = () => {
  try {
    const stored = localStorage.getItem('sample-products');
    return stored ? JSON.parse(stored) : sampleProducts;
  } catch (error) {
    console.error('Error getting sample products:', error);
    return sampleProducts;
  }
};