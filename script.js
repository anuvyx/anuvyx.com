// Smooth scroll para los enlaces de navegación
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animación al hacer scroll
const observerOptions = {
    threshold: 0.1
};

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

// Cambiar navbar al hacer scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.background = "rgba(0, 0, 0, 0.95)";
    } else {
        nav.style.background = "rgba(0, 0, 0, 0.9)";
    }
});