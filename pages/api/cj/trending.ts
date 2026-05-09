import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDrG6tD6GPC7kCZ3CNXmAhc_X5wXd643-E",
  authDomain: "laptop-shop-25c2c.firebaseapp.com",
  projectId: "laptop-shop-25c2c",
  storageBucket: "laptop-shop-25c2c.firebasestorage.app",
  messagingSenderId: "209150941153",
  appId: "1:209150941153:web:0f6bd22df7e37b5fffa4a0",
  measurementId: "G-0S28KCF6LV",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // If ?diag=true, run the diagnostic instead of the trending list
    if (req.query.diag === 'true') {
      const results: Record<string, any> = {
        project: firebaseConfig.projectId,
        timestamp: new Date().toISOString(),
        collections: {} as Record<string, any>,
        writeTest: {} as Record<string, any>,
      };

      const collectionNames = ['products', 'orders', 'users', 'laptops'];
      for (const name of collectionNames) {
        try {
          const snapshot = await getDocs(collection(db, name));
          results.collections[name] = {
            status: 'READ_OK',
            count: snapshot.size,
            sampleIds: snapshot.docs.slice(0, 3).map(d => d.id),
          };
        } catch (error: any) {
          results.collections[name] = { status: 'READ_FAILED', error: error.message, code: error.code };
        }
      }

      // Write test to products
      try {
        const docRef = await addDoc(collection(db, "products"), { name: "__TEST__", _test: true });
        results.writeTest.products = { status: 'WRITE_OK', docId: docRef.id };
        await deleteDoc(doc(db, "products", docRef.id));
        results.writeTest.products.cleanup = 'DELETED';
      } catch (error: any) {
        results.writeTest.products = { status: 'WRITE_FAILED', error: error.message, code: error.code };
      }

      // Write test to orders
      try {
        const docRef = await addDoc(collection(db, "orders"), { name: "__TEST__", _test: true });
        results.writeTest.orders = { status: 'WRITE_OK', docId: docRef.id };
        await deleteDoc(doc(db, "orders", docRef.id));
        results.writeTest.orders.cleanup = 'DELETED';
      } catch (error: any) {
        results.writeTest.orders = { status: 'WRITE_FAILED', error: error.message, code: error.code };
      }

      return res.status(200).json(results);
    }

    // Normal trending product list
    try {
      const categories = ["Pet Supplies", "Tech Accessories", "Gadgets", "Home Decor", "Health & Beauty", "Kitchen", "Travel"];
      
      const productData: Record<string, { names: string[], adjectives: string[], brands: string[] }> = {
        "Pet Supplies": {
          names: ["Self-Cleaning Brush", "Interactive Toy", "Orthopedic Bed", "Automatic Feeder", "Silicone Grooming Glove"],
          adjectives: ["Ultra-Soft", "Durable", "Smart", "Eco-Friendly", "Premium"],
          brands: ["Paws & Claws", "PetHaven", "BarkStyle", "MeowMaster"]
        },
        "Tech Accessories": {
          names: ["Wireless Charger", "Bluetooth Earbuds", "USB-C Hub", "Magnetic Phone Mount", "Laptop Stand"],
          adjectives: ["Fast-Charging", "Noise-Cancelling", "High-Speed", "Ergonomic", "Sleek"],
          brands: ["NexusTech", "VoltCore", "SyncStream", "AeroTech"]
        },
        "Gadgets": {
          names: ["Portable Fan", "LED Projection Lamp", "Mini Drone", "Digital Luggage Scale", "Electric Wine Opener"],
          adjectives: ["Pocket-Sized", "Atmospheric", "Foldable", "Precision", "Rechargeable"],
          brands: ["GizmoX", "Innova", "SwiftGadget", "ModernEdge"]
        },
        "Home Decor": {
          names: ["Sunset Lamp", "Boho Throw Pillow", "Floating Wall Shelf", "Diffuser & Humidifier", "Macrame Wall Hanging"],
          adjectives: ["Aesthetic", "Handcrafted", "Minimalist", "Calming", "Elegant"],
          brands: ["Lumina", "VibeHome", "PureDecor", "AuraSpace"]
        },
        "Health & Beauty": {
          names: ["Facial Cleanser", "Hair Remover", "Massage Gun", "Essential Oil Set", "Jade Roller"],
          adjectives: ["Sonic", "Painless", "Deep-Tissue", "Organic", "Refreshing"],
          brands: ["GlowUp", "SilkSkin", "ZenBody", "PureRevive"]
        },
        "Kitchen": {
          names: ["Vegetable Chopper", "Electric Whisk", "Reusable Silicone Bags", "Meat Thermometer", "Honey Dispenser"],
          adjectives: ["Pro-Grade", "Anti-Spill", "Eco-Conscious", "Instant-Read", "Multi-Functional"],
          brands: ["ChefPro", "EcoKitchen", "TasteMate", "KitchenElite"]
        },
        "Travel": {
          names: ["Compression Cubes", "Neck Pillow", "Universal Adapter", "Waterproof Phone Pouch", "Travel Toiletry Bag"],
          adjectives: ["Space-Saving", "Memory Foam", "All-in-One", "Heavy-Duty", "Compact"],
          brands: ["Wanderlust", "NomadGear", "TravelEasy", "GlobalPack"]
        }
      };
      const categoryImages: Record<string, string[]> = {
        "Pet Supplies": [
          "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070",
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043",
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1964",
          "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=1988",
          "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=2060"
        ],
        "Tech Accessories": [
          "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=1780",
          "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=2030",
          "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2070",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1780",
          "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964"
        ],
        "Gadgets": [
          "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069",
          "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?q=80&w=2000",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999",
          "https://images.unsplash.com/photo-1526170315870-efeca63c5d4b?q=80&w=2070"
        ],
        "Home Decor": [
          "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974",
          "https://images.unsplash.com/photo-1513519247388-1934642d8887?q=80&w=2070",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1916",
          "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069",
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070"
        ],
        "Health & Beauty": [
          "https://images.unsplash.com/photo-1596462502278-27bf86473a8c?q=80&w=2080",
          "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070",
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087",
          "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=2070",
          "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2070"
        ],
        "Kitchen": [
          "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1974",
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070",
          "https://images.unsplash.com/photo-1584346133934-a3afd2a33c4c?q=80&w=2070",
          "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=2070",
          "https://images.unsplash.com/photo-1522066400331-2f77c041394a?q=80&w=2000"
        ],
        "Travel": [
          "https://images.unsplash.com/photo-1574123223000-8438183141f3?q=80&w=1935",
          "https://images.unsplash.com/photo-1503387762-592dea58ef21?q=80&w=2062",
          "https://images.unsplash.com/photo-1527631746610-bca00a040d60?q=80&w=1974",
          "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070",
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073"
        ]
      };

      const allListableProducts = Array.from({ length: 100 }).map((_, i) => {
        const id = i + 1;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const data = productData[category];
        
        const adj = data.adjectives[Math.floor(Math.random() * data.adjectives.length)];
        const name = data.names[Math.floor(Math.random() * data.names.length)];
        const brand = data.brands[Math.floor(Math.random() * data.brands.length)];
        const fullName = `${adj} ${name}`;
        
        const categoryImgList = categoryImages[category] || categoryImages["Gadgets"];
        const image = categoryImgList[Math.floor(Math.random() * categoryImgList.length)];
        
        return {
          cj_id: `CJ_PROD_${id.toString().padStart(3, '0')}`,
          name: fullName,
          price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
          image: image,
          description: `Experience the difference with our ${fullName}. This ${category.toLowerCase()} essential is designed for maximum performance and style. A must-have in our ${brand} collection.`,
          category: category,
          brand: brand
        };
      });

      // Simple shuffle logic
      const shuffledProducts = allListableProducts.sort(() => Math.random() - 0.5);

      res.status(200).json({ success: true, products: shuffledProducts });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to fetch trending products from CJ API" });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
