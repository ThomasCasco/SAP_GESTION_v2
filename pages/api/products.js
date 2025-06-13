/**
 * API Route para obtener productos desde el servidor Express
 * GET /api/products - Proxy hacia el servidor Express con ngrok
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido' 
    });
  }

  try {
    console.log('🔄 Conectando al servidor Express via ngrok...');
    
    // URL del servidor Express a través de ngrok
    // Esta URL debe configurarse como variable de entorno
    const serverUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:4353';
    const apiUrl = `${serverUrl}/api/productos-sap`;
    
    console.log(`📡 Haciendo request a: ${apiUrl}`);

    // Realizar request al servidor Express
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SAP-Client/1.0'
      },
      // Timeout de 30 segundos
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      throw new Error(`Error del servidor Express: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log(`✅ Datos recibidos del servidor Express:`, {
      success: data.success,
      total: data.total,
      timestamp: data.timestamp
    });

    // Verificar que la respuesta tenga el formato esperado
    if (!data.success || !data.data) {
      throw new Error('Formato de respuesta inválido del servidor Express');
    }

    // Procesar los datos para asegurar consistencia
    const productos = data.data.map(producto => ({
      ...producto,
      StockProducto: parseFloat(producto.StockProducto) || 0,
      StockSeguridad: parseFloat(producto.StockSeguridad) || 0,
      PuntoDeReOrden: parseFloat(producto.PuntoDeReOrden) || 0,
      PromedioStock: parseFloat(producto.PromedioStock) || 0
    }));

    console.log(`📊 Productos procesados: ${productos.length}`);

    // Retornar los productos en el formato esperado por el frontend
    res.status(200).json(productos);

  } catch (error) {
    console.error('❌ Error obteniendo productos del servidor Express:', error.message);
    
    // Determinar el tipo de error y responder apropiadamente
    if (error.name === 'AbortError') {
      res.status(408).json({ 
        success: false, 
        message: 'Timeout conectando al servidor Express',
        error: 'La conexión tardó demasiado tiempo'
      });
    } else if (error.message.includes('fetch')) {
      res.status(503).json({ 
        success: false, 
        message: 'Servidor Express no disponible',
        error: 'No se pudo conectar al servidor de datos'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  }
} 