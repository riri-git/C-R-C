/**
 * auth.js
 * Sistema de autenticación para la Plataforma de Ranking para Escaladores
 * v0.3
 */

// Importar configuración global desde main.js (asumiendo que está disponible globalmente)
const { CONFIG, APP_STATE, showNotification } = window.appUtils || {};

// Objeto principal para la autenticación
const AUTH = {
    // Constantes para almacenamiento local
    TOKEN_KEY: 'auth_token',
    USER_DATA_KEY: 'user_data',
    
    // Duración del token en milisegundos (7 días)
    TOKEN_DURATION: 7 * 24 * 60 * 60 * 1000,
    
    /**
     * Registra un nuevo usuario
     * @param {string} username - Nombre de usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {Promise} - Promesa con el resultado del registro
     */
    register: async function(username, email, password) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en el registro');
            }
            
            showNotification('Registro exitoso. Por favor, inicia sesión.', 'success');
            return data;
            
        } catch (error) {
            console.error('Error en registro:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    /**
     * Inicia sesión de usuario
     * @param {string} email - Correo electrónico
     * @param {string} password - Contraseña
     * @returns {Promise} - Promesa con el resultado del login
     */
    login: async function(email, password) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error en el inicio de sesión');
            }
            
            // Guardar token y datos de usuario
            this.setToken(data.token);
            this.setUserData(data.user);
            
            // Actualizar el estado global
            if (APP_STATE) {
                APP_STATE.isAuthenticated = true;
                APP_STATE.currentUser = data.user;
            }
            
            showNotification(`Bienvenido, ${data.user.username}!`, 'success');
            return data;
            
        } catch (error) {
            console.error('Error en login:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    /**
     * Cierra la sesión del usuario
     */
    logout: function() {
        // Eliminar token y datos de usuario
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_DATA_KEY);
        
        // Actualizar el estado global
        if (APP_STATE) {
            APP_STATE.isAuthenticated = false;
            APP_STATE.currentUser = null;
        }
        
        // Redirigir a la página de inicio
        window.location.href = '/index.html';
        
        showNotification('Sesión cerrada correctamente', 'info');
    },
    
    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} - true si está autenticado, false en caso contrario
     */
    isAuthenticated: function() {
        const token = this.getToken();
        if (!token) return false;
        
        // Verificar si el token ha expirado
        const tokenData = this.parseToken(token);
        if (!tokenData || tokenData.exp * 1000 < Date.now()) {
            this.logout();
            return false;
        }
        
        return true;
    },
    
    /**
     * Obtiene el token del almacenamiento local
     * @returns {string|null} - Token o null si no existe
     */
    getToken: function() {
        return localStorage.getItem(this.TOKEN_KEY);
    },
    
    /**
     * Guarda el token en el almacenamiento local
     * @param {string} token - Token a guardar
     */
    setToken: function(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },
    
    /**
     * Obtiene los datos del usuario del almacenamiento local
     * @returns {Object|null} - Datos del usuario o null si no existe
     */
    getUserData: function() {
        const userData = localStorage.getItem(this.USER_DATA_KEY);
        return userData ? JSON.parse(userData) : null;
    },
    
    /**
     * Guarda los datos del usuario en el almacenamiento local
     * @param {Object} userData - Datos del usuario a guardar
     */
    setUserData: function(userData) {
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    },
    
    /**
     * Decodifica un token JWT
     * @param {string} token - Token JWT
     * @returns {Object|null} - Datos decodificados o null si no es válido
     */
    parseToken: function(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error al decodificar token:', error);
            return null;
        }
    },
    
    /**
     * Actualiza los datos del usuario actual
     * @returns {Promise} - Promesa con el resultado de la actualización
     */
    refreshUserData: async function() {
        if (!this.isAuthenticated()) return null;
        
        try {
            const response = await fetch(`${CONFIG.API_URL}/user/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener datos del usuario');
            }
            
            // Actualizar datos del usuario
            this.setUserData(data.user);
            
            // Actualizar el estado global
            if (APP_STATE) {
                APP_STATE.currentUser = data.user;
            }
            
            return data.user;
            
        } catch (error) {
            console.error('Error al actualizar datos del usuario:', error);
            return null;
        }
    },
    
    /**
     * Envía un correo para restablecer la contraseña
     * @param {string} email - Correo electrónico del usuario
     * @returns {Promise} - Promesa con el resultado del envío
     */
    requestPasswordReset: async function(email) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al solicitar restablecimiento de contraseña');
            }
            
            showNotification('Se ha enviado un correo con instrucciones para restablecer tu contraseña', 'success');
            return data;
            
        } catch (error) {
            console.error('Error al solicitar restablecimiento de contraseña:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    },
    
    /**
     * Restablece la contraseña del usuario
     * @param {string} token - Token de restablecimiento
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise} - Promesa con el resultado del restablecimiento
     */
    resetPassword: async function(token, newPassword) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: newPassword })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Error al restablecer contraseña');
            }
            
            showNotification('Contraseña restablecida correctamente. Por favor, inicia sesión.', 'success');
            return data;
            
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            showNotification(error.message, 'error');
            throw error;
        }
    }
};

// Exportar para uso global
window.auth = AUTH;

// Inicializar estado de autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    // Si existe APP_STATE, actualizar con el estado de autenticación
    if (APP_STATE) {
        APP_STATE.isAuthenticated = AUTH.isAuthenticated();
        APP_STATE.currentUser = AUTH.getUserData();
        
        // Si hay una función para actualizar la UI, llamarla
        if (typeof updateUIForAuthState === 'function') {
            updateUIForAuthState();
        }
    }
    
    // Configurar eventos para formularios de autenticación
    setupAuthForms();
});

/**
 * Configura los listeners para los formularios de autenticación
 */
function setupAuthForms() {
    // Formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('[name="email"]').value;
            const password = this.querySelector('[name="password"]').value;
            
            try {
                await AUTH.login(email, password);
                // Redirigir a la página principal o de perfil
                window.location.href = '/profile.html';
            } catch (error) {
                // Error ya manejado en login()
            }
        });
    }
    
    // Formulario de registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = this.querySelector('[name="username"]').value;
            const email = this.querySelector('[name="email"]').value;
            const password = this.querySelector('[name="password"]').value;
            const confirmPassword = this.querySelector('[name="confirmPassword"]').value;
            
            // Validación básica
            if (password !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            try {
                await AUTH.register(username, email, password);
                // Redirigir al login
                window.location.href = '/login.html';
            } catch (error) {
                // Error ya manejado en register()
            }
        });
    }
    
    // Formulario de restablecimiento de contraseña
    const resetRequestForm = document.getElementById('resetRequestForm');
    if (resetRequestForm) {
        resetRequestForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = this.querySelector('[name="email"]').value;
            
            try {
                await AUTH.requestPasswordReset(email);
                // Mostrar mensaje de éxito (ya manejado en requestPasswordReset)
            } catch (error) {
                // Error ya manejado en requestPasswordReset()
            }
        });
    }
    
    // Formulario para nueva contraseña
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const newPassword = this.querySelector('[name="newPassword"]').value;
            const confirmPassword = this.querySelector('[name="confirmPassword"]').value;
            
            // Obtener token de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            
            if (!token) {
                showNotification('Token inválido o expirado', 'error');
                return;
            }
            
            // Validación básica
            if (newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                return;
            }
            
            try {
                await AUTH.resetPassword(token, newPassword);
                // Redirigir al login
                window.location.href = '/login.html';
            } catch (error) {
                // Error ya manejado en resetPassword()
            }
        });
    }
    
    // Botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            AUTH.logout();
        });
    }
}