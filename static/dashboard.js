// Dashboard JavaScript - Gráfico de Ventas

let ventasChart = null;

function loadVentasChart() {
    fetch('/api/ventas-chart-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de ventas recibidos:', data);
            createVentasChart(data.labels, data.data);
        })
        .catch(error => {
            console.error('Error cargando datos de ventas:', error);
            createVentasChart(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'], [0, 0, 0, 0, 0, 0, 0]);
        });
}

function createVentasChart(labels, data) {
    const ctx = document.getElementById('ventasChart');
    if (!ctx) {
        console.error('No se encontró el canvas ventasChart');
        return;
    }
    
    if (ventasChart) {
        ventasChart.destroy();
    }
    
    ventasChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

$(document).ready(function() {
    console.log('Dashboard iniciado');
    loadVentasChart();
    
    $('.info-box').hover(
        function() {
            $(this).addClass('elevation-3');
        },
        function() {
            $(this).removeClass('elevation-3');
        }
    );
    
    $('.small-box').hover(
        function() {
            $(this).addClass('elevation-2');
        },
        function() {
            $(this).removeClass('elevation-2');
        }
    );
});