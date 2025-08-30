import React, { useReducer, useEffect, useCallback, useState } from 'react';
import { FoodItem, Contribution, User, FoodCategory } from './types';
import Header from './components/Header';
import InventoryView from './components/InventoryView';
import ContributionsView from './components/ContributionsView';
import DashboardView from './components/DashboardView';
import LoginView from './components/LoginView';
import { TABS } from './constants';

// Production: load initial data from backend API (Firestore) instead of local mocks


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
  
  // Ya no almacenamos la clave de Gemini en el cliente. El backend la maneja.
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);

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
    // Load initial data from backend API (expects backend to expose /api/users, /api/inventory, /api/contributions)
    let mounted = true;
    async function loadInitial() {
      try {
        const base = import.meta.env.VITE_API_BASE_URL || '';
        const [usersRes, inventoryRes, contributionsRes] = await Promise.all([
          fetch(base + '/api/users'),
          fetch(base + '/api/inventory'),
          fetch(base + '/api/contributions'),
        ]);

        const [usersJson, inventoryJson, contributionsJson] = await Promise.all([
          usersRes.ok ? usersRes.json() : [],
          inventoryRes.ok ? inventoryRes.json() : [],
          contributionsRes.ok ? contributionsRes.json() : [],
        ]);

        if (!mounted) return;
        dispatch({ type: 'SET_INITIAL_DATA', payload: { users: usersJson || [], inventory: inventoryJson || [], contributions: contributionsJson || [] } });
      } catch (err) {
        console.error('Failed to load initial data', err);
        // fallback to empty lists in production
        if (mounted) dispatch({ type: 'SET_INITIAL_DATA', payload: { users: [], inventory: [], contributions: [] } });
      }
    }
    loadInitial();
    return () => { mounted = false; };
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

  const setInventory = useCallback((value: React.SetStateAction<FoodItem[]>) => {
    dispatch({ type: 'SET_INVENTORY', payload: value });
  }, []);

  const setContributions = useCallback((value: React.SetStateAction<Contribution[]>) => {
    dispatch({ type: 'SET_CONTRIBUTIONS', payload: value });
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
                />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
  {/* El modal de API Key se desactiva; el backend almacena la API key de Gemini */}
  <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;