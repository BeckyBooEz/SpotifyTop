const contenedor = document.getElementById("contenedor");
const buscador = document.getElementById("buscador");
const filtroReproducciones = document.getElementById("filtroReproducciones");
const filtroMinutos = document.getElementById("filtroMinutos");

let cancionesCargadas = [];

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
  imagen.style.transition = "opacity 0.5s ease";
  tarjeta.appendChild(imagen);

  const realImage = new Image();
  realImage.src = cancion["Portada Spotify"];

  realImage.onload = () => {
    imagen.style.transition = "opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease";
    imagen.style.opacity = "0";
    imagen.style.transform = "scale(1.1)";
    imagen.style.filter = "blur(4px)";

    setTimeout(() => {
      imagen.src = realImage.src;
      imagen.style.opacity = "1";
      imagen.style.transform = "scale(1)";
      imagen.style.filter = "blur(0)";
    }, 500);
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

function mostrarCanciones(lista) {
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    contenedor.innerHTML = `<p style="text-align:center; color:gray;">No se encontraron canciones con esos filtros.</p>`;
    return;
  }

  lista.forEach(cancion => {
    const tarjeta = crearTarjeta(cancion);
    contenedor.appendChild(tarjeta);
  });
}

async function cargarCanciones() {
  try {
    const respuesta = await fetch('PreferenciasDatos.json');

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo JSON.");
    }

    const data = await respuesta.json();

    cancionesCargadas = data
      .filter(c =>
        c["Reproducciones Totales"] > 30 &&
        c["Minutos Reproducidos"] > 30
      )
      .sort((a, b) => b["Popularidad"] - a["Popularidad"]);

      mostrarCanciones(cancionesCargadas);

  } catch (error) {
    console.error("Hubo un error al cargar los datos:", error);
    contenedor.innerHTML = `<p style="color:red; text-align:center;">No se pudo cargar la información de las canciones.</p>`;
  }
};

function aplicarFiltros() {
  const texto = buscador.value.toLowerCase();
  const minReproducciones = parseInt(filtroReproducciones.value) || 0;
  const minMinutos = parseFloat(filtroMinutos.value) || 0;

  const filtradas = cancionesCargadas.filter(cancion => {
    const coincideTexto =
      cancion["Canción"].toLowerCase().includes(texto) ||
      cancion["Artista"].toLowerCase().includes(texto) ||
      cancion["Álbum"].toLowerCase().includes(texto);

    const cumpleReproducciones = cancion["Reproducciones Totales"] >= minReproducciones;
    const cumpleMinutos = cancion["Minutos Reproducidos"] >= minMinutos;

    return coincideTexto && cumpleReproducciones && cumpleMinutos;
  });

  mostrarCanciones(filtradas);
};

buscador.addEventListener("input", aplicarFiltros);
filtroReproducciones.addEventListener("input", aplicarFiltros);
filtroMinutos.addEventListener("input", aplicarFiltros);

cargarCanciones();