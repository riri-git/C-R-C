/**
 * config.js
 * 
 * Configuración global para la Plataforma de Ranking para Escaladores
 * Versión: 0.5
 */

// Configuración de la API
const API_URL = 'https://api.escaladores-ranking.com/v1'; // Cambiar a la URL real cuando esté disponible
const API_TIMEOUT = 30000; // Tiempo máximo de espera para peticiones API (30 segundos)

// Configuración de la aplicación
const APP_CONFIG = {
    // Autenticación
    auth: {
        tokenName: 'auth_token',
        refreshTokenName: 'refresh_token',
        tokenExpiry: 7, // Días
        sessionTimeout: 30, // Minutos de inactividad antes de cerrar sesión
    },
    
    // Niveles de dificultad para escalada
    difficultyLevels: {
        boulder: ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15', 'V16', 'V17'],
        sportClimbing: ['5.5', '5.6', '5.7', '5.8', '5.9', '5.10a', '5.10b', '5.10c', '5.10d', '5.11a', '5.11b', '5.11c', '5.11d', '5.12a', '5.12b', '5.12c', '5.12d', '5.13a', '5.13b', '5.13c', '5.13d', '5.14a', '5.14b', '5.14c', '5.14d', '5.15a', '5.15b', '5.15c', '5.15d'],
        frenchScale: ['3', '4', '4+', '5', '5+', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b', '8b+', '8c', '8c+', '9a', '9a+', '9b', '9b+', '9c']
    },
    
    // Tipos de ascenso
    ascentTypes: [
        { id: 'flash', name: 'Flash', points: 1.2 },
        { id: 'onsight', name: 'Onsight', points: 1.5 },
        { id: 'redpoint', name: 'Redpoint', points: 1.0 },
        { id: 'toprope', name: 'Top Rope', points: 0.8 },
        { id: 'project', name: 'Proyecto', points: 0.5 }
    ],
    
    // Paginación
    pagination: {
        itemsPerPage: 10,
        maxPagesShown: 5
    },
    
    // Fechas
    dateFormat: {
        short: 'DD/MM/YYYY',
        long: 'D [de] MMMM [de] YYYY',
        time: 'HH:mm',
        datetime: 'DD/MM/YYYY HH:mm'
    },
    
    // Límites
    limits: {
        maxPhotosPerRoute: 3,
        maxCommentsPerPost: 50,
        maxCharactersInComment: 500,
        maxCharactersInBio: 1000
    },
    
    // Rutas de la aplicación
    routes: {
        home: 'index.html',
        login: 'login.html',
        register: 'register.html',
        resetPassword: 'reset-password.html',
        profile: 'profile.html',
        dashboard: 'dashboard.html',
        rankings: 'rankings.html',
        routes: 'routes.html',
        admin: 'admin/index.html'
    }
};

// Mensajes de la aplicación
const APP_MESSAGES = {
    // Errores
    errors: {
        general: 'Ha ocurrido un error. Por favor intenta de nuevo más tarde.',
        connection: 'Error de conexión. Verifica tu conexión a internet.',
        auth: {
            invalidCredentials: 'Credenciales inválidas. Por favor verifica tu correo y contraseña.',
            sessionExpired: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            unauthorized: 'No tienes permiso para realizar esta acción.',
            accountLocked: 'Tu cuenta ha sido bloqueada. Contacta a soporte.',
            weakPassword: 'La contraseña es demasiado débil. Debe tener al menos 8 caracteres, incluir números y letras.'
        },
        validation: {
            requiredField: 'Este campo es obligatorio.',
            invalidEmail: 'Por favor ingresa un correo electrónico válido.',
            passwordMismatch: 'Las contraseñas no coinciden.',
            invalidFormat: 'Formato no válido.'
        },
        data: {
            notFound: 'No se encontraron datos.',
            saveFailed: 'No se pudieron guardar los datos. Intenta nuevamente.'
        }
    },
    
    // Éxito
    success: {
        auth: {
            login: 'Has iniciado sesión correctamente.',
            register: 'Registro exitoso. Bienvenido a la plataforma.',
            logout: 'Has cerrado sesión correctamente.',
            passwordReset: 'Se han enviado instrucciones a tu correo electrónico.',
            passwordChanged: 'Contraseña actualizada correctamente.'
        },
        data: {
            saved: 'Datos guardados correctamente.',
            updated: 'Actualizado con éxito.',
            deleted: 'Eliminado correctamente.'
        }
    },
    
    // Información
    info: {
        loading: 'Cargando...',
        processing: 'Procesando...',
        confirmDelete: '¿Estás seguro de que deseas eliminar esto? Esta acción no se puede deshacer.',
        noResults: 'No se encontraron resultados.'
    }
};

// Exponer la configuración globalmente
window.API_URL = API_URL;
window.API_TIMEOUT = API_TIMEOUT;
window.APP_CONFIG = APP_CONFIG;
window.APP_MESSAGES = APP_MESSAGES;