// Aquí va todo tu código original de validaciones y barra de progreso (ejemplo):
const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const nombre = document.getElementById('nombre');
const apellidos = document.getElementById('apellidos');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

const nombreError = document.getElementById('nombreError');
const apellidosError = document.getElementById('apellidosError');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const confirmPasswordError = document.getElementById('confirmPasswordError');

const strengthMeter = document.getElementById('strengthMeter');
const strengthText = document.getElementById('strengthText');

// Ejemplo básico de validación y barra de progreso (adapta si tienes otro código)
function checkInputs() {
  let valid = true;

  if (nombre.value.trim() === '') {
    nombreError.style.display = 'block';
    valid = false;
  } else {
    nombreError.style.display = 'none';
  }

  if (apellidos.value.trim() === '') {
    apellidosError.style.display = 'block';
    valid = false;
  } else {
    apellidosError.style.display = 'none';
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    emailError.style.display = 'block';
    valid = false;
  } else {
    emailError.style.display = 'none';
  }

  if (password.value.length < 8) {
    passwordError.style.display = 'block';
    valid = false;
  } else {
    passwordError.style.display = 'none';
  }

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.style.display = 'block';
    valid = false;
  } else {
    confirmPasswordError.style.display = 'none';
  }

  submitBtn.disabled = !valid;
}

// Aquí puedes añadir la lógica para mostrar la fuerza de la contraseña
password.addEventListener('input', () => {
  // Simple ejemplo de fuerza
  const val = password.value;
  let strength = 0;
  if (val.length >= 8) strength++;
  if (/[A-Z]/.test(val)) strength++;
  if (/[0-9]/.test(val)) strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;

  switch (strength) {
    case 0:
    case 1:
      strengthText.textContent = 'Débil';
      strengthMeter.style.width = '25%';
      strengthMeter.style.backgroundColor = 'red';
      break;
    case 2:
      strengthText.textContent = 'Regular';
      strengthMeter.style.width = '50%';
      strengthMeter.style.backgroundColor = 'orange';
      break;
    case 3:
      strengthText.textContent = 'Buena';
      strengthMeter.style.width = '75%';
      strengthMeter.style.backgroundColor = 'yellowgreen';
      break;
    case 4:
      strengthText.textContent = 'Excelente';
      strengthMeter.style.width = '100%';
      strengthMeter.style.backgroundColor = 'green';
      break;
  }
  checkInputs();
});

nombre.addEventListener('input', checkInputs);
apellidos.addEventListener('input', checkInputs);
email.addEventListener('input', checkInputs);
password.addEventListener('input', checkInputs);
confirmPassword.addEventListener('input', checkInputs);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  checkInputs();

  if (submitBtn.disabled) return; // No enviar si no está validado

  // Prepara datos para enviar al backend
  const data = {
    nombre: nombre.value.trim(),
    apellidos: apellidos.value.trim(),
    email: email.value.trim(),
    password: password.value,
  };

  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (res.ok) {
      alert('Usuario creado correctamente. Ya puedes iniciar sesión.');
      window.location.href = 'index.html'; // o la página de login
    } else {
      alert(result.message || 'Error al crear el usuario');
    }
  } catch (error) {
    console.error(error);
    alert('Error de conexión con el servidor');
  }
});
