"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Menu,
  Search,
  User as UserIcon,
  Plus,
  Minus,
  X,
  Edit,
  Trash,
  Package,
  DollarSign,
  TrendingUp,
  PlusIcon,
  PencilIcon,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import _ from "lodash";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
  getDoc,
  query,
  where,
  setDoc,
} from "firebase/firestore";

import {
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  getAuth as firebaseGetAuth,
  FacebookAuthProvider,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
interface User extends FirebaseUser {
  role?: string;
}
import { auth as Auth } from "firebase-admin";
import { log } from "console";
const firebaseConfig = {
  apiKey: "AIzaSyDrG6tD6GPC7kCZ3CNXmAhc_X5wXd643-E",
  authDomain: "laptop-shop-25c2c.firebaseapp.com",
  projectId: "laptop-shop-25c2c",
  storageBucket: "laptop-shop-25c2c.firebasestorage.app",
  messagingSenderId: "209150941153",
  appId: "1:209150941153:web:0f6bd22df7e37b5fffa4a0",
  measurementId: "G-0S28KCF6LV",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}
type Order = {
  id: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: string;
  date: string;
  address: string;
  customerEmail?: string; // Add this line and make it optional with ?
};
type Product = {
  firb_id: string;
  id: any;
  cj_product_id?: string;
  name: any;
  description: any;
  cost_price?: number;
  price: any;
  margin?: number;
  brand: any;
  image: any;
  stock: any;
  sold: any;
  category?: string;
  variants?: any[];
};
export default function TechreviveWithAdmin() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [originalProducts, setOriginalProducts] = useState<Product[]>(products);
  const [error, setError] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newAddress, setNewAddress] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };
  useEffect(() => {
    const unsubscribe = firebaseGetAuth().onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const ordersCollection = collection(db, "orders");
          const querySnapshot = await getDocs(ordersCollection);
          const ordersData = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          })) as Order[];
          setOrders(ordersData);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      } else {
        setOrders([]);
      }
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCollection = collection(db, "products"); // Replace "products" with your actual collection name
        const productsSnapshot = await getDocs(productsCollection);
        const productsList: Product[] = productsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            firb_id: doc.id,
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
            brand: data.brand,
            image: data.image,
            stock: data.stock,
            sold: data.sold,
            cost_price: data.cost_price,
            margin: data.margin,
            category: data.category,
            cj_product_id: data.cj_product_id,
          };
        });
        setProducts(productsList);
        setFilteredProducts(productsList);
        setOriginalProducts(productsList);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const addToCart = (product: Product) => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      updateQuantity(product.id, 1);
    } else {
      setCartItems([
        ...cartItems,
        { id: product.id, name: product.name, price: product.price, quantity: 1 },
      ]);
    }
  };
  const getTotalRevenue = () => {
    return products.reduce((sum, product) => sum + product.price * product.sold, 0);
  };
  const getTotalSold = () => {
    return products.reduce((sum, product) => sum + product.sold, 0);
  };
  const getTotalStock = () => {
    return products.reduce((sum, product) => sum + product.stock, 0);
  };
  const updateOrderStatus = async (
    orderId: string,
    newStatus: "pending" | "shipped" | "delivered"
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId); // Get the document reference
      await updateDoc(orderRef, { status: newStatus }); // Update the status in Firestore
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      ); // Update local state
      console.log("Order status updated successfully");
    } catch (error) {
      console.error("Error updating order status: ", error); // Log any errors
    }
  };
  const handleDeleteOrder = async (order: Order) => {
    if (!order) {
      console.error("No order is being deleted.");
      return;
    }
    const orderId = order.id; // Ensure orderId is a string
    try {
      await deleteDoc(doc(db, "orders", orderId)); // Delete the order from Firestore
      // Update the local state by filtering out the deleted order
      setOrders(orders.filter((ord) => ord.id !== order.id));
      console.log("Order document deleted successfully");
    } catch (error) {
      console.error("Error deleting order: ", error); // Log any errors
    }
  };
  const Header = () => {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const handleSignUpWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      try {
        const auth = firebaseGetAuth();
        const result = await firebaseSignInWithPopup(auth, provider);
        const user = result.user;

        const db = getFirestore();
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        let role = "user";
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            name: user.displayName ?? "",
            email: user.email ?? "",
            role: "user",
            createdAt: new Date(),
          });
        } else {
          role = userDoc.data()?.role || "user";
        }

        const userWithRole = { ...user, role };
        setCurrentUser(userWithRole);
        localStorage.setItem("user", JSON.stringify(userWithRole));

        setError(null);
        setIsAuthOpen(false);
      } catch (error) {
        console.error("Error signing up:", error);
        setError("Failed to sign up with Google. Please try again.");
      }
    };
    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email || !password || !name || !phone) {
        console.error("Name, email, phone, and password are required.");
        return;
      }

      try {
        const auth = firebaseGetAuth();
        const userCredential = await firebaseCreateUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        if (userCredential.user) {
          // Update the user's profile with the name
          await updateProfile(userCredential.user, {
            displayName: name,
          });

          // Add user to Firestore
          const userDocRef = doc(db, "users", userCredential.user.uid);
          try {
            await setDoc(userDocRef, {
              name: name,
              email: email,
              phone: phone,
              role: "user",
              createdAt: new Date(),
            });
            console.log("User added to Firestore successfully");
          } catch (fsError: any) {
            console.error("Firestore Error during signup:", fsError);
            alert(`Database Error: ${fsError.message}`);
          }

          const userWithRole = { ...userCredential.user, role: "user" };
          setCurrentUser(userWithRole);
          localStorage.setItem("user", JSON.stringify(userWithRole));

          setError(null);
          setIsAuthOpen(false);
        }
      } catch (error) {
        console.error("Error signing up:", error);
        setError("Failed to sign up. Please try again.");
      }
    };

    const handleSignUpWithFacebook = async () => {
      const provider = new FacebookAuthProvider();
      try {
        const auth = firebaseGetAuth();
        await firebaseSignInWithPopup(auth, provider);
        setError(null);
      } catch (error) {
        console.error("Error signing up:", error);
      }
    };

    const handleSignInWithGoogle = async () => {
      const provider = new GoogleAuthProvider();
      try {
        const auth = firebaseGetAuth();
        const result = await firebaseSignInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        
        let role = "user";
        if (!userDocSnapshot.exists()) {
          try {
            await setDoc(userDocRef, {
              name: user.displayName ?? "",
              email: user.email ?? "",
              role: "user",
              createdAt: new Date(),
            });
          } catch (fsError: any) {
            console.error("Firestore Error during Google signin:", fsError);
          }
        } else {
          role = userDocSnapshot.data()?.role || "user";
        }
        
        const userWithRole = { ...user, role };
        setCurrentUser(userWithRole);
        localStorage.setItem("user", JSON.stringify(userWithRole));
        
        setError(null);
        setIsAuthOpen(false);
      } catch (error) {
        console.error("Error signing in with Google:", error);
        setError("Failed to sign in with Google. Please try again.");
      }
    };

    const handleSignInWithFacebook = async () => {
      const provider = new FacebookAuthProvider();
      try {
        const auth = firebaseGetAuth();
        const result = await firebaseSignInWithPopup(auth, provider);
        // This gives you a Facebook Access Token. You can use it to access the Facebook API.
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const token = credential?.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log("User signed in with Facebook:", user);
        setError(null);
        // You can add additional logic here, such as updating UI or redirecting the user
      } catch (error) {
        console.error("Error signing in with Facebook:", error);
        setError("Failed to sign in with Facebook. Please try again.");
      }
    };

    const handleSignIn = async () => {
      try {
        const auth = firebaseGetAuth();
        const userCredential = await firebaseSignInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        const userData = userDocSnapshot.data();
        const role = userData?.role || "user";

        const userWithRole = { ...user, role };
        setCurrentUser(userWithRole);
        localStorage.setItem("user", JSON.stringify(userWithRole));

        console.log("User signed in:", user);
        setError(null);
        setIsAuthOpen(false);
      } catch (error) {
        console.error("Error signing in:", error);
        setError("Failed to sign in. Please check your email and password.");
      }
    };

    function setUsername(value: string): void {
      throw new Error("Function not implemented.");
    }

    useEffect(() => {
      const user = localStorage.getItem("user");
      if (user) {
        setCurrentUser(JSON.parse(user));
      }

      // setCurrentUser(user);
    }, []);

    return (
      <>
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white text-center py-2 text-sm font-medium animate-pulse">
          🚚 FREE SHIPPING NATIONWIDE - LIMITED TIME OFFER! 📦
        </div>
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <button
              onClick={() => setCurrentPage("home")}
              className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            >
              NEXUS MARKETPLACE
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-md p-4 space-y-2 md:hidden">
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded"
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage("products");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded"
              >
                Products
              </button>
              <button
                onClick={() => {
                  setCurrentPage("orders");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded"
              >
                Orders
              </button>
              <button
                onClick={() => {
                  setCurrentPage("about");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded"
              >
                About
              </button>
              <button
                onClick={() => {
                  setCurrentPage("contact");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded"
              >
                Contact
              </button>
              {currentUser?.role === "admin" && (
                <button
                  onClick={() => {
                    setCurrentPage("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-white/10 rounded"
                >
                  Admin
                </button>
              )}
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <button
              onClick={() => setCurrentPage("home")}
              className="hover:text-green-400 transiti
              on-colors"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage("products")}
              className="hover:text-blue-400 transition-colors"
            >
              Products
            </button>
            <button
              onClick={() => setCurrentPage("about")}
              className="hover:text-purple-400 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => setCurrentPage("orders")}
              className="hover:text-pink-400 transition-colors"
            >
              Orders
            </button>
            <button
              onClick={() => setCurrentPage("contact")}
              className="hover:text-pink-400 transition-colors"
            >
              Contact
            </button>
            {currentUser?.role === "admin" && (
              <button
                onClick={() => setCurrentPage("admin")}
                className="hover:text-yellow-400 transition-colors"
              >
                Admin
              </button>
            )}
          </nav>

          {/* Cart and User Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
            >
              <Search className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 relative"
                >
                  <ShoppingCart className="h-6 w-6" />
                  <span className="sr-only">Cart</span>
                  {cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl text-white border border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    Your Cart
                  </DialogTitle>
                  <DialogDescription className="text-white/70">
                    Review and manage your selected items.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-white/5 p-2 rounded-lg"
                    >
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="w-20 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            updateQuantity(item.id, -item.quantity)
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                  onClick={() => {
                    const user = localStorage.getItem("user");
                    if (!user) {
                      setIsCartOpen(false);
                      setIsAuthOpen(true); // Open auth dialog if user is not logged in
                    } else {
                      setIsCartOpen(false);
                      setCurrentPage("checkout");
                    }
                  }}
                >
                  Proceed to Checkout
                </Button>
              </DialogContent>
            </Dialog>
            <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  <UserIcon className="h-6 w-6" />
                  <span className="sr-only">Account</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl text-white border border-white/20">
                <DialogTitle className="sr-only">Authentication</DialogTitle>
                <DialogDescription className="sr-only">Login or Sign up</DialogDescription>
                {!currentUser ? (
                  <Tabs defaultValue="login" className="w-full">
                    <Separator className="my-4 bg-transparent" />
                    <TabsList className="grid w-full grid-cols-2 bg-white/10">
                      <TabsTrigger
                        value="login"
                        className="data-[state=active]:bg-white/20"
                      >
                        Login
                      </TabsTrigger>
                      <TabsTrigger
                        value="signup"
                        className="data-[state=active]:bg-white/20"
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                          Login
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                          Enter your credentials to access your account.
                        </DialogDescription>
                      </DialogHeader>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSignIn();
                        }}
                      >
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="login-email" className="text-right">
                              Email
                            </Label>
                            <Input
                              id="login-email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="login-password"
                              className="text-right"
                            >
                              Password
                            </Label>
                            <Input
                              id="login-password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAuthOpen(false)}
                            className="text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                          >
                            Login
                          </Button>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <Button
                            type="button"
                            onClick={handleSignInWithGoogle}
                            variant="outline"
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Login with Google
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleSignInWithFacebook}
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
                            </svg>
                            Login with Facebook
                          </Button>
                        </div>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                          Sign Up
                        </DialogTitle>
                        <DialogDescription className="text-white/70">
                          Create a new account to start shopping.
                        </DialogDescription>
                      </DialogHeader>
                      {/* User creation */}
                      <form onSubmit={handleSignUp}>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="signup-name" className="text-right">
                              Name
                            </Label>
                            <Input
                              id="signup-name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              type="text"
                              className="col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="signup-email"
                              className="text-right"
                            >
                              Email
                            </Label>
                            <Input
                              id="signup-email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              type="email"
                              className="col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="signup-password"
                              className="text-right"
                            >
                              Password
                            </Label>
                            <Input
                              id="signup-password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                              htmlFor="signup-phone"
                              className="text-right"
                            >
                              Phone
                            </Label>
                            <Input
                              id="signup-phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="col-span-3 bg-white/10 border-white/20 text-white placeholder-white/50"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsAuthOpen(false)}
                            className="text-white hover:bg-white/10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                          >
                            Sign Up
                          </Button>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                          <Button
                            type="button"
                            onClick={handleSignUpWithGoogle}
                            variant="outline"
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                              />
                              <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                              />
                              <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                              />
                              <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                              />
                            </svg>
                            Sign up with Google
                          </Button>
                          <Button
                            type="button"
                            onClick={handleSignUpWithFacebook}
                            variant="outline"
                            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z" />
                            </svg>
                            Sign up with Facebook
                          </Button>
                        </div>
                      </form>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="p-6 bg-white/10 rounded-lg shadow-lg">
                    <div className="flex flex-col items-center mb-6">
                      {currentUser?.photoURL ? (
                        <div className="relative">
                          <img
                            src={currentUser.photoURL}
                            alt={currentUser.displayName || "User"}
                            className="w-24 h-24 rounded-full border-4 border-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4"
                          />
                          <Button
                            size="sm"
                            className="absolute bottom-0 right-0 bg-white/20 hover:bg-white/30 rounded-full p-1"
                            onClick={() => {
                              // Implement image update logic here
                              console.log("Update profile picture");
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold mb-4">
                            {currentUser?.displayName
                              ? currentUser.displayName[0].toUpperCase()
                              : "U"}
                          </div>
                          <Button
                            size="sm"
                            className="absolute bottom-0 right-0 bg-white/20 hover:bg-white/30 rounded-full p-1"
                            onClick={() => {
                              // Implement image update logic here
                              console.log("Add profile picture");
                            }}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                        Welcome, {currentUser?.displayName || "User"}!
                      </h2>
                    </div>
                    <div className="space-y-4 bg-white/5 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-semibold">
                          Full Name:
                        </span>
                        <span className="text-white">
                          {currentUser?.displayName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-semibold">
                          Email Address:
                        </span>
                        <span className="text-white">{currentUser?.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 font-semibold">
                          Account Type:
                        </span>
                        <span className="text-white capitalize">
                          {currentUser?.role || "User"}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="mt-8 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white py-3 rounded-lg transition duration-300 ease-in-out text-lg font-semibold"
                      onClick={() => {
                        localStorage.removeItem("user");
                        setCurrentUser(null);
                        setIsAuthOpen(true);
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </header>
      </>
    );
  };
  const Footer = () => (
    <footer className="bg-black/60 backdrop-blur-md py-12 mt-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-4">
              NEXUS MARKETPLACE
            </h3>
            <p className="text-white/60 max-w-sm">
              Your one-stop shop for the trendiest gear. We source directly to bring you the best prices without compromising on quality.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="text-white/40 space-y-2 text-sm cursor-pointer">
              <li className="hover:text-indigo-400 transition-colors">Track Order</li>
              <li className="hover:text-indigo-400 transition-colors">Shipping Policy</li>
              <li className="hover:text-indigo-400 transition-colors">Refund Policy</li>
              <li className="hover:text-indigo-400 transition-colors">Privacy Policy</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact</h4>
            <ul className="text-white/40 space-y-2 text-sm">
              <li>support@nexusmarket.com</li>
              <li>+91 93562-99921</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/40 text-sm">&copy; 2026 NEXUS MARKETPLACE. All rights reserved.</p>
          <div className="flex items-center space-x-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
             <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
             <img src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Amex_logo_2006.svg" className="h-4" alt="Amex" />
          </div>
        </div>
      </div>
    </footer>
  );
  const QuickView = ({
    product,
    onClose,
  }: {
    product: Product;
    onClose: () => void;
  }) => (
    <Dialog open={!!product} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[625px] bg-black/80 backdrop-blur-xl text-white border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="space-y-4">
            <div className="bg-pink-500/10 border border-pink-500/20 rounded p-2 text-xs text-pink-400 font-bold animate-pulse">
              🔥 Selling fast! 12 items left in stock.
            </div>
            <p className="text-white/80">{product.description}</p>
            <div className="flex items-baseline space-x-2">
              <p className="text-2xl font-bold text-green-400">
                ₹{product.price.toFixed(2)}
              </p>
              <p className="text-sm text-white/40 line-through">
                ₹{(product.price * 1.5).toFixed(2)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-white/60">Brand: <span className="text-white font-medium">{product.brand}</span></p>
              <p className="text-white/60">Sold: <span className="text-white font-medium">{product.sold}</span></p>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white h-12 text-lg font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              onClick={() => addToCart(product)}
            >
              ADD TO CART
            </Button>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
               <div className="flex flex-col items-center">
                 <ShieldCheck className="h-5 w-5 text-indigo-400 mb-1" />
                 <span className="text-[10px] text-white/60 text-center">Secure<br/>Checkout</span>
               </div>
               <div className="flex flex-col items-center">
                 <Truck className="h-5 w-5 text-indigo-400 mb-1" />
                 <span className="text-[10px] text-white/60 text-center">Fast<br/>Shipping</span>
               </div>
               <div className="flex flex-col items-center">
                 <RotateCcw className="h-5 w-5 text-indigo-400 mb-1" />
                 <span className="text-[10px] text-white/60 text-center">30-Day<br/>Returns</span>
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
  const HomePage = () => {
    const [searchProduct, setSearchProduct] = useState("");

    const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchProduct(e.target.value);
      const lowercaseQuery = e.target.value.toLowerCase().trim();

      const filterProduct = originalProducts.filter((product) => {
        const name = product.name.toLowerCase();
        const description = product.description.toLowerCase();
        return (
          name.includes(lowercaseQuery) || description.includes(lowercaseQuery)
        );
      });
    };

    // Search button handler
    const handleSearchButton = () => {
      if (searchProduct !== "") {
        const query = searchProduct.toLowerCase();

        // Filter the original list instead of the already filtered one
        const filteredProducts = originalProducts.filter((product) => {
          const name = product.name.toLowerCase();
          const description = product.description.toLowerCase();
          return name.includes(query) || description.includes(query);
        });

        setProducts(filteredProducts); // Update the filtered list
      } else {
        setProducts(originalProducts); // Reset to original list if input is empty
      }
    };

    // Clear button handler
    const handleClearSearchButton = () => {
      setSearchProduct(""); // Reset the search query
      setProducts(originalProducts); // Reset to original list
    };

    return (
      <>
        <section className="py-24 relative overflow-hidden flex items-center justify-center min-h-[70vh]">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-pulse"></div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              Trusted by 50,000+ Customers
            </div>
            <h2 className="text-6xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight">
              Premium Gear. <br/> Direct To You.
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover the latest trending products at wholesale prices. 
              High quality, fast shipping, and 24/7 support.
            </p>
            <div className="flex justify-center">
              <Input
                className="max-w-sm mr-2 bg-white/10 border-white/20 text-white placeholder-white/50"
                placeholder="Search for products..."
                value={searchProduct}
                onChange={handleSearchProduct}
              />

              <Button
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                onClick={
                  searchProduct ? handleSearchButton : handleClearSearchButton
                }
              >
                {searchProduct ? "Search" : "Clear"}
              </Button>
            </div>
          </div>
        </section>
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl font-semibold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Featured Products
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product) => {
                return (
                  <div
                    key={product.id}
                    className="bg-black/40 backdrop-blur-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
                  >
                    <div className="relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.image}
                        alt={product.name}
                        width={500}
                        height={300}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          onClick={() => setQuickViewProduct(product)}
                        >
                          Quick View
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                          {product.name}
                        </h4>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-white/40 line-through">₹{(product.price * 1.5).toFixed(2)}</span>
                          <span className="text-xs font-bold text-pink-500">-33% OFF</span>
                        </div>
                      </div>
                      <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                      <div className="flex items-center space-x-2 mb-4">
                        <div className="flex text-yellow-400">
                          {"★★★★★".split("").map((s, i) => <span key={i} className="text-xs">{s}</span>)}
                        </div>
                        <span className="text-[10px] text-white/40">(124 Reviews)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-400">
                          ₹{product.price ? product.price.toFixed(2) : "N/A"}
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                          onClick={() => addToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {quickViewProduct && (
          <QuickView
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </>
    );
  };
  const ProductsPage = () => {
    const [searchProduct, setSearchProduct] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("all");
    const [selectedPriceRange, setSelectedPriceRange] = useState("all");
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

    const handleSearchProduct = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchProduct(e.target.value);
      const lowercaseQuery = e.target.value.toLowerCase().trim();

      const filterProduct = originalProducts.filter((product) => {
        const name = product.name.toLowerCase();
        const description = product.description.toLowerCase();
        return (
          name.includes(lowercaseQuery) || description.includes(lowercaseQuery)
        );
      });
    };

    // Search button handler
    const handleSearchButton = () => {
      if (searchProduct !== "") {
        const query = searchProduct.toLowerCase();

        // Filter the original list instead of the already filtered one
        const filteredProducts = originalProducts.filter((product) => {
          const name = product.name.toLowerCase();
          const description = product.description.toLowerCase();
          return name.includes(query) || description.includes(query);
        });

        setProducts(filteredProducts); // Update the filtered list
      } else {
        setProducts(originalProducts); // Reset to original list if input is empty
      }
    };

    // Clear button handler
    const handleClearButton = () => {
      setSearchProduct(""); // Reset the search query
      setProducts(originalProducts); // Reset to original list
    };

    useEffect(() => {
      let filtered = originalProducts;

      if (selectedBrand !== "all") {
        filtered = filtered.filter(
          (product) => selectedBrand.toLowerCase() === product.brand.toLowerCase()
        );
      }

      if (selectedPriceRange !== "all") {
        filtered = filtered.filter((product) => {
          const price = product.price || 0;
          if (selectedPriceRange === "0-50000")
            return price >= 0 && price <= 50000;
          if (selectedPriceRange === "50000-100000")
            return price > 50000 && price <= 100000;
          if (selectedPriceRange === "100000+") return price > 100000;
          return true;
        });
      }

      setFilteredProducts(filtered);
    }, [selectedBrand, selectedPriceRange, originalProducts]);

    const handleBrandChange = (value: string) => {
      setSelectedBrand(value);
    };

    const handlePriceRangeChange = (value: string) => {
      setSelectedPriceRange(value);
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Our Products
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex mb-4 md:mb-0">
            <Input
              className="max-w-sm mr-2 bg-white/10 border-white/20 text-white placeholder-white/50"
              placeholder="Search products..."
              value={searchProduct}
              onChange={handleSearchProduct}
            />
            <Button
              className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
              onClick={searchProduct ? handleSearchButton : handleClearButton}
            >
              {searchProduct ? "Search" : "Clear"}
            </Button>
          </div>
          <div className="flex space-x-2">
            <Select value={selectedBrand} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="dell">Dell</SelectItem>
                <SelectItem value="hp">HP</SelectItem>
                <SelectItem value="lenovo">Lenovo</SelectItem>
                <SelectItem value="Apple">Apple</SelectItem>
              </SelectContent>
            </Select>
            <button onClick={handleClearButton}>Clear</button>
            <Select
              value={selectedPriceRange}
              onValueChange={handlePriceRangeChange}
            >
              <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-50000">₹0 - ₹50000</SelectItem>
                <SelectItem value="50000-100000">₹50000 - ₹100000</SelectItem>
                <SelectItem value="100000+">₹100000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-black/40 backdrop-blur-md rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={300}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/50 via-blue-500/50 to-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    onClick={() => setQuickViewProduct(product)}
                  >
                    Quick View
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    {product.name}
                  </h4>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-white/40 line-through">₹{(product.price * 1.5).toFixed(2)}</span>
                    <span className="text-xs font-bold text-pink-500">-33% OFF</span>
                  </div>
                </div>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{product.description}</p>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex text-yellow-400">
                    {"★★★★★".split("").map((s, i) => <span key={i} className="text-xs">{s}</span>)}
                  </div>
                  <span className="text-[10px] text-white/40">(124 Reviews)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-green-400">
                    ₹{product.price ? product.price.toFixed(2) : "N/A"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {quickViewProduct && (
          <QuickView
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </div>
    );
  };
  const AboutPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
        About NEXUS MARKETPLACE
      </h1>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-white/80 mb-4">
            NEXUS MARKETPLACE is on a mission to make quality technology
            accessible to everyone while promoting sustainability in the tech
            industry. We believe that great technology doesn&apos;t always have
            to be brand new or come with a hefty price tag.
          </p>
          <p className="text-white/80 mb-4">
            Our team of expert technicians carefully inspect, refurbish, and
            certify each product we sell, ensuring that you receive a
            high-quality device that meets our rigorous standards. By choosing a
            refurbished product, you&apos;re not only saving money but also
            contributing to the reduction of electronic waste.
          </p>
          <p className="text-white/80 mb-4">
            At TechRevive, we&apos;re committed to providing exceptional
            customer service, competitive prices, and a wide selection of
            products to suit every need and budget. Join us in our journey to
            revive technology and make a positive impact on both your wallet and
            the environment.
          </p>
          <Button className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white">
            Learn More About Our Process
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-lg"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://thumbs.dreamstime.com/z/d-modern-banner-online-shopping-website-customers-engage-digital-store-select-goods-market-buyers-push-buy-316746507.jpg"
            alt="TechRevive Team"
            className="rounded-lg w-full h-auto relative z-10"
          />
        </div>
      </div>
    </div>
  );
  const ContactPage = () => (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
        Contact Us
      </h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <p className="text-white/80 mb-4">
            We&apos;re here to help! If you have any questions, concerns, or
            just want to chat about tech, don&apos;t hesitate to reach out to
            us. Our friendly team is always ready to assist you.
          </p>
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Our Location
              </h2>
              <p className="text-white/80">
                SCO 42,1st Floor,Sector 20-C, Chandigarh
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Phone
              </h2>
              <p className="text-white/80">+91 0172-4416073</p>
              <p className="text-white/80">+91 93562-99921</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Email
              </h2>
              <p className="text-white/80">perfectcomputing@hotmail.com</p>
            </div>
          </div>
        </div>
        <div>
          <form className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
  const CheckoutPage = () => {
    const [paymentMethod, setPaymentMethod] = useState("credit-card");
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [address, setAddress] = useState("");
    const [userData, setUserData] = useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      location: "",
    });

    const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = async (
      e
    ) => {
      e.preventDefault();
      const total = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      const ordersCollection = collection(db, "orders");
      const ordersSnapshot = await getDocs(ordersCollection);

      // Debugging: Log the fetched order data
      console.log(
        "Fetched Orders Data:",
        ordersSnapshot.docs.map((doc) => doc.data())
      );

      const existingOrders = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: Number(data.id) || 0, // Convert to number, default to 0 if NaN
        };
      });

      // Debugging: Log existing orders
      console.log("Existing Orders:", existingOrders);

      const maxId =
        existingOrders.length > 0
          ? Math.max(...existingOrders.map((order) => order.id))
          : 0;

      // Debugging: Log the maximum ID
      console.log("Max ID:", maxId);

      const newOrder: Order = {
        id: (maxId + 1).toString(),
        customerName: userData.name,
        address: `${userData.address}, ${userData.city}, ${userData.state} ${userData.zipCode}`,
        items: cartItems,
        customerEmail: userData.email, // Changed from email to customerEmail
        total: total,
        status: "pending",
        date: new Date().toString(),
      };

      try {
        // Save order to Firestore with auto-generated ID
        const orderRef = await addDoc(ordersCollection, newOrder);
        console.log("Order placed successfully, Firestore ID:", orderRef.id);

        // Update stock and sold counts — look up by firb_id (Firestore doc ID)
        await Promise.all(
          cartItems.map(async (item) => {
            // Find the matching product using the numeric cart item id
            const matchingProduct = products.find((p) => p.id === item.id);
            if (!matchingProduct?.firb_id) {
              console.warn(`No Firestore doc ID for product id=${item.id}, skipping stock update`);
              return;
            }
            const productRef = doc(db, "products", matchingProduct.firb_id);
            const productSnap = await getDoc(productRef);

            if (productSnap.exists()) {
              const productData = productSnap.data() as Product;
              await updateDoc(productRef, {
                stock: productData.stock - item.quantity,
                sold: productData.sold + item.quantity,
              });
            }
          })
        );

        // Update local state for products
        const updatedProducts = products.map((product) => {
          const cartItem = cartItems.find((item) => item.id === product.id);
          if (cartItem) {
            return {
              ...product,
              stock: product.stock - cartItem.quantity,
              sold: product.sold + cartItem.quantity,
            };
          }
          return product;
        });
        setProducts(updatedProducts);

        // Clear cart and show success
        setCartItems([]);
        setCurrentPage("home");
        alert("✅ Order placed successfully! Your order is being processed.");
      } catch (error: any) {
        console.error("Error adding order: ", error);
        alert(`❌ Order failed: ${error.message || "Could not save order to Firestore"}`);
      }

      setCustomerName("");
      setAddress("");
    };
    useEffect(() => {
      // Get user data from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserData((prev) => ({
          ...prev,
          name: user.displayName || "",
          email: user.email || "",
        }));
      }
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=1ae59703ee7c4de384485c912df09348`
            );
            
            if (!response.ok) {
              if (response.status === 401) {
                console.warn("OpenCage Geocoding API: Unauthorized (Check your API Key)");
              } else {
                console.error(`OpenCage Geocoding API Error: ${response.status}`);
              }
              return;
            }

            const data = await response.json();
            const result = data.results[0];

            if (result) {
              const components = result.components;
              setUserData((prev) => ({
                ...prev,
                address: components.road || "",
                city: components.city || "",
                state: components.state || "",
                zipCode: components.postcode || "",
                location: result.formatted,
              }));
            }
          } catch (error) {
            console.error("Error getting location details:", error);
          }
        });
      }
    }, []);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Checkout
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Shipping Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={userData.address}
                    onChange={(e) =>
                      setUserData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={userData.city}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={userData.state}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={userData.zipCode}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          zipCode: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userData.phone}
                      onChange={(e) =>
                        setUserData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
              </RadioGroup>
              {paymentMethod === "credit-card" && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry-date">Expiry Date</Label>
                      <Input
                        id="expiry-date"
                        placeholder="MM/YY"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-white/5 rounded-lg p-4 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full mt-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white h-12 text-lg font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              COMPLETE PURCHASE
            </Button>
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
               <div className="flex flex-col items-center">
                 <ShieldCheck className="h-6 w-6 text-indigo-400 mb-1" />
                 <span className="text-[10px] text-white/40 text-center uppercase font-bold">Secure<br/>Payment</span>
               </div>
               <div className="flex flex-col items-center">
                 <Truck className="h-6 w-6 text-indigo-400 mb-1" />
                 <span className="text-[10px] text-white/40 text-center uppercase font-bold">Free<br/>Shipping</span>
               </div>
               <div className="flex flex-col items-center">
                 <RotateCcw className="h-6 w-6 text-indigo-400 mb-1" />
                 <span className="text-[10px] text-white/40 text-center uppercase font-bold">Easy<br/>Returns</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const AdminPage = () => {
    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const formData = new FormData(form);
      const cjId = formData.get("cj_id") as string;

      try {
        const res = await fetch('/api/cj/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cjProductId: cjId })
        });
        const data = await res.json();
        
        if (data.success) {
          const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
          const newProduct: Product = { ...data.product, firb_id: "", id: newId };
          const docRef = await addDoc(collection(db, "products"), newProduct);
          const finalProduct = { ...newProduct, firb_id: docRef.id };
          
          setProducts(prev => [...prev, finalProduct]);
          setFilteredProducts(prev => [...prev, finalProduct]);
          setOriginalProducts(prev => [...prev, finalProduct]);
          
          setIsAdminDialogOpen(false);
          alert(`Imported: ${data.product.name}`);
        } else {
          console.error("Failed to scalp product from CJ:", data.error);
          alert("Failed to scalp product from CJ Dropshipping.");
        }
      } catch (error: any) {
        console.error("Error importing product: ", error);
        alert(`Persistence Error: ${error.message || "Could not save to Firestore"}`);
      }
    };

    const handleEditProduct = (product: Product) => {
      console.log(product);
      setEditingProduct(product);
      setIsAdminDialogOpen(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const updatedProduct: Partial<Product> = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        brand: formData.get("brand") as string,
        image: formData.get("image") as string,
        stock: parseInt(formData.get("stock") as string),
      };
      try {
        if (!editingProduct) {
          console.error("No product is being edited.");
          return;
        }

        console.log(editingProduct);
        const productId = editingProduct.firb_id;

        console.log(`Updating product with ID: ${productId}`);
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log(docSnap);

          console.error("No such document!");
          return;
        }
        console.log("Document exists:", docSnap.data());
        await updateDoc(docRef, updatedProduct);
        console.log("Document updated successfully");
        // Update the local state
        setProducts(
          products.map((product) =>
            product.id === editingProduct.id
              ? { ...product, ...updatedProduct }
              : product
          )
        );
        setIsAdminDialogOpen(false);
        setEditingProduct(null);
      } catch (error) {
        console.error("Error updating document: ", error);
      }
    };

    const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
    const [isTrendingLoading, setIsTrendingLoading] = useState(false);
    const [isTrendingDialogOpen, setIsTrendingDialogOpen] = useState(false);
    const [importingProductId, setImportingProductId] = useState<string | null>(null);
    const [visibleTrendingCount, setVisibleTrendingCount] = useState(20);

    const fetchTrending = async (isChange = false) => {
      if (!isChange) setIsTrendingDialogOpen(true);
      setIsTrendingLoading(true);
      try {
        const res = await fetch('/api/cj/trending');
        const data = await res.json();
        if (data.success) {
          setTrendingProducts(data.products);
          setVisibleTrendingCount(20); // Reset count on new fetch
        }
      } catch (err) {
        console.error("Error fetching trending:", err);
      } finally {
        setIsTrendingLoading(false);
      }
    };

    const handleLoadMoreTrending = useCallback(() => {
      setVisibleTrendingCount(prev => Math.min(prev + 10, trendingProducts.length));
    }, [trendingProducts.length]);

    const observer = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useCallback((node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (node) {
        observer.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              handleLoadMoreTrending();
            }
          },
          { threshold: 0.1 }
        );
        observer.current.observe(node);
      }
    }, [handleLoadMoreTrending]);

    const handleImportTrending = async (cjId: string) => {
      setImportingProductId(cjId);
      try {
        const res = await fetch('/api/cj/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cjProductId: cjId })
        });
        const data = await res.json();
        
        if (data.success) {
          const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
          const newProduct: Product = { ...data.product, firb_id: "", id: newId };
          const docRef = await addDoc(collection(db, "products"), newProduct);
          const finalProduct = { ...newProduct, firb_id: docRef.id };
          
          setProducts(prev => [...prev, finalProduct]);
          setFilteredProducts(prev => [...prev, finalProduct]);
          setOriginalProducts(prev => [...prev, finalProduct]);
          
          alert(`Imported: ${data.product.name}`);
        } else {
          alert("Failed to scalp product data from CJ.");
        }
      } catch (error: any) {
        console.error("Error importing trending product:", error);
        alert(`Persistence Error: ${error.message || "Could not save to Firestore"}`);
      } finally {
        setImportingProductId(null);
      }
    };

    const handleDeleteProduct = async (product: Product) => {
      console.log(product);

      try {
        if (!product) {
          console.error("No product is being deleted.");
          return;
        }
        const productId = product.firb_id;
        await deleteDoc(doc(db, "products", productId));

        // Update the local state by filtering out the deleted product
        setProducts(products.filter((laptp) => laptp.id !== product.id));

        console.log("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    };

    const handleDeleteOrder = async (order: Order) => {
      if (!order) {
        console.error("No order is being deleted.");
        return;
      }
      const orderId = order.id; // Ensure orderId is a string
      try {
        await deleteDoc(doc(db, "orders", orderId));
        // Update the local state by filtering out the deleted order
        setOrders(orders.filter((ord) => ord.id !== order.id));
        console.log("Order document deleted successfully");
      } catch (error) {
        console.error("Error deleting order: ", error); // Log any errors
      }
    };

    const handleCJFulfill = async (order: Order) => {
      if (order.status === 'forwarded_to_cj' || order.status === 'shipped' || order.status === 'delivered') {
        alert("Order is already fulfilled or shipped.");
        return;
      }
      try {
        const res = await fetch('/api/cj/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        const data = await res.json();
        if (data.success) {
          alert(`Successfully forwarded to CJ Dropshipping! CJ Order ID: ${data.fulfillment.cj_order_id}`);
          updateOrderStatus(order.id, 'forwarded_to_cj' as any);
        } else {
          alert("Failed to forward order to CJ Dropshipping.");
        }
      } catch (error) {
        console.error("Error fulfilling order:", error);
      }
    };

    const [selectedTab, setSelectedTab] = useState("products");

    const handleTabSwitch = (tabValue: string) => {
      // Function to update selectedTab on switch");
      setSelectedTab(tabValue);
    };

    useEffect(() => {
      const fetchUserOrders = async () => {
        try {
          const ordersCollection = collection(db, "orders");
          const q = query(ordersCollection);
          const querySnapshot = await getDocs(q);
          const orders = querySnapshot.docs.map((doc) => doc.data() as Order);
        } catch (error) {}
      };

      fetchUserOrders();
    });

    const totalRevenue = getTotalRevenue();
    const totalSold = getTotalSold();
    const totalStock = getTotalStock();
    const safeTotalRevenue = isNaN(totalRevenue)
      ? "N/A"
      : totalRevenue.toString();
    const safeTotalSold = isNaN(totalSold) ? "N/A" : totalSold.toString();
    const safeTotalStock = isNaN(totalStock) ? "N/A" : totalStock.toString();

    return (
      <>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Admin Panel
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeTotalRevenue} </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Products Sold
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeTotalSold}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Stock
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{safeTotalStock}</div>
              </CardContent>
            </Card>
          </div>
          <Tabs defaultValue={selectedTab} className="space-y-4">
            <TabsList>
              <TabsTrigger
                value="products"
                onClick={() => handleTabSwitch("products")}
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                onClick={() => handleTabSwitch("orders")}
              >
                Orders
              </TabsTrigger>
            </TabsList>
            {selectedTab === "products" && (
              <TabsContent value="products" className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                    Product Inventory
                  </h2>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => fetchTrending()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                    >
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Scalp Trending
                    </Button>
                    <Dialog
                      open={isAdminDialogOpen}
                      onOpenChange={setIsAdminDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setEditingProduct(null)}
                          className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-black/80 backdrop-blur-xl text-white border border-white/20">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                            {editingProduct ? "Edit Product" : "Scalp CJ Product"}
                          </DialogTitle>
                          <DialogDescription className="text-white/70">
                            {editingProduct
                              ? "Update the product details below."
                              : "Enter a CJ Dropshipping Product ID to automatically scalp and import the product."}
                          </DialogDescription>
                        </DialogHeader>
                        <form
                          onSubmit={
                            editingProduct
                              ? handleUpdateProduct
                              : handleAddProduct
                          }
                        >
                          <div className="grid gap-4 py-4">
                            {editingProduct ? (
                              <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="name" className="text-right">
                                    Name
                                  </Label>
                                  <Input
                                    id="name"
                                    name="name"
                                    defaultValue={editingProduct.name}
                                    className="col-span-3 bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label
                                    htmlFor="description"
                                    className="text-right"
                                  >
                                    Description
                                  </Label>
                                  <Input
                                    id="description"
                                    name="description"
                                    defaultValue={editingProduct.description}
                                    className="col-span-3 bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="price" className="text-right">
                                    Price
                                  </Label>
                                  <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    defaultValue={editingProduct.price}
                                    className="col-span-3 bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="brand" className="text-right">
                                    Brand
                                  </Label>
                                  <Input
                                    id="brand"
                                    name="brand"
                                    defaultValue={editingProduct.brand}
                                    className="col-span-3 bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="image" className="text-right">
                                    Image URL
                                  </Label>
                                  <Input
                                    id="image"
                                    name="image"
                                    defaultValue={editingProduct.image}
                                    className="col-span-3 bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="stock" className="text-right">
                                    Stock
                                  </Label>
                                  <Input
                                    id="stock"
                                    name="stock"
                                    type="number"
                                    defaultValue={editingProduct.stock}
                                    className="col-span-3 bg-white/10 border-white/20 text-white"
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="cj_id" className="text-right">
                                  CJ ID
                                </Label>
                                <Input
                                  id="cj_id"
                                  name="cj_id"
                                  placeholder="e.g. CJPL123456"
                                  className="col-span-3 bg-white/10 border-white/20 text-white"
                                  required
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setIsAdminDialogOpen(false)}
                              className="text-white hover:bg-white/10"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-green-500 hover:via-blue-600 hover:to-purple-700 text-white"
                            >
                              {editingProduct ? "Update Product" : "Scalp & Import"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    {/* Trending Products Dialog */}
                    <Dialog open={isTrendingDialogOpen} onOpenChange={setIsTrendingDialogOpen}>
                      <DialogContent className="max-w-4xl bg-black/90 backdrop-blur-2xl text-white border border-white/10 max-h-[80vh] overflow-y-auto">
                        <DialogHeader className="flex flex-row items-center justify-between">
                          <div>
                            <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                              Trending High-Sales Products
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                              Discover the top-performing items on CJ Dropshipping right now.
                            </DialogDescription>
                          </div>
                          <Button 
                            variant="outline" 
                            onClick={() => fetchTrending(true)}
                            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Change Products
                          </Button>
                        </DialogHeader>
                        
                        {isTrendingLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-indigo-400 animate-pulse">Analyzing market trends...</p>
                          </div>
                        ) : (
                          <div className="mt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {trendingProducts.slice(0, visibleTrendingCount).map((p) => (
                                <div key={p.cj_id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex space-x-4 group hover:bg-white/10 transition-all">
                                  <img src={p.image} className="w-24 h-24 object-cover rounded-lg" alt={p.name} />
                                  <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                      <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{p.name}</h4>
                                      <p className="text-xs text-white/40 line-clamp-2">{p.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-green-400 font-bold">${p.price}</span>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleImportTrending(p.cj_id)} 
                                        disabled={importingProductId === p.cj_id}
                                        className="bg-indigo-500 hover:bg-indigo-600 h-8 px-4 text-xs font-bold"
                                      >
                                        {importingProductId === p.cj_id ? (
                                          <div className="flex items-center">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Importing...
                                          </div>
                                        ) : (
                                          "Import Now"
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {/* Sentinel for IntersectionObserver */}
                            <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-4">
                              {visibleTrendingCount < trendingProducts.length && (
                                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead className="min-w-[200px]">Product</TableHead>
                        <TableHead className="min-w-[150px]">
                          Description
                        </TableHead>
                        <TableHead className="min-w-[200px]">Price</TableHead>
                        <TableHead className="min-w-[100px]">Brand</TableHead>
                        <TableHead className="min-w-[100px]">Stock</TableHead>
                        <TableHead className="min-w-[150px]">Sold</TableHead>
                        <TableHead className="min-w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products
                        .sort((a, b) => a.id - b.id)
                        .map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.id}</TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.description}</TableCell>
                            <TableCell>
                              {" "}
                              {product.price ? product.price.toFixed(2) : "N/A"}
                            </TableCell>
                            <TableCell>{product.brand}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>{product.sold}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditProduct(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(product)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}
            {selectedTab === "orders" && (
              <TabsContent value="orders" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Manage Orders</h2>
                  <Button
                    onClick={() => {
                      const data = orders.map((order) => ({
                        OrderID: order.id,
                        Product: order.items
                          .map((item) => item.name)
                          .join(", "),
                        Customer: order.customerName,
                        Address: order.address,
                        Total: order.total,
                        Status: order.status,
                        Date: order.date,
                      }));

                      const csvContent = [
                        "sep=,",
                        Object.keys(data[0]).join(","),
                        ...data.map((row) => Object.values(row).join(",")),
                      ].join("\r\n");

                      const blob = new Blob([csvContent], {
                        type: "application/vnd.ms-excel;charset=utf-8;",
                      });

                      const link = document.createElement("a");
                      const url = URL.createObjectURL(blob);
                      link.setAttribute("href", url);
                      link.setAttribute("download", "orders.xls");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    Download Orders Data
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">ID</TableHead>
                        <TableHead className="min-w-[200px]">Product</TableHead>
                        <TableHead className="min-w-[150px]">
                          Customer
                        </TableHead>
                        <TableHead className="min-w-[200px]">Address</TableHead>
                        <TableHead className="min-w-[100px]">Total</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[150px]">Date</TableHead>
                        <TableHead className="min-w-[200px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders && orders.length > 0 ? (
                        orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.id}</TableCell>
                            <TableCell>
                              {order.items
                                ?.map((item) => item.name)
                                .join(", ") || "No items"}
                            </TableCell>
                            <TableCell>{order.customerName || "N/A"}</TableCell>
                            <TableCell>{order.address || "N/A"}</TableCell>
                            <TableCell>
                              ₹{order.total?.toFixed(2) || "0.00"}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`capitalize ${
                                  order.status === "delivered"
                                    ? "text-green-500"
                                    : order.status === "shipped"
                                    ? "text-blue-500"
                                    : "text-yellow-500"
                                }`}
                              >
                                {order.status || "pending"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {new Date(order.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-indigo-500 hover:bg-indigo-600 text-white border-none"
                                onClick={() => handleCJFulfill(order)}
                              >
                                Fulfill via CJ
                              </Button>
                              <Select
                                onValueChange={(value) =>
                                  updateOrderStatus(
                                    order.id.toString(),
                                    value as "pending" | "shipped" | "delivered"
                                  )
                                }
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="forwarded_to_cj">
                                    Forwarded
                                  </SelectItem>
                                  <SelectItem value="shipped">
                                    Shipped
                                  </SelectItem>
                                  <SelectItem value="delivered">
                                    Delivered
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrder(order)}
                              >
                                <Trash className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center">
                            No orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
            <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl text-white border border-white/20">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
              </DialogHeader>
              <form
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                className="space-y-4"
              >
                {!editingProduct ? (
                  <div>
                    <Label htmlFor="cj_id">CJ Dropshipping Product ID</Label>
                    <Input
                      id="cj_id"
                      name="cj_id"
                      placeholder="e.g. 12345678"
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={editingProduct?.name}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        defaultValue={editingProduct?.description}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Retail Price</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        defaultValue={editingProduct?.price}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        name="brand"
                        defaultValue={editingProduct?.brand}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        name="stock"
                        type="number"
                        defaultValue={editingProduct?.stock}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        type="text"
                        defaultValue={editingProduct?.image}
                        className="bg-white/10 border-white/20 text-white"
                        required
                      />
                    </div>
                  </>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                >
                  {editingProduct ? "Update Product" : "Scalp CJ Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  };
  const OrdersPage = () => {
    const [customerName, setCustomerName] = useState("");
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [newAddress, setNewAddress] = useState("");
    const [isEditAddressDialogOpen, setIsEditAddressDialogOpen] =
      useState(false);

    // Fetch user's orders when component mounts

    useEffect(() => {
      const fetchUserOrders = async () => {
        try {
          // Get current user data
          const user = localStorage.getItem("user");
          if (!user) return;

          const userData = JSON.parse(user);
          const userName = userData.displayName || userData.name;

          const ordersCollection = collection(db, "orders");
          const q = query(ordersCollection);
          const querySnapshot = await getDocs(q);

          // Filter orders for current user
          const ordersData = querySnapshot.docs
            .map(
              (doc) =>
                ({
                  ...doc.data(),
                  id: doc.id,
                } as Order)
            )
            .filter((order) => order.customerName === userName);
          setUserOrders(ordersData);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      };

      fetchUserOrders();
    }, []); // Empty dependency array for single fetch

    // Handle address update
    const handleUpdateAddress = async () => {
      if (!selectedOrder || !newAddress) return;

      try {
        const orderRef = doc(db, "orders", selectedOrder.id);
        await updateDoc(orderRef, {
          address: newAddress,
        });

        // Update local state
        setUserOrders((prevOrders) =>
          prevOrders.filter((o) => o.id !== selectedOrder.id)
        );

        setIsEditAddressDialogOpen(false);
        setNewAddress("");
        setSelectedOrder(null);
      } catch (error) {
        console.error("Error updating address:", error);
      }
    };

    // Handle order cancellation
    const handleCancelOrder = async (order: Order) => {
      if (order.status !== "pending") {
        alert("Only pending orders can be cancelled");
        return;
      }

      try {
        const orderRef = doc(db, "orders", order.id);
        await deleteDoc(orderRef);
        setUserOrders((prevOrders) =>
          prevOrders.filter((o) => o.id !== order.id)
        );
      } catch (error) {
        console.error("Error cancelling order:", error);
      }
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          My Orders
        </h1>

        <div className="space-y-6">
          {userOrders.length === 0 ? (
            <p className="text-center text-gray-400">No orders found</p>
          ) : (
            userOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white/5 rounded-lg p-6 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">Order #{order.id}</h2>
                    <p className="text-sm text-gray-400">{order.date}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      order.status === "delivered"
                        ? "bg-green-500/20 text-green-400"
                        : order.status === "shipped"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2">
                  <p>
                    <span className="text-gray-400">Delivery Address:</span>{" "}
                    {order.address}
                  </p>
                  <p>
                    <span className="text-gray-400">Total Amount:</span> ₹
                    {order.total.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Items:</h3>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {item.name} x {item.quantity}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewAddress(order.address);
                      setIsEditAddressDialogOpen(true);
                    }}
                    disabled={order.status !== "pending"}
                  >
                    Update Address
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(order)}
                    disabled={order.status !== "pending"}
                  >
                    Cancel Order
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Dialog
          open={isEditAddressDialogOpen}
          onOpenChange={setIsEditAddressDialogOpen}
        >
          <DialogContent className="sm:max-w-[425px] bg-black/80 backdrop-blur-xl text-white border border-white/20">
            <DialogHeader>
              <DialogTitle>Update Delivery Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>New Address</Label>
                <Textarea
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Enter new delivery address"
                />
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsEditAddressDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateAddress}>Update Address</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  const [userRole, setUserRole] = useState<string>("user");
  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      {/* 2026 Premium Glassmorphism Background Orbs */}
      <div className="fixed inset-0 z-[0] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[60vw] bg-pink-600/10 rounded-full mix-blend-screen filter blur-[150px] animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      <div className="relative z-10">
        <Header />
        <main>
          {currentPage === "home" && <HomePage />}
          {currentPage === "products" && <ProductsPage />}
          {currentPage === "about" && <AboutPage />}
          {currentPage === "contact" && <ContactPage />}
          {currentPage === "checkout" && <CheckoutPage />}
          {currentPage === "orders" && <OrdersPage />}
          {currentPage === "admin" && <AdminPage />}
        </main>
        <Footer />
      </div>
    </div>
  );
}
