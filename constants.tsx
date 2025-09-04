import React from 'react';
import { FoodCategory } from './types';

export const TABS = ['Dashboard', 'Inventario', 'Aportes'];

export const FOOD_CATEGORY_DETAILS: { [key in FoodCategory]: { icon: React.ReactElement, color: string, colorClass: string } } = {
  [FoodCategory.PROTEIN]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 21a6.75 6.75 0 006.467-5.064 8.22 8.22 0 00-1.484-6.052A8.158 8.158 0 0012.75 3a8.158 8.158 0 00-5.233 6.884 8.22 8.22 0 00-1.484 6.052A6.75 6.75 0 0012.75 21z" /></svg>, color: '#f59e0b', colorClass: "bg-amber-100 dark:bg-amber-900/50" }, // Egg icon
  [FoodCategory.VEGETABLES]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75v3.75M12.75 16.5v3.75" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.75v10.5M7.5 6.75v10.5" /></svg>, color: '#4ade80', colorClass: "bg-green-100 dark:bg-green-900/50" }, // Abstract vegetable
  [FoodCategory.FRUITS]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.75v3.75m-3.75-3.75h7.5A2.25 2.25 0 0119.5 6v1.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 7.5V6A2.25 2.25 0 016.75 3.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></svg>, color: '#ef4444', colorClass: "bg-red-100 dark:bg-red-900/50" },
  [FoodCategory.DAIRY]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18v10.5a4.5 4.5 0 01-4.5 4.5H7.5A4.5 4.5 0 013 13.5V3z" /></svg>, color: '#60a5fa', colorClass: "bg-blue-100 dark:bg-blue-900/50" }, // Milk Glass
  [FoodCategory.GRAINS]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 17.25h16.5" /><path d="M12 21a9 9 0 009-9H3a9 9 0 009 9z" /></svg>, color: '#facc15', colorClass: "bg-yellow-100 dark:bg-yellow-900/50" }, // Bread/Toast
  [FoodCategory.PANTRY]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4" /></svg>, color: '#a8a29e', colorClass: "bg-stone-100 dark:bg-stone-800/50" },
  [FoodCategory.DRINKS]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 3.545A2.25 2.25 0 0115 5.795h4.5a2.25 2.25 0 012.25 2.25v9.75a2.25 2.25 0 01-2.25 2.25h-4.5m-4.5 0H3.75a2.25 2.25 0 01-2.25-2.25V5.795a2.25 2.25 0 012.25-2.25h4.5" /></svg>, color: '#38bdf8', colorClass: "bg-cyan-100 dark:bg-cyan-900/50" },
  [FoodCategory.OTHER]: { icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>, color: '#d1d5db', colorClass: "bg-gray-200 dark:bg-gray-700/50" },
};

export const PREDEFINED_FOODS = [
    // Tubérculos
    { name: 'Papa', unit: 'kg', category: FoodCategory.VEGETABLES },
    { name: 'Yuca', unit: 'kg', category: FoodCategory.VEGETABLES },
    { name: 'Arracacha', unit: 'kg', category: FoodCategory.VEGETABLES },
    // Verduras
    { name: 'Cebolla', unit: 'kg', category: FoodCategory.VEGETABLES },
    { name: 'Tomate', unit: 'kg', category: FoodCategory.VEGETABLES },
    { name: 'Zanahoria', unit: 'kg', category: FoodCategory.VEGETABLES },
    { name: 'Espinaca', unit: 'kg', category: FoodCategory.VEGETABLES },
    { name: 'Brócoli', unit: 'unidades', category: FoodCategory.VEGETABLES },
    // Granos y Legumbres
    { name: 'Arroz', unit: 'kg', category: FoodCategory.GRAINS },
    { name: 'Frijoles', unit: 'kg', category: FoodCategory.GRAINS },
    { name: 'Lentejas', unit: 'kg', category: FoodCategory.GRAINS },
    // Proteínas
    { name: 'Pollo', unit: 'kg', category: FoodCategory.PROTEIN },
    { name: 'Carne de res', unit: 'kg', category: FoodCategory.PROTEIN },
    { name: 'Huevos', unit: 'unidades', category: FoodCategory.PROTEIN },
    { name: 'Pescado', unit: 'kg', category: FoodCategory.PROTEIN },
    // Lácteos y Derivados
    { name: 'Leche', unit: 'litros', category: FoodCategory.DAIRY },
    { name: 'Queso', unit: 'kg', category: FoodCategory.DAIRY },
    { name: 'Yogurt', unit: 'unidades', category: FoodCategory.DAIRY },
    // Frutas
    { name: 'Banano', unit: 'kg', category: FoodCategory.FRUITS },
    { name: 'Manzana', unit: 'unidades', category: FoodCategory.FRUITS },
    { name: 'Naranja', unit: 'kg', category: FoodCategory.FRUITS },
    // Despensa
    { name: 'Aceite', unit: 'litros', category: FoodCategory.PANTRY },
    { name: 'Sal', unit: 'kg', category: FoodCategory.PANTRY },
    { name: 'Azúcar', unit: 'kg', category: FoodCategory.PANTRY },
    { name: 'Pasta', unit: 'kg', category: FoodCategory.PANTRY },
    { name: 'Pan', unit: 'unidades', category: FoodCategory.GRAINS },
     // Bebidas
    { name: 'Café', unit: 'kg', category: FoodCategory.DRINKS },
    { name: 'Chocolate', unit: 'unidades', category: FoodCategory.DRINKS },
];