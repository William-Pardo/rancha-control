import React, { useState } from 'react';
import { FoodItem, User } from '../types';

interface InventoryViewProps {
  inventory: FoodItem[];
  setInventory: React.Dispatch<React.SetStateAction<FoodItem[]>>;
  currentUser: User;
  users: User[];
}

const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  setInventory: _setInventory,
  currentUser: _currentUser,
  users
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'fruits', label: 'Frutas' },
    { value: 'vegetables', label: 'Verduras' },
    { value: 'dairy', label: 'Lácteos' },
    { value: 'meat', label: 'Carnes' },
    { value: 'grains', label: 'Granos' },
    { value: 'canned', label: 'Enlatados' },
    { value: 'frozen', label: 'Congelados' },
    { value: 'snacks', label: 'Snacks' },
    { value: 'beverages', label: 'Bebidas' },
    { value: 'other', label: 'Otros' }
  ];

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return 'none';
    
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 3) return 'critical';
    if (daysUntilExpiration <= 7) return 'warning';
    return 'good';
  };

  const getExpirationBadge = (status: string) => {
    switch (status) {
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Vencido</span>;
      case 'critical':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Crítico</span>;
      case 'warning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Próximo</span>;
      case 'good':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Bueno</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventario</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los alimentos de la alacena familiar
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Agregar Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar alimentos..."
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <select
              id="category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Inventory List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {inventory.length === 0 
                ? "No hay items en el inventario. ¡Agrega algunos alimentos!"
                : "No se encontraron items que coincidan con los filtros."
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInventory.map((item) => {
              const expirationStatus = getExpirationStatus(item.expirationDate);
              const addedByUser = users.find(u => u.id === item.addedBy);
              
              return (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                          <span className="text-lg">
                            {item.category === 'fruits' && '🍎'}
                            {item.category === 'vegetables' && '🥕'}
                            {item.category === 'dairy' && '🥛'}
                            {item.category === 'meat' && '🥩'}
                            {item.category === 'grains' && '🌾'}
                            {item.category === 'canned' && '🥫'}
                            {item.category === 'frozen' && '❄️'}
                            {item.category === 'snacks' && '🍿'}
                            {item.category === 'beverages' && '🥤'}
                            {item.category === 'other' && '📦'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} {item.unit} • Agregado por {addedByUser?.name || 'Usuario desconocido'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.expirationDate && getExpirationBadge(expirationStatus)}
                      {item.expirationDate && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Vence: {new Date(item.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 text-sm">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InventoryView;