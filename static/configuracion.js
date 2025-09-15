// JavaScript para configuración - Sistema completo de temas

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
        
        // Forzar estilos de navbar oscuro
        navbar.css({
            'background-color': 'var(--navbar-bg)',
            'color': 'var(--text-color)'
        });
        
        // Asegurar que los enlaces sean visibles
        navbar.find('.nav-link').css('color', 'var(--text-color)');
        
    } else {
        // Cambiar a tema claro
        navbar.removeClass('navbar-dark').addClass('navbar-white navbar-light');
        sidebar.removeClass('sidebar-dark-primary').addClass('sidebar-light-primary');
        
        // Restaurar estilos originales
        navbar.css({
            'background-color': '',
            'color': ''
        });
        
        navbar.find('.nav-link').css('color', '');
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
    }
}

/**
 * Actualizar información del tema
 */
function updateThemeInfo(theme = null, lastChange = null) {
    if (!theme) {
        theme = $('input[name="theme"]:checked').val();
    }
    
    // Actualizar nombre del tema
    const themeNames = {
        'light': 'Claro',
        'dark': 'Oscuro',
        'auto': 'Automático'
    };
    
    const themeBadgeClasses = {
        'light': 'badge-warning',
        'dark': 'badge-dark',
        'auto': 'badge-secondary'
    };
    
    const currentThemeName = $('#current-theme-name');
    currentThemeName.text(themeNames[theme] || 'Claro');
    currentThemeName.attr('class', `ml-2 badge ${themeBadgeClasses[theme] || 'badge-warning'}`);
    
    // Actualizar última modificación
    if (!lastChange) {
        lastChange = localStorage.getItem('theme-last-change') || 'Nunca';
    }
    $('#theme-last-change').text(lastChange);
    
    // Actualizar características del tema
    updateThemeFeatures(theme);
}

/**
 * Actualizar características del tema
 */
function updateThemeFeatures(theme) {
    const features = $('#theme-features');
    let featuresHtml = '';
    
    switch(theme) {
        case 'dark':
            featuresHtml = `
                <li><i class="fas fa-check text-success mr-2"></i> Reduce el cansancio visual</li>
                <li><i class="fas fa-check text-success mr-2"></i> Ideal para ambientes oscuros</li>
                <li><i class="fas fa-check text-success mr-2"></i> Ahorra batería en pantallas OLED</li>
                <li><i class="fas fa-check text-success mr-2"></i> Diseño moderno y elegante</li>
            `;
            break;
        case 'auto':
            featuresHtml = `
                <li><i class="fas fa-check text-success mr-2"></i> Se adapta al horario</li>
                <li><i class="fas fa-check text-success mr-2"></i> Sigue configuración del sistema</li>
                <li><i class="fas fa-check text-success mr-2"></i> Cambia automáticamente</li>
                <li><i class="fas fa-check text-success mr-2"></i> Máxima comodidad visual</li>
            `;
            break;
        default: // light
            featuresHtml = `
                <li><i class="fas fa-check text-success mr-2"></i> Fácil lectura</li>
                <li><i class="fas fa-check text-success mr-2"></i> Colores contrastantes</li>
                <li><i class="fas fa-check text-success mr-2"></i> Optimizado para pantallas</li>
                <li><i class="fas fa-check text-success mr-2"></i> Clásico y profesional</li>
            `;
    }
    
    features.html(featuresHtml);
}

/**
 * Mostrar mensaje de cambio de tema
 */
function showThemeChangeMessage(theme) {
    const themeNames = {
        'light': 'Claro',
        'dark': 'Oscuro',
        'auto': 'Automático'
    };
    
    // Crear mensaje de éxito
    const alertHtml = `
        <div class="alert alert-success alert-dismissible fade show theme-change-alert">
            <i class="fas fa-check-circle mr-2"></i>
            <strong>¡Tema aplicado!</strong> Se ha cambiado al tema ${themeNames[theme] || 'Claro'}.
            <button type="button" class="close" data-dismiss="alert">
                <span>&times;</span>
            </button>
        </div>
    `;
    
    // Remover alertas anteriores y agregar nueva
    $('.theme-change-alert').remove();
    $('.container-fluid').prepend(alertHtml);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
        $('.theme-change-alert').fadeOut(() => {
            $('.theme-change-alert').remove();
        });
    }, 3000);
}

/**
 * Resetear tema
 */
function resetTheme() {
    // Limpiar localStorage
    localStorage.removeItem('theme');
    localStorage.removeItem('theme-last-change');
    
    // Aplicar tema por defecto
    $('input[name="theme"][value="light"]').prop('checked', true);
    applyTheme('light');
    
    // Mostrar mensaje
    showThemeChangeMessage('light');
    
    // Actualizar información
    updateThemeInfo('light', 'Restaurado ahora');
}

/**
 * Mostrar/ocultar loading
 */
function showLoading(show) {
    const applyBtn = $('#apply-theme');
    const resetBtn = $('#reset-theme');
    
    if (show) {
        applyBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Aplicando...');
        resetBtn.prop('disabled', true);
        $('body').addClass('loading');
    } else {
        applyBtn.prop('disabled', false).html('<i class="fas fa-check"></i> Aplicar Tema');
        resetBtn.prop('disabled', false);
        $('body').removeClass('loading');
    }
}

/**
 * Aplicar tema a todas las páginas (para usar en otras páginas)
 */
function applyGlobalTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyThemeLogic(savedTheme);
}

// Exponer función global para usar en otras páginas
window.applyGlobalTheme = applyGlobalTheme;