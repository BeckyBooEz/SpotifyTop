const contenedor = document.getElementById("contenedor");

function crearTarjeta(cancion) {
  const tarjeta = document.createElement("div");
  tarjeta.classList.add("tarjeta");

  tarjeta.innerHTML = `
    <img src="${cancion["Portada Spotify"]}" alt="Portada de ${cancion["Canción"]}">
    <h3>${cancion["Canción"]}</h3>
    <p><strong>Artista:</strong> ${cancion["Artista"]}</p>
    <p><strong>Álbum:</strong> ${cancion["Álbum"]}</p>
    <p><strong>Fecha de Lanzamiento:</strong> ${cancion["Fecha de Lanzamiento"]}</p>

    <hr style="margin: 10px 0; border-color: #333;">

    <p><strong>Reproducciones Totales:</strong> ${cancion["Reproducciones Totales"].toLocaleString()}</p>
    <p><strong>Minutos Reproducidos:</strong> ${cancion["Minutos Reproducidos"].toFixed(2)} min</p>
    <p><strong>Duración:</strong> ${cancion["Duración (min)"]} min</p>
    <p><strong>Popularidad:</strong> ${cancion["Popularidad"]} / 100</p>

    <a href="${cancion["Spotify Link"]}" target="_blank" title="Escuchar ${cancion["Canción"]} en Spotify">
      Escuchar en Spotify
    </a>
  `;

  return tarjeta;
}

function cargarCanciones() {
  fetch('PreferenciasDatos.json')
    .then(res => {
      if (!res.ok) throw new Error("No se pudo cargar el archivo JSON.");
      return res.json();
    })
    .then(data => {
      const cancionesFiltradas = data
        .filter(c => 
          c["Reproducciones Totales"] > 30 &&
          c["Minutos Reproducidos"] > 120
          )
        .sort((a, b) => b["Popularidad"] - a["Popularidad"]);

      cancionesFiltradas.forEach(cancion => {
        const tarjeta = crearTarjeta(cancion);
        contenedor.appendChild(tarjeta);
});

    })
    .catch(error => {
      console.error("Hubo un error al cargar los datos:", error);
      contenedor.innerHTML = `<p style="color:red; text-align:center;">No se pudo cargar la información de las canciones.</p>`;
    });
}

cargarCanciones();
