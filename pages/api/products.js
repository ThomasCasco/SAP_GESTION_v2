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
    console.log('🌍 Environment:', process.env.NODE_ENV);
    
    // URL del servidor Express a través de ngrok
    const serverUrl = process.env.EXPRESS_SERVER_URL || 'http://localhost:4353';
    const apiUrl = `${serverUrl}/api/productos-sap`;
    
    console.log(`📡 Haciendo request a: ${apiUrl}`);
    console.log('🔑 Server URL configured:', serverUrl ? 'Yes' : 'No');

    // Realizar request al servidor Express con timeout más corto para Vercel
    const timeoutMs = process.env.NODE_ENV === 'production' ? 20000 : 30000;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-SAP-Client/1.0',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: AbortSignal.timeout(timeoutMs)
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

    // ✅ CORRECCIÓN: Retornar en el formato que espera el frontend
    res.status(200).json({
      success: true,
      data: productos,
      total: productos.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo productos del servidor Express:', error.message);
    console.error('❌ Error type:', error.name);
    console.error('❌ Full error:', error);
    
    // Determinar el tipo de error y responder apropiadamente
    if (error.name === 'AbortError') {
      console.error('⏰ Timeout error - servidor tardó demasiado');
      res.status(408).json({ 
        success: false, 
        message: 'Timeout conectando al servidor Express',
        error: 'La conexión tardó demasiado tiempo',
        details: `Timeout después de ${process.env.NODE_ENV === 'production' ? 20 : 30} segundos`
      });
    } else if (error.message.includes('fetch') || error.code === 'ENOTFOUND') {
      console.error('🌐 Network error - no se pudo conectar');
      res.status(503).json({ 
        success: false, 
        message: 'Servidor Express no disponible',
        error: 'No se pudo conectar al servidor de datos',
        details: error.message
      });
    } else {
      console.error('💥 Generic error');
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
} 