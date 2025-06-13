import { validateCredentials, generateAuthToken } from '../../utils/auth';

/**
 * API Route para manejar la autenticación
 * POST /api/auth - Autenticar usuario
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Método no permitido' 
    });
  }

  try {
    const { username, password } = req.body;

    // Validar que se proporcionen las credenciales
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña son requeridos'
      });
    }

    // Validar las credenciales
    if (validateCredentials(username, password)) {
      const token = generateAuthToken();
      
      return res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        token: token,
        username: username
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
} 