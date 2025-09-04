import React, { useMemo } from 'react';
import { User } from '../types';
import Card from './Card';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const userButtons = useMemo(() => {
    return users.map((user) => (
      <button
        key={user.id}
        onClick={() => onLogin(user)}
        className="w-full text-primary-foreground bg-primary hover:bg-primary-hover focus:ring-4 focus:ring-primary/50 font-medium rounded-lg text-lg px-5 py-3 text-center transition-colors"
      >
        {user.name}
      </button>
    ));
  }, [users, onLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-foreground mb-6">Selecciona tu usuario</h2>
        <div className="space-y-3">
          {userButtons}
        </div>
      </Card>
    </div>
  );
};

export default LoginView;