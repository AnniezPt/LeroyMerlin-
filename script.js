/* URL del archivo JSON de datos */
const DATA_URL = './data.json';

// Formatear fecha larga: Ej. "25 de octubre de 2025"
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

// Formatear fecha corta para botones (Ene 2026)
const formatMonthYear = (date) => {
  if (!date) return '';
  const d = new Date(date);
  let monthYear = d.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
  monthYear = monthYear.replace('.', '');
  return monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
};

/**
 * Genera la tarjeta de noticia y la devuelve.
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
  categorySpan.className = 'badge ' + news.categoria;
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

// Variables globales para filtros
let newsData = [];
const selectedCategories = new Set();
let startDate = null;
let endDate = null;

/**
 * Renderiza el listado de noticias aplicando los filtros seleccionados.
 */
function renderNews() {
  const container = document.getElementById('news-container');
  if (!container) return;
  // Filtrar datos
  let filtered = newsData.filter((item) => {
    // Filtro por categorías
    const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(item.categoria);
    // Filtro por fechas
    let dateMatch = true;
    const itemDate = new Date(item.fecha);
    if (startDate) {
      // comparando solo fecha (ignorar hora)
      dateMatch = dateMatch && itemDate >= startDate;
    }
    if (endDate) {
      dateMatch = dateMatch && itemDate <= endDate;
    }
    return categoryMatch && dateMatch;
  });
  // Ordenar por fecha descendente
  filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  // Limpiar e insertar
  container.innerHTML = '';
  if (filtered.length === 0) {
    container.innerHTML = '<div class="error-msg">No se encontraron noticias con los filtros aplicados.</div>';
    return;
  }
  filtered.forEach((news) => {
    const card = createNewsCard(news);
    container.appendChild(card);
  });
}

/**
 * Carga las noticias desde el archivo JSON, almacena en memoria y genera lista de categorías.
 */
async function loadNews() {
  const container = document.getElementById('news-container');
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      throw new Error('Error HTTP: ' + response.status);
    }
    const data = await response.json();
    newsData = data;
    populateCategoryOptions();
    renderNews();
  } catch (error) {
    console.error('Error cargando noticias:', error);
    if (container) {
      container.innerHTML = '<div class="error-msg"><h3>No se pudieron cargar las noticias</h3><p>Por favor, verifica que el archivo <strong>data.json</strong> existe en la misma carpeta.</p><small>Detalle técnico: ' + error.message + '</small></div>';
    }
  }
}

/**
 * Construye dinámicamente la lista de categorías basándose en los datos cargados.
 */
function populateCategoryOptions() {
  const menu = document.getElementById('category-filter-menu');
  const container = document.getElementById('category-options');
  const searchInput = document.getElementById('category-search');
  if (!menu || !container || !searchInput) return;
  // Limpiar contenedor
  container.innerHTML = '';
  // Obtener categorías únicas y ordenarlas
  const categories = Array.from(new Set(newsData.map((item) => item.categoria))).sort();
  categories.forEach((cat) => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = cat;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedCategories.add(cat);
      } else {
        selectedCategories.delete(cat);
      }
      // Cambiar estilo del botón según selección
      const categoryBtn = document.getElementById('filter-category');
      if (selectedCategories.size > 0) {
        categoryBtn.classList.add('active');
      } else {
        categoryBtn.classList.remove('active');
      }
      renderNews();
    });
    const span = document.createElement('span');
    span.textContent = cat;
    label.appendChild(checkbox);
    label.appendChild(span);
    container.appendChild(label);
  });
  // Filtro en vivo para categorías
  searchInput.value = '';
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const labels = container.querySelectorAll('label');
    labels.forEach((labelEl) => {
      const text = labelEl.textContent.toLowerCase();
      labelEl.style.display = text.includes(query) ? 'flex' : 'none';
    });
  });
}

// Inicializar filtros y eventos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  loadNews();
  const dateBtn = document.getElementById('filter-date');
  const categoryBtn = document.getElementById('filter-category');
  const dateMenu = document.getElementById('date-filter-menu');
  const categoryMenu = document.getElementById('category-filter-menu');
  const applyDateBtn = document.getElementById('apply-date-filter');
  const startInput = document.getElementById('start-date');
  const endInput = document.getElementById('end-date');
  // Toggle menú de fechas
  dateBtn.addEventListener('click', () => {
    const isOpen = dateMenu.classList.contains('open');
    // Cerrar otros menús
    categoryMenu.classList.remove('open');
    // Alternar visibilidad
    if (isOpen) {
      dateMenu.classList.remove('open');
    } else {
      dateMenu.classList.add('open');
    }
  });
  // Toggle menú de categorías
  categoryBtn.addEventListener('click', () => {
    const isOpen = categoryMenu.classList.contains('open');
    dateMenu.classList.remove('open');
    if (isOpen) {
      categoryMenu.classList.remove('open');
    } else {
      categoryMenu.classList.add('open');
    }
  });
  // Aplicar filtro de fechas
  applyDateBtn.addEventListener('click', () => {
    const startVal = startInput.value;
    const endVal = endInput.value;
    startDate = startVal ? new Date(startVal) : null;
    endDate = endVal ? new Date(endVal) : null;
    // Ajustar fecha al final del día para endDate
    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
    }
    // Actualizar texto y estado del botón
    if (startDate || endDate) {
      dateBtn.classList.add('active');
      if (startDate && endDate) {
        dateBtn.textContent = formatMonthYear(startDate) + ' - ' + formatMonthYear(endDate);
      } else if (startDate) {
        dateBtn.textContent = formatMonthYear(startDate);
      } else {
        dateBtn.textContent = formatMonthYear(endDate);
      }
    } else {
      dateBtn.classList.remove('active');
      dateBtn.textContent = 'Fechas';
    }
    dateMenu.classList.remove('open');
    renderNews();
  });
});
