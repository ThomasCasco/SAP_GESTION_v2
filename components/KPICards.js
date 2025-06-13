import { useMemo } from 'react';

/**
 * Componente para mostrar las tarjetas de KPIs
 * Calcula y muestra estadísticas importantes de los productos
 */
export default function KPICards({ products = [] }) {
  // Calcular KPIs usando useMemo para optimización
  const kpis = useMemo(() => {
    if (!products.length) {
      return {
        criticos: 0,
        precaucion: 0,
        dentroDentroRango: 0,
        sobreProduccion: 0,
        porcentajeCriticos: 0,
        porcentajePrecaucion: 0,
        porcentajeDentroRango: 0,
        porcentajeSobreProduccion: 0,
        promedioStock: 0,
        porcentajeConDespachos: 0,
        ultimaFechaNEC: null
      };
    }

    // Conteo por estados
    const criticos = products.filter(p => p.EstadoStock === 'Critico').length;
    const precaucion = products.filter(p => p.EstadoStock === 'Precaucion').length;
    const dentroRango = products.filter(p => p.EstadoStock === 'Dentro del rango').length;
    const sobreProduccion = products.filter(p => p.EstadoStock === 'Sobre Produccion').length;
    
    // Porcentajes por estado
    const porcentajeCriticos = (criticos / products.length) * 100;
    const porcentajePrecaucion = (precaucion / products.length) * 100;
    const porcentajeDentroRango = (dentroRango / products.length) * 100;
    const porcentajeSobreProduccion = (sobreProduccion / products.length) * 100;
    
    // Promedio de stock de productos
    const totalStock = products.reduce((sum, p) => sum + (p.StockProducto || 0), 0);
    const promedioStock = totalStock / products.length;
    
    // Porcentaje de productos con despachos pendientes
    const conDespachos = products.filter(p => (p.DespachosPendientes || 0) > 0).length;
    const porcentajeConDespachos = (conDespachos / products.length) * 100;
    
    // Fecha más reciente de UltimaNE-C-Cables
    const fechasValidas = products
      .map(p => p.UltimaNE_C_Cables)
      .filter(fecha => fecha !== null && fecha !== undefined)
      .map(fecha => new Date(fecha))
      .filter(fecha => !isNaN(fecha.getTime()));
    
    const ultimaFechaNEC = fechasValidas.length > 0 
      ? new Date(Math.max(...fechasValidas))
      : null;

    return {
      criticos,
      precaucion,
      dentroRango,
      sobreProduccion,
      porcentajeCriticos,
      porcentajePrecaucion,
      porcentajeDentroRango,
      porcentajeSobreProduccion,
      promedioStock,
      porcentajeConDespachos,
      ultimaFechaNEC
    };
  }, [products]);

  const kpiCards = [
    // Estados Críticos
    {
      title: 'Críticos',
      value: kpis.criticos,
      subtitle: `${kpis.porcentajeCriticos.toFixed(1)}%`,
      icon: '🔴',
      gradient: 'from-red-600 to-red-800',
      textColor: 'text-white',
      description: 'Productos con stock crítico',
      trend: kpis.criticos > 0 ? 'up' : 'stable'
    },
    {
      title: 'Precaución',
      value: kpis.precaucion,
      subtitle: `${kpis.porcentajePrecaucion.toFixed(1)}%`,
      icon: '⚠️',
      gradient: 'from-orange-500 to-orange-700',
      textColor: 'text-white',
      description: 'Productos con stock bajo',
      trend: kpis.precaucion > 0 ? 'warning' : 'stable'
    },
    {
      title: 'Normal',
      value: kpis.dentroRango,
      subtitle: `${kpis.porcentajeDentroRango.toFixed(1)}%`,
      icon: '✅',
      gradient: 'from-green-500 to-green-700',
      textColor: 'text-white',
      description: 'Productos con stock normal',
      trend: 'down'
    },
    {
      title: 'Exceso',
      value: kpis.sobreProduccion,
      subtitle: `${kpis.porcentajeSobreProduccion.toFixed(1)}%`,
      icon: '📈',
      gradient: 'from-blue-500 to-blue-700',
      textColor: 'text-white',
      description: 'Productos con sobrestock',
      trend: kpis.sobreProduccion > 0 ? 'up' : 'stable'
    },
    // KPIs Adicionales
    {
      title: 'Promedio Stock',
      value: kpis.promedioStock.toFixed(0),
      subtitle: 'unidades',
      icon: '📊',
      gradient: 'from-gray-600 to-gray-800',
      textColor: 'text-white',
      description: 'Stock promedio por producto',
      trend: 'stable'
    },
    {
      title: 'Con Despachos',
      value: `${kpis.porcentajeConDespachos.toFixed(1)}%`,
      subtitle: 'pendientes',
      icon: '📦',
      gradient: 'from-purple-500 to-purple-700',
      textColor: 'text-white',
      description: 'Productos con despachos pendientes',
      trend: kpis.porcentajeConDespachos > 50 ? 'up' : 'stable'
    },
    {
      title: 'Última NE-C',
      value: kpis.ultimaFechaNEC 
        ? kpis.ultimaFechaNEC.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short'
          })
        : 'N/A',
      subtitle: 'cables',
      icon: '📅',
      gradient: 'from-indigo-500 to-indigo-700',
      textColor: 'text-white',
      description: 'Fecha más reciente de NE-C',
      trend: 'stable'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-red-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="mb-8">
      {/* Título de sección mejorado */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Control</h2>
        <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full"></div>
        <p className="text-gray-600 mt-3">Distribución completa del inventario por estados</p>
      </div>
      
      {/* Estados de Stock */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          Estados de Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.slice(0, 4).map((kpi, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Fondo con gradiente */}
              <div className={`bg-gradient-to-br ${kpi.gradient} p-5 relative`}>
                {/* Patrón de fondo sutil */}
                <div className="absolute inset-0 bg-white opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}></div>
                </div>
                
                {/* Contenido */}
                <div className="relative z-10">
                  {/* Header del KPI */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl opacity-90">{kpi.icon}</div>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(kpi.trend)}
                    </div>
                  </div>
                  
                  {/* Título */}
                  <h3 className={`text-sm font-semibold ${kpi.textColor} opacity-90 mb-1 leading-tight`}>
                    {kpi.title}
                  </h3>
                  
                  {/* Valor principal */}
                  <div className={`text-2xl font-bold ${kpi.textColor} mb-1 tracking-tight`}>
                    {kpi.value}
                  </div>
                  
                  {/* Subtítulo (porcentaje o unidad) */}
                  <div className={`text-sm font-medium ${kpi.textColor} opacity-80 mb-2`}>
                    {kpi.subtitle}
                  </div>
                  
                  {/* Descripción */}
                  <p className={`text-xs ${kpi.textColor} opacity-75 leading-relaxed`}>
                    {kpi.description}
                  </p>
                  
                  {/* Barra de progreso decorativa */}
                  <div className="mt-3 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white bg-opacity-40 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min((parseFloat(kpi.subtitle) || 0), 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {/* Efecto de brillo al hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-700 -translate-x-full group-hover:translate-x-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs Adicionales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
          Métricas Adicionales
        </h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {kpiCards.slice(4).map((kpi, index) => (
             <div
               key={index + 4}
               className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
             >
               {/* Fondo con gradiente */}
               <div className={`bg-gradient-to-br ${kpi.gradient} p-6 relative`}>
                 {/* Patrón de fondo sutil */}
                 <div className="absolute inset-0 bg-white opacity-5">
                   <div className="absolute inset-0" style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                   }}></div>
                 </div>
                 
                 {/* Contenido */}
                 <div className="relative z-10">
                   {/* Header del KPI */}
                   <div className="flex items-center justify-between mb-4">
                     <div className="text-3xl opacity-90">{kpi.icon}</div>
                     <div className="flex items-center space-x-1">
                       {getTrendIcon(kpi.trend)}
                     </div>
                   </div>
                   
                   {/* Título */}
                   <h3 className={`text-sm font-semibold ${kpi.textColor} opacity-90 mb-1 leading-tight`}>
                     {kpi.title}
                   </h3>
                   
                   {/* Valor principal */}
                   <div className={`text-3xl font-bold ${kpi.textColor} mb-1 tracking-tight`}>
                     {kpi.value}
                   </div>
                   
                   {/* Subtítulo (porcentaje o unidad) */}
                   <div className={`text-sm font-medium ${kpi.textColor} opacity-80 mb-2`}>
                     {kpi.subtitle}
                   </div>
                   
                   {/* Descripción */}
                   <p className={`text-xs ${kpi.textColor} opacity-75 leading-relaxed`}>
                     {kpi.description}
                   </p>
                   
                   {/* Barra de progreso decorativa */}
                   <div className="mt-4 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-white bg-opacity-40 rounded-full transition-all duration-1000 ease-out"
                       style={{ width: `${Math.min((kpi.value || 0) / 100 * 100, 100)}%` }}
                     ></div>
                   </div>
                 </div>
                 
                 {/* Efecto de brillo al hover */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 transition-all duration-700 -translate-x-full group-hover:translate-x-full"></div>
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
} 