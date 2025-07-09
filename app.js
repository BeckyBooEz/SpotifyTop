const contenedor = document.getElementById("contenedor");

function crearParrafo(titulo, valor) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${titulo}:</strong> ${valor}`;
  return p;
}

function crearTarjeta(cancion) {
  const tarjeta = document.createElement("div");
  tarjeta.classList.add("tarjeta");

  const imagen = document.createElement("img");
  imagen.src = "images/Foto-Flores.png";
  imagen.alt = `Portada de ${cancion["Canción"]}`;
  imagen.loading = "lazy";
  tarjeta.appendChild(imagen);

  const realImage = new Image();
  realImage.onload = () => {
    imagen.src = cancion["Portada Spotify"];
  };
  realImage.onerror = () => {
    console.warn(`Imagen no cargó: ${cancion["Portada Spotify"]}`);
  };
  realImage.src = cancion["Portada Spotify"];

  const titulo = document.createElement("h3");
  titulo.textContent = cancion["Canción"];

  const artista = crearParrafo("Artista", cancion["Artista"]);
  const album = crearParrafo("Álbum", cancion["Álbum"]);
  const fecha = crearParrafo("Fecha de Lanzamiento", cancion["Fecha de Lanzamiento"]);

  const hr = document.createElement("hr");
  hr.style.margin = "10px 0";
  hr.style.borderColor = "#333";

  const repros = crearParrafo("Reproducciones Totales", cancion["Reproducciones Totales"].toLocaleString());
  const minutos = crearParrafo("Minutos Reproducidos", `${cancion["Minutos Reproducidos"].toFixed(2)} min`);
  const duracion = crearParrafo("Duración", `${cancion["Duración (min)"]} min`);
  const popu = crearParrafo("Popularidad", `${cancion["Popularidad"]} / 100`);

  const enlace = document.createElement("a");
  enlace.href = cancion["Spotify Link"];
  enlace.target = "_blank";
  enlace.title = `Escuchar ${cancion["Canción"]} en Spotify`;
  enlace.textContent = "Escuchar en Spotify";

  tarjeta.appendChild(titulo);
  tarjeta.appendChild(artista);
  tarjeta.appendChild(album);
  tarjeta.appendChild(fecha);
  tarjeta.appendChild(hr);
  tarjeta.appendChild(repros);
  tarjeta.appendChild(minutos);
  tarjeta.appendChild(duracion);
  tarjeta.appendChild(popu);
  tarjeta.appendChild(enlace);

  return tarjeta;
}

async function cargarCanciones() {
  try {
    const respuesta = await fetch('PreferenciasDatos.json');

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo JSON.");
    }

    const data = await respuesta.json();

    const cancionesFiltradas = data
      .filter(c =>
        c["Reproducciones Totales"] > 30 &&
        c["Minutos Reproducidos"] > 30
      )
      .sort((a, b) => b["Popularidad"] - a["Popularidad"]);

    cancionesFiltradas.forEach(cancion => {
      const tarjeta = crearTarjeta(cancion);
      contenedor.appendChild(tarjeta);
    });

  } catch (error) {
    console.error("Hubo un error al cargar los datos:", error);
    contenedor.innerHTML = `<p style="color:red; text-align:center;">No se pudo cargar la información de las canciones.</p>`;
  }
}

cargarCanciones();
