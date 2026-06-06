# PLD Refactorizado

Estructura inicial del proyecto PLD con backend y frontend separados.

## Estructura

```text
.
+-- backend
+-- frontend
```

## Requisitos

- Node.js 20 o superior
- npm 10 o superior
- PostgreSQL disponible para el backend

## Backend

Backend en Node.js con Express, TypeScript, PostgreSQL y JWT.

### Instalacion

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env` con la conexion a PostgreSQL y la llave JWT.

Para inicializar la base local `pld` con usuario `postgres` y password `root`:

```powershell
$env:PGPASSWORD='root'
$exists = psql -U postgres -h localhost -p 5432 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='pld'"
if (-not $exists) { psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE pld" }
psql -U postgres -h localhost -p 5432 -d pld -f database/init.sql
psql -U postgres -h localhost -p 5432 -d pld -f database/informes_comun.sql
psql -U postgres -h localhost -p 5432 -d pld -f database/informe_credito.sql
psql -U postgres -h localhost -p 5432 -d pld -f database/informe_ventas.sql
psql -U postgres -h localhost -p 5432 -d pld -f database/informe_arrendamientos.sql
```

### Ejecucion

```bash
npm run dev
```

El backend queda disponible por defecto en `http://localhost:4000`.

Swagger UI queda disponible en `http://localhost:4000/api-docs`.
El documento OpenAPI queda disponible en `http://localhost:4000/api-docs.json`.

### Endpoints iniciales

- `GET /health`: verifica que el backend esta funcionando.
- `POST /auth/login`: inicia sesion con email `@autocom.mx` y password.
- `GET /auth/me`: obtiene el usuario autenticado usando `Authorization: Bearer <token>`.
- `GET /users`: lista usuarios registrados.
- `POST /users`: crea un usuario.
- `PUT /users/:id`: modifica un usuario.
- `DELETE /users/:id`: elimina un usuario.
- `GET /empresas`: lista empresas.
- `POST /empresas`: crea una empresa.
- `PUT /empresas/:id`: modifica una empresa.
- `DELETE /empresas/:id`: elimina una empresa.
- `GET /informes/cargas`: lista las cargas de informes realizadas.
- `POST /informes/creditos/cargar`: carga XLS de creditos e inserta en `informe_credito_registros`.
- `POST /informes/ventas/cargar`: carga XLS de ventas e inserta en `informe_venta_registros`.
- `POST /informes/arrendamientos/cargar`: carga XLS de arrendamientos e inserta en `informe_arrendamiento_registros`.

### Scripts

- `npm run dev`: ejecuta el servidor en modo desarrollo.
- `npm run build`: compila TypeScript a `dist`.
- `npm start`: ejecuta la version compilada.

## Frontend

Frontend en React con Vite, TypeScript, React Router y Axios.

### Instalacion

```bash
cd frontend
npm install
cp .env.example .env
```

### Ejecucion

```bash
npm run dev
```

El frontend queda disponible por defecto en `http://localhost:5173`.

### Scripts

- `npm run dev`: ejecuta Vite en modo desarrollo.
- `npm run build`: compila el frontend.
- `npm run preview`: sirve localmente la compilacion.

## Desarrollo

Cada proyecto se instala y ejecuta de forma independiente. Para trabajar con ambos al mismo tiempo, abre dos terminales: una en `backend` y otra en `frontend`.
