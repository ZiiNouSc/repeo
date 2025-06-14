import React, { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Rediriger si déjà connecté
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants incorrects');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo et titre */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">ST</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">SamTech</h2>
          <p className="mt-2 text-gray-600">Connectez-vous à votre compte</p>
        </div>

        {/* Formulaire */}
        <form className="card" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="input-field"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Lien d'inscription */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <Link
              to="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Créer un compte agence
            </Link>
          </p>
        </div>

        {/* Comptes de démonstration */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comptes de démonstration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Super Admin:</span>
              <span className="font-mono text-blue-600">superadmin@samtech.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agence:</span>
              <span className="font-mono text-blue-600">agence@test.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Agent:</span>
              <span className="font-mono text-blue-600">agent@test.com</span>
            </div>
            <div className="text-center text-gray-500 mt-2">
              Mot de passe: <span className="font-mono">demo123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;