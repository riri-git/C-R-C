// dashboard.js - Sistema de visualización de rankings para la plataforma de escaladores

// Importar configuraciones y utilidades
import { firebaseConfig } from './config.js';
import { showLoading, hideLoading, showMessage } from './utils.js';

// Datos de ejemplo (en producción serían obtenidos desde Firebase)
const mockData = {
    users: [
        { id: 'u1', name: 'María López', totalPoints: 3450, highestDifficulty: '7b+', totalAscents: 24, location: 'Mendoza', photo: 'https://placehold.co/400?text=ML' },
        { id: 'u2', name: 'Carlos Ruiz', totalPoints: 2980, highestDifficulty: '7a', totalAscents: 18, location: 'Buenos Aires', photo: 'https://placehold.co/400?text=CR' },
        { id: 'u3', name: 'Ana Martínez', totalPoints: 4200, highestDifficulty: '7c', totalAscents: 32, location: 'Córdoba', photo: 'https://placehold.co/400?text=AM' },
        { id: 'u4', name: 'Fernando González', totalPoints: 5100, highestDifficulty: '8a+', totalAscents: 41, location: 'Bariloche', photo: 'https://placehold.co/400?text=FG' },
        { id: 'u5', name: 'Laura Sánchez', totalPoints: 3780, highestDifficulty: '7b', totalAscents: 29, location: 'Mendoza', photo: 'https://placehold.co/400?text=LS' },
        { id: 'u6', name: 'Diego Torres', totalPoints: 2640, highestDifficulty: '6c+', totalAscents: 22, location: 'Salta', photo: 'https://placehold.co/400?text=DT' },
        { id: 'u7', name: 'Valentina Castro', totalPoints: 4890, highestDifficulty: '8a', totalAscents: 37, location: 'Córdoba', photo: 'https://placehold.co/400?text=VC' },
        { id: 'u8', name: 'Matías Rodríguez', totalPoints: 3120, highestDifficulty: '7a+', totalAscents: 25, location: 'Buenos Aires', photo: 'https://placehold.co/400?text=MR' },
        { id: 'u9', name: 'Julia Peralta', totalPoints: 4350, highestDifficulty: '7c+', totalAscents: 33, location: 'San Juan', photo: 'https://placehold.co/400?text=JP' },
        { id: 'u10', name: 'Tomás Vargas', totalPoints: 3870, highestDifficulty: '7b+', totalAscents: 30, location: 'Mendoza', photo: 'https://placehold.co/400?text=TV' }
    ],
    zones: [
        { id: 'z1', name: 'El Chaltén' },
        { id: 'z2', name: 'Piedra Parada' },
        { id: 'z3', name: 'Los Gigantes' },
        { id: 'z4', name: 'Arenales' },
        { id: 'z5', name: 'La Buitrera' }
    ],
    categories: [
        { id: 'c1', name: 'General' },
        { id: 'c2', name: 'Femenino' },
        { id: 'c3', name: 'Masculino' },
        { id: 'c4', name: 'Junior (hasta 18 años)' },
        { id: 'c5', name: 'Senior (19-39 años)' },
        { id: 'c6', name: 'Master (40+ años)' }
    ],
    timeFrames: [
        { id: 't1', name: 'Todo el tiempo' },
        { id: 't2', name: 'Último año' },
        { id: 't3', name: 'Últimos 6 meses' },
        { id: 't4', name: 'Últimos 3 meses' },
        { id: 't5', name: 'Último mes' }
    ],
    // Simulación de ascensos recientes (top 10)
    topAscents: [
        { userId: 'u4', userName: 'Fernando González', routeName: 'Placa Negra', difficulty: '8a+', style: 'Redpoint', points: 765, date: '2024-01-15', zoneName: 'Los Gigantes' },
        { userId: 'u7', userName: 'Valentina Castro', routeName: 'Diedro Mágico', difficulty: '8a', style: 'Flash', points: 720, date: '2023-12-28', zoneName: 'Los Gigantes' },
        { userId: 'u9', userName: 'Julia Peralta', routeName: 'Travesía Norte', difficulty: '7c+', style: 'Onsight', points: 700, date: '2024-02-03', zoneName: 'Piedra Parada' },
        { userId: 'u3', userName: 'Ana Martínez', routeName: 'Directa al Sol', difficulty: '7c', style: 'Onsight', points: 675, date: '2023-11-12', zoneName: 'Arenales' },
        { userId: 'u10', userName: 'Tomás Vargas', routeName: 'La Vieja', difficulty: '7b+', style: 'Flash', points: 630, date: '2024-01-08', zoneName: 'Piedra Parada' },
        { userId: 'u5', userName: 'Laura Sánchez', routeName: 'El Paredón', difficulty: '7b', style: 'Onsight', points: 610, date: '2023-12-05', zoneName: 'Los Gigantes' },
        { userId: 'u8', userName: 'Matías Rodríguez', routeName: 'Pilar Central', difficulty: '7a+', style: 'Redpoint', points: 550, date: '2024-02-15', zoneName: 'El Chaltén' },
        { userId: 'u2', userName: 'Carlos Ruiz', routeName: 'Franco-Argentina', difficulty: '7a', style: 'Flash', points: 540, date: '2023-10-22', zoneName: 'El Chaltén' },
        { userId: 'u6', userName: 'Diego Torres', routeName: 'Directa Sur', difficulty: '6c+', style: 'Onsight', points: 480, date: '2024-01-30', zoneName: 'Piedra Parada' },
        { userId: 'u1', userName: 'María López', routeName: 'Supercanaleta', difficulty: '6b+', style: 'Onsight', points: 450, date: '2023-11-25', zoneName: 'El Chaltén' }
    ]
};

// Estado de la aplicación
const appState = {
    currentView: 'general', // 'general', 'zones', 'top-ascents'
    currentCategory: 'c1',  // ID de la categoría seleccionada
    currentZone: null,      // ID de la zona seleccionada
    currentTimeFrame: 't1', // ID del período de tiempo seleccionado
    sortField: 'totalPoints', // Campo por el que se ordena
    sortDirection: 'desc',  // 'asc' o 'desc'
    page: 1,                // Página actual
    itemsPerPage: 10,       // Elementos por página
    searchQuery: ''         // Texto de búsqueda
};

// Inicializar el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar autenticación
    checkAuth();
    
    // Cargar filtros y datos iniciales
    initializeFilters();
    loadCurrentUserStats();
    loadRankings();
    
    // Configurar listeners de eventos
    setupEventListeners();
});

// Verificar si el usuario está autenticado
function checkAuth() {
    // En producción, verificar con Firebase Authentication
    const mockUser = localStorage.getItem('currentUser');
    
    if (!mockUser) {
        // Redirigir al login si no hay usuario
        window.location.href = 'login.html';
    }
}

// Inicializar selectores de filtros
function initializeFilters() {
    // Cargar categorías
    const categorySelect = document.getElementById('category-filter');
    mockData.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    // Cargar zonas
    const zoneSelect = document.getElementById('zone-filter');
    zoneSelect.innerHTML = '<option value="">Todas las zonas</option>';
    mockData.zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.id;
        option.textContent = zone.name;
        zoneSelect.appendChild(option);
    });
    
    // Cargar períodos de tiempo
    const timeSelect = document.getElementById('time-filter');
    mockData.timeFrames.forEach(time => {
        const option = document.createElement('option');
        option.value = time.id;
        option.textContent = time.name;
        timeSelect.appendChild(option);
    });
}

// Cargar estadísticas del usuario actual
function loadCurrentUserStats() {
    try {
        // Obtener usuario actual
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Obtener estadísticas (en producción, esto vendría de Firebase)
        const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
        const stats = userStats[currentUser.uid] || {
            totalAscents: 0,
            totalPoints: 0,
            highestDifficulty: '-',
            ranking: 'N/A'
        };
        
        // Calcular ranking (simulado)
        const allUsers = [...mockData.users];
        allUsers.sort((a, b) => b.totalPoints - a.totalPoints);
        const userRanking = allUsers.findIndex(user => user.id === currentUser.uid) + 1;
        
        // Actualizar UI
        document.getElementById('user-total-points').textContent = stats.totalPoints || 0;
        document.getElementById('user-total-ascents').textContent = stats.totalAscents || 0;
        document.getElementById('user-highest-difficulty').textContent = stats.highestDifficulty || '-';
        document.getElementById('user-ranking').textContent = userRanking > 0 ? `#${userRanking}` : 'N/A';
        
    } catch (error) {
        console.error('Error al cargar estadísticas del usuario:', error);
    }
}

// Cargar rankings según filtros actuales
function loadRankings() {
    showLoading();
    
    try {
        // En producción, esta función haría una consulta a Firebase
        // con los filtros correspondientes
        
        // Obtener elementos del DOM para la tabla
        const tableBody = document.getElementById('rankings-body');
        const pagination = document.getElementById('pagination');
        
        // Limpiar tabla y paginación
        tableBody.innerHTML = '';
        pagination.innerHTML = '';
        
        // Determinar qué datos mostrar según la vista actual
        let dataToShow = [];
        
        if (appState.currentView === 'general') {
            // Obtener usuarios filtrados y ordenados
            dataToShow = filterUsers();
        } else if (appState.currentView === 'zones') {
            // Vista por zonas (implementar según necesidad)
            if (appState.currentZone) {
                // Mostrar rankings específicos de la zona seleccionada
                dataToShow = filterUsers().filter(user => {
                    // En un escenario real, filtrar por ascensos en la zona específica
                    return true; // Simulado
                });
            } else {
                // Mostrar resumen de zonas si no hay zona seleccionada
                renderZonesSummary();
                hideLoading();
                return;
            }
        } else if (appState.currentView === 'top-ascents') {
            // Mostrar tabla de mejores ascensos
            renderTopAscents();
            hideLoading();
            return;
        }
        
        // Calcular paginación
        const totalPages = Math.ceil(dataToShow.length / appState.itemsPerPage);
        const startIndex = (appState.page - 1) * appState.itemsPerPage;
        const pageItems = dataToShow.slice(startIndex, startIndex + appState.itemsPerPage);
        
        // Renderizar filas de la tabla
        pageItems.forEach((user, index) => {
            const position = startIndex + index + 1;
            const row = document.createElement('tr');
            
            // Determinar si es el usuario actual
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const isCurrentUser = currentUser && user.id === currentUser.uid;
            
            if (isCurrentUser) {
                row.classList.add('current-user-row');
            }
            
            row.innerHTML = `
                <td class="position">${position}</td>
                <td class="user-info">
                    <img src="${user.photo}" alt="${user.name}" class="user-avatar">
                    <div>
                        <span class="user-name">${user.name}</span>
                        <span class="user-location">${user.location}</span>
                    </div>
                </td>
                <td class="points">${user.totalPoints}</td>
                <td class="difficulty">${user.highestDifficulty}</td>
                <td class="ascents">${user.totalAscents}</td>
                <td>
                    <button class="view-profile-btn" data-userid="${user.id}">
                        Ver perfil
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Crear paginación
        renderPagination(totalPages);
        
        // Actualizar contador de resultados
        const resultsCount = document.getElementById('results-count');
        resultsCount.textContent = `${dataToShow.length} escaladores encontrados`;
        
    } catch (error) {
        console.error('Error al cargar rankings:', error);
        showMessage('Error al cargar los rankings', 'error');
    } finally {
        hideLoading();
    }
}

// Filtrar usuarios según criterios actuales
function filterUsers() {
    let filteredUsers = [...mockData.users];
    
    // Filtrar por búsqueda
    if (appState.searchQuery) {
        const query = appState.searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
            user.name.toLowerCase().includes(query) || 
            user.location.toLowerCase().includes(query)
        );
    }
    
    // En un entorno real, aquí se aplicarían más filtros:
    // - Por categoría (género, edad)
    // - Por zona
    // - Por período de tiempo
    
    // Ordenar según campo y dirección actual
    filteredUsers.sort((a, b) => {
        const fieldA = a[appState.sortField];
        const fieldB = b[appState.sortField];
        
        if (appState.sortDirection === 'asc') {
            return fieldA > fieldB ? 1 : -1;
        } else {
            return fieldA < fieldB ? 1 : -1;
        }
    });
    
    return filteredUsers;
}

// Renderizar resumen de zonas
function renderZonesSummary() {
    const container = document.getElementById('rankings-container');
    container.innerHTML = '';
    
    const zonesList = document.createElement('div');
    zonesList.className = 'zones-list';
    
    mockData.zones.forEach(zone => {
        const zoneCard = document.createElement('div');
        zoneCard.className = 'zone-card';
        zoneCard.innerHTML = `
            <h3>${zone.name}</h3>
            <div class="zone-stats">
                <div>
                    <span class="stat-number">32</span>
                    <span class="stat-label">Rutas</span>
                </div>
                <div>
                    <span class="stat-number">145</span>
                    <span class="stat-label">Ascensos</span>
                </div>
                <div>
                    <span class="stat-number">24</span>
                    <span class="stat-label">Usuarios</span>
                </div>
            </div>
            <div class="top-difficulty">
                <span>Dificultad máxima: <strong>8a</strong></span>
            </div>
            <button class="view-zone-btn" data-zoneid="${zone.id}">Ver detalles</button>
        `;
        
        zonesList.appendChild(zoneCard);
    });
    
    container.appendChild(zonesList);
}

// Renderizar mejores ascensos
function renderTopAscents() {
    const tableBody = document.getElementById('rankings-body');
    tableBody.innerHTML = '';
    
    // Cambiar encabezados de tabla
    const tableHeaders = document.getElementById('rankings-headers');
    tableHeaders.innerHTML = `
        <tr>
            <th>Pos.</th>
            <th>Escalador</th>
            <th>Ruta</th>
            <th>Dificultad</th>
            <th>Estilo</th>
            <th>Puntos</th>
            <th>Fecha</th>
        </tr>
    `;
    
    // Llenar tabla con mejores ascensos
    mockData.topAscents.forEach((ascent, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td class="position">${index + 1}</td>
            <td class="user-info">
                <div>
                    <span class="user-name">${ascent.userName}</span>
                </div>
            </td>
            <td class="route-info">
                <div>
                    <span class="route-name">${ascent.routeName}</span>
                    <span class="zone-name">${ascent.zoneName}</span>
                </div>
            </td>
            <td class="difficulty">${ascent.difficulty}</td>
            <td>${ascent.style}</td>
            <td class="points">${ascent.points}</td>
            <td>${formatDate(ascent.date)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Renderizar controles de paginación
function renderPagination(totalPages) {
    if (totalPages <= 1) return;
    
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    
    // Botón "Anterior"
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn prev-btn';
    prevBtn.textContent = '←';
    prevBtn.disabled = appState.page === 1;
    prevBtn.addEventListener('click', () => {
        if (appState.page > 1) {
            appState.page--;
            loadRankings();
        }
    });
    pagination.appendChild(prevBtn);
    
    // Números de página
    const startPage = Math.max(1, appState.page - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn page-num ${i === appState.page ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            appState.page = i;
            loadRankings();
        });
        pagination.appendChild(pageBtn);
    }
    
    // Botón "Siguiente"
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn next-btn';
    nextBtn.textContent = '→';
    nextBtn.disabled = appState.page === totalPages;
    nextBtn.addEventListener('click', () => {
        if (appState.page < totalPages) {
            appState.page++;
            loadRankings();
        }
    });
    pagination.appendChild(nextBtn);
}

// Configurar listeners de eventos
function setupEventListeners() {
    // Listener para cambio de categoría
    document.getElementById('category-filter').addEventListener('change', (e) => {
        appState.currentCategory = e.target.value;
        appState.page = 1;
        loadRankings();
    });
    
    // Listener para cambio de zona
    document.getElementById('zone-filter').addEventListener('change', (e) => {
        appState.currentZone = e.target.value;
        appState.page = 1;
        loadRankings();
    });
    
    // Listener para cambio de período de tiempo
    document.getElementById('time-filter').addEventListener('change', (e) => {
        appState.currentTimeFrame = e.target.value;
        appState.page = 1;
        loadRankings();
    });
    
    // Listener para búsqueda
    const searchInput = document.getElementById('search-input');
    const searchForm = document.getElementById('search-form');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        appState.searchQuery = searchInput.value.trim();
        appState.page = 1;
        loadRankings();
    });
    
    // Listener para limpiar búsqueda
    document.getElementById('clear-search').addEventListener('click', () => {
        searchInput.value = '';
        appState.searchQuery = '';
        appState.page = 1;
        loadRankings();
    });
    
    // Listeners para cambio de vista
    document.getElementById('view-general').addEventListener('click', () => {
        appState.currentView = 'general';
        updateActiveView();
        loadRankings();
    });
    
    document.getElementById('view-zones').addEventListener('click', () => {
        appState.currentView = 'zones';
        updateActiveView();
        loadRankings();
    });
    
    document.getElementById('view-top-ascents').addEventListener('click', () => {
        appState.currentView = 'top-ascents';
        updateActiveView();
        loadRankings();
    });
    
    // Listeners para ordenar por columnas (delegación de eventos)
    document.getElementById('rankings-headers').addEventListener('click', (e) => {
        const headerCell = e.target.closest('th[data-sort]');
        if (!headerCell) return;
        
        const field = headerCell.dataset.sort;
        
        // Si ya está ordenado por este campo, invertir dirección
        if (appState.sortField === field) {
            appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            appState.sortField = field;
            appState.sortDirection = 'desc'; // Por defecto, orden descendente
        }
        
        // Actualizar indicadores visuales
        updateSortIndicators();
        
        // Recargar con nuevo orden
        loadRankings();
    });
    
    // Listener para ver perfil de usuario (delegación de eventos)
    document.getElementById('rankings-body').addEventListener('click', (e) => {
        const profileBtn = e.target.closest('.view-profile-btn');
        if (!profileBtn) return;
        
        const userId = profileBtn.dataset.userid;
        if (userId) {
            // En producción, redirigir a perfil o mostrar modal
            window.location.href = `profile.html?id=${userId}`;
        }
    });
    
    // Listener para ver detalles de zona (delegación de eventos)
    document.addEventListener('click', (e) => {
        const zoneBtn = e.target.closest('.view-zone-btn');
        if (!zoneBtn) return;
        
        const zoneId = zoneBtn.dataset.zoneid;
        if (zoneId) {
            appState.currentZone = zoneId;
            document.getElementById('zone-filter').value = zoneId;
            loadRankings();
        }
    });
}

// Actualizar vista activa
function updateActiveView() {
    // Eliminar clase activa de todas las pestañas
    document.querySelectorAll('.view-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Añadir clase activa a la pestaña actual
    document.getElementById(`view-${appState.currentView}`).classList.add('active');
    
    // Actualizar visibilidad de filtros según la vista
    const filterContainer = document.getElementById('filters-container');
    
    if (appState.currentView === 'top-ascents') {
        filterContainer.style.display = 'none';
    } else {
        filterContainer.style.display = 'flex';
    }
    
    // Resetear encabezados de tabla para vista general
    if (appState.currentView === 'general' || appState.currentView === 'zones') {
        const tableHeaders = document.getElementById('rankings-headers');
        tableHeaders.innerHTML = `
            <tr>
                <th>Pos.</th>
                <th>Escalador</th>
                <th data-sort="totalPoints">Puntos</th>
                <th data-sort="highestDifficulty">Dificultad máx.</th>
                <th data-sort="totalAscents">Ascensos</th>
                <th>Acciones</th>
            </tr>
        `;
    }
}

// Actualizar indicadores de ordenamiento
function updateSortIndicators() {
    // Eliminar indicadores existentes
    document.querySelectorAll('th').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Añadir indicador a la columna actual
    const currentHeader = document.querySelector(`th[data-sort="${appState.sortField}"]`);
    if (currentHeader) {
        currentHeader.classList.add(`sort-${appState.sortDirection}`);
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}