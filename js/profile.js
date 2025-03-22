// profile.js - Maneja la funcionalidad de la página de perfil de usuario
import { auth, db, storage } from './config.js';
import { onAuthStateChanged, updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { showToast, validateField, formatDate } from './utils.js';

// Estado global
let currentUser = null;
let userProfile = null;
let userStats = null;
let userAscents = [];

// Elements DOM
const profileForm = document.getElementById('profile-form');
const profileImage = document.getElementById('profile-image');
const imageUpload = document.getElementById('image-upload');
const usernameField = document.getElementById('username');
const emailField = document.getElementById('email');
const bioField = document.getElementById('bio');
const locationField = document.getElementById('location');
const passwordField = document.getElementById('password');
const newPasswordField = document.getElementById('new-password');
const confirmPasswordField = document.getElementById('confirm-password');
const saveButton = document.getElementById('save-profile');
const statsContainer = document.getElementById('user-stats');
const recentAscentsContainer = document.getElementById('recent-ascents');
const loadingSpinner = document.getElementById('loading-spinner');

// Listeners
document.addEventListener('DOMContentLoaded', initProfilePage);

// Función principal de inicialización
function initProfilePage() {
    showLoadingState(true);
    
    // Verificar estado de autenticación
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            await Promise.all([
                loadUserProfile(),
                loadUserStats(),
                loadUserAscents()
            ]);
            populateProfileForm();
            renderUserStats();
            renderRecentAscents();
            setupEventListeners();
            showLoadingState(false);
        } else {
            // Redirigir a login si no está autenticado
            window.location.href = 'login.html';
        }
    });
}

// Cargar el perfil del usuario desde Firestore
async function loadUserProfile() {
    try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            userProfile = docSnap.data();
        } else {
            // Si no existe el perfil, crear uno
            userProfile = {
                username: currentUser.displayName || '',
                email: currentUser.email,
                bio: '',
                location: '',
                createdAt: new Date(),
                photoURL: currentUser.photoURL || ''
            };
            
            await updateDoc(docRef, userProfile);
        }
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        showToast('Error al cargar el perfil', 'error');
    }
}

// Cargar estadísticas del usuario
async function loadUserStats() {
    try {
        const statsRef = doc(db, "userStats", currentUser.uid);
        const statsSnap = await getDoc(statsRef);
        
        if (statsSnap.exists()) {
            userStats = statsSnap.data();
        } else {
            // Inicializar estadísticas por defecto
            userStats = {
                totalAscents: 0,
                highestGrade: 'N/A',
                totalPoints: 0,
                ranking: 'N/A',
                averageGrade: 'N/A'
            };
        }
    } catch (error) {
        console.error("Error al cargar estadísticas:", error);
        showToast('Error al cargar estadísticas', 'error');
    }
}

// Cargar ascensos recientes del usuario
async function loadUserAscents() {
    try {
        const ascentsRef = collection(db, "ascents");
        const q = query(
            ascentsRef,
            where("userId", "==", currentUser.uid),
            orderBy("date", "desc"),
            limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        userAscents = [];
        
        querySnapshot.forEach((doc) => {
            userAscents.push({
                id: doc.id,
                ...doc.data()
            });
        });
    } catch (error) {
        console.error("Error al cargar ascensos:", error);
        showToast('Error al cargar ascensos recientes', 'error');
    }
}

// Llenar el formulario con los datos del usuario
function populateProfileForm() {
    if (userProfile.photoURL) {
        profileImage.src = userProfile.photoURL;
    }
    
    usernameField.value = userProfile.username || '';
    emailField.value = userProfile.email || '';
    bioField.value = userProfile.bio || '';
    locationField.value = userProfile.location || '';
}

// Renderizar estadísticas de usuario
function renderUserStats() {
    if (!userStats || !statsContainer) return;
    
    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>Total Ascensos</h3>
            <p>${userStats.totalAscents || 0}</p>
        </div>
        <div class="stat-card">
            <h3>Grado Máximo</h3>
            <p>${userStats.highestGrade || 'N/A'}</p>
        </div>
        <div class="stat-card">
            <h3>Puntuación</h3>
            <p>${userStats.totalPoints || 0}</p>
        </div>
        <div class="stat-card">
            <h3>Ranking</h3>
            <p>${userStats.ranking || 'N/A'}</p>
        </div>
    `;
}

// Renderizar ascensos recientes
function renderRecentAscents() {
    if (!recentAscentsContainer) return;
    
    if (userAscents.length === 0) {
        recentAscentsContainer.innerHTML = '<p class="no-data">No hay ascensos registrados</p>';
        return;
    }
    
    const ascentsHTML = userAscents.map(ascent => `
        <div class="ascent-card">
            <h4>${ascent.routeName}</h4>
            <div class="ascent-details">
                <span class="grade">${ascent.grade}</span>
                <span class="location">${ascent.location}</span>
                <span class="date">${formatDate(ascent.date.toDate())}</span>
            </div>
            <p class="description">${ascent.comments || 'Sin comentarios'}</p>
        </div>
    `).join('');
    
    recentAscentsContainer.innerHTML = ascentsHTML;
}

// Configurar event listeners
function setupEventListeners() {
    // Cambiar imagen de perfil
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
    
    // Guardar cambios en el perfil
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }
}

// Manejar subida de imagen de perfil
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showToast('Por favor, sube una imagen en formato JPG, PNG o GIF', 'error');
        return;
    }
    
    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
        showToast('La imagen no debe superar los 2MB', 'error');
        return;
    }
    
    try {
        showLoadingState(true);
        
        // Subir imagen a Storage
        const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
        await uploadBytes(storageRef, file);
        
        // Obtener URL de la imagen
        const photoURL = await getDownloadURL(storageRef);
        
        // Actualizar perfil en Auth
        await updateProfile(currentUser, { photoURL });
        
        // Actualizar perfil en Firestore
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, { photoURL });
        
        // Actualizar UI
        profileImage.src = photoURL;
        showToast('Imagen de perfil actualizada', 'success');
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        showToast('Error al actualizar la imagen de perfil', 'error');
    } finally {
        showLoadingState(false);
    }
}

// Manejar actualización del perfil
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    // Validar campos
    if (!validateField(usernameField, 'El nombre de usuario es obligatorio')) return;
    if (!validateField(emailField, 'El email es obligatorio')) return;
    
    // Validar contraseña si se está actualizando
    if (newPasswordField.value) {
        if (!validateField(passwordField, 'Debes ingresar tu contraseña actual')) return;
        if (!validateField(newPasswordField, 'La nueva contraseña debe tener al menos 6 caracteres', value => value.length >= 6)) return;
        if (!validateField(confirmPasswordField, 'Las contraseñas no coinciden', value => value === newPasswordField.value)) return;
    }
    
    try {
        showLoadingState(true);
        
        // Preparar datos para actualización
        const updates = {
            username: usernameField.value.trim(),
            bio: bioField.value.trim(),
            location: locationField.value.trim()
        };
        
        // Si cambió el email
        if (emailField.value !== userProfile.email) {
            // Re-autenticar usuario si se cambió el email
            if (passwordField.value) {
                const credential = EmailAuthProvider.credential(currentUser.email, passwordField.value);
                await reauthenticateWithCredential(currentUser, credential);
                await updateEmail(currentUser, emailField.value);
                updates.email = emailField.value;
            } else {
                showToast('Debes ingresar tu contraseña para cambiar el email', 'error');
                showLoadingState(false);
                return;
            }
        }
        
        // Si cambió la contraseña
        if (newPasswordField.value) {
            // Re-autenticar usuario
            const credential = EmailAuthProvider.credential(currentUser.email, passwordField.value);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPasswordField.value);
        }
        
        // Actualizar displayName en Auth
        await updateProfile(currentUser, { displayName: updates.username });
        
        // Actualizar perfil en Firestore
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, updates);
        
        // Actualizar estado local
        userProfile = { ...userProfile, ...updates };
        
        // Limpiar campos de contraseña
        passwordField.value = '';
        newPasswordField.value = '';
        confirmPasswordField.value = '';
        
        showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        if (error.code === 'auth/wrong-password') {
            showToast('Contraseña incorrecta', 'error');
        } else if (error.code === 'auth/requires-recent-login') {
            showToast('Se requiere un inicio de sesión reciente. Por favor, vuelve a iniciar sesión', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showToast('Error al actualizar el perfil', 'error');
        }
    } finally {
        showLoadingState(false);
    }
}

// Mostrar/ocultar estado de carga
function showLoadingState(loading) {
    if (loadingSpinner) {
        loadingSpinner.style.display = loading ? 'flex' : 'none';
    }
    
    // Desactivar/activar formulario durante la carga
    if (profileForm) {
        const formElements = profileForm.querySelectorAll('input, textarea, button');
        formElements.forEach(element => {
            element.disabled = loading;
        });
    }
}

// Exportar funciones para uso en otros módulos
export {
    initProfilePage,
    loadUserProfile,
    loadUserStats,
    loadUserAscents
};