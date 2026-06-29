function mostrarSeccion(id) {
    const secciones = document.querySelectorAll('.seccion');

    secciones.forEach(seccion => {
        seccion.classList.remove('activa');
    });

    document.getElementById(id).classList.add('activa');
}

function cambiarMes() {
    const mes = document.getElementById('selectorMes').value;
    const figura = document.getElementById('figuraMes');
    const mensaje = document.getElementById('mensajeFigura');

    mensaje.classList.add('oculto');
    figura.style.display = 'block';
    figura.src = `figuras/serie_${mes}.png`;
}

function mostrarMensajeFigura() {
    const figura = document.getElementById('figuraMes');
    const mensaje = document.getElementById('mensajeFigura');

    figura.style.display = 'none';
    mensaje.classList.remove('oculto');
}

function cargarCSV(ruta, contenedorID) {
    fetch(ruta)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo CSV');
            }
            return response.text();
        })
        .then(data => {
            const filas = data.trim().split(/\r?\n/);
            let html = '<table>';

            filas.forEach((fila, i) => {
                const columnas = fila.split(',').map(col => col.trim());
                html += '<tr>';

                columnas.forEach(columna => {
                    const valor = columna.trim();

                    if (i === 0) {
                        html += `<th>${valor}</th>`;
                    } else {
                        html += `<td>${valor}</td>`;
                    }
                });

                html += '</tr>';
            });

            html += '</table>';
            document.getElementById(contenedorID).innerHTML = html;
        })
        .catch(error => {
            document.getElementById(contenedorID).innerHTML = `
                <div class="mensaje">
                    No se pudo cargar ${ruta}. Verifica que el archivo exista o abre la página con Live Server.
                </div>
            `;
        });
}

cargarCSV('datos/intensidad.csv', 'tablaIntensidad');
cargarCSV('datos/direccion.csv', 'tablaDireccion');
