import React, { useState, createContext, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ShoppingCart, Plus, Minus, Trash2, ChevronRight, Check, X, Search } from 'lucide-react';
import LiquidEther from './components/LiquidEther/LiquidEther';
import GradientText from './components/GradientText/GradientText';
import Orb from './components/Orb/Orb';

// Cart Context
const CartContext = createContext();

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

// Google Sheets API URL - UPDATE THIS WITH YOUR WEB APP URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyQNLHXp9Fzi0_mVxYmV7M0xSA2bqteLxIDzA96nAsaIObDEAhwGN9oX1lOAoY72BaL/exec';

// Fallback Menu Data (used if Google Sheets fetch fails)
const fallbackMenuData = [
  { id: 1, name: 'Margherita Pizza', category: 'Pizza', sizes: [{ name: 'Small', price: 10.99 }, { name: 'Medium', price: 12.99 }, { name: 'Large', price: 15.99 }], image: 'assets/images/food/pepperoni.png', description: 'Classic tomato sauce, mozzarella, fresh basil', popular: true },
  { id: 2, name: 'Pepperoni Pizza', category: 'Pizza', sizes: [{ name: 'Small', price: 12.99 }, { name: 'Medium', price: 14.99 }, { name: 'Large', price: 17.99 }], image: 'assets/images/food/burgerpizza.png', description: 'Loaded with pepperoni and mozzarella', popular: true },
  { id: 3, name: 'BBQ Chicken Pizza', category: 'Pizza', sizes: [{ name: 'Small', price: 13.99 }, { name: 'Medium', price: 15.99 }, { name: 'Large', price: 18.99 }], image: 'assets/images/food/pepperoni.png', description: 'BBQ sauce, grilled chicken, red onions', popular: false },
  { id: 4, name: 'Veggie Supreme', category: 'Pizza', sizes: [{ name: 'Small', price: 11.99 }, { name: 'Medium', price: 13.99 }, { name: 'Large', price: 16.99 }], image: 'assets/images/food/pepperoni.png', description: 'Mushrooms, peppers, olives, onions', popular: false },

  { id: 5, name: 'Classic Burger', category: 'Burgers', price: 9.99, image: 'assets/images/food/pepperoni.png', description: 'Beef patty, lettuce, tomato, cheese', popular: true },
  { id: 6, name: 'Bacon Cheeseburger', category: 'Burgers', price: 11.99, image: 'assets/images/food/pepperoni.png', description: 'Double beef, bacon, cheddar cheese', popular: true },
  { id: 7, name: 'Veggie Burger', category: 'Burgers', price: 10.99, image: 'assets/images/food/pepperoni.png', description: 'Plant-based patty, avocado, sprouts', popular: false },
  { id: 8, name: 'Chicken Burger', category: 'Burgers', price: 10.49, image: 'assets/images/food/pepperoni.png', description: 'Grilled chicken breast, mayo, lettuce', popular: false },

  { id: 9, name: 'Spaghetti Carbonara', category: 'Pasta', price: 13.99, image: 'assets/images/food/pepperoni.png', description: 'Creamy sauce, bacon, parmesan', popular: true },
  { id: 10, name: 'Penne Arrabiata', category: 'Pasta', price: 12.49, image: 'assets/images/food/pepperoni.png', description: 'Spicy tomato sauce, garlic, herbs', popular: false },
  { id: 11, name: 'Fettuccine Alfredo', category: 'Pasta', price: 13.49, image: 'assets/images/food/pepperoni.png', description: 'Rich cream sauce, parmesan cheese', popular: true },
  { id: 12, name: 'Lasagna', category: 'Pasta', price: 14.99, image: 'assets/images/food/pepperoni.png', description: 'Layered pasta, beef, ricotta, mozzarella', popular: false },

  { id: 13, name: 'Caesar Salad', category: 'Salads', price: 8.99, image: 'assets/images/food/pepperoni.png', description: 'Romaine, croutons, parmesan, caesar dressing', popular: true },
  { id: 14, name: 'Greek Salad', category: 'Salads', price: 9.49, image: 'assets/images/food/pepperoni.png', description: 'Feta, olives, cucumber, tomatoes', popular: false },
  { id: 15, name: 'Caprese Salad', category: 'Salads', price: 10.99, image: 'assets/images/food/pepperoni.png', description: 'Fresh mozzarella, tomatoes, basil', popular: false },

  { id: 16, name: 'Coca Cola', category: 'Drinks', price: 2.99, image: 'assets/images/food/pepperoni.png', description: 'Classic cola, 500ml', popular: true },
  { id: 17, name: 'Fresh Lemonade', category: 'Drinks', price: 3.49, image: 'assets/images/food/pepperoni.png', description: 'Freshly squeezed lemon juice', popular: true },
  { id: 18, name: 'Iced Tea', category: 'Drinks', price: 2.99, image: 'assets/images/food/pepperoni.png', description: 'Peach iced tea', popular: false },

  { id: 19, name: 'Chocolate Cake', category: 'Desserts', price: 6.99, image: 'assets/images/food/pepperoni.png', description: 'Rich chocolate layer cake', popular: true },
  { id: 20, name: 'Tiramisu', category: 'Desserts', price: 7.49, image: 'assets/images/food/pepperoni.png', description: 'Italian coffee-flavored dessert', popular: true },
];

const categories = ['All', 'Pizza', 'Burgers', 'Pasta', 'Salads', 'Drinks', 'Desserts'];

// Main App Component
export default function RestaurantApp() {
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState(null);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');

  // Products state
  const [menuData, setMenuData] = useState(fallbackMenuData);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // State for patient appointment lookup
  const [appointmentToken, setAppointmentToken] = useState(null);

  // Check URL parameters for payment status (after GCash redirect) or patient appointment
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const orderNumber = urlParams.get('order');
    const page = urlParams.get('page');
    const token = urlParams.get('token');

    if (payment && orderNumber) {
      setPaymentStatus(payment);
      setPendingOrderNumber(orderNumber);
      setCurrentPage(payment === 'success' ? 'confirmation' : 'payment-failed');
      // Clear cart if payment successful
      if (payment === 'success') {
        setCartItems([]);
        localStorage.removeItem('pendingOrder');
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (page === 'my-appointment') {
      // Patient appointment lookup page
      if (token) {
        setAppointmentToken(token);
      }
      setCurrentPage('my-appointment');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Fetch products from Google Sheets on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setProductsError(null);

        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();

        if (data.success && data.products && data.products.length > 0) {
          setMenuData(data.products);
        } else {
          setMenuData(fallbackMenuData);
          setProductsError('Using offline menu data');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setMenuData(fallbackMenuData);
        setProductsError('Using offline menu data');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Initialize OneSignal Push Notifications
  useEffect(() => {
    if (typeof window !== 'undefined' && window.OneSignalDeferred) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        await OneSignal.init({
          appId: "22fa0af9-4790-4b61-9f6d-573237f0585d", // Replace with your OneSignal App ID
          notifyButton: {
            enable: true,
            size: 'small',
            position: 'bottom-right',
            prenotify: true,
            showCredit: false,
            text: {
              'tip.state.unsubscribed': 'Get order updates',
              'tip.state.subscribed': 'You\'re subscribed!',
              'tip.state.blocked': 'Notifications blocked',
              'message.prenotify': 'Click to receive order updates',
              'message.action.subscribed': 'Thanks for subscribing!',
              'dialog.main.title': 'Manage Notifications',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            }
          },
          welcomeNotification: {
            title: "Welcome to Kuchefnero!",
            message: "You'll receive order updates here."
          }
        });
      });
    }
  }, []);

  // Clear cart function
  const clearCart = () => {
    setCartItems([]);
  };

  const addToCart = (item, selectedSize = null) => {
    console.log('addToCart called:', { item, selectedSize, hasSizes: !!item.sizes });

    // For items with sizes, we need size info
    if (item.sizes && !selectedSize) {
      console.log('Opening size modal for:', item.name);
      setSelectedProduct(item);
      setShowSizeModal(true);
      return;
    }

    // Create cart item with size info if applicable
    const cartItem = selectedSize
      ? { ...item, selectedSize: selectedSize.name, price: selectedSize.price, displayName: `${item.name} (${selectedSize.name})` }
      : item;

    // Find existing item by id AND size (if applicable)
    const existingItem = cartItems.find(i =>
      i.id === item.id && (!selectedSize || i.selectedSize === selectedSize.name)
    );

    if (existingItem) {
      setCartItems(cartItems.map(i =>
        (i.id === item.id && (!selectedSize || i.selectedSize === selectedSize.name))
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCartItems([...cartItems, { ...cartItem, quantity: 1 }]);
    }

    // Close modal if it was open
    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  const removeFromCart = (id, selectedSize = null) => {
    setCartItems(cartItems.filter(item =>
      !(item.id === id && (!selectedSize || item.selectedSize === selectedSize))
    ));
  };

  const updateQuantity = (id, newQuantity, selectedSize = null) => {
    if (newQuantity === 0) {
      removeFromCart(id, selectedSize);
    } else {
      setCartItems(cartItems.map(item =>
        (item.id === id && (!selectedSize || item.selectedSize === selectedSize))
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={contextValue}>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
        /* Hide scrollbar for category filter */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        /* Animated underline effect for nav links */
        .nav-link {
          position: relative;
          padding-bottom: 4px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #55A2F5, #3B8BE0);
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        /* Button hover animation */
        .btn-animated {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .btn-animated::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        .btn-animated:hover::before {
          left: 100%;
        }
        /* Smooth scale on hover */
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        /* Letter spacing for modern look */
        .tracking-tight {
          letter-spacing: -0.02em;
        }
        /* Random card animations */
        @keyframes card-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes card-bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-12px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-6px); }
        }
        @keyframes card-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          50% { box-shadow: 0 0 30px rgba(42,102,144,0.6), 0 0 60px rgba(42,102,144,0.3); }
        }
        @keyframes card-flip {
          0% { transform: perspective(800px) rotateY(0deg); }
          50% { transform: perspective(800px) rotateY(180deg); }
          100% { transform: perspective(800px) rotateY(360deg); }
        }
        @keyframes card-slide-in {
          0% { transform: translateX(-100%); opacity: 0; }
          60% { transform: translateX(10px); opacity: 1; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes card-wobble {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-3deg); }
          30% { transform: rotate(3deg); }
          45% { transform: rotate(-2deg); }
          60% { transform: rotate(2deg); }
          75% { transform: rotate(-1deg); }
        }
        @keyframes card-fade-scale {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1); }
        }
        .card-animate-pulse { animation: card-pulse 0.8s ease-in-out; }
        .card-animate-bounce { animation: card-bounce 0.8s ease-in-out; }
        .card-animate-shake { animation: card-shake 0.6s ease-in-out; }
        .card-animate-glow { animation: card-glow 1.2s ease-in-out; }
        .card-animate-flip { animation: card-flip 1s ease-in-out; }
        .card-animate-slide { animation: card-slide-in 0.8s ease-out; }
        .card-animate-wobble { animation: card-wobble 0.8s ease-in-out; }
        .card-animate-fade { animation: card-fade-scale 0.8s ease-out; }
        /* Blinking border for announcing */
        @keyframes border-blink {
          0%, 100% { border-color: #3A7CA5; }
          50% { border-color: transparent; }
        }
        .animate-border-blink {
          animation: border-blink 0.8s ease-in-out infinite;
          border-width: 4px;
        }
        /* Marquee scrolling animation */
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        /* Blue Color Palette for Clinic */
        .bg-green-600 {
          background-color: #2563EB !important;
        }
        .bg-green-500 {
          background-color: #3B82F6 !important;
        }
        .bg-green-700 {
          background-color: #1D4ED8 !important;
        }
        .bg-green-400 {
          background-color: #60A5FA !important;
        }
        .bg-green-100 {
          background-color: #DBEAFE !important;
        }
        .bg-green-50 {
          background-color: #EFF6FF !important;
        }
        .text-green-600 {
          color: #2563EB !important;
        }
        .text-green-400 {
          color: #60A5FA !important;
        }
        .text-green-100 {
          color: #DBEAFE !important;
        }
        .text-green-700 {
          color: #1D4ED8 !important;
        }
        .text-green-200 {
          color: #BFDBFE !important;
        }
        .border-green-600 {
          border-color: #2563EB !important;
        }
        .border-green-300 {
          border-color: #93C5FD !important;
        }
        .border-green-400 {
          border-color: #60A5FA !important;
        }
        .border-green-500 {
          border-color: #3B82F6 !important;
        }
        .hover\\:bg-green-700:hover {
          background-color: #1D4ED8 !important;
        }
        .hover\\:bg-green-500:hover {
          background-color: #3B82F6 !important;
        }
        .hover\\:text-green-600:hover {
          color: #2563EB !important;
        }
        .hover\\:bg-green-100:hover {
          background-color: #DBEAFE !important;
        }
        .hover\\:bg-green-50:hover {
          background-color: #EFF6FF !important;
        }
        .from-green-900 {
          --tw-gradient-from: #1e3a5f !important;
        }
        .to-green-900 {
          --tw-gradient-to: #1e3a5f !important;
        }
        .via-green-900 {
          --tw-gradient-via: #1e3a5f !important;
        }
        .from-green-400 {
          --tw-gradient-from: #60A5FA !important;
        }
        .to-green-500 {
          --tw-gradient-to: #3B82F6 !important;
        }
        .focus\\:border-green-500:focus {
          border-color: #3B82F6 !important;
        }
        .focus\\:border-green-700:focus {
          border-color: #1D4ED8 !important;
        }
      `}</style>
      {/* LiquidEther background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: '#000' }}>
        <LiquidEther
          colors={['#5227FF', '#FF9FFC', '#B19EEF']}
          mouseForce={20}
          cursorSize={100}
          isViscous={true}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* ── Global Admin Sidebar ── */}
      {['admin', 'frontdesk', 'checkin', 'queue', 'queue-teller'].includes(currentPage) && (
        <aside style={{ position: 'fixed', top: '80px', left: 0, width: '150px', height: 'calc(100vh - 80px)', background: '#1c1c1e', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', zIndex: 200 }}>
          {/* Brand */}
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em' }}>Hotel</p>
          </div>
          {/* Primary nav */}
          <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
            {[
              {
                id: 'dashboard', label: 'Dashboard', tabId: 'dashboard', act: () => { setAdminTab('dashboard'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 006 3.75h2.25A2.25 2.25 0 0010.5 6v2.25a2.25 2.25 0 00-2.25 2.25H6a2.25 2.25 0 00-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 006 18h2.25a2.25 2.25 0 002.25-2.25V13.5a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25v2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
              },
              {
                id: 'reservations', label: 'Reservations', tabId: 'reservations', act: () => { setAdminTab('reservations'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              },
              {
                id: 'frontdesk', label: 'Check-in/Out', tabId: 'frontdesk', act: () => setCurrentPage('frontdesk'),
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
              },
              {
                id: 'rooms', label: 'Rooms', tabId: 'rooms', act: () => { setAdminTab('rooms'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
              },
              {
                id: 'housekeeping', label: 'Housekeeping', tabId: 'housekeeping', act: () => { setAdminTab('housekeeping'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
              },
              {
                id: 'billing', label: 'Billing', tabId: 'billing', act: () => { setAdminTab('billing'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
              },
              {
                id: 'reports', label: 'Reports', tabId: 'reports', act: () => { setAdminTab('reports'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
              },
              {
                id: 'settings', label: 'Settings', tabId: 'settings', act: () => { setAdminTab('settings'); setCurrentPage('admin'); },
                icon: <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              },
            ].map(item => {
              const isActive = (currentPage === 'admin' && adminTab === item.tabId) || (item.id === 'frontdesk' && currentPage === 'frontdesk');
              return (
                <button key={item.id} onClick={item.act} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '14px 8px', borderRadius: '16px', border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent', color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}
                  className="group relative"
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'transparent'; } }}
                >
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {item.icon}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1, textAlign: 'center' }}>{item.label}</span>
                  {isActive && <div className="absolute left-0 w-1 h-8 bg-[#55A2F5] rounded-r-full shadow-[0_0_10px_#55A2F5]" />}
                </button>
              );
            })}
          </nav>
          {/* Sign out */}
          <div style={{ padding: '16px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <button onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminTokenExpiry'); setCurrentPage('home'); }} style={{ width: '100%', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)', background: 'transparent', border: '1px solid transparent', cursor: 'pointer', padding: '12px 8px', borderRadius: '12px', transition: 'all 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ff5f5f'; e.currentTarget.style.background = 'rgba(255,95,95,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,95,95,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
            >Sign Out</button>
          </div>
        </aside>
      )}

      <div className="min-h-screen pb-16 md:pb-0 pt-[70px] md:pt-[30px]" style={{ position: 'relative', zIndex: 1, marginLeft: ['admin', 'frontdesk', 'checkin', 'queue', 'queue-teller'].includes(currentPage) ? '150px' : 0 }}>
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        {currentPage === 'home' && (
          <HomePage
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === 'menu' && (
          <MenuPage
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            menuData={menuData}
            isLoading={isLoadingProducts}
          />
        )}
        {currentPage === 'cart' && <CartPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'checkout' && <CheckoutPage setCurrentPage={setCurrentPage} clearCart={clearCart} />}
        {currentPage === 'confirmation' && <ConfirmationPage setCurrentPage={setCurrentPage} orderNumber={pendingOrderNumber} paymentStatus={paymentStatus} />}
        {currentPage === 'payment-failed' && <PaymentFailedPage setCurrentPage={setCurrentPage} orderNumber={pendingOrderNumber} />}
        {currentPage === 'admin' && <AdminDashboard setCurrentPage={setCurrentPage} activeTab={adminTab} setActiveTab={setAdminTab} />}
        {currentPage === 'my-appointment' && <MyAppointment setCurrentPage={setCurrentPage} initialToken={appointmentToken} />}
        {currentPage === 'checkin' && <GuestCheckinPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'frontdesk' && <FrontDeskTab />}
        {currentPage === 'queue' && <QueuePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'queue-display' && <QueueDisplayPage />}
        {currentPage === 'queue-teller' && <QueueTellerPage setCurrentPage={setCurrentPage} />}
        {showCart && <CartDrawer setShowCart={setShowCart} setCurrentPage={setCurrentPage} />}
        {showSizeModal && selectedProduct && (
          <SizeModal
            product={selectedProduct}
            onClose={() => {
              console.log('Closing size modal');
              setShowSizeModal(false);
              setSelectedProduct(null);
            }}
            onSelectSize={(size) => {
              console.log('Size selected:', size);
              addToCart(selectedProduct, size);
            }}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#F5F3F5] border-t border-[#F5F3F5] md:hidden z-50 pb-safe">
          <div className="flex justify-around items-center py-2">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex flex-col items-center px-4 py-1 ${currentPage === 'home' ? 'text-[#302B27]' : 'text-[#302B27]'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => setCurrentPage('checkin')}
              className={`flex flex-col items-center px-4 py-1 ${currentPage === 'checkin' ? 'text-[#576CA8]' : 'text-[#302B27]'}`}
            >
              <span className="text-xl leading-none">🏨</span>
              <span className="text-xs font-medium mt-0.5">Check In</span>
            </button>
            <button
              onClick={() => setCurrentPage('frontdesk')}
              className={`flex flex-col items-center px-4 py-1 ${currentPage === 'frontdesk' ? 'text-[#576CA8]' : 'text-[#302B27]'}`}
            >
              <span className="text-xl leading-none">🛎️</span>
              <span className="text-xs font-medium mt-0.5">Front Desk</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setShowLoginMenu(!showLoginMenu)}
                className={`flex flex-col items-center px-4 py-1 ${showLoginMenu ? 'text-[#576CA8]' : 'text-[#302B27]'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-xs font-medium">Login</span>
              </button>
              {showLoginMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLoginMenu(false)} />
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-44 z-50">
                    <button
                      onClick={() => { setCurrentPage('queue-teller'); setShowLoginMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Teller Station
                    </button>
                    <button
                      onClick={() => { setCurrentPage('admin'); setShowLoginMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Admin Panel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </CartContext.Provider>
  );
}

// Size Selection Modal
function SizeModal({ product, onClose, onSelectSize }) {
  console.log('SizeModal rendering with product:', product);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-black text-green-600 mb-2">Select Size</h2>
        <p className="text-gray-600 font-bold mb-6">{product.name}</p>

        <div className="space-y-3">
          {product.sizes.map((size) => (
            <button
              key={size.name}
              onClick={() => onSelectSize(size)}
              className="w-full bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-600 rounded-lg p-4 flex items-center justify-between transition-all group"
            >
              <span className="font-bold text-gray-800 group-hover:text-green-600">{size.name}</span>
              <span className="text-xl font-black text-green-600">Php {size.price.toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reservation Form Component
function AppointmentForm() {
  const emptyForm = {
    title: 'Mr.',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    adults: '1',
    children: '0',
    specialRequests: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [roomTypes, setRoomTypes] = useState([]);
  const [availability, setAvailability] = useState({});

  const today = new Date().toISOString().split('T')[0];

  const nights = (() => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    return Math.max(0, Math.floor(
      (new Date(formData.checkOutDate) - new Date(formData.checkInDate)) / 86400000
    ));
  })();

  const selectedRoomInfo = availability[formData.roomType] || roomTypes.find(rt => rt.name === formData.roomType);
  const pricePerNight = selectedRoomInfo ? parseFloat(selectedRoomInfo.price_per_night) : 0;
  const totalPrice = pricePerNight * nights;

  // Fetch all room types on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/room-types')
      .then(r => r.json())
      .then(data => { if (data.success) setRoomTypes(data.roomTypes); })
      .catch(() => { });
  }, []);

  // Fetch availability when both dates are selected
  useEffect(() => {
    if (!formData.checkInDate || !formData.checkOutDate) {
      setAvailability({});
      return;
    }
    fetch(`http://localhost:5000/api/room-types/availability?checkIn=${formData.checkInDate}&checkOut=${formData.checkOutDate}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const map = {};
          data.availability.forEach(rt => { map[rt.name] = rt; });
          setAvailability(map);
        }
      })
      .catch(() => { });
  }, [formData.checkInDate, formData.checkOutDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Clear check-out if it's now before the new check-in
      if (name === 'checkInDate' && next.checkOutDate && next.checkOutDate <= value) {
        next.checkOutDate = '';
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    // Map to the shape the backend expects
    const payload = {
      fullName: `${formData.title} ${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      roomType: formData.roomType,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      numberOfGuests: parseInt(formData.adults) + parseInt(formData.children),
      specialRequests: formData.specialRequests
    };

    try {
      const response = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: data.message });
        setFormData(emptyForm);
      } else {
        setSubmitStatus({ type: 'error', message: data.message });
      }
    } catch {
      setSubmitStatus({ type: 'error', message: 'Unable to reach the server. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all text-white placeholder-white/40 text-sm";
  const labelCls = "block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5";
  const sectionCls = "flex items-center gap-3 mb-4";

  const SectionDivider = ({ icon, title }) => (
    <div className={sectionCls}>
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/70 shrink-0">
        {icon}
      </div>
      <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{title}</span>
      <div className="flex-1 h-px bg-white/15" />
    </div>
  );

  const totalRoomsAvailable = Object.values(availability).reduce((sum, rt) => sum + rt.available, 0);

  return (
    <div className="rounded-2xl border border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      {/* Header */}
      <div className="px-6 py-5" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg tracking-tight">Book Your Stay</h3>
            <p className="text-white/70 text-xs mt-0.5">Complete the form below to reserve your room</p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
            </span>
            <span className="text-white text-xs font-semibold tracking-wide">
              {Object.keys(availability).length > 0
                ? `${totalRoomsAvailable} Room${totalRoomsAvailable !== 1 ? 's' : ''} Available`
                : 'Rooms Available'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Status message */}
        {submitStatus.message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${submitStatus.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {submitStatus.type === 'success'
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
              }
            </svg>
            <span>{submitStatus.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SECTION 1: Your Stay ── */}
          <div>
            <SectionDivider
              title="Your Stay"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* Check-in / Check-out */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="relative">
                <label className={labelCls}>Check-in</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  min={today}
                  required
                  className={inputCls}
                />
              </div>
              <div className="relative">
                <label className={labelCls}>Check-out</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  min={formData.checkInDate ? (() => {
                    const d = new Date(formData.checkInDate);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().split('T')[0];
                  })() : today}
                  required
                  disabled={!formData.checkInDate}
                  className={`${inputCls} disabled:opacity-40 disabled:cursor-not-allowed`}
                />
              </div>
            </div>

            {/* Nights + price summary bar */}
            {nights > 0 && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-white/10 border border-white/20 rounded-lg">
                <svg className="w-4 h-4 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm font-semibold text-white">
                  {nights} {nights === 1 ? 'night' : 'nights'}
                </span>
                {totalPrice > 0 && (
                  <span className="text-xs font-bold text-white bg-white/15 px-2 py-0.5 rounded-full">
                    ₱{totalPrice.toLocaleString('en-PH')} total
                  </span>
                )}
                <span className="text-xs text-white/50 ml-auto">
                  {new Date(formData.checkInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' → '}
                  {new Date(formData.checkOutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}

            {/* Room Type */}
            <div>
              <label className={labelCls}>Room Type</label>
              <select
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-white/20 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all text-sm text-black bg-white"
              >
                <option value="">Select a room type</option>
                {roomTypes.map(rt => {
                  const avail = availability[rt.name];
                  const roomsLeft = avail ? avail.available : rt.total_rooms;
                  const soldOut = avail && avail.available === 0;
                  const price = parseFloat(rt.price_per_night).toLocaleString('en-PH');
                  const availNote = avail
                    ? (soldOut ? ' · FULLY BOOKED' : roomsLeft <= 3 ? ` · Only ${roomsLeft} left!` : ` · ${roomsLeft} available`)
                    : '';
                  return (
                    <option key={rt.id} value={rt.name} disabled={soldOut}>
                      {rt.name} — ₱{price}/night · {rt.description}{availNote}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* ── SECTION 2: Guest Information ── */}
          <div>
            <SectionDivider
              title="Guest Information"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            {/* Title + First + Last */}
            <div className="grid grid-cols-12 gap-3 mb-3">
              <div className="col-span-3">
                <label className={labelCls}>Title</label>
                <select name="title" value={formData.title} onChange={handleChange} className={inputCls}>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                  <option>Prof.</option>
                </select>
              </div>
              <div className="col-span-4 sm:col-span-4">
                <label className={labelCls}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First"
                  required
                  className={inputCls}
                />
              </div>
              <div className="col-span-5">
                <label className={labelCls}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="guest@email.com"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+63 9XX XXX XXXX"
                  required
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Occupancy ── */}
          <div>
            <SectionDivider
              title="Occupancy"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Adults</label>
                <select name="adults" value={formData.adults} onChange={handleChange} required className={inputCls}>
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={String(n)}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Children <span className="normal-case font-normal text-gray-400">(under 12)</span></label>
                <select name="children" value={formData.children} onChange={handleChange} className={inputCls}>
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={String(n)}>{n === 0 ? 'No children' : `${n} ${n === 1 ? 'Child' : 'Children'}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Special Requests ── */}
          <div>
            <SectionDivider
              title="Special Requests"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              }
            />
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. High floor, sea view, extra towels, early check-in (subject to availability)..."
              className={`${inputCls} resize-none`}
            />
            <p className="text-xs text-white/40 mt-1.5">We will do our best to accommodate your requests.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-animated w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white py-3.5 rounded-xl font-semibold text-sm tracking-wide hover:bg-[#465a8f] active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Processing Reservation...
              </>
            ) : (
              <>
                Confirm Reservation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Trust bar */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          {[
            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Secure Booking' },
            { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Instant Confirmation' },
            { icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z', label: '24/7 Support' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
              </div>
              <span className="text-xs text-white/50 font-medium leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Admin Dashboard Component
function AdminDashboard({ setCurrentPage, activeTab, setActiveTab }) {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard state
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Reschedule state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState({ appointments: [], blockedDates: [] });

  // Reports state
  const [reportStats, setReportStats] = useState(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  // Hotel reports sub-tab
  const [reportsSubTab, setReportsSubTab] = useState('appointments');
  const [hotelRptStart, setHotelRptStart] = useState('');
  const [hotelRptEnd, setHotelRptEnd] = useState('');
  const [hotelRptLoading, setHotelRptLoading] = useState(false);
  const [mgmtData, setMgmtData] = useState(null);
  const [finData, setFinData] = useState(null);
  const [finView, setFinView] = useState('daily');
  const [finYear, setFinYear] = useState(new Date().getFullYear());
  const [dailyRevData, setDailyRevData] = useState([]);
  const [monthlyRevData, setMonthlyRevData] = useState([]);

  // Settings state
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDoctorSpec, setNewDoctorSpec] = useState('');
  const [services, setServices] = useState([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(0);

  // Print modal
  const [printAppointment, setPrintAppointment] = useState(null);

  // Hotel Settings sub-tab & form state
  const [settingsSubTab, setSettingsSubTab] = useState('property');
  const [hotelSettings, setHotelSettings] = useState({
    hotel_name: '', hotel_address: '', hotel_phone: '', hotel_email: '',
    hotel_website: '', check_in_time: '14:00', check_out_time: '12:00',
    currency: 'PHP', min_stay_nights: '1', max_stay_nights: '30',
    advance_booking_days: '365', cancellation_policy: '',
    deposit_required: 'false', deposit_percentage: '50',
    sms_sender_name: '', email_sender_name: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [adminRoomTypes, setAdminRoomTypes] = useState([]);
  const [newRoomForm, setNewRoomForm] = useState({ name: '', description: '', total_rooms: 1, price_per_night: '', max_guests: 2, amenities: '', floor: 1, area: '' });
  const [editRoomId, setEditRoomId] = useState(null);
  const [editRoomForm, setEditRoomForm] = useState({});
  // Rate Codes admin state
  const [adminRateCodes, setAdminRateCodes] = useState([]);
  const [adminRoomTypesForRates, setAdminRoomTypesForRates] = useState([]);
  const [rcLoading, setRcLoading] = useState(false);
  const [rcNewForm, setRcNewForm] = useState({ code: '', name: '', description: '' });
  const [rcEditId, setRcEditId] = useState(null);
  const [rcPriceEdit, setRcPriceEdit] = useState(null); // rate_code_id being edited for prices
  const [rcPrices, setRcPrices] = useState({}); // { room_type_id: price }
  const [rcSaving, setRcSaving] = useState(false);
  const [rcMsg, setRcMsg] = useState('');

  // Check for existing session
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.valid) {
        setIsLoggedIn(true);
        fetchAppointments();
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch (error) {
      localStorage.removeItem('adminToken');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsLoggedIn(true);
        fetchAppointments();
      } else {
        setLoginError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch('http://localhost:5000/api/admin/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (filter !== 'all') params.append('status', filter);

      const url = params.toString()
        ? `http://localhost:5000/api/appointments/search?${params}`
        : 'http://localhost:5000/api/appointments';

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all appointments once on login
  useEffect(() => {
    if (isLoggedIn) {
      fetchAppointments();
    }
  }, [isLoggedIn]);

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setAppointments(prev => prev.map(apt =>
          apt.id === id ? { ...apt, status: newStatus } : apt
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  // Reschedule functions
  const openRescheduleModal = async (apt) => {
    setRescheduleModal(apt);
    setNewDate(apt.preferred_date);
    setNewTime(apt.preferred_time);
    // Fetch available slots for current date
    await fetchAvailableSlots(apt.preferred_date);
  };

  const fetchAvailableSlots = async (date) => {
    try {
      const response = await fetch(`http://localhost:5000/api/available-slots?date=${date}`);
      const data = await response.json();
      if (data.success) {
        // Include the current time slot as it's the appointment's own slot
        const slots = [...data.availableSlots];
        if (rescheduleModal && rescheduleModal.preferred_date === date) {
          if (!slots.includes(rescheduleModal.preferred_time)) {
            slots.push(rescheduleModal.preferred_time);
            slots.sort();
          }
        }
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleDateChange = async (date) => {
    setNewDate(date);
    setNewTime('');
    await fetchAvailableSlots(date);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;

    setIsRescheduling(true);
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${rescheduleModal.id}/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredDate: newDate, preferredTime: newTime })
      });
      const data = await response.json();

      if (data.success) {
        setAppointments(prev => prev.map(apt =>
          apt.id === rescheduleModal.id
            ? { ...apt, preferred_date: newDate, preferred_time: newTime }
            : apt
        ));
        setRescheduleModal(null);
      } else {
        alert(data.message || 'Failed to reschedule');
      }
    } catch (error) {
      console.error('Reschedule error:', error);
      alert('Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  // Client-side filtering
  const filteredAppointments = appointments.filter(apt => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        (apt.full_name && apt.full_name.toLowerCase().includes(q)) ||
        (apt.phone_number && apt.phone_number.includes(q)) ||
        (apt.email && apt.email.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    // Status filter
    if (filter !== 'all' && apt.status !== filter) return false;
    // Date range filter
    if (startDate && apt.preferred_date && apt.preferred_date.slice(0, 10) < startDate) return false;
    if (endDate && apt.preferred_date && apt.preferred_date.slice(0, 10) > endDate) return false;
    return true;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setFilter('all');
  };

  // Fetch calendar data
  const fetchCalendarData = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/calendar?month=${calendarMonth}&year=${calendarYear}`
      );
      const data = await response.json();
      if (data.success) {
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (reportStartDate) params.append('startDate', reportStartDate);
      if (reportEndDate) params.append('endDate', reportEndDate);

      const response = await fetch(`http://localhost:5000/api/reports/stats?${params}`);
      const data = await response.json();
      if (data.success) {
        setReportStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchManagementReport = async () => {
    setHotelRptLoading(true);
    const params = new URLSearchParams();
    if (hotelRptStart) params.append('startDate', hotelRptStart);
    if (hotelRptEnd) params.append('endDate', hotelRptEnd);
    try {
      const res = await fetch(`http://localhost:5000/api/reports/hotel/management?${params}`);
      const data = await res.json();
      if (data.success) setMgmtData(data);
    } catch (e) { console.error(e); }
    setHotelRptLoading(false);
  };

  const fetchFinancialReport = async () => {
    setHotelRptLoading(true);
    const params = new URLSearchParams();
    if (hotelRptStart) params.append('startDate', hotelRptStart);
    if (hotelRptEnd) params.append('endDate', hotelRptEnd);
    try {
      const [finRes, dailyRes] = await Promise.all([
        fetch(`http://localhost:5000/api/reports/hotel/financial?${params}`).then(r => r.json()),
        fetch(`http://localhost:5000/api/reports/hotel/daily?${params}`).then(r => r.json()),
      ]);
      if (finRes.success) setFinData(finRes);
      if (dailyRes.success) setDailyRevData(dailyRes.daily);
    } catch (e) { console.error(e); }
    setHotelRptLoading(false);
  };

  const fetchMonthlyReport = async () => {
    setHotelRptLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reports/hotel/monthly?year=${finYear}`);
      const data = await res.json();
      if (data.success) setMonthlyRevData(data.monthly);
    } catch (e) { console.error(e); }
    setHotelRptLoading(false);
  };

  // Fetch blocked dates
  const fetchBlockedDates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/blocked-dates');
      const data = await response.json();
      if (data.success) {
        setBlockedDates(data.blockedDates);
      }
    } catch (error) {
      console.error('Error fetching blocked dates:', error);
    }
  };

  // Add blocked date
  const addBlockedDate = async () => {
    if (!newBlockedDate) return;
    try {
      const response = await fetch('http://localhost:5000/api/blocked-dates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockedDate: newBlockedDate, reason: newBlockedReason })
      });
      const data = await response.json();
      if (data.success) {
        setBlockedDates([...blockedDates, data.blockedDate]);
        setNewBlockedDate('');
        setNewBlockedReason('');
      }
    } catch (error) {
      console.error('Error adding blocked date:', error);
    }
  };

  // Delete blocked date
  const deleteBlockedDate = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/blocked-dates/${id}`, { method: 'DELETE' });
      setBlockedDates(blockedDates.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting blocked date:', error);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctors');
      const data = await response.json();
      if (data.success) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  // Add doctor
  const addDoctor = async () => {
    if (!newDoctorName) return;
    try {
      const response = await fetch('http://localhost:5000/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newDoctorName, specialization: newDoctorSpec })
      });
      const data = await response.json();
      if (data.success) {
        setDoctors([...doctors, data.doctor]);
        setNewDoctorName('');
        setNewDoctorSpec('');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
    }
  };

  // Delete doctor
  const deleteDoctor = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/doctors/${id}`, { method: 'DELETE' });
      setDoctors(doctors.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  // Fetch services
  const fetchServices = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/services');
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Add service
  const addService = async () => {
    if (!newServiceName) return;
    try {
      const response = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newServiceName, duration: newServiceDuration, price: newServicePrice })
      });
      const data = await response.json();
      if (data.success) {
        setServices([...services, data.service]);
        setNewServiceName('');
        setNewServiceDuration(30);
        setNewServicePrice(0);
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  // Delete service
  const deleteService = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/services/${id}`, { method: 'DELETE' });
      setServices(services.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  // Hotel Settings
  const fetchHotelSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hotel-settings');
      const data = await response.json();
      if (data.success) setHotelSettings(prev => ({ ...prev, ...data.settings }));
    } catch (error) {
      console.error('Error fetching hotel settings:', error);
    }
  };

  const saveHotelSettings = async () => {
    setSavingSettings(true);
    setSettingsSavedMsg('');
    try {
      const response = await fetch('http://localhost:5000/api/hotel-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: hotelSettings })
      });
      const data = await response.json();
      if (data.success) setSettingsSavedMsg('Settings saved successfully!');
      else setSettingsSavedMsg('Failed to save settings.');
    } catch (error) {
      setSettingsSavedMsg('Error saving settings.');
    } finally {
      setSavingSettings(false);
      setTimeout(() => setSettingsSavedMsg(''), 3000);
    }
  };

  // Admin Room Types CRUD
  const fetchAdminRoomTypes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/room-types');
      const data = await response.json();
      if (data.success) setAdminRoomTypes(data.roomTypes);
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const fetchAdminRateCodes = async () => {
    setRcLoading(true);
    try {
      const [rcRes, rtRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/rate-codes'),
        fetch('http://localhost:5000/api/admin/room-types'),
      ]);
      const rcData = await rcRes.json();
      const rtData = await rtRes.json();
      if (rcData.rateCodes) setAdminRateCodes(rcData.rateCodes);
      if (rtData.roomTypes) setAdminRoomTypesForRates(rtData.roomTypes);
    } catch (e) { console.error(e); }
    setRcLoading(false);
  };

  const saveRcPrices = async (rcId) => {
    setRcSaving(true);
    const prices = adminRoomTypesForRates.map(rt => ({
      room_type_id: rt.id,
      price_per_night: rcPrices[rt.id] !== undefined && rcPrices[rt.id] !== '' ? rcPrices[rt.id] : null,
    }));
    try {
      await fetch(`http://localhost:5000/api/admin/rate-codes/${rcId}/prices`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices }),
      });
      setRcMsg('Prices saved.');
      setRcPriceEdit(null);
      fetchAdminRateCodes();
    } catch (e) { setRcMsg('Save failed.'); }
    setRcSaving(false);
    setTimeout(() => setRcMsg(''), 3000);
  };

  const addRoomType = async () => {
    if (!newRoomForm.name || !newRoomForm.price_per_night) return;
    try {
      const response = await fetch('http://localhost:5000/api/admin/room-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomForm.name,
          description: newRoomForm.description,
          totalRooms: parseInt(newRoomForm.total_rooms),
          pricePerNight: parseFloat(newRoomForm.price_per_night),
          maxGuests: parseInt(newRoomForm.max_guests),
          amenities: newRoomForm.amenities,
          floor: parseInt(newRoomForm.floor) || 1,
          area: newRoomForm.area,
        })
      });
      const data = await response.json();
      if (data.success) {
        setAdminRoomTypes([...adminRoomTypes, data.roomType]);
        setNewRoomForm({ name: '', description: '', total_rooms: 1, price_per_night: '', max_guests: 2, amenities: '', floor: 1, area: '' });
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error adding room type:', error);
    }
  };

  const saveRoomEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/room-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editRoomForm.name,
          description: editRoomForm.description,
          totalRooms: parseInt(editRoomForm.total_rooms),
          pricePerNight: parseFloat(editRoomForm.price_per_night),
          maxGuests: parseInt(editRoomForm.max_guests),
          amenities: editRoomForm.amenities,
          floor: parseInt(editRoomForm.floor) || 1,
          area: editRoomForm.area,
        })
      });
      const data = await response.json();
      if (data.success) {
        setAdminRoomTypes(adminRoomTypes.map(rt => rt.id === id ? data.roomType : rt));
        setEditRoomId(null);
      }
    } catch (error) {
      console.error('Error updating room type:', error);
    }
  };

  const deactivateRoomType = async (id) => {
    if (!confirm('Deactivate this room type? It will no longer appear in bookings.')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/room-types/${id}`, { method: 'DELETE' });
      setAdminRoomTypes(adminRoomTypes.map(rt => rt.id === id ? { ...rt, active: false } : rt));
    } catch (error) {
      console.error('Error deactivating room type:', error);
    }
  };

  const reactivateRoomType = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/room-types/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: true })
      });
      const data = await response.json();
      if (data.success) {
        setAdminRoomTypes(adminRoomTypes.map(rt => rt.id === id ? { ...rt, active: true } : rt));
      }
    } catch (error) {
      console.error('Error reactivating room type:', error);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (filter !== 'all') params.append('status', filter);
    window.open(`http://localhost:5000/api/export/appointments?${params}`, '_blank');
  };

  // Send SMS
  const sendSMSReminder = async (apt) => {
    try {
      const response = await fetch('http://localhost:5000/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: apt.id })
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      alert('Failed to send SMS');
    }
  };

  // Print appointment slip
  const printSlip = (apt) => {
    setPrintAppointment(apt);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Load data when tab changes
  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'dashboard') fetchAppointments();
      if (activeTab === 'calendar') fetchCalendarData();
      if (activeTab === 'reports') fetchReports();
      if (activeTab === 'rooms') fetchAdminRoomTypes();
      if (activeTab === 'settings') {
        fetchBlockedDates();
        fetchDoctors();
        fetchServices();
        fetchHotelSettings();
        fetchAdminRoomTypes();
        fetchAdminRateCodes();
      }
    }
  }, [activeTab, isLoggedIn, calendarMonth, calendarYear]);

  // Login Page
  if (!isLoggedIn) {
    const inputCls = "w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-white/20 focus:ring-2 focus:ring-white/10 focus:outline-none transition-all text-white placeholder-white/20 text-sm";
    const labelCls = "block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5";

    return (
      <div className="min-h-screen pt-[70px] md:pt-[30px] pb-24 flex items-center justify-center relative overflow-hidden">
        <div className="w-full max-w-md px-6 relative z-10">
          <div className="rounded-3xl border border-white/20 p-10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Admin Portal</h2>
              <p className="text-white/40 mt-2 text-sm">Secure access for hotel management</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {loginError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-medium animate-shake">
                  {loginError}
                </div>
              )}

              <div>
                <label className={labelCls}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputCls}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputCls}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white font-bold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg"
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Verifying...</span>
                  </div>
                ) : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => setCurrentPage('home')}
              className="w-full mt-6 py-3 text-white/40 hover:text-white text-xs font-semibold transition-all uppercase tracking-widest"
            >
              ← Back to Main Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div className="bg-blue-50 min-h-screen pt-[70px] pb-24">
      {activeTab === 'queue' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', mixBlendMode: 'screen' }}>
          <Orb hoverIntensity={2} rotateOnHover hue={0} forceHoverState={false} backgroundColor="#000000" />
        </div>
      )}
      <div className="w-full px-4 md:px-8 py-6">

        {/* ==================== DASHBOARD TAB ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Arrivals Today', value: '12', color: 'from-[#55A2F5] to-[#2D72C0]', icon: '🛫' },
                { label: 'Departures Today', value: '8', color: 'from-emerald-500 to-emerald-700', icon: '🛬' },
                { label: 'Stay-overs', value: '45', color: 'from-amber-500 to-amber-700', icon: '🏨' },
                { label: 'Occupancy', value: '82%', color: 'from-purple-500 to-purple-700', icon: '📊' },
              ].map((stat, i) => (
                <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-xl border border-white/10 hover:scale-[1.02] transition-all`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-3xl">{stat.icon}</span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-4xl font-black">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-2xl border border-white/20 p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-1 h-6 bg-[#55A2F5] rounded-full shadow-[0_0_10px_#55A2F5]"></div>
                  Recent Reservations
                </h3>
                <div className="space-y-3">
                  {appointments.slice(0, 5).map((apt, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-lg">
                          {apt.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-[#55A2F5] transition-colors">{apt.full_name}</p>
                          <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider mt-0.5">{apt.service_type} • {apt.preferred_date}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter border ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
                  Housekeeping Status
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Clean', value: 24, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Dirty', value: 8, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Inspected', value: 15, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Out of Order', value: 2, color: 'text-gray-600', bg: 'bg-gray-50' },
                  ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-xl p-4 flex justify-between items-center`}>
                      <span className={`font-bold ${item.color}`}>{item.label}</span>
                      <span className={`text-2xl font-black ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== RESERVATIONS TAB ==================== */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {/* Analytics Chart */}
            {(() => {
              const chartData = [
                { label: 'Pending', value: stats.pending, color: '#F59E0B' },
                { label: 'Confirmed', value: stats.confirmed, color: '#3B82F6' },
                { label: 'Completed', value: stats.completed, color: '#10B981' },
                { label: 'Cancelled', value: stats.cancelled, color: '#EF4444' },
              ];
              const total = stats.total || 1;
              const radius = 54;
              const circumference = 2 * Math.PI * radius;
              let cumulative = 0;
              return (
                <div className="rounded-2xl border border-white/20 p-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    {/* Donut Chart */}
                    <div className="relative flex-shrink-0">
                      <svg width="160" height="160" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        {chartData.map((seg, i) => {
                          const pct = seg.value / total;
                          const dashLen = pct * circumference;
                          const offset = -cumulative * circumference;
                          cumulative += pct;
                          if (seg.value === 0) return null;
                          return (
                            <circle
                              key={i}
                              cx="64" cy="64" r={radius}
                              fill="none"
                              stroke={seg.color}
                              strokeWidth="12"
                              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              transform="rotate(-90 64 64)"
                              className="transition-all duration-1000"
                            />
                          );
                        })}
                        <text x="64" y="62" textAnchor="middle" className="text-2xl font-black fill-white tracking-tighter">{stats.total}</text>
                        <text x="64" y="78" textAnchor="middle" className="text-[10px] font-bold fill-white/30 uppercase tracking-widest">Total</text>
                      </svg>
                    </div>
                    {/* Legend + Bar Breakdown */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                      {chartData.map((seg, i) => {
                        const pct = stats.total > 0 ? Math.round((seg.value / stats.total) * 100) : 0;
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: seg.color, color: seg.color }}></div>
                                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">{seg.label}</span>
                              </div>
                              <span className="text-sm font-black text-white">{seg.value} <span className="text-white/20 font-medium ml-1">({pct}%)</span></span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, backgroundColor: seg.color }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Search & Filter Bar */}
            <div className="rounded-2xl border border-white/20 p-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Search Guest</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name, phone, or email..."
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-white/20 transition-all text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-all text-sm [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-all text-sm [color-scheme:dark]"
                  />
                </div>
              </div>
              {(searchQuery || startDate || endDate) && (
                <button onClick={clearFilters} className="mt-4 text-xs font-bold text-[#55A2F5] hover:text-white transition-colors uppercase tracking-widest">
                  × Clear active filters
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === f
                    ? 'bg-white text-[#2D72C0] border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Appointments List */}
            {isLoading ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#55A2F5] mb-4"></div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Fetching reservations...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-24 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">No matching reservations found</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-[60px_repeat(5,1fr)_120px] gap-4 px-6 py-4 bg-white/5 border-b border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest items-center">
                  <span>#</span>
                  <span>Guest Name</span>
                  <span>Service</span>
                  <span>Check-in</span>
                  <span>Time</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>
                {filteredAppointments.map((apt, index) => (
                  <div key={apt.id} className={`grid grid-cols-1 md:grid-cols-[60px_repeat(5,1fr)_120px] gap-4 px-6 py-4 items-center text-sm border-b border-white/5 hover:bg-white/5 transition-all group ${index % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                    <span className="text-white/20 font-mono text-xs">{apt.id}</span>
                    <div className="min-w-0">
                      <p className="text-white font-bold group-hover:text-[#55A2F5] transition-colors truncate">{apt.full_name}</p>
                      <p className="text-white/30 text-[10px] truncate md:hidden">{apt.phone_number}</p>
                    </div>
                    <span className="text-white/60 text-xs font-medium truncate">{apt.service_type}</span>
                    <span className="text-white/60 text-xs font-medium">{apt.preferred_date}</span>
                    <span className="text-white/60 text-xs font-medium">{apt.preferred_time}</span>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter border w-fit ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {(apt.status === 'pending' || apt.status === 'confirmed') && (
                        <button onClick={() => openRescheduleModal(apt)} className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs hover:bg-purple-100 transition-all border border-purple-200">
                          Reschedule
                        </button>
                      )}
                      {apt.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(apt.id, 'confirmed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 transition-all border border-green-200 disabled:opacity-50">
                            Confirm
                          </button>
                          <button onClick={() => updateStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                            Cancel
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <>
                          <button onClick={() => updateStatus(apt.id, 'completed')} disabled={updatingId === apt.id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-all border border-blue-200 disabled:opacity-50">
                            Complete
                          </button>
                          <button onClick={() => updateStatus(apt.id, 'cancelled')} disabled={updatingId === apt.id} className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                            Cancel
                          </button>
                        </>
                      )}
                      {(apt.status === 'cancelled' || apt.status === 'completed') && (
                        <button onClick={() => updateStatus(apt.id, 'pending')} disabled={updatingId === apt.id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-all border border-blue-200 disabled:opacity-50">
                          Reopen
                        </button>
                      )}
                      <button onClick={() => sendSMSReminder(apt)} className="px-2 py-1 bg-cyan-50 text-cyan-600 rounded text-xs hover:bg-cyan-100 transition-all border border-cyan-200" title="Send SMS Reminder">
                        📱
                      </button>
                      <button onClick={() => printSlip(apt)} className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs hover:bg-gray-100 transition-all border border-gray-200" title="Print Appointment Slip">
                        🖨️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Export Button */}
            <div className="mt-6 flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-all text-sm flex items-center gap-2"
              >
                📥 Export to CSV
              </button>
            </div>
          </div>
        )}

        {/* ==================== FRONT DESK TAB ==================== */}
        {activeTab === 'frontdesk' && <FrontDeskTab />}

        {/* ==================== ROOMS TAB ==================== */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/20 p-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Room Inventory</h2>
                  <p className="text-white/40 text-sm font-medium mt-1">Manage room types, pricing models, and global availability</p>
                </div>
                <button
                  onClick={() => { setActiveTab('settings'); setSettingsSubTab('property'); }}
                  className="px-6 py-3 bg-[#55A2F5] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(85,162,245,0.3)] hover:scale-105 transition-all"
                >
                  Configure Room Types
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminRoomTypes.map(rt => (
                  <div key={rt.id} className="bg-white/5 rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="font-bold text-white text-lg group-hover:text-[#55A2F5] transition-colors">{rt.name}</h4>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${rt.active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-white/30 border-white/10'}`}>
                        {rt.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Inventory</span>
                        <span className="text-sm font-black text-white">{rt.total_rooms} Rooms</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Base Rate</span>
                        <span className="text-sm font-black text-[#55A2F5]">₱{Number(rt.price_per_night).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Max Guests</span>
                        <span className="text-sm font-black text-white">{rt.max_guests} Persons</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-6 border-t border-white/10">
                      <button className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                        Inventory
                      </button>
                      <button className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white/60 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                        Rates
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== HOUSEKEEPING TAB ==================== */}
        {activeTab === 'housekeeping' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/20 p-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Housekeeping</h2>
                  <p className="text-white/40 text-sm font-medium mt-1">Real-time room status monitoring and staff assignment</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/70 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Export</button>
                  <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 transition-all">+ Assign Task</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 24 }).map((_, i) => {
                  const status = i % 5 === 0 ? 'Dirty' : i % 3 === 0 ? 'Inspected' : 'Clean';
                  const color = status === 'Clean' ? 'bg-emerald-400' : status === 'Dirty' ? 'bg-red-400' : 'bg-[#55A2F5]';
                  const textColor = status === 'Clean' ? 'text-emerald-400' : status === 'Dirty' ? 'text-red-400' : 'text-[#55A2F5]';
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-white/20 text-[10px] uppercase tracking-widest">Room</span>
                        <div className={`w-2 h-2 rounded-full shadow-[0_0_10px_currentColor] ${color}`} style={{ color: color.replace('bg-', '') }}></div>
                      </div>
                      <p className="text-2xl font-black text-white group-hover:text-[#55A2F5] transition-colors">{101 + i}</p>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${textColor}`}>
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== BILLING TAB ==================== */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/20 p-8 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Billing & Folio</h2>
                  <p className="text-white/40 text-sm font-medium mt-1">Manage guest invoices, automated billing, and payment processing</p>
                </div>
                <button className="px-6 py-3 bg-[#55A2F5] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(85,162,245,0.3)] hover:scale-105 transition-all">New Invoice</button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-white/30 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Guest</th>
                      <th className="px-6 py-4">Room</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { id: 'INV-2024-001', guest: 'John Smith', room: '101', date: 'Oct 24, 2024', amount: '₱12,500.00', status: 'Paid' },
                      { id: 'INV-2024-002', guest: 'Maria Garcia', room: '204', date: 'Oct 23, 2024', amount: '₱8,200.00', status: 'Pending' },
                      { id: 'INV-2024-003', guest: 'Robert Chen', room: '305', date: 'Oct 23, 2024', amount: '₱15,000.00', status: 'Paid' },
                      { id: 'INV-2024-004', guest: 'Sarah Wilson', room: '108', date: 'Oct 22, 2024', amount: '₱5,400.00', status: 'Overdue' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-all group">
                        <td className="px-6 py-4 font-mono font-bold text-[#55A2F5]">{row.id}</td>
                        <td className="px-6 py-4 font-bold text-white">{row.guest}</td>
                        <td className="px-6 py-4 text-white/60">{row.room}</td>
                        <td className="px-6 py-4 text-white/40 text-xs">{row.date}</td>
                        <td className="px-6 py-4 font-black text-white">{row.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${row.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : row.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-[10px] font-black text-white/30 group-hover:text-white uppercase tracking-widest hover:underline">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (calendarMonth === 1) {
                      setCalendarMonth(12);
                      setCalendarYear(calendarYear - 1);
                    } else {
                      setCalendarMonth(calendarMonth - 1);
                    }
                  }}
                  className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 text-blue-700"
                >
                  ←
                </button>
                <span className="text-gray-800 font-medium px-4">
                  {new Date(calendarYear, calendarMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    if (calendarMonth === 12) {
                      setCalendarMonth(1);
                      setCalendarYear(calendarYear + 1);
                    } else {
                      setCalendarMonth(calendarMonth + 1);
                    }
                  }}
                  className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 text-blue-700"
                >
                  →
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-gray-500 text-sm py-2 font-medium">
                  {day}
                </div>
              ))}
              {(() => {
                const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
                const daysInMonth = new Date(calendarYear, calendarMonth, 0).getDate();
                const days = [];

                for (let i = 0; i < firstDay; i++) {
                  days.push(<div key={`empty-${i}`} className="p-2"></div>);
                }

                for (let day = 1; day <= daysInMonth; day++) {
                  const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dayAppointments = calendarData.appointments?.filter(a => a.preferred_date === dateStr) || [];
                  const isBlocked = calendarData.blockedDates?.some(b => b.blocked_date === dateStr);
                  const isToday = dateStr === new Date().toISOString().split('T')[0];

                  days.push(
                    <div
                      key={day}
                      className={`min-h-[80px] p-1 rounded-lg border ${isBlocked ? 'bg-red-50 border-red-200' :
                        isToday ? 'bg-yellow-50 border-[#576CA8]' :
                          'bg-white border-blue-100'
                        }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-[#576CA8]' : 'text-gray-600'}`}>
                        {day}
                      </div>
                      {isBlocked && (
                        <div className="text-xs text-red-500 truncate">Closed</div>
                      )}
                      {dayAppointments.slice(0, 2).map((apt, idx) => (
                        <div
                          key={idx}
                          className={`text-xs truncate px-1 rounded mb-0.5 ${apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              apt.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-600'
                            }`}
                        >
                          {apt.preferred_time.split(' ')[0]} {apt.full_name.split(' ')[0]}
                        </div>
                      ))}
                      {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">+{dayAppointments.length - 2} more</div>
                      )}
                    </div>
                  );
                }
                return days;
              })()}
            </div>
          </div>
        )}

        {/* ==================== REPORTS TAB ==================== */}
        {activeTab === 'reports' && (() => {
          const fmtA = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
          const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
          const subBtnCls = (id) => `px-4 py-2 text-sm font-medium whitespace-nowrap transition-all rounded-lg ${reportsSubTab === id ? 'bg-[#274690] text-white' : 'bg-white text-gray-600 hover:bg-blue-50 border border-blue-200'}`;
          return (
            <div className="space-y-5">
              {/* Sub-tab navigation */}
              <div className="flex gap-2 flex-wrap">
                <button className={subBtnCls('appointments')} onClick={() => setReportsSubTab('appointments')}>📋 Appointments</button>
                <button className={subBtnCls('management')} onClick={() => setReportsSubTab('management')}>🏨 Management</button>
                <button className={subBtnCls('financial')} onClick={() => setReportsSubTab('financial')}>💰 Financial</button>
              </div>

              {/* ── Appointments sub-tab (existing) ── */}
              {reportsSubTab === 'appointments' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                    <div className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-gray-500 text-xs mb-1">Start Date</label>
                        <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 text-sm" />
                      </div>
                      <div>
                        <label className="block text-gray-500 text-xs mb-1">End Date</label>
                        <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 text-sm" />
                      </div>
                      <button onClick={fetchReports} className="px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm">Generate Report</button>
                    </div>
                  </div>
                  {reportStats && (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Appointments', value: reportStats.totals?.total || 0 },
                          { label: 'Completed', value: reportStats.totals?.completed || 0 },
                          { label: 'Cancelled', value: reportStats.totals?.cancelled || 0 },
                          { label: 'Completion Rate', value: `${reportStats.totals?.total > 0 ? Math.round((reportStats.totals.completed / reportStats.totals.total) * 100) : 0}%` },
                        ].map((c, i) => (
                          <div key={i} className="bg-[#274690] rounded-xl p-4">
                            <p className="text-blue-200 text-xs uppercase">{c.label}</p>
                            <p className="text-3xl font-bold text-white">{c.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointments by Service</h3>
                        <div className="space-y-3">
                          {reportStats.byService?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-gray-600">{item.service_type}</span>
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-2 bg-blue-50 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0]" style={{ width: `${(item.count / reportStats.totals.total) * 100}%` }} />
                                </div>
                                <span className="text-gray-800 font-medium w-8 text-right">{item.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Time Slots</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {reportStats.hourly?.map((item, idx) => (
                            <div key={idx} className="bg-blue-50 rounded-lg p-3 text-center">
                              <p className="text-[#576CA8] font-medium">{item.time}</p>
                              <p className="text-gray-500 text-sm">{item.count} bookings</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Management sub-tab ── */}
              {reportsSubTab === 'management' && (
                <div className="space-y-5">
                  {/* Filter bar */}
                  <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Check-in From</label>
                      <input type="date" value={hotelRptStart} onChange={e => setHotelRptStart(e.target.value)} className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">Check-in To</label>
                      <input type="date" value={hotelRptEnd} onChange={e => setHotelRptEnd(e.target.value)} className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-gray-800" />
                    </div>
                    <button onClick={fetchManagementReport} disabled={hotelRptLoading}
                      className="px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm disabled:opacity-60">
                      {hotelRptLoading ? 'Loading...' : 'Generate'}
                    </button>
                  </div>

                  {mgmtData && (() => {
                    const s = mgmtData.summary;
                    const total = parseInt(s.total) || 1;
                    return (
                      <>
                        {/* Summary cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {[
                            { label: 'Total Reservations', value: s.total, bg: 'bg-[#274690]', txt: 'text-white', sub: 'text-blue-200' },
                            { label: 'Confirmed', value: s.confirmed, bg: 'bg-blue-50', txt: 'text-blue-800', sub: 'text-blue-400' },
                            { label: 'In-House', value: s.checked_in, bg: 'bg-emerald-50', txt: 'text-emerald-800', sub: 'text-emerald-400' },
                            { label: 'Checked Out', value: s.checked_out, bg: 'bg-gray-50', txt: 'text-gray-800', sub: 'text-gray-400' },
                            { label: 'Cancelled', value: s.cancelled, bg: 'bg-red-50', txt: 'text-red-800', sub: 'text-red-400' },
                            { label: 'Unique Guests', value: s.unique_guests, bg: 'bg-violet-50', txt: 'text-violet-800', sub: 'text-violet-400' },
                          ].map((c, i) => (
                            <div key={i} className={`${c.bg} rounded-xl p-4 border border-gray-100`}>
                              <p className={`${c.sub} text-xs uppercase font-medium tracking-wide`}>{c.label}</p>
                              <p className={`${c.txt} text-3xl font-bold mt-1`}>{c.value || 0}</p>
                            </div>
                          ))}
                        </div>

                        {/* Cancellation rate callout */}
                        <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm flex flex-wrap gap-6 items-center">
                          <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Cancellation Rate</p>
                            <p className="text-2xl font-bold text-red-600">{total > 0 ? Math.round((parseInt(s.cancelled) / total) * 100) : 0}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">No-Shows</p>
                            <p className="text-2xl font-bold text-orange-500">{s.no_show || 0}</p>
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <p className="text-xs text-gray-400 mb-2">Reservation Status Mix</p>
                            <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
                              {[
                                { val: parseInt(s.checked_out), color: 'bg-gray-400' },
                                { val: parseInt(s.checked_in), color: 'bg-emerald-400' },
                                { val: parseInt(s.confirmed), color: 'bg-blue-400' },
                                { val: parseInt(s.cancelled), color: 'bg-red-400' },
                              ].filter(x => x.val > 0).map((x, i) => (
                                <div key={i} className={`${x.color} h-full`} style={{ width: `${(x.val / total) * 100}%` }} />
                              ))}
                            </div>
                            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                              <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" />In-House</span>
                              <span><span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" />Confirmed</span>
                              <span><span className="inline-block w-2 h-2 rounded-full bg-gray-400 mr-1" />Checked Out</span>
                              <span><span className="inline-block w-2 h-2 rounded-full bg-red-400 mr-1" />Cancelled</span>
                            </div>
                          </div>
                        </div>

                        {/* Room Type Performance */}
                        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                          <h3 className="text-base font-semibold text-gray-800 mb-4">Room Type Performance</h3>
                          {mgmtData.byRoomType.length === 0 ? (
                            <p className="text-sm text-gray-400">No data for selected period.</p>
                          ) : (
                            <div className="space-y-3">
                              {mgmtData.byRoomType.map((rt, i) => {
                                const pct = total > 0 ? Math.round((parseInt(rt.valid_bookings) / total) * 100) : 0;
                                return (
                                  <div key={i}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="font-medium text-gray-700">{rt.room_type}</span>
                                      <div className="flex gap-4 text-gray-500 text-xs">
                                        <span>{rt.valid_bookings} stays</span>
                                        <span className="text-red-400">{rt.cancellations} cancelled</span>
                                        <span className="font-semibold text-[#274690]">{pct}%</span>
                                      </div>
                                    </div>
                                    <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-[#55A2F5] to-[#274690] rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* ── Financial sub-tab ── */}
              {reportsSubTab === 'financial' && (
                <div className="space-y-5">
                  {/* Filter bar */}
                  <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">From Date</label>
                      <input type="date" value={hotelRptStart} onChange={e => setHotelRptStart(e.target.value)} className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-gray-800" />
                    </div>
                    <div>
                      <label className="block text-gray-500 text-xs mb-1">To Date</label>
                      <input type="date" value={hotelRptEnd} onChange={e => setHotelRptEnd(e.target.value)} className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm text-gray-800" />
                    </div>
                    <button onClick={fetchFinancialReport} disabled={hotelRptLoading}
                      className="px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm disabled:opacity-60">
                      {hotelRptLoading ? 'Loading...' : 'Generate'}
                    </button>
                  </div>

                  {finData && (
                    <>
                      {/* Summary cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: 'Total Charged', value: fmtA(finData.summary.totalCharged), bg: 'bg-blue-600', note: `${finData.summary.chargeCount} line items` },
                          { label: 'Total Collected', value: fmtA(finData.summary.totalCollected), bg: 'bg-emerald-600', note: `${finData.summary.paymentCount} payments` },
                          { label: 'Outstanding', value: fmtA(finData.summary.totalOutstanding), bg: finData.summary.totalOutstanding > 0 ? 'bg-amber-500' : 'bg-gray-400', note: 'unpaid balance' },
                          { label: 'Collection Rate', value: `${finData.summary.collectionRate}%`, bg: 'bg-violet-600', note: 'of charged revenue' },
                        ].map((c, i) => (
                          <div key={i} className={`${c.bg} rounded-xl p-4 text-white`}>
                            <p className="text-white/70 text-xs uppercase font-medium tracking-wide">{c.label}</p>
                            <p className="text-2xl font-bold mt-1 leading-tight">{c.value}</p>
                            <p className="text-white/50 text-xs mt-1">{c.note}</p>
                          </div>
                        ))}
                      </div>

                      {/* Revenue view toggle */}
                      <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-wrap">
                          <span className="text-sm font-semibold text-gray-700">Revenue Breakdown</span>
                          <div className="flex gap-1 ml-auto flex-wrap">
                            <button onClick={() => setFinView('daily')}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${finView === 'daily' ? 'bg-[#274690] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              Daily
                            </button>
                            <button onClick={() => { setFinView('monthly'); fetchMonthlyReport(); }}
                              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${finView === 'monthly' ? 'bg-[#274690] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                              Monthly
                            </button>
                            {finView === 'monthly' && (
                              <div className="flex items-center gap-1 ml-2">
                                <label className="text-xs text-gray-500">Year</label>
                                <input type="number" value={finYear} min="2020" max="2099"
                                  onChange={e => setFinYear(parseInt(e.target.value))}
                                  onBlur={fetchMonthlyReport}
                                  className="w-20 px-2 py-1 text-xs border border-blue-200 rounded-lg bg-blue-50" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Daily table */}
                        {finView === 'daily' && (
                          dailyRevData.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400">No daily revenue data for this period.</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left">Date</th>
                                    <th className="px-4 py-3 text-right">Charged</th>
                                    <th className="px-4 py-3 text-right">Collected</th>
                                    <th className="px-4 py-3 text-right">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {dailyRevData.map((r, i) => (
                                    <tr key={i} className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors">
                                      <td className="px-4 py-2.5 text-gray-700">{fmtD(r.date)}</td>
                                      <td className="px-4 py-2.5 text-right text-blue-700 font-medium">{fmtA(r.charged)}</td>
                                      <td className="px-4 py-2.5 text-right text-emerald-700 font-medium">{fmtA(r.paid)}</td>
                                      <td className={`px-4 py-2.5 text-right font-medium ${r.balance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{fmtA(r.balance)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t-2 border-blue-200 bg-blue-50 font-semibold">
                                    <td className="px-4 py-3 text-gray-700">Total</td>
                                    <td className="px-4 py-3 text-right text-blue-700">{fmtA(dailyRevData.reduce((s, r) => s + r.charged, 0))}</td>
                                    <td className="px-4 py-3 text-right text-emerald-700">{fmtA(dailyRevData.reduce((s, r) => s + r.paid, 0))}</td>
                                    <td className="px-4 py-3 text-right text-amber-600">{fmtA(dailyRevData.reduce((s, r) => s + r.balance, 0))}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          )
                        )}

                        {/* Monthly table */}
                        {finView === 'monthly' && (
                          hotelRptLoading ? (
                            <div className="py-10 text-center text-sm text-gray-400">Loading...</div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 py-3 text-left">Month</th>
                                    <th className="px-4 py-3 text-right">Bookings</th>
                                    <th className="px-4 py-3 text-right">Charged</th>
                                    <th className="px-4 py-3 text-right">Collected</th>
                                    <th className="px-4 py-3 text-right">Balance</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {monthlyRevData.map((r, i) => (
                                    <tr key={i} className={`border-t border-gray-50 hover:bg-blue-50/30 transition-colors ${r.charged === 0 && r.paid === 0 ? 'opacity-40' : ''}`}>
                                      <td className="px-4 py-2.5 text-gray-700 font-medium">{r.month}</td>
                                      <td className="px-4 py-2.5 text-right text-gray-500">{r.bookings}</td>
                                      <td className="px-4 py-2.5 text-right text-blue-700 font-medium">{fmtA(r.charged)}</td>
                                      <td className="px-4 py-2.5 text-right text-emerald-700 font-medium">{fmtA(r.paid)}</td>
                                      <td className={`px-4 py-2.5 text-right font-medium ${r.balance > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{fmtA(r.balance)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot>
                                  <tr className="border-t-2 border-blue-200 bg-blue-50 font-semibold">
                                    <td className="px-4 py-3 text-gray-700">Year Total</td>
                                    <td className="px-4 py-3 text-right text-gray-600">{monthlyRevData.reduce((s, r) => s + r.bookings, 0)}</td>
                                    <td className="px-4 py-3 text-right text-blue-700">{fmtA(monthlyRevData.reduce((s, r) => s + r.charged, 0))}</td>
                                    <td className="px-4 py-3 text-right text-emerald-700">{fmtA(monthlyRevData.reduce((s, r) => s + r.paid, 0))}</td>
                                    <td className="px-4 py-3 text-right text-amber-600">{fmtA(monthlyRevData.reduce((s, r) => s + r.balance, 0))}</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          )
                        )}
                      </div>

                      {/* Payment Methods + Room Revenue */}
                      <div className="grid md:grid-cols-2 gap-5">
                        {/* Payment method breakdown */}
                        <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-800 mb-4">Payment Methods</h3>
                          {finData.byPaymentMethod.length === 0 ? (
                            <p className="text-sm text-gray-400">No payment data.</p>
                          ) : (
                            <div className="space-y-3">
                              {finData.byPaymentMethod.map((m, i) => {
                                const maxAmt = Math.max(...finData.byPaymentMethod.map(x => parseFloat(x.total)));
                                const pct = maxAmt > 0 ? (parseFloat(m.total) / maxAmt) * 100 : 0;
                                return (
                                  <div key={i}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="text-gray-700">{m.payment_method}</span>
                                      <div className="flex gap-3 text-xs text-gray-500">
                                        <span>{m.count}×</span>
                                        <span className="font-semibold text-emerald-700">{fmtA(m.total)}</span>
                                      </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Revenue by room type */}
                        <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                          <h3 className="text-sm font-semibold text-gray-800 mb-4">Revenue by Room Type</h3>
                          {finData.byRoomType.length === 0 ? (
                            <p className="text-sm text-gray-400">No room revenue data.</p>
                          ) : (
                            <div className="space-y-3">
                              {finData.byRoomType.map((rt, i) => {
                                const maxC = Math.max(...finData.byRoomType.map(x => parseFloat(x.charged)));
                                const pct = maxC > 0 ? (parseFloat(rt.charged) / maxC) * 100 : 0;
                                return (
                                  <div key={i}>
                                    <div className="flex items-center justify-between text-sm mb-1">
                                      <span className="text-gray-700">{rt.room_type}</span>
                                      <div className="flex gap-3 text-xs text-gray-500">
                                        <span>{rt.bookings} stays</span>
                                        <span className="font-semibold text-blue-700">{fmtA(rt.charged)}</span>
                                      </div>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-gradient-to-r from-blue-400 to-[#274690] rounded-full" style={{ width: `${pct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Outstanding Balances */}
                      {finData.outstandingList.length > 0 && (
                        <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
                          <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
                            <span className="text-sm font-semibold text-amber-800">Outstanding Balances</span>
                            <span className="ml-auto text-xs text-amber-500">{finData.outstandingList.length} guest{finData.outstandingList.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-amber-50/50 text-xs text-gray-500 uppercase tracking-wide">
                                  <th className="px-4 py-2.5 text-left">Guest</th>
                                  <th className="px-4 py-2.5 text-left">Room</th>
                                  <th className="px-4 py-2.5 text-left">Status</th>
                                  <th className="px-4 py-2.5 text-right">Charged</th>
                                  <th className="px-4 py-2.5 text-right">Paid</th>
                                  <th className="px-4 py-2.5 text-right">Balance</th>
                                </tr>
                              </thead>
                              <tbody>
                                {finData.outstandingList.map((r, i) => (
                                  <tr key={i} className="border-t border-gray-50 hover:bg-amber-50/30 transition-colors">
                                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.full_name}</td>
                                    <td className="px-4 py-2.5 text-gray-500">{r.room_number || '—'} · {r.room_type}</td>
                                    <td className="px-4 py-2.5">
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'checked_in' ? 'bg-emerald-100 text-emerald-700' : r.status === 'checked_out' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'}`}>{r.status.replace('_', ' ')}</span>
                                    </td>
                                    <td className="px-4 py-2.5 text-right text-blue-700">{fmtA(r.charged)}</td>
                                    <td className="px-4 py-2.5 text-right text-emerald-700">{fmtA(r.paid)}</td>
                                    <td className="px-4 py-2.5 text-right font-bold text-amber-600">{fmtA(r.balance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ==================== SETTINGS TAB ==================== */}
        {activeTab === 'settings' && (
          <div>
            {/* Settings sub-tab navigation */}
            <div className="flex overflow-x-auto gap-1 mb-6 bg-white rounded-xl p-1.5 border border-blue-200 shadow-sm">
              {[
                { id: 'property', label: 'Property' },
                { id: 'rooms', label: 'Rooms & Inventory' },
                { id: 'rate-codes', label: 'Rate Codes' },
                { id: 'reservations', label: 'Reservations' },
                { id: 'availability', label: 'Availability' },
                { id: 'notifications', label: 'Notifications' },
                { id: 'clinic', label: 'Clinic' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSettingsSubTab(tab.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${settingsSubTab === tab.id
                    ? 'bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-blue-50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Property ── */}
            {settingsSubTab === 'property' && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Property Information</h3>
                    <p className="text-gray-400 text-sm">Basic details displayed to guests on confirmation pages and emails</p>
                  </div>
                  {settingsSavedMsg && (
                    <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${settingsSavedMsg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {settingsSavedMsg}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'hotel_name', label: 'Hotel Name', type: 'text', placeholder: 'Grand Hotel' },
                    { key: 'hotel_address', label: 'Address', type: 'text', placeholder: '123 Main Street, City' },
                    { key: 'hotel_phone', label: 'Phone Number', type: 'text', placeholder: '+63 912 345 6789' },
                    { key: 'hotel_email', label: 'Email Address', type: 'email', placeholder: 'info@grandhotel.com' },
                    { key: 'hotel_website', label: 'Website', type: 'text', placeholder: 'www.grandhotel.com' },
                    { key: 'currency', label: 'Currency Code', type: 'text', placeholder: 'PHP' },
                    { key: 'check_in_time', label: 'Check-in Time', type: 'time', placeholder: '' },
                    { key: 'check_out_time', label: 'Check-out Time', type: 'time', placeholder: '' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="block text-gray-600 text-sm mb-1.5 font-medium">{field.label}</label>
                      <input
                        type={field.type}
                        value={hotelSettings[field.key] || ''}
                        onChange={(e) => setHotelSettings(prev => ({ ...prev, [field.key]: e.target.value }))}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#576CA8]"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveHotelSettings}
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm disabled:opacity-60"
                  >
                    {savingSettings ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Rooms & Inventory ── */}
            {settingsSubTab === 'rooms' && (
              <div className="space-y-6">
                {/* Add new room type */}
                <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Add Room Type</h3>
                  <p className="text-gray-400 text-sm mb-4">Create a new bookable room category with pricing and capacity</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {[
                      { key: 'name', label: 'Room Name *', type: 'text', placeholder: 'e.g. Deluxe Room' },
                      { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g. 1 King Bed · City View' },
                      { key: 'price_per_night', label: 'Price / Night (₱) *', type: 'number', placeholder: '0' },
                      { key: 'total_rooms', label: 'Total Rooms', type: 'number', placeholder: '1' },
                      { key: 'max_guests', label: 'Max Guests', type: 'number', placeholder: '2' },
                      { key: 'floor', label: 'Floor', type: 'number', placeholder: '1' },
                      { key: 'area', label: 'Area / Wing', type: 'text', placeholder: 'e.g. East Wing, Poolside' },
                      { key: 'amenities', label: 'Amenities (comma-separated)', type: 'text', placeholder: 'Free Wi-Fi, Air Conditioning, TV' },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-gray-600 text-sm mb-1.5 font-medium">{field.label}</label>
                        <input
                          type={field.type}
                          value={newRoomForm[field.key]}
                          onChange={(e) => setNewRoomForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          min={field.type === 'number' ? '0' : undefined}
                          className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#576CA8]"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addRoomType}
                    className="px-6 py-2.5 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm"
                  >
                    Add Room Type
                  </button>
                </div>

                {/* Room type list */}
                <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Room Types ({adminRoomTypes.length})</h3>
                  <div className="space-y-3">
                    {adminRoomTypes.map(rt => (
                      <div key={rt.id} className={`rounded-xl border p-4 transition-all ${rt.active ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                        {editRoomId === rt.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Name</label>
                                <input type="text" value={editRoomForm.name || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Description</label>
                                <input type="text" value={editRoomForm.description || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Price / Night (₱)</label>
                                <input type="number" value={editRoomForm.price_per_night || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, price_per_night: e.target.value }))} className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Total Rooms</label>
                                <input type="number" value={editRoomForm.total_rooms || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, total_rooms: e.target.value }))} min="1" className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Max Guests</label>
                                <input type="number" value={editRoomForm.max_guests || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, max_guests: e.target.value }))} min="1" className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Floor</label>
                                <input type="number" value={editRoomForm.floor || 1} onChange={(e) => setEditRoomForm(p => ({ ...p, floor: e.target.value }))} min="1" className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Area / Wing</label>
                                <input type="text" value={editRoomForm.area || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, area: e.target.value }))} placeholder="e.g. East Wing" className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Amenities</label>
                                <input type="text" value={editRoomForm.amenities || ''} onChange={(e) => setEditRoomForm(p => ({ ...p, amenities: e.target.value }))} className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm" />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => saveRoomEdit(rt.id)} className="px-4 py-1.5 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg text-sm font-medium">Save</button>
                              <button onClick={() => setEditRoomId(null)} className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-800">{rt.name}</span>
                                {!rt.active && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                              </div>
                              <p className="text-sm text-gray-500 mb-1.5">{rt.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                <span className="font-semibold text-[#576CA8]">₱{parseFloat(rt.price_per_night).toLocaleString('en-PH')}/night</span>
                                <span>{rt.total_rooms} room{rt.total_rooms !== 1 ? 's' : ''}</span>
                                <span>Max {rt.max_guests} guests</span>
                                <span>Floor {rt.floor || 1}</span>
                                {rt.area && <span className="bg-blue-50 text-[#576CA8] border border-blue-200 px-1.5 py-0.5 rounded">{rt.area}</span>}
                                {rt.amenities && <span className="truncate max-w-[200px]">{rt.amenities}</span>}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <button
                                onClick={() => { setEditRoomId(rt.id); setEditRoomForm({ name: rt.name, description: rt.description, price_per_night: rt.price_per_night, total_rooms: rt.total_rooms, max_guests: rt.max_guests, amenities: rt.amenities, floor: rt.floor || 1, area: rt.area || '' }); }}
                                className="px-3 py-1.5 bg-blue-50 text-[#576CA8] border border-blue-200 rounded-lg text-sm font-medium"
                              >
                                Edit
                              </button>
                              {rt.active ? (
                                <button onClick={() => deactivateRoomType(rt.id)} className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm font-medium">
                                  Deactivate
                                </button>
                              ) : (
                                <button onClick={() => reactivateRoomType(rt.id)} className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm font-medium">
                                  Activate
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {adminRoomTypes.length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-6">No room types configured. Add one above.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Rate Codes ── */}
            {settingsSubTab === 'rate-codes' && (
              <div className="space-y-4">
                {/* Add new rate code */}
                <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">Add Rate Code</h3>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Code <span className="text-red-400">*</span></label>
                      <input value={rcNewForm.code} onChange={e => setRcNewForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                        placeholder="RACK" maxLength={10}
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:border-[#576CA8] outline-none font-mono" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Name <span className="text-red-400">*</span></label>
                      <input value={rcNewForm.name} onChange={e => setRcNewForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Rack Rate"
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:border-[#576CA8] outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                      <input value={rcNewForm.description} onChange={e => setRcNewForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Full published rate"
                        className="w-full px-3 py-2 rounded-lg border border-blue-200 text-sm focus:border-[#576CA8] outline-none" />
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!rcNewForm.code || !rcNewForm.name) return;
                      try {
                        const res = await fetch('http://localhost:5000/api/admin/rate-codes', {
                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(rcNewForm),
                        });
                        const data = await res.json();
                        if (data.success) { setRcNewForm({ code: '', name: '', description: '' }); fetchAdminRateCodes(); }
                        else setRcMsg(data.message || 'Failed.');
                      } catch { setRcMsg('Error saving.'); }
                      setTimeout(() => setRcMsg(''), 3000);
                    }}
                    className="bg-[#576CA8] hover:bg-[#4a5d99] text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
                    + Add Rate Code
                  </button>
                  {rcMsg && <span className="ml-3 text-xs text-green-600 font-medium">{rcMsg}</span>}
                </div>

                {/* Rate codes list */}
                <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                  <div className="px-5 py-3 border-b border-blue-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700">Rate Codes</h3>
                    <button onClick={fetchAdminRateCodes} className="text-xs text-[#576CA8] hover:underline">↻ Refresh</button>
                  </div>
                  {rcLoading ? (
                    <div className="p-6 text-center text-gray-400 text-sm">Loading…</div>
                  ) : adminRateCodes.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No rate codes yet.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-blue-50">
                          <th className="px-5 py-2 text-left">Code</th>
                          <th className="px-5 py-2 text-left">Name</th>
                          <th className="px-5 py-2 text-left">Description</th>
                          <th className="px-5 py-2 text-center">Status</th>
                          <th className="px-5 py-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminRateCodes.map(rc => (
                          <React.Fragment key={rc.id}>
                            <tr className="border-b border-blue-50 hover:bg-blue-50/30">
                              <td className="px-5 py-2.5 font-mono font-bold text-[#576CA8]">{rc.code}</td>
                              <td className="px-5 py-2.5 font-medium text-gray-700">{rc.name}</td>
                              <td className="px-5 py-2.5 text-gray-500">{rc.description}</td>
                              <td className="px-5 py-2.5 text-center">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                  {rc.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-5 py-2.5 text-right flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    if (rcPriceEdit === rc.id) { setRcPriceEdit(null); return; }
                                    const initPrices = {};
                                    (rc.prices || []).forEach(p => { initPrices[p.room_type_id] = p.price_per_night; });
                                    setRcPrices(initPrices);
                                    setRcPriceEdit(rc.id);
                                  }}
                                  className="text-xs text-[#576CA8] hover:underline font-medium">
                                  {rcPriceEdit === rc.id ? 'Close' : 'Set Prices'}
                                </button>
                                <button
                                  onClick={async () => {
                                    await fetch(`http://localhost:5000/api/admin/rate-codes/${rc.id}`, {
                                      method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ is_active: !rc.is_active }),
                                    });
                                    fetchAdminRateCodes();
                                  }}
                                  className={`text-xs font-medium hover:underline ${rc.is_active ? 'text-red-400' : 'text-green-600'}`}>
                                  {rc.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                            {/* Price matrix row */}
                            {rcPriceEdit === rc.id && (
                              <tr className="bg-blue-50/40">
                                <td colSpan={5} className="px-5 py-3">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price per Night by Room Type (leave blank to use default)</p>
                                  <div className="grid grid-cols-2 gap-2 mb-3">
                                    {adminRoomTypesForRates.filter(rt => rt.active).map(rt => (
                                      <div key={rt.id} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600 w-36 truncate">{rt.name}</span>
                                        <span className="text-xs text-gray-400">default ₱{Number(rt.price_per_night).toLocaleString()}</span>
                                        <input
                                          type="number" min="0" placeholder="Override"
                                          value={rcPrices[rt.id] ?? ''}
                                          onChange={e => setRcPrices(p => ({ ...p, [rt.id]: e.target.value }))}
                                          className="w-28 px-2 py-1 rounded border border-blue-200 text-sm outline-none focus:border-[#576CA8]"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                  <button onClick={() => saveRcPrices(rc.id)} disabled={rcSaving}
                                    className="bg-[#576CA8] hover:bg-[#4a5d99] disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg font-medium">
                                    {rcSaving ? 'Saving…' : 'Save Prices'}
                                  </button>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── Reservations ── */}
            {settingsSubTab === 'reservations' && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Reservation Rules</h3>
                    <p className="text-gray-400 text-sm">Define stay limits, booking window, and cancellation policy</p>
                  </div>
                  {settingsSavedMsg && (
                    <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${settingsSavedMsg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {settingsSavedMsg}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1.5 font-medium">Minimum Stay (nights)</label>
                    <input
                      type="number"
                      value={hotelSettings.min_stay_nights || '1'}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, min_stay_nights: e.target.value }))}
                      min="1"
                      className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#576CA8]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1.5 font-medium">Maximum Stay (nights)</label>
                    <input
                      type="number"
                      value={hotelSettings.max_stay_nights || '30'}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, max_stay_nights: e.target.value }))}
                      min="1"
                      className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#576CA8]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1.5 font-medium">Advance Booking Window (days)</label>
                    <input
                      type="number"
                      value={hotelSettings.advance_booking_days || '365'}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, advance_booking_days: e.target.value }))}
                      min="1"
                      className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#576CA8]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1.5 font-medium">Deposit Required</label>
                    <select
                      value={hotelSettings.deposit_required || 'false'}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, deposit_required: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#576CA8]"
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  {hotelSettings.deposit_required === 'true' && (
                    <div>
                      <label className="block text-gray-600 text-sm mb-1.5 font-medium">Deposit Percentage (%)</label>
                      <input
                        type="number"
                        value={hotelSettings.deposit_percentage || '50'}
                        onChange={(e) => setHotelSettings(prev => ({ ...prev, deposit_percentage: e.target.value }))}
                        min="1" max="100"
                        className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#576CA8]"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1.5 font-medium">Cancellation Policy</label>
                  <textarea
                    value={hotelSettings.cancellation_policy || ''}
                    onChange={(e) => setHotelSettings(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                    rows={3}
                    placeholder="e.g. Free cancellation up to 24 hours before check-in."
                    className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#576CA8] resize-none"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveHotelSettings}
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm disabled:opacity-60"
                  >
                    {savingSettings ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Availability ── */}
            {settingsSubTab === 'availability' && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Blocked Dates / Holidays</h3>
                <p className="text-gray-400 text-sm mb-4">Block specific dates to prevent new reservations (e.g., maintenance, holidays)</p>
                <div className="flex flex-wrap gap-3 mb-4">
                  <input
                    type="date"
                    value={newBlockedDate}
                    onChange={(e) => setNewBlockedDate(e.target.value)}
                    className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 text-sm"
                  />
                  <input
                    type="text"
                    value={newBlockedReason}
                    onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder="Reason (e.g., Holiday, Maintenance)"
                    className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 text-sm flex-1"
                  />
                  <button
                    onClick={addBlockedDate}
                    className="px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm"
                  >
                    Block Date
                  </button>
                </div>
                <div className="space-y-2">
                  {blockedDates.map(bd => (
                    <div key={bd.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                      <div>
                        <span className="text-gray-800 font-medium">{bd.blocked_date}</span>
                        {bd.reason && <span className="text-gray-500 ml-2 text-sm">— {bd.reason}</span>}
                      </div>
                      <button
                        onClick={() => deleteBlockedDate(bd.id)}
                        className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {blockedDates.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-4">No blocked dates configured</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {settingsSubTab === 'notifications' && (
              <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Notification Settings</h3>
                    <p className="text-gray-400 text-sm">Configure sender names for guest communications</p>
                  </div>
                  {settingsSavedMsg && (
                    <span className={`text-sm font-medium px-3 py-1.5 rounded-lg ${settingsSavedMsg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {settingsSavedMsg}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-600 text-sm mb-1.5 font-medium">Email Sender Name</label>
                    <input
                      type="text"
                      value={hotelSettings.email_sender_name || ''}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, email_sender_name: e.target.value }))}
                      placeholder="Grand Hotel"
                      className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#576CA8]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Shown as the "From" name in guest emails</p>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1.5 font-medium">SMS Sender Name</label>
                    <input
                      type="text"
                      value={hotelSettings.sms_sender_name || ''}
                      onChange={(e) => setHotelSettings(prev => ({ ...prev, sms_sender_name: e.target.value }))}
                      placeholder="HOTEL"
                      maxLength={11}
                      className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-800 placeholder-gray-400 text-sm focus:outline-none focus:border-[#576CA8]"
                    />
                    <p className="text-xs text-gray-400 mt-1">Max 11 characters (Semaphore SMS sender ID)</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveHotelSettings}
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm disabled:opacity-60"
                  >
                    {savingSettings ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {/* ── Clinic ── */}
            {settingsSubTab === 'clinic' && (
              <div className="space-y-6">
                {/* Doctors */}
                <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Doctors</h3>
                  <p className="text-gray-400 text-sm mb-4">Manage doctors available for appointment scheduling</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <input
                      type="text"
                      value={newDoctorName}
                      onChange={(e) => setNewDoctorName(e.target.value)}
                      placeholder="Doctor Name"
                      className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 text-sm"
                    />
                    <input
                      type="text"
                      value={newDoctorSpec}
                      onChange={(e) => setNewDoctorSpec(e.target.value)}
                      placeholder="Specialization"
                      className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 text-sm flex-1"
                    />
                    <button
                      onClick={addDoctor}
                      className="px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm"
                    >
                      Add Doctor
                    </button>
                  </div>
                  <div className="space-y-2">
                    {doctors.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <div>
                          <span className="text-gray-800 font-medium">{doc.name}</span>
                          <span className="text-gray-500 ml-2 text-sm">— {doc.specialization}</span>
                        </div>
                        <button onClick={() => deleteDoctor(doc.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                      </div>
                    ))}
                    {doctors.length === 0 && <p className="text-gray-400 text-sm">No doctors configured</p>}
                  </div>
                </div>

                {/* Services */}
                <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Services & Duration</h3>
                  <p className="text-gray-400 text-sm mb-4">Manage clinic services and their durations</p>
                  <div className="flex flex-wrap gap-3 mb-4">
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Service Name"
                      className="px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 text-sm flex-1"
                    />
                    <input
                      type="number"
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(parseInt(e.target.value))}
                      placeholder="Duration (min)"
                      className="w-24 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 text-sm"
                    />
                    <input
                      type="number"
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(parseFloat(e.target.value))}
                      placeholder="Price"
                      className="w-24 px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 text-sm"
                    />
                    <button onClick={addService} className="px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg font-medium text-sm">
                      Add Service
                    </button>
                  </div>
                  <div className="space-y-2">
                    {services.map(svc => (
                      <div key={svc.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                        <div>
                          <span className="text-gray-800 font-medium">{svc.name}</span>
                          <span className="text-gray-500 ml-2 text-sm">— {svc.duration} min</span>
                          {svc.price > 0 && <span className="text-[#576CA8] ml-2 text-sm">₱{svc.price}</span>}
                        </div>
                        <button onClick={() => deleteService(svc.id)} className="text-red-400 hover:text-red-600 text-sm">Remove</button>
                      </div>
                    ))}
                    {services.length === 0 && <p className="text-gray-400 text-sm">No services configured</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Reschedule Appointment</h3>
            <p className="text-gray-500 text-sm mb-4">
              Patient: <span className="text-gray-800">{rescheduleModal.full_name}</span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-2">New Time</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select time slot</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {availableSlots.length === 0 && newDate && (
                  <p className="text-red-400 text-sm mt-1">No slots available for this date</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setRescheduleModal(null)}
                className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={!newDate || !newTime || isRescheduling}
                className="flex-1 py-3 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white font-semibold rounded-lg hover:bg-[#465a8f] transition-all disabled:opacity-50"
              >
                {isRescheduling ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Appointment Slip */}
      {printAppointment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md print:rounded-none print:shadow-none">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-blue-900">HealthCare Clinic</h2>
              <p className="text-stone-600 text-sm">Cantecson, Gairan, Bogo City, Cebu</p>
            </div>
            <div className="border-t border-b border-stone-200 py-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Appointment Slip</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Patient:</strong> {printAppointment.full_name}</p>
                <p><strong>Service:</strong> {printAppointment.service_type}</p>
                <p><strong>Date:</strong> {printAppointment.preferred_date}</p>
                <p><strong>Time:</strong> {printAppointment.preferred_time}</p>
                <p><strong>Reference #:</strong> {printAppointment.id}</p>
              </div>
            </div>
            <p className="text-xs text-stone-500 text-center">Please arrive 10 minutes before your scheduled time.</p>
            <div className="mt-6 flex gap-3 print:hidden">
              <button
                onClick={() => setPrintAppointment(null)}
                className="flex-1 py-2 bg-stone-200 text-stone-700 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// My Appointment Page - Patient Self-Service
function MyAppointment({ setCurrentPage, initialToken }) {
  const [email, setEmail] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // Auto-fetch if token provided
  useEffect(() => {
    if (initialToken) {
      fetchByToken(initialToken);
    }
  }, [initialToken]);

  const fetchByToken = async (token) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/patient/appointment/${token}`);
      const data = await response.json();
      if (data.success) {
        setAppointment(data.appointment);
      } else {
        setError(data.message || 'Appointment not found');
      }
    } catch (err) {
      setError('Failed to fetch appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setAppointment(null);

    try {
      const response = await fetch('http://localhost:5000/api/patient/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referenceId: parseInt(referenceId) })
      });
      const data = await response.json();

      if (data.success) {
        setAppointment(data.appointment);
      } else {
        setError(data.message || 'Appointment not found');
      }
    } catch (err) {
      setError('Failed to look up appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;

    setIsCancelling(true);
    try {
      const response = await fetch('http://localhost:5000/api/patient/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancelToken: appointment.cancel_token,
          reason: cancelReason || 'Cancelled by patient'
        })
      });
      const data = await response.json();

      if (data.success) {
        setCancelSuccess(true);
        setShowCancelConfirm(false);
        setAppointment(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        setError(data.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'confirmed': return 'bg-green-50 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const canCancel = appointment &&
    appointment.status !== 'cancelled' &&
    appointment.status !== 'completed' &&
    new Date(appointment.preferred_date) >= new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className="bg-blue-50 min-h-screen pt-[70px] md:pt-[30px] pb-24">
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#576CA8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">My Appointment</h1>
          <p className="text-gray-500">View or cancel your appointment</p>
        </div>

        {/* Success Message */}
        {cancelSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center">
            <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-700 font-semibold">Appointment Cancelled Successfully</p>
            <p className="text-green-600 text-sm mt-1">A confirmation email has been sent to you.</p>
          </div>
        )}

        {/* Lookup Form (only show if no appointment loaded) */}
        {!appointment && !isLoading && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Find Your Appointment</h2>

            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-gray-500 text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 text-sm mb-2">Reference ID</label>
                <input
                  type="number"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  placeholder="Enter your reference number (e.g., 123)"
                  className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-gray-400 text-xs mt-1">Found in your confirmation email</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white font-semibold rounded-lg hover:bg-[#465a8f] transition-all disabled:opacity-50"
              >
                {isLoading ? 'Looking up...' : 'Find Appointment'}
              </button>
            </form>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#576CA8] mb-4"></div>
            <p className="text-gray-500">Loading appointment...</p>
          </div>
        )}

        {/* Appointment Details */}
        {appointment && !isLoading && (
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Appointment Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Patient Name</p>
                  <p className="text-gray-800 font-medium">{appointment.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Reference ID</p>
                  <p className="text-gray-800 font-medium">#{appointment.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Service</p>
                  <p className="text-gray-800">{appointment.service_type}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-gray-800">{appointment.phone_number}</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0]/10 rounded-xl p-4 border border-[#576CA8]/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#576CA8]/70 text-xs uppercase tracking-wider mb-1">Date</p>
                    <p className="text-gray-800 font-semibold text-lg">{appointment.preferred_date}</p>
                  </div>
                  <div>
                    <p className="text-[#576CA8]/70 text-xs uppercase tracking-wider mb-1">Time</p>
                    <p className="text-gray-800 font-semibold text-lg">{appointment.preferred_time}</p>
                  </div>
                </div>
              </div>

              {appointment.notes && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Notes</p>
                  <p className="text-gray-500 text-sm">{appointment.notes}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-blue-200 flex gap-3">
              <button
                onClick={() => {
                  setAppointment(null);
                  setEmail('');
                  setReferenceId('');
                  setCancelSuccess(false);
                }}
                className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
              >
                Look Up Another
              </button>

              {canCancel && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex-1 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-all"
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => setCurrentPage('home')}
          className="w-full mt-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm"
        >
          ← Back to Home
        </button>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-md border border-blue-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800">Cancel Appointment?</h3>
              <p className="text-gray-500 mt-2">This action cannot be undone.</p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-500 text-sm mb-2">Reason for cancellation (optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Let us know why you're cancelling..."
                className="w-full px-4 py-3 bg-blue-50 border border-blue-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500/50 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Header Component
function Header({ currentPage, setCurrentPage, searchQuery, setSearchQuery }) {
  const inputCls = "w-full pl-10 pr-4 py-2 rounded-lg border border-white/10 bg-white/5 focus:border-white/20 focus:ring-1 focus:ring-white/10 focus:outline-none transition-all text-white placeholder-white/20 text-sm";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}>
      <div className="relative overflow-hidden">
        <div className="w-full px-8 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setCurrentPage('home')}>
              <div>
                <GradientText
                  colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
                  animationSpeed={8}
                  showBorder={false}
                  className="text-3xl font-bold tracking-tight"
                >
                  Northomes Pensionne
                </GradientText>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Hotel & Wellness</p>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-sm mx-8 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/20 w-4 h-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value && currentPage !== 'menu') setCurrentPage('menu');
                }}
                className={inputCls}
              />
            </div>

            <nav className="hidden md:flex items-center space-x-6">
              {[
                { name: 'Home', id: 'home', icon: '🏠' },
                { name: 'Check In', id: 'checkin', icon: '🏨' },
                { name: 'Admin', id: 'admin', icon: '👤' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 font-bold transition-all py-2 px-3 text-xs uppercase tracking-widest ${currentPage === item.id ? 'text-[#55A2F5]' : 'text-white/40 hover:text-white'}`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </button>
              ))}
              <button
                onClick={() => document.getElementById('location-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="font-bold transition-all py-2 px-3 text-xs uppercase tracking-widest text-white/40 hover:text-white border border-white/10 rounded-lg bg-white/5"
              >
                Contact
              </button>
            </nav>

          </div>
        </div>
      </div>
    </header>
  );
}

// Home Page
function HomePage({ setCurrentPage }) {
  return (
    <div>
      {/* Hero Section with Form */}
      <section id="appointment-section" className="relative overflow-hidden -mt-[60px] md:-mt-[20px]">
        <div className="relative min-h-[calc(100vh-140px)] md:min-h-[calc(100vh-100px)]">

          {/* Content - Centered Form with Text Below */}
          <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 md:px-12 py-12 md:py-16">
            <div className="w-full max-w-xl mx-auto">

              {/* Centered Appointment Form */}
              <div style={{ marginTop: '50px' }}>
                <AppointmentForm />
              </div>

              {/* Guest Check-In CTA */}
              <div className="mt-4 flex justify-center">
                <div className="rounded-2xl border border-white/20 px-5 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                  <span className="text-2xl">🏨</span>
                  <span className="text-white/70 text-sm">Already have a reservation?</span>
                  <button
                    onClick={() => setCurrentPage('checkin')}
                    className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Check In Now
                  </button>
                </div>
              </div>

              {/* Text Content Below Form */}
              <div className="text-center mt-12 mb-16">
                {/* Main Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6 leading-[1.05] tracking-tight">
                  Seamless stays,
                  <span className="block text-[#55A2F5] mt-2">unforgettable memories</span>
                </h2>

                {/* Subheading */}
                <p className="text-base md:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                  Experience world-class hospitality with our modern reservation system. Book your perfect getaway in just a few clicks.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                  {[
                    { label: 'Rooms Available', value: '50+' },
                    { label: 'Happy Guests', value: '12k+' },
                    { label: 'Star Rating', value: '4.9/5' },
                    { label: 'Support', value: '24/7' },
                  ].map((stat, i) => (
                    <div key={i} className="px-8 py-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all group">
                      <div className="text-3xl md:text-4xl font-black text-white group-hover:text-[#55A2F5] transition-colors tracking-tighter">{stat.value}</div>
                      <div className="text-white/30 text-[10px] mt-2 font-bold uppercase tracking-widest">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="location-section" className="py-16" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <div className="w-full px-8">
          <div className="max-w-6xl mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 mb-12">
              {/* About */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-bold text-white">Helios Systems</h4>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Providing modern, responsive, and user-friendly websites that help businesses thrive online. Let's work together to bring your vision to life!
                </p>
                {/* Social Links */}
                <div className="flex space-x-3 mt-4">
                  <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-blue-700 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all hover:-translate-y-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-blue-700 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all hover:-translate-y-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-gray-100 hover:bg-blue-700 rounded-full flex items-center justify-center text-gray-600 hover:text-white transition-all hover:-translate-y-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Address</h4>
                <div className="text-gray-200 text-sm space-y-1">
                  <p>Pelaez St.</p>
                  <p>Bogo City, Cebu</p>
                  <p>Philippines 6010</p>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Contact</h4>
                <div className="text-gray-200 text-sm space-y-2">
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#576CA8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +63 917 132 3715
                  </p>
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#576CA8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    info@northomespensione.com
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div>
                <h4 className="text-white font-semibold mb-4 uppercase text-sm tracking-wider">Hours</h4>
                <div className="text-gray-200 text-sm space-y-1">
                  <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                  <p>Saturday: 8:00 AM - 12:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>

            {/* Footer Bottom */}
            <div className="border-t border-white/20 pt-8 text-center">
              <p className="text-gray-200 text-sm">
                © 2026 Roger Tonacao.|  Helios | All rights reserved. |
                <a href="#" className="hover:text-[#576CA8] transition-all ml-1">Privacy Policy</a> |
                <a href="#" className="hover:text-[#576CA8] transition-all ml-1">Terms of Service</a> |
                <button onClick={() => setCurrentPage('my-appointment')} className="hover:text-[#576CA8] transition-all ml-1">My Appointment</button> |
                <button onClick={() => setCurrentPage('admin')} className="hover:text-[#576CA8] transition-all ml-1">Admin</button>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Menu Page
function MenuPage({ selectedCategory, setSelectedCategory, searchQuery, menuData, isLoading }) {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/services');
        const data = await response.json();
        if (data.success) {
          setServices(data.services);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Service icons mapping
  const serviceIcons = {
    'General Consultation': '🩺',
    'Dental Cleaning': '🦷',
    'Eye Examination': '👁️',
    'Vaccination': '💉',
    'Laboratory Tests': '🧪',
    'Physical Therapy': '🏃',
    'default': '🏥'
  };

  // Service colors for deck cards - updated to be glassy
  const deckColors = [
    'rgba(85,162,245,0.1)',
    'rgba(255,191,0,0.1)',
    'rgba(255,127,80,0.1)',
    'rgba(255,105,180,0.1)',
    'rgba(147,112,219,0.1)',
    'rgba(0,255,255,0.1)',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-16 px-8 text-center bg-transparent">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1 bg-white/10 text-white/80 rounded-full text-sm font-medium mb-4 border border-white/20 backdrop-blur-md">
            Our Healthcare Services
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Quality Care for Your
            <span className="text-[#55A2F5]"> Well-being</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Comprehensive healthcare services tailored to meet your needs. Scroll down to explore our services.
          </p>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Sticky Deck Services */}
      <div className="relative px-4 md:px-8 pb-32">
        {loadingServices ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white/40 mb-4"></div>
            <p className="text-xl text-white/60 font-medium">Loading services...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="sticky mb-4"
                style={{
                  top: `${160 + index * 20}px`,
                  zIndex: index + 1
                }}
              >
                <div
                  className="rounded-2xl border border-white/20 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <div className="p-4 md:p-8">
                    {/* Always horizontal: Icon LEFT, Text RIGHT */}
                    <div className="flex flex-row items-start md:items-center gap-3 md:gap-6">
                      {/* Icon - Left side */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                          <span className="text-2xl sm:text-3xl md:text-5xl">
                            {serviceIcons[service.name] || serviceIcons['default']}
                          </span>
                        </div>
                        {/* Mobile card number under icon */}
                        <div className="md:hidden mt-1 text-center">
                          <span className="text-xs font-bold text-white/30">
                            #{String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      </div>

                      {/* Content - Right side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-1 md:mb-2">
                          <h3 className="text-sm sm:text-base md:text-2xl font-bold text-white leading-tight">
                            {service.name}
                          </h3>
                          <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 md:px-3 md:py-1 bg-white/10 text-white/60 rounded-full text-[10px] sm:text-xs md:text-sm font-medium border border-white/10">
                            {service.duration}min
                          </span>
                        </div>
                        <p className="text-white/50 mb-2 md:mb-4 text-[11px] sm:text-xs md:text-base line-clamp-2">
                          {service.description || 'Professional healthcare service.'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4">
                          <div className="text-base sm:text-lg md:text-3xl font-bold text-[#55A2F5]">
                            ₱{parseFloat(service.price).toLocaleString()}
                          </div>
                          <button
                            onClick={() => document.getElementById('appointment-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-6 md:py-3 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-lg md:rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-1 md:gap-2 shadow-lg text-[10px] sm:text-xs md:text-base"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="hidden sm:inline">Book Now</span>
                            <span className="sm:hidden">Book</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Number - Desktop only */}
                      <div className="hidden md:flex flex-shrink-0 w-16 h-16 bg-white/5 rounded-full items-center justify-center border border-white/10">
                        <span className="text-2xl font-bold text-white/20">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="h-1 bg-white/10"></div>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div className="text-center py-16">
                <p className="text-2xl text-white/30">No services available</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="py-16 px-8 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="rounded-3xl border border-white/20 p-8 md:p-12" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Book Your Appointment?
            </h2>
            <p className="text-white/60 mb-8">
              Our team of healthcare professionals is ready to provide you with the best care.
            </p>
            <button
              onClick={() => document.getElementById('appointment-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
            >
              Schedule Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Menu Item Card (Legacy - kept for compatibility)
function MenuItem({ item }) {
  const { addToCart } = useCart();

  return (
    <div className="bg-[#eff6ff] rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden group w-full flex flex-row h-auto min-h-[273px] sm:min-h-[293px] hover:-translate-y-1">
      {/* Left side - Product Image */}
      <div className="bg-stone-100 p-3 sm:p-4 flex items-center justify-center w-48 sm:w-54 md:w-60 flex-shrink-0 relative">
        {item.image && item.image.startsWith('assets/') ? (
          <img src={item.image} alt={item.name} className="object-contain w-full h-48 sm:h-54 md:h-60 rounded-lg group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="text-7xl sm:text-8xl md:text-9xl group-hover:scale-110 transition-transform duration-300">{item.image}</div>
        )}
        {item.popular && (
          <span className="absolute top-2 right-2 bg-blue-700 text-white px-2 py-1 rounded-full text-xs font-bold">
            Popular
          </span>
        )}
      </div>

      {/* Right side - Product Details */}
      <div className="p-4 sm:p-5 md:p-6 flex flex-col justify-start flex-1 min-w-0">
        <div className="mb-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-blue-900 mb-2 break-words">{item.name}</h3>
          <p className="text-stone-600 text-sm sm:text-base mb-3 line-clamp-2 font-normal">{item.description}</p>
        </div>
        <div className="flex flex-col gap-3 mt-auto">
          {item.sizes ? (
            <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-900 break-words">
              From Php {Math.min(...item.sizes.map(s => s.price)).toFixed(2)}
            </span>
          ) : (
            <span className="text-sm sm:text-base md:text-lg font-semibold text-blue-900 break-words">Php {item.price.toFixed(2)}</span>
          )}
          <button
            onClick={() => addToCart(item)}
            className="btn-animated bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-4 sm:px-5 py-3 rounded-lg hover:bg-blue-800 transition-all flex items-center justify-center space-x-2 text-sm font-semibold w-full whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Book Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Cart Drawer
function CartDrawer({ setShowCart, setCurrentPage }) {
  const { cartItems } = useCart();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end" onClick={() => setShowCart(false)}>
      <div className="bg-gray-100 w-full max-w-md h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Cart</h2>
            <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <CartItemCard key={`${item.id}-${item.selectedSize || 'default'}-${index}`} item={item} />
                ))}
              </div>
              <button
                onClick={() => {
                  setShowCart(false);
                  setCurrentPage('cart');
                }}
                className="w-full bg-green-600 text-white py-4 rounded-full font-bold hover:bg-green-700 transition-all"
              >
                View Full Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Cart Page
function CartPage({ setCurrentPage }) {
  const { cartItems, getTotalPrice } = useCart();
  const deliveryFee = 4.99;
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + deliveryFee + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="max-w-md mx-auto px-8 text-center">
          <div className="rounded-3xl border border-white/20 p-12" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <ShoppingCart className="w-16 h-16 text-white/20 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-white/50 mb-8">Add some services to get started</p>
            <button
              onClick={() => setCurrentPage('menu')}
              className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="w-full max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-10 text-center">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <CartItemCard key={`${item.id}-${item.selectedSize || 'default'}-${index}`} item={item} detailed />
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-white/20 p-6 sticky top-[120px]" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <h3 className="text-lg font-bold text-white mb-6">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span className="text-white">Php {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Booking Fee</span>
                  <span className="text-white">Php {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Tax (8%)</span>
                  <span className="text-white">Php {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-[#55A2F5]">Php {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCurrentPage('checkout')}
                className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Item Card
function CartItemCard({ item, detailed = false }) {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="rounded-2xl border border-white/10 p-4 flex items-center gap-4 group transition-all hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      <div className="bg-white/10 border border-white/10 rounded-xl flex items-center justify-center w-20 h-20 shrink-0">
        {item.image && item.image.startsWith('assets/') ? (
          <img src={item.image} alt={item.name} className="object-contain w-full h-full rounded-lg" />
        ) : (
          <div className="text-4xl">{item.image}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white text-base truncate">{item.name}</h3>
        {item.selectedSize && <p className="text-white/40 text-xs mt-0.5">Category: {item.selectedSize}</p>}
        <p className="text-[#55A2F5] font-bold text-lg mt-1">Php {item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
          className="w-8 h-8 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg flex items-center justify-center transition-all"
        >
          <Minus className="w-4 h-4 text-white" />
        </button>
        <span className="font-bold text-white w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
          className="w-8 h-8 bg-[#55A2F5] hover:opacity-90 rounded-lg flex items-center justify-center transition-all shadow-lg"
        >
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>
      {detailed && (
        <button
          onClick={() => removeFromCart(item.id, item.selectedSize)}
          className="text-white/20 hover:text-red-400 p-2 transition-all ml-2"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// Checkout Page
function CheckoutPage({ setCurrentPage, clearCart }) {
  const { getTotalPrice, cartItems } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    paymentMethod: 'cash',
    paymentReference: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState('checking'); // 'checking', 'subscribed', 'not-subscribed', 'denied'

  // Check notification subscription status on mount
  useEffect(() => {
    const checkNotificationStatus = async () => {
      try {
        if (window.OneSignalDeferred) {
          window.OneSignalDeferred.push(async function (OneSignal) {
            const permission = await OneSignal.Notifications.permission;
            const playerId = await OneSignal.User.PushSubscription.id;

            if (permission === false) {
              setNotificationStatus('denied');
            } else if (playerId) {
              setNotificationStatus('subscribed');
            } else {
              setNotificationStatus('not-subscribed');
            }
          });
        } else {
          setNotificationStatus('not-subscribed');
        }
      } catch (err) {
        console.log('Error checking notification status:', err);
        setNotificationStatus('not-subscribed');
      }
    };

    checkNotificationStatus();
  }, []);

  // Function to request notification permission
  const requestNotificationPermission = async () => {
    try {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal) {
          await OneSignal.Notifications.requestPermission();
          // Check status after requesting
          const playerId = await OneSignal.User.PushSubscription.id;
          if (playerId) {
            setNotificationStatus('subscribed');
          } else {
            const permission = await OneSignal.Notifications.permission;
            if (permission === false) {
              setNotificationStatus('denied');
            }
          }
        });
      }
    } catch (err) {
      console.log('Error requesting notification permission:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate payment reference for Bank Transfer only (GCash uses PayMongo)
    if (formData.paymentMethod === 'bank' && !formData.paymentReference.trim()) {
      alert('Please enter the Bank reference number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const deliveryFee = 4.99;
      const tax = getTotalPrice() * 0.08;
      const total = getTotalPrice() + deliveryFee + tax;

      // Format cart items as a string
      const itemsList = cartItems.map(item =>
        `${item.name}${item.selectedSize ? ` (${item.selectedSize})` : ''} (x${item.quantity}) - Php ${(item.price * item.quantity).toFixed(2)}`
      ).join(', ');

      // Format payment method display
      let paymentMethodDisplay = formData.paymentMethod;
      if (formData.paymentMethod === 'cash') {
        paymentMethodDisplay = 'Cash on Delivery';
      } else if (formData.paymentMethod === 'gcash') {
        paymentMethodDisplay = 'GCash';
      } else if (formData.paymentMethod === 'bank') {
        paymentMethodDisplay = `Bank Transfer (Ref: ${formData.paymentReference})`;
      }

      // Get OneSignal Player ID for customer notifications
      let playerId = null;
      try {
        if (window.OneSignalDeferred) {
          await new Promise((resolve) => {
            window.OneSignalDeferred.push(async function (OneSignal) {
              playerId = await OneSignal.User.PushSubscription.id;
              resolve();
            });
          });
        }
      } catch (err) {
        console.log('Could not get OneSignal player ID:', err);
      }

      // Send data to Google Sheets
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          barangay: formData.zipCode,
          paymentMethod: paymentMethodDisplay,
          paymentReference: formData.paymentReference || 'N/A',
          playerId: playerId || '',
          items: itemsList,
          subtotal: getTotalPrice().toFixed(2),
          deliveryFee: deliveryFee.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2)
        })
      });

      const result = await response.json();

      if (result.success) {
        // If GCash payment, redirect to PayMongo checkout
        if (result.requiresPayment && result.paymentUrl) {
          // Store order number for later reference
          localStorage.setItem('pendingOrder', result.orderNumber);
          // Redirect to GCash payment page
          window.location.href = result.paymentUrl;
        } else {
          // Clear cart and go to confirmation for non-GCash payments
          if (clearCart) clearCart();
          setCurrentPage('confirmation');
        }
      } else {
        alert('Error: ' + (result.error || 'Failed to process order'));
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryFee = 4.99;
  const tax = getTotalPrice() * 0.08;
  const total = getTotalPrice() + deliveryFee + tax;

  return (
    <div className="min-h-screen py-12">
      <div className="w-full max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-white mb-10 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="rounded-2xl border border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
              <div className="px-6 py-5 bg-white/5 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">Delivery Address</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="ZIP Code"
                    required
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Street Address"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none text-sm mt-3"
                />
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-green-500 focus:outline-none text-sm mt-3"
                />
              </div>

              {/* Notification Subscription Prompt */}
              {notificationStatus === 'checking' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                    <span className="text-sm text-gray-600">Checking notification status...</span>
                  </div>
                </div>
              )}

              {notificationStatus !== 'subscribed' && notificationStatus !== 'checking' && (
                <div className={`rounded-lg p-4 border-2 ${notificationStatus === 'denied'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-300'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {notificationStatus === 'denied' ? '🔕' : '🔔'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">
                        {notificationStatus === 'denied'
                          ? 'Notifications Blocked'
                          : 'Get Order Updates'}
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        {notificationStatus === 'denied'
                          ? 'You\'ve blocked notifications. Enable them in your browser settings to receive real-time order updates.'
                          : 'Enable push notifications to receive real-time updates when your order is being prepared, out for delivery, and delivered!'}
                      </p>
                      {notificationStatus === 'not-subscribed' && (
                        <button
                          type="button"
                          onClick={requestNotificationPermission}
                          className="bg-green-600 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-green-700 transition-all flex items-center gap-2"
                        >
                          <span>🔔</span>
                          <span>Enable Notifications</span>
                        </button>
                      )}
                      {notificationStatus === 'denied' && (
                        <p className="text-xs text-red-600 font-medium">
                          To enable: Click the lock icon in your browser's address bar → Allow notifications
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {notificationStatus === 'subscribed' && (
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">✅</div>
                    <div>
                      <h4 className="font-medium text-green-700 text-sm">Notifications Enabled</h4>
                      <p className="text-xs text-green-600">You'll receive updates when your order status changes!</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-base font-medium text-gray-700 mb-4">Payment Method</h3>
                <div className="space-y-2">
                  <label className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value, paymentReference: '' })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">Cash on Delivery</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all ${formData.paymentMethod === 'gcash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="gcash"
                      checked={formData.paymentMethod === 'gcash'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">GCash</span>
                  </label>

                  <label className={`flex items-center space-x-3 p-3 border rounded-md cursor-pointer transition-all ${formData.paymentMethod === 'bank' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="w-4 h-4 text-green-600"
                    />
                    <span className="text-sm text-gray-700">Bank Transfer</span>
                  </label>
                </div>

                {/* Payment Instructions */}
                {formData.paymentMethod === 'cash' && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-2">Cash on Delivery Instructions</h4>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      <li>Prepare exact amount if possible</li>
                      <li>Payment will be collected upon delivery</li>
                      <li>Please have your order number ready</li>
                    </ul>
                  </div>
                )}

                {formData.paymentMethod === 'gcash' && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-3">GCash Payment</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-md p-3 border border-green-100">
                        <p className="text-xs text-gray-500 mb-1">Amount to pay:</p>
                        <p className="text-lg font-medium text-green-600">Php {(getTotalPrice() + 4.99 + getTotalPrice() * 0.08).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Secure payment via PayMongo</span>
                      </div>
                      <div className="text-xs text-gray-600 bg-white rounded-md p-3 border border-green-100">
                        <p className="font-medium mb-2">How it works:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Click "Place Order" below</li>
                          <li>You'll be redirected to GCash to complete payment</li>
                          <li>After payment, you'll return here automatically</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === 'bank' && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-700 text-sm mb-3">Bank Transfer Instructions</h4>
                    <div className="space-y-3">
                      <div className="bg-white rounded-md p-3 border border-blue-100">
                        <p className="text-xs text-gray-500 mb-2">Transfer to:</p>
                        <p className="text-xs text-gray-600">Bank: BDO</p>
                        <p className="text-xs text-gray-600">Account Name: Kuchefnero Restaurant</p>
                        <p className="text-base font-medium text-gray-800">Account #: 1234-5678-9012</p>
                      </div>
                      <div className="bg-white rounded-md p-3 border border-blue-100">
                        <p className="text-xs text-gray-500 mb-1">Amount to transfer:</p>
                        <p className="text-lg font-medium text-blue-600">Php {(getTotalPrice() + 4.99 + getTotalPrice() * 0.08).toFixed(2)}</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p className="font-medium">After transfer:</p>
                        <ol className="list-decimal list-inside space-y-1 ml-2">
                          <li>Keep your bank receipt/confirmation</li>
                          <li>Enter the reference number below</li>
                          <li>Send photo of receipt to our contact number</li>
                        </ol>
                      </div>
                      <input
                        type="text"
                        placeholder="Enter Bank Reference Number"
                        value={formData.paymentReference}
                        onChange={(e) => setFormData({ ...formData, paymentReference: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-md font-medium transition-all text-sm ${isSubmitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? 'Processing...' : `Place Order - Php ${total.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-[160px] md:top-[120px]">
              <h3 className="text-base font-medium text-gray-800 mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Php {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Delivery Fee</span>
                  <span>Php {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>Php {tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span className="text-green-600">Php {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation Page
function ConfirmationPage({ setCurrentPage, orderNumber, paymentStatus }) {
  // Generate order number if not provided (for non-GCash orders)
  const displayOrderNumber = orderNumber || `ORD-${Date.now()}`;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="w-full px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-800 mb-1">
            {paymentStatus === 'success' ? 'Payment Successful!' : 'Order Confirmed'}
          </h1>
          <p className="text-sm text-gray-500">
            {paymentStatus === 'success' ? 'Your GCash payment has been received' : 'Thank you for your order'}
          </p>
        </div>

        {/* Order Number */}
        <div className="bg-green-600 rounded-lg p-4 mb-6 text-center">
          <div className="text-xs text-green-200 mb-1">Order Number</div>
          <div className="text-xl font-medium text-white">{displayOrderNumber}</div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg p-5 mb-6 shadow-sm">
          <h3 className="text-base font-medium text-gray-800 mb-4">Order Status</h3>

          <div className="space-y-0">
            {/* Order Confirmed */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="w-0.5 h-8 bg-green-500"></div>
              </div>
              <div className="pb-3">
                <div className="text-sm font-medium text-gray-800">Order Received</div>
                <div className="text-xs text-gray-500">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</div>
              </div>
            </div>

            {/* Preparing */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-green-500 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="w-0.5 h-8 bg-gray-200"></div>
              </div>
              <div className="pb-3">
                <div className="text-sm font-medium text-gray-800">Preparing your order</div>
                <div className="text-xs text-gray-500">Estimated: 15-20 mins</div>
              </div>
            </div>

            {/* Out for Delivery */}
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Out for delivery</div>
                <div className="text-xs text-gray-400">Estimated arrival: 25-30 mins</div>
              </div>
            </div>
          </div>
        </div>

        {/* SMS Notice */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500">You will receive a text message with delivery updates</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex-1 bg-green-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-green-700 transition-all"
          >
            Back to Home
          </button>
          <button
            onClick={() => setCurrentPage('menu')}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Order Again
          </button>
        </div>
      </div>
    </div>
  );
}

// Payment Failed Page
function PaymentFailedPage({ setCurrentPage, orderNumber }) {
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="w-full px-8 max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-xl font-medium text-gray-800 mb-1">Payment Failed</h1>
          <p className="text-sm text-gray-500">Your GCash payment was not completed</p>
        </div>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-gray-200 rounded-lg p-4 mb-6 text-center">
            <div className="text-xs text-gray-500 mb-1">Order Number</div>
            <div className="text-xl font-medium text-gray-700">{orderNumber}</div>
          </div>
        )}

        {/* Message */}
        <div className="bg-white rounded-lg p-5 mb-6 shadow-sm">
          <h3 className="text-base font-medium text-gray-800 mb-3">What happened?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Your payment was cancelled or failed to process. Your order has been saved but is awaiting payment.
          </p>
          <h3 className="text-base font-medium text-gray-800 mb-3">What can you do?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Try placing your order again with GCash</li>
            <li>• Choose a different payment method (Cash on Delivery)</li>
            <li>• Contact us if you need assistance</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setCurrentPage('checkout')}
            className="w-full bg-green-600 text-white py-2.5 rounded-md text-sm font-medium hover:bg-green-700 transition-all"
          >
            Try Again
          </button>
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-md text-sm font-medium hover:bg-gray-200 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Queue Admin Tab (inside AdminDashboard)
function QueueAdminTab({ setCurrentPage }) {
  const TEMPLATE_STORAGE_KEY = 'queueDisplayTemplate';
  const VALID_TEMPLATES = ['template1', 'template2', 'template3', 'template4', 'template5', 'template6'];
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ waiting: 0, serving: 0, completed: 0, skipped: 0, total: 0 });
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [tellers, setTellers] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypePrefix, setNewTypePrefix] = useState('');
  const [newWindowName, setNewWindowName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [marqueeText, setMarqueeText] = useState('');
  const [marqueeSaving, setMarqueeSaving] = useState(false);
  const [displayTemplate, setDisplayTemplate] = useState(localStorage.getItem(TEMPLATE_STORAGE_KEY) || 'template1');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  const fetchAll = async () => {
    try {
      const [ticketsRes, typesRes, tellersRes, marqueeRes] = await Promise.all([
        fetch('http://localhost:5000/api/queue/tickets').then(r => r.json()),
        fetch('http://localhost:5000/api/queue/transaction-types').then(r => r.json()),
        fetch('http://localhost:5000/api/queue/tellers').then(r => r.json()),
        fetch('http://localhost:5000/api/queue/marquee').then(r => r.json())
      ]);
      if (ticketsRes.success) { setTickets(ticketsRes.tickets); setStats(ticketsRes.stats); }
      if (typesRes.success) setTransactionTypes(typesRes.types);
      if (tellersRes.success) setTellers(tellersRes.tellers);
      if (marqueeRes.success) setMarqueeText(marqueeRes.text);
      try {
        const templateRes = await fetch('http://localhost:5000/api/queue/display-template').then(r => r.json());
        if (templateRes.success && VALID_TEMPLATES.includes(templateRes.template)) {
          setDisplayTemplate(templateRes.template);
          localStorage.setItem(TEMPLATE_STORAGE_KEY, templateRes.template);
        } else {
          const localTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
          if (VALID_TEMPLATES.includes(localTemplate)) setDisplayTemplate(localTemplate);
        }
      } catch (_) {
        const localTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
        if (VALID_TEMPLATES.includes(localTemplate)) setDisplayTemplate(localTemplate);
      }
    } catch (err) {
      console.error('Error fetching queue data:', err);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetQueue = async () => {
    try {
      await fetch('http://localhost:5000/api/queue/reset', { method: 'POST' });
      setShowResetConfirm(false);
      fetchAll();
    } catch (err) { console.error('Error resetting queue:', err); }
  };

  const addTransactionType = async () => {
    if (!newTypeName || !newTypePrefix) return;
    try {
      await fetch('http://localhost:5000/api/queue/transaction-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTypeName, prefix: newTypePrefix })
      });
      setNewTypeName(''); setNewTypePrefix('');
      fetchAll();
    } catch (err) { console.error('Error adding type:', err); }
  };

  const deleteTransactionType = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/queue/transaction-types/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (err) { console.error('Error deleting type:', err); }
  };

  const addTeller = async () => {
    if (!newWindowName) return;
    try {
      await fetch('http://localhost:5000/api/queue/tellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowName: newWindowName })
      });
      setNewWindowName('');
      fetchAll();
    } catch (err) { console.error('Error adding teller:', err); }
  };

  const deleteTeller = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/queue/tellers/${id}`, { method: 'DELETE' });
      fetchAll();
    } catch (err) { console.error('Error deleting teller:', err); }
  };

  const updateWindowAssignments = async (tellerId, typeId, checked) => {
    const teller = tellers.find(t => t.id === tellerId);
    if (!teller) return;
    const currentIds = (teller.assigned_types || []).map(t => t.id);
    const newIds = checked
      ? [...currentIds, typeId]
      : currentIds.filter(id => id !== typeId);
    try {
      await fetch(`http://localhost:5000/api/queue/window-transactions/${tellerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionTypeIds: newIds })
      });
      fetchAll();
    } catch (err) { console.error('Error updating assignments:', err); }
  };

  const fetchReport = async () => {
    setReportLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/queue/reports?startDate=${reportStartDate}&endDate=${reportEndDate}`);
      const data = await res.json();
      if (data.success) setReportData(data);
    } catch (err) { console.error('Error fetching report:', err); }
    setReportLoading(false);
  };

  const formatSeconds = (s) => {
    if (!s || s === 0) return '0s';
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  };

  const getQueueStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      case 'serving': return 'bg-green-50 text-green-700 border-green-300';
      case 'completed': return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'skipped': return 'bg-red-50 text-red-700 border-red-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  return (
    <>
      {/* Analytics — Two Column: Queue Status + Timeliness */}
      {(() => {
        const chartData = [
          { label: 'Waiting', value: stats.waiting, color: '#F59E0B' },
          { label: 'Serving', value: stats.serving, color: '#3B82F6' },
          { label: 'Completed', value: stats.completed, color: '#10B981' },
          { label: 'Skipped', value: stats.skipped, color: '#EF4444' },
        ];
        const total = stats.total || 1;
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        let cumulative = 0;

        const completedTickets = tickets.filter(t => t.status === 'completed' && t.created_at && t.called_at && t.completed_at);
        const hasTimeliness = completedTickets.length > 0;

        let avgWait = 0, avgServe = 0, avgTotal = 0, maxWait = 0, minWait = 0, buckets = [], maxBucket = 1;
        const fmt = (min) => min < 1 ? `${Math.round(min * 60)}s` : `${min.toFixed(1)}m`;

        if (hasTimeliness) {
          const waitTimes = completedTickets.map(t => (new Date(t.called_at) - new Date(t.created_at)) / 60000);
          const serveTimes = completedTickets.map(t => (new Date(t.completed_at) - new Date(t.called_at)) / 60000);
          const totalTimes = completedTickets.map(t => (new Date(t.completed_at) - new Date(t.created_at)) / 60000);
          avgWait = waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length;
          avgServe = serveTimes.reduce((a, b) => a + b, 0) / serveTimes.length;
          avgTotal = totalTimes.reduce((a, b) => a + b, 0) / totalTimes.length;
          maxWait = Math.max(...waitTimes);
          minWait = Math.min(...waitTimes);
          buckets = [
            { label: '< 2 min', count: waitTimes.filter(t => t < 2).length, color: '#10B981' },
            { label: '2-5 min', count: waitTimes.filter(t => t >= 2 && t < 5).length, color: '#3B82F6' },
            { label: '5-10 min', count: waitTimes.filter(t => t >= 5 && t < 10).length, color: '#F59E0B' },
            { label: '> 10 min', count: waitTimes.filter(t => t >= 10).length, color: '#EF4444' },
          ];
          maxBucket = Math.max(...buckets.map(b => b.count), 1);
        }

        return (
          <div className={`grid grid-cols-1 ${hasTimeliness ? 'md:grid-cols-2' : ''} gap-4 mb-6`}>
            {/* Column 1: Queue Status */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0">
                  <svg width="160" height="160" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="16" />
                    {chartData.map((seg, i) => {
                      const pct = seg.value / total;
                      const dashLen = pct * circumference;
                      const offset = -cumulative * circumference;
                      cumulative += pct;
                      if (seg.value === 0) return null;
                      return (
                        <circle key={i} cx="64" cy="64" r={radius} fill="none" stroke={seg.color} strokeWidth="16"
                          strokeDasharray={`${dashLen} ${circumference - dashLen}`} strokeDashoffset={offset}
                          strokeLinecap="butt" transform="rotate(-90 64 64)" style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                      );
                    })}
                    <text x="64" y="58" textAnchor="middle" fill="#1F2937" fontSize="22" fontWeight="700">{stats.total}</text>
                    <text x="64" y="76" textAnchor="middle" fill="#6B7280" fontSize="10">Total</text>
                  </svg>
                </div>
                <div className="flex-1 w-full">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Queue Status</h3>
                  <div className="space-y-3">
                    {chartData.map((seg, i) => {
                      const pct = stats.total > 0 ? Math.round((seg.value / stats.total) * 100) : 0;
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: seg.color }}></span>
                              <span className="text-sm text-gray-600">{seg.label}</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{seg.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: seg.color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Timeliness */}
            {hasTimeliness && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Timeliness</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{fmt(avgWait)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Wait</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{fmt(avgServe)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Serve</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-700">{fmt(avgTotal)}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Total</p>
                  </div>
                </div>
                <h4 className="text-xs font-semibold text-gray-500 mb-2">Wait Time Distribution</h4>
                <div className="space-y-2">
                  {buckets.map((b, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{b.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${Math.max((b.count / maxBucket) * 100, b.count > 0 ? 8 : 0)}%`, backgroundColor: b.color }}>
                          {b.count > 0 && <span className="text-[10px] font-bold text-white">{b.count}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span>Fastest: {fmt(minWait)}</span>
                  <span>Slowest: {fmt(maxWait)}</span>
                  <span>Served: {completedTickets.length}</span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Quick Links */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button onClick={() => setCurrentPage('queue-display')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Open Public Display
        </button>
        <button onClick={() => setCurrentPage('queue-teller')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Open Teller View
        </button>
        <button onClick={() => setShowResetConfirm(true)} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-red-200 ml-auto">
          Reset Queue
        </button>
      </div>

      {/* Reset Confirm */}
      {showResetConfirm && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-red-600 text-sm">Are you sure? This will delete all tickets for today.</p>
          <div className="flex gap-2">
            <button onClick={resetQueue} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Yes, Reset</button>
            <button onClick={() => setShowResetConfirm(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </div>
      )}

      {/* Today's Tickets */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200">
          <h3 className="text-gray-800 font-bold text-lg">Today's Tickets</h3>
          <div className="flex gap-2">
            <button onClick={() => window.open('http://localhost:5000/api/export/queue-tickets', '_blank')} className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border border-blue-200">
              Export CSV
            </button>
            <button onClick={fetchAll} className="text-blue-600 hover:text-blue-800 text-sm transition-all">Refresh</button>
          </div>
        </div>
        {tickets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No tickets today</p>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-8 gap-3 px-4 py-3 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-xs font-semibold text-white uppercase tracking-wider items-center">
              <span>Ticket</span>
              <span>Name</span>
              <span>Phone</span>
              <span>Transaction</span>
              <span>Status</span>
              <span>Window</span>
              <span>Teller</span>
              <span>Time</span>
            </div>
            {tickets.map((t, index) => (
              <div key={t.id} className={`grid grid-cols-1 md:grid-cols-8 gap-3 px-4 py-3 items-center text-sm border-b border-blue-100 hover:bg-blue-50/50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                <div className="font-bold text-blue-700 min-w-0">
                  {t.ticket_number}
                  {t.is_priority && <span className="ml-1 text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full uppercase">{t.priority_type || 'Priority'}</span>}
                </div>
                <span className="text-gray-800 font-medium truncate">{t.customer_name}</span>
                <span className="text-gray-600 truncate">{t.cellphone_number}</span>
                <span className="text-gray-600 truncate">{t.transaction_type}</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium border w-fit ${getQueueStatusColor(t.status)}`}>
                  {t.status}
                </span>
                <span className="text-gray-600">{t.teller_window || '-'}</span>
                <span className="text-gray-600">{t.teller_name || '-'}</span>
                <span className="text-gray-600">{new Date(t.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Transaction Types */}
        <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Transaction Types</h3>
          <div className="space-y-2 mb-4">
            {transactionTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                <div>
                  <span className="text-gray-800 text-sm font-medium">{type.name}</span>
                  <span className="text-gray-400 text-xs ml-2">({type.prefix})</span>
                </div>
                <button onClick={() => deleteTransactionType(type.id)} className="text-red-400 hover:text-red-600 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTypeName}
              onChange={e => setNewTypeName(e.target.value)}
              placeholder="Name"
              className="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#576CA8] focus:outline-none"
            />
            <input
              type="text"
              value={newTypePrefix}
              onChange={e => setNewTypePrefix(e.target.value.toUpperCase().slice(0, 3))}
              placeholder="Prefix"
              maxLength={3}
              className="w-20 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#576CA8] focus:outline-none"
            />
            <button onClick={addTransactionType} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#465a8f] transition-all">
              Add
            </button>
          </div>
        </div>

        {/* Teller Windows */}
        <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6">
          <h3 className="text-gray-800 font-bold text-lg mb-4">Teller Windows</h3>

          <div className="space-y-3 mb-4">
            {tellers.map(teller => {
              const assignedIds = (teller.assigned_types || []).map(t => t.id);
              return (
                <div key={teller.id} className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-800 text-sm font-medium">{teller.window_name}</span>
                    <button onClick={() => deleteTeller(teller.id)} className="text-red-400 hover:text-red-600 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {transactionTypes.map(type => (
                      <label key={type.id} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={assignedIds.includes(type.id)}
                          onChange={(e) => updateWindowAssignments(teller.id, type.id, e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-600">{type.name}</span>
                      </label>
                    ))}
                    {assignedIds.length === 0 && <span className="text-xs text-gray-400 italic">Serves all types</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newWindowName}
              onChange={e => setNewWindowName(e.target.value)}
              placeholder="Window name"
              className="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#576CA8] focus:outline-none"
            />
            <button onClick={addTeller} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#465a8f] transition-all">
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Text */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6 mt-6">
        <h3 className="text-gray-800 font-bold text-lg mb-4">Display Marquee Text</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={marqueeText}
            onChange={e => setMarqueeText(e.target.value)}
            placeholder="Enter scrolling text for the queue display..."
            className="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm placeholder-gray-400 focus:border-[#576CA8] focus:outline-none"
          />
          <button
            onClick={async () => {
              setMarqueeSaving(true);
              try {
                await fetch('http://localhost:5000/api/queue/marquee', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: marqueeText })
                });
              } catch (err) { console.error('Error saving marquee:', err); }
              setMarqueeSaving(false);
            }}
            disabled={marqueeSaving}
            className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50"
          >
            {marqueeSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">This text scrolls at the bottom of the public queue display screen.</p>
      </div>

      {/* Display Template */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm p-6 mt-6">
        <h3 className="text-gray-800 font-bold text-lg mb-4">Display Template</h3>
        <div className="flex flex-col md:flex-row gap-2 md:items-center">
          <select
            value={displayTemplate}
            onChange={(e) => setDisplayTemplate(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm focus:border-[#576CA8] focus:outline-none"
          >
            <option value="template1">Template 1 - Classic</option>
            <option value="template2">Template 2 - Split Board</option>
            <option value="template3">Template 3 - Spotlight</option>
            <option value="template4">Template 4 - Corporate Grid</option>
            <option value="template5">Template 5 - Minimal Columns</option>
            <option value="template6">Template 6 - Executive Panel</option>
          </select>
          <button
            onClick={async () => {
              localStorage.setItem(TEMPLATE_STORAGE_KEY, displayTemplate);
              setTemplateSaving(true);
              try {
                const res = await fetch('http://localhost:5000/api/queue/display-template', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ template: displayTemplate })
                });
                const data = await res.json().catch(() => ({ success: false }));
                if (!res.ok || !data.success) {
                  throw new Error(data.message || 'Failed to save template');
                }
              } catch (err) { console.error('Error saving display template:', err); }
              setTemplateSaving(false);
            }}
            disabled={templateSaving}
            className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50"
          >
            {templateSaving ? 'Saving...' : 'Set as Default'}
          </button>
        </div>
        <p className="text-gray-400 text-xs mt-2">Public display will use this template by default.</p>
      </div>

      {/* Reports Section */}
      <div className="bg-white border border-blue-200 rounded-xl shadow-sm mt-6 overflow-hidden">
        <button
          onClick={() => setShowReports(!showReports)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-blue-50/50 transition-all"
        >
          <h3 className="text-gray-800 font-bold text-lg">Queue Reports & Analytics</h3>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showReports ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showReports && (
          <div className="px-6 pb-6 border-t border-blue-100">
            {/* Date Range + Generate */}
            <div className="flex flex-wrap items-end gap-3 mt-4 mb-6">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input type="date" value={reportStartDate} onChange={e => setReportStartDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm focus:border-[#576CA8] focus:outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">End Date</label>
                <input type="date" value={reportEndDate} onChange={e => setReportEndDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-gray-800 text-sm focus:border-[#576CA8] focus:outline-none" />
              </div>
              <button onClick={fetchReport} disabled={reportLoading}
                className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50">
                {reportLoading ? 'Loading...' : 'Generate Report'}
              </button>
              <button onClick={() => {
                const params = new URLSearchParams({ startDate: reportStartDate, endDate: reportEndDate });
                window.open(`http://localhost:5000/api/export/queue-tickets?${params}`, '_blank');
              }}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-all border border-blue-200">
                Export to CSV
              </button>
            </div>

            {reportData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#274690] rounded-xl p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Total Tickets</p>
                    <p className="text-3xl font-bold text-white">{reportData.summary.totalTickets}</p>
                  </div>
                  <div className="bg-[#274690] rounded-xl p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Avg Wait</p>
                    <p className="text-2xl font-bold text-white">{formatSeconds(reportData.summary.avgWaitTime)}</p>
                  </div>
                  <div className="bg-[#274690] rounded-xl p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Avg Serving</p>
                    <p className="text-2xl font-bold text-white">{formatSeconds(reportData.summary.avgServingTime)}</p>
                  </div>
                  <div className="bg-[#274690] rounded-xl p-4 flex items-center justify-between">
                    <p className="text-blue-200 text-xs uppercase tracking-wider">Peak Hour</p>
                    <p className="text-2xl font-bold text-white">{reportData.summary.peakHour !== null ? `${reportData.summary.peakHour}:00` : '-'}</p>
                  </div>
                </div>

                {/* Completion Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-600 text-xs uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{reportData.summary.completed}</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-600 text-xs uppercase tracking-wider">Skipped</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{reportData.summary.skipped}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                    <p className="text-orange-600 text-xs uppercase tracking-wider">Priority</p>
                    <p className="text-2xl font-bold text-orange-700 mt-1">{reportData.summary.priorityCount}</p>
                  </div>
                </div>

                {/* By Transaction Type */}
                {reportData.byTransactionType.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-800 font-bold text-sm mb-3 uppercase tracking-wider">By Transaction Type</h4>
                    <div className="bg-blue-50/50 rounded-xl overflow-hidden border border-blue-200">
                      <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-xs font-semibold text-white uppercase tracking-wider">
                        <span>Type</span>
                        <span className="text-center">Count</span>
                        <span className="text-right">Avg Wait</span>
                      </div>
                      {reportData.byTransactionType.map((item, i) => (
                        <div key={item.type} className={`grid grid-cols-3 gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                          <span className="text-gray-800 font-medium">{item.type}</span>
                          <span className="text-gray-600 text-center">{item.count}</span>
                          <span className="text-gray-600 text-right">{formatSeconds(item.avgWait)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By Hour - Bar Chart */}
                {reportData.byHour.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-gray-800 font-bold text-sm mb-3 uppercase tracking-wider">Tickets by Hour</h4>
                    <div className="bg-white rounded-xl border border-blue-200 p-4">
                      {(() => {
                        const maxCount = Math.max(...reportData.byHour.map(h => h.count));
                        return (
                          <div className="space-y-1.5">
                            {reportData.byHour.map(item => (
                              <div key={item.hour} className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 w-12 text-right font-mono">{item.hour}:00</span>
                                <div className="flex-1 bg-blue-100 rounded-full h-6 overflow-hidden">
                                  <div
                                    className="bg-blue-600 h-full rounded-full flex items-center justify-end pr-2 transition-all"
                                    style={{ width: `${Math.max((item.count / maxCount) * 100, 8)}%` }}
                                  >
                                    <span className="text-white text-xs font-bold">{item.count}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* By Day */}
                {reportData.byDay.length > 1 && (
                  <div>
                    <h4 className="text-gray-800 font-bold text-sm mb-3 uppercase tracking-wider">Daily Breakdown</h4>
                    <div className="bg-blue-50/50 rounded-xl overflow-hidden border border-blue-200">
                      <div className="grid grid-cols-3 gap-3 px-4 py-2 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-xs font-semibold text-white uppercase tracking-wider">
                        <span>Date</span>
                        <span className="text-center">Total</span>
                        <span className="text-right">Completed</span>
                      </div>
                      {reportData.byDay.map((item, i) => (
                        <div key={item.date} className={`grid grid-cols-3 gap-3 px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'}`}>
                          <span className="text-gray-800 font-medium">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="text-gray-600 text-center">{item.total}</span>
                          <span className="text-gray-600 text-right">{item.completed}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// Queue Page
function QueuePage({ setCurrentPage }) {
  const [view, setView] = useState('initial'); // initial, form, receipt
  const [formData, setFormData] = useState({ customerName: '', cellphoneNumber: '', transactionType: '', isPriority: false, priorityType: '' });
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/queue/transaction-types')
      .then(res => res.json())
      .then(data => { if (data.success) setTransactionTypes(data.types); })
      .catch(err => console.error('Error fetching transaction types:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/queue/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setTicket(data.ticket);
        setPosition(data.position);
        setView('receipt');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ customerName: '', cellphoneNumber: '', transactionType: '', isPriority: false, priorityType: '' });
    setTicket(null);
    setView('initial');
  };

  // Initial view - Create Ticket button
  if (view === 'initial') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 pt-[30px]">
        <p className="text-gray-500 text-sm mb-6 text-center max-w-sm mt-[30px]">Tap the button below to get your queue number and wait for your turn to be called.</p>
        <button
          onClick={() => setView('form')}
          className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#465a8f] transition-all shadow-lg hover:shadow-[#576CA8]/20 hover:-translate-y-0.5 flex items-center space-x-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create a Ticket</span>
        </button>
      </div>
    );
  }

  // Receipt view
  if (view === 'receipt' && ticket) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-8">
        <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-[#576CA8]" />
          </div>
          <p className="text-gray-500 text-sm mb-2">Your Ticket Number</p>
          <h2 className="text-5xl font-black text-[#576CA8] mb-4 tracking-wider">{ticket.ticket_number}</h2>
          <div className="bg-blue-50 rounded-xl p-4 mb-6 space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Name</span>
              <span className="text-gray-800 text-sm font-medium">{ticket.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Transaction</span>
              <span className="text-gray-800 text-sm font-medium">{ticket.transaction_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Queue Position</span>
              <span className="text-[#576CA8] text-sm font-bold">#{position}</span>
            </div>
            {ticket.is_priority && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Priority</span>
                <span className="text-orange-400 text-sm font-bold">{ticket.priority_type}</span>
              </div>
            )}
          </div>
          <p className="text-gray-400 text-xs mb-6">{ticket.is_priority ? 'You are in the priority lane. Please wait for your number.' : 'Please wait for your number to be called.'}</p>
          <button
            onClick={resetForm}
            className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white py-3 rounded-full font-semibold text-sm hover:bg-[#465a8f] transition-all"
          >
            Okay
          </button>
        </div>
      </div>
    );
  }

  // Form view
  return (
    <div className="min-h-[60vh] flex items-start justify-center px-4 pt-[50px] py-8 md:pt-[80px]">
      <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-8 max-w-md w-full">
        <button onClick={() => setView('initial')} className="text-gray-500 hover:text-blue-700 text-sm mb-4 flex items-center gap-1 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Create a Ticket</h2>
        <p className="text-gray-500 text-sm mb-6">Fill in your details to join the queue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 focus:border-[#576CA8] focus:ring-2 focus:ring-[#55A2F5]/30 focus:outline-none transition-all text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">Cellphone Number</label>
            <input
              type="tel"
              required
              value={formData.cellphoneNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, cellphoneNumber: e.target.value }))}
              placeholder="09XX XXX XXXX"
              className="w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 focus:border-[#576CA8] focus:ring-2 focus:ring-[#55A2F5]/30 focus:outline-none transition-all text-gray-800 placeholder-gray-400 text-sm"
            />
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-1">Transaction</label>
            <select
              required
              value={formData.transactionType}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionType: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg border border-blue-200 bg-blue-50 focus:border-[#576CA8] focus:ring-2 focus:ring-[#55A2F5]/30 focus:outline-none transition-all text-gray-800 text-sm"
            >
              <option value="" className="bg-white text-gray-800">Select transaction type</option>
              {transactionTypes.map(type => (
                <option key={type.id} value={type.name} className="bg-white text-gray-800">{type.name}</option>
              ))}
            </select>
          </div>
          {/* Priority Lane */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPriority}
                onChange={(e) => setFormData(prev => ({ ...prev, isPriority: e.target.checked, priorityType: e.target.checked ? prev.priorityType : '' }))}
                className="w-5 h-5 rounded accent-[#55A2F5]"
              />
              <div>
                <span className="text-gray-800 text-sm font-medium">Priority Lane</span>
                <p className="text-gray-400 text-xs">Senior Citizen, PWD, or Pregnant Women</p>
              </div>
            </label>
            {formData.isPriority && (
              <div className="mt-3 flex gap-2">
                {['Senior Citizen', 'PWD', 'Pregnant'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priorityType: type }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${formData.priorityType === type ? 'bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white border-[#576CA8]' : 'bg-blue-50 text-gray-500 border-blue-200 hover:border-blue-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white py-3 rounded-lg font-bold text-sm hover:bg-[#465a8f] transition-all disabled:opacity-50 mt-2"
          >
            {isSubmitting ? 'Creating...' : 'Get Ticket Number'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Queue Display Page (Public TV/Monitor)
function QueueDisplayPage() {
  const TEMPLATE_STORAGE_KEY = 'queueDisplayTemplate';
  const VALID_TEMPLATES = ['template1', 'template2', 'template3', 'template4', 'template5', 'template6'];
  const [serving, setServing] = useState([]);
  const [waiting, setWaiting] = useState([]);
  const [avgServingTime, setAvgServingTime] = useState(300);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marqueeText, setMarqueeText] = useState('');
  const [displayTemplate, setDisplayTemplate] = useState(localStorage.getItem(TEMPLATE_STORAGE_KEY) || 'template1');
  const [announcedIds, setAnnouncedIds] = useState(new Set());
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAnnouncing, setIsAnnouncing] = useState(false);
  const [cardAnimation, setCardAnimation] = useState('');

  const animationStyles = [
    'card-animate-flip',
    'card-animate-slide',
    'card-animate-bounce',
  ];

  // Random card animation every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomAnim = animationStyles[Math.floor(Math.random() * animationStyles.length)];
      setCardAnimation(randomAnim);
      // Remove animation class after it completes so it can retrigger
      setTimeout(() => setCardAnimation(''), 1500);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatWaitTime = (seconds) => {
    if (seconds < 60) return '< 1 min';
    const mins = Math.round(seconds / 60);
    return `~${mins} min`;
  };

  // Play a ding sound then announce via speech synthesis
  const announceTicket = (ticket) => {
    // Create a ding tone using AudioContext
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      // First ding
      const playDing = (time) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 830;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
        osc.start(time);
        osc.stop(time + 0.6);
      };
      playDing(audioCtx.currentTime);
      playDing(audioCtx.currentTime + 0.7);

      // Speech announcement after dings
      setIsAnnouncing(true);
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(
          `Ticket ${ticket.ticket_number.split('').join(' ')}, ${ticket.customer_name}, please proceed to ${ticket.teller_window}.`
        );
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onend = () => setIsAnnouncing(false);
        speechSynthesis.speak(utterance);
      }, 1500);
    } catch (err) {
      console.error('Audio error:', err);
    }
  };

  useEffect(() => {
    const fetchDisplay = () => {
      fetch('http://localhost:5000/api/queue/display')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            // Detect newly serving tickets and announce them
            if (hasInteracted) {
              data.serving.forEach(ticket => {
                if (!announcedIds.has(ticket.id)) {
                  announceTicket(ticket);
                  setAnnouncedIds(prev => new Set([...prev, ticket.id]));
                }
              });
            }
            setServing(data.serving);
            setWaiting(data.waiting);
            if (data.avgServingTime) setAvgServingTime(data.avgServingTime);
          }
        })
        .catch(err => console.error('Display fetch error:', err));
    };
    const fetchMarquee = () => {
      fetch('http://localhost:5000/api/queue/marquee')
        .then(res => res.json())
        .then(data => { if (data.success) setMarqueeText(data.text); })
        .catch(err => console.error('Marquee fetch error:', err));
    };
    const fetchTemplate = () => {
      fetch('http://localhost:5000/api/queue/display-template')
        .then(res => res.json())
        .then(data => {
          if (data.success && VALID_TEMPLATES.includes(data.template)) {
            setDisplayTemplate(data.template);
            localStorage.setItem(TEMPLATE_STORAGE_KEY, data.template);
          } else {
            const localTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
            if (VALID_TEMPLATES.includes(localTemplate)) setDisplayTemplate(localTemplate);
          }
        })
        .catch(err => {
          console.error('Template fetch error:', err);
          const localTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
          if (VALID_TEMPLATES.includes(localTemplate)) setDisplayTemplate(localTemplate);
        });
    };
    fetchDisplay();
    fetchMarquee();
    fetchTemplate();
    const interval = setInterval(fetchDisplay, 3000);
    const marqueeInterval = setInterval(fetchMarquee, 10000);
    const templateInterval = setInterval(fetchTemplate, 10000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(interval); clearInterval(marqueeInterval); clearInterval(templateInterval); clearInterval(clock); };
  }, [hasInteracted, announcedIds]);

  // Show enable audio prompt if not yet interacted
  if (!hasInteracted) {
    return (
      <div className="fixed inset-0 bg-blue-700 z-[100] flex items-center justify-center">
        <button
          onClick={() => setHasInteracted(true)}
          className="bg-white text-blue-700 px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-4"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Start Queue Display
        </button>
      </div>
    );
  }

  if (displayTemplate === 'template2') {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col bg-slate-950">
        <div className="bg-cyan-600 px-8 py-3 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-slate-900 tracking-wide">QUEUE BOARD</h1>
          <div className="text-slate-900 text-2xl font-mono font-bold">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-3 flex-1 overflow-hidden">
          <div className={`col-span-2 bg-slate-900 border-2 ${isAnnouncing ? 'animate-border-blink border-cyan-400' : 'border-slate-700'} rounded-2xl p-4 overflow-hidden`}>
            <div className="grid grid-cols-3 gap-3 h-full">
              {Array.from({ length: 6 }).map((_, idx) => {
                const ticket = serving[idx];
                return (
                  <div key={idx} className={`rounded-xl border border-slate-700 bg-slate-800 p-3 flex flex-col justify-between ${ticket ? cardAnimation : ''}`}>
                    {ticket ? (
                      <>
                        <div>
                          <p className="text-cyan-300 text-xs font-bold uppercase">Now Serving</p>
                          <p className="text-6xl text-white leading-none mt-2" style={{ fontFamily: "'Bebas Neue', cursive" }}>{ticket.ticket_number}</p>
                          <p className="text-slate-300 text-sm truncate mt-1">{ticket.customer_name}</p>
                        </div>
                        <div className="bg-cyan-600 text-slate-900 rounded-lg px-3 py-1.5 text-center font-black text-2xl">
                          {ticket.teller_window?.replace(/\D/g, '') || '-'}
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-sm">Waiting...</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-3 flex flex-col overflow-hidden">
            <h2 className="text-cyan-300 font-bold text-lg mb-3">WAITING LIST</h2>
            <div className="space-y-2 overflow-y-auto">
              {waiting.length === 0 ? (
                <p className="text-slate-500 text-sm">No waiting tickets</p>
              ) : (
                waiting.slice(0, 12).map((ticket) => (
                  <div key={ticket.id} className="bg-slate-800 rounded-lg px-3 py-2 flex items-center justify-between">
                    <span className="text-white font-semibold">{ticket.ticket_number}</span>
                    <span className="text-cyan-300 text-xs">{formatWaitTime(ticket.estimatedWait || avgServingTime)}</span>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 bg-black rounded-lg overflow-hidden">
              <video className="w-full aspect-video object-cover" autoPlay muted loop playsInline src="/assets/queue-video.mp4" />
            </div>
          </div>
        </div>

        {marqueeText && (
          <div className="h-[48px] bg-cyan-500 flex items-center overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-slate-900 text-lg font-bold mx-8">{marqueeText}</span>
              <span className="text-slate-900 text-lg font-bold mx-8">{marqueeText}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (displayTemplate === 'template3') {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col bg-amber-50">
        <div className="bg-gradient-to-r from-amber-700 to-orange-700 px-10 py-4 flex items-center justify-between">
          <div>
            <p className="text-amber-100 text-sm tracking-[0.3em]">SERVICE CENTER</p>
            <h1 className="text-5xl font-black text-white leading-none">LIVE CALLING</h1>
          </div>
          <div className="text-amber-100 text-3xl font-mono font-bold">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          <div className={`rounded-3xl bg-white border-4 ${isAnnouncing ? 'animate-border-blink border-orange-500' : 'border-amber-200'} shadow-xl p-6 flex flex-col items-center justify-center`}>
            <p className="text-amber-600 uppercase tracking-wider text-sm font-bold mb-2">Current Ticket</p>
            {serving.length === 0 ? (
              <p className="text-gray-400 text-xl">No ticket called</p>
            ) : (
              <>
                <p className="text-[180px] leading-none text-gray-900" style={{ fontFamily: "'Bebas Neue', cursive" }}>{serving[0].ticket_number}</p>
                <div className="mt-2 px-8 py-2 rounded-full bg-orange-600 text-white text-3xl font-black">
                  Window {serving[0].teller_window?.replace(/\D/g, '') || '-'}
                </div>
                <p className="mt-3 text-gray-600 text-lg">{serving[0].customer_name}</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="rounded-3xl bg-white border border-amber-200 shadow p-4 overflow-hidden">
              <h2 className="text-amber-700 font-bold text-lg mb-3">Now Serving Windows</h2>
              <div className="grid grid-cols-2 gap-2">
                {serving.slice(0, 4).map(ticket => (
                  <div key={ticket.id} className={`rounded-xl bg-amber-100 p-3 ${cardAnimation}`}>
                    <p className="text-gray-700 text-xs uppercase">Ticket</p>
                    <p className="text-4xl leading-none text-amber-800" style={{ fontFamily: "'Bebas Neue', cursive" }}>{ticket.ticket_number}</p>
                    <p className="text-xs text-gray-600 mt-1">Window {ticket.teller_window?.replace(/\D/g, '') || '-'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white border border-amber-200 shadow p-4 flex-1 overflow-hidden">
              <h2 className="text-amber-700 font-bold text-lg mb-2">Waiting Queue</h2>
              <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-full pr-1">
                {waiting.length === 0 ? (
                  <p className="text-gray-400 text-sm col-span-2">No waiting tickets</p>
                ) : (
                  waiting.slice(0, 14).map(ticket => (
                    <div key={ticket.id} className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 flex justify-between">
                      <span className="font-semibold text-gray-800">{ticket.ticket_number}</span>
                      <span className="text-xs text-amber-700">{formatWaitTime(ticket.estimatedWait || avgServingTime)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {marqueeText && (
          <div className="h-[48px] bg-orange-600 flex items-center overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-white text-lg font-semibold mx-8">{marqueeText}</span>
              <span className="text-white text-lg font-semibold mx-8">{marqueeText}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (displayTemplate === 'template4') {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-10 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-gray-500 uppercase">Queue Management</p>
            <h1 className="text-3xl font-semibold text-gray-900">Service Display</h1>
          </div>
          <div className="text-gray-700 text-2xl font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>
        <div className="grid grid-cols-12 gap-4 p-4 flex-1 overflow-hidden">
          <div className="col-span-8 bg-white border border-gray-200 rounded-2xl p-4 overflow-hidden">
            <h2 className="text-gray-700 font-medium mb-3">Now Serving</h2>
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)] overflow-y-auto">
              {serving.length === 0 ? (
                <p className="text-gray-400">No tickets being served</p>
              ) : (
                serving.slice(0, 8).map(ticket => (
                  <div key={ticket.id} className={`border border-gray-200 rounded-xl p-4 bg-gray-50 ${cardAnimation}`}>
                    <p className="text-xs uppercase text-gray-500">Ticket</p>
                    <p className="text-6xl leading-none text-gray-900 mt-1" style={{ fontFamily: "'Bebas Neue', cursive" }}>{ticket.ticket_number}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm text-gray-600 truncate">{ticket.customer_name}</span>
                      <span className="text-sm font-semibold text-gray-800">{ticket.teller_window || '-'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="col-span-4 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white border border-gray-200 rounded-2xl p-3">
              <h3 className="text-gray-700 font-medium mb-2">Video</h3>
              <video className="w-full aspect-video object-cover rounded-lg" autoPlay muted loop playsInline src="/assets/queue-video.mp4" />
            </div>
            <div className={`bg-white border-2 ${isAnnouncing ? 'animate-border-blink border-blue-400' : 'border-gray-200'} rounded-2xl p-4 flex-1 overflow-hidden`}>
              <h3 className="text-gray-700 font-medium mb-2">Waiting Queue</h3>
              <div className="space-y-2 overflow-y-auto max-h-full">
                {waiting.length === 0 ? <p className="text-gray-400 text-sm">No waiting tickets</p> : waiting.slice(0, 12).map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2">
                    <span className="font-medium text-gray-800">{ticket.ticket_number}</span>
                    <span className="text-xs text-gray-500">{formatWaitTime(ticket.estimatedWait || avgServingTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {marqueeText && <div className="h-[44px] bg-gray-900 text-white flex items-center overflow-hidden"><div className="animate-marquee whitespace-nowrap"><span className="mx-8">{marqueeText}</span><span className="mx-8">{marqueeText}</span></div></div>}
      </div>
    );
  }

  if (displayTemplate === 'template5') {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col bg-white">
        <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Now Serving</h1>
          <div className="text-gray-600 text-xl font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>
        <div className="flex-1 grid grid-cols-3 overflow-hidden">
          <div className="col-span-2 border-r border-gray-200 p-6 overflow-hidden">
            {serving.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400">No ticket called</div>
            ) : (
              <div className={`h-full border border-gray-200 rounded-2xl p-8 flex flex-col justify-center items-center ${isAnnouncing ? 'animate-border-blink border-green-400' : ''}`}>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Current Ticket</p>
                <p className="text-[180px] leading-none text-gray-900" style={{ fontFamily: "'Bebas Neue', cursive" }}>{serving[0].ticket_number}</p>
                <p className="text-3xl font-medium text-gray-700">Window {serving[0].teller_window?.replace(/\D/g, '') || '-'}</p>
                <p className="mt-2 text-gray-500">{serving[0].customer_name}</p>
              </div>
            )}
          </div>
          <div className="col-span-1 p-4 flex flex-col gap-4 overflow-hidden">
            <div className="border border-gray-200 rounded-xl p-2">
              <p className="text-gray-600 text-sm mb-2">Video Display</p>
              <video className="w-full aspect-video object-cover rounded-lg" autoPlay muted loop playsInline src="/assets/queue-video.mp4" />
            </div>
            <div className="border border-gray-200 rounded-xl p-3 flex-1 overflow-hidden">
              <p className="text-gray-600 text-sm mb-2">Queue List</p>
              <div className="space-y-1.5 overflow-y-auto max-h-full">
                {waiting.slice(0, 16).map(ticket => (
                  <div key={ticket.id} className="flex justify-between bg-gray-50 rounded px-2.5 py-2">
                    <span className="text-gray-800">{ticket.ticket_number}</span>
                    <span className="text-xs text-gray-500">{formatWaitTime(ticket.estimatedWait || avgServingTime)}</span>
                  </div>
                ))}
                {waiting.length === 0 && <p className="text-gray-400 text-sm">No waiting tickets</p>}
              </div>
            </div>
          </div>
        </div>
        {marqueeText && <div className="h-[42px] bg-gray-100 text-gray-700 flex items-center overflow-hidden border-t border-gray-200"><div className="animate-marquee whitespace-nowrap"><span className="mx-8">{marqueeText}</span><span className="mx-8">{marqueeText}</span></div></div>}
      </div>
    );
  }

  if (displayTemplate === 'template6') {
    return (
      <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col bg-[#F8FAFC]">
        <div className="bg-[#0F172A] px-8 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Queue Information Panel</h1>
          <div className="text-slate-200 text-xl font-mono">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </div>
        <div className="p-4 grid grid-cols-12 gap-4 flex-1 overflow-hidden">
          <div className="col-span-5 bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
            <p className="text-sm text-slate-500 mb-2">Main Call</p>
            {serving[0] ? (
              <div className={`h-full flex flex-col justify-center items-center ${cardAnimation}`}>
                <p className="text-[160px] text-slate-900 leading-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>{serving[0].ticket_number}</p>
                <p className="text-2xl font-semibold text-slate-700">Window {serving[0].teller_window?.replace(/\D/g, '') || '-'}</p>
              </div>
            ) : <div className="h-full flex items-center justify-center text-slate-400">No active ticket</div>}
          </div>
          <div className="col-span-4 bg-white rounded-xl border border-slate-200 p-4 overflow-hidden">
            <p className="text-sm text-slate-500 mb-2">Active Windows</p>
            <div className="space-y-2 overflow-y-auto max-h-full">
              {serving.slice(0, 10).map(ticket => (
                <div key={ticket.id} className={`rounded-lg border ${isAnnouncing ? 'border-blue-300' : 'border-slate-200'} px-3 py-2 flex items-center justify-between`}>
                  <span className="text-slate-800 font-medium">{ticket.ticket_number}</span>
                  <span className="text-slate-500 text-sm">{ticket.teller_window || '-'}</span>
                </div>
              ))}
              {serving.length === 0 && <p className="text-slate-400 text-sm">No active windows</p>}
            </div>
          </div>
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
            <div className="bg-white rounded-xl border border-slate-200 p-3">
              <p className="text-sm text-slate-500 mb-2">Video</p>
              <video className="w-full aspect-video object-cover rounded-lg" autoPlay muted loop playsInline src="/assets/queue-video.mp4" />
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-3 flex-1 overflow-hidden">
              <p className="text-sm text-slate-500 mb-2">Waiting</p>
              <div className="space-y-1.5 overflow-y-auto max-h-full">
                {waiting.slice(0, 12).map(ticket => (
                  <div key={ticket.id} className="rounded-md bg-slate-50 px-2.5 py-1.5 flex justify-between">
                    <span className="text-slate-700">{ticket.ticket_number}</span>
                    <span className="text-xs text-slate-500">{formatWaitTime(ticket.estimatedWait || avgServingTime)}</span>
                  </div>
                ))}
                {waiting.length === 0 && <p className="text-slate-400 text-sm">No waiting tickets</p>}
              </div>
            </div>
          </div>
        </div>
        {marqueeText && <div className="h-[44px] bg-[#0F172A] text-slate-100 flex items-center overflow-hidden"><div className="animate-marquee whitespace-nowrap"><span className="mx-8">{marqueeText}</span><span className="mx-8">{marqueeText}</span></div></div>}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden flex flex-col bg-white">
      <div className="bg-[#2F6690] px-8 py-2 flex items-center justify-center relative">
        <h1 className="text-6xl font-light tracking-widest text-white">NOW SERVING</h1>
        <div className="absolute right-8 text-2xl font-mono font-bold text-white">
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%] overflow-y-auto p-3 bg-gradient-to-b from-[#E2E8F0] to-[#CBD5E1]">
          {serving.length === 0 ? (
            <p className="text-blue-300 text-lg text-center py-10">No tickets being served</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {serving.map(ticket => (
                <div key={ticket.id} className={`bg-white rounded-xl shadow-lg flex items-stretch overflow-hidden relative ${cardAnimation}`}>
                  <div className="flex-1 px-4 py-4 pr-12 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Ticket No.</p>
                      {ticket.is_priority && <span className="text-[9px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">{ticket.priority_type || 'Priority'}</span>}
                    </div>
                    <p className="text-7xl text-gray-900 leading-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>{ticket.ticket_number}</p>
                    <p className="text-base font-semibold text-gray-500 mt-1">{ticket.customer_name}</p>
                  </div>
                  <div className="bg-[#2F6690] flex flex-col items-center justify-center px-8 relative" style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)' }}>
                    <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest ml-3">Window</p>
                    <p className="text-6xl text-white leading-none ml-3" style={{ fontFamily: "'Bebas Neue', cursive" }}>{ticket.teller_window?.replace(/\D/g, '') || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-[40%] border-l border-blue-200 flex flex-col overflow-hidden">
          <div className="bg-black">
            <div className="w-full aspect-video">
              <video className="w-full h-full object-cover" autoPlay muted loop playsInline src="/assets/queue-video.mp4" />
            </div>
          </div>

          <div className={`flex-1 bg-gradient-to-b from-[#E2E8F0] to-[#CBD5E1] flex flex-row items-center justify-center p-0 gap-8 ${isAnnouncing ? 'animate-border-blink border-[#3A7CA5]' : 'border-transparent border-4'}`}>
            {serving.length === 0 ? (
              <p className="text-blue-300 text-2xl">No ticket called</p>
            ) : (
              <>
                <div className="flex flex-col items-center">
                  <p className="text-[120px] text-gray-900 leading-none" style={{ fontFamily: "'Bebas Neue', cursive" }}>{serving[0].ticket_number}</p>
                  {serving[0].is_priority && <span className="mt-2 text-sm font-bold bg-orange-500 text-white px-4 py-1 rounded-full uppercase">{serving[0].priority_type || 'Priority'}</span>}
                </div>
                <div className="bg-[#3A7CA5] rounded-xl px-8 py-3 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Window</span>
                  <span className="text-5xl text-white" style={{ fontFamily: "'Bebas Neue', cursive" }}>{serving[0].teller_window?.replace(/\D/g, '') || '-'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {marqueeText && (
        <div className="h-[48px] bg-[#81C3D7] flex items-center overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="text-black text-lg font-medium mx-8">{marqueeText}</span>
            <span className="text-black text-lg font-medium mx-8">{marqueeText}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Queue Teller Page
function QueueTellerPage({ setCurrentPage }) {
  const [tellers, setTellers] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState('');
  const [tellerName, setTellerName] = useState('');
  const [currentTicket, setCurrentTicket] = useState(null);
  const [skippedTickets, setSkippedTickets] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [waitingCount, setWaitingCount] = useState(0);
  const [waitingTickets, setWaitingTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [assignedTypes, setAssignedTypes] = useState([]);
  const [avgServingTime, setAvgServingTime] = useState(0);
  const [, setTick] = useState(0);

  // Tick every second to update live timers
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/api/queue/tellers')
      .then(res => res.json())
      .then(data => { if (data.success) setTellers(data.tellers); })
      .catch(err => console.error('Error fetching tellers:', err));
  }, []);

  const fetchCurrentTicket = async () => {
    if (!selectedWindow) return;
    try {
      const res = await fetch(`http://localhost:5000/api/queue/teller/${encodeURIComponent(selectedWindow)}/current`);
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(data.current);
        setSkippedTickets(data.skipped);
        setCompletedCount(data.completedCount);
        setWaitingCount(data.waitingCount);
        setWaitingTickets(data.waitingTickets || []);
        setAssignedTypes(data.assignedTypes || []);
        setAvgServingTime(data.avgServingTime || 0);
      }
    } catch (err) {
      console.error('Error fetching current ticket:', err);
    }
  };

  useEffect(() => {
    if (selectedWindow) {
      fetchCurrentTicket();
      const interval = setInterval(fetchCurrentTicket, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedWindow]);

  const callNext = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/queue/teller/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowName: selectedWindow, tellerName })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(data.ticket);
        fetchCurrentTicket();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error calling next:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const completeTicket = async () => {
    if (!currentTicket) return;
    try {
      await fetch(`http://localhost:5000/api/queue/tickets/${currentTicket.id}/complete`, { method: 'PATCH' });
      setCurrentTicket(null);
      fetchCurrentTicket();
    } catch (err) {
      console.error('Error completing ticket:', err);
    }
  };

  const skipTicket = async () => {
    if (!currentTicket) return;
    try {
      await fetch(`http://localhost:5000/api/queue/tickets/${currentTicket.id}/skip`, { method: 'PATCH' });
      setCurrentTicket(null);
      fetchCurrentTicket();
    } catch (err) {
      console.error('Error skipping ticket:', err);
    }
  };

  const recallTicket = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/queue/tickets/${id}/recall`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windowName: selectedWindow, tellerName })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(data.ticket);
        fetchCurrentTicket();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error recalling ticket:', err);
    }
  };

  const transferTicket = async (targetWindow) => {
    if (!currentTicket) return;
    try {
      const res = await fetch(`http://localhost:5000/api/queue/tickets/${currentTicket.id}/transfer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetWindow })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTicket(null);
        setShowTransferModal(false);
        fetchCurrentTicket();
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error transferring ticket:', err);
    }
  };

  // Window selection
  if (!selectedWindow) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 mt-[40px]">
        <div className="bg-white border border-blue-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Teller Station</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your name and select your window to start serving.</p>
          <div className="mb-4">
            <label className="block text-gray-500 text-xs mb-1 text-left">Teller Name</label>
            <input
              type="text"
              value={tellerName}
              onChange={(e) => setTellerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-blue-50 border border-blue-200 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>
          <div className="space-y-3">
            {tellers.map(teller => (
              <button
                key={teller.id}
                onClick={() => setSelectedWindow(teller.window_name)}
                disabled={!tellerName.trim()}
                className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] border border-[#2D72C0] text-white py-4 rounded-xl font-semibold text-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:opacity-100"
              >
                {teller.window_name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage('home')}
            className="mt-6 text-gray-400 hover:text-blue-700 text-sm transition-all"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Teller dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Teller Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{selectedWindow}</h2>
          <p className="text-gray-500 text-sm">Teller: {tellerName}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {assignedTypes.length > 0
              ? assignedTypes.map(type => (
                <span key={type} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">{type}</span>
              ))
              : <span className="text-xs text-gray-400 italic">Serving all types</span>
            }
          </div>
        </div>
        <button
          onClick={() => { setSelectedWindow(''); setCurrentTicket(null); }}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-all text-sm flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
          Change Window
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side — Teller Controls */}
        <div className="flex-1 min-w-0">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 md:gap-4 mb-6 -mt-[30px]">
            <div className="flex flex-col items-center gap-1 py-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
              <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Served</p>
            </div>
            <div className="flex flex-col items-center gap-1 py-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Waiting</p>
            </div>
            <div className="flex flex-col items-center gap-1 py-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
              <p className="text-2xl font-bold text-gray-900">{skippedTickets.length}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Skipped</p>
            </div>
            <div className="flex flex-col items-center gap-1 py-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <p className="text-2xl font-bold text-gray-900">{avgServingTime < 60 ? `${avgServingTime}s` : `${Math.floor(avgServingTime / 60)}m`}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Time</p>
            </div>
          </div>

          {/* Current Ticket */}
          {currentTicket ? (
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden mb-6 -mt-[20px]">
              <div className="bg-[#274690] px-4 py-2.5">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Now Serving</p>
              </div>
              <div className="p-5 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                  <div className="flex items-center gap-4 md:flex-1">
                    <span className="text-4xl md:text-6xl font-black text-[#274690] leading-none">{currentTicket.ticket_number}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-lg md:text-xl font-semibold truncate">{currentTicket.customer_name}</p>
                      <p className="text-gray-400 text-sm">{currentTicket.transaction_type} &bull; {currentTicket.cellphone_number}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 md:flex md:gap-3 md:justify-center">
                  <button
                    onClick={completeTicket}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 md:px-8 py-3 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    Complete
                  </button>
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white px-4 md:px-8 py-3 rounded-full font-bold text-sm transition-all text-center"
                  >
                    Transfer
                  </button>
                  <button
                    onClick={skipTicket}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 md:px-8 py-3 rounded-full font-bold text-sm transition-all text-center"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden mb-6 -mt-[20px]">
              <div className="bg-[#274690] px-4 py-2.5">
                <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Now Serving</p>
              </div>
              <div className="p-5 md:p-8 text-center">
                <p className="text-gray-400 text-base mb-4">No ticket being served</p>
                <button
                  onClick={callNext}
                  disabled={isLoading || waitingCount === 0}
                  className="bg-[#274690] text-white px-10 py-3.5 rounded-full font-bold text-base hover:bg-[#1e3570] transition-all disabled:opacity-30 w-full md:w-auto"
                >
                  {isLoading ? 'Calling...' : 'Call Next'}
                </button>
                {waitingCount === 0 && <p className="text-gray-400 text-sm mt-3">No tickets in the waiting queue</p>}
              </div>
            </div>
          )}

          {/* Skipped Tickets */}
          {skippedTickets.length > 0 && (
            <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-[#274690] px-4 py-3 flex items-center justify-between">
                <h3 className="text-white font-bold text-base">Skipped Tickets</h3>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{skippedTickets.length}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {/* Column header */}
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <span className="w-6 text-center">#</span>
                  <span className="w-16">Ticket</span>
                  <span className="flex-1">Name</span>
                  <span className="text-right mr-16">Type</span>
                </div>
                <div className="divide-y divide-gray-100 max-h-[40vh] overflow-y-auto">
                  {skippedTickets.map((ticket, index) => (
                    <div key={ticket.id} className={`flex items-center gap-3 px-4 py-2.5 ${index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <span className="w-6 text-center text-xs font-bold bg-red-100 text-red-500 rounded-full leading-5">{index + 1}</span>
                      <span className="w-16 text-sm font-bold text-gray-900">{ticket.ticket_number}</span>
                      <span className="text-sm text-gray-700 truncate flex-1">{ticket.customer_name}</span>
                      <span className="text-xs text-gray-400">{ticket.transaction_type}</span>
                      <button
                        onClick={() => recallTicket(ticket.id)}
                        disabled={!!currentTicket}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1 rounded text-xs font-medium border border-amber-200 transition-all disabled:opacity-30 flex-shrink-0"
                      >
                        Recall
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side — Waiting Queue Grid */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0 -mt-[20px]">
          <div className="bg-white border border-gray-200 shadow-sm overflow-hidden lg:sticky lg:top-6">
            <div className="bg-[#274690] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Waiting Queue</h3>
              <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{waitingTickets.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {/* Column header */}
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <span className="w-6 text-center">#</span>
                <span className="w-16">Ticket</span>
                <span className="flex-1">Name</span>
                <span className="text-right">Type</span>
              </div>
              {waitingTickets.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                  {waitingTickets.map((ticket, index) => (
                    <div key={ticket.id} className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${index === 0 ? 'bg-amber-50 border-l-3 border-l-amber-400' : index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                      <span className={`w-6 text-center text-xs font-bold rounded-full leading-5 ${index === 0 ? 'bg-amber-400 text-white' : 'bg-gray-200 text-gray-500'}`}>{index + 1}</span>
                      <span className="w-16 text-sm font-bold text-gray-900">{ticket.ticket_number}</span>
                      <span className="text-sm text-gray-700 truncate flex-1">{ticket.customer_name}</span>
                      <span className="text-xs text-gray-400">{ticket.transaction_type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">No tickets waiting</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && currentTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-blue-200 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-gray-800 font-bold text-lg mb-2">Transfer Ticket</h3>
            <p className="text-gray-500 text-sm mb-1">
              Transferring <span className="text-[#576CA8] font-bold">{currentTicket.ticket_number}</span> — {currentTicket.customer_name}
            </p>
            <p className="text-gray-400 text-xs mb-5">Select the destination window:</p>
            <div className="space-y-2">
              {tellers
                .filter(t => t.window_name !== selectedWindow)
                .map(teller => (
                  <button
                    key={teller.id}
                    onClick={() => transferTicket(teller.window_name)}
                    className="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 text-blue-700 py-3 rounded-xl font-semibold transition-all"
                  >
                    {teller.window_name}
                  </button>
                ))}
            </div>
            <button
              onClick={() => setShowTransferModal(false)}
              className="w-full mt-4 bg-blue-50 hover:bg-blue-100 text-gray-500 py-2.5 rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}



// ─── Guest Self Check-In Kiosk Page ──────────────────────────────────────────
function GuestCheckinPage({ setCurrentPage }) {
  const [ckStep, setCkStep] = React.useState(1);
  const [ckMethod, setCkMethod] = React.useState('id');
  const [ckConfId, setCkConfId] = React.useState('');
  const [ckEmail, setCkEmail] = React.useState('');
  const [ckLastName, setCkLastName] = React.useState('');
  const [ckLoading, setCkLoading] = React.useState(false);
  const [ckError, setCkError] = React.useState('');
  const [ckReservation, setCkReservation] = React.useState(null);
  const [ckArriving, setCkArriving] = React.useState(false);

  const inputCls = "w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/10 focus:border-white/40 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all text-white placeholder-white/40 text-sm";
  const labelCls = "block text-xs font-semibold text-white/60 uppercase tracking-wide mb-1.5";

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : '—';
  const nightsCount = (r) => r ? Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000) : 0;
  const firstName = (name) => name ? name.trim().split(' ')[0] : 'Guest';

  const handleLookup = async () => {
    setCkError('');
    setCkLoading(true);
    try {
      const body = ckMethod === 'id' ? { confirmationId: ckConfId } : { email: ckEmail, lastName: ckLastName };
      const res = await fetch('http://localhost:5000/api/checkin/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        setCkError(err.error || 'Reservation not found. Please check your details and try again.');
        setCkLoading(false);
        return;
      }
      setCkReservation(await res.json());
      setCkStep(2);
    } catch (e) {
      setCkError('Something went wrong. Please try again.');
    }
    setCkLoading(false);
  };

  const handleArrive = async () => {
    if (!ckReservation) return;
    setCkArriving(true);
    try {
      const res = await fetch('http://localhost:5000/api/checkin/arrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ckReservation.id }),
      });
      if (res.ok) { setCkStep(3); }
      else { setCkError('Could not complete check-in. Please see front desk staff.'); }
    } catch (e) {
      setCkError('Something went wrong. Please see front desk staff.');
    }
    setCkArriving(false);
  };

  const SectionDivider = ({ title, icon }) => (
    <div className="flex items-center gap-3 my-5">
      <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
        {icon}
        <span className="text-xs font-bold text-white/70 uppercase tracking-widest">{title}</span>
      </div>
      <div className="flex-1 h-px bg-white/15" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* ── Step 1 — Lookup ── */}
        {ckStep === 1 && (
          <>
            {/* Glass card */}
            <div className="rounded-2xl border border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

              {/* Header — matches booking form header exactly */}
              <div className="px-6 py-5" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-tight">Guest Check-In</h3>
                    <p className="text-white/70 text-xs mt-0.5">Find your reservation to begin check-in</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <span className="text-white text-xs font-semibold tracking-wide">Check-In Open</span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Method toggle */}
                <div className="flex bg-white/10 rounded-xl p-1 mb-5 gap-1">
                  {[
                    { id: 'id', label: 'Confirmation #' },
                    { id: 'email', label: 'Email & Name' },
                  ].map((m) => (
                    <button key={m.id} onClick={() => { setCkMethod(m.id); setCkError(''); }}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${ckMethod === m.id ? 'bg-white/20 text-white shadow' : 'text-white/50 hover:text-white/80'}`}>
                      {m.label}
                    </button>
                  ))}
                </div>

                {ckMethod === 'id' ? (
                  <div>
                    <label className={labelCls}>Confirmation Number</label>
                    <input
                      type="number"
                      value={ckConfId}
                      onChange={(e) => setCkConfId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && ckConfId && handleLookup()}
                      placeholder="e.g. 1042"
                      className={inputCls + " text-xl font-mono font-bold"}
                      autoFocus
                    />
                    <p className="text-white/30 text-xs mt-2">Your confirmation number was sent in your booking email or SMS.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input type="email" value={ckEmail} onChange={(e) => setCkEmail(e.target.value)}
                        placeholder="you@example.com" className={inputCls} autoFocus />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name</label>
                      <input type="text" value={ckLastName} onChange={(e) => setCkLastName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && ckEmail && ckLastName && handleLookup()}
                        placeholder="Your last name" className={inputCls} />
                    </div>
                  </div>
                )}

                {ckError && (
                  <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm">
                    {ckError}
                  </div>
                )}

                <button
                  onClick={handleLookup}
                  disabled={ckLoading || (ckMethod === 'id' ? !ckConfId : !ckEmail || !ckLastName)}
                  className="w-full mt-5 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  {ckLoading ? 'Searching...' : 'Find My Reservation →'}
                </button>
              </div>
            </div>

            <div className="text-center mt-5">
              <button onClick={() => setCurrentPage('home')} className="text-white/40 hover:text-white/70 text-sm transition-colors">
                ← Back to Home
              </button>
            </div>
          </>
        )}

        {/* ── Step 2 — Confirm ── */}
        {ckStep === 2 && ckReservation && (
          <>
            <div className="rounded-2xl border border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

              {/* Header */}
              <div className="px-6 py-5" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg tracking-tight">Confirm Your Stay</h3>
                    <p className="text-white/70 text-xs mt-0.5">Please verify your reservation details</p>
                  </div>
                  <span className="text-white/50 text-xs bg-white/10 px-3 py-1.5 rounded-full font-mono">#{ckReservation.id}</span>
                </div>
              </div>

              <div className="p-6">
                <SectionDivider title="Guest" icon={<span className="text-sm">👤</span>} />
                <div className="bg-white/10 rounded-xl border border-white/10 p-4 space-y-2 mb-2">
                  <div className="flex justify-between text-sm"><span className="text-white/50">Name</span><span className="font-semibold text-white">{ckReservation.full_name}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/50">Email</span><span className="text-white/80">{ckReservation.email}</span></div>
                </div>

                <SectionDivider title="Reservation" icon={<span className="text-sm">🏨</span>} />
                <div className="bg-white/10 rounded-xl border border-white/10 p-4 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-white/50">Room Type</span><span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded text-xs">{ckReservation.room_type}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/50">Check-In</span><span className="text-white/80">{fmtDate(ckReservation.check_in_date)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/50">Check-Out</span><span className="text-white/80">{fmtDate(ckReservation.check_out_date)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/50">Duration</span><span className="text-white/80">{nightsCount(ckReservation)} night{nightsCount(ckReservation) !== 1 ? 's' : ''}</span></div>
                  {ckReservation.number_of_guests && (
                    <div className="flex justify-between text-sm"><span className="text-white/50">Guests</span><span className="text-white/80">{ckReservation.number_of_guests}</span></div>
                  )}
                </div>

                {ckReservation.special_requests && (
                  <div className="mt-4 bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-3">
                    <div className="text-xs font-bold text-amber-300/80 uppercase tracking-widest mb-1">Special Requests</div>
                    <p className="text-amber-100/80 text-sm italic">"{ckReservation.special_requests}"</p>
                  </div>
                )}

                {ckError && (
                  <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm">{ckError}</div>
                )}

                <button onClick={handleArrive} disabled={ckArriving}
                  className="w-full mt-5 bg-green-600 hover:bg-green-700 disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  {ckArriving ? 'Checking you in...' : "Yes, I'm here — Check Me In ✓"}
                </button>
                <button onClick={() => { setCkStep(1); setCkReservation(null); setCkError(''); }}
                  className="w-full mt-2 bg-white/10 hover:bg-white/15 text-white/60 font-semibold py-2.5 rounded-xl transition-colors text-sm">
                  Not my reservation
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3 — Success ── */}
        {ckStep === 3 && ckReservation && (
          <div className="rounded-2xl border border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

            {/* Header */}
            <div className="px-6 py-5" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight">You&apos;re Checked In!</h3>
                  <p className="text-white/70 text-xs mt-0.5">Please proceed to the front desk for your key</p>
                </div>
                <div className="flex items-center gap-2 bg-green-500/30 border border-green-400/40 px-3 py-1.5 rounded-full">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                  </span>
                  <span className="text-green-300 text-xs font-semibold tracking-wide">Arrived</span>
                </div>
              </div>
            </div>

            <div className="p-6 text-center">
              {/* Checkmark */}
              <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-400/50 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-2xl font-black text-white mb-1">Welcome, {firstName(ckReservation.full_name)}!</h2>
              <p className="text-white/50 text-sm mb-6">You are now in our system.</p>

              {/* Key instructions */}
              <div className="bg-white/10 border border-white/15 rounded-xl px-5 py-4 mb-5 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔑</span>
                  <span className="text-white font-semibold text-sm">Please head to the front desk</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Our staff will verify your ID, assign your room, and hand you your key. Your stay is all set!
                </p>
              </div>

              {/* Summary */}
              <div className="bg-white/10 rounded-xl border border-white/10 p-4 space-y-2 text-left mb-5">
                <div className="flex justify-between text-sm"><span className="text-white/50">Confirmation #</span><span className="font-mono font-bold text-white">#{ckReservation.id}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Room Type</span><span className="text-white/80">{ckReservation.room_type}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Check-Out</span><span className="text-white/80">{fmtDate(ckReservation.check_out_date)}</span></div>
              </div>

              <button onClick={() => setCurrentPage('home')}
                className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                Return to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Guests Tab ───────────────────────────────────────────────────────────────
function GuestsTab() {
  const [guestSearch, setGuestSearch] = React.useState('');
  const [guestList, setGuestList] = React.useState([]);
  const [guestsLoading, setGuestsLoading] = React.useState(false);
  const [guestsError, setGuestsError] = React.useState('');
  const [expandedEmail, setExpandedEmail] = React.useState(null);
  const [historyCache, setHistoryCache] = React.useState({});
  const [historyLoading, setHistoryLoading] = React.useState(null);

  const fetchGuests = React.useCallback(async (q) => {
    setGuestsLoading(true);
    setGuestsError('');
    try {
      const params = q ? `?search=${encodeURIComponent(q)}` : '';
      const res = await fetch(`http://localhost:5000/api/admin/guests${params}`);
      const data = await res.json();
      if (data.success) {
        setGuestList(data.guests);
      } else {
        setGuestsError(data.message || 'Failed to load guests');
      }
    } catch (e) {
      setGuestsError('Cannot reach server — is it running?');
      console.error(e);
    } finally {
      setGuestsLoading(false);
    }
  }, []);

  const fetchGuestHistory = React.useCallback(async (email) => {
    if (historyCache[email]) return;
    setHistoryLoading(email);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/guests/history?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setHistoryCache(prev => ({ ...prev, [email]: data.history }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(null);
    }
  }, [historyCache]);

  const toggleGuest = React.useCallback((email) => {
    if (expandedEmail === email) {
      setExpandedEmail(null);
    } else {
      setExpandedEmail(email);
      fetchGuestHistory(email);
    }
  }, [expandedEmail, fetchGuestHistory]);

  // Load on mount
  React.useEffect(() => { fetchGuests(''); }, [fetchGuests]);

  // Debounced search
  React.useEffect(() => {
    const t = setTimeout(() => fetchGuests(guestSearch), 400);
    return () => clearTimeout(t);
  }, [guestSearch, fetchGuests]);

  const statusBadge = (status) => {
    const map = {
      confirmed: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      checked_in: 'bg-green-100 text-green-700',
      checked_out: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-600',
      no_show: 'bg-red-100 text-red-600',
      arrived: 'bg-purple-100 text-purple-700',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] || 'bg-gray-100 text-gray-500'}`}>
        {status ? status.replace('_', ' ') : '—'}
      </span>
    );
  };

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const nightsBetween = (cin, cout) => {
    if (!cin || !cout) return '—';
    const diff = Math.round((new Date(cout) - new Date(cin)) / 86400000);
    return diff > 0 ? `${diff} nt` : '—';
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">Guests</h2>
            {!guestsLoading && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {guestList.length} guests
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              value={guestSearch}
              onChange={e => setGuestSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="pl-8 pr-4 py-2 border border-blue-200 rounded-lg text-sm text-gray-700 bg-blue-50 focus:outline-none focus:border-blue-400 w-72"
            />
            <span className="absolute left-2.5 top-2.5 text-gray-400 text-sm">🔍</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid gap-2 px-4 py-2.5 bg-blue-50 border-b border-blue-200 text-xs font-semibold text-gray-500 uppercase tracking-wide" style={{ gridTemplateColumns: '1fr 1fr 1fr 80px 100px 110px' }}>
          <span>Guest Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span className="text-center">Stays</span>
          <span>Last Stay</span>
          <span>Fav Room</span>
        </div>

        {guestsLoading ? (
          <div className="py-12 text-center text-gray-400 text-sm">Loading guests...</div>
        ) : guestsError ? (
          <div className="py-12 text-center text-red-500 text-sm">{guestsError}</div>
        ) : guestList.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No guests found</div>
        ) : (
          <div className="divide-y divide-blue-50">
            {guestList.map(g => {
              const isExpanded = expandedEmail === g.email;
              const history = historyCache[g.email] || [];
              const isLoadingHistory = historyLoading === g.email;
              return (
                <div key={g.email}>
                  {/* Guest row */}
                  <button
                    onClick={() => toggleGuest(g.email)}
                    className={`w-full text-left text-sm hover:bg-blue-50 transition-colors ${isExpanded ? 'bg-blue-50' : ''}`}
                  >
                    <div className="grid gap-2 px-4 py-3 items-center" style={{ gridTemplateColumns: '1fr 1fr 1fr 80px 100px 110px' }}>
                      <span className="flex items-center gap-1.5 font-medium text-gray-800 truncate">
                        <span className="text-gray-400 text-xs">{isExpanded ? '▼' : '▶'}</span>
                        {g.full_name}
                      </span>
                      <span className="text-gray-500 truncate">{g.email}</span>
                      <span className="text-gray-500 truncate">{g.phone_number || '—'}</span>
                      <span className="text-center font-medium text-[#576CA8]">{g.total_bookings}</span>
                      <span className="text-gray-500">{fmtDate(g.last_stay)}</span>
                      <span className="text-gray-500 truncate">{g.fav_room || '—'}</span>
                    </div>
                  </button>

                  {/* Expanded history */}
                  {isExpanded && (
                    <div className="bg-blue-50/60 border-t border-blue-100 px-6 pb-4 pt-3">
                      {isLoadingHistory ? (
                        <p className="text-sm text-gray-400 py-2">Loading history...</p>
                      ) : history.length === 0 ? (
                        <p className="text-sm text-gray-400 py-2">No bookings found.</p>
                      ) : (
                        <>
                          {/* Guest profile summary */}
                          <div className="flex flex-wrap gap-4 mb-3 text-sm">
                            <span className="text-gray-600"><span className="font-medium text-gray-700">Email:</span> {g.email}</span>
                            <span className="text-gray-600"><span className="font-medium text-gray-700">Phone:</span> {g.phone_number || '—'}</span>
                            <span className="text-gray-600"><span className="font-medium text-gray-700">First booking:</span> {fmtDate(g.first_booking)}</span>
                            <span className="text-gray-600"><span className="font-medium text-gray-700">Total stays:</span> {g.total_bookings}</span>
                          </div>
                          {/* Booking history table */}
                          <div className="rounded-lg border border-blue-200 overflow-hidden">
                            <div className="grid gap-2 px-3 py-2 bg-white border-b border-blue-100 text-xs font-semibold text-gray-400 uppercase tracking-wide" style={{ gridTemplateColumns: '60px 1fr 80px 100px 100px 60px 100px' }}>
                              <span>Ref #</span>
                              <span>Room Type</span>
                              <span>Room #</span>
                              <span>Check-in</span>
                              <span>Check-out</span>
                              <span>Nights</span>
                              <span>Status</span>
                            </div>
                            {history.map(bk => (
                              <div key={bk.id} className="grid gap-2 px-3 py-2.5 bg-white border-b border-blue-50 last:border-0 text-sm items-center hover:bg-blue-50/50 transition-colors" style={{ gridTemplateColumns: '60px 1fr 80px 100px 100px 60px 100px' }}>
                                <span className="text-gray-400 font-mono text-xs">#{bk.id}</span>
                                <span className="text-gray-700 font-medium truncate">{bk.room_type}</span>
                                <span className="text-gray-500">{bk.room_number || '—'}</span>
                                <span className="text-gray-600">{fmtDate(bk.check_in_date)}</span>
                                <span className="text-gray-600">{fmtDate(bk.check_out_date)}</span>
                                <span className="text-gray-500 text-xs">{nightsBetween(bk.check_in_date, bk.check_out_date)}</span>
                                {statusBadge(bk.status)}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Front Desk Tab ───────────────────────────────────────────────────────────
function FrontDeskTab() {
  const today = new Date().toISOString().split('T')[0];
  const [fdView, setFdView] = React.useState('arrivals');

  // Arrivals state
  const [arrivalDate, setArrivalDate] = React.useState(today);
  const [arrivals, setArrivals] = React.useState([]);
  const [arrivalStats, setArrivalStats] = React.useState({ total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
  const [arrivalsLoading, setArrivalsLoading] = React.useState(false);
  const [selectedArrival, setSelectedArrival] = React.useState(null);
  const [guestNotes, setGuestNotes] = React.useState({});

  // In-House state
  const [inHouseGuests, setInHouseGuests] = React.useState([]);
  const [inHouseLoading, setInHouseLoading] = React.useState(false);

  // Search state
  const [searchQ, setSearchQ] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchLoading, setSearchLoading] = React.useState(false);

  // Wizard state
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardReservation, setWizardReservation] = React.useState(null);
  const [wizardStep, setWizardStep] = React.useState(1);
  const [wizardIdVerified, setWizardIdVerified] = React.useState(false);
  const [wizardRoomNumber, setWizardRoomNumber] = React.useState('');
  const [wizardPayment, setWizardPayment] = React.useState(false);
  const [wizardNotes, setWizardNotes] = React.useState('');
  const [wizardSubmitting, setWizardSubmitting] = React.useState(false);
  const [wizardSuccess, setWizardSuccess] = React.useState(false);
  const [wizardError, setWizardError] = React.useState('');

  // Checkout confirm state
  const [checkoutConfirmId, setCheckoutConfirmId] = React.useState(null);
  const [checkoutSubmitting, setCheckoutSubmitting] = React.useState(false);

  // Transfer / upgrade state
  const [transferGuest, setTransferGuest] = React.useState(null);
  const [transferRoomType, setTransferRoomType] = React.useState('');
  const [transferRoomNumber, setTransferRoomNumber] = React.useState('');
  const [transferSubmitting, setTransferSubmitting] = React.useState(false);
  const [transferError, setTransferError] = React.useState('');
  const [transferSuccess, setTransferSuccess] = React.useState('');

  // Status update state
  const [statusUpdating, setStatusUpdating] = React.useState(null);

  // ── Folio state ──────────────────────────────────────────────────────────────
  const [folioOpen, setFolioOpen] = React.useState(false);
  const [folioRes, setFolioRes] = React.useState(null);
  const [folioItems, setFolioItems] = React.useState([]);
  const [folioPayments, setFolioPayments] = React.useState([]);
  const [folioTotals, setFolioTotals] = React.useState({ charges: 0, payments: 0, balance: 0 });
  const [folioLoading, setFolioLoading] = React.useState(false);
  const [folioError, setFolioError] = React.useState('');
  // Add charge form
  const [fcType, setFcType] = React.useState('Room Charge');
  const [fcDesc, setFcDesc] = React.useState('');
  const [fcQty, setFcQty] = React.useState(1);
  const [fcPrice, setFcPrice] = React.useState('');
  const [fcSaving, setFcSaving] = React.useState(false);
  const [fcError, setFcError] = React.useState('');
  // Add payment form
  const [fpMethod, setFpMethod] = React.useState('Cash');
  const [fpAmount, setFpAmount] = React.useState('');
  const [fpRef, setFpRef] = React.useState('');
  const [fpSaving, setFpSaving] = React.useState(false);
  const [fpError, setFpError] = React.useState('');
  // Checkout folio balance
  const [checkoutFolioBalance, setCheckoutFolioBalance] = React.useState(null);
  // Folio email
  const [folioEmailSending, setFolioEmailSending] = React.useState(false);
  const [folioEmailMsg, setFolioEmailMsg] = React.useState('');

  // Guest Profile modal state
  const [gpOpen, setGpOpen] = React.useState(false);
  const [gpRes, setGpRes] = React.useState(null);
  const [gpForm, setGpForm] = React.useState({});
  const [gpSaving, setGpSaving] = React.useState(false);
  const [gpError, setGpError] = React.useState('');
  const [gpSaved, setGpSaved] = React.useState(false);

  // Walk-In state
  const [wkRoomTypes, setWkRoomTypes] = React.useState([]);
  const [wkRateCodes, setWkRateCodes] = React.useState([]);
  const [wkRateCode, setWkRateCode] = React.useState('');
  const [wkLastName, setWkLastName] = React.useState('');
  const [wkFirstName, setWkFirstName] = React.useState('');
  const [wkEmail, setWkEmail] = React.useState('');
  const [wkPhone, setWkPhone] = React.useState('');
  const [wkRoomType, setWkRoomType] = React.useState('');
  const [wkCheckIn, setWkCheckIn] = React.useState(today);
  const [wkCheckOut, setWkCheckOut] = React.useState('');
  const [wkGuests, setWkGuests] = React.useState(1);
  const [wkRoomNumber, setWkRoomNumber] = React.useState('');
  const [wkSpecialReq, setWkSpecialReq] = React.useState('');
  const [wkPayment, setWkPayment] = React.useState(false);
  const [wkNotes, setWkNotes] = React.useState('');
  const [wkTitle, setWkTitle] = React.useState('Mr.');
  const [wkMiddleName, setWkMiddleName] = React.useState('');
  const [wkGender, setWkGender] = React.useState('');
  const [wkBirthDate, setWkBirthDate] = React.useState('');
  const [wkNationality, setWkNationality] = React.useState('');
  const [wkCountry, setWkCountry] = React.useState('');
  const [wkAddress, setWkAddress] = React.useState('');
  const [wkCity, setWkCity] = React.useState('');
  const [wkIdType, setWkIdType] = React.useState('');
  const [wkIdNumber, setWkIdNumber] = React.useState('');
  const [wkPurpose, setWkPurpose] = React.useState('');
  const [wkEta, setWkEta] = React.useState('');
  const [wkPaymentMethod, setWkPaymentMethod] = React.useState('Cash');
  const [wkDepositAmount, setWkDepositAmount] = React.useState('');
  const [wkSubmitting, setWkSubmitting] = React.useState(false);
  const [wkSuccess, setWkSuccess] = React.useState(false);
  const [wkResult, setWkResult] = React.useState(null);
  const [wkError, setWkError] = React.useState('');

  // ── Rooms state ─────────────────────────────────────────────────────────────
  const [rooms, setRooms] = React.useState([]);
  const [roomsLoading, setRoomsLoading] = React.useState(false);
  const [roomFilter, setRoomFilter] = React.useState('all');
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [hkUpdating, setHkUpdating] = React.useState(null);

  // ── Tape Chart state ─────────────────────────────────────────────────────────
  const [tcFrom, setTcFrom] = React.useState(today);
  const [tcRooms, setTcRooms] = React.useState([]);
  const [tcReservations, setTcReservations] = React.useState([]);
  const [tcLoading, setTcLoading] = React.useState(false);
  const [tcSelectedRes, setTcSelectedRes] = React.useState(null);
  const [tcTypeView, setTcTypeView] = React.useState(false);
  const [addRoomOpen, setAddRoomOpen] = React.useState(false);
  const [newRoomNumber, setNewRoomNumber] = React.useState('');
  const [newRoomType, setNewRoomType] = React.useState('');
  const [newRoomFloor, setNewRoomFloor] = React.useState(1);

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchArrivals = React.useCallback(async (date) => {
    setArrivalsLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/arrivals?date=${date}`);
      const data = await res.json();
      const fresh = data.arrivals || [];
      setArrivals(fresh);
      setArrivalStats(data.stats || { total: 0, checkedIn: 0, pending: 0, confirmed: 0, noShow: 0 });
      setSelectedArrival(prev => prev ? (fresh.find(r => r.id === prev.id) ?? null) : null);
    } catch (e) { console.error(e); }
    setArrivalsLoading(false);
  }, []);

  const fetchInHouse = React.useCallback(async () => {
    setInHouseLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/front-desk/in-house');
      const data = await res.json();
      setInHouseGuests(data.guests || []);
    } catch (e) { console.error(e); }
    setInHouseLoading(false);
  }, []);

  const runSearch = React.useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.reservations || []);
    } catch (e) { console.error(e); }
    setSearchLoading(false);
  }, []);

  React.useEffect(() => { fetchArrivals(arrivalDate); }, [arrivalDate, fetchArrivals]);
  React.useEffect(() => { if (fdView === 'inhouse') fetchInHouse(); }, [fdView, fetchInHouse]);

  React.useEffect(() => {
    const t = setTimeout(() => runSearch(searchQ), 350);
    return () => clearTimeout(t);
  }, [searchQ, runSearch]);

  // ── Wizard helpers ─────────────────────────────────────────────────────────
  const openWizard = (r) => {
    setWizardReservation(r);
    setWizardStep(1);
    setWizardIdVerified(false);
    setWizardRoomNumber('');
    setWizardPayment(false);
    setWizardNotes('');
    setWizardSubmitting(false);
    setWizardSuccess(false);
    setWizardError('');
    setWizardOpen(true);
    fetchRooms();
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setWizardReservation(null);
    setWizardSuccess(false);
    fetchArrivals(arrivalDate);
    fetchInHouse();
  };

  const submitCheckin = async () => {
    if (!wizardReservation) return;
    setWizardSubmitting(true);
    setWizardError('');
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${wizardReservation.id}/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: wizardRoomNumber,
          idVerified: wizardIdVerified,
          paymentCollected: wizardPayment,
          notes: wizardNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWizardSuccess(true);
      } else {
        setWizardError(data.message || `Check-in failed (${res.status}).`);
      }
    } catch (e) {
      setWizardError('Network error — is the server running?');
    }
    setWizardSubmitting(false);
  };

  const submitCheckout = async (id) => {
    setCheckoutSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${id}/checkout`, { method: 'POST' });
      if (res.ok) {
        setCheckoutConfirmId(null);
        fetchInHouse();
        fetchArrivals(arrivalDate);
      }
    } catch (e) { console.error(e); }
    setCheckoutSubmitting(false);
  };

  // ── Folio functions ───────────────────────────────────────────────────────────
  const fetchFolio = React.useCallback(async (reservationId) => {
    setFolioLoading(true);
    setFolioError('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${reservationId}`);
      const data = await res.json();
      if (data.success) {
        setFolioItems(data.items);
        setFolioPayments(data.payments);
        setFolioTotals(data.totals);
      } else {
        setFolioError(data.message || 'Failed to load folio');
      }
    } catch (e) { setFolioError('Server error'); }
    setFolioLoading(false);
  }, []);

  const openFolio = (r) => {
    setFolioRes(r);
    setFolioItems([]);
    setFolioPayments([]);
    setFolioTotals({ charges: 0, payments: 0, balance: 0 });
    setFolioError('');
    setFcType('Room Charge'); setFcDesc(''); setFcQty(1); setFcPrice(''); setFcError('');
    setFpMethod('Cash'); setFpAmount(''); setFpRef(''); setFpError('');
    setFolioEmailMsg('');
    setFolioOpen(true);
    fetchFolio(r.id);
  };

  const addCharge = async () => {
    if (!fcPrice || isNaN(parseFloat(fcPrice))) { setFcError('Enter a valid price'); return; }
    setFcSaving(true); setFcError('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${folioRes.id}/charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charge_type: fcType, description: fcDesc, quantity: fcQty, unit_price: fcPrice }),
      });
      const data = await res.json();
      if (data.success) { fetchFolio(folioRes.id); setFcDesc(''); setFcQty(1); setFcPrice(''); }
      else setFcError(data.message || 'Failed');
    } catch (e) { setFcError('Server error'); }
    setFcSaving(false);
  };

  const addPayment = async () => {
    if (!fpAmount || isNaN(parseFloat(fpAmount))) { setFpError('Enter a valid amount'); return; }
    setFpSaving(true); setFpError('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${folioRes.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: fpMethod, amount: fpAmount, reference: fpRef }),
      });
      const data = await res.json();
      if (data.success) { fetchFolio(folioRes.id); setFpAmount(''); setFpRef(''); }
      else setFpError(data.message || 'Failed');
    } catch (e) { setFpError('Server error'); }
    setFpSaving(false);
  };

  const voidCharge = async (itemId) => {
    await fetch(`http://localhost:5000/api/folio/charge/${itemId}/void`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ void_reason: '' }),
    });
    fetchFolio(folioRes.id);
  };

  const voidPayment = async (payId) => {
    await fetch(`http://localhost:5000/api/folio/payment/${payId}/void`, { method: 'PATCH' });
    fetchFolio(folioRes.id);
  };

  const fetchCheckoutBalance = React.useCallback(async (id) => {
    setCheckoutFolioBalance(null);
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${id}`);
      const data = await res.json();
      if (data.success) setCheckoutFolioBalance(data.totals.balance);
    } catch (e) { }
  }, []);

  const sendFolioEmail = async () => {
    if (!folioRes) return;
    setFolioEmailSending(true);
    setFolioEmailMsg('');
    try {
      const res = await fetch(`http://localhost:5000/api/folio/${folioRes.id}/email`, { method: 'POST' });
      const data = await res.json();
      setFolioEmailMsg(data.success ? `✓ ${data.message}` : `✗ ${data.message}`);
    } catch (e) {
      setFolioEmailMsg('✗ Failed to send email.');
    } finally {
      setFolioEmailSending(false);
      setTimeout(() => setFolioEmailMsg(''), 4000);
    }
  };

  const printFolio = () => {
    if (!folioRes) return;
    const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
    const fmtA = (n) => `₱${parseFloat(n).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
    const nights = Math.round((new Date(folioRes.check_out_date) - new Date(folioRes.check_in_date)) / 86400000);
    const totalCharges = folioTotals.charges;
    const totalPaid = folioTotals.payments;
    const balance = folioTotals.balance;

    const chargeRows = folioItems.map(i => `
      <tr style="${i.voided ? 'opacity:0.4;text-decoration:line-through;' : ''}">
        <td>${i.charge_type}</td><td>${i.description || '—'}</td>
        <td style="text-align:center;">${i.quantity}</td>
        <td style="text-align:right;">${fmtA(i.unit_price)}</td>
        <td style="text-align:right;">${i.voided ? 'VOID' : fmtA(i.amount)}</td>
      </tr>`).join('');

    const paymentRows = folioPayments.map(p => `
      <tr style="${p.voided ? 'opacity:0.4;text-decoration:line-through;' : ''}">
        <td>${p.payment_method}</td><td>${p.reference || '—'}</td>
        <td style="text-align:right;">${p.voided ? 'VOID' : fmtA(p.amount)}</td>
        <td style="color:#888;">${fmtD(p.posted_at)}</td>
      </tr>`).join('');

    const win = window.open('', '_blank', 'width=700,height=900');
    win.document.write(`<!DOCTYPE html><html><head><title>Folio — ${folioRes.full_name}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:640px;margin:32px auto;padding:0 24px;color:#222;}
        h2{margin:0 0 4px;} p.sub{margin:0 0 20px;color:#666;font-size:13px;}
        table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;}
        th{background:#f5f5f5;padding:6px 8px;text-align:left;}
        td{padding:6px 8px;border-bottom:1px solid #f0f0f0;}
        .total-row{font-weight:bold;background:#eff6ff;}
        .paid-row{font-weight:bold;background:#f0fdf4;}
        .balance{margin-top:16px;padding:14px;border-radius:6px;text-align:right;font-size:15px;font-weight:bold;}
        .bal-due{background:#fef3c7;color:#b45309;}
        .bal-ok{background:#f0fdf4;color:#15803d;}
        @media print{button{display:none;}}
      </style></head><body>
      <h2>Guest Folio</h2>
      <p class="sub">${folioRes.full_name} &middot; Room ${folioRes.room_number || '—'} &middot; ${folioRes.room_type}</p>
      <table style="margin-bottom:20px;">
        <tr><td style="color:#666;width:120px;">Check-in</td><td>${fmtD(folioRes.check_in_date)}</td></tr>
        <tr><td style="color:#666;">Check-out</td><td>${fmtD(folioRes.check_out_date)}</td></tr>
        <tr><td style="color:#666;">Nights</td><td>${nights}</td></tr>
      </table>
      <h3 style="margin:0 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px;">Charges</h3>
      ${folioItems.length === 0 ? '<p style="color:#999;font-size:13px;">No charges posted.</p>' : `
      <table>
        <thead><tr><th>Type</th><th>Description</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Amount</th></tr></thead>
        <tbody>${chargeRows}</tbody>
        <tfoot><tr class="total-row"><td colspan="4" style="text-align:right;">Total Charges</td><td style="text-align:right;">${fmtA(totalCharges)}</td></tr></tfoot>
      </table>`}
      <h3 style="margin:0 0 6px;border-bottom:1px solid #ddd;padding-bottom:4px;">Payments</h3>
      ${folioPayments.length === 0 ? '<p style="color:#999;font-size:13px;">No payments recorded.</p>' : `
      <table>
        <thead><tr><th>Method</th><th>Reference</th><th style="text-align:right;">Amount</th><th>Date</th></tr></thead>
        <tbody>${paymentRows}</tbody>
        <tfoot><tr class="paid-row"><td colspan="2" style="text-align:right;">Total Paid</td><td style="text-align:right;">${fmtA(totalPaid)}</td><td></td></tr></tfoot>
      </table>`}
      <div class="balance ${balance > 0 ? 'bal-due' : 'bal-ok'}">
        ${balance > 0 ? `Balance Due: ${fmtA(balance)}` : 'Folio Settled ✓'}
      </div>
      <script>window.onload=()=>{window.print();}</script>
    </body></html>`);
    win.document.close();
  };

  const openTransfer = (r) => {
    setTransferGuest(r);
    setTransferRoomType(''); // Start with empty to show all available rooms
    setTransferRoomNumber('');
    setTransferError('');
    setTransferSuccess('');
    fetchRooms();
    fetchWkRoomTypes('', '');
  };

  const submitTransfer = async () => {
    if (!transferGuest || !transferRoomNumber.trim()) return;
    setTransferSubmitting(true);
    setTransferError('');
    try {
      const res = await fetch(`http://localhost:5000/api/reservations/${transferGuest.id}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRoomNumber: transferRoomNumber.trim(), newRoomType: transferRoomType }),
      });
      const data = await res.json();
      if (data.success) {
        setTransferSuccess(`Transferred to Room ${transferRoomNumber}`);
        fetchInHouse();
        fetchRooms();
        setTimeout(() => setTransferGuest(null), 1500);
      } else {
        setTransferError(data.message || 'Transfer failed.');
      }
    } catch (e) {
      setTransferError('Network error — is the server running?');
    }
    setTransferSubmitting(false);
  };

  const updateStatus = async (id, status) => {
    setStatusUpdating(id);
    try {
      await fetch(`http://localhost:5000/api/reservations/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchArrivals(arrivalDate);
      if (fdView === 'inhouse') fetchInHouse();
      if (fdView === 'search') runSearch(searchQ);
    } catch (e) { console.error(e); }
    setStatusUpdating(null);
  };

  // ── Walk-In helpers ──────────────────────────────────────────────────────────
  const fetchWkRoomTypes = React.useCallback(async (checkIn, checkOut) => {
    try {
      const url = (checkIn && checkOut)
        ? `http://localhost:5000/api/room-types/availability?checkIn=${checkIn}&checkOut=${checkOut}`
        : 'http://localhost:5000/api/room-types';
      const res = await fetch(url);
      const data = await res.json();
      const list = data.availability || data.roomTypes || [];
      setWkRoomTypes(list);
      if (list.length > 0) setWkRoomType(rt => rt || list[0].name);
    } catch (e) { console.error(e); }
  }, []);

  React.useEffect(() => {
    if (fdView === 'walkin') fetchWkRoomTypes(wkCheckIn, wkCheckOut);
    else if (fdView === 'rooms') fetchWkRoomTypes('', '');
  }, [fdView, wkCheckIn, wkCheckOut, fetchWkRoomTypes]);

  React.useEffect(() => {
    if (fdView === 'walkin' && wkRateCodes.length === 0) {
      fetch('http://localhost:5000/api/rate-codes')
        .then(r => r.json())
        .then(d => { if (d.rateCodes) setWkRateCodes(d.rateCodes); })
        .catch(() => { });
    }
  }, [fdView]);

  const submitWalkin = async () => {
    if (!wkLastName.trim() || !wkFirstName.trim() || !wkRoomType || !wkCheckIn || !wkCheckOut || !wkRoomNumber.trim()) {
      setWkError('Please fill in all required fields (last name, first name, room type, dates, room number).'); return;
    }
    if (new Date(wkCheckOut) <= new Date(wkCheckIn)) {
      setWkError('Check-out date must be after check-in date.'); return;
    }
    setWkError(''); setWkSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/front-desk/walkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${wkLastName.trim()}, ${wkFirstName.trim()}${wkMiddleName.trim() ? ' ' + wkMiddleName.trim() : ''}`,
          title: wkTitle, gender: wkGender, birth_date: wkBirthDate,
          nationality: wkNationality, country: wkCountry,
          email: wkEmail.trim(), phone: wkPhone.trim(),
          address: wkAddress.trim(), city: wkCity.trim(),
          id_type: wkIdType, id_number: wkIdNumber.trim(),
          room_type: wkRoomType, rate_code: wkRateCode,
          check_in_date: wkCheckIn, check_out_date: wkCheckOut,
          eta: wkEta, number_of_guests: wkGuests, room_number: wkRoomNumber.trim(),
          purpose: wkPurpose, payment_method: wkPaymentMethod, deposit_amount: wkDepositAmount || 0,
          payment_collected: wkPayment, special_requests: wkSpecialReq.trim(), notes: wkNotes.trim(),
        }),
      });
      let data;
      try { data = await res.json(); } catch { throw new Error(`Server returned status ${res.status} (${res.statusText})`); }
      if (data.success) { setWkResult(data.reservation); setWkSuccess(true); fetchInHouse(); fetchArrivals(arrivalDate); }
      else setWkError(data.message || `Server error ${res.status}`);
    } catch (e) { setWkError(e.message || 'Network error — is the server running?'); }
    setWkSubmitting(false);
  };

  const resetWalkin = () => {
    setWkTitle('Mr.'); setWkLastName(''); setWkFirstName(''); setWkMiddleName('');
    setWkGender(''); setWkBirthDate(''); setWkNationality(''); setWkCountry('');
    setWkEmail(''); setWkPhone(''); setWkAddress(''); setWkCity('');
    setWkIdType(''); setWkIdNumber('');
    setWkRoomType(wkRoomTypes[0]?.name || ''); setWkRateCode('');
    setWkCheckIn(today); setWkCheckOut(''); setWkEta(''); setWkGuests(1); setWkRoomNumber('');
    setWkPurpose(''); setWkPaymentMethod('Cash'); setWkDepositAmount('');
    setWkPayment(false); setWkSpecialReq(''); setWkNotes('');
    setWkSuccess(false); setWkResult(null); setWkError('');
  };

  // ── Guest Profile helpers ──────────────────────────────────────────────────
  const openGuestProfile = (r) => {
    setGpRes(r);
    // Parse full_name back into parts — stored as "LastName, FirstName MiddleName"
    const nameParts = (r.full_name || '').split(',');
    const lastName = (nameParts[0] || '').trim();
    const restParts = (nameParts[1] || '').trim().split(' ');
    const firstName = restParts[0] || '';
    const middleName = restParts.slice(1).join(' ');
    setGpForm({
      title: r.title || '',
      last_name: lastName,
      first_name: firstName,
      middle_name: r.middle_name || middleName,
      gender: r.gender || '',
      date_of_birth: r.date_of_birth ? r.date_of_birth.slice(0, 10) : '',
      nationality: r.nationality || '',
      country: r.country || '',
      email: r.email || '',
      phone_number: r.phone_number || '',
      address: r.address || '',
      city: r.city || '',
      id_type: r.id_type || '',
      id_number: r.id_number || '',
      purpose_of_visit: r.purpose_of_visit || '',
      eta: r.eta || '',
      payment_method: r.payment_method || '',
      deposit_amount: r.deposit_amount != null ? r.deposit_amount : '',
      special_requests: r.special_requests || '',
      front_desk_notes: r.front_desk_notes || '',
    });
    setGpError(''); setGpSaved(false);
    setGpOpen(true);
  };

  const saveGuestProfile = async () => {
    if (!gpRes) return;
    setGpSaving(true); setGpError(''); setGpSaved(false);
    try {
      const full_name = `${gpForm.last_name.trim()}, ${gpForm.first_name.trim()}${gpForm.middle_name.trim() ? ' ' + gpForm.middle_name.trim() : ''}`;
      const res = await fetch(`http://localhost:5000/api/reservations/${gpRes.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...gpForm, full_name }),
      });
      const data = await res.json();
      if (data.success) {
        setGpSaved(true);
        setGpRes(data.reservation);
        fetchInHouse();
        fetchArrivals(arrivalDate);
      } else setGpError(data.message || 'Failed to save.');
    } catch (e) { setGpError('Network error.'); }
    setGpSaving(false);
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', bar: 'bg-yellow-400' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300', bar: 'bg-blue-500' },
    checked_in: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', bar: 'bg-green-500' },
    checked_out: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', bar: 'bg-gray-400' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', bar: 'bg-red-400' },
    no_show: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', bar: 'bg-orange-400' },
  };

  const statusLabel = (s) => ({
    pending: 'Pending', confirmed: 'Confirmed', checked_in: 'Checked In',
    checked_out: 'Checked Out', cancelled: 'Cancelled', no_show: 'No Show',
  }[s] || s);

  const nightsCount = (r) => {
    const d1 = new Date(r.check_in_date), d2 = new Date(r.check_out_date);
    return Math.round((d2 - d1) / 86400000);
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  // ── Rooms functions ──────────────────────────────────────────────────────────
  const fetchRooms = React.useCallback(async () => {
    setRoomsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/rooms');
      const data = await res.json();
      setRooms(data.rooms || []);
    } catch (e) { console.error(e); }
    setRoomsLoading(false);
  }, []);

  React.useEffect(() => { if (fdView === 'rooms' || fdView === 'walkin' || fdView === 'calendar') fetchRooms(); }, [fdView, fetchRooms]);

  const fetchTapeChart = React.useCallback(async (from) => {
    setTcLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/front-desk/tape-chart?from=${from}`);
      const data = await res.json();
      if (data.success) { setTcRooms(data.rooms || []); setTcReservations(data.reservations || []); setTcTypeView(!!data.typeView); }
    } catch (e) { console.error(e); }
    setTcLoading(false);
  }, []);

  React.useEffect(() => { if (fdView === 'calendar') fetchTapeChart(tcFrom); }, [fdView, tcFrom, fetchTapeChart]);

  const updateHkStatus = async (roomNumber, status) => {
    setHkUpdating(roomNumber);
    try {
      await fetch(`http://localhost:5000/api/rooms/${encodeURIComponent(roomNumber)}/hk-status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      await fetchRooms();
      setSelectedRoom(prev => prev && prev.room_number === roomNumber ? { ...prev, hk_status: status } : prev);
    } catch (e) { console.error(e); }
    setHkUpdating(null);
  };

  const addRoom = async () => {
    if (!newRoomNumber.trim()) return;
    try {
      await fetch('http://localhost:5000/api/rooms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_number: newRoomNumber.trim(), room_type: newRoomType, floor: newRoomFloor }),
      });
      setAddRoomOpen(false); setNewRoomNumber(''); setNewRoomType(''); setNewRoomFloor(1);
      fetchRooms();
    } catch (e) { console.error(e); }
  };

  const removeRoom = async (roomNumber) => {
    await fetch(`http://localhost:5000/api/rooms/${encodeURIComponent(roomNumber)}`, { method: 'DELETE' });
    setSelectedRoom(null);
    fetchRooms();
  };

  // ── Sub-components ──────────────────────────────────────────────────────────
  const roomStatusConfig = {
    available: { label: 'Available', bg: 'bg-green-500/20', border: 'border-green-400/30', text: 'text-green-300', dot: 'bg-green-400', pill: 'bg-green-500/25 text-green-200' },
    occupied: { label: 'Occupied', bg: 'bg-blue-500/20', border: 'border-blue-400/30', text: 'text-blue-300', dot: 'bg-blue-400', pill: 'bg-blue-500/25 text-blue-200' },
    due_out: { label: 'Due Out', bg: 'bg-orange-500/20', border: 'border-orange-400/30', text: 'text-orange-300', dot: 'bg-orange-400', pill: 'bg-orange-500/25 text-orange-200' },
    arriving: { label: 'Arriving', bg: 'bg-purple-500/20', border: 'border-purple-400/30', text: 'text-purple-300', dot: 'bg-purple-400', pill: 'bg-purple-500/25 text-purple-200' },
    dirty: { label: 'Dirty', bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-300', dot: 'bg-yellow-400', pill: 'bg-yellow-500/25 text-yellow-200' },
    inspected: { label: 'Inspected', bg: 'bg-teal-500/20', border: 'border-teal-400/30', text: 'text-teal-300', dot: 'bg-teal-400', pill: 'bg-teal-500/25 text-teal-200' },
    out_of_order: { label: 'Out of Order', bg: 'bg-red-500/20', border: 'border-red-400/30', text: 'text-red-300', dot: 'bg-red-400', pill: 'bg-red-500/25 text-red-200' },
  };

  const RoomCard = ({ r }) => {
    const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;
    const isActive = ['occupied', 'due_out', 'arriving'].includes(r.computed_status);
    return (
      <button
        onClick={() => setSelectedRoom(r)}
        className={`relative rounded-xl border ${cfg.border} ${cfg.bg} p-3 text-left transition-all hover:scale-[1.03] hover:shadow-lg active:scale-100 w-full aspect-square flex flex-col justify-between`}
      >
        <div>
          <div className={`text-xl font-black font-mono ${cfg.text} leading-none`}>{r.room_number}</div>
          <div className="text-white/40 text-[10px] mt-0.5 truncate">{r.room_type || 'Room'}</div>
        </div>
        <div>
          {isActive && r.guest_name && (
            <div className="text-white/60 text-[10px] truncate mb-1">{r.guest_name.split(' ')[0]}</div>
          )}
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
            <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
          </div>
        </div>
        {hkUpdating === r.room_number && (
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </button>
    );
  };

  const ArrivalRow = ({ r }) => {
    const sc = statusColors[r.status] || statusColors.pending;
    const nights = nightsCount(r);
    const isSelected = selectedArrival?.id === r.id;
    return (
      <div
        onClick={() => setSelectedArrival(isSelected ? null : r)}
        className="grid items-center gap-x-3 px-3 cursor-pointer transition-all"
        style={{
          gridTemplateColumns: '1fr 6rem 6rem 2.5rem 5.5rem',
          height: '23px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: isSelected ? 'rgba(255,255,255,0.12)' : 'transparent',
        }}
      >
        <span className="text-[12px] font-semibold text-white truncate">{r.full_name}</span>
        <span className="text-[12px] text-white/45 truncate">{r.room_type_name || r.room_type}</span>
        <span className="text-[12px] text-white/40 font-mono">{fmtDate(r.check_in_date)}</span>
        <span className="text-[12px] text-white/35 text-center">{nights}n</span>
        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full text-center ${sc.bg} ${sc.text}`}>{statusLabel(r.status)}</span>
      </div>
    );
  };

  // ── Guest Profile Modal ────────────────────────────────────────────────────
  const GuestProfileModal = () => {
    if (!gpOpen || !gpRes) return null;
    const lbl = (text) => (
      <div className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase mb-0.5">{text}</div>
    );
    const inp = (field, placeholder, type = 'text', extra = {}) => (
      <input type={type} placeholder={placeholder} value={gpForm[field] || ''}
        onChange={e => setGpForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors"
        {...extra} />
    );
    const sel = (field, opts) => (
      <select value={gpForm[field] || ''} onChange={e => setGpForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full px-2 py-1 bg-[#1e2a3a] border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors">
        <option value="">—</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    const divider = (title) => (
      <div className="flex items-center gap-2 mt-3 mb-2">
        <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
    const nights = nightsCount(gpRes);
    return ReactDOM.createPortal(
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden"
          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
            <div>
              <div className="text-white font-semibold text-sm">Guest Profile</div>
              <div className="text-white/40 text-[11px] mt-0.5">
                Room {gpRes.room_number || '—'} &middot; {gpRes.room_type_name || gpRes.room_type} &middot; {fmtDate(gpRes.check_in_date)} – {fmtDate(gpRes.check_out_date)} ({nights} nights)
              </div>
            </div>
            <button onClick={() => setGpOpen(false)} className="text-white/30 hover:text-white text-lg leading-none transition-colors">&times;</button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 pb-5" style={{ scrollbarWidth: 'thin' }}>
            {divider('GUEST PROFILE')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div>{lbl('Title')}{sel('title', ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Rev.'])}</div>
              <div>{lbl('Last Name *')}{inp('last_name', 'dela Cruz')}</div>
              <div>{lbl('First Name *')}{inp('first_name', 'Juan')}</div>
              <div>{lbl('Middle Name')}{inp('middle_name', '')}</div>
              <div>{lbl('Gender')}{sel('gender', ['Male', 'Female', 'Other', 'Prefer not to say'])}</div>
              <div>{lbl('Date of Birth')}{inp('date_of_birth', '', 'date')}</div>
              <div>{lbl('Nationality')}{inp('nationality', 'Filipino')}</div>
              <div>{lbl('Country')}{inp('country', 'Philippines')}</div>
            </div>

            {divider('CONTACT INFORMATION')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div className="col-span-2">{lbl('Email')}{inp('email', 'guest@email.com', 'email')}</div>
              <div className="col-span-2">{lbl('Phone')}{inp('phone_number', '+63 9xx xxx xxxx', 'tel')}</div>
              <div className="col-span-2">{lbl('Address')}{inp('address', 'Street / Barangay')}</div>
              <div className="col-span-2">{lbl('City')}{inp('city', 'City / Municipality')}</div>
            </div>

            {divider('IDENTIFICATION')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div className="col-span-2">{lbl('ID Type')}{sel('id_type', ['Passport', 'Driver\'s License', 'SSS', 'PhilHealth', 'UMID', 'PhilSys ID', 'Voter\'s ID', 'PRC ID', 'Other'])}</div>
              <div className="col-span-2">{lbl('ID Number')}{inp('id_number', 'ID number')}</div>
            </div>

            {divider('STAY & PAYMENT')}
            <div className="grid grid-cols-4 gap-x-3 gap-y-2">
              <div className="col-span-2">{lbl('Purpose of Visit')}{sel('purpose_of_visit', ['Leisure', 'Business', 'Event', 'Medical', 'Transit', 'Other'])}</div>
              <div>{lbl('ETA')}{inp('eta', '14:00', 'time')}</div>
              <div>{lbl('Payment Method')}{sel('payment_method', ['Cash', 'Credit Card', 'Debit Card', 'GCash', 'Bank Transfer', 'Other'])}</div>
              <div className="col-span-2">{lbl('Deposit Amount')}<input type="number" min="0" step="0.01" placeholder="0.00" value={gpForm.deposit_amount || ''}
                onChange={e => setGpForm(f => ({ ...f, deposit_amount: e.target.value }))}
                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors" /></div>
            </div>

            {divider('REMARKS')}
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>{lbl('Special Requests')}<textarea rows={3} placeholder="Guest requests..." value={gpForm.special_requests || ''}
                onChange={e => setGpForm(f => ({ ...f, special_requests: e.target.value }))}
                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors resize-none" /></div>
              <div>{lbl('FD Notes')}<textarea rows={3} placeholder="Internal notes..." value={gpForm.front_desk_notes || ''}
                onChange={e => setGpForm(f => ({ ...f, front_desk_notes: e.target.value }))}
                className="w-full px-2 py-1 bg-white/8 border border-white/15 text-white text-[11px] rounded-sm outline-none focus:border-white/40 transition-colors resize-none" /></div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="text-xs">
              {gpError && <span className="text-red-400">{gpError}</span>}
              {gpSaved && !gpError && <span className="text-emerald-400">Profile saved ✓</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setGpOpen(false)}
                className="px-4 py-1.5 text-xs text-white/50 hover:text-white border border-white/15 rounded transition-colors">
                Close
              </button>
              <button onClick={saveGuestProfile} disabled={gpSaving}
                className="px-4 py-1.5 text-xs font-semibold bg-[#576CA8] hover:bg-[#4a5d9a] text-white rounded transition-colors disabled:opacity-50">
                {gpSaving ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const InHouseCard = ({ r }) => {
    const nights = nightsCount(r);
    const isDueOut = r.check_out_date && r.check_out_date.slice(0, 10) === today;
    return (
      <div className="grid items-center gap-x-3 px-3 py-2.5 transition-all"
        style={{ gridTemplateColumns: '3rem 1fr 7rem 5.5rem 2.5rem 3rem 3.5rem 3.5rem 5rem', borderBottom: `1px solid ${isDueOut ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`, background: isDueOut ? 'rgba(251,191,36,0.05)' : 'transparent' }}>
        {/* Room */}
        <span className={`font-mono font-bold text-sm ${isDueOut ? 'text-amber-300' : 'text-white/70'}`}>
          {r.room_number || '—'}
        </span>
        {/* Name */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`font-semibold text-sm truncate ${isDueOut ? 'text-amber-100' : 'text-white'}`}>{r.full_name}</span>
          {isDueOut && <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-400">Due Out</span>}
        </div>
        {/* Room type */}
        <span className="text-xs text-white/35 truncate">{r.room_type_name || r.room_type}</span>
        {/* Check-out date */}
        <span className={`text-xs font-medium ${isDueOut ? 'text-amber-300' : 'text-white/40'}`}>{fmtDate(r.check_out_date)}</span>
        {/* Nights */}
        <span className="text-xs text-white/30 text-center">{nights}n</span>
        {/* Edit Profile */}
        <button onClick={() => openGuestProfile(r)}
          className="text-xs text-white/25 hover:text-violet-300 transition-all text-right">
          Edit
        </button>
        {/* Folio */}
        <button onClick={() => openFolio(r)}
          className="text-xs text-white/25 hover:text-emerald-300 transition-all text-right">
          Folio
        </button>
        {/* Transfer */}
        <button onClick={() => openTransfer(r)}
          className="text-xs text-white/25 hover:text-sky-300 transition-all text-right">
          Transfer
        </button>
        {/* Check Out */}
        <button onClick={() => { setCheckoutConfirmId(r.id); fetchCheckoutBalance(r.id); }}
          className={`text-xs font-semibold px-2 py-1 rounded transition-all text-right ${isDueOut ? 'text-amber-300 hover:text-amber-100' : 'text-white/30 hover:text-white/70'}`}>
          Check Out
        </button>
      </div>
    );
  };

  const SearchResultCard = ({ r }) => {
    const sc = statusColors[r.status] || statusColors.pending;
    const nights = nightsCount(r);
    return (
      <div className="relative rounded-xl border border-white/15 overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className={`w-1.5 flex-shrink-0 ${sc.bar}`} />
        <div className="flex-1 p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{r.full_name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>{statusLabel(r.status)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-md">{r.room_type_name || r.room_type}</span>
              <span className="text-xs text-white/35 font-mono">#{r.id}</span>
              <span className="text-xs text-white/45">CI: {fmtDate(r.check_in_date)}</span>
              <span className="text-xs text-white/45">CO: {fmtDate(r.check_out_date)}</span>
              <span className="text-xs text-white/40">{nights} night{nights !== 1 ? 's' : ''}</span>
            </div>
            {r.room_number && <div className="text-xs text-green-300 mt-0.5">Room {r.room_number}</div>}
          </div>
          <div className="flex-shrink-0">
            {(r.status === 'pending' || r.status === 'confirmed') && (
              <button onClick={() => openWizard(r)} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors">Check In</button>
            )}
            {r.status === 'checked_in' && (
              <button onClick={() => setCheckoutConfirmId(r.id)} className="bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all">Check Out</button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Wizard Steps ────────────────────────────────────────────────────────────
  const WizardStepBar = () => {
    const steps = ['Guest ID', 'Reservation', 'Room', 'Payment'];
    return (
      <div className="flex items-center gap-0 mb-6">
        {steps.map((label, idx) => {
          const num = idx + 1;
          const active = num === wizardStep;
          const done = num < wizardStep;
          return (
            <React.Fragment key={num}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${done ? 'bg-green-500 text-white' : active ? 'bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${active ? 'text-[#576CA8] font-semibold' : done ? 'text-green-600' : 'text-gray-400'}`}>{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const WizardStep1 = () => (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Verify Guest Identity</h3>
      <p className="text-xs text-gray-500 mb-4">Ask the guest to present a valid government-issued photo ID.</p>
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-3">
        <div className="flex justify-between text-sm"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900">{wizardReservation?.full_name}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900">{wizardReservation?.email || '—'}</span></div>
        <div className="flex justify-between text-sm"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-900">{wizardReservation?.phone_number || '—'}</span></div>
        {wizardReservation?.nationality && <div className="flex justify-between text-sm"><span className="text-gray-500">Nationality</span><span className="font-medium text-gray-900">{wizardReservation.nationality}</span></div>}
        {wizardReservation?.id_type && <div className="flex justify-between text-sm"><span className="text-gray-500">ID</span><span className="font-medium text-gray-900">{wizardReservation.id_type} — {wizardReservation.id_number || '—'}</span></div>}
        <div className="flex justify-between text-sm"><span className="text-gray-500">Confirmation #</span><span className="font-mono text-[#576CA8] font-bold">{wizardReservation?.id}</span></div>
      </div>
      <button onClick={() => wizardReservation && openGuestProfile(wizardReservation)}
        className="w-full mb-4 py-1.5 text-xs text-[#576CA8] border border-[#576CA8]/30 rounded-lg hover:bg-[#576CA8]/5 transition-colors font-medium">
        ✏ Complete / Edit Guest Profile
      </button>
      <label className="flex items-start gap-3 cursor-pointer group">
        <input type="checkbox" checked={wizardIdVerified} onChange={(e) => setWizardIdVerified(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#576CA8] cursor-pointer" />
        <span className="text-sm text-gray-700 group-hover:text-gray-900">
          I have verified the guest&apos;s identity document and it matches the reservation.
        </span>
      </label>
    </div>
  );

  const WizardStep2 = () => {
    const nights = wizardReservation ? nightsCount(wizardReservation) : 0;
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Review Reservation</h3>
        <p className="text-xs text-gray-500 mb-4">Confirm all reservation details with the guest.</p>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Room Type</span><span className="font-medium text-gray-900">{wizardReservation?.room_type_name || wizardReservation?.room_type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Check-In</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_in_date)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_out_date)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Nights</span><span className="font-medium text-gray-900">{nights}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Guests</span><span className="font-medium text-gray-900">{wizardReservation?.number_of_guests || 1}</span></div>
        </div>
        {wizardReservation?.special_requests && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Special Requests</div>
            <p className="text-sm text-amber-800 italic">&ldquo;{wizardReservation.special_requests}&rdquo;</p>
          </div>
        )}
      </div>
    );
  };

  const WizardStep3 = () => {
    const roomType = wizardReservation?.room_type;
    const typeRooms = rooms.filter(r => r.room_type === roomType);
    const selRoom = typeRooms.find(r => r.room_number === wizardRoomNumber);
    const isBlocked = selRoom && (selRoom.computed_status === 'occupied' || selRoom.computed_status === 'arriving');
    const isWarn = selRoom && (selRoom.computed_status === 'dirty' || selRoom.computed_status === 'out_of_order');
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Assign Room</h3>
        <p className="text-xs text-gray-500 mb-4">Select an available room for this guest.</p>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Room Number</label>
          {typeRooms.length === 0 ? (
            <input
              type="text"
              value={wizardRoomNumber}
              onChange={(e) => setWizardRoomNumber(e.target.value)}
              placeholder="e.g. 201"
              autoComplete="off"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 text-lg font-mono font-bold outline-none transition-all"
              autoFocus
            />
          ) : (
            <div>
              <select
                value={wizardRoomNumber}
                onChange={(e) => setWizardRoomNumber(e.target.value)}
                style={{ background: '#f8fafc' }}
                className={`w-full px-4 py-3 rounded-xl border ${isBlocked ? 'border-red-300 bg-red-50' : 'border-gray-300'} focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 text-base font-mono font-bold outline-none transition-all`}
                autoFocus
              >
                <option value="" style={{ background: '#f8fafc', color: '#9ca3af' }}>— select room —</option>
                {typeRooms.map(r => {
                  const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;
                  const unavailable = r.computed_status === 'occupied' || r.computed_status === 'arriving';
                  return (
                    <option key={r.room_number} value={r.room_number} disabled={unavailable}
                      style={{ background: unavailable ? '#fef2f2' : '#f8fafc', color: unavailable ? '#ef4444' : '#111827' }}>
                      {`Room ${r.room_number}${r.floor ? ` · Fl.${r.floor}` : ''} — ${cfg.label}${unavailable ? ' (unavailable)' : ''}`}
                    </option>
                  );
                })}
              </select>
              {selRoom && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${isBlocked ? 'text-red-500' : isWarn ? 'text-amber-600' : 'text-green-600'}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isBlocked ? 'bg-red-400' : isWarn ? 'bg-amber-400' : 'bg-green-400'}`} />
                  {isBlocked
                    ? `Room ${selRoom.room_number} is ${selRoom.computed_status === 'occupied' ? 'occupied' : 'arriving today'} — choose another room`
                    : isWarn
                      ? `Room ${selRoom.room_number} is ${selRoom.hk_status} — confirm it's ready before assigning`
                      : `Room ${selRoom.room_number} is available`}
                </div>
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Front Desk Notes (optional)</label>
          <textarea
            value={wizardNotes}
            onChange={(e) => setWizardNotes(e.target.value)}
            placeholder="Any notes for housekeeping or other staff..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:border-[#576CA8] focus:ring-2 focus:ring-[#576CA8]/20 text-gray-900 text-sm outline-none transition-all resize-none"
          />
        </div>
      </div>
    );
  };

  const WizardStep4 = () => {
    const nights = wizardReservation ? nightsCount(wizardReservation) : 0;
    return (
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">Payment &amp; Confirmation</h3>
        <p className="text-xs text-gray-500 mb-4">Collect payment and complete the check-in process.</p>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-2 mb-4">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Guest</span><span className="font-medium text-gray-900">{wizardReservation?.full_name}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Room Assigned</span><span className="font-bold text-[#576CA8] font-mono">{wizardRoomNumber || '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Room Type</span><span className="font-medium text-gray-900">{wizardReservation?.room_type_name || wizardReservation?.room_type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Check-Out</span><span className="font-medium text-gray-900">{fmtDate(wizardReservation?.check_out_date)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Nights</span><span className="font-medium text-gray-900">{nights}</span></div>
          {wizardNotes && <div className="flex justify-between text-sm"><span className="text-gray-500">Notes</span><span className="text-gray-700 text-right max-w-[60%]">{wizardNotes}</span></div>}
        </div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <input type="checkbox" checked={wizardPayment} onChange={(e) => setWizardPayment(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#576CA8] cursor-pointer" />
          <span className="text-sm text-gray-700 group-hover:text-gray-900">
            Payment has been collected / verified for this stay.
          </span>
        </label>
      </div>
    );
  };

  const WizardSuccessCard = () => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
        <span className="text-3xl">✓</span>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-1">Check-In Complete!</h3>
      <p className="text-sm text-gray-500 mb-5">{wizardReservation?.full_name} is now checked in.</p>
      <div className="bg-green-50 border border-green-200 rounded-2xl px-8 py-4 mb-4">
        <div className="text-4xl font-mono font-black text-green-800">{wizardRoomNumber}</div>
        <div className="text-xs text-green-600 font-semibold uppercase tracking-widest mt-1">Room Number</div>
      </div>
      <span className="inline-block bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide mb-6">
        KEY READY
      </span>
      <button onClick={closeWizard} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors">
        Close
      </button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ position: 'fixed', top: '80px', left: '150px', right: 0, bottom: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="flex-1 flex flex-col min-h-0 w-full">
          <div className="flex-1 flex flex-col min-h-0 border-t border-l border-white/20 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            {/* Header bar */}
            <div className="px-6 pt-0.5 pb-0" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
              {/* Title row */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="shrink-0">
                  <h3 className="text-white font-bold text-lg tracking-tight leading-tight">Front Desk</h3>
                  <p className="text-white/50 text-xs">Guest management</p>
                </div>
                <div className="flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                  <span className="text-white text-xs font-semibold tracking-wide">
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              {/* Tab row — full width, scrollable */}
              <div className="flex items-center gap-0.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {[
                  { id: 'arrivals', label: 'Arrivals', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3v9" /><path d="M6 9l3 3 3-3" /><path d="M4 15h10" /></svg> },
                  { id: 'inhouse', label: 'In-House', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8.5L9 2l7 6.5" /><path d="M5 8v7h3v-4h2v4h3V8" /></svg> },
                  { id: 'search', label: 'Search', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="5" /><path d="M15 15l-3.5-3.5" /></svg> },
                  { id: 'walkin', label: 'Walk-In', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="4" r="1.5" /><path d="M6 9l2-3h2l2 3" /><path d="M7 12l-1 4M11 12l1 4" /><path d="M6 9l1 3h4l1-3" /></svg> },
                  { id: 'rooms', label: 'Rooms', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="6" height="6" rx="1" /><rect x="10" y="2" width="6" height="6" rx="1" /><rect x="2" y="10" width="6" height="6" rx="1" /><rect x="10" y="10" width="6" height="6" rx="1" /></svg> },
                  { id: 'calendar', label: 'Tape Chart', svg: <svg width="15" height="15" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="14" height="13" rx="1" /><path d="M6 1v4M12 1v4" /><path d="M2 7h14" /><path d="M5 11h2M9 11h2M13 11h1M5 14h2M9 14h2" /></svg> },
                ].map(v => {
                  const active = fdView === v.id;
                  return (
                    <button key={v.id} onClick={() => setFdView(v.id)}
                      className="flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold whitespace-nowrap transition-all border-b-2 shrink-0"
                      style={{ borderBottomColor: active ? 'rgba(147,182,245,0.9)' : 'transparent', color: active ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)', background: active ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                      {v.svg}
                      {v.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="p-6 md:p-8 flex-1 overflow-y-auto">

              {/* ── Arrivals View ── */}
              {fdView === 'arrivals' && (
                <div>
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Date</span>
                      <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white focus:border-white/40 focus:ring-2 focus:ring-white/20 text-sm outline-none"
                      />
                      <div className="flex items-center gap-4 ml-2 pl-3 border-l border-white/10">
                        {[
                          { label: 'Total', value: arrivalStats.total, color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h10M2 7h10M2 10h6" /></svg> },
                          { label: 'Checked In', value: arrivalStats.checkedIn, color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l3.5 3.5L12 4" /></svg> },
                          { label: 'Awaiting', value: (arrivalStats.pending || 0) + (arrivalStats.confirmed || 0), color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="7" cy="7" r="5" /><path d="M7 4v3l2 1.5" /></svg> },
                          { label: 'No Show', value: arrivalStats.noShow, color: 'text-white', svg: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l6 6M10 4l-6 6" /></svg> },
                        ].map((s) => (
                          <div key={s.label} className="flex flex-col items-center text-white/60">
                            {s.svg}
                            <span className={`text-lg font-bold leading-tight ${s.color}`}>{s.value}</span>
                            <span className="text-[10px] text-white/40 font-medium">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => fetchArrivals(arrivalDate)} className="text-xs font-semibold text-white/50 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all">
                      ↻ Refresh
                    </button>
                  </div>

                  {/* Arrivals Grid */}
                  <div className="border border-white/10 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', marginLeft: '10px' }}>
                    {/* Column headers */}
                    <div className="grid gap-x-3 px-3 py-1.5 border-b border-white/10" style={{ gridTemplateColumns: '1fr 6rem 6rem 2.5rem 5.5rem', background: 'rgba(255,255,255,0.05)' }}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Guest</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Room Type</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Check-In</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Nts</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">Status</span>
                    </div>
                    {/* Rows */}
                    <div style={{ height: '150px', overflowY: 'auto' }}>
                      {arrivalsLoading ? (
                        <div className="flex items-center justify-center h-full text-white/40 text-xs">Loading arrivals…</div>
                      ) : arrivals.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-white/35 text-xs">No arrivals for this date</div>
                      ) : (
                        arrivals.map((r) => <ArrivalRow key={r.id} r={r} />)
                      )}
                    </div>
                  </div>

                  {/* Detail + Notes row — shown when a row is selected */}
                  {selectedArrival && (() => {
                    const r = selectedArrival;
                    const sc = statusColors[r.status] || statusColors.pending;
                    const nights = nightsCount(r);
                    return (
                      <div className="mt-3 flex gap-0" style={{ marginLeft: '10px' }}>
                        {/* Detail panel — 60% */}
                        <div className="border border-white/15 py-3 px-4" style={{ width: '60%', background: 'rgba(255,255,255,0.07)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Reservation Details</p>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-white text-base">{r.full_name}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>{statusLabel(r.status)}</span>
                                {r.guest_arrived_at && <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-green-500 text-white">ARRIVED</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-white/45">
                                <span>{r.room_type_name || r.room_type}</span>
                                <span>·</span>
                                <span>{fmtDate(r.check_in_date)} → {fmtDate(r.check_out_date)}</span>
                                <span>·</span>
                                <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                                {r.number_of_guests && <><span>·</span><span>{r.number_of_guests} guest{r.number_of_guests !== 1 ? 's' : ''}</span></>}
                                {r.rate_code && <><span>·</span><span className="font-mono font-bold text-sky-300 bg-sky-500/15 px-1.5 py-0.5 rounded">{r.rate_code}</span></>}
                                <span className="font-mono text-white/25">#{r.id}</span>
                              </div>
                              {r.special_requests && (
                                <div className="mt-2 text-xs text-amber-200 bg-amber-500/15 border border-amber-400/25 rounded-lg px-2.5 py-1.5 italic">
                                  "{r.special_requests}"
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {(r.status === 'pending' || r.status === 'confirmed') && (
                                <button onClick={() => openWizard(r)} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap">
                                  Check In
                                </button>
                              )}
                              {r.status !== 'checked_in' && r.status !== 'checked_out' && (
                                <select value={r.status} disabled={statusUpdating === r.id} onChange={(e) => updateStatus(r.id, e.target.value)} className="text-xs border border-white/20 rounded-lg px-2 py-1.5 bg-white/10 text-white/80 cursor-pointer">
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="cancelled">Cancel</option>
                                  <option value="no_show">No Show</option>
                                </select>
                              )}
                              <button onClick={() => setSelectedArrival(null)} className="text-white/30 hover:text-white/70 text-lg leading-none px-1">×</button>
                            </div>
                          </div>
                        </div>
                        {/* Notes panel — 40% */}
                        <div className="border border-white/10 border-l-0 py-3 px-4 flex flex-col gap-1.5" style={{ width: '40%', background: 'rgba(255,255,255,0.04)' }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-0.5">Guest Notes</p>
                          <textarea
                            value={guestNotes[r.id] || ''}
                            onChange={(e) => setGuestNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                            placeholder="Add notes about this guest…"
                            rows={3}
                            className="flex-1 bg-transparent text-xs text-white/70 placeholder-white/20 outline-none resize-none leading-relaxed"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ── In-House View ── */}
              {fdView === 'inhouse' && (
                <div>
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                    <div>
                      <span className="text-sm font-semibold text-white">{inHouseGuests.length} Guest{inHouseGuests.length !== 1 ? 's' : ''} In-House</span>
                      <span className="text-xs text-white/40 ml-2">as of now</span>
                    </div>
                    <button onClick={fetchInHouse} className="text-xs font-semibold text-white/50 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all">
                      ↻ Refresh
                    </button>
                  </div>
                  {inHouseLoading ? (
                    <div className="text-center py-10 text-white/40">Loading...</div>
                  ) : inHouseGuests.length === 0 ? (
                    <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-4xl mb-3">🏠</div>
                      <div className="font-semibold text-white/50 mb-1">No guests in-house</div>
                      <div className="text-xs text-white/30">All rooms are currently vacant</div>
                    </div>
                  ) : (
                    <div>
                      {/* Column header */}
                      <div className="grid gap-x-3 px-3 mb-1" style={{ gridTemplateColumns: '3rem 1fr 7rem 5.5rem 2.5rem 3.5rem 3.5rem 5rem' }}>
                        {['Room', 'Guest', 'Type', 'Check-Out', 'Nts', '', '', ''].map((h, i) => (
                          <span key={i} className="text-[10px] font-bold uppercase tracking-widest text-white/25">{h}</span>
                        ))}
                      </div>
                      <div className="space-y-1">
                        {inHouseGuests.map((r) => <InHouseCard key={r.id} r={r} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Search View ── */}
              {fdView === 'search' && (
                <div>
                  <div className="relative mb-5">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
                    <input
                      type="text"
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Name, email, phone, or confirmation # …"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 text-sm outline-none transition-all"
                      autoFocus
                    />
                    {searchLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs animate-pulse">Searching…</span>}
                  </div>
                  {searchQ.trim() === '' ? (
                    <div className="text-center py-10 text-white/30">
                      <div className="text-3xl mb-3">🔍</div>
                      <div className="text-sm font-medium text-white/50 mb-4">Look up any reservation to check in a guest</div>
                      <div className="flex flex-col gap-2 text-xs text-white/30 items-center">
                        <span>Type a <strong className="text-white/45">confirmation #</strong> — e.g. <span className="font-mono text-white/45">42</span></span>
                        <span>Or search by <strong className="text-white/45">name</strong>, <strong className="text-white/45">email</strong>, or <strong className="text-white/45">phone</strong></span>
                      </div>
                    </div>
                  ) : searchResults.length === 0 && !searchLoading ? (
                    <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-3xl mb-2">😕</div>
                      <div className="font-semibold text-white/50">No results found</div>
                      <div className="text-xs text-white/30 mt-1">Try a different name, email, or ID</div>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {searchResults.map((r) => <SearchResultCard key={r.id} r={r} />)}
                    </div>
                  )}
                </div>
              )}

              {/* ── Walk-In View ── */}
              {fdView === 'walkin' && (
                <div>
                  {wkSuccess && wkResult ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">Walk-In Complete!</h3>
                      <p className="text-sm text-white/60 mb-6">{wkResult.full_name} is now checked in.</p>
                      <div className="bg-green-500/15 border border-green-400/30 rounded-2xl px-12 py-5 mb-4 w-full max-w-xs">
                        <div className="text-5xl font-mono font-black text-green-300">{wkResult.room_number}</div>
                        <div className="text-xs text-green-400 font-semibold uppercase tracking-widest mt-2">Room Assigned</div>
                      </div>
                      <div className="text-xs text-white/35 mb-5 font-mono">Confirmation #{wkResult.id}</div>
                      <span className="inline-block bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold px-5 py-2 rounded-full tracking-widest uppercase mb-6">🔑 Key Ready</span>
                      <button onClick={resetWalkin} className="w-full bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all">
                        + New Walk-In Guest
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* ── 2-COLUMN LAYOUT ── */}
                      <div className="flex gap-4 mt-1">

                        {/* ── LEFT: Guest Profile · Contact · Identification ── */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">

                          {/* Guest Profile */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Guest Profile</span>
                            <div className="flex-1 h-px bg-white/15" />
                          </div>
                          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Title</label>
                              <select value={wkTitle} onChange={e => setWkTitle(e.target.value)}
                                style={{ background: '#4B5563', color: 'white' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                {['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Engr.', 'Atty.', 'Prof.', 'Rev.', 'Hon.'].map(t => <option key={t} value={t} style={{ background: '#4B5563' }}>{t}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Last Name <span className="text-red-400">*</span></label>
                              <input type="text" value={wkLastName} onChange={e => setWkLastName(e.target.value)} placeholder="dela Cruz"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">First Name <span className="text-red-400">*</span></label>
                              <input type="text" value={wkFirstName} onChange={e => setWkFirstName(e.target.value)} placeholder="Juan"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Middle Name</label>
                              <input type="text" value={wkMiddleName} onChange={e => setWkMiddleName(e.target.value)} placeholder="Santos"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Gender</label>
                              <select value={wkGender} onChange={e => setWkGender(e.target.value)}
                                style={{ background: '#4B5563', color: wkGender ? 'white' : 'rgba(255,255,255,0.3)' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                {['', 'Male', 'Female', 'Non-binary', 'Prefer not to say'].map(g => <option key={g} value={g} style={{ background: '#4B5563', color: 'white' }}>{g || '— select —'}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Date of Birth</label>
                              <input type="date" value={wkBirthDate} onChange={e => setWkBirthDate(e.target.value)}
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Nationality</label>
                              <input type="text" value={wkNationality} onChange={e => setWkNationality(e.target.value)} placeholder="Filipino"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Country</label>
                              <input type="text" value={wkCountry} onChange={e => setWkCountry(e.target.value)} placeholder="Philippines"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                          </div>

                          {/* Contact */}
                          <div className="flex items-center gap-2 mt-1 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Contact Information</span>
                            <div className="flex-1 h-px bg-white/15" />
                          </div>
                          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Email Address</label>
                              <input type="email" value={wkEmail} onChange={e => setWkEmail(e.target.value)} placeholder="juan@example.com"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Mobile / Phone</label>
                              <input type="tel" value={wkPhone} onChange={e => setWkPhone(e.target.value)} placeholder="09XX XXX XXXX"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Street / Barangay Address</label>
                              <input type="text" value={wkAddress} onChange={e => setWkAddress(e.target.value)} placeholder="123 Rizal St., Brgy. San Antonio"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">City / Municipality</label>
                              <input type="text" value={wkCity} onChange={e => setWkCity(e.target.value)} placeholder="Makati City"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                          </div>

                          {/* Identification */}
                          <div className="flex items-center gap-2 mt-1 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Identification</span>
                            <div className="flex-1 h-px bg-white/15" />
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">ID Type</label>
                              <select value={wkIdType} onChange={e => setWkIdType(e.target.value)}
                                style={{ background: '#4B5563', color: wkIdType ? 'white' : 'rgba(255,255,255,0.3)' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                {['', 'Passport', "Driver's License", 'SSS ID', 'PhilHealth ID', 'Postal ID', 'Senior Citizen ID', 'PWD ID', 'UMID', 'PhilSys / National ID', 'Other'].map(t => (
                                  <option key={t} value={t} style={{ background: '#4B5563', color: 'white' }}>{t || '— select ID type —'}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">ID Number</label>
                              <input type="text" value={wkIdNumber} onChange={e => setWkIdNumber(e.target.value)} placeholder="ID / reference number"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] font-mono placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                          </div>

                        </div>

                        {/* ── RIGHT: Stay Details · Payment · Remarks · Submit ── */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">

                          {/* Stay Details */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Stay Details</span>
                            <div className="flex-1 h-px bg-white/15" />
                          </div>
                          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Room Type <span className="text-red-400">*</span></label>
                              <select value={wkRoomType} onChange={e => { setWkRoomType(e.target.value); setWkRoomNumber(''); }}
                                style={{ background: '#4B5563', color: 'white' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                {wkRoomTypes.length === 0 && <option value="" style={{ background: '#4B5563' }}>Loading...</option>}
                                {wkRoomTypes.map(rt => {
                                  const full = rt.available !== undefined && rt.available <= 0;
                                  const label = rt.available !== undefined ? `${rt.name} (${rt.available}/${rt.total_rooms} avail)` : rt.name;
                                  return (
                                    <option key={rt.id} value={rt.name} disabled={full}
                                      style={{ background: full ? '#3b1a1a' : '#4B5563', color: full ? '#f87171' : 'white' }}>
                                      {label}{full ? ' — FULL' : ''}
                                    </option>
                                  );
                                })}
                              </select>
                              {(() => {
                                const sel = wkRoomTypes.find(rt => rt.name === wkRoomType);
                                if (!sel || sel.available === undefined) return null;
                                const full = sel.available <= 0; const low = sel.available === 1;
                                return (
                                  <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${full ? 'text-red-300' : low ? 'text-yellow-300' : 'text-green-300'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${full ? 'bg-red-400' : low ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                    {full ? `No rooms available` : low ? `Only 1 left` : `${sel.available}/${sel.total_rooms} available`}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Rate Code</label>
                              <select value={wkRateCode} onChange={e => setWkRateCode(e.target.value)}
                                style={{ background: '#4B5563', color: 'white' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                <option value="" style={{ background: '#4B5563' }}>— No rate code —</option>
                                {wkRateCodes.map(rc => (
                                  <option key={rc.id} value={rc.code} style={{ background: '#4B5563' }}>{rc.code} — {rc.name}</option>
                                ))}
                              </select>
                              {(() => {
                                if (!wkRateCode) return null;
                                const rc = wkRateCodes.find(r => r.code === wkRateCode);
                                const rt = wkRoomTypes.find(r => r.name === wkRoomType);
                                if (!rc || !rt) return null;
                                const priceEntry = rc.prices?.find(p => p.room_type_id === rt.id);
                                const price = priceEntry ? priceEntry.price_per_night : rt.price_per_night;
                                return <div className="mt-0.5 text-[10px] text-sky-300 font-semibold">₱{Number(price).toLocaleString()} / night</div>;
                              })()}
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Check-In <span className="text-red-400">*</span></label>
                              <input type="date" value={wkCheckIn} min={today} onChange={e => setWkCheckIn(e.target.value)}
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Check-Out <span className="text-red-400">*</span></label>
                              <input type="date" value={wkCheckOut} min={wkCheckIn || today} onChange={e => setWkCheckOut(e.target.value)}
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">ETA</label>
                              <input type="time" value={wkEta} onChange={e => setWkEta(e.target.value)}
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">No. of Guests</label>
                              <input type="number" min="1" max="20" value={wkGuests} onChange={e => setWkGuests(parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Room Number <span className="text-red-400">*</span></label>
                              {(() => {
                                const typeRooms = rooms.filter(r => r.room_type === wkRoomType);
                                const selRoom = typeRooms.find(r => r.room_number === wkRoomNumber);
                                const isBlocked = selRoom && (selRoom.computed_status === 'occupied' || selRoom.computed_status === 'arriving');
                                const isWarn = selRoom && (selRoom.computed_status === 'dirty' || selRoom.computed_status === 'out_of_order');
                                if (typeRooms.length === 0) {
                                  return (
                                    <input type="text" value={wkRoomNumber} onChange={e => setWkRoomNumber(e.target.value)}
                                      placeholder="e.g. 201" autoComplete="off"
                                      className="w-full px-2 py-1 border border-white/15 bg-gray-600 text-white text-[11px] font-mono font-bold placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                                  );
                                }
                                return (
                                  <div>
                                    <select value={wkRoomNumber} onChange={e => setWkRoomNumber(e.target.value)}
                                      style={{ background: '#4B5563', color: 'white' }}
                                      className={`w-full px-2 py-1 border ${isBlocked ? 'border-red-400/50' : 'border-white/15'} text-[11px] font-mono font-bold outline-none focus:border-white/35 rounded-sm`}>
                                      <option value="" style={{ background: '#4B5563', color: 'rgba(255,255,255,0.35)' }}>— select room —</option>
                                      {typeRooms.map(r => {
                                        const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;
                                        const unavailable = r.computed_status === 'occupied' || r.computed_status === 'arriving';
                                        return (
                                          <option key={r.room_number} value={r.room_number} disabled={unavailable}
                                            style={{ background: unavailable ? '#3b1a1a' : '#4B5563', color: unavailable ? '#f87171' : 'white' }}>
                                            {`${r.room_number}${r.floor ? ` · F${r.floor}` : ''} — ${cfg.label}${unavailable ? ' ✗' : ''}`}
                                          </option>
                                        );
                                      })}
                                    </select>
                                    {selRoom && (
                                      <div className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${isBlocked ? 'text-red-300' : isWarn ? 'text-yellow-300' : 'text-green-300'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isBlocked ? 'bg-red-400' : isWarn ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                        {isBlocked ? `Unavailable — choose another` : isWarn ? `${selRoom.hk_status} — confirm ready` : `Available`}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Purpose of Visit</label>
                              <select value={wkPurpose} onChange={e => setWkPurpose(e.target.value)}
                                style={{ background: '#4B5563', color: wkPurpose ? 'white' : 'rgba(255,255,255,0.3)' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                {['', 'Leisure / Vacation', 'Business', 'Official / Government', 'Medical', 'Honeymoon / Anniversary', 'Transit', 'Others'].map(p => (
                                  <option key={p} value={p} style={{ background: '#4B5563', color: 'white' }}>{p || '— select —'}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Payment */}
                          <div className="flex items-center gap-2 mt-1 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Payment</span>
                            <div className="flex-1 h-px bg-white/15" />
                          </div>
                          <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                            <div className="col-span-2">
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Payment Method</label>
                              <select value={wkPaymentMethod} onChange={e => setWkPaymentMethod(e.target.value)}
                                style={{ background: '#4B5563', color: 'white' }}
                                className="w-full px-2 py-1 border border-white/15 text-[11px] outline-none focus:border-white/35 rounded-sm">
                                {['Cash', 'Credit Card', 'Debit Card', 'GCash', 'Maya', 'Bank Transfer', 'Check', 'Other'].map(m => (
                                  <option key={m} value={m} style={{ background: '#4B5563' }}>{m}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Deposit Amount</label>
                              <input type="number" min="0" step="0.01" value={wkDepositAmount} onChange={e => setWkDepositAmount(e.target.value)} placeholder="0.00"
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] font-mono placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div className="flex items-end pb-1">
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" checked={wkPayment} onChange={e => setWkPayment(e.target.checked)}
                                  className="w-3 h-3 accent-[#576CA8] cursor-pointer" />
                                <span className="text-[10px] text-white/50 uppercase tracking-wide">Collected</span>
                              </label>
                            </div>
                          </div>

                          {/* Remarks */}
                          <div className="flex items-center gap-2 mt-1 mb-1">
                            <span className="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase whitespace-nowrap">Remarks</span>
                            <div className="flex-1 h-px bg-white/15" />
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Special Requests</label>
                              <input type="text" value={wkSpecialReq} onChange={e => setWkSpecialReq(e.target.value)} placeholder="non-smoking, high floor, extra pillow..."
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                            <div>
                              <label className="block text-[9px] text-white/35 mb-0.5 uppercase tracking-widest">Front Desk Notes</label>
                              <input type="text" value={wkNotes} onChange={e => setWkNotes(e.target.value)} placeholder="Internal notes..."
                                className="w-full px-2 py-1 bg-gray-600 border border-white/15 text-white text-[11px] placeholder-white/20 focus:border-white/35 outline-none rounded-sm" />
                            </div>
                          </div>

                          <div className="h-px bg-white/10 mt-auto pt-2" />
                          {wkError && (
                            <div className="bg-red-500/15 border border-red-400/30 rounded px-3 py-1.5 text-[11px] text-red-300">{wkError}</div>
                          )}
                          <button onClick={submitWalkin} disabled={wkSubmitting}
                            className="w-full bg-gradient-to-r from-[#2D72C0] to-[#1a4f99] hover:opacity-90 disabled:opacity-50 text-white font-bold py-2 rounded transition-all text-[11px] tracking-[0.12em] uppercase border border-white/10">
                            {wkSubmitting ? 'Processing...' : 'Complete Walk-In Check-In'}
                          </button>

                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── Rooms View ── */}
              {fdView === 'rooms' && (
                <div>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-white/10">
                    {(() => {
                      const counts = rooms.reduce((acc, r) => { acc[r.computed_status] = (acc[r.computed_status] || 0) + 1; return acc; }, {});
                      const stats = [
                        { label: 'Total', key: 'all', value: rooms.length, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="1" width="4.5" height="4.5" rx="0.75" /><rect x="7.5" y="1" width="4.5" height="4.5" rx="0.75" /><rect x="1" y="7.5" width="4.5" height="4.5" rx="0.75" /><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="0.75" /></svg> },
                        { label: 'Available', key: 'available', value: counts.available || 0, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6.5l3 3 6-6" /></svg> },
                        { label: 'Occupied', key: 'occupied', value: counts.occupied || 0, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="6.5" cy="4" r="2" /><path d="M2 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" /></svg> },
                        { label: 'Due Out', key: 'due_out', value: counts.due_out || 0, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 6.5h6M8 4l3 2.5L8 9" /><path d="M4 2H2v9h2" /></svg> },
                        { label: 'Arriving', key: 'arriving', value: counts.arriving || 0, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6.5H2M5 4L2 6.5 5 9" /><path d="M9 2h2v9H9" /></svg> },
                        { label: 'Dirty', key: 'dirty', value: counts.dirty || 0, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l2-5 2 2 2-5 2 4" /></svg> },
                        { label: 'OOO', key: 'out_of_order', value: counts.out_of_order || 0, svg: <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3.5 3.5l6 6M9.5 3.5l-6 6" /></svg> },
                      ];
                      return (
                        <div className="flex items-center gap-1">
                          {stats.map(s => {
                            const active = roomFilter === s.key;
                            return (
                              <button key={s.label} onClick={() => setRoomFilter(s.key)}
                                className={`flex flex-col items-center px-2.5 py-1 rounded-lg transition-all ${active ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/8'}`}>
                                {s.svg}
                                <span className="text-base font-bold leading-tight">{s.value}</span>
                                <span className="text-[10px] font-medium">{s.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                    <div className="flex items-center gap-2">
                      <button onClick={fetchRooms} className="text-xs font-semibold text-white/50 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-all">↻ Refresh</button>
                      <button onClick={() => { setAddRoomOpen(v => !v); if (!newRoomType && wkRoomTypes.length > 0) setNewRoomType(wkRoomTypes[0].name); }}
                        className="text-xs font-semibold text-white bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 px-3 py-1.5 rounded-lg transition-all">
                        + Add Room
                      </button>
                    </div>
                  </div>

                  {/* Add Room Form */}
                  {addRoomOpen && (
                    <div className="mb-5 rounded-xl border border-white/15 p-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="text-xs font-semibold text-white/55 uppercase tracking-widest mb-3">New Room</div>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Room Number *</label>
                          <input type="text" value={newRoomNumber} onChange={e => setNewRoomNumber(e.target.value)}
                            placeholder="e.g. 201" autoComplete="off"
                            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/30 text-sm font-mono font-bold outline-none focus:border-white/40" />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Room Type</label>
                          <select value={newRoomType} onChange={e => setNewRoomType(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-white/20 text-white text-sm outline-none focus:border-white/40"
                            style={{ background: 'rgba(20,30,60,0.95)' }}>
                            <option value="" style={{ background: '#1a2744' }}>— select —</option>
                            {wkRoomTypes.map(rt => <option key={rt.id} value={rt.name} style={{ background: '#1a2744' }}>{rt.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1">Floor</label>
                          <input type="number" min="1" max="99" value={newRoomFloor} onChange={e => setNewRoomFloor(parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm outline-none focus:border-white/40" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addRoom} className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all">Save Room</button>
                        <button onClick={() => setAddRoomOpen(false)} className="text-white/50 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg bg-white/10 transition-all">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Room Grid */}
                  {roomsLoading ? (
                    <div className="text-center py-12 text-white/40">Loading rooms...</div>
                  ) : rooms.length === 0 ? (
                    <div className="text-center py-12 text-white/40 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-4xl mb-3">🏨</div>
                      <div className="font-semibold text-white/50 mb-1">No rooms tracked yet</div>
                      <div className="text-xs text-white/30 mb-4">Rooms appear here automatically after check-in, or add them manually.</div>
                      <button onClick={() => setAddRoomOpen(true)} className="text-xs font-bold text-white bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 px-4 py-2 rounded-lg">+ Add Room</button>
                    </div>
                  ) : (
                    <div>
                      {(() => {
                        const filtered = roomFilter === 'all' ? rooms : rooms.filter(r => r.computed_status === roomFilter);
                        if (filtered.length === 0) return (
                          <div className="text-center py-10 text-white/40 text-sm">No rooms match this filter.</div>
                        );
                        const byFloor = filtered.reduce((acc, r) => {
                          const f = r.floor || 1;
                          if (!acc[f]) acc[f] = [];
                          acc[f].push(r);
                          return acc;
                        }, {});
                        return Object.keys(byFloor).sort((a, b) => a - b).map(floor => (
                          <div key={floor} className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Floor {floor}</span>
                              <div className="flex-1 h-px bg-white/10" />
                              <span className="text-xs text-white/35">{byFloor[floor].length} room{byFloor[floor].length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5">
                              {byFloor[floor].map(r => <RoomCard key={r.room_number} r={r} />)}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* ── Calendar / Tape Chart View ── */}
              {fdView === 'calendar' && (() => {
                const COL_W = 34, LABEL_W = 90, ROW_H = 26;
                const DAY_ABR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                const startMs = new Date(tcFrom + 'T00:00:00').getTime();

                // Convert any date/datetime to local YYYY-MM-DD string
                const toLocalDate = (dt) => {
                  const d = new Date(dt);
                  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                };

                const tcDays = Array.from({ length: 30 }, (_, i) => {
                  const d = new Date(startMs + i * 86400000);
                  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
                });

                const tcGrouped = tcRooms.reduce((acc, r) => {
                  if (!acc[r.room_type]) acc[r.room_type] = [];
                  acc[r.room_type].push(r);
                  return acc;
                }, {});

                const getBar = (resv) => {
                  const ci = new Date(toLocalDate(resv.check_in_date) + 'T00:00:00').getTime();
                  // For checked-out reservations, use actual checkout date if earlier than booked
                  let effectiveOut = resv.check_out_date;
                  if (resv.status === 'checked_out' && resv.checked_out_at) {
                    const actualDate = toLocalDate(resv.checked_out_at);
                    const bookedDate = toLocalDate(resv.check_out_date);
                    if (actualDate < bookedDate) effectiveOut = resv.checked_out_at;
                  }
                  const co = new Date(toLocalDate(effectiveOut) + 'T00:00:00').getTime();
                  const endMs = startMs + 30 * 86400000;
                  if (co <= startMs || ci >= endMs) return null;
                  const l = Math.max(0, Math.round((ci - startMs) / 86400000));
                  const r = Math.min(30, Math.max(l + 1, Math.round((co - startMs) / 86400000)));
                  return { left: l * COL_W, width: (r - l) * COL_W - 2, clipped: ci < startMs };
                };

                const TC = {
                  pending: { bg: 'rgba(217,119,6,0.88)', text: '#fef9c3' },
                  confirmed: { bg: 'rgba(37,99,235,0.9)', text: 'white' },
                  checked_in: { bg: 'rgba(22,163,74,0.9)', text: 'white' },
                  checked_out: { bg: 'rgba(100,116,139,0.55)', text: 'rgba(255,255,255,0.45)' },
                  due_out: { bg: 'rgba(234,88,12,0.85)', text: 'white' },
                };

                const shiftDays = (n) => {
                  const d = new Date(tcFrom + 'T00:00:00');
                  d.setDate(d.getDate() + n);
                  setTcFrom(d.toISOString().slice(0, 10));
                  setTcSelectedRes(null);
                };

                // Match reservations to a row (type-view: by room_type; room-view: by room_number)
                const rowResv = (room) => tcTypeView
                  ? tcReservations.filter(r => r.room_type === room.room_type)
                  : tcReservations.filter(r => r.room_number === room.room_number);

                const isOccupied = (room, day) => tcTypeView
                  ? false  // type-level: always allow click (can't know exact occupancy without room#)
                  : tcReservations.some(r => r.room_number === room.room_number && toLocalDate(r.check_in_date) <= day && toLocalDate(r.check_out_date) > day);

                const handleCellClick = (room, day) => {
                  if (isOccupied(room, day)) return;
                  const co = new Date(day + 'T00:00:00');
                  co.setDate(co.getDate() + 1);
                  setWkRoomType(room.room_type);
                  if (!tcTypeView) setWkRoomNumber(room.room_number);
                  setWkCheckIn(day);
                  setWkCheckOut(co.toISOString().slice(0, 10));
                  setFdView('walkin');
                };

                // Month separator labels for top header
                const monthGroups = tcDays.reduce((acc, d) => {
                  const lbl = new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  if (!acc.length || acc[acc.length - 1].lbl !== lbl) acc.push({ lbl, count: 1 });
                  else acc[acc.length - 1].count++;
                  return acc;
                }, []);

                const totalW = LABEL_W + 30 * COL_W;
                const lastDay = tcDays[29];

                return (
                  <div>
                    {/* ── Toolbar ── */}
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => shiftDays(-14)} className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">← 2w</button>
                        <button onClick={() => shiftDays(-7)} className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">← 1w</button>
                        <span className="text-[11px] text-white/45 font-mono px-2 select-none">
                          {new Date(tcFrom + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' – '}
                          {new Date(lastDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <button onClick={() => shiftDays(7)} className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">1w →</button>
                        <button onClick={() => shiftDays(14)} className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/55 hover:text-white text-[11px] transition-colors">2w →</button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setTcFrom(today); setTcSelectedRes(null); }}
                          className="px-2.5 py-1 rounded border border-white/20 bg-white/10 text-white/70 hover:text-white text-[11px] font-semibold transition-colors">Today</button>
                        <button onClick={() => fetchTapeChart(tcFrom)}
                          className="px-2 py-1 rounded border border-white/15 bg-white/8 text-white/45 hover:text-white text-[11px] transition-colors">↺</button>
                      </div>
                    </div>

                    {/* ── Legend ── */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      {[['confirmed', 'Confirmed'], ['checked_in', 'In-House'], ['pending', 'Pending'], ['due_out', 'Due Out'], ['checked_out', 'Checked Out']].map(([s, lbl]) => (
                        <div key={s} className="flex items-center gap-1">
                          <div style={{ width: 9, height: 9, borderRadius: 2, background: TC[s]?.bg }} />
                          <span className="text-[9px] text-white/35">{lbl}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1">
                        <div style={{ width: 9, height: 9, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.2)' }} />
                        <span className="text-[9px] text-white/35">Available — click to book</span>
                      </div>
                    </div>

                    {/* ── Selected reservation strip ── */}
                    {tcSelectedRes && (() => {
                      const r = tcSelectedRes;
                      const effStatus = (r.status === 'checked_in' && r.check_out_date && r.check_out_date.slice(0, 10) === today) ? 'due_out' : r.status;
                      const clr = TC[effStatus] || TC.confirmed;
                      const nights = Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000);
                      return (
                        <div className="mb-3 px-3 py-2 rounded border flex items-center justify-between gap-3"
                          style={{ background: clr.bg, borderColor: 'rgba(255,255,255,0.15)' }}>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs font-bold" style={{ color: clr.text }}>{r.full_name}</span>
                            <span className="text-[11px] font-mono" style={{ color: clr.text, opacity: 0.8 }}>Rm {r.room_number}</span>
                            <span className="text-[11px]" style={{ color: clr.text, opacity: 0.75 }}>
                              {new Date(r.check_in_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' → '}
                              {new Date(r.check_out_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {' · '}{nights}n
                            </span>
                            {r.rate_code && <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.2)', color: clr.text }}>{r.rate_code}</span>}
                            <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,0,0,0.18)', color: clr.text }}>{r.status.replace('_', ' ')}</span>
                          </div>
                          <button onClick={() => setTcSelectedRes(null)} className="text-[11px] hover:opacity-70 flex-shrink-0" style={{ color: clr.text }}>✕</button>
                        </div>
                      );
                    })()}

                    {/* ── Chart ── */}
                    {tcLoading ? (
                      <div className="text-center py-12 text-white/30 text-sm">Loading chart...</div>
                    ) : tcRooms.length === 0 ? (
                      <div className="text-center py-12 text-white/30 text-sm">No room types found — add room types in Admin → Settings → Rooms first.</div>
                    ) : (
                      <>
                        {tcTypeView && (
                          <div className="mb-2 px-3 py-1.5 rounded text-[10px] text-amber-300/80 border border-amber-400/20 bg-amber-500/8">
                            Showing by room type — no individual rooms assigned yet. Rows show all bookings of that type. Add rooms via Walk-In or the Rooms tab for per-room view.
                          </div>
                        )}
                        <div className="overflow-x-auto rounded border border-white/10" style={{ background: 'rgba(0,0,0,0.3)' }}>
                          <div style={{ minWidth: totalW }}>

                            {/* Month row */}
                            <div className="flex" style={{ paddingLeft: LABEL_W, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                              {monthGroups.map((mg, i) => (
                                <div key={i} style={{ width: mg.count * COL_W }}
                                  className="px-2 py-0.5 text-[9px] font-bold text-white/25 uppercase tracking-widest">
                                  {mg.lbl}
                                </div>
                              ))}
                            </div>

                            {/* Day header row */}
                            <div className="flex" style={{ paddingLeft: LABEL_W, borderBottom: '2px solid rgba(255,255,255,0.12)' }}>
                              {tcDays.map(d => {
                                const dt = new Date(d + 'T00:00:00');
                                const isToday = d === today;
                                const isWknd = dt.getDay() === 0 || dt.getDay() === 6;
                                return (
                                  <div key={d} style={{
                                    width: COL_W, flexShrink: 0, height: 30,
                                    background: isToday ? 'rgba(87,108,168,0.4)' : 'transparent',
                                    borderRight: '1px solid rgba(255,255,255,0.05)'
                                  }}
                                    className="flex flex-col items-center justify-center">
                                    <span className={`text-[11px] font-bold leading-none ${isToday ? 'text-[#93b6f5]' : isWknd ? 'text-white/30' : 'text-white/55'}`}>
                                      {dt.getDate()}
                                    </span>
                                    <span className={`text-[8px] leading-none mt-0.5 ${isToday ? 'text-[#93b6f5]/60' : isWknd ? 'text-white/18' : 'text-white/22'}`}>
                                      {DAY_ABR[dt.getDay()]}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Room rows grouped by type */}
                            {Object.entries(tcGrouped).map(([type, typeRooms]) => (
                              <React.Fragment key={type}>
                                {/* Type header */}
                                <div className="flex items-center" style={{ height: 18, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                  <div style={{ width: LABEL_W }} className="px-2">
                                    <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.18em] truncate block" style={{ maxWidth: LABEL_W - 16 }}>{type}</span>
                                  </div>
                                </div>
                                {/* Unassigned row — reservations with no room_number for this type */}
                                {(() => {
                                  const unassigned = tcReservations.filter(r => !r.room_number && r.room_type === type);
                                  if (!unassigned.length) return null;
                                  return (
                                    <div className="flex" style={{ height: ROW_H, borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,180,0,0.03)' }}>
                                      <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)' }}
                                        className="flex items-center px-2">
                                        <span className="text-[9px] text-amber-400/60 italic">unassigned</span>
                                      </div>
                                      <div className="relative flex" style={{ width: 30 * COL_W, flexShrink: 0 }}>
                                        {tcDays.map(d => {
                                          const isToday = d === today;
                                          const isWknd = new Date(d + 'T00:00:00').getDay() === 0 || new Date(d + 'T00:00:00').getDay() === 6;
                                          return (
                                            <div key={d} style={{
                                              width: COL_W, flexShrink: 0, height: ROW_H,
                                              background: isToday ? 'rgba(87,108,168,0.1)' : isWknd ? 'rgba(255,255,255,0.012)' : 'transparent',
                                              borderRight: '1px solid rgba(255,255,255,0.035)'
                                            }} />
                                          );
                                        })}
                                        {unassigned.map(r => {
                                          const bar = getBar(r);
                                          if (!bar) return null;
                                          const effStatus = (r.status === 'checked_in' && r.check_out_date && r.check_out_date.slice(0, 10) === today) ? 'due_out' : r.status;
                                          const clr = TC[effStatus] || TC.confirmed;
                                          const isSelected = tcSelectedRes?.id === r.id;
                                          const nights = Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000);
                                          return (
                                            <div key={r.id}
                                              style={{
                                                position: 'absolute', top: 3, height: ROW_H - 6,
                                                left: bar.left + 1, width: bar.width,
                                                background: clr.bg, borderRadius: 3,
                                                border: '1px dashed rgba(255,255,255,0.3)',
                                                boxShadow: isSelected ? '0 0 0 1.5px white' : 'none',
                                                zIndex: 1, cursor: 'pointer', overflow: 'hidden'
                                              }}
                                              onClick={e => { e.stopPropagation(); setTcSelectedRes(isSelected ? null : r); }}
                                              title={`${r.full_name} · ${type} · ${nights}n · ${r.status.replace('_', ' ')} · No room assigned`}>
                                              {bar.width > 28 && (
                                                <span style={{
                                                  color: clr.text, fontSize: 10, fontWeight: 600,
                                                  paddingLeft: 5, lineHeight: `${ROW_H - 6}px`,
                                                  whiteSpace: 'nowrap', pointerEvents: 'none',
                                                  display: 'block', overflow: 'hidden'
                                                }}>
                                                  {r.full_name.split(',')[0]}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })()}
                                {/* Individual room rows */}
                                {typeRooms.map(room => {
                                  const roomResv = rowResv(room);
                                  return (
                                    <div key={room.room_number} className="flex"
                                      style={{ height: tcTypeView ? 32 : ROW_H, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                      {/* Label */}
                                      <div style={{ width: LABEL_W, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)' }}
                                        className="flex items-center px-2 gap-1.5">
                                        {tcTypeView ? (
                                          <span className="text-[10px] font-semibold text-white/55">{room.room_number}</span>
                                        ) : (
                                          <>
                                            <span className="text-[11px] font-mono font-bold text-white/90 truncate" style={{ maxWidth: LABEL_W - 26 }}>{room.room_number}</span>
                                            {room.floor && <span className="text-[9px] text-white/45 flex-shrink-0">F{room.floor}</span>}
                                          </>
                                        )}
                                      </div>
                                      {/* Date grid + bars */}
                                      <div className="relative flex" style={{ width: 30 * COL_W, flexShrink: 0 }}>
                                        {/* Clickable cells */}
                                        {tcDays.map(d => {
                                          const isToday = d === today;
                                          const isWknd = new Date(d + 'T00:00:00').getDay() === 0 || new Date(d + 'T00:00:00').getDay() === 6;
                                          const occupied = isOccupied(room, d);
                                          return (
                                            <div key={d} style={{
                                              width: COL_W, flexShrink: 0, height: tcTypeView ? 32 : ROW_H,
                                              background: isToday ? 'rgba(87,108,168,0.1)' : isWknd ? 'rgba(255,255,255,0.012)' : 'transparent',
                                              borderRight: '1px solid rgba(255,255,255,0.035)',
                                              cursor: occupied ? 'default' : 'cell'
                                            }}
                                              onClick={() => handleCellClick(room, d)}
                                            />
                                          );
                                        })}
                                        {/* Reservation bars */}
                                        {roomResv.map(r => {
                                          const bar = getBar(r);
                                          if (!bar) return null;
                                          const effStatus = (r.status === 'checked_in' && r.check_out_date && r.check_out_date.slice(0, 10) === today) ? 'due_out' : r.status;
                                          const clr = TC[effStatus] || TC.confirmed;
                                          const isSelected = tcSelectedRes?.id === r.id;
                                          const nights = Math.round((new Date(r.check_out_date) - new Date(r.check_in_date)) / 86400000);
                                          const rowH = tcTypeView ? 32 : ROW_H;
                                          return (
                                            <div key={r.id}
                                              style={{
                                                position: 'absolute', top: 3, height: rowH - 6,
                                                left: bar.left + 1, width: bar.width,
                                                background: clr.bg,
                                                borderRadius: bar.clipped ? '0 3px 3px 0' : 3,
                                                borderLeft: bar.clipped ? '2px dashed rgba(255,255,255,0.35)' : 'none',
                                                boxShadow: isSelected ? '0 0 0 1.5px white, 0 0 8px rgba(255,255,255,0.3)' : 'none',
                                                zIndex: 1, cursor: 'pointer', overflow: 'hidden'
                                              }}
                                              onClick={e => { e.stopPropagation(); setTcSelectedRes(isSelected ? null : r); }}
                                              title={`${r.full_name}${r.room_number ? ' · Rm ' + r.room_number : ''} · ${nights}n · ${r.status.replace('_', ' ')}`}>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                })}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* ── Room Detail Panel ── */}
              {selectedRoom && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoom(null)}>
                  <div className="bg-[#1a2340] border border-white/20 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                    onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    {(() => {
                      const cfg = roomStatusConfig[selectedRoom.computed_status] || roomStatusConfig.available;
                      const isActive = ['occupied', 'due_out', 'arriving'].includes(selectedRoom.computed_status);
                      return (
                        <>
                          <div className={`px-5 py-4 border-b border-white/10 ${cfg.bg}`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className={`text-3xl font-black font-mono ${cfg.text}`}>{selectedRoom.room_number}</div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded">{selectedRoom.room_type || 'Room'}</span>
                                  <span className="text-xs text-white/40">Floor {selectedRoom.floor}</span>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.pill}`}>{cfg.label}</span>
                                </div>
                              </div>
                              <button onClick={() => setSelectedRoom(null)} className="text-white/40 hover:text-white text-lg font-bold leading-none mt-1">✕</button>
                            </div>
                          </div>
                          <div className="p-5 space-y-4">
                            {/* Guest info */}
                            {isActive && selectedRoom.guest_name && (
                              <div className="bg-white/8 border border-white/10 rounded-xl p-3.5 space-y-1.5">
                                <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Current Guest</div>
                                <div className="font-semibold text-white">{selectedRoom.guest_name}</div>
                                <div className="flex items-center gap-3 text-xs text-white/50">
                                  <span>CI: {selectedRoom.check_in_date ? new Date(selectedRoom.check_in_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                  <span>→</span>
                                  <span>CO: {selectedRoom.check_out_date ? new Date(selectedRoom.check_out_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                                </div>
                                {selectedRoom.number_of_guests && <div className="text-xs text-white/40">{selectedRoom.number_of_guests} guest{selectedRoom.number_of_guests !== 1 ? 's' : ''}</div>}
                              </div>
                            )}

                            {/* HK Status */}
                            <div>
                              <div className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2.5">Housekeeping Status</div>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { status: 'clean', label: '✓ Clean', active: 'bg-green-500/25 border-green-400/50 text-green-200' },
                                  { status: 'dirty', label: '🧹 Dirty', active: 'bg-yellow-500/25 border-yellow-400/50 text-yellow-200' },
                                  { status: 'inspected', label: '🔍 Inspected', active: 'bg-teal-500/25 border-teal-400/50 text-teal-200' },
                                  { status: 'out_of_order', label: '⚠️ Out of Order', active: 'bg-red-500/25 border-red-400/50 text-red-200' },
                                ].map(({ status, label, active }) => {
                                  const isCurrent = selectedRoom.hk_status === status;
                                  return (
                                    <button key={status}
                                      onClick={() => updateHkStatus(selectedRoom.room_number, status)}
                                      disabled={hkUpdating === selectedRoom.room_number}
                                      className={`px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${isCurrent ? active : 'border-white/15 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                              {(selectedRoom.computed_status === 'occupied' || selectedRoom.computed_status === 'due_out') && selectedRoom.reservation_id && (
                                <button
                                  onClick={() => { setCheckoutConfirmId(selectedRoom.reservation_id); setSelectedRoom(null); }}
                                  className="flex-1 bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-red-300 text-xs font-bold py-2.5 rounded-xl transition-all">
                                  Check Out Guest
                                </button>
                              )}
                              <button
                                onClick={() => removeRoom(selectedRoom.room_number)}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/15 text-white/40 hover:text-white/60 text-xs font-semibold py-2.5 rounded-xl transition-all">
                                Remove Room
                              </button>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
                , document.body)}

              {/* ── Check-In Wizard Modal ── */}
              {wizardOpen && wizardReservation && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                    <div className="bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] px-6 py-4 flex items-center justify-between">
                      <div>
                        <div className="text-white font-bold">Check-In Wizard</div>
                        <div className="text-white/70 text-xs">{wizardReservation.full_name} · #{wizardReservation.id}</div>
                      </div>
                      {!wizardSuccess && (
                        <button onClick={closeWizard} className="text-white/70 hover:text-white text-lg font-bold transition-colors">✕</button>
                      )}
                    </div>
                    <div className="p-6">
                      {wizardSuccess ? (
                        <WizardSuccessCard />
                      ) : (
                        <>
                          <WizardStepBar />
                          {wizardStep === 1 && <WizardStep1 />}
                          {wizardStep === 2 && <WizardStep2 />}
                          {wizardStep === 3 && <WizardStep3 />}
                          {wizardStep === 4 && <WizardStep4 />}
                          {wizardError && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-medium">
                              {wizardError}
                            </div>
                          )}
                          <div className="flex gap-3 mt-4">
                            {wizardStep > 1 && (
                              <button
                                onClick={() => { setWizardStep(s => s - 1); setWizardError(''); }}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                              >
                                Back
                              </button>
                            )}
                            {wizardStep < 4 ? (
                              <button
                                onClick={() => { setWizardStep(s => s + 1); setWizardError(''); }}
                                disabled={wizardStep === 1 && !wizardIdVerified}
                                className="flex-1 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-2.5 rounded-xl transition-colors"
                              >
                                Next
                              </button>
                            ) : (
                              <button
                                onClick={submitCheckin}
                                disabled={!wizardPayment || wizardSubmitting}
                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors"
                              >
                                {wizardSubmitting ? 'Processing...' : 'Complete Check-In'}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                , document.body)}

              {/* ── Checkout Confirm Modal ── */}
              {checkoutConfirmId && ReactDOM.createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                    <div className="text-center mb-5">
                      <div className="text-4xl mb-3">🔑</div>
                      <h3 className="text-lg font-bold text-gray-900">Confirm Check-Out</h3>
                      <p className="text-sm text-gray-500 mt-1">Are you sure you want to check out this guest? This action cannot be undone.</p>
                    </div>
                    {/* Folio balance */}
                    {checkoutFolioBalance === null ? (
                      <div className="mb-4 text-center text-xs text-gray-400">Checking folio balance...</div>
                    ) : checkoutFolioBalance <= 0 ? (
                      <div className="mb-4 flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                        <span className="text-green-600 text-sm font-semibold">Folio settled</span>
                      </div>
                    ) : (
                      <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                        <div className="text-center text-sm font-bold text-amber-700">Outstanding Balance: ₱{Number(checkoutFolioBalance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                        <div className="text-center text-xs text-amber-500 mt-0.5">Please settle folio before checkout</div>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCheckoutConfirmId(null)}
                        disabled={checkoutSubmitting}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitCheckout(checkoutConfirmId)}
                        disabled={checkoutSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white font-bold py-2.5 rounded-xl transition-colors"
                      >
                        {checkoutSubmitting ? 'Processing...' : 'Check Out'}
                      </button>
                    </div>
                  </div>
                </div>
                , document.body)}
            </div>
          </div>
        </div>
      </div>
      {/* ── Transfer Modal ── */}
      {transferGuest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setTransferGuest(null)}>
          <div
            className="rounded-2xl border border-white/20 shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'rgba(20,25,40,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div>
                <div className="text-white font-bold text-lg tracking-tight">Room Transfer / Upgrade</div>
                <div className="text-white/70 text-xs mt-0.5">Assign a new room for this guest</div>
              </div>
              <button onClick={() => setTransferGuest(null)} className="text-white/70 hover:text-white text-lg font-bold transition-colors leading-none">✕</button>
            </div>
            {transferSuccess ? (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-green-500/25 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-green-300 font-bold">✓</span>
                </div>
                <div className="text-white font-bold text-lg mb-1">{transferSuccess}</div>
                <div className="text-white/60 text-sm">Previous room marked dirty for housekeeping</div>
                <button onClick={() => setTransferGuest(null)} className="mt-6 w-full bg-white/15 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">Close</button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Current guest info */}
                <div
                  className="border border-white/20 rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.12)' }}
                >
                  <div>
                    <div className="text-[10px] text-white/40 font-semibold uppercase tracking-wide mb-0.5">
                      Current Assignment
                    </div>
                    <div className="font-semibold text-white text-sm">{transferGuest?.full_name}</div>
                    <div className="text-xs text-white/50 mt-0.5">
                      {transferGuest?.room_type} · Check-out {fmtDate(transferGuest?.check_out_date)}
                    </div>
                  </div>
                </div>

                {/* Room Type Filter */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">
                    Room Type Filter
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setTransferRoomType('');
                        setTransferRoomNumber('');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${transferRoomType === ''
                        ? 'bg-teal-500/50 border-teal-400/60 text-white shadow-sm'
                        : 'bg-white/15 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40 hover:text-white'
                        }`}
                    >
                      All Available
                    </button>
                    {wkRoomTypes.map((rt) => {
                      const isSelected = transferRoomType === rt.name;
                      const isCurrent = rt.name === transferGuest?.room_type;
                      return (
                        <button
                          key={rt.id}
                          onClick={() => {
                            setTransferRoomType(rt.name);
                            setTransferRoomNumber('');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isSelected
                            ? 'bg-blue-500/50 border-blue-400/60 text-white shadow-sm'
                            : 'bg-white/15 border-white/20 text-white/70 hover:bg-white/20 hover:border-white/40 hover:text-white'
                            }`}
                        >
                          {rt.name}
                          {isCurrent && <span className={isSelected ? ' text-white/50' : ' text-white/40'}> (current)</span>}
                          {isSelected && !isCurrent && <span className="ml-1">↑</span>}
                        </button>
                      );
                    })}
                  </div>
                  {transferRoomType && transferRoomType !== transferGuest?.room_type && (
                    <p className="mt-2 text-xs text-blue-300 font-medium">Filtering: {transferRoomType}</p>
                  )}
                </div>

                {/* Room selection */}
                <div>
                  <label className="block text-xs font-semibold text-white/60 uppercase tracking-wide mb-2">
                    Select Room
                  </label>
                  {(() => {
                    const typeRooms = transferRoomType
                      ? rooms.filter((r) => r.room_type === transferRoomType)
                      : rooms.filter((r) => r.computed_status === 'available' || r.computed_status === 'inspected');

                    if (typeRooms.length === 0) {
                      return (
                        <div>
                          <input
                            type="text"
                            value={transferRoomNumber}
                            onChange={(e) => setTransferRoomNumber(e.target.value)}
                            placeholder="Enter room number (e.g. 301)"
                            autoComplete="off"
                            className="w-full px-3 py-2.5 rounded-lg border border-white/20 bg-white/15 text-white placeholder-white/40 text-sm font-mono font-bold outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all"
                          />
                          <div className="text-xs text-white/40 mt-2 italic">
                            {transferRoomType
                              ? 'No available rooms of this type. Enter room number manually.'
                              : 'No available rooms.'}
                          </div>
                        </div>
                      );
                    }

                    const dotColors = {
                      available: 'bg-green-400',
                      occupied: 'bg-blue-400',
                      due_out: 'bg-orange-400',
                      arriving: 'bg-purple-400',
                      dirty: 'bg-yellow-400',
                      inspected: 'bg-teal-400',
                      out_of_order: 'bg-red-400',
                    };

                    return (
                      <div className="max-h-64 overflow-y-auto pr-2 space-y-1.5">
                        {typeRooms.map((r) => {
                          const isCurrent = r.room_number === transferGuest?.room_number;
                          const isAvailable = r.computed_status === 'available' || r.computed_status === 'inspected';
                          const isSelected = transferRoomNumber === r.room_number;
                          const cfg = roomStatusConfig[r.computed_status] || roomStatusConfig.available;

                          return (
                            <button
                              key={r.room_number}
                              disabled={!isAvailable || isCurrent}
                              onClick={() => setTransferRoomNumber(isSelected ? '' : r.room_number)}
                              title={`Room ${r.room_number} — ${cfg.label}`}
                              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${isSelected
                                ? 'bg-blue-500/40 border-blue-400/60'
                                : isCurrent
                                  ? 'bg-white/10 border-white/10 opacity-50 cursor-not-allowed'
                                  : !isAvailable
                                    ? 'bg-white/10 border-white/10 opacity-40 cursor-not-allowed'
                                    : 'bg-white/15 border-white/20 hover:bg-white/20 hover:border-white/40'
                                }`}
                            >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColors[r.computed_status] || 'bg-gray-300'}`} />
                              <div className="flex-1">
                                <span
                                  className={`font-mono font-bold text-sm ${isSelected ? 'text-white' : isCurrent || !isAvailable ? 'text-white/40' : 'text-white'
                                    }`}
                                >
                                  Room {r.room_number}
                                </span>
                                {r.floor && <span className="text-[10px] text-white/40 ml-2">Floor {r.floor}</span>}
                              </div>
                              <span className={`text-[10px] font-semibold ${isSelected ? 'text-white' : 'text-white/50'}`}>
                                {cfg.label}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-white/20 text-white/70 px-2 py-0.5 rounded">Current</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Transfer summary */}
                {transferRoomNumber && (
                  <div
                    className="border border-white/20 rounded-xl px-5 py-3 flex items-center gap-4"
                    style={{ background: 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <div className="text-center min-w-[3rem]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">From</div>
                      <div className="text-2xl font-black font-mono text-white/60">{transferGuest?.room_number}</div>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="h-px flex-1 bg-white/15" />
                      <span className="text-white/60 font-bold text-base">→</span>
                      <div className="h-px flex-1 bg-white/15" />
                    </div>
                    <div className="text-center min-w-[3rem]">
                      <div className="text-[10px] text-white/40 uppercase tracking-wide font-medium">To</div>
                      <div className="text-2xl font-black font-mono text-blue-300">{transferRoomNumber}</div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {transferError && (
                  <div className="bg-red-500/15 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-300">
                    {transferError}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setTransferGuest(null)}
                    className="flex-1 bg-white/12 hover:bg-white/18 border border-white/15 text-white/70 hover:text-white text-sm font-semibold py-2.5 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitTransfer}
                    disabled={!transferRoomNumber?.trim() || transferSubmitting}
                    className="flex-1 bg-gradient-to-br from-[#55A2F5] to-[#2D72C0] hover:opacity-90 disabled:opacity-40 text-white text-sm font-bold py-2.5 rounded-xl transition-all"
                  >
                    {transferSubmitting
                      ? 'Moving…'
                      : transferRoomType !== transferGuest?.room_type
                        ? '↑ Upgrade & Transfer'
                        : 'Transfer Room'}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Guest Profile Modal ── */}
      <GuestProfileModal />

      {/* ── Folio Modal ── */}
      {folioOpen && folioRes && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setFolioOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Guest Folio</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {folioRes.full_name} &nbsp;&middot;&nbsp; Room {folioRes.room_number || '—'} &nbsp;&middot;&nbsp; {folioRes.room_type}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {fmtDate(folioRes.check_in_date)} &rarr; {fmtDate(folioRes.check_out_date)} &nbsp;({nightsCount(folioRes)} nights)
                </p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <button onClick={printFolio} title="Print folio"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">
                  🖨 Print
                </button>
                <button onClick={sendFolioEmail} disabled={folioEmailSending} title="Email folio to guest"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all disabled:opacity-50">
                  {folioEmailSending ? '...' : '✉ Email'}
                </button>
                <button onClick={() => setFolioOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none ml-1">&#10005;</button>
              </div>
            </div>
            {folioEmailMsg && (
              <div className={`px-6 py-2 text-xs font-medium text-center ${folioEmailMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {folioEmailMsg}
              </div>
            )}

            {folioLoading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 py-12">Loading folio...</div>
            ) : folioError ? (
              <div className="flex-1 flex items-center justify-center text-red-500 py-12">{folioError}</div>
            ) : (
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                {/* Balance summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">Total Charges</div>
                    <div className="text-lg font-bold text-blue-700">&#8369;{Number(folioTotals.charges).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-green-500 font-semibold uppercase tracking-wide mb-1">Total Payments</div>
                    <div className="text-lg font-bold text-green-700">&#8369;{Number(folioTotals.payments).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${folioTotals.balance > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${folioTotals.balance > 0 ? 'text-red-500' : 'text-gray-400'}`}>Balance Due</div>
                    <div className={`text-lg font-bold ${folioTotals.balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>&#8369;{Number(folioTotals.balance).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>

                {/* Charges */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Charges</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="grid text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '1fr 2fr 50px 80px 80px 36px' }}>
                      <span>Type</span><span>Description</span><span className="text-center">Qty</span><span className="text-right">Price</span><span className="text-right">Amount</span><span></span>
                    </div>
                    {folioItems.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">No charges posted yet</div>
                    ) : folioItems.map(item => (
                      <div key={item.id} className={`grid px-3 py-2.5 text-sm items-center border-b border-gray-50 last:border-0 ${item.voided ? 'opacity-40' : 'hover:bg-gray-50'}`} style={{ gridTemplateColumns: '1fr 2fr 50px 80px 80px 36px' }}>
                        <span className={`font-medium text-gray-700 ${item.voided ? 'line-through' : ''}`}>{item.charge_type}</span>
                        <span className={`text-gray-500 truncate ${item.voided ? 'line-through' : ''}`}>{item.description || '—'}</span>
                        <span className="text-center text-gray-500">{item.quantity}</span>
                        <span className="text-right text-gray-500">&#8369;{Number(item.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        <span className={`text-right font-semibold ${item.voided ? 'text-gray-400 line-through' : 'text-gray-800'}`}>&#8369;{Number(item.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        <div className="flex justify-end">
                          {!item.voided
                            ? <button onClick={() => voidCharge(item.id)} title="Void" className="text-red-300 hover:text-red-500 transition-colors">&#10005;</button>
                            : <span className="text-[10px] text-gray-400">void</span>}
                        </div>
                      </div>
                    ))}
                    {folioItems.filter(i => !i.voided).length > 0 && (
                      <div className="flex justify-end px-3 py-2 border-t border-gray-100 bg-gray-50">
                        <span className="text-xs text-gray-400 mr-2">Total Charges</span>
                        <span className="text-sm font-bold text-gray-800">&#8369;{Number(folioTotals.charges).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 bg-blue-50 rounded-xl p-3 space-y-2">
                    <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Post Charge</div>
                    <div className="flex gap-2 flex-wrap">
                      <select value={fcType} onChange={e => setFcType(e.target.value)} className="px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none">
                        {['Room Charge', 'Food & Beverage', 'Minibar', 'Laundry', 'Parking', 'Damage', 'Miscellaneous'].map(t => <option key={t}>{t}</option>)}
                      </select>
                      <input type="text" value={fcDesc} onChange={e => setFcDesc(e.target.value)} placeholder="Description" className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                      <input type="number" value={fcQty} onChange={e => setFcQty(e.target.value)} min="1" placeholder="Qty" className="w-14 px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                      <input type="number" value={fcPrice} onChange={e => setFcPrice(e.target.value)} placeholder="Unit Price" className="w-28 px-2 py-1.5 text-sm border border-blue-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                      <button onClick={addCharge} disabled={fcSaving} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                        {fcSaving ? '...' : '+ Add'}
                      </button>
                    </div>
                    {fcError && <p className="text-xs text-red-500">{fcError}</p>}
                  </div>
                </div>

                {/* Payments */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Payments</h3>
                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="grid text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2 bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: '1fr 1fr 100px 90px 36px' }}>
                      <span>Method</span><span>Reference</span><span>Date</span><span className="text-right">Amount</span><span></span>
                    </div>
                    {folioPayments.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">No payments recorded yet</div>
                    ) : folioPayments.map(pay => (
                      <div key={pay.id} className={`grid px-3 py-2.5 text-sm items-center border-b border-gray-50 last:border-0 ${pay.voided ? 'opacity-40' : 'hover:bg-gray-50'}`} style={{ gridTemplateColumns: '1fr 1fr 100px 90px 36px' }}>
                        <span className={`font-medium text-gray-700 ${pay.voided ? 'line-through' : ''}`}>{pay.payment_method}</span>
                        <span className="text-gray-500 truncate">{pay.reference || '—'}</span>
                        <span className="text-gray-400 text-xs">{new Date(pay.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className={`text-right font-semibold ${pay.voided ? 'text-gray-400 line-through' : 'text-green-700'}`}>&#8369;{Number(pay.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                        <div className="flex justify-end">
                          {!pay.voided
                            ? <button onClick={() => voidPayment(pay.id)} title="Void" className="text-red-300 hover:text-red-500 transition-colors">&#10005;</button>
                            : <span className="text-[10px] text-gray-400">void</span>}
                        </div>
                      </div>
                    ))}
                    {folioPayments.filter(p => !p.voided).length > 0 && (
                      <div className="flex justify-end px-3 py-2 border-t border-gray-100 bg-gray-50">
                        <span className="text-xs text-gray-400 mr-2">Total Paid</span>
                        <span className="text-sm font-bold text-green-700">&#8369;{Number(folioTotals.payments).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 bg-green-50 rounded-xl p-3 space-y-2">
                    <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">Record Payment</div>
                    <div className="flex gap-2 flex-wrap">
                      <select value={fpMethod} onChange={e => setFpMethod(e.target.value)} className="px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none">
                        {['Cash', 'Credit Card', 'Debit Card', 'GCash', 'Bank Transfer', 'Other'].map(m => <option key={m}>{m}</option>)}
                      </select>
                      <input type="number" value={fpAmount} onChange={e => setFpAmount(e.target.value)} placeholder="Amount" className="w-32 px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                      <input type="text" value={fpRef} onChange={e => setFpRef(e.target.value)} placeholder="Reference / Note" className="flex-1 min-w-[100px] px-2 py-1.5 text-sm border border-green-200 rounded-lg bg-white text-gray-700 focus:outline-none" />
                      <button onClick={addPayment} disabled={fpSaving} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors">
                        {fpSaving ? '...' : '+ Pay'}
                      </button>
                    </div>
                    {fpError && <p className="text-xs text-red-500">{fpError}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}