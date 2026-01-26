// Configuración
const DATA_URL = './data.json';

// Función para formatear fechas amigablemente (ej: "25 de octubre de 2023")
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Función asíncrona principal para cargar noticias
async function loadNews() {
    const container = document.getElementById('news-container');

    try {
        // Petición real al archivo JSON
        const response = await fetch(DATA_URL);

        // Verificación de estado HTTP
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Limpiar el indicador de carga
        container.innerHTML = '';

        // Ordenar noticias: De más reciente a más antigua
        // Asume formato ISO "YYYY-MM-DD"
        data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Generar DOM para cada noticia
        data.forEach(news => {
            const article = document.createElement('article');
            article.className = 'news-card';

            // Inyección segura de contenido
            article.innerHTML = `
                <div class="card-body">
                    <div class="card-meta">
                        <span class="badge ${news.categoria}">${news.categoria}</span>
                        <span class="date">${formatDate(news.fecha)}</span>
                    </div>
                    <h3 class="card-title">${news.titulo}</h3>
                    <p class="card-excerpt">${news.resumen}</p>
                </div>
                <div class="card-footer">
                    <a href="${news.enlace_fuente}" class="btn-read" target="_blank" rel="noopener noreferrer">
                        Leer informe completo &rarr;
                    </a>
                </div>
            `;

            container.appendChild(article);
        });

    } catch (error) {
        console.error('Error cargando noticias:', error);
        container.innerHTML = `
            <div class="error-msg">
                <h3>No se pudieron cargar las noticias</h3>
                <p>Por favor, verifica que el archivo <strong>data.json</strong> existe en la misma carpeta.</p>
                <small>Detalle técnico: ${error.message}</small>
            </div>
        `;
    }
}

// Inicializar fecha actual en el encabezado
document.addEventListener('DOMContentLoaded', () => {
    // Poner fecha de hoy
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }

    // Cargar noticias
    loadNews();
});
