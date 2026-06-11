// ==========================================
// CONFIGURACIÓN DE LA API (¡ESTO DEBE IR PRIMERO!)
// ==========================================
const API_KEY = 'b46d1f6c718586ac87e104a286f7f5c6'; 
const URL_POPULARES = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
const URL_TENDENCIAS = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=es-ES&page=1`;
const URL_BUSQUEDA = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;
const URL_IMAGEN = 'https://image.tmdb.org/t/p/w500';
// 2. CAPTURAR LOS CONTENEDORES DEL HTML
// =========================================================================
// 1. CONFIGURACIÓN DE LA API Y CAPTURA DE CONTENEDORES (SIEMPRE ARRIBA)
// =========================================================================
// (Asegúrate de que tus constantes de las URLs y API_KEY estén declaradas aquí arriba)

const contenedorPopulares = document.getElementById('contenedor-populares');
const contenedorTendencias = document.getElementById('contenedor-tendencias');
const inputBusqueda = document.getElementById('input-busqueda');

// CONTROL DE LA VENTANA MODAL Y REPRODUCTOR
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');

// =========================================================================
// 2. FUNCIÓN PRINCIPAL PARA OBTENER DATOS DE LA API
// =========================================================================
// =========================================================================
// FUNCIÓN MODIFICADA PARA PRUEBA DE CONEXIÓN LOCAL
// =========================================================================
// =========================================================================
// NUEVA FUNCIÓN INDEPENDIENTE (SIN DEPENDER DE ENLACES DE TMDB)
// =========================================================================
async function cargarSeccion(url, contenedor) {
    try {
        // Creamos nuestro propio catálogo de películas estables con imágenes garantizadas
        const peliculasSofVeria = [
            {
                id: '1',
                title: 'The Mandalorian and Grogu',
                vote_average: 8.5,
                poster: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=500&auto=format&fit=crop'
            },
            {
                id: '2',
                title: 'Interstellar',
                vote_average: 8.8,
                poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop'
            },
            {
                id: '3',
                title: 'Stranger Things',
                vote_average: 8.7,
                poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=500&auto=format&fit=crop'
            },
            {
                id: '4',
                title: 'Blade Runner 2049',
                vote_average: 8.3,
                poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=500&auto=format&fit=crop'
            },
            {
                id: '5',
                title: 'Avatar: El Sentido del Agua',
                vote_average: 7.9,
                poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500&auto=format&fit=crop'
            }
        ];

        // Limpiamos el contenedor (así quitamos los cuadros oscuros vacíos)
        contenedor.innerHTML = '';

        // Recorremos nuestra lista e inyectamos las tarjetas con portadas reales
        peliculasSofVeria.forEach(pelicula => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');

            tarjeta.innerHTML = `
                <img src="${pelicula.poster}" alt="${pelicula.title}" onclick="abrirDetalles('${pelicula.id}')">
                <div class="movie-info">
                    <h3>${pelicula.title}</h3>
                    <span>⭐ ${pelicula.vote_average.toFixed(1)}</span>
                    <button class="btn-add-list" onclick="guardarEnLista('${pelicula.id}', '${pelicula.title.replace(/'/g, "\\'")}', '${pelicula.poster}', ${pelicula.vote_average})">
                        <span class="material-symbols-outlined">add</span> Mi Lista
                    </button>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar el catálogo local:", error);
    }
}

// =========================================================================
// 3. FUNCIÓN PARA ABRIR LA MODAL Y REPRODUCIR (TRÁILER / PELÍCULA)
// =========================================================================
async function abrirDetalles(id) {
    try {
        // En lugar de fetch a TMDb, rellenamos con datos directos de prueba
        document.getElementById('modal-titulo').innerText = "Película Seleccionada";
        document.getElementById('modal-puntuacion').innerText = `⭐ 8.5 (SofVeria)`;
        document.getElementById('modal-fecha').innerText = "2026";
        document.getElementById('modal-sinopsis').innerText = "Disfruta de la mejor experiencia de reproducción en streaming directamente desde tu servidor local en SofVeria.";

        // Ocultamos el reproductor de video por defecto
        videoContainer.style.display = 'none';

        // Lógica automática del botón de Ver Película
        document.getElementById('btn-ver-pelicula').onclick = () => {
            videoContainer.innerHTML = `
                <video id="video-player-real" controls autoplay style="width:100%; aspect-ratio: 16/9; display:block;">
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                    Tu navegador no soporta reproducción de video.
                </video>
            `;
            videoContainer.style.display = 'block';
        };

        // El botón del tráiler lo ocultamos momentáneamente en esta prueba
        document.getElementById('btn-ver-trailer').style.display = 'none';

        // Mostrar la ventana modal
        modal.style.display = 'block';

    } catch (error) {
        console.error("Error en modal local:", error);
    }
}

// =========================================================================
// 4. FUNCIONES AUXILIARES (BUSCADOR, CARRUSEL, FAVORITOS Y MENÚ)
// =========================================================================
// Programar el Buscador Inteligente
inputBusqueda.addEventListener('input', (evento) => {
    const textoBusqueda = evento.target.value.trim();
    const titulo = document.getElementById('titulo-principal');
    const seccionTendencias = document.getElementById('seccion-tendencias');

    if (textoBusqueda.length > 0) {
        titulo.innerText = `Resultados para: "${textoBusqueda}"`;
        seccionTendencias.style.display = 'none'; 
        cargarSeccion(`${URL_BUSQUEDA}${textoBusqueda}`, contenedorPopulares);
    } else {
        titulo.innerText = "Recomendados para ti";
        seccionTendencias.style.display = 'block'; 
        cargarSeccion(URL_POPULARES, contenedorPopulares);
    }
});

// Función para mover el carrusel con las flechas
function deslizar(idContenedor, direccion) {
    const contenedor = document.getElementById(idContenedor);
    const distanciaX = 500; 

    if (direccion === 'izquierda') {
        contenedor.scrollLeft -= distanciaX;
    } else {
        contenedor.scrollLeft += distanciaX;
    }
}

// Activar botones del Menú
document.getElementById('btn-inicio').addEventListener('click', (e) => {
    e.preventDefault();
    inputBusqueda.value = ''; 
    document.getElementById('titulo-principal').innerText = "Recomendados para ti";
    document.getElementById('seccion-tendencias').style.display = 'block';
    cargarSeccion(URL_POPULARES, contenedorPopulares);
});

document.getElementById('btn-recomendados').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('titulo-principal').scrollIntoView({ behavior: 'smooth' });
});

// Guardar en favoritos (LocalStorage)
function guardarEnLista(id, titulo, poster, voto) {
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];
    const existe = listaFavoritos.some(p => p.id === id);

    if (!existe) {
        const nuevaPelicula = { id, titulo, poster, voto };
        listaFavoritos.push(nuevaPelicula);
        localStorage.setItem('sofveria_favoritos', JSON.stringify(listaFavoritos));
        alert(`"${titulo}" se ha añadido a Mi Lista.`);
    } else {
        alert("Esta película ya está en tu lista.");
    }
}

// =========================================================================
// 5. EVENTOS DE CIERRE DE LA VENTANA MODAL
// =========================================================================
closeModalBtn.onclick = () => {
    modal.style.display = 'none';
    videoContainer.style.display = 'none';
    videoContainer.innerHTML = `<iframe id="video-player" width="100%" height="315" src="" frameborder="0" allowfullscreen></iframe>`;
};

window.onclick = (evento) => {
    if (evento.target === modal) {
        modal.style.display = 'none';
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = `<iframe id="video-player" width="100%" height="315" src="" frameborder="0" allowfullscreen></iframe>`;
    }
};

// =========================================================================
// 6. INICIALIZAR LA PÁGINA (SIEMPRE AL FINAL DEL TODO)
// =========================================================================
cargarSeccion(URL_POPULARES, contenedorPopulares);
cargarSeccion(URL_TENDENCIAS, contenedorTendencias);