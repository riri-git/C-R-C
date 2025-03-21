/**
 * main.js - Funciones principales para la plataforma de escaladores
 * Versión: 0.1
 * Este archivo contiene utilidades y funciones globales utilizadas en toda la aplicación
 */

// Configuración global
const CONFIG = {
    apiUrl: 'https://api.escalada-ranking.com', // Cambia esto por tu API real cuando esté disponible
    defaultImage: '/img/default-profile.jpg',
    maxGalleryImages: 20,
    rankingPerPage: 10
  };
  
  // Estado global de la aplicación
  const APP_STATE = {
    currentUser: null,
    isLoggedIn: false,
    lastUpdated: null
  };
  
  /**
   * Verifica si el usuario está autenticado
   * @returns {boolean} - Estado de autenticación
   */
  function isAuthenticated() {
    // Verificar si hay un token guardado en localStorage
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }
    
    // Verificar si el token es válido (no está caducado)
    try {
      // Esta es una verificación básica, en producción deberías verificar con el servidor
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiry = tokenData.exp * 1000; // Convertir a milisegundos
      const isValid = Date.now() < expiry;
      
      APP_STATE.isLoggedIn = isValid;
      return isValid;
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      return false;
    }
  }
  
  /**
   * Carga información del usuario desde localStorage o desde la API
   * @returns {Promise<Object>} - Datos del usuario
   */
  async function loadUserData() {
    if (APP_STATE.currentUser) {
      return APP_STATE.currentUser;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return null;
      }
      
      // En un entorno real, harías una petición a la API
      // Por ahora, simulamos datos desde localStorage para desarrollo
      const userData = localStorage.getItem('user_data');
      if (userData) {
        APP_STATE.currentUser = JSON.parse(userData);
        return APP_STATE.currentUser;
      }
      
      // Si llegamos aquí, necesitaríamos obtener los datos de la API
      // Simulamos una petición para propósitos de desarrollo
      const mockUserData = {
        id: '123456',
        username: 'escalador_demo',
        fullName: 'Escalador Demo',
        level: 'Intermedio',
        registeredDate: '2025-01-15',
        totalRoutes: 47,
        profileImage: CONFIG.defaultImage
      };
      
      localStorage.setItem('user_data', JSON.stringify(mockUserData));
      APP_STATE.currentUser = mockUserData;
      return mockUserData;
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      return null;
    }
  }
  
  /**
   * Formatea una fecha en formato legible
   * @param {string|Date} date - Fecha a formatear
   * @returns {string} - Fecha formateada
   */
  function formatDate(date) {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  /**
   * Calcula la puntuación de un usuario basado en sus rutas completadas
   * @param {Array} routes - Array de rutas completadas
   * @returns {number} - Puntuación total
   */
  function calculateScore(routes) {
    if (!routes || !Array.isArray(routes)) {
      return 0;
    }
    
    return routes.reduce((total, route) => {
      // Convertir grado a valor numérico (ejemplo simplificado)
      const difficulty = convertGradeToValue(route.grade);
      
      // Multiplicadores según tipo de encadene
      const multipliers = {
        'vista': 1.5,   // A vista (sin información previa) - mayor valor
        'flash': 1.2,   // Flash (con información) - valor intermedio
        'repeticion': 1 // Repetición - valor base
      };
      
      // Aplicar multiplicador según el tipo de encadene
      const multiplier = multipliers[route.type] || 1;
      
      return total + (difficulty * multiplier);
    }, 0);
  }
  
  /**
   * Convierte un grado de escalada a valor numérico
   * @param {string} grade - Grado en formato de escalada (6a, 7c, etc.)
   * @returns {number} - Valor numérico
   */
  function convertGradeToValue(grade) {
    // Sistema simplificado para grados franceses
    // En una implementación real, considerarías diferentes sistemas de graduación
    const gradeMap = {
      '3': 300, '3+': 350,
      '4': 400, '4+': 450,
      '5a': 500, '5a+': 525, '5b': 550, '5b+': 575, '5c': 600, '5c+': 625,
      '6a': 650, '6a+': 675, '6b': 700, '6b+': 725, '6c': 750, '6c+': 775,
      '7a': 800, '7a+': 825, '7b': 850, '7b+': 875, '7c': 900, '7c+': 925,
      '8a': 950, '8a+': 975, '8b': 1000, '8b+': 1025, '8c': 1050, '8c+': 1075,
      '9a': 1100, '9a+': 1125, '9b': 1150, '9b+': 1175, '9c': 1200
    };
    
    return gradeMap[grade] || 0;
  }
  
  /**
   * Muestra un mensaje de notificación al usuario
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje (success, error, warning, info)
   * @param {number} duration - Duración en milisegundos
   */
  function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Añadir al DOM
    const container = document.querySelector('.notification-container') || document.body;
    container.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Ocultar después de la duración especificada
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300); // Tiempo para la animación de salida
    }, duration);
  }
  
  /**
   * Inicializa la aplicación cuando el DOM está listo
   */
  document.addEventListener('DOMContentLoaded', () => {
    // Comprobar autenticación e inicializar componentes
    const isLoggedIn = isAuthenticated();
    console.log('Estado de autenticación:', isLoggedIn);
    
    // Actualizar elementos de interfaz según estado de autenticación
    updateUIForAuthState(isLoggedIn);
    
    // Inicializar componentes específicos de cada página
    initializePageComponents();
  });
  
  /**
   * Actualiza la interfaz según el estado de autenticación
   * @param {boolean} isLoggedIn - Si el usuario está autenticado
   */
  function updateUIForAuthState(isLoggedIn) {
    // Elementos que se muestran cuando el usuario está autenticado
    const authElements = document.querySelectorAll('.auth-required');
    // Elementos que se muestran cuando el usuario NO está autenticado
    const nonAuthElements = document.querySelectorAll('.non-auth-required');
    
    authElements.forEach(el => {
      el.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    nonAuthElements.forEach(el => {
      el.style.display = isLoggedIn ? 'none' : 'block';
    });
    
    // Si está autenticado, cargar y mostrar información del usuario
    if (isLoggedIn) {
      loadUserData().then(userData => {
        // Actualizar elementos que muestran información del usuario
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(el => {
          el.textContent = userData.username;
        });
        
        // Actualizar foto de perfil si existe
        const profileImages = document.querySelectorAll('.profile-image');
        profileImages.forEach(img => {
          img.src = userData.profileImage || CONFIG.defaultImage;
          img.alt = userData.username;
        });
      });
    }
  }
  
  /**
   * Inicializa componentes específicos según la página actual
   */
  function initializePageComponents() {
    // Detectar qué página está cargada actualmente
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
      case 'index.html':
        // Inicializar componentes de la página principal
        initHomePageComponents();
        break;
      case 'ranking.html':
        // Inicializar tabla de ranking
        // Esta función se definirá en ranking.js
        if (typeof initRankingTable === 'function') {
          initRankingTable();
        }
        break;
      case 'profile.html':
        // Inicializar perfil
        // Esta función se definirá en profile.js
        if (typeof initUserProfile === 'function') {
          initUserProfile();
        }
        break;
      case 'gallery.html':
        // Inicializar galería
        // Esta función se definirá en gallery.js
        if (typeof initGallery === 'function') {
          initGallery();
        }
        break;
      // ... otros casos para otras páginas
    }
  }
  
  /**
   * Inicializa componentes específicos de la página principal
   */
  function initHomePageComponents() {
    // Cargar top ranking para mostrar en la página principal
    loadTopRanking(3).then(topUsers => {
      displayTopUsers(topUsers);
    });
    
    // Cargar fotos destacadas
    loadFeaturedPhotos(3).then(photos => {
      displayFeaturedPhotos(photos);
    });
    
    // Cargar eventos próximos
    loadUpcomingEvents(3).then(events => {
      displayUpcomingEvents(events);
    });
  }
  
  /**
   * Carga los usuarios mejor clasificados
   * @param {number} limit - Número de usuarios a cargar
   * @returns {Promise<Array>} - Array de usuarios top
   */
  async function loadTopRanking(limit = 10) {
    // En una implementación real, esto se cargaría desde la API
    // Por ahora usamos datos de ejemplo
    const mockTopUsers = [
      { id: '1', username: 'escalador_pro', score: 15750, level: 'Elite', profileImage: '/img/user1.jpg' },
      { id: '2', username: 'roca_master', score: 14800, level: 'Avanzado', profileImage: '/img/user2.jpg' },
      { id: '3', username: 'vertical_queen', score: 13900, level: 'Elite', profileImage: '/img/user3.jpg' },
      { id: '4', username: 'boulder_king', score: 13200, level: 'Avanzado', profileImage: '/img/user4.jpg' },
      { id: '5', username: 'alpine_climber', score: 12600, level: 'Experto', profileImage: '/img/user5.jpg' }
    ];
    
    return mockTopUsers.slice(0, limit);
  }
  
  /**
   * Muestra los usuarios top en el DOM
   * @param {Array} users - Array de usuarios top
   */
  function displayTopUsers(users) {
    const container = document.querySelector('#top-ranking-container');
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar contenedor
    
    users.forEach((user, index) => {
      const userElement = document.createElement('div');
      userElement.className = 'ranking-item';
      userElement.innerHTML = `
        <div class="ranking-position">${index + 1}</div>
        <div class="ranking-user">
          <img src="${user.profileImage || CONFIG.defaultImage}" alt="${user.username}" class="ranking-user-image">
          <div class="ranking-user-info">
            <h3>${user.username}</h3>
            <span class="ranking-user-level">${user.level}</span>
          </div>
        </div>
        <div class="ranking-score">${user.score.toLocaleString()}</div>
      `;
      
      // Añadir evento para ir al perfil del usuario
      userElement.addEventListener('click', () => {
        window.location.href = `profile.html?id=${user.id}`;
      });
      
      container.appendChild(userElement);
    });
  }
  
  /**
   * Carga fotos destacadas
   * @param {number} limit - Número de fotos a cargar
   * @returns {Promise<Array>} - Array de fotos destacadas
   */
  async function loadFeaturedPhotos(limit = 3) {
    // En una implementación real, esto se cargaría desde la API
    // Por ahora usamos datos de ejemplo
    const mockPhotos = [
      { 
        id: '1', 
        title: 'El Capitan, Yosemite', 
        url: '/img/photo1.jpg', 
        votes: 156, 
        user: { id: '2', username: 'roca_master' },
        routeGrade: '7b'
      },
      { 
        id: '2', 
        title: 'Siurana, España', 
        url: '/img/photo2.jpg', 
        votes: 143, 
        user: { id: '3', username: 'vertical_queen' },
        routeGrade: '8a'
      },
      { 
        id: '3', 
        title: 'Fontainebleau, Francia', 
        url: '/img/photo3.jpg', 
        votes: 129, 
        user: { id: '1', username: 'escalador_pro' },
        routeGrade: '7c'
      }
    ];
    
    return mockPhotos.slice(0, limit);
  }
  
  /**
   * Muestra las fotos destacadas en el DOM
   * @param {Array} photos - Array de fotos destacadas
   */
  function displayFeaturedPhotos(photos) {
    const container = document.querySelector('#featured-photos-container');
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar contenedor
    
    photos.forEach(photo => {
      const photoElement = document.createElement('div');
      photoElement.className = 'featured-photo';
      photoElement.innerHTML = `
        <img src="${photo.url}" alt="${photo.title}" class="featured-photo-image">
        <div class="featured-photo-info">
          <h3>${photo.title}</h3>
          <p>Por <a href="profile.html?id=${photo.user.id}">${photo.user.username}</a></p>
          <div class="featured-photo-meta">
            <span class="featured-photo-grade">Grado: ${photo.routeGrade}</span>
            <span class="featured-photo-votes">❤️ ${photo.votes}</span>
          </div>
        </div>
      `;
      
      // Añadir evento para ver la foto en grande
      photoElement.querySelector('.featured-photo-image').addEventListener('click', () => {
        window.location.href = `gallery.html?photo=${photo.id}`;
      });
      
      container.appendChild(photoElement);
    });
  }
  
  /**
   * Carga eventos próximos
   * @param {number} limit - Número de eventos a cargar
   * @returns {Promise<Array>} - Array de eventos próximos
   */
  async function loadUpcomingEvents(limit = 3) {
    // En una implementación real, esto se cargaría desde la API
    // Por ahora usamos datos de ejemplo
    const mockEvents = [
      { 
        id: '1', 
        title: 'Campeonato Nacional de Escalada', 
        date: '2025-04-15', 
        location: 'Madrid, España',
        description: 'El evento más importante de escalada del año. Categorías: Boulder, Dificultad y Velocidad.'
      },
      { 
        id: '2', 
        title: 'Festival de Escalada Urbana', 
        date: '2025-05-10', 
        location: 'Barcelona, España',
        description: 'Escalada en estructuras urbanas adaptadas. Premios para diferentes categorías.'
      },
      { 
        id: '3', 
        title: 'Curso Avanzado de Escalada en Roca', 
        date: '2025-06-05', 
        location: 'Sierra de Gredos, España',
        description: 'Curso de dos días para escaladores intermedios y avanzados. Plazas limitadas.'
      }
    ];
    
    return mockEvents.slice(0, limit);
  }
  
  /**
   * Muestra los eventos próximos en el DOM
   * @param {Array} events - Array de eventos próximos
   */
  function displayUpcomingEvents(events) {
    const container = document.querySelector('#upcoming-events-container');
    if (!container) return;
    
    container.innerHTML = ''; // Limpiar contenedor
    
    events.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = 'event-card';
      eventElement.innerHTML = `
        <div class="event-date">${formatDate(event.date)}</div>
        <div class="event-content">
          <h3>${event.title}</h3>
          <p class="event-location">📍 ${event.location}</p>
          <p class="event-description">${event.description}</p>
        </div>
        <a href="event.html?id=${event.id}" class="event-details-btn">Ver detalles</a>
      `;
      
      container.appendChild(eventElement);
    });
  }
  
  // Exportar funciones para uso en otros módulos
  // Esto permite que otros archivos JS puedan utilizar estas funciones
  window.appUtils = {
    isAuthenticated,
    loadUserData,
    formatDate,
    calculateScore,
    showNotification,
    convertGradeToValue,
    CONFIG
  };