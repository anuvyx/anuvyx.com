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
        nav.style.background = "rgba(0, 0, 0, 0.95)"; // Fondo más oscuro al hacer scroll
    } else {
        nav.style.background = "rgba(0, 0, 0, 0.9)"; // Fondo original
    }
});