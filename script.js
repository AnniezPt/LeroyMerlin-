document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('news-container');
    const dateDisplay = document.getElementById('current-date');
    
    // Poner fecha actual
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if(dateDisplay) {
        dateDisplay.textContent = new Date().toLocaleDateString('es-ES', options);
    }

    // Cargar datos
    fetch('./data.json')
        .then(response => response.json())
        .then(data => {
            // Ordenar por fecha (más reciente primero)
            data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            container.innerHTML = ''; 

            data.forEach(noticia => {
                const fechaNoticia = new Date(noticia.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                
                // --- REPRODUCTOR DE AUDIO ---
                let audioPlayer = '';
                if (noticia.audio) {
                    audioPlayer = `
                        <div style="margin: 15px 0; background: #f1f8f3; padding: 10px; border-radius: 8px; border: 1px solid #78be20;">
                            <p style="font-size: 0.8rem; color: #333; margin-bottom: 5px; font-weight: bold;">🎧 Escuchar resumen (NotebookLM):</p>
                            <audio controls style="width: 100%; height: 35px;">
                                <source src="${noticia.audio}" type="audio/mpeg">
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
