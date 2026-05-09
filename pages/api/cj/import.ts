import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { cjProductId } = req.body;
    
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

    const productInfo = productDatabase[cjProductId] || {
      name: `Premium CJ Item ${cjProductId}`,
      price: 29.99,
      category: "General",
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
    };

    const mockProduct = {
      cj_product_id: cjProductId,
      name: productInfo.name,
      description: `Premium high-quality product imported directly from CJ Dropshipping. Highly rated and trending in the ${productInfo.category} niche.`,
      price: productInfo.price,
      cost_price: parseFloat((productInfo.price * 0.4).toFixed(2)),
      margin: parseFloat((productInfo.price * 0.6).toFixed(2)),
      brand: "Nexus Marketplace",
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
