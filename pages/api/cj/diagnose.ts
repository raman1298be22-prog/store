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
  const results: Record<string, any> = {
    project: firebaseConfig.projectId,
    timestamp: new Date().toISOString(),
    collections: {},
    writeTest: {},
  };

  // 1. List all known collections and count documents
  const collectionNames = ['products', 'orders', 'users', 'laptops'];
  
  for (const name of collectionNames) {
    try {
      const colRef = collection(db, name);
      const snapshot = await getDocs(colRef);
      results.collections[name] = {
        status: 'OK',
        documentCount: snapshot.size,
        sampleDocIds: snapshot.docs.slice(0, 3).map(d => d.id),
        sampleData: snapshot.docs.slice(0, 1).map(d => ({ id: d.id, ...d.data() })),
      };
    } catch (error: any) {
      results.collections[name] = {
        status: 'ERROR',
        error: error.message,
        code: error.code,
      };
    }
  }

  // 2. Write test — try adding a test doc to "products" and then delete it
  try {
    const testProduct = {
      name: "__DIAGNOSTIC_TEST__",
      price: 0,
      _test: true,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "products"), testProduct);
    results.writeTest.products = {
      status: 'WRITE_SUCCESS',
      docId: docRef.id,
      message: 'Successfully wrote to products collection',
    };
    // Clean up the test doc
    await deleteDoc(doc(db, "products", docRef.id));
    results.writeTest.products.cleanup = 'Deleted test doc';
  } catch (error: any) {
    results.writeTest.products = {
      status: 'WRITE_FAILED',
      error: error.message,
      code: error.code,
      hint: error.code === 'permission-denied' 
        ? 'Firestore rules are BLOCKING writes. You must deploy rules via Firebase Console or CLI.'
        : 'Unknown write error',
    };
  }

  // 3. Write test for orders
  try {
    const testOrder = {
      customerName: "__DIAGNOSTIC_TEST__",
      total: 0,
      _test: true,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "orders"), testOrder);
    results.writeTest.orders = {
      status: 'WRITE_SUCCESS',
      docId: docRef.id,
      message: 'Successfully wrote to orders collection',
    };
    await deleteDoc(doc(db, "orders", docRef.id));
    results.writeTest.orders.cleanup = 'Deleted test doc';
  } catch (error: any) {
    results.writeTest.orders = {
      status: 'WRITE_FAILED',
      error: error.message,
      code: error.code,
      hint: error.code === 'permission-denied'
        ? 'Firestore rules are BLOCKING writes. You must deploy rules via Firebase Console or CLI.'
        : 'Unknown write error',
    };
  }

  res.status(200).json(results);
}
