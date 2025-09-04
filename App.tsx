import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { FoodItem, Contribution, User, FoodCategory } from './types';
import { db } from './services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import Header from './components/Header';
import InventoryView from './components/InventoryView';
import ContributionsView from './components/ContributionsView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import ApiKeyModal from './components/ApiKeyModal';
import { TABS } from './constants';

// ...eliminar mocks, usar Firestore...


interface AppState {
  currentUser: User | null;
  users: User[];
  inventory: FoodItem[];
  contributions: Contribution[];
  activeTab: string;
}

type Action =
  | { type: 'SET_INITIAL_DATA'; payload: { users: User[]; inventory: FoodItem[]; contributions: Contribution[] } }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_INVENTORY'; payload: React.SetStateAction<FoodItem[]> }
  | { type: 'SET_CONTRIBUTIONS'; payload: React.SetStateAction<Contribution[]> };

const initialState: AppState = {
  currentUser: null,
  users: [],
  inventory: [],
  contributions: [],
  activeTab: TABS[0],
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_INITIAL_DATA':
      return {
        ...state,
        users: action.payload.users,
        inventory: action.payload.inventory,
        contributions: action.payload.contributions,
      };
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload,
        activeTab: action.payload.id === 'user-jairo' ? TABS[1] : TABS[0],
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
      };
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload,
      };
    case 'SET_INVENTORY':
      return {
        ...state,
        inventory: typeof action.payload === 'function' ? action.payload(state.inventory) : action.payload,
      };
    case 'SET_CONTRIBUTIONS':
      return {
        ...state,
        contributions: typeof action.payload === 'function' ? action.payload(state.contributions) : action.payload,
      };
    default:
      return state;
  }
};

function App() {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { currentUser, users, inventory, contributions, activeTab } = state;

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
  });
  
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyError, setApiKeyError] = useState<string | undefined>();

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = useCallback((newApiKey: string) => {
    localStorage.setItem('gemini_api_key', newApiKey);
    setApiKey(newApiKey);
    setApiKeyModalOpen(false);
    setApiKeyError(undefined);
  }, []);

  const handleOpenApiKeyModal = useCallback((error?: string) => {
    if (error?.includes("La clave de API no es válida")) {
      localStorage.removeItem('gemini_api_key');
      setApiKey(null);
    }
    setApiKeyError(error);
    setApiKeyModalOpen(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = useCallback(() => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    // Firestore listeners para usuarios
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      dispatch({ type: 'SET_INITIAL_DATA', payload: { users, inventory: state.inventory, contributions: state.contributions } });
    });
    // Firestore listeners para inventario
    const unsubInventory = onSnapshot(query(collection(db, 'inventory'), orderBy('addedAt', 'desc')), (snapshot) => {
      const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), addedAt: new Date(doc.data().addedAt), consumedAt: doc.data().consumedAt ? new Date(doc.data().consumedAt) : null } as FoodItem));
      dispatch({ type: 'SET_INITIAL_DATA', payload: { users: state.users, inventory, contributions: state.contributions } });
    });
    // Firestore listeners para aportes
    const unsubContributions = onSnapshot(query(collection(db, 'contributions'), orderBy('date', 'desc')), (snapshot) => {
      const contributions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: new Date(doc.data().date) } as Contribution));
      dispatch({ type: 'SET_INITIAL_DATA', payload: { users: state.users, inventory: state.inventory, contributions } });
    });
    return () => {
      unsubUsers();
      unsubInventory();
      unsubContributions();
    };
  }, []);

  const handleLogin = useCallback((user: User) => {
    dispatch({ type: 'LOGIN', payload: user });
  }, []);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  }, []);

  // Actualizar inventario en Firestore
  const setInventory = useCallback(async (value: React.SetStateAction<FoodItem[]>) => {
    if (typeof value === 'function') {
      // No soportado en Firestore, solo operaciones directas
      return;
    }
    // Agregar/actualizar/eliminar en Firestore
    for (const item of value) {
      if (!item.id) {
        await addDoc(collection(db, 'inventory'), { ...item, addedAt: item.addedAt.toISOString(), consumedAt: item.consumedAt ? item.consumedAt.toISOString() : null });
      } else {
        await updateDoc(doc(db, 'inventory', item.id), { ...item, addedAt: item.addedAt.toISOString(), consumedAt: item.consumedAt ? item.consumedAt.toISOString() : null });
      }
    }
  }, []);

  // Actualizar aportes en Firestore
  const setContributions = useCallback(async (value: React.SetStateAction<Contribution[]>) => {
    if (typeof value === 'function') {
      // No soportado en Firestore, solo operaciones directas
      return;
    }
    for (const c of value) {
      if (!c.id) {
        await addDoc(collection(db, 'contributions'), { ...c, date: c.date.toISOString() });
      } else {
        await updateDoc(doc(db, 'contributions', c.id), { ...c, date: c.date.toISOString() });
      }
    }
  }, []);

  if (!currentUser) {
    return <LoginView users={users} onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Inventario':
        return <InventoryView inventory={inventory} setInventory={setInventory} currentUser={currentUser} users={users} />;
      case 'Aportes':
        return <ContributionsView contributions={contributions} setContributions={setContributions} users={users} currentUser={currentUser} />;
      case 'Dashboard':
      default:
        return <DashboardView 
                  inventory={inventory} 
                  contributions={contributions} 
                  users={users}
                  apiKey={apiKey}
                  onApiKeyNeeded={handleOpenApiKeyModal}
                />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isApiKeyModalOpen && (
        <ApiKeyModal
          onSave={handleSaveApiKey}
          onClose={() => setApiKeyModalOpen(false)}
          initialError={apiKeyError}
        />
      )}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
        onManageApiKey={() => handleOpenApiKeyModal()}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;