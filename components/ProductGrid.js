import { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

/**
 * Componente para renderizar el estado del stock con colores
 */
const EstadoStockRenderer = ({ value }) => {
  const getStatusClass = (estado) => {
    switch (estado) {
      case 'Critico':
        return 'status-critico';
      case 'Precaucion':
        return 'status-precaucion';
      case 'Dentro del rango':
        return 'status-dentro-del-rango';
      case 'Sobre Produccion':
        return 'status-sobre-produccion';
      default:
        return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  return (
    <span className={getStatusClass(value)}>
      {value}
    </span>
  );
};

/**
 * Componente para renderizar fechas formateadas
 */
const FechaRenderer = ({ value }) => {
  if (!value) return <span className="text-gray-400">N/A</span>;
  
  try {
    const fecha = new Date(value);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return <span className="text-gray-400">N/A</span>;
  }
};

/**
 * Componente para renderizar números formateados
 */
const NumeroRenderer = ({ value }) => {
  if (value === null || value === undefined) return <span className="text-gray-400">0</span>;
  return parseFloat(value).toLocaleString('es-ES', { maximumFractionDigits: 2 });
};

/**
 * Componente ProductGrid para mostrar la tabla de productos SAP
 */
export default function ProductGrid({ products = [], loading = false, onFilteredDataChange }) {
  const [searchText, setSearchText] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);

  // Hook para detectar dispositivos móviles
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Definición de columnas adaptables para móvil y desktop
  const columnDefs = useMemo(() => {
    if (isMobile) {
      // Columnas simplificadas para móvil
      return [
        {
          headerName: 'Producto',
          field: 'DescripcionArticulo',
          flex: 2,
          minWidth: 200,
          sortable: true,
          resizable: false,
          cellRenderer: (params) => (
            <div className="py-2">
              <div className="font-semibold text-sm text-gray-900 leading-tight mb-1">
                {params.value?.substring(0, 40)}...
              </div>
              <div className="text-xs text-gray-500 font-mono">
                {params.data.CodigoDeArticulo}
              </div>
            </div>
          ),
          cellStyle: { padding: '8px', lineHeight: '1.2' }
        },
        {
          headerName: 'Stock',
          field: 'StockProducto',
          flex: 1,
          minWidth: 80,
          sortable: true,
          resizable: false,
          cellRenderer: (params) => (
            <div className="text-center py-2">
              <div className="font-bold text-blue-700 text-sm">
                <NumeroRenderer value={params.value} />
              </div>
              <div className="text-xs text-gray-500">
                Min: <NumeroRenderer value={params.data.StockSeguridad} />
              </div>
            </div>
          ),
          cellStyle: { padding: '8px' }
        },
        {
          headerName: 'Estado',
          field: 'EstadoStock',
          flex: 1,
          minWidth: 100,
          sortable: true,
          resizable: false,
          cellRenderer: (params) => (
            <div className="py-2 flex justify-center">
              <EstadoStockRenderer value={params.value} />
            </div>
          ),
          cellStyle: { padding: '8px' },
          comparator: (valueA, valueB) => {
            const order = { 'Critico': 1, 'Precaucion': 2, 'Dentro del rango': 3, 'Sobre Produccion': 4 };
            return (order[valueA] || 5) - (order[valueB] || 5);
          }
        }
      ];
    }

    // Columnas completas para desktop
    return [
      {
        headerName: 'Descripción del Producto',
        field: 'DescripcionArticulo',
        flex: 3,
        minWidth: 250,
        pinned: 'left',
        sortable: true,
        resizable: true,
        cellStyle: { fontWeight: '600', fontSize: '14px' },
        cellClass: 'text-gray-900'
      },
      {
        headerName: 'Código',
        field: 'CodigoDeArticulo',
        flex: 1,
        minWidth: 120,
        sortable: true,
        resizable: true,
        cellStyle: { fontSize: '13px', fontFamily: 'monospace' },
        cellClass: 'text-gray-700'
      },
      {
        headerName: 'Stock Actual',
        field: 'StockProducto',
        flex: 1,
        minWidth: 120,
        sortable: true,
        resizable: true,
        cellRenderer: NumeroRenderer,
        type: 'numericColumn',
        cellStyle: { fontWeight: 'bold', fontSize: '14px' },
        cellClass: 'text-blue-700'
      },
      {
        headerName: 'Stock Mínimo',
        field: 'StockSeguridad',
        flex: 1,
        minWidth: 120,
        sortable: true,
        resizable: true,
        cellRenderer: NumeroRenderer,
        type: 'numericColumn',
        cellStyle: { fontSize: '13px' },
        cellClass: 'text-gray-600'
      },
      {
        headerName: 'Punto Reorden',
        field: 'PuntoDeReOrden',
        flex: 1,
        minWidth: 130,
        sortable: true,
        resizable: true,
        cellRenderer: NumeroRenderer,
        type: 'numericColumn',
        cellStyle: { fontSize: '13px' },
        cellClass: 'text-gray-600'
      },
      {
        headerName: 'Estado',
        field: 'EstadoStock',
        flex: 1,
        minWidth: 140,
        sortable: true,
        resizable: true,
        cellRenderer: EstadoStockRenderer,
        pinned: 'right',
        comparator: (valueA, valueB) => {
          const order = { 'Critico': 1, 'Precaucion': 2, 'Dentro del rango': 3, 'Sobre Produccion': 4 };
          return (order[valueA] || 5) - (order[valueB] || 5);
        }
      }
    ];
  }, [isMobile]);

  // Configuración simplificada de columnas
  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: !isMobile,
    suppressMenu: true,
    filter: false
  }), [isMobile]);

  // Configuración de la grilla simplificada
  const gridOptions = useMemo(() => ({
    pagination: true,
    paginationPageSize: isMobile ? 15 : 25,
    paginationPageSizeSelector: isMobile ? [10, 15, 20] : [10, 25, 50],
    suppressRowClickSelection: true,
    animateRows: true,
    suppressCellFocus: true,
    suppressRowHoverHighlight: false,
    rowHeight: isMobile ? 80 : 55,
    headerHeight: isMobile ? 40 : 50,
    suppressHorizontalScroll: isMobile
  }), [isMobile]);

  // Estados únicos para el filtro
  const estadosUnicos = useMemo(() => {
    const estados = [...new Set(products.map(p => p.EstadoStock))].filter(Boolean);
    return estados.sort((a, b) => {
      const order = { 'Critico': 1, 'Precaucion': 2, 'Dentro del rango': 3, 'Sobre Produccion': 4 };
      return (order[a] || 5) - (order[b] || 5);
    });
  }, [products]);

  // Filtrar productos basado en búsqueda y estado
  useEffect(() => {
    let filtered = products;

    // Filtro por texto (descripción o código)
    if (searchText.trim()) {
      filtered = filtered.filter(product => 
        product.DescripcionArticulo?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.CodigoDeArticulo?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por estado
    if (selectedEstado) {
      filtered = filtered.filter(product => product.EstadoStock === selectedEstado);
    }

    setFilteredProducts(filtered);
  }, [products, searchText, selectedEstado]);

  // Notificar cambios en los datos filtrados para actualizar KPIs
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredProducts);
    }
  }, [filteredProducts, onFilteredDataChange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="spinner w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
      {/* Header simplificado */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
        <div className="flex flex-col gap-4">
          {/* Título */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                Inventario de Productos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredProducts.length} de {products.length} productos
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">{filteredProducts.length}</div>
              <div className="text-xs text-gray-500">resultados</div>
            </div>
          </div>
          
          {/* Filtros adaptados para móvil */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Búsqueda por texto */}
            <div className="relative">
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                🔍 Buscar Producto
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por descripción o código..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="block w-full pl-4 pr-3 py-3 border border-gray-300 rounded-xl text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por estado */}
            <div>
              <label className={`block font-medium text-gray-700 mb-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                📊 Filtrar por Estado
              </label>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className={`block w-full pl-4 pr-8 py-3 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                <option value="">Todos los estados</option>
                {estadosUnicos.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtros activos */}
          {(searchText || selectedEstado) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">Filtros activos:</span>
              {searchText && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Búsqueda: "{searchText}"
                  <button
                    onClick={() => setSearchText('')}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedEstado && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Estado: {selectedEstado}
                  <button
                    onClick={() => setSelectedEstado('')}
                    className="ml-1 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchText('');
                  setSelectedEstado('');
                }}
                className="text-xs text-red-600 hover:text-red-800 underline"
              >
                Limpiar todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grilla simplificada */}
      <div className="p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V9a2 2 0 00-2-2H9a2 2 0 00-2 2v2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-500">Intenta cambiar los filtros para ver más resultados</p>
          </div>
        ) : (
          <div className="ag-theme-alpine rounded-xl overflow-hidden border border-gray-200" style={{ height: isMobile ? '400px' : '500px', width: '100%' }}>
            <style jsx global>{`
              .ag-theme-alpine {
                --ag-font-size: ${isMobile ? '11px' : '13px'};
                --ag-header-foreground-color: #374151;
                --ag-header-background-color: #f9fafb;
                --ag-odd-row-background-color: #ffffff;
                --ag-row-hover-color: #f3f4f6;
                --ag-selected-row-background-color: #eff6ff;
                --ag-border-color: #e5e7eb;
                --ag-cell-horizontal-border: solid #e5e7eb;
                --ag-row-border-color: #e5e7eb;
                --ag-header-cell-hover-background-color: #f3f4f6;
                --ag-header-cell-moving-background-color: #e5e7eb;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              }
              .ag-header-cell-text {
                font-weight: 600;
                font-size: ${isMobile ? '10px' : '12px'} !important;
              }
              .ag-paging-panel {
                border-top: 1px solid #e5e7eb;
                padding: ${isMobile ? '8px 12px' : '16px'};
                background-color: #f9fafb;
              }
              .ag-paging-button {
                margin: 0 ${isMobile ? '1px' : '4px'};
                padding: ${isMobile ? '4px 6px' : '6px 12px'};
                border-radius: 6px;
                border: 1px solid #d1d5db;
                background: white;
                color: #374151;
                font-size: ${isMobile ? '10px' : '13px'};
              }
              .ag-paging-button:hover {
                background-color: #f3f4f6;
                border-color: #9ca3af;
              }
              .ag-paging-button[disabled] {
                opacity: 0.5;
                cursor: not-allowed;
              }
              .ag-paging-page-summary-panel {
                font-size: ${isMobile ? '10px' : '13px'};
              }
              @media (max-width: 768px) {
                .ag-center-cols-container {
                  touch-action: pan-x pan-y;
                }
              }
            `}</style>
            <AgGridReact
              rowData={filteredProducts}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              gridOptions={gridOptions}
              suppressMenuHide={true}
              enableCellTextSelection={!isMobile}
              ensureDomOrder={true}
            />
          </div>
        )}
      </div>
      
      {/* Leyenda simplificada */}
      {filteredProducts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-red-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Estados de Stock:</h4>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center">
                  <span className="status-critico mr-2">Crítico</span>
                  <span className="text-gray-600">Stock agotado</span>
                </span>
                <span className="flex items-center">
                  <span className="status-precaucion mr-2">Precaución</span>
                  <span className="text-gray-600">Stock bajo</span>
                </span>
                <span className="flex items-center">
                  <span className="status-dentro-del-rango mr-2">Normal</span>
                  <span className="text-gray-600">Stock OK</span>
                </span>
                <span className="flex items-center">
                  <span className="status-sobre-produccion mr-2">Exceso</span>
                  <span className="text-gray-600">Sobrestock</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">
                Mostrando {Math.min(25, filteredProducts.length)} de {filteredProducts.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 