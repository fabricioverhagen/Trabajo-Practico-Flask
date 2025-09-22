// theme-global.js - Script para aplicar tema en todas las páginas (Solo Claro y Oscuro)

// Aplicar tema inmediatamente al cargar la página (antes de que se renderice)
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    // Solo permitir temas válidos
    const validTheme = (savedTheme === 'dark') ? 'dark' : 'light';
    applyThemeImmediate(validTheme);
})();

// Función para aplicar tema inmediatamente
function applyThemeImmediate(theme) {
    // Aplicar al documento
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-mode');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.classList.add('light-mode');
    }
}

// Cuando jQuery esté disponible, aplicar estilos de AdminLTE
$(document).ready(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    // Solo permitir temas válidos
    const validTheme = (savedTheme === 'dark') ? 'dark' : 'light';
    applyAdminLTETheme(validTheme);
});

// Función para aplicar tema de AdminLTE
function applyAdminLTETheme(theme) {
    const navbar = $('.main-header.navbar');
    const sidebar = $('.main-sidebar');
    
    if (theme === 'dark') {
        // Tema oscuro
        navbar.removeClass('navbar-white navbar-light').addClass('navbar-dark');
        sidebar.removeClass('sidebar-light-primary').addClass('sidebar-dark-primary');
        $('.content-wrapper').addClass('dark-mode');
    } else {
        // Tema claro
        navbar.removeClass('navbar-dark').addClass('navbar-white navbar-light');
        sidebar.removeClass('sidebar-dark-primary').addClass('sidebar-light-primary');
        $('.content-wrapper').removeClass('dark-mode');
    }
}

// Escuchar cambios en el localStorage desde otras pestañas
window.addEventListener('storage', function(e) {
    if (e.key === 'theme') {
        const newTheme = e.newValue || 'light';
        // Solo permitir temas válidos
        const validTheme = (newTheme === 'dark') ? 'dark' : 'light';
        
        applyThemeImmediate(validTheme);
        if (typeof $ !== 'undefined') {
            applyAdminLTETheme(validTheme);
        }
    }
});