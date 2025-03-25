document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const progress = document.getElementById('formProgress');
    const submitBtn = document.getElementById('submitBtn');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');

    // Función para validar el formato del correo institucional
    function validateEmail(email) {
        const regex = /^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$/;
        return regex.test(email);
    }

    // Función para verificar la fortaleza de la contraseña
    function checkPasswordStrength(password) {
        let strength = 0;
        const patterns = [
            /[a-z]/, // minúsculas
            /[A-Z]/, // mayúsculas
            /[0-9]/, // números
            /[^A-Za-z0-9]/, // caracteres especiales
            /.{8,}/ // longitud mínima
        ];

        patterns.forEach(pattern => {
            if (pattern.test(password)) strength++;
        });

        return strength;
    }

    // Actualizar el medidor de fortaleza de la contraseña
    function updatePasswordStrength() {
        const strength = checkPasswordStrength(passwordInput.value);
        const percentage = (strength / 5) * 100;
        
        strengthMeter.style.width = `${percentage}%`;
        
        // Cambiar el color según la fortaleza
        strengthMeter.style.background = 
            strength <= 2 ? '#ff4444' :  // Rojo para débil
            strength <= 3 ? '#ffa700' :  // Naranja para regular
            strength <= 4 ? '#2196F3' :  // Azul para buena
            '#00C851';                   // Verde para fuerte

        // Actualizar el texto descriptivo
        strengthText.textContent = 
            strength <= 2 ? 'Débil' :
            strength <= 3 ? 'Regular' :
            strength <= 4 ? 'Buena' : 'Fuerte';
    }

    // Actualizar la barra de progreso del formulario
    function updateFormProgress() {
        const inputs = form.querySelectorAll('input[required]');
        const totalInputs = inputs.length;
        let filledInputs = 0;

        inputs.forEach(input => {
            if (input.value.trim() !== '') filledInputs++;
        });

        const percentage = (filledInputs / totalInputs) * 100;
        progress.style.width = `${percentage}%`;
        
        // Validar si se pueden coincidir las contraseñas
        const passwordsMatch = passwordInput.value === confirmPasswordInput.value;
        
        // Habilitar botón solo si todos los campos están llenos y las contraseñas coinciden
        submitBtn.disabled = percentage !== 100 || !passwordsMatch;
    }

    document.getElementById("registrationForm").addEventListener("submit", function(event) {
        const checkboxes = document.querySelectorAll("input[name='tipoProfesor']:checked");
        const errorElement = document.getElementById("tipoProfesorError");
        
        if (checkboxes.length === 0) {
            errorElement.style.display = "block";
            event.preventDefault(); // Evitar el envío del formulario
        } else {
            errorElement.style.display = "none";
        }
    });
    

    // Validación en tiempo real de los campos
    form.addEventListener('input', function(e) {
        const input = e.target;
        const errorElement = document.getElementById(`${input.id}Error`);

        // Validaciones específicas por campo
        switch(input.id) {
            case 'email':
                if (!validateEmail(input.value)) {
                    errorElement.style.display = 'block';
                } else {
                    errorElement.style.display = 'none';
                }
                break;

            case 'password':
                updatePasswordStrength();
                // Verificar coincidencia de contraseñas si ambos campos tienen valor
                if (confirmPasswordInput.value) {
                    const confirmError = document.getElementById('confirmPasswordError');
                    confirmError.style.display = 
                        passwordInput.value !== confirmPasswordInput.value ? 'block' : 'none';
                }
                break;

            case 'confirmPassword':
                const confirmError = document.getElementById('confirmPasswordError');
                confirmError.style.display = 
                    passwordInput.value !== confirmPasswordInput.value ? 'block' : 'none';
                break;
        }

        updateFormProgress();
    });

    // Manejo del envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: document.getElementById('nombre').value,
                    lastname: document.getElementById('apellidos').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Registro exitoso! Por favor, inicia sesión.');
                window.location.href = 'index.html';
            } else {
                alert(data.error || 'Error en el registro');
            }
        } catch (error) {
            alert('Error al conectar con el servidor');
        }
    });
});