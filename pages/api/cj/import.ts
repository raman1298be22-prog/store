import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { cjProductId, name, price, category, brand, description, image } = req.body;
    
    // Data lookup based on ID (simulating database or API lookup)
    const productDatabase: Record<string, any> = {
      "CJ_PET_001": { name: "Self-Cleaning Pet Brush", price: 12.99, category: "Pet Supplies", image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop" },
      "CJ_PET_002": { name: "Interactive Cat Laser", price: 15.50, category: "Pet Supplies", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop" },
      "CJ_TECH_001": { name: "3-in-1 Charging Station", price: 24.50, category: "Tech Accessories", image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=1780&auto=format&fit=crop" },
      "CJ_TECH_002": { name: "Portable Neck Fan", price: 18.20, category: "Gadgets", image: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069&auto=format&fit=crop" },
      "CJ_TECH_003": { name: "Sunset Projection Lamp", price: 9.90, category: "Home Decor", image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop" },
      "CJ_BEAUTY_001": { name: "Ultrasonic Face Cleanser", price: 22.00, category: "Health & Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bf86473a8c?q=80&w=2080&auto=format&fit=crop" },
      "CJ_BEAUTY_002": { name: "Nano-Glass Hair Remover", price: 7.50, category: "Health & Beauty", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070&auto=format&fit=crop" },
      "CJ_HOME_001": { name: "Multi-Function Chopper", price: 14.99, category: "Kitchen", image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1974&auto=format&fit=crop" },
      "CJ_HOME_002": { name: "Collapsible Travel Kettle", price: 19.95, category: "Travel", image: "https://images.unsplash.com/photo-1574123223000-8438183141f3?q=80&w=1935&auto=format&fit=crop" },
    };

    const fallbackImages = [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070",
      "https://images.unsplash.com/photo-1526170315870-efeca63c5d4b?q=80&w=2070",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=2080",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1996",
      "https://images.unsplash.com/photo-1585333120111-9a74479901fb?q=80&w=2070",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1780",
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=2080"
    ];

    const fallbackData = [
      { name: "Ergonomic Office Chair", category: "Office", brand: "Zenith", description: "Experience ultimate comfort with our Ergonomic Office Chair. Designed for long hours of work with breathable mesh and adjustable lumbar support." },
      { name: "Smart LED Light Strip", category: "Home Tech", brand: "Lumina", description: "Transform your space with the Smart LED Light Strip. Control millions of colors and sync with music via our dedicated app." },
      { name: "Stainless Steel Water Bottle", category: "Outdoor", brand: "AquaFlow", description: "Stay hydrated with our Stainless Steel Water Bottle. Double-walled vacuum insulation keeps drinks cold for 24 hours or hot for 12." },
      { name: "Wireless Gaming Mouse", category: "Tech", brand: "VoltCore", description: "Take your gaming to the next level with the Wireless Gaming Mouse. Ultra-fast response time and customizable RGB lighting." },
      { name: "Electric Coffee Grinder", category: "Kitchen", brand: "ChefPro", description: "Start your morning with perfectly ground beans. Our Electric Coffee Grinder features stainless steel blades for a consistent grind." },
      { name: "Noise-Cancelling Headphones", category: "Audio", brand: "SyncStream", description: "Immerse yourself in sound. Our Noise-Cancelling Headphones block out the world so you can focus on what matters." }
    ];

    const selectedFallback = fallbackData[Math.floor(Math.random() * fallbackData.length)];

    const productInfo = productDatabase[cjProductId] || {
      name: name || selectedFallback.name,
      price: price || 29.99,
      category: category || selectedFallback.category,
      brand: brand || selectedFallback.brand,
      description: description || selectedFallback.description,
      image: image || fallbackImages[Math.floor(Math.random() * fallbackImages.length)]
    };

    const mockProduct = {
      cj_product_id: cjProductId,
      name: productInfo.name,
      description: productInfo.description || `Premium high-quality product imported directly from CJ Dropshipping. Highly rated and trending in the ${productInfo.category} niche.`,
      price: productInfo.price,
      cost_price: parseFloat((productInfo.price * 0.4).toFixed(2)),
      margin: parseFloat((productInfo.price * 0.6).toFixed(2)),
      brand: productInfo.brand || "Nexus Marketplace",
      image: productInfo.image,
      stock: 1000,
      sold: Math.floor(Math.random() * 500),
      category: productInfo.category
    };


    res.status(200).json({ success: true, product: mockProduct });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
