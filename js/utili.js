/**
 * utils.js
 * 
 * Funciones de utilidad para la Plataforma de Ranking para Escaladores
 * Versión: 0.5
 */

/**
 * Muestra un mensaje de notificación al usuario
 * @param {string} message - Texto del mensaje
 * @param {string} type - Tipo de mensaje ('success', 'error', 'info', 'warning')
 * @param {number} duration - Duración en milisegundos (por defecto 3000ms)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar después del tiempo establecido
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, duration);
}

/**
 * Formatea una fecha a un formato legible
 * @param {Date|string} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'time', 'datetime')
 * @returns {string} - Fecha formateada
 */
function formatDate(date, format = 'short') {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
        return 'Fecha no válida';
    }
    
    const options = {
        short: { day: '2-digit', month: '2-digit', year: 'numeric' },
        long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    return dateObj.toLocaleDateString('es-ES', options[format] || options.short);
}

/**
 * Valida un correo electrónico
 * @param {string} email - Correo a validar
 * @returns {boolean} - Verdadero si el formato es válido
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Valida que la contraseña cumpla los requisitos mínimos
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - Verdadero si la contraseña es válida
 */
function isValidPassword(password) {
    // Al menos 8 caracteres, debe incluir números y letras
    return password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password);
}

/**
 * Debounce para limitar la frecuencia de ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} - Función con debounce
 */
function debounce(func, wait = 300) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

/**
 * Obtiene un parámetro de la URL
 * @param {string} name - Nombre del parámetro
 * @returns {string|null} - Valor del parámetro o null si no existe
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * Genera un ID único
 * @returns {string} - ID único
 */
function generateUID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Limita un texto a una longitud máxima
 * @param {string} text - Texto a limitar
 * @param {number} maxLength - Longitud máxima
 * @param {boolean} addEllipsis - Añadir puntos suspensivos
 * @returns {string} - Texto limitado
 */
function truncateText(text, maxLength = 100, addEllipsis = true) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + (addEllipsis ? '...' : '');
}

/**
 * Convierte una cadena a formato título (primera letra de cada palabra en mayúscula)
 * @param {string} str - Cadena a convertir
 * @returns {string} - Cadena en formato título
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Crea un elemento DOM con atributos y contenido
 * @param {string} tag - Etiqueta HTML
 * @param {Object} attributes - Atributos del elemento
 * @param {string|HTMLElement} content - Contenido del elemento
 * @returns {HTMLElement} - Elemento creado
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Añadir atributos
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    // Añadir contenido
    if (typeof content === 'string') {
        element.innerHTML = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    }
    
    return element;
}

/**
 * Añade múltiples event listeners a un elemento
 * @param {HTMLElement} element - Elemento al que añadir los listeners
 * @param {Object} events - Objeto con eventos y callbacks
 */
function addEventListeners(element, events) {
    Object.entries(events).forEach(([event, callback]) => {
        element.addEventListener(event, callback);
    });
}

/**
 * Serializa un formulario a un objeto
 * @param {HTMLFormElement} form - Formulario a serializar
 * @returns {Object} - Datos del formulario
 */
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave para almacenar
 * @param {any} value - Valor a almacenar
 */
function saveToStorage(key, value) {
    try {
        const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
    }
}

/**
 * Obtiene datos desde localStorage
 * @param {string} key - Clave a obtener
 * @param {boolean} parseJson - Si debe parsear como JSON
 * @returns {any} - Valor obtenido
 */
function getFromStorage(key, parseJson = true) {
    try {
        const value = localStorage.getItem(key);
        if (value === null) return null;
        return parseJson ? JSON.parse(value) : value;
    } catch (error) {
        console.error('Error al obtener desde localStorage:', error);
        return null;
    }
}

/**
 * Elimina datos desde localStorage
 * @param {string} key - Clave a eliminar
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error al eliminar desde localStorage:', error);
    }
}

/**
 * Detecta si se está en modo móvil
 * @returns {boolean} - Verdadero si es dispositivo móvil
 */
function isMobileDevice() {
    return window.innerWidth <= 768 || 'ontouchstart' in window;
}

// Exportar funciones para uso en otros módulos
// En un entorno de módulos podríamos usar export, pero por compatibilidad
// las exponemos en el objeto window
window.appUtils = {
    showNotification,
    formatDate,
    isValidEmail,
    isValidPassword,
    debounce,
    getUrlParam,
    generateUID,
    truncateText,
    toTitleCase,
    createElement,
    addEventListeners,
    serializeForm,
    saveToStorage,
    getFromStorage,
    removeFromStorage,
    isMobileDevice
};