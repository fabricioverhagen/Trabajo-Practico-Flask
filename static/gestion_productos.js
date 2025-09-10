// JavaScript para gestión de productos

$(document).ready(function() {
    // Inicializar tooltips si Bootstrap está disponible
    if (typeof $().tooltip === 'function') {
        $('[data-toggle="tooltip"]').tooltip();
    }

    // Validación en tiempo real del formulario
    $('#formProducto input').on('input', function() {
        validateField($(this));
    });

    // Prevenir submit del formulario con campos inválidos
    $('#formProducto').on('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            showAlert('Por favor, complete todos los campos correctamente.', 'danger');
        }
    });
});

/**
 * Función para editar un producto
 * @param {string} id - ID del producto
 * @param {string} descripcion - Descripción del producto
 * @param {string} precio - Precio del producto
 * @param {string} stock - Stock del producto
 */
function editarProducto(id, descripcion, precio, stock) {
    // Cambiar el título del modal
    $('#modalTitle').text('Editar Producto');
    
    // Cambiar la acción del formulario para edición
    $('#formProducto').attr('action', '/productos/editar/' + id);
    
    // Llenar los campos del formulario
    $('#producto_id').val(id);
    $('#descripcion').val(descripcion);
    $('#precio').val(precio);
    $('#stock').val(stock);
    
    // Cambiar el texto del botón
    $('#btnSubmit').html('<i class="fas fa-save"></i> Actualizar');
    
    // Mostrar el modal
    $('#modalProducto').modal('show');
    
    // Enfocar el primer campo
    setTimeout(function() {
        $('#descripcion').focus();
    }, 500);
}

/**
 * Resetear el formulario cuando se cierra el modal
 */
$('#modalProducto').on('hidden.bs.modal', function () {
    // Restaurar título
    $('#modalTitle').text('Agregar Producto');
    
    // Restaurar acción del formulario
    $('#formProducto').attr('action', $('#formProducto').data('add-url') || '/productos/agregar');
    
    // Limpiar formulario
    $('#formProducto')[0].reset();
    $('#producto_id').val('');
    
    // Restaurar texto del botón
    $('#btnSubmit').html('<i class="fas fa-save"></i> Guardar');
    
    // Limpiar clases de validación
    $('.form-control').removeClass('is-valid is-invalid');
    $('.invalid-feedback').remove();
});

/**
 * Función para validar un campo individual
 * @param {jQuery} field - Campo a validar
 */
function validateField(field) {
    const fieldName = field.attr('name');
    const fieldValue = field.val().trim();
    let isValid = true;
    let errorMessage = '';

    // Limpiar mensajes de error previos
    field.siblings('.invalid-feedback').remove();
    field.removeClass('is-valid is-invalid');

    switch (fieldName) {
        case 'descripcion':
            if (fieldValue.length < 2) {
                isValid = false;
                errorMessage = 'La descripción debe tener al menos 2 caracteres.';
            } else if (fieldValue.length > 100) {
                isValid = false;
                errorMessage = 'La descripción no puede exceder 100 caracteres.';
            }
            break;

        case 'precio':
            const precio = parseFloat(fieldValue);
            if (isNaN(precio) || precio <= 0) {
                isValid = false;
                errorMessage = 'El precio debe ser un número mayor a 0.';
            } else if (precio > 999999.99) {
                isValid = false;
                errorMessage = 'El precio no puede ser mayor a $999,999.99';
            }
            break;

        case 'stock':
            const stock = parseInt(fieldValue);
            if (isNaN(stock) || stock < 0) {
                isValid = false;
                errorMessage = 'El stock debe ser un número mayor o igual a 0.';
            } else if (stock > 999999) {
                isValid = false;
                errorMessage = 'El stock no puede ser mayor a 999,999 unidades.';
            }
            break;
    }

    // Aplicar clases de validación
    if (fieldValue && isValid) {
        field.addClass('is-valid');
    } else if (!isValid) {
        field.addClass('is-invalid');
        field.after(`<div class="invalid-feedback">${errorMessage}</div>`);
    }

    return isValid;
}

/**
 * Función para validar todo el formulario
 * @returns {boolean} True si el formulario es válido
 */
function validateForm() {
    let isValid = true;
    
    // Validar todos los campos requeridos
    $('#formProducto input[required]').each(function() {
        if (!validateField($(this))) {
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Función para mostrar alertas dinámicas
 * @param {string} message - Mensaje de la alerta
 * @param {string} type - Tipo de alerta (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
    const alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
    
    // Insertar la alerta al principio del contenido
    $('.container-fluid').prepend(alertHtml);
    
    // Auto-remover después de 5 segundos
    setTimeout(function() {
        $('.alert').fadeOut(500, function() {
            $(this).remove();
        });
    }, 5000);
}

/**
 * Función para confirmar eliminación con mejor UX
 * @param {Event} event - Evento del click
 * @param {string} productName - Nombre del producto a eliminar
 */
function confirmarEliminacion(event, productName) {
    event.preventDefault();
    
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer.`)) {
        // Deshabilitar el botón para evitar clicks múltiples
        const btn = $(event.target).closest('button');
        btn.prop('disabled', true);
        btn.html('<i class="fas fa-spinner fa-spin"></i> Eliminando...');
        
        // Enviar el formulario
        $(event.target).closest('form').submit();
    }
}

/**
 * Función para formatear precio en tiempo real
 */
$('#precio').on('input', function() {
    let value = $(this).val();
    if (value && !isNaN(value)) {
        // Limitar a 2 decimales
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts[1] && parts[1].length > 2) {
                $(this).val(parts[0] + '.' + parts[1].substring(0, 2));
            }
        }
    }
});

/**
 * Función para auto-guardar borradores (opcional)
 */
function autoSaveDraft() {
    const formData = {
        descripcion: $('#descripcion').val(),
        precio: $('#precio').val(),
        stock: $('#stock').val()
    };
    
    // Solo guardar si hay contenido
    if (formData.descripcion || formData.precio || formData.stock) {
        localStorage.setItem('product_draft', JSON.stringify(formData));
    }
}

/**
 * Función para restaurar borrador
 */
function restoreDraft() {
    const draft = localStorage.getItem('product_draft');
    if (draft) {
        const data = JSON.parse(draft);
        if (confirm('Se encontró un borrador guardado. ¿Deseas restaurarlo?')) {
            $('#descripcion').val(data.descripcion || '');
            $('#precio').val(data.precio || '');
            $('#stock').val(data.stock || '');
            
            // Limpiar borrador después de restaurar
            localStorage.removeItem('product_draft');
        }
    }
}

/**
 * Funciones de utilidad para mejorar UX
 */

// Actualizar contador de caracteres para descripción
$('#descripcion').on('input', function() {
    const maxLength = 100;
    const currentLength = $(this).val().length;
    const remaining = maxLength - currentLength;
    
    // Remover contador previo
    $(this).siblings('.char-counter').remove();
    
    // Agregar nuevo contador
    if (currentLength > 0) {
        $(this).after(`<small class="char-counter text-muted">${remaining} caracteres restantes</small>`);
    }
});

// Confirmar antes de salir si hay cambios sin guardar
let formChanged = false;
$('#formProducto input').on('input', function() {
    formChanged = true;
});

$('#formProducto').on('submit', function() {
    formChanged = false;
});

$(window).on('beforeunload', function() {
    if (formChanged) {
        return '¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.';
    }
});

// Función para buscar productos en la tabla (si se implementa búsqueda)
function filtrarProductos(searchTerm) {
    const rows = $('.table tbody tr');
    
    if (!searchTerm) {
        rows.show();
        return;
    }
    
    rows.each(function() {
        const text = $(this).text().toLowerCase();
        if (text.includes(searchTerm.toLowerCase())) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}