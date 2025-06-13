import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import KPICards from '../components/KPICards';
import ProductGrid from '../components/ProductGrid';

/**
 * Página principal del dashboard
 */
export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar productos desde la API
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/products');
      const data = await response.json();

      // ✅ COMPATIBILIDAD: Manejar tanto el formato nuevo como el antiguo
      if (Array.isArray(data)) {
        // Formato antiguo: directamente un array
        console.log('📦 Formato de array detectado, convirtiendo...');
        setProducts(data);
        setFilteredProducts(data);
      } else if (data.success && data.data) {
        // Formato nuevo: objeto con success y data
        console.log('✅ Formato correcto detectado');
        setProducts(data.data);
        setFilteredProducts(data.data);
      } else {
        setError(data.message || 'Error al cargar productos');
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error de conexión al cargar productos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Manejar cambios en los productos filtrados
  const handleFilteredDataChange = useCallback((filtered) => {
    setFilteredProducts(filtered);
  }, []);

  // Componente de error
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error al cargar datos
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <button
              onClick={loadProducts}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout requireAuth={true}>
      <div className="space-y-6">
        {/* Título de la página */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Dashboard de Stock de Productos SAP
          </h1>
          <p className="text-gray-600">
            Monitoreo en tiempo real del inventario y estado de productos
          </p>
          {!loading && !error && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Última actualización: {new Date().toLocaleString('es-ES')}
              </div>
              <button
                onClick={loadProducts}
                className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          )}
        </div>

        {/* Mostrar error si existe */}
        {error && <ErrorMessage />}

        {/* KPIs - mostrar solo si hay datos y no hay error */}
        {!error && (
          <KPICards 
            products={filteredProducts}
          />
        )}

        {/* Grilla de productos */}
        <ProductGrid
          products={products}
          loading={loading}
          onFilteredDataChange={handleFilteredDataChange}
        />

        {/* Información adicional */}
        {!loading && !error && products.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información del Sistema
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <strong>Total de productos:</strong> {products.length}
              </div>
              <div>
                <strong>Productos mostrados:</strong> {filteredProducts.length}
              </div>
              <div>
                <strong>Base de datos:</strong> SQL Server (CWSGImsa)
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 