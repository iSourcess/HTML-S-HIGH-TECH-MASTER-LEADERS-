document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginFormElement');
  const registrationForm = document.getElementById('registrationForm');
  const nombreInput = document.getElementById('nombre');
  const apellidosInput = document.getElementById('apellidos');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const submitBtn = document.getElementById('submitBtn');

  const strengthText = document.getElementById('strengthText');
  const strengthMeter = document.getElementById('strengthMeter');
  const formProgress = document.getElementById('formProgress');

  // ===== VALIDACIONES REGISTRO =====
  function validateEmail(email) {
    const regex = /^[a-zA-Z]+\.[a-zA-Z]+@academicos\.udg\.mx$/;
    return regex.test(email);
  }

  function calculatePasswordStrength(password) {
    let strength = 0;
    const strengthCriteria = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];
    strength = strengthCriteria.filter(Boolean).length;

    strengthMeter.style.width = `${strength * 20}%`;
    switch (strength) {
      case 0:
      case 1:
        strengthText.textContent = 'Muy débil';
        strengthMeter.style.backgroundColor = 'red';
        break;
      case 2:
      case 3:
        strengthText.textContent = 'Débil';
        strengthMeter.style.backgroundColor = 'orange';
        break;
      case 4:
        strengthText.textContent = 'Moderada';
        strengthMeter.style.backgroundColor = 'yellow';
        break;
      case 5:
        strengthText.textContent = 'Fuerte';
        strengthMeter.style.backgroundColor = 'green';
        break;
    }
    return strength >= 3;
  }

  function updateProgressBar() {
    const inputs = [nombreInput, apellidosInput, emailInput, passwordInput, confirmPasswordInput];
    const filled = inputs.filter(input => input && input.value.trim() !== '').length;
    formProgress.style.width = `${(filled / inputs.length) * 100}%`;
  }

  function checkFormValidity() {
    const valid =
      nombreInput?.value.trim() !== '' &&
      apellidosInput?.value.trim() !== '' &&
      validateEmail(emailInput?.value) &&
      calculatePasswordStrength(passwordInput?.value) &&
      passwordInput?.value === confirmPasswordInput?.value;

    submitBtn.disabled = !valid;
  }

  // Eventos en inputs
  if (registrationForm) {
    [nombreInput, apellidosInput, emailInput, passwordInput, confirmPasswordInput].forEach((input) => {
      input?.addEventListener('input', () => {
        updateProgressBar();
        checkFormValidity();
      });
    });

    registrationForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const data = {
        nombre: nombreInput.value.trim(),
        apellidos: apellidosInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
      };

      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await res.json();

        if (res.ok) {
          alert('Registro exitoso. Inicia sesión.');
          window.location.href = 'index.html';
        } else {
          alert(result.message || 'Error en el registro');
        }
      } catch (err) {
        console.error('Error en el registro:', err);
        alert('Error al conectar con el servidor');
      }
    });
  }

  // ===== LOGIN =====
  if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await res.json();

        if (res.ok) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
          window.location.href = 'dashboard.html';
        } else {
          alert(result.message || 'Usuario o contraseña incorrectos');
        }
      } catch (err) {
        console.error('Error en login:', err);
        alert('Error al conectar con el servidor');
      }
    });
  }
});
