const contenedor = document.getElementById("contenedor");
const buscador = document.getElementById("buscador");
const filtroReproducciones = document.getElementById("filtroReproducciones");
const filtroMinutos = document.getElementById("filtroMinutos");

let cancionesCargadas = [];

async function cargarCanciones() {
  try {
    const respuesta = await fetch('./base/DataCore.json');

    if (!respuesta.ok) {
      throw new Error(`Error http: ${respuesta.status}`);
    }

    const data = await respuesta.json();

    cancionesCargadas = data;

    mostrarCanciones(cancionesCargadas);
    actualizarLimitesDinamicos(cancionesCargadas);
  } catch (error) {
    console.error("Hubo un error al cargar los datos:", error);
    contenedor.innerHTML = `<p style="color:red; text-align:center;">No se pudo cargar la información de las canciones.</p>`;
  }
};

function mostrarCanciones(lista) {
  contenedor.innerHTML = "";

  /* Largo de la lista es 0, No hay resultados en la lista. */
  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="mensaje-sin-resultados">No se encontraron canciones con esos filtros.</p>`;
    return;
  }
  
  const contador = document.getElementById("contador")
  contador.innerHTML = "";
  const resumen = document.createElement("p");
  resumen.textContent = `Mostrando ${lista.length} canciones`;
  resumen.classList.add("resumen-canciones");
  contador.appendChild(resumen);

  /* Largo de la lista es 1, Agarrar el objeto. */
  if (lista.length === 1) {
    const cancion = lista[0];
    const link = cancion["Spotify Link"];
    const nombre = cancion["Canción"];

    /* Si existe link, y en el link esta la palabra "track/" y sacar el id del link  */
    if (link && link.includes("track/")) {
      const id = link.split("track/")[1].split("?")[0];
      console.log(`Filtro único: "${nombre}", ID de Track: ${id}`);
    }
  }

  lista.forEach(cancion => {
    const tarjeta = crearTarjeta(cancion);
    contenedor.appendChild(tarjeta);
  });
};

function crearTarjeta(cancion) {
  const tarjeta = document.createElement("div");
  tarjeta.classList.add("tarjeta");

  const imagen = document.createElement("img");
  imagen.src = cancion["Portada Spotify"];
  imagen.alt = `Portada de ${cancion["Canción"]}`;
  tarjeta.appendChild(imagen);

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

function crearParrafo(titulo, valor) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${titulo}:</strong> ${valor}`;
  return p;
};

function actualizarLimitesDinamicos(lista) {
  if (lista.length === 0) return;

  const maxRepro = Math.max(...lista.map(c => c["Reproducciones Totales"]));
  const maxMinutos = Math.max(...lista.map(c => c["Minutos Reproducidos"]));

  filtroReproducciones.max = maxRepro;
  filtroMinutos.max = maxMinutos.toFixed(2);
}

function aplicarFiltros() {
  const texto = buscador.value.toLowerCase();
  const minReproducciones = filtroReproducciones.value === "" ? null : parseInt(filtroReproducciones.value);
  const minMinutos = filtroMinutos.value === "" ? null : parseFloat(filtroMinutos.value);

  const filtradas = cancionesCargadas.filter(cancion => {
    const coincideTexto =
      cancion["Canción"].toLowerCase().includes(texto) ||
      cancion["Artista"].toLowerCase().includes(texto) ||
      cancion["Álbum"].toLowerCase().includes(texto);

    const cumpleReproducciones = minReproducciones === null || cancion["Reproducciones Totales"] >= minReproducciones;
    const cumpleMinutos = minMinutos === null || cancion["Minutos Reproducidos"] >= minMinutos;

    return coincideTexto && cumpleReproducciones && cumpleMinutos;
  });

  mostrarCanciones(filtradas);
  actualizarLimitesDinamicos(filtradas);
}

buscador.addEventListener("input", aplicarFiltros);

filtroReproducciones.addEventListener("input", () => {
  let valor = filtroReproducciones.value;
  if (valor === "") {
    aplicarFiltros();
    return;
  }

  valor = parseInt(valor);
  const max = parseInt(filtroReproducciones.max);
  if (isNaN(valor) || valor < 0) valor = 0;
  if (valor > max) valor = max;
  filtroReproducciones.value = Math.round(valor);
  aplicarFiltros();
});

filtroMinutos.addEventListener("input", () => {
  let valorTexto = filtroMinutos.value;

  if (valorTexto === "") {
    aplicarFiltros();
    return;
  }

  let valor = parseFloat(valorTexto);
  const max = parseFloat(filtroMinutos.max);

  if (isNaN(valor) || valor < 0) {
    filtroMinutos.value = "";
    aplicarFiltros();
    return;
  }

  if (valor > max) {
    valor = max;
    filtroMinutos.value = valor.toString();
  } else {

    const partes = valorTexto.split(".");
    if (partes.length === 2 && partes[1].length > 2) {
      valor = Math.round(valor * 100) / 100;
      filtroMinutos.value = valor.toString();
    }
  }

  aplicarFiltros();
});

cargarCanciones();
