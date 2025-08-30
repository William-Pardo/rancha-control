import React from 'react';
import { FoodItem, Contribution, User } from '../types';

interface DashboardViewProps {
  inventory: FoodItem[];
  contributions: Contribution[];
  users: User[];
}

const DashboardView: React.FC<DashboardViewProps> = ({
  inventory,
  contributions,
  users
}) => {
  // Calculate stats
  const totalItems = inventory.length;
  const expiringItems = inventory.filter(item => {
    if (!item.expirationDate) return false;
    const expirationDate = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  }).length;

  const totalContributions = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyContributions = contributions.filter(contrib => {
    const date = new Date(contrib.date);
    return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
  }).reduce((sum, contrib) => sum + contrib.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Resumen general de la alacena familiar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📦</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Items
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalItems}
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
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">⚠️</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Por Vencer
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {expiringItems}
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
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Aportes
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
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Este Mes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    ${monthlyContributions.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Items Próximos a Vencer
            </h3>
            <div className="mt-5">
              {expiringItems === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay items próximos a vencer 👍
                </p>
              ) : (
                <div className="space-y-3">
                  {inventory
                    .filter(item => {
                      if (!item.expirationDate) return false;
                      const expirationDate = new Date(item.expirationDate);
                      const today = new Date();
                      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
                      return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
                    })
                    .slice(0, 5)
                    .map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        <span className="text-sm text-red-600 dark:text-red-400">
                          {item.expirationDate && new Date(item.expirationDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Aportes Recientes
            </h3>
            <div className="mt-5">
              {contributions.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No hay aportes registrados
                </p>
              ) : (
                <div className="space-y-3">
                  {contributions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(contribution => {
                      const user = users.find(u => u.id === contribution.userId);
                      return (
                        <div key={contribution.id} className="flex justify-between items-center">
                          <div>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {user?.name || 'Usuario desconocido'}
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {contribution.description}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            ${contribution.amount.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;