// Smooth scroll para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault(); // Evita el comportamiento predeterminado del enlace
        const targetId = this.getAttribute('href'); // Obtiene el ID del objetivo
        const targetElement = document.querySelector(targetId); // Selecciona el elemento objetivo

        if (targetElement) {
            // Desplazamiento suave al elemento objetivo
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Alinea el elemento en la parte superior de la ventana
            });
        }
    });
});

// Animación al hacer scroll
const observerOptions = {
    threshold: 0.1 // Define cuándo se activará la animación (10% visible)
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Aplica la animación cuando el elemento es visible
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

// Aplica la animación a todos los elementos con la clase .section-content
document.querySelectorAll('.section-content').forEach(content => {
    content.style.opacity = "0"; // Inicialmente oculto
    content.style.transform = "translateY(20px)"; // Desplazado hacia abajo
    content.style.transition = "all 0.6s ease-out"; // Transición suave
    observer.observe(content); // Observa el elemento para activar la animación
});

// Cambiar navbar al hacer scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.background = "rgba(0, 0, 0, 0.9)"; // Fondo original al hacer scroll
    } else {
        nav.style.background = "rgba(0, 0, 0, 0.9)"; // Fondo original
    }
});

// Menú móvil (hamburguesa)
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const body = document.body;

// Abrir/cerrar menú al hacer clic en el botón hamburguesa
menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    body.classList.toggle('no-scroll'); // Dejar el scroll cuando el menú está abierto
});

// Cerrar menú al hacer clic fuera o en un enlace
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('no-scroll');
    }
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        body.classList.remove('no-scroll');
    });
});

// Ajuste de scroll para dispositivos móviles
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 80; // Ajusta según la altura de tu header
            const position = target.getBoundingClientRect().top + window.pageYOffset - offset;
            
            window.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        }
    });
});