// =========================================================================
// 1. CONFIGURACIÓN DE OMDb API
// =========================================================================
const API_KEY = "ce3f855f"; 

// Elementos de la interfaz y ventana modal
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');
const inputBusqueda = document.getElementById('input-busqueda');

// Array global para almacenar las películas cargadas y alimentar el botón "Sorpréndeme"
let poolPeliculasAleatorias = [];

// Imagen de respaldo por si algún póster falla de origen
const IMAGEN_RESPALDO = `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop`;

// =========================================================================
// 2. FUNCIÓN CORE: GENERADOR DINÁMICO MULTICULTURAL / MULTIGÉNERO
// =========================================================================
async function cargarSeccionPorPalabras(keywords, contenedor) {
    try {
        if (!contenedor) return;
        contenedor.innerHTML = ''; 
        let peliculasMezcladas = [];

        // Consultas simultáneas por cada palabra clave asociada al género o categoría
        for (const word of keywords) {
            const url = `https://www.omdbapi.com/?s=${encodeURIComponent(word)}&apikey=${API_KEY}&type=movie`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            if (datos.Response === "True") {
                // Filtramos las que tengan poster y agarramos un subset para garantizar variedad mixta
                const peliculasValidas = datos.Search.filter(p => p.Poster && p.Poster !== "N/A");
                peliculasMezcladas = peliculasMezcladas.concat(peliculasValidas.slice(0, 5));
            }
        }

        // Guardamos en el pool global para la función "Sorpréndeme"
        poolPeliculasAleatorias = poolPeliculasAleatorias.concat(peliculasMezcladas);

        // Mezclamos el array aleatoriamente para mantener el catálogo fresco en cada recarga
        peliculasMezcladas.sort(() => 0.5 - Math.random());

        // Inyectamos las tarjetas en su contenedor correspondiente
        peliculasMezcladas.forEach(pelicula => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');

            tarjeta.innerHTML = `
                <img src="${pelicula.Poster}" alt="${pelicula.Title}" referrerpolicy="no-referrer" onclick="abrirDetalles('${pelicula.imdbID}')" onerror="this.onerror=null; this.src='${IMAGEN_RESPALDO}';">
                <div class="movie-info">
                    <h3>${pelicula.Title}</h3>
                    <span>📅 ${pelicula.Year}</span>
                    <button class="btn-add-list" onclick="guardarEnLista('${pelicula.imdbID}', '${pelicula.Title.replace(/'/g, "\\'")}', '${pelicula.Poster}', 8.5)">
                        <span class="material-symbols-outlined">add</span> Mi Lista
                    </button>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al construir la sección por palabras clave:", error);
    }
}

// =========================================================================
// 3. INICIALIZADOR DEL CATÁLOGO PRINCIPAL (TENDENCIAS, COMEDIA, FAMILIAR)
// =========================================================================
function inicializarCatalogo() {
    poolPeliculasAleatorias = []; // Reseteamos el pool en cada reinicio

    const contenedorTendencias = document.getElementById('contenedor-tendencias-hoy');
    const contenedorFamiliar = document.getElementById('contenedor-familiar');
    const contenedorComedia = document.getElementById('contenedor-comedia');

    // --- Carrusel 1: Tendencias de Hoy Automatizadas ---
    // Usamos el año en curso para traer lanzamientos de máxima relevancia actual
    const anioActual = new Date().getFullYear().toString();
    cargarSeccionPorPalabras([anioActual, '2025', 'Hits', 'Action'], contenedorTendencias);

    // --- Carrusel 2: Cine Familiar ---
    cargarSeccionPorPalabras(['Family', 'Animation', 'Disney', 'Pixar'], contenedorFamiliar);

    // --- Carrusel 3: Risas Aseguradas (Comedia) ---
    cargarSeccionPorPalabras(['Comedy', 'Funny', 'Hilarious'], contenedorComedia);
    
    // Inicializar el carrusel de continuar viendo si existen datos previos
    comprobarContinuarViendo();
}

// =========================================================================
// 4. DETALLES EN MODAL Y REPRODUCTOR INTEGRADO
// =========================================================================
async function abrirDetalles(imdbID) {
    try {
        const url = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}&plot=full`;
        const respuesta = await fetch(url);
        const pelicula = await respuesta.json();

        document.getElementById('modal-img').src = pelicula.Poster !== "N/A" ? pelicula.Poster : IMAGEN_RESPALDO;
        document.getElementById('modal-titulo').innerText = pelicula.Title;
        document.getElementById('modal-puntuacion').innerText = `⭐ ${pelicula.imdbRating || 'N/A'} (IMDb)`;
        document.getElementById('modal-fecha').innerText = pelicula.Year;
        document.getElementById('modal-sinopsis').innerText = pelicula.Plot !== "N/A" ? pelicula.Plot : "Sinopsis no disponible.";

        videoContainer.style.display = 'none';

        // Lanzador del reproductor de video nativo
        document.getElementById('btn-ver-pelicula').onclick = () => {
            videoContainer.innerHTML = `
                <video id="video-player-real" controls autoplay style="width:100%; aspect-ratio: 16/9; display:block;">
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
                    Tu navegador no soporta reproducción de video.
                </video>
            `;
            videoContainer.style.display = 'block';
            
            // Registramos de forma simulada en la lista "Continuar Viendo"
            registrarContinuarViendo(pelicula);

            setTimeout(() => {
                videoContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        };

        document.getElementById('btn-ver-trailer').style.display = 'none';
        modal.style.display = 'block';

    } catch (error) {
        console.error("Error al abrir detalles desde la API:", error);
    }
}

// =========================================================================
// 5. IDEAS AGREGADAS: SORPRÉNDEME Y CONTINUAR VIENDO
// =========================================================================
function obtenerPeliculaAleatoria() {
    if (poolPeliculasAleatorias.length === 0) return;
    
    // Eliminamos duplicados por Id de IMDB
    const unicas = [...new Map(poolPeliculasAleatorias.map(p => [p.imdbID, p])).values()];
    const indice = Math.floor(Math.random() * unicas.length);
    
    abrirDetalles(unicas[indice].imdbID);
}

function registrarContinuarViendo(pelicula) {
    let lista = JSON.parse(localStorage.getItem('sofveria_progresos')) || [];
    if (!lista.some(p => p.imdbID === pelicula.imdbID)) {
        lista.unshift({ imdbID: pelicula.imdbID, Title: pelicula.Title, Poster: pelicula.Poster, Year: pelicula.Year });
        localStorage.setItem('sofveria_progresos', JSON.stringify(lista.slice(0, 4))); // Máximo 4 guardados
    }
}

function comprobarContinuarViendo() {
    const contenedor = document.getElementById('contenedor-continuar');
    const seccion = document.getElementById('seccion-continuar');
    let lista = JSON.parse(localStorage.getItem('sofveria_progresos')) || [];

    if (lista.length > 0 && contenedor && seccion) {
        seccion.style.display = 'block';
        contenedor.innerHTML = '';
        lista.forEach(pelicula => {
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');
            tarjeta.innerHTML = `
                <img src="${pelicula.Poster}" alt="${pelicula.Title}" referrerpolicy="no-referrer" onclick="abrirDetalles('${pelicula.imdbID}')">
                <div class="progress-bar-container" style="background:#444; width:100%; height:4px; margin-top:-4px; position:relative;">
                    <div style="background:#e50914; width:65%; height:100%;"></div>
                </div>
            `;
            contenedor.appendChild(tarjeta);
        });
    }
}

// =========================================================================
// 6. BUSCADOR INTELIGENTE EN REJILLA
// =========================================================================
inputBusqueda.addEventListener('input', async (evento) => {
    const textoBusqueda = evento.target.value.trim();
    const tituloPrincipal = document.getElementById('titulo-principal');
    const contenedorPopulares = document.getElementById('contenedor-populares');
    
    // Captura de las nuevas secciones para ocultarlas/mostrarlas adecuadamente
    const seccionTendencias = document.getElementById('seccion-tendencias-hoy');
    const seccionFamiliar = document.getElementById('seccion-familiar');
    const seccionComedia = document.getElementById('seccion-comedia');
    const seccionContinuar = document.getElementById('seccion-continuar');

    if (textoBusqueda.length > 2) {
        tituloPrincipal.innerText = `Resultados para: "${textoBusqueda}"`;
        
        // Escondemos los feeds secundarios durante la búsqueda activa
        if (seccionTendencias) seccionTendencias.style.display = 'none';
        if (seccionFamiliar) seccionFamiliar.style.display = 'none';
        if (seccionComedia) seccionComedia.style.display = 'none';
        if (seccionContinuar) seccionContinuar.style.display = 'none';

        try {
            const url = `https://www.omdbapi.com/?s=${encodeURIComponent(textoBusqueda)}&apikey=${API_KEY}`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            
            contenedorPopulares.innerHTML = ''; 

            if (datos.Response === "True") {
                datos.Search.forEach(pelicula => {
                    if (!pelicula.Poster || pelicula.Poster === "N/A") return;

                    const tarjeta = document.createElement('div');
                    tarjeta.classList.add('movie-card');
                    tarjeta.innerHTML = `
                        <img src="${pelicula.Poster}" alt="${pelicula.Title}" referrerpolicy="no-referrer" onclick="abrirDetalles('${pelicula.imdbID}')" onerror="this.onerror=null; this.src='${IMAGEN_RESPALDO}';">
                        <div class="movie-info">
                            <h3>${pelicula.Title}</h3>
                            <span>📅 ${pelicula.Year}</span>
                            <button class="btn-add-list" onclick="guardarEnLista('${pelicula.imdbID}', '${pelicula.Title.replace(/'/g, "\\'")}', '${pelicula.Poster}', 8.5)">
                                <span class="material-symbols-outlined">add</span> Mi Lista
                            </button>
                        </div>
                    `;
                    contenedorPopulares.appendChild(tarjeta);
                });
            } else {
                contenedorPopulares.innerHTML = `<p class="error-msg" style="color: #aaa; padding: 20px;">No se han encontrado resultados.</p>`;
            }
        } catch (error) {
            console.error("Error en el buscador inteligente:", error);
        }

    } else if (textoBusqueda.length === 0) {
        tituloPrincipal.innerText = "Recomendados para ti";
        if (seccionTendencias) seccionTendencias.style.display = 'block';
        if (seccionFamiliar) seccionFamiliar.style.display = 'block';
        if (seccionComedia) seccionComedia.style.display = 'block';
        inicializarCatalogo();
    }
});

// =========================================================================
// 7. COMPORTAMIENTO Y NAVEGACIÓN
// =========================================================================
function deslizar(idContenedor, direccion) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
    contenedor.scrollLeft += (direccion === 'izquierda' ? -500 : 500);
}

document.getElementById('btn-inicio').addEventListener('click', (e) => {
    e.preventDefault();
    inputBusqueda.value = ''; 
    document.getElementById('titulo-principal').innerText = "Recomendados para ti";
    
    document.getElementById('seccion-tendencias-hoy').style.display = 'block';
    document.getElementById('seccion-familiar').style.display = 'block';
    document.getElementById('seccion-comedia').style.display = 'block';
    
    inicializarCatalogo();
});

document.getElementById('btn-recomendados').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('titulo-principal').scrollIntoView({ behavior: 'smooth' });
});

function guardarEnLista(id, titulo, poster, voto) {
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];
    if (!listaFavoritos.some(p => p.id === id)) {
        listaFavoritos.push({ id, titulo, poster, voto });
        localStorage.setItem('sofveria_favoritos', JSON.stringify(listaFavoritos));
        alert(`"${titulo}" se ha añadido a Mi Lista.`);
    } else {
        alert("Esta película ya está en tu lista.");
    }
}

// Controles de cierre de la modal
closeModalBtn.onclick = () => {
    modal.style.display = 'none';
    videoContainer.style.display = 'none';
    videoContainer.innerHTML = '';
};

window.onclick = (evento) => {
    if (evento.target === modal) {
        modal.style.display = 'none';
        videoContainer.style.display = 'none';
        videoContainer.innerHTML = '';
    }
};

// =========================================================================
// 8. ARRANQUE
// =========================================================================
inicializarCatalogo();