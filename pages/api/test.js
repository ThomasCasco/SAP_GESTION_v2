/**
 * API de prueba para verificar que Vercel funciona correctamente
 * GET /api/test - Devuelve información del sistema
 */
export default async function handler(req, res) {
  try {
    const testData = {
      success: true,
      message: "API funcionando correctamente en Vercel",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      expressServerUrl: process.env.EXPRESS_SERVER_URL ? "Configurada" : "No configurada",
      server: "Vercel",
      testEndpoint: true
    };

    console.log("🧪 Test endpoint called:", testData);
    
    res.status(200).json(testData);
    
  } catch (error) {
    console.error("❌ Error in test endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Error en endpoint de prueba",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 