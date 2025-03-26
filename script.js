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
  
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Iniciando sesión...');
    window.location.href = '/dashboard';
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
    const password = document.getElementById('passwordRegistro').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    console.log('Registrando usuario...');
    window.location.href = '../anuvyx.com/welcome.html';
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
  const body = document.body;
  
  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    body.classList.toggle('no-scroll');
  });
  
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      body.classList.remove('no-scroll');
    }
  });
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('active');
      navLinks.classList.remove('active');
      body.classList.remove('no-scroll');
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