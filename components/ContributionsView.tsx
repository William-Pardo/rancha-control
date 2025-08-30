import React, { useState } from 'react';
import { Contribution, User } from '../types';

interface ContributionsViewProps {
  contributions: Contribution[];
  setContributions: React.Dispatch<React.SetStateAction<Contribution[]>>;
  users: User[];
  currentUser: User;
}

const ContributionsView: React.FC<ContributionsViewProps> = ({
  contributions,
  setContributions: _setContributions,
  users,
  currentUser: _currentUser
}) => {
  const [filterUser, setFilterUser] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredContributions = contributions.filter(contribution => {
    const matchesUser = filterUser === 'all' || contribution.userId === filterUser;
    const matchesCategory = filterCategory === 'all' || contribution.category === filterCategory;
    return matchesUser && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'groceries', label: 'Alimentos' },
    { value: 'utilities', label: 'Servicios' },
    { value: 'other', label: 'Otros' }
  ];

  const totalContributions = filteredContributions.reduce((sum, contrib) => sum + contrib.amount, 0);

  // Calculate contributions by user
  const contributionsByUser = users.map(user => {
    const userContributions = filteredContributions.filter(contrib => contrib.userId === user.id);
    const total = userContributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    return {
      user,
      total,
      count: userContributions.length
    };
  }).filter(userStats => userStats.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Aportes</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Registro de contribuciones económicas familiares
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          Registrar Aporte
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Filtrado
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    ${totalContributions.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Registros
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {filteredContributions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Promedio
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    ${filteredContributions.length > 0 ? Math.round(totalContributions / filteredContributions.length).toLocaleString() : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Usuario
            </label>
            <select
              id="user-filter"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Todos los usuarios</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
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

      {/* Contributions by User */}
      {contributionsByUser.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Resumen por Usuario
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributionsByUser.map(({ user, total, count }) => (
              <div key={user.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {count} aportes • ${total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contributions List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        {filteredContributions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {contributions.length === 0 
                ? "No hay aportes registrados. ¡Registra el primer aporte!"
                : "No se encontraron aportes que coincidan con los filtros."
              }
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredContributions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((contribution) => {
                const user = users.find(u => u.id === contribution.userId);
                const categoryLabel = categories.find(c => c.value === contribution.category)?.label || contribution.category;
                
                return (
                  <li key={contribution.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 text-lg">
                              {contribution.category === 'groceries' && '🛒'}
                              {contribution.category === 'utilities' && '⚡'}
                              {contribution.category === 'other' && '💳'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {contribution.description}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user?.name || 'Usuario desconocido'} • {categoryLabel} • {new Date(contribution.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-medium text-green-600 dark:text-green-400">
                          ${contribution.amount.toLocaleString()}
                        </span>
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

export default ContributionsView;