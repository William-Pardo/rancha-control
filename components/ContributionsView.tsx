import React, { useState, useMemo, useCallback } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Contribution, User } from '../types';
import Card from './Card';

interface ContributionsViewProps {
  contributions: Contribution[];
  setContributions: React.Dispatch<React.SetStateAction<Contribution[]>>;
  users: User[];
  currentUser: User;
}

const ITEMS_PER_PAGE = 5;

// Helper validation function
const validateAmount = (value: string): string | null => {
    if (!value.trim()) return "El monto es requerido.";
    const numericAmount = parseFloat(value);
    if (isNaN(numericAmount)) return "Debe ingresar un valor numérico válido.";
    if (numericAmount <= 0) return "El monto debe ser mayor a cero.";
    if (numericAmount > 1000000) return "El monto no puede ser mayor a $1,000,000.";
    return null;
};

const AddContributionForm: React.FC<{ onAdd: (amount: number) => void }> = ({ onAdd }) => {
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateAmount(amount);
        if (validationError) {
            setError(validationError);
            return;
        }
        onAdd(parseFloat(amount));
        setAmount('');
        setError(null);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
        if (error) {
            setError(null);
        }
    };
    
    const hasError = !!error;
    const baseInputClasses = "block w-full rounded-md p-2.5 pl-7 shadow-sm sm:text-sm bg-secondary border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card";
    const statefulClasses = hasError
      ? "border-destructive text-destructive placeholder:text-destructive/70 focus:ring-destructive"
      : "border-input text-secondary-foreground placeholder:text-muted-foreground focus:ring-ring";
    const inputClasses = `${baseInputClasses} ${statefulClasses}`;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 sm:items-start">
            <div className="relative flex-grow">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className={`sm:text-sm ${hasError ? 'text-destructive' : 'text-muted-foreground'}`}>$</span>
                </div>
                <input 
                    type="number" 
                    value={amount}
                    onChange={handleChange}
                    placeholder="Monto"
                    aria-invalid={hasError}
                    aria-describedby="amount-error"
                    className={inputClasses}
                />
                {hasError && <p id="amount-error" className="mt-2 text-sm text-destructive">{error}</p>}
            </div>
            <button type="submit" className="justify-center rounded-md border border-transparent bg-accent py-2 px-4 text-sm font-medium text-accent-foreground shadow-sm hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:bg-accent/70 transition-colors">
                Aportar
            </button>
        </form>
    );
};


const ContributionsView: React.FC<ContributionsViewProps> = ({ contributions, setContributions, users, currentUser }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
    const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editError, setEditError] = useState<string | null>(null);

    const handleAddContribution = useCallback(async (amount: number) => {
        const newContribution = {
            amount,
            date: new Date().toISOString(),
            userId: currentUser.id
        };
        await addDoc(collection(db, 'contributions'), newContribution);
        setCurrentPage(1);
    }, [currentUser.id]);

    const handleOpenEditModal = useCallback((contribution: Contribution) => {
        setEditingContribution(contribution);
        setEditAmount(String(contribution.amount));
        setEditError(null);
    }, []);

    const handleCloseEditModal = useCallback(() => {
        setEditingContribution(null);
    }, []);
    
    const handleUpdateContribution = useCallback(async () => {
        if (!editingContribution) return;

        const validationError = validateAmount(editAmount);
        if (validationError) {
            setEditError(validationError);
            return;
        }

        const numericAmount = parseFloat(editAmount);
        await updateDoc(doc(db, 'contributions', editingContribution.id), { amount: numericAmount });
        handleCloseEditModal();
    }, [editingContribution, editAmount, handleCloseEditModal]);

    const { total, userTotals } = useMemo(() => {
        const total = contributions.reduce((sum, c) => sum + c.amount, 0);
        const userTotals = users.map(user => {
            const total = contributions
                .filter(c => c.userId === user.id)
                .reduce((sum, c) => sum + c.amount, 0);
            return { ...user, total };
        });
        return { total, userTotals };
    }, [contributions, users]);

    const { paginatedContributions, totalPages } = useMemo(() => {
        const totalPages = Math.ceil(contributions.length / ITEMS_PER_PAGE);
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedSlice = contributions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
        return { paginatedContributions: paginatedSlice, totalPages };
    }, [contributions, currentPage]);
    
    const formatCurrency = (value: number) => `$${value.toLocaleString('es-CL')}`;

    const renderedUserTotals = useMemo(() => {
        return userTotals.map(user => (
            <li key={user.id} className="flex justify-between py-2">
                <span className="text-sm font-medium text-secondary-foreground">{user.name}</span>
                <span className="text-sm font-semibold text-muted-foreground">{formatCurrency(user.total)}</span>
            </li>
        ));
    }, [userTotals]);
    
    const renderedHistoryRows = useMemo(() => {
        if (paginatedContributions.length === 0) {
            return (
                <tr>
                    <td colSpan={4} className="text-center py-10 text-muted-foreground">No hay aportes registrados.</td>
                </tr>
            );
        }
        return paginatedContributions.map(c => (
            <tr key={c.id} onClick={() => setSelectedContribution(c)} className="cursor-pointer hover:bg-secondary transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-card-foreground">{users.find(u => u.id === c.userId)?.name || 'Desconocido'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-accent font-semibold">{formatCurrency(c.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{c.date.toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {c.userId === currentUser.id && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditModal(c);
                            }}
                            className="text-primary hover:text-primary-hover font-medium"
                        >
                            Editar
                        </button>
                    )}
                </td>
            </tr>
        ));
    }, [paginatedContributions, users, currentUser.id, handleOpenEditModal]);
    
    const PaginationControls = () => {
        if (totalPages <= 1) return null;

        return (
            <div className="flex items-center justify-center gap-4 mt-4">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                >
                    Anterior
                </button>
                <span className="text-sm text-muted-foreground" aria-live="polite">
                    Página {currentPage} de {totalPages}
                </span>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página siguiente"
                >
                    Siguiente
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <Card>
                 <h3 className="text-lg font-medium leading-6 text-card-foreground mb-4">Realizar un Aporte</h3>
                <AddContributionForm onAdd={handleAddContribution} />
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                    <h3 className="text-lg font-medium text-card-foreground">Total Aportado</h3>
                    <p className="mt-1 text-3xl font-semibold tracking-tight text-accent">{formatCurrency(total)}</p>
                </Card>
                <Card className="md:col-span-2">
                    <h3 className="text-lg font-medium text-card-foreground">Aportes por Usuario</h3>
                    <ul className="mt-2 divide-y divide-border">
                        {renderedUserTotals}
                    </ul>
                </Card>
            </div>
             <Card>
                <h3 className="text-lg font-medium leading-6 text-card-foreground mb-4">Historial de Aportes</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                         <thead className="bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Usuario</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Monto</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Fecha</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Acciones</span>
                                </th>
                            </tr>
                        </thead>
                         <tbody className="bg-card divide-y divide-border">
                            {renderedHistoryRows}
                        </tbody>
                    </table>
                </div>
                <PaginationControls />
            </Card>

            {/* Detail Modal */}
            {selectedContribution && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4"
                    onClick={() => setSelectedContribution(null)}
                >
                    <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium leading-6 text-card-foreground">Detalle del Aporte</h3>
                        <div className="mt-4 space-y-2 border-t border-border pt-4">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Usuario:</span>
                                <span className="text-sm font-semibold text-card-foreground">{users.find(u => u.id === selectedContribution.userId)?.name || 'Desconocido'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Monto:</span>
                                <span className="text-sm font-semibold text-accent">{formatCurrency(selectedContribution.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Fecha:</span>
                                <span className="text-sm font-semibold text-card-foreground">{selectedContribution.date.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">ID Transacción:</span>
                                <span className="text-sm font-mono text-muted-foreground truncate">{selectedContribution.id}</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedContribution(null)}
                                className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Edit Modal */}
            {editingContribution && (
                 <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-medium leading-6 text-card-foreground">Editar Aporte</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Estás editando el aporte del {editingContribution.date.toLocaleDateString('es-CL')}.
                        </p>

                        <div className="mt-4">
                            <label htmlFor="edit-amount" className="block text-sm font-medium text-foreground mb-1">
                                Nuevo Monto
                            </label>
                            <div className="relative flex-grow">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className={`sm:text-sm ${editError ? 'text-destructive' : 'text-muted-foreground'}`}>$</span>
                                </div>
                                <input
                                    id="edit-amount"
                                    type="number"
                                    value={editAmount}
                                    onChange={(e) => {
                                        setEditAmount(e.target.value);
                                        if (editError) setEditError(null);
                                    }}
                                    className={`block w-full rounded-md p-2.5 pl-7 shadow-sm sm:text-sm bg-secondary border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card ${editError ? 'border-destructive text-destructive' : 'border-input text-secondary-foreground focus:ring-ring'}`}
                                />
                            </div>
                            {editError && <p className="mt-2 text-sm text-destructive">{editError}</p>}
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCloseEditModal}
                                className="bg-card py-2 px-4 border border-input rounded-md shadow-sm text-sm font-medium text-secondary-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateContribution}
                                className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </Card>
                 </div>
            )}
        </div>
    );
};

export default ContributionsView;