import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'mw';

interface Translation {
  [key: string]: string;
}

interface Translations {
  [key: string]: Translation;
}

const translations: Translations = {
  en: {
    // Navigation
    orders: 'Orders',
    leaders: 'Leaders',
    dashboard: 'Dashboard',
    artisanRecords: 'Artisan Records',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    
    // Auth
    email: 'Email',
    password: 'Password',
    name: 'Name',
    phone: 'Phone Number',
    username: 'Username',
    adminKey: 'Admin Key',
    loginAsLeader: 'Login as Leader',
    loginAsAdmin: 'Login as Admin',
    registerLeader: 'Register as Leader',
    registerAdmin: 'Register as Admin',
    
    // Dashboard
    leaderDashboard: 'Leader Dashboard',
    adminDashboard: 'Admin Dashboard',
    currentOrderId: 'Current Order ID',
    exportCsv: 'Export to CSV',
    starPerformer: 'Star Performer',
    
    // Work Types
    toyMaking: 'Toy Making',
    embroidering: 'Embroidering',
    bagMaking: 'Bag Making',
    design: 'Design',
    assembly: 'Assembly',
    painting: 'Painting',
    stitching: 'Stitching',
    finishing: 'Finishing',
    cutting: 'Cutting',
    
    // Orders
    addNewOrder: 'Add New Order',
    orderType: 'Order Type',
    numberOfProducts: 'Number of Products',
    deadline: 'Deadline',
    leader: 'Leader',
    toys: 'Toys',
    embroidery: 'Embroidery',
    bags: 'Bags',
    active: 'Active',
    pending: 'Pending',
    
    // Performance
    worst: 'Worst',
    okay: 'Okay',
    great: 'Great',
    performanceMetric: 'Performance Metric',
    productsCreated: 'Products Created',
    qualityCheck: 'Quality Check',
    amountToPay: 'Amount to Pay',
    skillsAdded: 'Skills Added',
    
    // General
    village: 'Village',
    location: 'Location',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    filter: 'Filter',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  },
  
  hi: {
    // Navigation
    orders: 'ऑर्डर',
    leaders: 'नेता',
    dashboard: 'डैशबोर्ड',
    artisanRecords: 'कारीगर रिकॉर्ड',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    register: 'पंजीकरण',
    
    // Auth
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    phone: 'फोन नंबर',
    username: 'उपयोगकर्ता नाम',
    adminKey: 'एडमिन की',
    loginAsLeader: 'नेता के रूप में लॉगिन करें',
    loginAsAdmin: 'एडमिन के रूप में लॉगिन करें',
    registerLeader: 'नेता के रूप में पंजीकरण करें',
    registerAdmin: 'एडमिन के रूप में पंजीकरण करें',
    
    // Dashboard
    leaderDashboard: 'नेता डैशबोर्ड',
    adminDashboard: 'एडमिन डैशबोर्ड',
    currentOrderId: 'वर्तमान ऑर्डर आईडी',
    exportCsv: 'CSV में निर्यात करें',
    starPerformer: 'स्टार परफॉर्मर',
    
    // Work Types
    toyMaking: 'खिलौना बनाना',
    embroidering: 'कढ़ाई',
    bagMaking: 'बैग बनाना',
    design: 'डिज़ाइन',
    assembly: 'असेंबली',
    painting: 'पेंटिंग',
    stitching: 'सिलाई',
    finishing: 'फिनिशिंग',
    cutting: 'कटाई',
    
    // Orders
    addNewOrder: 'नया ऑर्डर जोड़ें',
    orderType: 'ऑर्डर प्रकार',
    numberOfProducts: 'उत्पादों की संख्या',
    deadline: 'समय सीमा',
    leader: 'नेता',
    toys: 'खिलौने',
    embroidery: 'कढ़ाई',
    bags: 'बैग',
    active: 'सक्रिय',
    pending: 'लंबित',
    
    // Performance
    worst: 'सबसे खराब',
    okay: 'ठीक है',
    great: 'बहुत अच्छा',
    performanceMetric: 'प्रदर्शन मेट्रिक',
    productsCreated: 'बनाए गए उत्पाद',
    qualityCheck: 'गुणवत्ता जांच',
    amountToPay: 'भुगतान राशि',
    skillsAdded: 'जोड़े गए कौशल',
    
    // General
    village: 'गांव',
    location: 'स्थान',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    submit: 'जमा करें',
    filter: 'फिल्टर',
    search: 'खोजें',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता'
  },
  
  mw: {
    // Navigation
    orders: 'ऑर्डर',
    leaders: 'नेता',
    dashboard: 'डैशबोर्ड',
    artisanRecords: 'कारीगर रिकॉर्ड',
    login: 'लॉगिन',
    logout: 'लॉगआउट',
    register: 'पंजीकरण',
    
    // Auth (Marwadi - simplified for demo)
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    phone: 'फोन नंबर',
    username: 'यूजर नाम',
    adminKey: 'एडमिन की',
    loginAsLeader: 'नेता रो लॉगिन',
    loginAsAdmin: 'एडमिन रो लॉगिन',
    registerLeader: 'नेता रो रजिस्टर',
    registerAdmin: 'एडमिन रो रजिस्टर',
    
    // Dashboard
    leaderDashboard: 'नेता डैशबोर्ड',
    adminDashboard: 'एडमिन डैशबोर्ड',
    currentOrderId: 'हाल रो ऑर्डर ID',
    exportCsv: 'CSV में निकालो',
    starPerformer: 'बेस्ट वर्कर',
    
    // Work Types
    toyMaking: 'खेल बनाणो',
    embroidering: 'कढ़ाई',
    bagMaking: 'बैग बनाणो',
    design: 'डिज़ाइन',
    assembly: 'जोड़णो',
    painting: 'रंग',
    stitching: 'सिलाई',
    finishing: 'पूरो करणो',
    cutting: 'काटणो',
    
    // Orders
    addNewOrder: 'नवो ऑर्डर',
    orderType: 'ऑर्डर रो किसम',
    numberOfProducts: 'सामान री गिनती',
    deadline: 'आखरी दिन',
    leader: 'नेता',
    toys: 'खेल',
    embroidery: 'कढ़ाई',
    bags: 'बैग',
    active: 'चालू',
    pending: 'बाकी',
    
    // Performance
    worst: 'सबसे खराब',
    okay: 'ठीक',
    great: 'बहुत बढ़िया',
    performanceMetric: 'काम री गुणवत्ता',
    productsCreated: 'बणायो सामान',
    qualityCheck: 'क्वालिटी चेक',
    amountToPay: 'देणे री रकम',
    skillsAdded: 'नई स्किल',
    
    // General
    village: 'गांव',
    location: 'जगह',
    save: 'सेव करो',
    cancel: 'रद्द',
    submit: 'भेजो',
    filter: 'फिल्टर',
    search: 'ढूंढो',
    loading: 'लोड हो रहो...',
    error: 'गलती',
    success: 'सफल'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('artisan_language') as Language;
    if (storedLanguage && ['en', 'hi', 'mw'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  const setLanguageAndStore = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('artisan_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: setLanguageAndStore, t }}>
      {children}
    </LanguageContext.Provider>
  );
};