// 1. CONFIGURACIÓN INICIAL (Pon tu clave aquí)
const API_KEY = 'b46d1f6c718586ac87e104a286f7f5c6'; 

// Enlaces de la API de TMDb para Películas Populares y Tendencias
const URL_POPULARES = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
const URL_TENDENCIAS = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&language=es-ES`;
const URL_BUSQUEDA = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=`;

// URL base obligatoria de TMDb para poder cargar las imágenes de los pósters
const URL_IMAGEN = 'https://image.tmdb.org/t/p/w500';

// 2. CAPTURAR LOS CONTENEDORES DEL HTML
const contenedorPopulares = document.getElementById('contenedor-populares');
const contenedorTendencias = document.getElementById('contenedor-tendencias');
const inputBusqueda = document.getElementById('input-busqueda');

// 3. FUNCIÓN PRINCIPAL PARA OBTENER DATOS
async function cargarSeccion(url, contenedor) {
    try {
        const respuesta = await fetch(url);
        const datos = await respuesta.json();
        
        // Limpiamos el contenedor antes de meter películas
        contenedor.innerHTML = '';

        // Recorremos las 20 películas que nos devuelve la API
        datos.results.forEach(pelicula => {
            // Creamos un div para la tarjeta de la película
            const tarjeta = document.createElement('div');
            tarjeta.classList.add('movie-card');

            // Si la película no tiene póster, usamos una imagen por defecto
            const rutaPoster = pelicula.poster_path ? `${URL_IMAGEN}${pelicula.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Imagen';

          tarjeta.innerHTML = `
             <img src="${rutaPoster}" alt="${pelicula.title}" onclick="abrirDetalles('${pelicula.id}')">
              <div class="movie-info">
               <h3>${pelicula.title}</h3>
             <span>⭐ ${pelicula.vote_average.toFixed(1)}</span>
              <button class="btn-add-list" onclick="guardarEnLista('${pelicula.id}', '${pelicula.title.replace(/'/g, "\\'")}', '${rutaPoster}', ${pelicula.vote_average})">
               <span class="material-symbols-outlined">add</span> Mi Lista
              </button>
             </div>
            `;
        

            // Añadimos la tarjeta al contenedor correspondiente
            contenedor.appendChild(tarjeta);
        });

    } catch (error) {
        console.error("Error al cargar las películas:", error);
    }
}

// PROGRAMAR EL BUSCADOR INTELIGENTE
inputBusqueda.addEventListener('input', (evento) => {
    const textoBusqueda = evento.target.value.trim();
    const titulo = document.getElementById('titulo-principal');
    const seccionTendencias = document.getElementById('seccion-tendencias');

    if (textoBusqueda.length > 0) {
        titulo.innerText = `Resultados para: "${textoBusqueda}"`;
        seccionTendencias.style.display = 'none'; // Oculta la fila de tendencias
        cargarSeccion(`${URL_BUSQUEDA}${textoBusqueda}`, contenedorPopulares);
    } else {
        titulo.innerText = "Recomendados para ti";
        seccionTendencias.style.display = 'block'; // Muestra las tendencias de nuevo
        cargarSeccion(URL_POPULARES, contenedorPopulares);
    }
});

// 5. INICIALIZAR LA PÁGINA (Cargar las listas al abrir la web)
cargarSeccion(URL_POPULARES, contenedorPopulares);
cargarSeccion(URL_TENDENCIAS, contenedorTendencias);
// Función para mover el carrusel con las flechas
function deslizar(idContenedor, direccion) {
    const contenedor = document.getElementById(idContenedor);
    // Calculamos cuánto se moverá (el ancho de unas 3 tarjetas aprox)
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
    inputBusqueda.value = ''; // Limpia el buscador si había texto
    document.getElementById('titulo-principal').innerText = "Recomendados para ti";
    document.getElementById('seccion-tendencias').style.display = 'block';
    cargarSeccion(URL_POPULARES, contenedorPopulares);
});

document.getElementById('btn-recomendados').addEventListener('click', (e) => {
    e.preventDefault();
    // Te desplaza suavemente hacia abajo hasta la sección si la página es muy larga
    document.getElementById('titulo-principal').scrollIntoView({ behavior: 'smooth' });
});
// Función para guardar películas en el almacenamiento local (LocalStorage)
function guardarEnLista(id, titulo, poster, voto) {
    // 1. Obtener la lista actual de películas guardadas (si no hay ninguna, empezamos con un arreglo vacío)
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];

    // 2. Comprobar si la película ya estaba agregada para no repetirla
    const existe = listaFavoritos.some(p => p.id === id);

    if (!existe) {
        // 3. Si no existe, creamos el objeto de la película y lo sumamos a la lista
        const nuevaPelicula = { id, titulo, poster, voto };
        listaFavoritos.push(nuevaPelicula);
        
        // 4. Guardamos la lista actualizada de vuelta en el navegador transformándola en texto
        localStorage.setItem('sofveria_favoritos', JSON.stringify(listaFavoritos));
        alert(`"${titulo}" se ha añadido a Mi Lista.`);
    } else {
        alert("Esta película ya está en tu lista.");
    }
}
// CONTROL DE LA VENTANA MODAL Y REPRODUCTOR
const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const videoContainer = document.getElementById('video-container');
const videoPlayer = document.getElementById('video-player');

// Función que se activa al hacer clic en una película
async function abrirDetalles(id) {
    try {
        // 1. Pedimos los datos completos de la película a TMDb usando su ID
        const urlDetalles = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`;
        const respuesta = await fetch(urlDetalles);
        const pelicula = await respuesta.json();

        // 2. Rellenamos los textos de la modal
        document.getElementById('modal-img').src = pelicula.poster_path ? `${URL_IMAGEN}${pelicula.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Imagen';
        document.getElementById('modal-titulo').innerText = pelicula.title;
        document.getElementById('modal-puntuacion').innerText = `⭐ ${pelicula.vote_average.toFixed(1)} (Reseñas)`;
        document.getElementById('modal-fecha').innerText = pelicula.release_date ? pelicula.release_date.split('-')[0] : 'N/A';
        document.getElementById('modal-sinopsis').innerText = pelicula.overview || "No hay una sinopsis disponible para esta película.";

        // Ocultamos el reproductor de video por defecto cada vez que abrimos una película nueva
        videoContainer.style.display = 'none';
        videoPlayer.src = '';

        // 3. Buscar el Tráiler oficial en YouTube a través de la API de TMDb
        const urlVideos = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`;
        const respVideos = await fetch(urlVideos);
        const datosVideos = await respVideos.json();
        
        // Buscamos un video que sea tipo "Trailer" y de "YouTube"
        const trailer = datosVideos.results.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube') 
                     || datosVideos.results.find(vid => vid.site === 'YouTube'); // Alternativa por si no dice "Trailer"

        // Configurar acción al presionar "Ver Tráiler"
        const btnTrailer = document.getElementById('btn-ver-trailer');
        if (trailer) {
            btnTrailer.style.display = 'block';
            btnTrailer.onclick = () => {
                videoPlayer.src = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
                videoContainer.style.display = 'block';
                videoContainer.scrollIntoView({ behavior: 'smooth' });
            };
        } else {
            btnTrailer.style.display = 'none'; // Se oculta si de plano TMDb no tiene tráiler en YouTube
        }

        // Configurar acción al presionar "Ver Película" (Simulador profesional)
        document.getElementById('btn-ver-pelicula').onclick = () => {
            alert(`🎬 Iniciando la reproducción de: "${pelicula.title}". \n\nNota técnica: En un entorno real, aquí se conectaría un servidor de streaming de video seguro.`);
        };

        // 4. Mostramos la ventana modal quitando el display oculto
        modal.style.display = 'block';

    } catch (error) {
        console.error("Error al obtener los detalles de la película:", error);
    }
}

// Cerrar la ventana al pulsar en la (X)
closeModalBtn.onclick = () => {
    modal.style.display = 'none';
    videoPlayer.src = ''; // Apaga el video de YouTube para que no siga sonando de fondo
};

// Cerrar la ventana automáticamente si el usuario hace clic fuera de la caja central
window.onclick = (evento) => {
    if (evento.target === modal) {
        modal.style.display = 'none';
        videoPlayer.src = '';
    }
};