document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-container');
    const dateDisplay = document.getElementById('current-date');
    
    // Fecha actual
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if(dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('es-ES', options);
    }

    // Cargar datos
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            // Ordenar por fecha
            data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            container.innerHTML = ''; 

            data.forEach(noticia => {
                const fechaNoticia = new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                
                // --- LÓGICA DE AUDIO MEJORADA ---
                let audioPlayer = '';
                if (noticia.audio) {
                    audioPlayer = `
                        <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
                            <p style="font-size: 0.85rem; color: #78be20; margin-bottom: 8px; font-weight: 600;">
                                🎙️ Escuchar análisis:
                            </p>
                            <audio controls style="width: 100%; height: 32px; border-radius: 20px;">
                                <source src="${noticia.audio}">
                                Tu navegador no soporta el audio.
                            </audio>
                        </div>
                    `;
                }
                // -----------------------------

                const card = document.createElement('article');
                card.className = 'news-card';
                card.innerHTML = `
                    <div class="card-header">
                        <span class="category-tag ${noticia.categoria ? noticia.categoria.toLowerCase().replace(' ', '-') : 'general'}">${noticia.categoria}</span>
                        <span class="date">${fechaNoticia}</span>
                    </div>
                    <h3>${noticia.titulo}</h3>
                    <p>${noticia.resumen}</p>
                    
                    ${audioPlayer} 

                    <a href="${noticia.enlace_fuente}" target="_blank" class="read-more">Leer informe completo &rarr;</a>
                `;
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<p>Error al cargar las noticias.</p>';
        });
});
