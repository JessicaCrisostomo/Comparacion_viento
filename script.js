let datosGlobales = [];

const mesesNombre = [
    'Enero', 'Febrero', 'Marzo', 'Abril',
    'Mayo', 'Junio', 'Julio', 'Agosto',
    'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const direcciones = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW', 'N'
];

const ticksDireccion = [
    0, 22.5, 45, 67.5,
    90, 112.5, 135, 157.5,
    180, 202.5, 225, 247.5,
    270, 292.5, 315, 337.5, 360
];

function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(seccion => {
        seccion.classList.remove('activa');
    });

    document.getElementById(id).classList.add('activa');
}

function cargarCSV(ruta) {
    return fetch(ruta)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar: ' + ruta);
            }
            return response.text();
        })
        .then(data => {
            const filas = data.trim().split(/\r?\n/);
            const headers = filas[0].split(',').map(h => h.trim());

            return filas.slice(1).map(fila => {
                const columnas = fila.split(',').map(c => c.trim());
                let obj = {};

                headers.forEach((h, i) => {
                    obj[h] = columnas[i];
                });

                return obj;
            });
        });
}

Promise.all([
    cargarCSV('datos/comparacion_2025.csv'),
    cargarCSV('datos/intensidad.csv'),
    cargarCSV('datos/direccion.csv')
]).then(([comparacion, intensidad, direccion]) => {

    datosGlobales = comparacion.map(d => ({
        ...d,
        fecha: new Date(d.Time),
        WS: parseFloat(d.WS),
        v_europeo_ifs: parseFloat(d.v_europeo_ifs),
        v_gfs: parseFloat(d.v_gfs),
        v_meteoblue: parseFloat(d.v_meteoblue),
        WD: parseFloat(d.WD),
        d_europeo_ifs: parseFloat(d.d_europeo_ifs),
        d_gfs: parseFloat(d.d_gfs),
        d_meteoblue: parseFloat(d.d_meteoblue)
    }));

    crearTabla(intensidad, 'tablaIntensidad');
    crearTabla(direccion, 'tablaDireccion');

    actualizarGraficos();

}).catch(error => {
    console.error(error);
    alert('Error cargando archivos CSV. Revisa que estén en la carpeta datos/ y que tengan el nombre correcto.');
});

function actualizarGraficos() {
    const mes = parseInt(document.getElementById('selectorMes').value);

    const datosMes = datosGlobales.filter(d => {
        return d.fecha.getMonth() === mes;
    });

    graficarVelocidad(datosMes, mes);
    graficarDireccion(datosMes, mes);
}

function graficarVelocidad(datos, mes) {
    const fechas = datos.map(d => d.Time);

    const trazas = [
        {
            x: fechas,
            y: datos.map(d => d.WS),
            mode: 'lines',
            name: 'Observado',
            hovertemplate: '%{x}<br>Observado: %{y:.2f} m/s<extra></extra>'
        },
        {
            x: fechas,
            y: datos.map(d => d.v_europeo_ifs),
            mode: 'lines',
            name: 'Europeo',
            hovertemplate: '%{x}<br>Europeo: %{y:.2f} m/s<extra></extra>'
        },
        {
            x: fechas,
            y: datos.map(d => d.v_gfs),
            mode: 'lines',
            name: 'GFS',
            hovertemplate: '%{x}<br>GFS: %{y:.2f} m/s<extra></extra>'
        },
        {
            x: fechas,
            y: datos.map(d => d.v_meteoblue),
            mode: 'lines',
            name: 'Meteoblue',
            hovertemplate: '%{x}<br>Meteoblue: %{y:.2f} m/s<extra></extra>'
        }
    ];

    const layout = {
        title: `Intensidad del viento - ${mesesNombre[mes]}`,
        xaxis: { title: 'Fecha' },
        yaxis: { title: 'Velocidad (m/s)' },
        hovermode: 'x unified'
    };

    Plotly.newPlot('graficoVelocidad', trazas, layout, {responsive: true});
}

function graficarDireccion(datos, mes) {
    const fechas = datos.map(d => d.Time);

    const trazas = [
        {
            x: fechas,
            y: datos.map(d => d.WD),
            mode: 'lines',
            name: 'Observado',
            hovertemplate: '%{x}<br>Observado: %{y:.1f}°<extra></extra>'
        },
        {
            x: fechas,
            y: datos.map(d => d.d_europeo_ifs),
            mode: 'lines',
            name: 'Europeo',
            hovertemplate: '%{x}<br>Europeo: %{y:.1f}°<extra></extra>'
        },
        {
            x: fechas,
            y: datos.map(d => d.d_gfs),
            mode: 'lines',
            name: 'GFS',
            hovertemplate: '%{x}<br>GFS: %{y:.1f}°<extra></extra>'
        },
        {
            x: fechas,
            y: datos.map(d => d.d_meteoblue),
            mode: 'lines',
            name: 'Meteoblue',
            hovertemplate: '%{x}<br>Meteoblue: %{y:.1f}°<extra></extra>'
        }
    ];

    const layout = {
        title: `Dirección del viento - ${mesesNombre[mes]}`,
        xaxis: { title: 'Fecha' },
        yaxis: {
            title: 'Dirección',
            range: [0, 360],
            tickvals: ticksDireccion,
            ticktext: direcciones
        },
        hovermode: 'x unified'
    };

    Plotly.newPlot('graficoDireccion', trazas, layout, {responsive: true});
}

function crearTabla(datos, contenedor) {
    if (datos.length === 0) {
        document.getElementById(contenedor).innerHTML = 'Sin datos disponibles';
        return;
    }

    let html = '<table>';

    const headers = Object.keys(datos[0]);

    html += '<tr>';
    headers.forEach(h => {
        html += `<th>${h}</th>`;
    });
    html += '</tr>';

    datos.forEach(fila => {
        html += '<tr>';

        headers.forEach(h => {
            html += `<td>${fila[h]}</td>`;
        });

        html += '</tr>';
    });

    html += '</table>';

    document.getElementById(contenedor).innerHTML = html;
}
