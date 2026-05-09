import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const allListableProducts = [
        // Pet Supplies
        {
          cj_id: "CJ_PET_001",
          name: "Self-Cleaning Waterproof Pet Brush",
          price: 12.99,
          image: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop",
          description: "One-click hair release mechanism. Perfect for all fur types.",
          category: "Pet Supplies"
        },
        {
          cj_id: "CJ_PET_002",
          name: "Automatic Interactive Cat Laser",
          price: 15.50,
          image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop",
          description: "Keep your feline active and healthy with this smart laser toy.",
          category: "Pet Supplies"
        },
        // Tech & Gadgets
        {
          cj_id: "CJ_TECH_001",
          name: "Wireless Magnetic 3-in-1 Charging Station",
          price: 24.50,
          image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=1780&auto=format&fit=crop",
          description: "Fast-charging stand for iPhone, Apple Watch, and AirPods.",
          category: "Tech Accessories"
        },
        {
          cj_id: "CJ_TECH_002",
          name: "Bladeless Portable Neck Fan",
          price: 18.20,
          image: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069&auto=format&fit=crop",
          description: "Hands-free cooling with silent airflow and 8-hour battery life.",
          category: "Gadgets"
        },
        {
          cj_id: "CJ_TECH_003",
          name: "Smart LED Sunset Projection Lamp",
          price: 9.90,
          image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
          description: "Create a golden hour atmosphere with 16 color modes.",
          category: "Home Decor"
        },
        // Health & Beauty
        {
          cj_id: "CJ_BEAUTY_001",
          name: "Electric Ultrasonic Face Cleanser",
          price: 22.00,
          image: "https://images.unsplash.com/photo-1596462502278-27bf86473a8c?q=80&w=2080&auto=format&fit=crop",
          description: "Deep pore cleansing with medical-grade silicone bristles.",
          category: "Health & Beauty"
        },
        {
          cj_id: "CJ_BEAUTY_002",
          name: "Painless Nano-Glass Hair Remover",
          price: 7.50,
          image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070&auto=format&fit=crop",
          description: "Gentle exfoliation and hair removal without razor burns.",
          category: "Health & Beauty"
        },
        // Kitchen & Home
        {
          cj_id: "CJ_HOME_001",
          name: "Multi-Function Vegetable Chopper",
          price: 14.99,
          image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1974&auto=format&fit=crop",
          description: "8 interchangeable blades for all your meal prep needs.",
          category: "Kitchen"
        },
        {
          cj_id: "CJ_HOME_002",
          name: "Collapsible Electric Travel Kettle",
          price: 19.95,
          image: "https://images.unsplash.com/photo-1574123223000-8438183141f3?q=80&w=1935&auto=format&fit=crop",
          description: "Food-grade silicone, boils water in minutes, folds flat.",
          category: "Travel"
        }
      ];

      res.status(200).json({ success: true, products: allListableProducts });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch trending products from CJ API" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
