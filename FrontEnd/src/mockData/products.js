// Mock product data for development environment
export const mockProducts = [
  {
    id: "prod001",
    name: "Eco-Friendly Electric Car",
    category: "Cars",
    owner: "user123",
    originalPrice: 35000,
    specifications: "Zero-emission electric vehicle with 300-mile range, solar roof panels, and recycled interior materials.",
    environmentalScore: 9.2,
    environmentalImpactAssessed: true,
    price: 32000,
    ratingsAverage: 4.8,
    ratingsQuantity: 124,
    reportsNumber: 2,
    noReportsNumber: 120,
    soldNum: 45,
    onSale: true,
    onsaleDuration: 30,
    stockQuantity: 15,
    harmfultoenv: false,
    images: [
      "https://placehold.co/600x400/green/white?text=Electric+Car+1",
      "https://placehold.co/600x400/green/white?text=Electric+Car+2"
    ],
    imageCover: "/ElectricCar.png"
  },
  {
    id: "prod002",
    name: "Organic Cotton T-Shirt",
    category: "Clothes",
    owner: "user456",
    originalPrice: 35,
    specifications: "100% organic cotton, sustainably harvested and processed without harmful chemicals. Fair trade certified.",
    environmentalScore: 8.5,
    environmentalImpactAssessed: true,
    price: 29.99,
    ratingsAverage: 4.5,
    ratingsQuantity: 89,
    reportsNumber: 1,
    noReportsNumber: 85,
    soldNum: 230,
    onSale: false,
    onsaleDuration: undefined,
    stockQuantity: 150,
    harmfultoenv: false,
    images: [
      "https://placehold.co/600x400/blue/white?text=Organic+Shirt+1",
      "https://placehold.co/600x400/blue/white?text=Organic+Shirt+2"
    ],
    imageCover: "/Tshirt.jpg"
  },
  {
    id: "prod003",
    name: "Energy-Efficient Smart Refrigerator",
    category: "Electronics",
    owner: "user789",
    originalPrice: 1200,
    specifications: "A++ energy rating, smart temperature control, made with recyclable materials and eco-friendly refrigerants.",
    environmentalScore: 7.8,
    environmentalImpactAssessed: true,
    price: 999.99,
    ratingsAverage: 4.2,
    ratingsQuantity: 56,
    reportsNumber: 3,
    noReportsNumber: 50,
    soldNum: 25,
    onSale: true,
    onsaleDuration: 15,
    stockQuantity: 10,
    harmfultoenv: false,
    images: [
      "https://placehold.co/600x400/gray/white?text=Smart+Fridge+1",
      "https://placehold.co/600x400/gray/white?text=Smart+Fridge+2"
    ],
    imageCover: "/SmartRefrigrator.jpg"
  },
  {
    id: "prod004",
    name: "Organic Quinoa Pack",
    category: "Food",
    owner: "user101",
    originalPrice: 8.99,
    specifications: "Organically grown quinoa, sustainably harvested, packaged in biodegradable materials. High in protein and nutrients.",
    environmentalScore: 9.5,
    environmentalImpactAssessed: true,
    price: 7.49,
    ratingsAverage: 4.9,
    ratingsQuantity: 112,
    reportsNumber: 0,
    noReportsNumber: 110,
    soldNum: 500,
    onSale: false,
    onsaleDuration: undefined,
    stockQuantity: 200,
    harmfultoenv: false,
    images: [
      "https://placehold.co/600x400/brown/white?text=Quinoa+1",
      "https://placehold.co/600x400/brown/white?text=Quinoa+2"
    ],
    imageCover: "/Quinoa.webp"
  },
  {
    id: "prod005",
    name: "Recycled Plastic Sunglasses",
    category: "Clothes",
    owner: "user202",
    originalPrice: 65,
    specifications: "Frames made from 100% recycled ocean plastic, UV protection lenses, comes with bamboo case.",
    environmentalScore: 8.7,
    environmentalImpactAssessed: true,
    price: 59.99,
    ratingsAverage: 4.6,
    ratingsQuantity: 78,
    reportsNumber: 1,
    noReportsNumber: 75,
    soldNum: 120,
    onSale: true,
    onsaleDuration: 10,
    stockQuantity: 45,
    harmfultoenv: false,
    images: [
      "https://placehold.co/600x400/orange/white?text=Sunglasses+1",
      "https://placehold.co/600x400/orange/white?text=Sunglasses+2"
    ],
    imageCover: "/RecycledSunglasses.jpg"
  }
];

// Helper functions remain the same
export const getAllProducts = () => {
  return {
    status: "success",
    results: mockProducts.length,
    data: {
      data: mockProducts
    }
  };
};

// Helper function to get products by category
export const getProductsByCategory = (category) => {
  const filteredProducts = mockProducts.filter(product => product.category === category);
  return {
    status: "success",
    results: filteredProducts.length,
    data: {
      data: filteredProducts
    }
  };
};

// Helper function to get products on sale
export const getProductsOnSale = () => {
  const filteredProducts = mockProducts.filter(product => product.onSale === true);
  return {
    status: "success",
    results: filteredProducts.length,
    data: {
      data: filteredProducts
    }
  };
};

// Helper function to get a product by ID
export const getProductById = (id) => {
  const product = mockProducts.find(product => product.id === id);
  if (!product) {
    return {
      status: "fail",
      message: "No product found with that ID"
    };
  }
  return {
    status: "success",
    data: {
      data: product
    }
  };
};