/* URL del archivo JSON de datos */
const DATA_URL = './data.json';

// Formatear fecha: Ej. "25 de octubre de 2025"
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

/**
 * Genera la tarjeta de noticia y la inserta en el contenedor.
 * @param {Object} news Objeto con la información de la noticia.
 * @returns {HTMLElement}
 */
const createNewsCard = (news) => {
  const article = document.createElement('article');
  article.className = 'news-card';

  // Imagen superior
  const img = document.createElement('img');
  img.className = 'card-image';
  img.src = news.imagen || '';
  img.alt = news.titulo;
  article.appendChild(img);

  // Cuerpo de la tarjeta
  const body = document.createElement('div');
  body.className = 'card-body';

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  const categorySpan = document.createElement('span');
  categorySpan.className = `badge ${news.categoria}`;
  categorySpan.textContent = news.categoria;
  const dateSpan = document.createElement('span');
  dateSpan.className = 'date';
  dateSpan.textContent = formatDate(news.fecha);
  meta.appendChild(categorySpan);
  meta.appendChild(dateSpan);
  body.appendChild(meta);

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = news.titulo;
  body.appendChild(title);

  const excerpt = document.createElement('p');
  excerpt.className = 'card-excerpt';
  excerpt.textContent = news.resumen;
  body.appendChild(excerpt);

  article.appendChild(body);

  // Pie de la tarjeta: audio y enlace
  const footer = document.createElement('div');
  footer.className = 'card-footer';

  if (news.audio) {
    const audioEl = document.createElement('audio');
    audioEl.className = 'audio-player';
    audioEl.controls = true;
    audioEl.src = news.audio;
    footer.appendChild(audioEl);
  }
  const readLink = document.createElement('a');
  readLink.href = news.enlace_fuente;
  readLink.className = 'btn-read';
  readLink.target = '_blank';
  readLink.rel = 'noopener noreferrer';
  readLink.textContent = 'Leer informe completo →';
  footer.appendChild(readLink);
  article.appendChild(footer);

  return article;
};

/**
 * Carga las noticias desde el archivo JSON y las muestra en la página.
 */
async function loadNews() {
  const container = document.getElementById('news-container');
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const data = await response.json();
    // Ordenar por fecha descendente
    data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    container.innerHTML = '';
    data.forEach((news) => {
      const card = createNewsCard(news);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error cargando noticias:', error);
    container.innerHTML = `<div class="error-msg"><h3>No se pudieron cargar las noticias</h3><p>Por favor, verifica que el archivo <strong>data.json</strong> existe en la misma carpeta.</p><small>Detalle técnico: ${error.message}</small></div>`;
  }
}

// Inicializar la página cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
});
