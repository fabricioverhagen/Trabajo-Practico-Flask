// JavaScript para configuración - Solo cambio de tema

$(document).ready(function() {
    // Inicializar configuración de temas
    initThemeConfig();
    
    // Configurar eventos
    setupThemeEvents();
    
    // Aplicar tema guardado
    loadSavedTheme();
});

/**
 * Inicializar configuración de temas
 */
function initThemeConfig() {
    // Detectar preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Escuchar cambios en la preferencia del sistema
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'auto') {
            applyTheme(e.matches ? 'dark' : 'light', false);
        }
    });
    
    // Actualizar vista previa inicial
    updateThemePreview();
    updateThemeInfo();
}

/**
 * Configurar eventos de tema
 */
function setupThemeEvents() {
    // Evento para cambio de tema
    $('input[name="theme"]').on('change', function() {
        const selectedTheme = $(this).val();
        updateThemePreview(selectedTheme);
        updateThemeInfo(selectedTheme);
    });
    
    // Evento para aplicar tema
    $('#apply-theme').on('click', function() {
        const selectedTheme = $('input[name="theme"]:checked').val();
        applyTheme(selectedTheme);
        showThemeChangeMessage(selectedTheme);
    });
    
    // Evento para restaurar tema
    $('#reset-theme').on('click', function() {
        if (confirm('¿Estás seguro de restaurar el tema por defecto?')) {
            resetTheme();
        }
    });
}

/**
 * Cargar tema guardado
 */
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const lastChange = localStorage.getItem('theme-last-change');
    
    // Seleccionar radio button correspondiente
    $(`input[name="theme"][value="${savedTheme}"]`).prop('checked', true);
    
    // Aplicar tema
    applyThemeLogic(savedTheme);
    
    // Actualizar información
    updateThemeInfo(savedTheme, lastChange);
    updateThemePreview(savedTheme);
}

/**
 * Aplicar tema
 */
function applyTheme(theme, saveToStorage = true) {
    // Mostrar loading
    showLoading(true);
    
    setTimeout(() => {
        applyThemeLogic(theme);
        
        if (saveToStorage) {
            // Guardar en localStorage
            localStorage.setItem('theme', theme);
            localStorage.setItem('theme-last-change', new Date().toLocaleString());
        }
        
        // Actualizar información
        updateThemeInfo(theme);
        
        showLoading(false);
    }, 500);
}

/**
 * Lógica para aplicar tema
 */
function applyThemeLogic(theme) {
    const body = $('body');
    const html = $('html');
    
    // Remover clases de tema previas
    body.removeClass('dark-mode light-mode');
    html.removeAttr('data-theme');
    
    let actualTheme = theme;
    
    // Si es automático, detectar preferencia del sistema
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Aplicar tema
    if (actualTheme === 'dark') {
        body.addClass('dark-mode');
        html.attr('data-theme', 'dark');
        updateAdminLTETheme('dark');
    } else {
        body.addClass('light-mode');
        html.attr('data-theme', 'light');
        updateAdminLTETheme('light');
    }
    
    // Actualizar navbar y sidebar para AdminLTE
    updateAdminLTEColors(actualTheme);
}

/**
 * Actualizar tema de AdminLTE
 */
function updateAdminLTETheme(theme) {
    const navbar = $('.main-header.navbar');
    const sidebar = $('.main-sidebar');
    
    if (theme === 'dark') {
        // Cambiar a tema oscuro
        navbar.removeClass('navbar-white navbar-light').addClass('navbar-dark');
        sidebar.removeClass('sidebar-light-primary').addClass('sidebar-dark-primary');
    } else {
        // Cambiar a tema claro
        navbar.removeClass('navbar-dark').addClass('navbar-white navbar-light');
        sidebar.removeClass('sidebar-dark-primary').addClass('sidebar-light-primary');
    }
}

/**
 * Actualizar colores específicos de AdminLTE
 */
function updateAdminLTEColors(theme) {
    if (theme === 'dark') {
        // Ajustes adicionales para tema oscuro
        $('.content-wrapper').addClass('dark-mode');
    } else {
        // Ajustes para tema claro
        $('.content-wrapper').removeClass('dark-mode');
    }
}

/**
 * Actualizar vista previa
 */
function updateThemePreview(theme = null) {
    if (!theme) {
        theme = $('input[name="theme"]:checked').val();
    }
    
    const preview = $('.theme-preview');
    let actualTheme = theme;
    
    // Si es automático, usar preferencia del sistema
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        actualTheme = prefersDark ? 'dark' : 'light';
    }
    
    // Aplicar estilos a la vista previa
    if (actualTheme === 'dark') {
        preview.css({
            'background-color': '#2d2d2d',
            'color': '#e9ecef',
            'border-color': '#495057'
        });
        preview.find('.preview-content').css('color', '#e9ecef');
    } else {
        preview.css({
            'background-color': '#ffffff',
            'color': '#495057',
            'border-color': '#ced4da'
        });
        preview.find('.preview-content').css('color', '#495057');
    }}