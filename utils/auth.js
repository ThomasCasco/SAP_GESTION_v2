import Cookies from 'js-cookie';

// Credenciales hardcodeadas para el sistema de login
const VALID_CREDENTIALS = {
  'admin': 'password123',
  'alex.kruszewski': 'Imsa.2025!',
  'thomas.casco': 'Haru.2025',
  'juan.duran': 'imsa.2025'
};

// Nombre de la cookie para la sesión
const AUTH_COOKIE_NAME = 'sap_auth_token';

/**
 * Valida las credenciales del usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {boolean} - True si las credenciales son válidas
 */
export const validateCredentials = (username, password) => {
  return VALID_CREDENTIALS[username] === password;
};

/**
 * Establece el token de autenticación y el usuario en las cookies
 * @param {string} token - Token de autenticación
 * @param {string} username - Nombre del usuario
 */
export const setAuthToken = (token, username = null) => {
  Cookies.set(AUTH_COOKIE_NAME, token, { 
    expires: 1, // 1 día
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  if (username) {
    Cookies.set('sap_username', username, { 
      expires: 1, // 1 día
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  }
};

/**
 * Obtiene el token de autenticación de las cookies
 * @returns {string|null} - Token de autenticación o null si no existe
 */
export const getAuthToken = () => {
  return Cookies.get(AUTH_COOKIE_NAME) || null;
};

/**
 * Obtiene el nombre del usuario autenticado
 * @returns {string|null} - Nombre del usuario o null si no existe
 */
export const getUsername = () => {
  return Cookies.get('sap_username') || null;
};

/**
 * Elimina el token de autenticación y el usuario de las cookies
 */
export const removeAuthToken = () => {
  Cookies.remove(AUTH_COOKIE_NAME);
  Cookies.remove('sap_username');
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} - True si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = getAuthToken();
  return token === 'authenticated';
};

/**
 * Genera un token simple para la sesión
 * @returns {string} - Token de sesión
 */
export const generateAuthToken = () => {
  return 'authenticated'; // Token simple para este ejemplo
}; 