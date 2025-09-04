import React, { useState, useEffect } from 'react';
import Card from './Card';

interface ApiKeyModalProps {
  onSave: (apiKey: string) => void;
  onClose: () => void;
  initialError?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, initialError }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState(initialError);

  useEffect(() => {
    setError(initialError);
  }, [initialError]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Por favor, ingresa una clave de API.');
      return;
    }
    onSave(apiKey.trim());
  };

  const handleClearKey = () => {
    onSave(''); // Save an empty key to clear it
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto h-full w-full z-30 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-card-foreground">Configurar Clave de API de Gemini</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Para usar el Asistente Inteligente, necesitas una clave de API de Google Gemini. 
          Tu clave se guardará de forma segura en tu navegador.
        </p>
        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="mt-1 text-sm text-primary hover:underline">
          Consigue tu clave gratis aquí &rarr;
        </a>
        
        <div className="mt-4">
          <label htmlFor="api-key-input" className="block text-sm font-medium text-foreground mb-1">
            Tu Clave de API
          </label>
          <input
            id="api-key-input"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (error) setError(undefined);
            }}
            className="block w-full bg-secondary border-input text-foreground rounded-lg p-2.5 focus:ring-2 focus:ring-ring sm:text-sm"
            placeholder="Pega tu clave aquí"
          />
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <div className="mt-6 flex justify-between items-center gap-3">
          <button
            type="button"
            onClick={handleClearKey}
            className="text-sm text-destructive hover:underline"
          >
            Borrar Clave
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-card py-2 px-4 border border-input rounded-md shadow-sm text-sm font-medium text-secondary-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Guardar Clave
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiKeyModal;