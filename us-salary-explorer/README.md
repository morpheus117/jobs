# US Salary Explorer (OEWS)

Dashboard interactivo para explorar salarios ocupacionales en Estados Unidos según datos del Bureau of Labor Statistics (OEWS).

## Requisitos

- Node.js >= 18
- npm >= 9

## Instalación y ejecución local

```bash
# 1. Entra al directorio del proyecto
cd us-salary-explorer

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev
```

Abre tu navegador en **http://localhost:5173**

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot-reload |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Preview del build de producción |

## Estructura del proyecto

```
us-salary-explorer/
├── public/
│   └── salaries.json          # Dataset OEWS (editable)
├── src/
│   ├── components/
│   │   ├── SearchableSelect.jsx  # Dropdown con búsqueda
│   │   ├── WageDisplay.jsx       # Tarjeta de salario anual
│   │   └── SalaryBarChart.jsx    # Gráfico de barras Chart.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
└── package.json
```

## Datos

Los datos se cargan desde `public/salaries.json`. Cada entrada tiene la siguiente estructura:

```json
{
  "occ_code": "15-1252",
  "occ_title": "Software Developers",
  "state": "California",
  "state_abbr": "CA",
  "a_mean": 155540
}
```

Para actualizar los datos con cifras reales del BLS, descarga el archivo OEWS de https://www.bls.gov/oes/ y adapta el formato.
