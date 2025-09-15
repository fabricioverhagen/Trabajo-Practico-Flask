// theme-global.js - Script para aplicar tema en todas las páginas

// Aplicar tema inmediatamente al cargar la página (antes de que se renderice)
(function() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyThemeImmediate(savedTheme);
})();

// Función para aplicar tema inmediatamente
function applyThemeImmediate(theme) {
    let actualTheme = theme;
    
    // Si es automático, detectar preferencia del sistema
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Aplicar al documento
    if (actualTheme === 'dark') {
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
    applyAdminLTETheme(savedTheme);
});

// Función para aplicar tema de AdminLTE
function applyAdminLTETheme(theme) {
    let actualTheme = theme;
    
    // Si es automático, detectar preferencia del sistema
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDark ? 'dark' : 'light';
    }
    
    const navbar = $('.main-header.navbar');
    const sidebar = $('.main-sidebar');
    
    if (actualTheme === 'dark') {
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
        applyThemeImmediate(e.newValue || 'light');
        if (typeof $ !== 'undefined') {
            applyAdminLTETheme(e.newValue || 'light');
        }
    }
});

// Escuchar cambios en la preferencia del sistema
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'auto') {
        applyThemeImmediate(e.matches ? 'dark' : 'light');
        if (typeof $ !== 'undefined') {
            applyAdminLTETheme(e.matches ? 'dark' : 'light');
        }
    }
});