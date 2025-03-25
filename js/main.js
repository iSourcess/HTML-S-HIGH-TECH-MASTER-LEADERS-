// Configuración de la API y Google OAuth
const API_URL = 'http://localhost:5000';
const GOOGLE_CLIENT_ID = ''; // Agregar el ID del cliente de Google

class AuthService {
    static async loginWithGoogle() {
        try {
            const width = 500;
            const height = 600;
            const left = (window.innerWidth - width) / 2;
            const top = (window.innerHeight - height) / 2;

            const popup = window.open(
                `${API_URL}/auth/google`,
                'Google Login',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            return new Promise((resolve, reject) => {
                window.addEventListener('message', async function(event) {
                    if (event.origin !== API_URL) return;
                    if (event.data.type === 'auth_success') {
                        const { token, user } = event.data;
                        await AuthService.handleAuthSuccess(token, user);
                        popup.close();
                        resolve(user);
                    } else if (event.data.type === 'auth_error') {
                        popup.close();
                        reject(new Error(event.data.error));
                    }
                });
            });
        } catch (error) {
            throw new Error('Error en la autenticación con Google: ' + error.message);
        }
    }

    static async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(credentials),
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            await this.handleAuthSuccess(data.token, data.user);
            return data.user;
        } catch (error) {
            throw new Error('Error en el inicio de sesión: ' + error.message);
        }
    }

    static async handleAuthSuccess(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.startSessionTimer();
    }

    static startSessionTimer() {
        // Renovar el token cada 45 minutos
        setInterval(async () => {
            try {
                const response = await fetch(`${API_URL}/refresh-token`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    credentials: 'include'
                });
                
                if (!response.ok) throw new Error('Error al renovar la sesión');
                
                const data = await response.json();
                localStorage.setItem('token', data.token);
            } catch (error) {
                console.error('Error al renovar el token:', error);
                this.logout();
            }
        }, 45 * 60 * 1000);
    }

    static async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData),
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            
            return data;
        } catch (error) {
            throw new Error('Error en el registro: ' + error.message);
        }
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }

    static isAuthenticated() {
        return localStorage.getItem('token') !== null;
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

class Validator {
    static validateEmail(email) {
        const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$/;
        return emailRegex.test(email);
    }
    
    static validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            strength: [
                password.length >= minLength,
                hasUpperCase,
                hasLowerCase,
                hasNumbers,
                hasSpecialChar
            ].filter(Boolean).length
        };
    }
    
    static showError(element, message) {
        const errorElement = document.getElementById(`${element.id}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            element.classList.add('error');
        }
    }
    
    static hideError(element) {
        const errorElement = document.getElementById(`${element.id}Error`);
        if (errorElement) {
            errorElement.style.display = 'none';
            element.classList.remove('error');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');

    if (loginForm) {
        initializeLoginForm(loginForm);
    }

    if (registerForm) {
        initializeRegisterForm(registerForm);
    }

    // Redirigir si ya está autenticado
    if (AuthService.isAuthenticated()) {
        window.location.href = '/dashboard.html';
    }
});

function initializeLoginForm(form) {
    const email = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            if (!Validator.validateEmail(email.value)) {
                Validator.showError(email, 'El correo debe ser institucional (@academicos.udg.mx)');
                return;
            }

            const passwordValidation = Validator.validatePassword(password.value);
            if (!passwordValidation.isValid) {
                Validator.showError(password, 'La contraseña debe cumplir con los requisitos de seguridad');
                return;
            }

            await AuthService.login({
                email: email.value,
                password: password.value
            });

            window.location.href = '/dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });

    // Validación en tiempo real
    form.addEventListener('input', (event) => {
        const input = event.target;
        if (input.id === 'loginEmail' || input.id === 'loginPassword') {
            Validator.hideError(input);
        }
    });
}

function initializeRegisterForm(form) {
    const name = document.getElementById('registerName');
    const lastName = document.getElementById('registerLastName');
    const email = document.getElementById('registerEmail');
    const password = document.getElementById('registerPassword');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        try {
            if (!name.value || !lastName.value) {
                !name.value && Validator.showError(name, 'El nombre es requerido');
                !lastName.value && Validator.showError(lastName, 'El apellido es requerido');
                return;
            }

            if (!Validator.validateEmail(email.value)) {
                Validator.showError(email, 'El correo debe ser institucional (@academicos.udg.mx)');
                return;
            }

            const passwordValidation = Validator.validatePassword(password.value);
            if (!passwordValidation.isValid) {
                Validator.showError(password, 'La contraseña debe cumplir con los requisitos de seguridad');
                return;
            }

            await AuthService.register({
                name: name.value,
                lastName: lastName.value,
                email: email.value,
                password: password.value
            });

            alert('Registro exitoso. Por favor, inicia sesión.');
            window.location.href = '/';
        } catch (error) {
            alert(error.message);
        }
    });

    // Validación en tiempo real
    form.addEventListener('input', (event) => {
        const input = event.target;
        if (['registerName', 'registerLastName', 'registerEmail', 'registerPassword'].includes(input.id)) {
            Validator.hideError(input);
        }
    });
}