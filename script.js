// Funciones generales
function addTogglePassword(idInput) {
  const input = document.getElementById(idInput);
  if (!input) return;
  
  const label = input.nextElementSibling;

  const wrapper = document.createElement('div');
  wrapper.style.position = 'relative';

  input.parentNode.insertBefore(wrapper, input);
  
  wrapper.appendChild(input);
  if (label && label.tagName.toLowerCase() === 'label') {
    wrapper.appendChild(label);
  }
  
  input.style.width = '100%';
  
  const toggleIcon = document.createElement('span');
  toggleIcon.classList.add('toggle-password-icon');
  toggleIcon.style.position = 'absolute';
  toggleIcon.style.top = '50%';
  toggleIcon.style.right = '10px';
  toggleIcon.style.transform = 'translateY(-50%)';
  toggleIcon.style.cursor = 'pointer';

  const eyeSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
  `;
  
  const eyeSlashSVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
  `;
  
  toggleIcon.innerHTML = eyeSlashSVG;
  wrapper.appendChild(toggleIcon);
  
  toggleIcon.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      toggleIcon.innerHTML = eyeSVG;
    } else {
      input.type = 'password';
      toggleIcon.innerHTML = eyeSlashSVG;
    }
  });
}

// Inicialización y eventos una vez cargado el DOM
document.addEventListener("DOMContentLoaded", () => {
  /* Menú de usuario (sesión iniciada) */
  if (localStorage.getItem("isLoggedIn") === "true") {
    const navLinksContainer = document.querySelector('.nav-links');
    const loginLink = document.querySelector('.login-link');
    if (loginLink) loginLink.remove();

    const userMenuContainer = document.createElement("div");
    userMenuContainer.classList.add("user-menu-container");

    const userIconLink = document.createElement("div");
    userIconLink.classList.add("user-icon-container");

    const userIconImg = document.createElement("img");
    userIconImg.src = "static/icons/user-icon-black.png";
    userIconImg.alt = "Perfil";
    userIconImg.classList.add("user-icon");

    const dropdownMenu = document.createElement("div");
    dropdownMenu.classList.add("user-dropdown");
    dropdownMenu.innerHTML = `
      <a href="user/profile.html" class="dropdown-item">Perfil</a>
      <div class="dropdown-item logout-button">Cerrar Sesión</div>
    `;

    userIconLink.appendChild(userIconImg);
    userMenuContainer.appendChild(userIconLink);
    userMenuContainer.appendChild(dropdownMenu);
    navLinksContainer.appendChild(userMenuContainer);

    userIconLink.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!userMenuContainer.contains(e.target)) {
        dropdownMenu.classList.remove('show');
      }
    });

    dropdownMenu.querySelector('.logout-button').addEventListener('click', () => {
      localStorage.removeItem("isLoggedIn");
      window.location.reload();
    });
  }

  /* Toggle de visibilidad de contraseñas */
  addTogglePassword('password');
  addTogglePassword('passwordRegistro');
  addTogglePassword('confirmPassword');

  /* Modal de login */
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
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const response = await fetch('https://anuvyx-backend.vercel.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }
      const data = await response.json();
      console.log('Inicio de sesión exitoso:', data);
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      alert('Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
  });

  /* Modal de registro */
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
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('emailRegistro').value;
    const password = document.getElementById('passwordRegistro').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    const securePasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!securePasswordRegex.test(password)) {
      alert("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.");
      return;
    }
    const userData = { nombre, email, password };
    fetch('https://anuvyx-backend.vercel.app/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

  /* Animación de scroll */
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

  /* Ajuste del fondo del navbar al hacer scroll */
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
      nav.style.background = "rgba(0, 0, 0, 0.9)";
    } else {
      nav.style.background = "rgba(0, 0, 0, 0.9)";
    }
  });

  /* Menú móvil y scroll para anclas */
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
});