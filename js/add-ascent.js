// add-ascent.js - Sistema de registro de ascensos para la plataforma de ranking

// Importar funciones y configuraciones necesarias
import { firebaseConfig } from './config.js';
import { showLoading, hideLoading, showMessage } from './utils.js';

// Estado global del formulario
const formState = {
    selectedZone: null,
    selectedSector: null,
    selectedRoute: null,
    difficulty: null,
    style: 'Onsight', // Estilo predeterminado
    date: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
    comments: '',
    photos: []
};

// Datos de ejemplo (en producción serían obtenidos desde Firebase)
const mockData = {
    zones: [
        { id: 'z1', name: 'El Chaltén' },
        { id: 'z2', name: 'Piedra Parada' },
        { id: 'z3', name: 'Los Gigantes' }
    ],
    sectors: {
        'z1': [
            { id: 's1', name: 'Fitz Roy' },
            { id: 's2', name: 'Cerro Torre' }
        ],
        'z2': [
            { id: 's3', name: 'Pared Principal' },
            { id: 's4', name: 'La Vieja' }
        ],
        'z3': [
            { id: 's5', name: 'El Paredón' },
            { id: 's6', name: 'Los Terrados' }
        ]
    },
    routes: {
        's1': [
            { id: 'r1', name: 'Supercanaleta', difficulty: '6b+' },
            { id: 'r2', name: 'Franco-Argentina', difficulty: '7a' }
        ],
        's2': [
            { id: 'r3', name: 'Ragni', difficulty: '6c' },
            { id: 'r4', name: 'Compressor', difficulty: '7a+' }
        ],
        's3': [
            { id: 'r5', name: 'Cara Norte', difficulty: '6a' },
            { id: 'r6', name: 'Directa Sur', difficulty: '6c+' }
        ],
        's4': [
            { id: 'r7', name: 'Clásica', difficulty: '5+' },
            { id: 'r8', name: 'Variante Derecha', difficulty: '6b' }
        ],
        's5': [
            { id: 'r9', name: 'Espolón Central', difficulty: '6a+' },
            { id: 'r10', name: 'Diedro Mágico', difficulty: '7b' }
        ],
        's6': [
            { id: 'r11', name: 'La Fisura', difficulty: '6c' },
            { id: 'r12', name: 'Placa Negra', difficulty: '7c' }
        ]
    },
    difficultyScores: {
        '5': 100, '5+': 150,
        '6a': 200, '6a+': 250,
        '6b': 300, '6b+': 350,
        '6c': 400, '6c+': 450,
        '7a': 500, '7a+': 550,
        '7b': 600, '7b+': 650,
        '7c': 700, '7c+': 750,
        '8a': 800, '8a+': 850,
        '8b': 900, '8b+': 950,
        '8c': 1000, '8c+': 1050,
        '9a': 1100, '9a+': 1150,
        '9b': 1200, '9b+': 1250,
        '9c': 1300
    },
    styleMultipliers: {
        'Onsight': 1.0,
        'Flash': 0.9,
        'Redpoint': 0.8,
        'Pinkpoint': 0.7,
        'A vista': 1.0,
        'Segundo intento': 0.85,
        'Trabajado': 0.75
    }
};

// Función para inicializar la página de registro de ascensos
document.addEventListener('DOMContentLoaded', () => {
    // Comprobar si el usuario está autenticado
    checkAuth();
    
    // Cargar los selectores iniciales
    populateZones();
    populateStyles();
    
    // Configurar listeners de eventos
    setupEventListeners();
    
    // Inicializar la fecha al día actual
    document.getElementById('ascent-date').valueAsDate = new Date();
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

// Cargar zonas en el selector
function populateZones() {
    const zoneSelect = document.getElementById('zone');
    zoneSelect.innerHTML = '<option value="">Selecciona zona</option>';
    
    mockData.zones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.id;
        option.textContent = zone.name;
        zoneSelect.appendChild(option);
    });
}

// Cargar sectores basados en la zona seleccionada
function populateSectors(zoneId) {
    const sectorSelect = document.getElementById('sector');
    sectorSelect.innerHTML = '<option value="">Selecciona sector</option>';
    
    if (!zoneId) return;
    
    const sectors = mockData.sectors[zoneId] || [];
    sectors.forEach(sector => {
        const option = document.createElement('option');
        option.value = sector.id;
        option.textContent = sector.name;
        sectorSelect.appendChild(option);
    });
    
    // Habilitar el selector de sectores
    sectorSelect.disabled = false;
}

// Cargar rutas basadas en el sector seleccionado
function populateRoutes(sectorId) {
    const routeSelect = document.getElementById('route');
    routeSelect.innerHTML = '<option value="">Selecciona ruta</option>';
    
    if (!sectorId) return;
    
    const routes = mockData.routes[sectorId] || [];
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `${route.name} (${route.difficulty})`;
        option.dataset.difficulty = route.difficulty;
        routeSelect.appendChild(option);
    });
    
    // Habilitar el selector de rutas
    routeSelect.disabled = false;
}

// Configurar estilos de ascenso
function populateStyles() {
    const styleSelect = document.getElementById('style');
    styleSelect.innerHTML = '';
    
    Object.keys(mockData.styleMultipliers).forEach(style => {
        const option = document.createElement('option');
        option.value = style;
        option.textContent = style;
        styleSelect.appendChild(option);
    });
}

// Actualizar el grado de dificultad cuando se selecciona una ruta
function updateDifficulty(routeId) {
    if (!routeId) return;
    
    // Encontrar la ruta seleccionada
    let selectedRoute = null;
    
    for (const sectorId in mockData.routes) {
        const routes = mockData.routes[sectorId];
        const found = routes.find(r => r.id === routeId);
        if (found) {
            selectedRoute = found;
            break;
        }
    }
    
    if (selectedRoute) {
        const difficultyElement = document.getElementById('difficulty');
        difficultyElement.textContent = selectedRoute.difficulty;
        formState.difficulty = selectedRoute.difficulty;
    }
}

// Calcular puntos basados en dificultad y estilo
function calculatePoints() {
    if (!formState.difficulty || !formState.style) return 0;
    
    const basePoints = mockData.difficultyScores[formState.difficulty] || 0;
    const multiplier = mockData.styleMultipliers[formState.style] || 1.0;
    
    return Math.round(basePoints * multiplier);
}

// Configurar todos los listeners de eventos
function setupEventListeners() {
    // Listener para el selector de zona
    document.getElementById('zone').addEventListener('change', (e) => {
        const zoneId = e.target.value;
        formState.selectedZone = zoneId;
        formState.selectedSector = null;
        formState.selectedRoute = null;
        
        populateSectors(zoneId);
        
        // Resetear y deshabilitar selectores dependientes
        const sectorSelect = document.getElementById('sector');
        const routeSelect = document.getElementById('route');
        
        routeSelect.innerHTML = '<option value="">Selecciona ruta</option>';
        routeSelect.disabled = true;
        
        // Resetear visualización de dificultad
        document.getElementById('difficulty').textContent = '-';
        document.getElementById('estimated-points').textContent = '0';
    });
    
    // Listener para el selector de sector
    document.getElementById('sector').addEventListener('change', (e) => {
        const sectorId = e.target.value;
        formState.selectedSector = sectorId;
        formState.selectedRoute = null;
        
        populateRoutes(sectorId);
        
        // Resetear visualización de dificultad
        document.getElementById('difficulty').textContent = '-';
        document.getElementById('estimated-points').textContent = '0';
    });
    
    // Listener para el selector de ruta
    document.getElementById('route').addEventListener('change', (e) => {
        const routeId = e.target.value;
        formState.selectedRoute = routeId;
        
        updateDifficulty(routeId);
        
        // Actualizar puntos estimados
        const points = calculatePoints();
        document.getElementById('estimated-points').textContent = points;
    });
    
    // Listener para el selector de estilo
    document.getElementById('style').addEventListener('change', (e) => {
        formState.style = e.target.value;
        
        // Actualizar puntos estimados si ya hay una ruta seleccionada
        if (formState.difficulty) {
            const points = calculatePoints();
            document.getElementById('estimated-points').textContent = points;
        }
    });
    
    // Listener para la fecha
    document.getElementById('ascent-date').addEventListener('change', (e) => {
        formState.date = e.target.value;
    });
    
    // Listener para los comentarios
    document.getElementById('comments').addEventListener('input', (e) => {
        formState.comments = e.target.value;
    });
    
    // Listener para la subida de fotos
    document.getElementById('photo-upload').addEventListener('change', handlePhotoUpload);
    
    // Listener para el envío del formulario
    document.getElementById('ascent-form').addEventListener('submit', submitAscent);
}

// Manejar la subida de fotos
function handlePhotoUpload(e) {
    const files = e.target.files;
    const photoPreview = document.getElementById('photo-preview');
    
    if (!files.length) return;
    
    // Limpiar vista previa si es el primer archivo
    if (formState.photos.length === 0) {
        photoPreview.innerHTML = '';
    }
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            showMessage('Solo se permiten archivos de imagen', 'error');
            continue;
        }
        
        // Crear object URL para vista previa
        const imageUrl = URL.createObjectURL(file);
        formState.photos.push(file);
        
        // Crear elemento de vista previa
        const previewElement = document.createElement('div');
        previewElement.className = 'photo-preview-item';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = 'Vista previa';
        
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'remove-photo';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            // Remover la foto al hacer clic en el botón
            const index = formState.photos.indexOf(file);
            if (index > -1) {
                formState.photos.splice(index, 1);
                photoPreview.removeChild(previewElement);
                
                // Si no quedan fotos, mostrar mensaje por defecto
                if (formState.photos.length === 0) {
                    photoPreview.innerHTML = '<p>No hay fotos seleccionadas</p>';
                }
            }
        });
        
        previewElement.appendChild(img);
        previewElement.appendChild(removeBtn);
        photoPreview.appendChild(previewElement);
    }
}

// Enviar el formulario de ascenso
async function submitAscent(e) {
    e.preventDefault();
    
    // Validar el formulario
    if (!validateForm()) {
        return;
    }
    
    try {
        showLoading();
        
        // Crear objeto de ascenso
        const ascentData = {
            userId: JSON.parse(localStorage.getItem('currentUser')).uid,
            zoneId: formState.selectedZone,
            zoneName: document.getElementById('zone').options[document.getElementById('zone').selectedIndex].text,
            sectorId: formState.selectedSector,
            sectorName: document.getElementById('sector').options[document.getElementById('sector').selectedIndex].text,
            routeId: formState.selectedRoute,
            routeName: document.getElementById('route').options[document.getElementById('route').selectedIndex].text.split(' (')[0],
            difficulty: formState.difficulty,
            style: formState.style,
            points: calculatePoints(),
            date: formState.date,
            comments: formState.comments,
            timestamp: new Date().toISOString(),
            photoUrls: [] // Se llenarán después de subir fotos
        };
        
        // Simular una demora para la integración con backend
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // En un entorno real, aquí se subirían las fotos a Firebase Storage
        // y se almacenaría el ascenso en Firestore
        
        // Por ahora, almacenar en localStorage para simular
        const userAscents = JSON.parse(localStorage.getItem('userAscents') || '[]');
        userAscents.push(ascentData);
        localStorage.setItem('userAscents', JSON.stringify(userAscents));
        
        // Actualizar estadísticas del usuario
        updateUserStats(ascentData);
        
        hideLoading();
        showMessage('¡Ascenso registrado con éxito!', 'success');
        
        // Resetear formulario
        resetForm();
        
    } catch (error) {
        hideLoading();
        console.error('Error al registrar ascenso:', error);
        showMessage('Error al registrar el ascenso. Inténtalo de nuevo.', 'error');
    }
}

// Validar el formulario antes de enviar
function validateForm() {
    if (!formState.selectedZone) {
        showMessage('Debes seleccionar una zona', 'error');
        return false;
    }
    
    if (!formState.selectedSector) {
        showMessage('Debes seleccionar un sector', 'error');
        return false;
    }
    
    if (!formState.selectedRoute) {
        showMessage('Debes seleccionar una ruta', 'error');
        return false;
    }
    
    if (!formState.date) {
        showMessage('Debes seleccionar una fecha válida', 'error');
        return false;
    }
    
    return true;
}

// Actualizar estadísticas del usuario
function updateUserStats(ascentData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    // Obtener estadísticas actuales o inicializar
    const userStats = JSON.parse(localStorage.getItem('userStats') || '{}');
    const userId = currentUser.uid;
    
    if (!userStats[userId]) {
        userStats[userId] = {
            totalAscents: 0,
            totalPoints: 0,
            highestDifficulty: '5',
            recentAscents: []
        };
    }
    
    // Actualizar estadísticas
    userStats[userId].totalAscents++;
    userStats[userId].totalPoints += ascentData.points;
    
    // Actualizar dificultad máxima si corresponde
    const currentMax = userStats[userId].highestDifficulty;
    const currentMaxValue = mockData.difficultyScores[currentMax] || 0;
    const newValue = mockData.difficultyScores[ascentData.difficulty] || 0;
    
    if (newValue > currentMaxValue) {
        userStats[userId].highestDifficulty = ascentData.difficulty;
    }
    
    // Añadir a ascensos recientes (mantener solo los últimos 5)
    userStats[userId].recentAscents.unshift({
        routeName: ascentData.routeName,
        difficulty: ascentData.difficulty,
        date: ascentData.date,
        points: ascentData.points
    });
    
    userStats[userId].recentAscents = userStats[userId].recentAscents.slice(0, 5);
    
    // Guardar estadísticas actualizadas
    localStorage.setItem('userStats', JSON.stringify(userStats));
}

// Resetear formulario después de enviar
function resetForm() {
    // Resetear estado del formulario
    formState.selectedZone = null;
    formState.selectedSector = null;
    formState.selectedRoute = null;
    formState.difficulty = null;
    formState.style = 'Onsight';
    formState.date = new Date().toISOString().split('T')[0];
    formState.comments = '';
    formState.photos = [];
    
    // Resetear elementos del formulario
    document.getElementById('ascent-form').reset();
    document.getElementById('difficulty').textContent = '-';
    document.getElementById('estimated-points').textContent = '0';
    
    // Resetear selectores
    const sectorSelect = document.getElementById('sector');
    const routeSelect = document.getElementById('route');
    
    sectorSelect.innerHTML = '<option value="">Selecciona sector</option>';
    routeSelect.innerHTML = '<option value="">Selecciona ruta</option>';
    
    sectorSelect.disabled = true;
    routeSelect.disabled = true;
    
    // Resetear vista previa de fotos
    document.getElementById('photo-preview').innerHTML = '<p>No hay fotos seleccionadas</p>';
    
    // Resetear fecha al día actual
    document.getElementById('ascent-date').valueAsDate = new Date();
}