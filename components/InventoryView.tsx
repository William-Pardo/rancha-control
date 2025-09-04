import React, { useReducer, useMemo, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FoodItem, User, FoodCategory } from '../types';
import { PREDEFINED_FOODS, FOOD_CATEGORY_DETAILS } from '../constants';
import Card from './Card';

interface InventoryViewProps {
  inventory: FoodItem[];
  setInventory: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  currentUser: User;
  users: User[];
}

interface InventoryState {
  searchTerm: string;
  activeTab: 'inPantry' | 'consumed';
  selectedFoodIndex: number;
  quantity: string;
  quantityError: string | null;
  consumptionModalItem: FoodItem | null;
  detailModalItem: FoodItem | null;
  consumptionQuantity: string;
  consumptionError: string | null;
  selectedCategory: string; // 'all' or FoodCategory
  selectedUser: string; // 'all' or user ID
}

const initialState: InventoryState = {
  searchTerm: '',
  activeTab: 'inPantry',
  selectedFoodIndex: 0,
  quantity: '1',
  quantityError: null,
  consumptionModalItem: null,
  detailModalItem: null,
  consumptionQuantity: '1',
  consumptionError: null,
  selectedCategory: 'all',
  selectedUser: 'all',
};

type InventoryAction =
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: 'inPantry' | 'consumed' }
  | { type: 'SET_SELECTED_FOOD_INDEX'; payload: number }
  | { type: 'SET_QUANTITY'; payload: string }
  | { type: 'SET_QUANTITY_ERROR'; payload: string | null }
  | { type: 'OPEN_CONSUMPTION_MODAL'; payload: FoodItem }
  | { type: 'CLOSE_CONSUMPTION_MODAL' }
  | { type: 'SET_CONSUMPTION_QUANTITY'; payload: string }
  | { type: 'SET_CONSUMPTION_ERROR'; payload: string | null }
  | { type: 'RESET_ADD_FORM' }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string }
  | { type: 'SET_SELECTED_USER'; payload: string }
  | { type: 'OPEN_DETAIL_MODAL'; payload: FoodItem }
  | { type: 'CLOSE_DETAIL_MODAL' };


const inventoryReducer = (state: InventoryState, action: InventoryAction): InventoryState => {
  switch (action.type) {
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, searchTerm: '', selectedCategory: 'all', selectedUser: 'all' };
    case 'SET_SELECTED_FOOD_INDEX':
        return { ...state, selectedFoodIndex: action.payload };
    case 'SET_QUANTITY':
      return { ...state, quantity: action.payload, quantityError: null };
    case 'SET_QUANTITY_ERROR':
      return { ...state, quantityError: action.payload };
    case 'OPEN_CONSUMPTION_MODAL':
      return { ...state, consumptionModalItem: action.payload, consumptionQuantity: '1', consumptionError: null };
    case 'CLOSE_CONSUMPTION_MODAL':
      return { ...state, consumptionModalItem: null };
    case 'SET_CONSUMPTION_QUANTITY':
      return { ...state, consumptionQuantity: action.payload, consumptionError: null };
    case 'SET_CONSUMPTION_ERROR':
      return { ...state, consumptionError: action.payload };
    case 'RESET_ADD_FORM':
      return { ...state, quantity: '1', quantityError: null };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SELECTED_USER':
      return { ...state, selectedUser: action.payload };
    case 'OPEN_DETAIL_MODAL':
        return { ...state, detailModalItem: action.payload };
    case 'CLOSE_DETAIL_MODAL':
        return { ...state, detailModalItem: null };
    default:
      return state;
  }
};


const InventoryView: React.FC<InventoryViewProps> = ({ inventory, setInventory, currentUser, users }) => {
    const [state, dispatch] = useReducer(inventoryReducer, initialState);
    const {
        searchTerm,
        activeTab,
        selectedFoodIndex,
        quantity,
        quantityError,
        consumptionModalItem,
        detailModalItem,
        consumptionQuantity,
        consumptionError,
        selectedCategory,
        selectedUser,
    } = state;

    const isManager = currentUser.id === 'user-jairo';

    const foodOptions = useMemo(() => {
        return PREDEFINED_FOODS.map((food, index) => <option key={food.name} value={index} className="bg-card text-card-foreground">{food.name}</option>);
    }, []);

    const validateQuantity = (value: string): string | null => {
        if (!value.trim()) return "La cantidad es requerida.";
        const numericQuantity = parseFloat(value);
        if (isNaN(numericQuantity)) return "Debe ser un número válido.";
        if (numericQuantity <= 0) return "La cantidad debe ser un número positivo mayor a cero.";
        return null;
    }

    const handleAddItem = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateQuantity(quantity);
        if (validationError) {
            dispatch({ type: 'SET_QUANTITY_ERROR', payload: validationError });
            return;
        }

        const selectedFood = PREDEFINED_FOODS[selectedFoodIndex];
        const numericQuantity = parseFloat(quantity);

        const newItem = {
            name: selectedFood.name,
            quantity: numericQuantity,
            unit: selectedFood.unit,
            category: selectedFood.category,
            addedAt: new Date().toISOString(),
            addedBy: currentUser.id,
            consumedAt: null
        };
        await addDoc(collection(db, 'inventory'), newItem);
        dispatch({ type: 'RESET_ADD_FORM' });
    }, [selectedFoodIndex, quantity, currentUser.id]);
    
    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'SET_QUANTITY', payload: e.target.value });
    };

    const openConsumptionModal = useCallback((item: FoodItem) => {
        dispatch({ type: 'OPEN_CONSUMPTION_MODAL', payload: item });
    }, []);

    const handleConfirmConsumption = useCallback(async () => {
        if (!consumptionModalItem) return;

        const numericQuantity = parseFloat(consumptionQuantity);

        if (isNaN(numericQuantity) || numericQuantity <= 0) {
            dispatch({ type: 'SET_CONSUMPTION_ERROR', payload: 'La cantidad debe ser un número positivo.' });
            return;
        }
        if (numericQuantity > consumptionModalItem.quantity) {
            dispatch({ type: 'SET_CONSUMPTION_ERROR', payload: `No puedes consumir más de lo disponible (${consumptionModalItem.quantity} ${consumptionModalItem.unit}).` });
            return;
        }

        const itemRef = doc(db, 'inventory', consumptionModalItem.id);
        if (numericQuantity === consumptionModalItem.quantity) {
            await updateDoc(itemRef, { consumedAt: new Date().toISOString() });
        } else {
            await updateDoc(itemRef, { quantity: consumptionModalItem.quantity - numericQuantity });
        }
        dispatch({ type: 'CLOSE_CONSUMPTION_MODAL' });
    }, [consumptionModalItem, consumptionQuantity]);

    const handleDeleteItem = useCallback(async (itemId: string, itemName: string) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${itemName}" permanentemente? Esta acción no se puede deshacer.`)) {
            await deleteDoc(doc(db, 'inventory', itemId));
        }
    }, []);

    const getUserName = useCallback((userId: string) => {
        return users.find(u => u.id === userId)?.name || 'Desconocido';
    }, [users]);
    
    const { activeInventory, consumedInventory } = useMemo(() => {
        const active: FoodItem[] = [];
        const consumed: FoodItem[] = [];
        inventory.forEach(item => {
            if (item.consumedAt) {
                consumed.push(item);
            } else {
                active.push(item);
            }
        });
        active.sort((a,b) => b.addedAt.getTime() - a.addedAt.getTime());
        if (consumed.length > 0 && consumed[0].consumedAt) {
            consumed.sort((a,b) => b.consumedAt!.getTime() - a.consumedAt!.getTime());
        }
        return { activeInventory: active, consumedInventory: consumed };
    }, [inventory]);

    const filterItems = useCallback((items: FoodItem[]) => {
        return items.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
            const userMatch = selectedUser === 'all' || item.addedBy === selectedUser;
            return nameMatch && categoryMatch && userMatch;
        });
    }, [searchTerm, selectedCategory, selectedUser]);

    const filteredActive = useMemo(() => filterItems(activeInventory), [activeInventory, filterItems]);
    const filteredConsumed = useMemo(() => filterItems(consumedInventory), [consumedInventory, filterItems]);
    
    const itemsToShow = activeTab === 'inPantry' ? filteredActive : filteredConsumed;
    
    const handleActionClick = useCallback((e: React.MouseEvent, action: () => void) => {
        e.stopPropagation();
        action();
    }, []);

    const renderedItems = useMemo(() => itemsToShow.map(item => {
        const { icon, colorClass } = FOOD_CATEGORY_DETAILS[item.category];
        const iconStyle = activeTab === 'consumed' ? {} : { color: FOOD_CATEGORY_DETAILS[item.category].color };
        const iconClassName = `w-7 h-7 ${activeTab === 'consumed' ? 'text-muted-foreground' : ''}`;

        return (
            <div 
                key={item.id} 
                className={`bg-card rounded-xl p-3 flex items-center gap-4 shadow-sm transition-all cursor-pointer hover:bg-secondary/70 ${activeTab === 'consumed' ? 'opacity-60' : ''}`}
                onClick={() => dispatch({ type: 'OPEN_DETAIL_MODAL', payload: item })}
            >
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg ${colorClass}`}>
                    {React.cloneElement(icon as React.ReactElement<any>, { className: iconClassName, style: iconStyle })}
                </div>
                <div className="flex-grow">
                    <p className="font-bold text-card-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit} &bull; 
                        {activeTab === 'inPantry' 
                          ? ` Agregado por ${getUserName(item.addedBy)} el ${item.addedAt.toLocaleDateString('es-CL')}`
                          : ` Consumido el ${item.consumedAt!.toLocaleDateString('es-CL')}`}
                    </p>
                </div>
                {isManager && (
                    <div className="flex-shrink-0 flex items-center gap-2">
                        {activeTab === 'inPantry' && (
                            <button
                                onClick={(e) => handleActionClick(e, () => openConsumptionModal(item))}
                                className="w-10 h-10 flex items-center justify-center bg-accent/10 hover:bg-accent/20 rounded-full transition-colors"
                                aria-label={`Consumir ${item.name}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        )}
                        <button
                            onClick={(e) => handleActionClick(e, () => handleDeleteItem(item.id, item.name))}
                            className="w-10 h-10 flex items-center justify-center bg-destructive/10 hover:bg-destructive/20 rounded-full transition-colors"
                            aria-label={`Eliminar ${item.name}`}
                        >
                            <svg className="h-5 w-5 text-destructive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        );
    }), [itemsToShow, activeTab, isManager, getUserName, openConsumptionModal, handleDeleteItem, handleActionClick]);


    return (
        <div className="space-y-6">
            <Card className="p-4 space-y-4">
                {isManager && (
                    <form onSubmit={handleAddItem} className="flex flex-col gap-4 mb-4">
                        <div className="flex flex-wrap items-start gap-2 md:gap-4">
                            <div className="flex-grow flex items-center bg-secondary border border-input rounded-lg min-w-[200px] focus-within:ring-2 focus-within:ring-ring">
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                                    {React.cloneElement(FOOD_CATEGORY_DETAILS[PREDEFINED_FOODS[selectedFoodIndex].category].icon as React.ReactElement<any>, { className: 'w-5 h-5 text-muted-foreground' })}
                                </div>
                                <select
                                    value={selectedFoodIndex}
                                    onChange={e => dispatch({ type: 'SET_SELECTED_FOOD_INDEX', payload: parseInt(e.target.value, 10)})}
                                    className="flex-grow bg-transparent text-secondary-foreground border-0 focus:ring-0 appearance-none p-2"
                                    aria-label="Seleccionar alimento"
                                >
                                    {foodOptions}
                                </select>
                            </div>
                            <div className="flex-grow sm:flex-grow-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        className={`w-20 bg-secondary text-secondary-foreground rounded-lg border focus:ring-2 focus:border-ring text-center p-2 ${quantityError ? 'border-destructive ring-destructive' : 'border-input focus:ring-ring'}`}
                                        aria-label="Cantidad"
                                        aria-invalid={!!quantityError}
                                        aria-describedby="quantity-error"
                                        min="0.01"
                                        step="any"
                                    />
                                    <span className="text-muted-foreground font-medium w-16">{PREDEFINED_FOODS[selectedFoodIndex].unit}</span>
                                </div>
                                {quantityError && <p id="quantity-error" className="mt-1 text-sm text-destructive">{quantityError}</p>}
                            </div>
                            <button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2.5 px-4 rounded-lg flex items-center gap-2 flex-grow sm:flex-grow-0 justify-center transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                <span>Agregar</span>
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-3">
                    <div className="relative flex items-center bg-secondary border border-input rounded-lg focus-within:ring-2 focus-within:ring-ring transition-shadow">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center pointer-events-none">
                            <svg className="h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={searchTerm}
                            onChange={e => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                            className="block w-full bg-transparent text-secondary-foreground p-2.5 pl-0 focus:outline-none sm:text-sm placeholder:italic placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative flex items-center bg-secondary border border-input rounded-lg focus-within:ring-2 focus-within:ring-ring transition-shadow">
                            <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <select
                                value={selectedCategory}
                                onChange={e => dispatch({ type: 'SET_SELECTED_CATEGORY', payload: e.target.value })}
                                className="appearance-none block w-full bg-transparent text-secondary-foreground py-2.5 pl-0 pr-8 focus:outline-none sm:text-sm"
                                aria-label="Filtrar por categoría"
                            >
                                <option value="all" className="bg-card text-card-foreground">Todas las categorías</option>
                                {Object.values(FoodCategory).map(cat => (
                                    <option key={cat} value={cat} className="bg-card text-card-foreground">{cat}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                        <div className="flex-1 relative flex items-center bg-secondary border border-input rounded-lg focus-within:ring-2 focus-within:ring-ring transition-shadow">
                             <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <select
                                value={selectedUser}
                                onChange={e => dispatch({ type: 'SET_SELECTED_USER', payload: e.target.value })}
                                className="appearance-none block w-full bg-transparent text-secondary-foreground py-2.5 pl-0 pr-8 focus:outline-none sm:text-sm"
                                aria-label="Filtrar por usuario que agregó"
                            >
                                <option value="all" className="bg-card text-card-foreground">Agregado por todos</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id} className="bg-card text-card-foreground">{user.name}</option>
                                ))}
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div>
                <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'inPantry' })} className={`${activeTab === 'inPantry' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            En Despensa ({activeInventory.length})
                        </button>
                        <button onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'consumed' })} className={`${activeTab === 'consumed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}>
                            Consumidos ({consumedInventory.length})
                        </button>
                    </nav>
                </div>
                
                <div className="mt-6 space-y-3">
                    {renderedItems}
                     {itemsToShow.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                           <p>No se encontraron artículos con los filtros actuales.</p>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Consumption Modal */}
            {consumptionModalItem && (
                 <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-20 flex items-center justify-center p-4">
                     <Card className="w-full max-w-md">
                        <h3 className="text-lg font-medium leading-6 text-card-foreground">Registrar Consumo de <span className="font-bold">{consumptionModalItem.name}</span></h3>
                        <p className="mt-1 text-sm text-muted-foreground">Disponible: {consumptionModalItem.quantity} {consumptionModalItem.unit}</p>
                        
                        <div className="mt-4 flex items-baseline gap-2">
                             <input
                                type="number"
                                value={consumptionQuantity}
                                onChange={(e) => dispatch({ type: 'SET_CONSUMPTION_QUANTITY', payload: e.target.value })}
                                className={`w-24 bg-secondary text-secondary-foreground rounded-lg border text-center p-2 ${consumptionError ? 'border-destructive ring-destructive' : 'border-input focus:ring-ring focus:border-ring'}`}
                                aria-label="Cantidad a consumir"
                                aria-invalid={!!consumptionError}
                                min="0"
                                max={consumptionModalItem.quantity}
                                step="any"
                            />
                            <span className="text-muted-foreground">{consumptionModalItem.unit}</span>
                        </div>
                         {consumptionError && <p className="mt-2 text-sm text-destructive">{consumptionError}</p>}

                         <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => dispatch({ type: 'CLOSE_CONSUMPTION_MODAL' })}
                                className="bg-card py-2 px-4 border border-input rounded-md shadow-sm text-sm font-medium text-secondary-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmConsumption}
                                className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Confirmar Consumo
                            </button>
                        </div>
                     </Card>
                 </div>
            )}

            {/* Detail Modal */}
            {detailModalItem && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4"
                    onClick={() => dispatch({ type: 'CLOSE_DETAIL_MODAL' })}
                >
                    <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-lg ${FOOD_CATEGORY_DETAILS[detailModalItem.category].colorClass}`}>
                                {React.cloneElement(FOOD_CATEGORY_DETAILS[detailModalItem.category].icon as React.ReactElement<any>, { className: 'w-8 h-8', style: { color: FOOD_CATEGORY_DETAILS[detailModalItem.category].color } })}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-6 text-card-foreground">{detailModalItem.name}</h3>
                                <p className="text-muted-foreground">{detailModalItem.category}</p>
                            </div>
                        </div>
                        
                        <div className="mt-4 space-y-2 border-t border-border pt-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Cantidad:</span>
                                <span className="text-sm font-semibold text-card-foreground">{detailModalItem.quantity} {detailModalItem.unit}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Agregado por:</span>
                                <span className="text-sm font-semibold text-card-foreground">{getUserName(detailModalItem.addedBy)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Fecha de adición:</span>
                                <span className="text-sm font-semibold text-card-foreground">{detailModalItem.addedAt.toLocaleString('es-CL')}</span>
                            </div>
                            {detailModalItem.consumedAt && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Fecha de consumo:</span>
                                    <span className="text-sm font-semibold text-card-foreground">{detailModalItem.consumedAt.toLocaleString('es-CL')}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ID del Artículo:</span>
                                <span className="text-sm font-mono text-muted-foreground truncate" title={detailModalItem.id}>{detailModalItem.id}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => dispatch({ type: 'CLOSE_DETAIL_MODAL' })}
                                className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default InventoryView;