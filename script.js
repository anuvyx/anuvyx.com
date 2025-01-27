// Smooth scroll para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Animaciones al hacer scroll utilizando IntersectionObserver
const observerOptions = {
    threshold: 0.1 // Se activa cuando el 10% del elemento es visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Añade una clase para aplicar estilos de animación
        }
    });
}, observerOptions);

document.querySelectorAll('.section-content').forEach(content => {
    content.classList.add('hidden'); // Ocultar elementos inicialmente
    observer.observe(content);
});

// Cambiar el estilo de la barra de navegación al hacer scroll
const nav = document.querySelector('.nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Clase CSS adicional para manejar la animación (Agregarla en el CSS)
// .hidden {
//     opacity: 0;
//     transform: translateY(20px);
//     transition: all 0.6s ease-out;
// }

// .visible {
//     opacity: 1;
//     transform: translateY(0);
// }