// Constante para la clave de almacenamiento en localStorage
const USERS_STORAGE_KEY = 'snakeGameUsers';
const CURRENT_USER_KEY = 'currentUser'; 
let currentFullUserData = null; // Variable global para almacenar datos completos del usuario

/**
 * Obtiene la lista de usuarios almacenada en localStorage
 * @returns {Array<Object>} Lista de usuarios o un array vacío si no hay ninguno
 */
function getUsers() {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    try {
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
        console.error("Error al parsear el JSON de usuarios:", e);
        return [];
    }
}

/**
 * Guarda la lista de usuarios en localStorage
 * @param {Array<Object>} users - La lista de usuarios a guardar
 */
function saveUsers(users) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Muestra un mensaje de feedback en el contenedor especificado
 * @param {string} message - El mensaje a mostrar
 * @param {boolean} isError - Si el mensaje es un error (true) o éxito (false)
 */
function displayMessage(message, isError) {
    const msgEl = document.getElementById('feedback-msg');
    if (!msgEl) return;
    
    msgEl.textContent = message;
    msgEl.classList.remove('oculto', 'error-msg', 'success-msg');

    if (isError) {
        msgEl.classList.add('error-msg');
    } else {
        msgEl.classList.add('success-msg');
    }
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        msgEl.classList.add('oculto');
    }, 5000);
}



// Lógica de Autenticación


function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('usuario').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('contrasena').value;

    if (!username || !email || !password) {
        displayMessage('Todos los campos son obligatorios.', true);
        return;
    }

    let users = getUsers();

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        displayMessage('Error: El nombre de usuario ya está registrado.', true);
        return;
    }
    
    const emailExists = users.some(user => user.email === email);
    if (emailExists) {
        displayMessage('Error: El correo electrónico ya está registrado.', true);
        return;
    }

    const newUser = { username, email, password };
    users.push(newUser);
    saveUsers(users);

    displayMessage('¡Registro exitoso! Redirigiendo a Inicio de Sesión...', false);
    
    setTimeout(() => {
       
        window.location.href = '/index.html';
    }, 1500);
}

function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('usuario').value.trim();
    const password = document.getElementById('contrasena').value;

    if (!username || !password) {
        displayMessage('Por favor, ingresa tu usuario y contraseña.', true);
        return;
    }

    const users = getUsers();

    const user = users.find(u => u.username === username);

    if (!user || user.password !== password) {
        displayMessage('Error: Usuario o contraseña incorrectos.', true);
        return;
    }
    
    displayMessage(`¡Bienvenido, ${user.username}! Iniciando juego...`, false);

    // Guarda el usuario actual en la sesión (solo username es suficiente para la clave de sesión)
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: user.username }));
    
    // Redirige a la página del juego
    setTimeout(() => {
        
        window.location.href = '/paginas/iniciosesion.html';
    }, 1500);
}

/**
 * Cierra la sesión del usuario actual y redirige a la página de inicio de sesión
 */
function handleLogout() {
    //  Muestra un mensaje de cerrado de sesión
    alert('Has cerrado sesión correctamente.'); 

    //  Elimina la clave del usuario actual de localStorage
    localStorage.removeItem(CURRENT_USER_KEY);
    
    //  Redirige a la página de inicio de sesión
    //  Redirige al nuevo index.html (Iniciar Sesión)
    window.location.href = '/index.html';
}

/**
 * Rellena los campos del modal de perfil con los datos del usuario
 * Esta función debe ser accesible globalmente para ser llamada desde game.js
 * @param {Object} userData - Los datos completos del usuario (incluye email)
 */
function populateProfileModal(userData) {
    const userDisplay = document.getElementById('perfil-usuario-nombre');
    const emailDisplay = document.getElementById('perfil-usuario-correo');

    if (userDisplay && emailDisplay && userData) {
        userDisplay.textContent = userData.username;
        emailDisplay.textContent = userData.email;
    }
}

/**
 * Verifica si hay una sesión activa. Si no la hay, redirige al login
 * Se llama solo en la nueva página del juego (iniciosesion.html)
 */
function checkSession() {
    
    if (window.location.pathname.endsWith('iniciosesion.html')) {
        const currentUserData = localStorage.getItem(CURRENT_USER_KEY);
        
        if (!currentUserData) {
            // No hay usuario, redirigir al login
            alert('Debes iniciar sesión para jugar.');
            
            window.location.href = '/index.html';
        } else {
             const sessionData = JSON.parse(currentUserData);
             const username = sessionData.username;
             
             // Buscar datos completos del usuario (incluyendo correo)
             const users = getUsers();
             const fullUserData = users.find(u => u.username === username);

             if (fullUserData) {
                 // Guarda los datos completos para que game.js pueda acceder a ellos al abrir el modal
                 currentFullUserData = fullUserData; 
             }
             
             // Asignar el listener de logout
             const logoutBtn = document.getElementById('boton-cerrar-sesion');
             if (logoutBtn) {
                 logoutBtn.addEventListener('click', handleLogout);
             }
        }
    }
}


// Asignar los manejadores de eventos al cargar la página
window.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Ejecuta la verificación de sesión en todas las cargas de página
    checkSession();
});