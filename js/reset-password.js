/**
 * reset-password.js
 * 
 * Maneja la funcionalidad de restablecimiento de contraseña para la Plataforma de Ranking para Escaladores
 * Versión: 0.4
 */

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const resetRequestForm = document.getElementById('reset-request-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const resetRequestBtn = document.getElementById('reset-request-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const resetMessage = document.getElementById('reset-message');
    const resetPasswordMessage = document.getElementById('reset-password-message');

    // Token de restablecimiento (se obtiene de la URL)
    const urlParams = new URLSearchParams(window.location.search);
    const resetToken = urlParams.get('token');

    // Si hay un token en la URL, mostrar el formulario para establecer nueva contraseña
    if (resetToken) {
        resetRequestForm.style.display = 'none';
        resetPasswordForm.style.display = 'block';
        
        // Verificar si el token es válido
        verifyResetToken(resetToken);
    }

    // Evento para solicitar restablecimiento de contraseña
    if (resetRequestBtn) {
        resetRequestBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            
            if (!email) {
                showMessage(resetMessage, 'Por favor ingresa tu correo electrónico', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showMessage(resetMessage, 'Por favor ingresa un correo electrónico válido', 'error');
                return;
            }
            
            requestPasswordReset(email);
        });
    }

    // Evento para establecer nueva contraseña
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!newPassword || !confirmPassword) {
                showMessage(resetPasswordMessage, 'Por favor completa todos los campos', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage(resetPasswordMessage, 'Las contraseñas no coinciden', 'error');
                return;
            }
            
            if (!isValidPassword(newPassword)) {
                showMessage(resetPasswordMessage, 'La contraseña debe tener al menos 8 caracteres, incluyendo números y letras', 'error');
                return;
            }
            
            resetPassword(resetToken, newPassword);
        });
    }

    /**
     * Solicita un restablecimiento de contraseña
     * @param {string} email - Correo electrónico del usuario
     */
    function requestPasswordReset(email) {
        showMessage(resetMessage, 'Procesando solicitud...', 'info');
        
        // En una implementación real, esto se enviaría al servidor
        // Por ahora, simulamos una respuesta exitosa
        setTimeout(() => {
            // Aquí iría la petición al servidor
            // fetch(`${API_URL}/auth/request-reset`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ email })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         showMessage(resetMessage, 'Se han enviado instrucciones a tu correo electrónico', 'success');
            //     } else {
            //         showMessage(resetMessage, data.message || 'Ha ocurrido un error', 'error');
            //     }
            // })
            // .catch(error => {
            //     showMessage(resetMessage, 'Error de conexión. Intenta nuevamente', 'error');
            //     console.error('Error:', error);
            // });
            
            // Simulación de respuesta exitosa
            showMessage(resetMessage, 'Se han enviado instrucciones a tu correo electrónico. Revisa tu bandeja de entrada.', 'success');
        }, 1500);
    }

    /**
     * Verifica si el token de restablecimiento es válido
     * @param {string} token - Token de restablecimiento
     */
    function verifyResetToken(token) {
        // En una implementación real, esto se verificaría en el servidor
        // Por ahora, simulamos que el token es válido
        
        // Aquí iría la petición al servidor
        // fetch(`${API_URL}/auth/verify-reset-token`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ token })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     if (!data.success) {
        //         resetPasswordForm.innerHTML = `
        //             <div class="message error">
        //                 Este enlace ha expirado o no es válido. Por favor solicita un nuevo enlace.
        //             </div>
        //             <div class="auth-links">
        //                 <a href="reset-password.html">Solicitar nuevo enlace</a>
        //             </div>
        //         `;
        //     }
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        //     resetPasswordForm.innerHTML = `
        //         <div class="message error">
        //             Error de conexión. Por favor intenta nuevamente.
        //         </div>
        //         <div class="auth-links">
        //             <a href="reset-password.html">Volver</a>
        //         </div>
        //     `;
        // });
    }

    /**
     * Restablece la contraseña del usuario
     * @param {string} token - Token de restablecimiento
     * @param {string} newPassword - Nueva contraseña
     */
    function resetPassword(token, newPassword) {
        showMessage(resetPasswordMessage, 'Procesando...', 'info');
        
        // En una implementación real, esto se enviaría al servidor
        // Por ahora, simulamos una respuesta exitosa
        setTimeout(() => {
            // Aquí iría la petición al servidor
            // fetch(`${API_URL}/auth/reset-password`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ token, newPassword })
            // })
            // .then(response => response.json())
            // .then(data => {
            //     if (data.success) {
            //         resetPasswordForm.innerHTML = `
            //             <div class="message success">
            //                 Tu contraseña ha sido actualizada correctamente.
            //             </div>
            //             <div class="auth-links">
            //                 <a href="login.html">Iniciar Sesión</a>
            //             </div>
            //         `;
            //     } else {
            //         showMessage(resetPasswordMessage, data.message || 'Ha ocurrido un error', 'error');
            //     }
            // })
            // .catch(error => {
            //     showMessage(resetPasswordMessage, 'Error de conexión. Intenta nuevamente', 'error');
            //     console.error('Error:', error);
            // });
            
            // Simulación de respuesta exitosa
            resetPasswordForm.innerHTML = `
                <div class="message success">
                    Tu contraseña ha sido actualizada correctamente.
                </div>
                <div class="auth-links">
                    <a href="login.html">Iniciar Sesión</a>
                </div>
            `;
        }, 1500);
    }

    /**
     * Muestra un mensaje al usuario
     * @param {HTMLElement} element - Elemento donde mostrar el mensaje
     * @param {string} text - Texto del mensaje
     * @param {string} type - Tipo de mensaje ('success', 'error', 'info')
     */
    function showMessage(element, text, type) {
        element.textContent = text;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }

    /**
     * Valida el formato de un correo electrónico
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
});