import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated, removeAuthToken, getUsername } from '../utils/auth';

/**
 * Componente Layout principal de la aplicación
 * Maneja la autenticación y estructura general
 */
export default function Layout({ children, requireAuth = true }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const router = useRouter();

  // Función para formatear el nombre del usuario
  const formatUsername = (user) => {
    if (!user) return 'Usuario';
    
    // Si es admin, mostrar "Admin"
    if (user === 'admin') return 'Admin';
    
    // Para otros usuarios, capitalizar primera letra y mostrar nombre
    if (user.includes('.')) {
      const [firstName, lastName] = user.split('.');
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    
    return user.charAt(0).toUpperCase() + user.slice(1);
  };

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      const currentUser = getUsername();
      
      setAuthenticated(isAuth);
      setUsername(currentUser || '');
      
      if (requireAuth && !isAuth) {
        router.push('/login');
      } else if (!requireAuth && isAuth && router.pathname === '/login') {
        router.push('/dashboard');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [router, requireAuth]);

  const handleLogout = () => {
    removeAuthToken();
    setAuthenticated(false);
    setUsername('');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !authenticated) {
    return null; // Redirigiendo...
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {authenticated && (
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  <span className="hidden sm:inline">Panel de Stock de Productos SAP</span>
                  <span className="sm:hidden">Stock SAP</span>
                </h1>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Panel de usuario mejorado */}
                <div className="flex items-center space-x-2 md:space-x-3 bg-gray-50 rounded-lg px-2 md:px-4 py-2 border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {formatUsername(username).charAt(0)}
                    </span>
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {formatUsername(username)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {username === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 md:space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className={authenticated ? 'py-6' : ''}>
        <div className={authenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : ''}>
          {children}
        </div>
      </main>
    </div>
  );
} 