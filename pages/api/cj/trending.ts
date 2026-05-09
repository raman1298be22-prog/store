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
      const images = [
        "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?q=80&w=1780&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=2069&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bf86473a8c?q=80&w=2080&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=1974&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1574123223000-8438183141f3?q=80&w=1935&auto=format&fit=crop"
      ];

      const allListableProducts = Array.from({ length: 100 }).map((_, i) => {
        const id = i + 1;
        const category = categories[Math.floor(Math.random() * categories.length)];
        const image = images[Math.floor(Math.random() * images.length)];
        return {
          cj_id: `CJ_PROD_${id.toString().padStart(3, '0')}`,
          name: `${category} Item #${id}`,
          price: parseFloat((Math.random() * 50 + 5).toFixed(2)),
          image: image,
          description: `High-quality ${category.toLowerCase()} for your daily needs. Trending and high-sales item.`,
          category: category
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
