import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { isAuthenticated } from '../utils/auth';
import Layout from '../components/Layout';

/**
 * Página de inicio - Redirige automáticamente según el estado de autenticación
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación y redirigir apropiadamente
    if (isAuthenticated()) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <Layout requireAuth={false}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    </Layout>
  );
} 