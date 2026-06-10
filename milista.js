const contenedorFavoritos = document.getElementById('contenedor-favoritos');

// Función para leer y mostrar las películas guardadas
function mostrarFavoritos() {
    // Recuperamos las películas del almacenamiento local
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];

    // Si la lista está vacía, mostramos un mensaje amistoso
    if (listaFavoritos.length === 0) {
        contenedorFavoritos.innerHTML = '<p class="empty-message">Aún no has añadido películas a tu lista. ¡Explora el inicio!</p>';
        return;
    }

    // Limpiamos el contenedor
    contenedorFavoritos.innerHTML = '';

    // Dibujamos cada película guardada
    listaFavoritos.forEach(pelicula => {
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('movie-card');
        // Quitamos la posición absoluta para que en esta página los títulos se lean siempre fijos abajo
        tarjeta.style.position = 'relative'; 

        tarjeta.innerHTML = `
            <img src="${pelicula.poster}" alt="${pelicula.titulo}">
            <div class="movie-info-fav" style="padding: 10px; background: #1a1615;">
                <h3 style="font-size: 14px; margin-bottom: 5px;">${pelicula.titulo}</h3>
                <span style="color: var(--color-primario);">⭐ ${pelicula.voto.toFixed(1)}</span>
                <button class="btn-remove" onclick="eliminarDeLista('${pelicula.id}')">Quitar</button>
            </div>
        `;
        contenedorFavoritos.appendChild(tarjeta);
    });
}

// Función para eliminar una película de la lista
function eliminarDeLista(id) {
    let listaFavoritos = JSON.parse(localStorage.getItem('sofveria_favoritos')) || [];
    
    // Filtramos la lista para dejar fuera la película que queremos borrar
    listaFavoritos = listaFavoritos.filter(pelicula => pelicula.id !== id);
    
    // Guardamos la nueva lista en LocalStorage
    localStorage.setItem('sofveria_favoritos', JSON.stringify(listaFavoritos));
    
    // Volvemos a pintar la pantalla para que desaparezca al instante
    mostrarFavoritos();
}

// Ejecutar la función al cargar la página
mostrarFavoritos();