// Gráfico de Ventas
const ctx = document.getElementById('ventasChart').getContext('2d');
const ventasChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
            label: 'Ventas ($)',
            data: [8500, 12300, 9800, 15400, 11200, 18600, 12450],
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

// Efectos hover para las cards
$('.info-box').hover(
    function() {
        $(this).addClass('elevation-3');
    },
    function() {
        $(this).removeClass('elevation-3');
    }
);

// Actualizar hora cada segundo
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    // Aquí puedes actualizar algún elemento con la hora
}

setInterval(updateTime, 1000);