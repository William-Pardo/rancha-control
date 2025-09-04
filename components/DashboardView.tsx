import React, { useState, useMemo, useCallback } from 'react';
import { FoodItem, Contribution, User, FoodCategory, AIAnalysis } from '../types';
import { FOOD_CATEGORY_DETAILS } from '../constants';
import { getAnalysisAndSuggestions } from '../services/geminiService';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
import Card from './Card';
import Spinner from './Spinner';
import InventoryChart from './InventoryChart';

interface DashboardViewProps {
    inventory: FoodItem[];
    contributions: Contribution[];
    users: User[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ inventory, contributions, users }) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(15);

  const dateFrom = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - dateRange);
    return date;
  }, [dateRange]);

  const recentContributions = useMemo(() => {
    return contributions.filter(c => c.date >= dateFrom);
  }, [contributions, dateFrom]);
  
    const handleGenerateAnalysis = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
                const analysis = await getAnalysisAndSuggestions(inventory, recentContributions, users);
                setAiAnalysis(analysis);
        } catch (e: any) {
                setError(e.message || "Ocurrió un error desconocido.");
        } finally {
                setIsLoading(false);
        }
    }, [inventory, recentContributions, users]);
  
  const { totalRecentContributions, activeInventoryCount } = useMemo(() => {
    const totalRecentContributions = recentContributions.reduce((sum, c) => sum + c.amount, 0);
    const activeInventoryCount = inventory.filter(item => item.consumedAt === null).length;
    return { totalRecentContributions, activeInventoryCount };
  }, [recentContributions, inventory]);

  const formatCurrency = (value: number) => `$${value.toLocaleString('es-CL')}`;

  const categorySummaryData = useMemo(() => {
      return Object.values(FoodCategory).map(category => {
        const items = inventory.filter(item => item.category === category && item.consumedAt === null);
        return {
          name: category,
          count: items.length,
          color: FOOD_CATEGORY_DETAILS[category].color,
        };
      });
  }, [inventory]);

    const recentlyConsumedItems = useMemo(() => {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        return inventory
            .filter(item => item.consumedAt && new Date(item.consumedAt) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.consumedAt!).getTime() - new Date(a.consumedAt!).getTime())
            .slice(0, 5);
    }, [inventory]);

  const renderedShoppingSuggestions = useMemo(() => {
    if (!aiAnalysis) return null;
    return aiAnalysis.shoppingSuggestions.map((s, i) => <li key={i}>{s}</li>);
  }, [aiAnalysis]);

  return (
    <div className="space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">Dashboard General</h2>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Mostrar:</span>
                <div className="relative">
                    <select
                        className="appearance-none bg-secondary text-secondary-foreground font-medium rounded-lg text-sm pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                        value={dateRange}
                        onChange={(e) => setDateRange(Number(e.target.value))}
                    >
                        <option value="15">Últimos 15 días</option>
                        <option value="30">Últimos 30 días</option>
                        <option value="90">Últimos 90 días</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w.org/2000/svg" viewBox="0 erections/20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-blue-50 dark:bg-blue-900/40">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 dark:bg-blue-800/60 rounded-lg">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5l.415-.207a.75.75 0 011.085.67V10.5m0 0h6.375m-6.375 0v3.75m0-3.75S9 7.5 9 6.75a3 3 0 013-3s3 1.5 3 3v7.5a3 3 0 01-3 3s-3-1.5-3-3V6.75" /></svg>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">Ítems en Inventario</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{activeInventoryCount}</p>
                </div>
            </div>
             <div className="flex items-start gap-4 p-5 rounded-xl bg-green-50 dark:bg-green-900/40">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-800/60 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">Aportes (últimos {dateRange} días)</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{formatCurrency(totalRecentContributions)}</p>
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <InventoryChart data={categorySummaryData} />
            </div>
            <div className="lg:col-span-1">
                <Card className="h-full">
                    <h3 className="text-xl font-bold text-foreground mb-4">Consumo Reciente</h3>
                    <div className="space-y-3">
                        {recentlyConsumedItems.length > 0 ? (
                            recentlyConsumedItems.map(item => {
                                const { icon, colorClass } = FOOD_CATEGORY_DETAILS[item.category];
                                return (
                                    <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                                        <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg ${colorClass}`}>
                                            {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5', style: { color: FOOD_CATEGORY_DETAILS[item.category].color } })}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-sm text-card-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.quantity} {item.unit} &bull; {item.consumedAt!.toLocaleDateString('es-CL')}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-center text-muted-foreground">
                                <p>No se han consumido artículos en los últimos 7 días.</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>

        <Card>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold from-indigo-600 to-purple-600 bg-clip-text text-transparent bg-gradient-to-r inline-block dark:from-indigo-400 dark:to-purple-400">Asistente Inteligente</h3>
                <p className="text-muted-foreground mt-1 text-sm">Obtén análisis y sugerencias sobre tus hábitos de consumo y cómo optimizar tus compras.</p>
              </div>
              <button
                  onClick={handleGenerateAnalysis}
                  disabled={isLoading}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-primary/70 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
              >
                  {isLoading ? <><Spinner /> Generando...</> : 'Generar Análisis'}
              </button>
            </div>

            {error && <div className="mt-4 text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

            {aiAnalysis && (
                <div className="mt-6 space-y-4 text-sm">
                    <div>
                        <h4 className="font-semibold text-foreground">Patrones de Consumo</h4>
                        <p className="text-muted-foreground">{aiAnalysis.consumptionPatterns}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Balance Nutricional</h4>
                        <p className="text-muted-foreground">{aiAnalysis.nutritionalBalance}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground">Sugerencias de Compra</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                            {renderedShoppingSuggestions}
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-foreground">Optimización de Presupuesto</h4>
                        <p className="text-muted-foreground">{aiAnalysis.budgetOptimization}</p>
                    </div>
                </div>
            )}
        </Card>
    </div>
  );
};

export default DashboardView;