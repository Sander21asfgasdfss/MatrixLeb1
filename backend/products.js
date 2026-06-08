const products = [
  {
    id: 1,
    name: "iPhone 16 Pro Max",
    brand: "Apple",
    price: 1199.99,
    originalPrice: 1299.99,
    image: "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-1.jpg",
    description: "The most powerful iPhone ever. A18 Pro chip, 48MP Fusion camera system, and all-day battery life.",
    specs: { Chip: "A18 Pro", Display: "6.9\" Super Retina XDR", Camera: "48MP Fusion + 48MP Ultra Wide + 12MP Telephoto", Battery: "Up to 33 hours video playback", Storage: "256GB" },
    rating: 4.8,
    reviews: 3421,
    badge: "Best Seller"
  },
  {
    id: 2,
    name: "Samsung Galaxy S25 Ultra",
    brand: "Samsung",
    price: 1099.99,
    originalPrice: 1199.99,
    image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s25-ultra-sm-s938-1.jpg",
    description: "Built with premium titanium, Galaxy AI, and a 200MP camera. The ultimate Galaxy experience.",
    specs: { Chip: "Snapdragon 8 Elite", Display: "6.9\" Dynamic AMOLED 2X", Camera: "200MP + 50MP + 12MP + 10MP", Battery: "5000mAh", Storage: "256GB" },
    rating: 4.7,
    reviews: 2894,
    badge: "New"
  },
  {
    id: 3,
    name: "Google Pixel 9 Pro",
    brand: "Google",
    price: 999.99,
    originalPrice: 1099.99,
    image: "https://fdn2.gsmarena.com/vv/pics/google/google-pixel-9-pro-1.jpg",
    description: "Google AI at your fingertips. Tensor G4 chip, incredible camera, and 7 years of updates.",
    specs: { Chip: "Google Tensor G4", Display: "6.7\" LTPO OLED", Camera: "50MP + 48MP + 48MP", Battery: "4700mAh", Storage: "128GB" },
    rating: 4.6,
    reviews: 1876,
    badge: null
  },
  {
    id: 4,
    name: "OnePlus 13",
    brand: "OnePlus",
    price: 899.99,
    originalPrice: 999.99,
    image: "https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-13-1.jpg",
    description: "Snapdragon 8 Elite with 80W charging. Smooth performance meets premium design.",
    specs: { Chip: "Snapdragon 8 Elite", Display: "6.82\" AMOLED ProXDR", Camera: "50MP + 50MP + 50MP", Battery: "6000mAh with 80W charging", Storage: "256GB" },
    rating: 4.5,
    reviews: 1243,
    badge: "Sale"
  },
  {
    id: 5,
    name: "Xiaomi 15 Pro",
    brand: "Xiaomi",
    price: 799.99,
    originalPrice: 899.99,
    image: "https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-15-pro-1.jpg",
    description: "Leica optics, Snapdragon 8 Elite, and 120W HyperCharge. Flagship killer redefined.",
    specs: { Chip: "Snapdragon 8 Elite", Display: "6.73\" AMOLED 120Hz", Camera: "50MP Leica + 50MP + 50MP", Battery: "5400mAh with 120W charging", Storage: "256GB" },
    rating: 4.4,
    reviews: 982,
    badge: null
  },
  {
    id: 6,
    name: "iPhone 16",
    brand: "Apple",
    price: 799.99,
    originalPrice: null,
    image: "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-1.jpg",
    description: "A18 chip, 48MP camera, Camera Control button. iPhone 16 is built for Apple Intelligence.",
    specs: { Chip: "A18", Display: "6.1\" Super Retina XDR", Camera: "48MP Fusion + 12MP Ultra Wide", Battery: "Up to 22 hours video playback", Storage: "128GB" },
    rating: 4.6,
    reviews: 4521,
    badge: "Popular"
  },
  {
    id: 7,
    name: "Samsung Galaxy Z Fold 6",
    brand: "Samsung",
    price: 1799.99,
    originalPrice: 1899.99,
    image: "https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold6-1.jpg",
    description: "The ultimate foldable experience. Galaxy AI, 7.6\" main screen, and multitasking reimagined.",
    specs: { Chip: "Snapdragon 8 Gen 3", Display: "7.6\" Dynamic AMOLED 2X + 6.3\" Cover", Camera: "50MP + 12MP + 10MP", Battery: "4400mAh", Storage: "512GB" },
    rating: 4.3,
    reviews: 1456,
    badge: "Premium"
  },
  {
    id: 8,
    name: "Nothing Phone (3)",
    brand: "Nothing",
    price: 599.99,
    originalPrice: null,
    image: "https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-3-new-1.jpg",
    description: "Iconic Glyph Interface. Transparent design meets pure Android experience.",
    specs: { Chip: "Snapdragon 8s Gen 3", Display: "6.7\" LTPO OLED 120Hz", Camera: "50MP + 50MP", Battery: "5000mAh", Storage: "256GB" },
    rating: 4.2,
    reviews: 876,
    badge: null
  }
];

module.exports = products;
