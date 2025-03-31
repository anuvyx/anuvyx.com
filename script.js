// Verificar al cargar el DOM si el usuario ya inició sesión y actualizar el menú de navegación
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("isLoggedIn") === "true") {
    const navLinksContainer = document.querySelector('.nav-links');
    const loginLink = document.querySelector('.login-link');
    
    if (loginLink) {
      loginLink.remove();
    }

    // Crear contenedor del menú de usuario
    const userMenuContainer = document.createElement("div");
    userMenuContainer.classList.add("user-menu-container");

    // Crear el ícono de usuario
    const userIconLink = document.createElement("div");
    userIconLink.classList.add("user-icon-container");

    const userIconImg = document.createElement("img");
    userIconImg.src = "static/logo/user-icon.png";
    userIconImg.alt = "Perfil";
    userIconImg.classList.add("user-icon");

    // Crear menú desplegable
    const dropdownMenu = document.createElement("div");
    dropdownMenu.classList.add("user-dropdown");
    dropdownMenu.innerHTML = `
      <a href="user/profile.html" class="dropdown-item">Perfil</a>
      <div class="dropdown-item logout-button">Cerrar Sesión</div>
    `;

    // Ensamblar elementos
    userIconLink.appendChild(userIconImg);
    userMenuContainer.appendChild(userIconLink);
    userMenuContainer.appendChild(dropdownMenu);
    navLinksContainer.appendChild(userMenuContainer);

    // Manejar clic en el ícono
    userIconLink.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    // Manejar cierre al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!userMenuContainer.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });

    // Manejar logout
    dropdownMenu.querySelector('.logout-button').addEventListener('click', () => {
      localStorage.removeItem("isLoggedIn");
      window.location.reload();
    });
  }
});

/* ===============================
   Smooth Scroll for Navigation
=============================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

/* ===============================
   Login Modal Functionality
=============================== */
const loginModal = document.getElementById('loginModal');
const loginLinks = document.querySelectorAll('.login-link');
const closeModal = document.querySelector('.close-modal');

loginLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'block';
    document.body.classList.add('no-scroll');
  });
});

closeModal.addEventListener('click', () => {
  loginModal.style.display = 'none';
  document.body.classList.remove('no-scroll');
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && loginModal.style.display === 'block') {
    loginModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Obtener los valores de los campos de correo y contraseña
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('https://anuvyx-backend.vercel.app/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // Procesar la respuesta
    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.error); // Mostrar el error recibido
      return;
    }

    const data = await response.json();
    console.log('Inicio de sesión exitoso:', data);

    // Guardar el estado de inicio de sesión
    localStorage.setItem("isLoggedIn", "true");

    // Redirigir al perfil u otra página de éxito
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    alert('Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
  }
});

/* ===============================
   Registration Modal Functionality
=============================== */
const registroModal = document.getElementById('registroModal');
const registroLink = document.querySelector('a[href="#registro"]');
const closeModalRegistro = document.querySelector('.close-modal-registro');

if (registroLink) {
  registroLink.addEventListener('click', (e) => {
    e.preventDefault();
    registroModal.style.display = 'block';
    document.body.classList.add('no-scroll');
  });
}

if (closeModalRegistro) {
  closeModalRegistro.addEventListener('click', () => {
    registroModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
  });
}

window.addEventListener('click', (e) => {
  if (e.target === registroModal) {
    registroModal.style.display = 'none';
    document.body.classList.remove('no-scroll');
  }
});

document.getElementById('registroForm').addEventListener('submit', (e) => {
  e.preventDefault();

  // Obtener datos del formulario
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('emailRegistro').value;
  const password = document.getElementById('passwordRegistro').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validar que las contraseñas coincidan
  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  // Validar que la contraseña sea segura:
  // Al menos 8 caracteres, 1 minúscula, 1 mayúscula, 1 dígito y 1 carácter especial.
  const securePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!securePasswordRegex.test(password)) {
    alert("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.");
    return;
  }

  // Construir el objeto con los datos del usuario
  const userData = { nombre, email, password };

  // Enviar solicitud POST al backend para registrar el usuario
  fetch('https://anuvyx-backend.vercel.app/api/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(errorData.error || 'Error al crear la cuenta');
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('Usuario registrado en el backend:', data);
      window.location.href = 'user/welcome.html';
    })
    .catch(error => {
      console.error('Error al registrar el usuario:', error);
      alert(error.message);
    });
});

/* ===============================
   Scroll Animation Functionality
=============================== */
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

document.querySelectorAll('.section-content').forEach(content => {
  content.style.opacity = "0";
  content.style.transform = "translateY(20px)";
  content.style.transition = "all 0.6s ease-out";
  observer.observe(content);
});

/* ===============================
   Navbar Background Adjustment on Scroll
=============================== */
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.nav');
  if (window.scrollY > 50) {
    nav.style.background = "rgba(0, 0, 0, 0.9)";
  } else {
    nav.style.background = "rgba(0, 0, 0, 0.9)";
  }
});

/* ===============================
   Mobile Menu Toggle Functionality
=============================== */
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const bodyElement = document.body;

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
  bodyElement.classList.toggle('no-scroll');
});

document.addEventListener('click', (e) => {
  if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    bodyElement.classList.remove('no-scroll');
  }
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    bodyElement.classList.remove('no-scroll');
  });
});

/* ===============================
   Mobile Scroll Adjustment for Anchor Links
=============================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const position = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: position,
        behavior: 'smooth'
      });
    }
  });
});
