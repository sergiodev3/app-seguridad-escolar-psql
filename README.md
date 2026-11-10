# Seguridad Escolar

Aplicación web para que los alumnos de un plantel **reporten incidentes**, consulten un **mapa de zonas de riesgo**, pidan ayuda con un **botón de alerta** y se organicen para **caminar juntos** a la entrada y a la salida. Un **moderador** (docente) revisa los reportes y atiende las alertas.

Es el proyecto de referencia de la materia de desarrollo de aplicaciones web: el grupo lo construye paso a paso, desde el esquema de la base de datos hasta cada módulo. La [guía de desarrollo](#guía-de-desarrollo-paso-a-paso) al final indica en qué orden se escribe el código.

---

## Inicio rápido

> Requisitos: **Node.js 22+** y **PostgreSQL** (con pgAdmin).

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Crear la base de datos `seguridad_escolar` en pgAdmin.
3. Copiar `.env.example` a `.env` y poner la contraseña de PostgreSQL en `DATABASE_URL`.
4. Crear las tablas y los datos iniciales:
   ```bash
   npm run db:init
   ```
5. Levantar el servidor:
   ```bash
   npm run dev
   ```
6. Abrir **http://localhost:3000**.

> **No usar Live Server.** Express sirve las páginas *y* la API en el mismo puerto. Con Live Server (puerto 5500) las llamadas a `/api` no llegan al servidor y aparece `Cannot GET`.

| Dato | Valor |
| --- | --- |
| Moderador inicial | matrícula `moderador`, contraseña `moderador123` |
| Código de registro para alumnos | el valor de `CODIGO_REGISTRO` en `.env` (por defecto `CBT2026`) |
| Documentación interactiva de la API | http://localhost:3000/api-docs (Swagger) |
| Prueba de salud | http://localhost:3000/api/salud |

---

## Stack

| Capa | Tecnología | Para qué se usa |
| --- | --- | --- |
| Vista | HTML, CSS y JavaScript (módulos ES) | Una página por pantalla, sin frameworks |
| Mapas | [Leaflet](https://leafletjs.com/) + OpenStreetMap | Mapa de zonas, ubicación del reporte y alertas |
| Servidor | Node.js 22 + Express 5 | API REST y archivos estáticos |
| Base de datos | PostgreSQL + `pg` | Persistencia, llaves foráneas y transacciones |
| Seguridad | `bcryptjs` + `jsonwebtoken` | Contraseñas cifradas y sesión con JWT |
| Documentación | OpenAPI 3 + `swagger-ui-express` | Probar la API desde el navegador |
| Despliegue | Railway (API + BD) y Vercel (vista) | Publicar la app para usarla en celulares |

---

## Arquitectura

El backend sigue el patrón **Rutas → Middlewares → Controladores → Modelos**. Cada capa tiene una sola responsabilidad:

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| Rutas | `src/routes/` | Asocian URL + método HTTP con un controlador |
| Middlewares | `src/middlewares/` | Filtros previos: ¿trae token?, ¿tiene el rol? |
| Controladores | `src/controllers/` | **Reglas de negocio** y códigos de respuesta |
| Modelos | `src/models/` | **Solo SQL**, siempre con parámetros (`$1`, `$2`) |
| Vista | `public/` | Páginas HTML y su JavaScript |

```mermaid
flowchart LR
    subgraph Navegador
        V["Páginas HTML<br/>public/*.html"] --> JS["public/js/api.js<br/>fetch + token"]
    end

    subgraph Servidor["Servidor Express (server.js)"]
        R["Rutas<br/>src/routes"] --> M["Middlewares<br/>verificarToken / soloRol"]
        M --> C["Controladores<br/>reglas de negocio"]
        C --> MO["Modelos<br/>consultas SQL"]
        ERR["Middleware de errores"]
    end

    DB[("PostgreSQL")]

    JS -- "HTTP + JSON<br/>Authorization: Bearer" --> R
    MO -- "pool.query" --> DB
    C -. "error" .-> ERR
```

### Cómo viaja una petición protegida

Ejemplo: un alumno inicia sesión y luego consulta sus contactos.

```mermaid
sequenceDiagram
    autonumber
    actor A as Alumno
    participant F as Vista (index.html)
    participant API as Express
    participant MW as verificarToken
    participant DB as PostgreSQL

    A->>F: Escribe matrícula y contraseña
    F->>API: POST /api/auth/login
    API->>DB: SELECT usuario por matrícula
    DB-->>API: fila con password_hash
    API->>API: bcrypt.compareSync()
    API-->>F: { token, usuario }
    F->>F: guardarSesion() en localStorage

    A->>F: Abre "Mis contactos"
    F->>API: GET /api/contactos<br/>Authorization: Bearer token
    API->>MW: ¿token válido?
    alt token inválido o vencido
        MW-->>F: 401 → cerrarSesion()
    else token válido
        MW->>API: req.usuario = { id, rol, nombre }
        API->>DB: SELECT contactos del usuario
        DB-->>API: filas
        API-->>F: 200 [contactos]
    end
```

---

## Base de datos

Ocho tablas. El esquema completo está en [`src/db/esquema.sql`](src/db/esquema.sql).

```mermaid
erDiagram
    usuarios ||--o{ contactos : "tiene (máx. 2)"
    usuarios ||--o{ reportes : "crea"
    usuarios |o--o{ reportes : "modera"
    usuarios ||--o{ alertas : "dispara"
    usuarios ||--o{ grupos : "crea"
    usuarios ||--o{ grupo_integrantes : "se une"
    grupos ||--o{ grupo_integrantes : "tiene"
    puntos_encuentro ||--o{ grupos : "es punto de"

    usuarios {
        int id PK
        varchar nombre
        varchar matricula UK
        varchar grupo_escolar
        text password_hash
        varchar rol "alumno | moderador"
        boolean activo
    }
    contactos {
        int id PK
        int usuario_id FK
        varchar nombre
        varchar telefono
    }
    reportes {
        int id PK
        int usuario_id FK
        varchar tipo
        text descripcion
        date fecha
        varchar franja
        float lat
        float lng
        boolean anonimo
        varchar estado "pendiente | aprobado | rechazado"
        int moderado_por FK
    }
    alertas {
        int id PK
        int usuario_id FK
        float lat
        float lng
        boolean atendida
        timestamptz creada_en
    }
    puntos_encuentro {
        int id PK
        varchar nombre
        text descripcion
        float lat
        float lng
        boolean activo
    }
    grupos {
        int id PK
        int creador_id FK
        int punto_id FK
        varchar ruta
        date fecha
        varchar franja
        int cupo "2 a 10"
    }
    grupo_integrantes {
        int grupo_id PK, FK
        int usuario_id PK, FK
        timestamptz unido_en
    }
    configuracion {
        varchar clave PK
        text valor
    }
```

`configuracion` guarda pares clave-valor (`codigo_registro`, `telefono_policia`) y no se relaciona con otras tablas.

---

## Módulos

| Módulo | Qué hace | Pantallas | API |
| --- | --- | --- | --- |
| **Base: usuarios** | Registro con código del plantel, login con JWT, roles y contactos de confianza | `index.html`, `registro.html`, `inicio.html`, `perfil.html` | `/api/auth`, `/api/contactos` |
| **1. Reportes y mapa** | El alumno reporta un incidente, el moderador lo aprueba y aparece como zona aproximada en el mapa | `reportar.html`, `mapa.html`, `moderador.html` | `/api/reportes` |
| **2. Botón de alerta** | Mantener 2 s registra la alerta con ubicación y llama a la policía municipal; opción de avisar por WhatsApp | `inicio.html`, `moderador.html` | `/api/alertas`, `/api/config` |
| **3. Caminemos juntos** | Grupos del día para llegar o salir acompañados desde un punto de encuentro | `grupos.html` | `/api/grupos`, `/api/puntos` |

### Ciclo de vida de un reporte

```mermaid
stateDiagram-v2
    [*] --> pendiente: el alumno envía el reporte (RN-04)
    pendiente --> aprobado: el moderador aprueba
    pendiente --> rechazado: el moderador rechaza
    aprobado --> [*]: aparece en el mapa (RN-05, RN-06)
    rechazado --> [*]: nunca se publica
```

### Flujo del botón de alerta

```mermaid
flowchart TD
    I([El alumno presiona el botón]) --> T{¿Lo mantiene<br/>2 segundos?}
    T -- "No, lo soltó" --> X([Se cancela, RN-08])
    T -- Sí --> U["Pide la ubicación<br/>(máximo 4 s de espera)"]
    U --> P["POST /api/alertas<br/>(si falla, no detiene la llamada)"]
    P --> L["Abre tel: con el número<br/>de la policía municipal"]
    P --> MOD["La alerta aparece en el<br/>panel del moderador"]
    MOD --> AT([El moderador la marca como atendida])
```

### Unirse a un grupo (transacción)

`grupo.model.js` usa `BEGIN ... FOR UPDATE ... COMMIT` para que, si dos alumnos se unen al mismo tiempo al último lugar, solo entre uno.

```mermaid
flowchart TD
    A([POST /api/grupos/:id/unirse]) --> B["BEGIN<br/>SELECT cupo ... FOR UPDATE"]
    B --> C{¿Existe y es de hoy?}
    C -- No --> E1["ROLLBACK → 404"]
    C -- Sí --> D{¿Ya es integrante?}
    D -- Sí --> E2["ROLLBACK → 409"]
    D -- No --> F{¿Hay cupo?}
    F -- No --> E3["ROLLBACK → 409 lleno"]
    F -- Sí --> G["INSERT integrante<br/>COMMIT → 201"]
```

---

## Reglas de negocio

Las reglas viven en los **controladores**. La validación en la vista solo ayuda al usuario: la protección real siempre está en el servidor.

| # | Regla | Dónde se aplica | Si no se cumple |
| --- | --- | --- | --- |
| RN-01 | Solo se registra quien tenga el código de registro vigente | `auth.controller.js` | 403 |
| RN-02 | La matrícula es única | `auth.controller.js` + `UNIQUE` | 409 |
| RN-03 | Contraseña de mínimo 8 caracteres, guardada solo cifrada | `auth.controller.js` | 400 |
| RN-04 | Todo reporte nace `pendiente`; solo el moderador lo aprueba o rechaza | `reportes.controller.js` + `soloRol` | 403 |
| RN-05 | El mapa solo muestra reportes `aprobados` | `reporte.model.js` | — |
| RN-06 | Coordenadas públicas redondeadas a 3 decimales (≈ 100 m) | `reportes.controller.js` | — |
| RN-07 | En un reporte anónimo nunca se devuelve el autor, ni al moderador | `reportes.controller.js` | — |
| RN-08 | La alerta se confirma manteniendo el botón 2 segundos | `public/js/alerta.js` | Se cancela |
| RN-09 | El teléfono de la policía solo lo cambia el moderador | `config.controller.js` | 403 |
| RN-10 | Cupo de 2 a 10; nadie se une a un grupo lleno | `grupos.controller.js` + `CHECK` + transacción | 409 |
| RN-11 | Nadie está dos veces en el mismo grupo | Llave primaria compuesta | 409 |
| RN-12 | Solo se listan los grupos de hoy | `grupo.model.js` (`CURRENT_DATE`) | — |
| RN-13 | El punto de encuentro se elige de una lista, nunca un domicilio | `grupos.controller.js` | 400 |
| RN-14 | Los integrantes se muestran solo con nombre y grupo escolar | `grupo.model.js` | — |

---

## API

Todas las rutas, salvo registro, login y salud, requieren el encabezado `Authorization: Bearer <token>`. El detalle de cada una está en `/api-docs`.

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/api/salud` | Público | Comprueba servidor y base de datos |
| POST | `/api/auth/registro` | Público | Crea una cuenta de alumno |
| POST | `/api/auth/login` | Público | Devuelve token y usuario |
| GET | `/api/auth/yo` | Sesión | Datos del usuario actual |
| GET · POST | `/api/contactos` | Sesión | Listar o agregar contactos (máx. 2) |
| DELETE | `/api/contactos/:id` | Sesión | Eliminar un contacto propio |
| POST | `/api/reportes` | Sesión | Crear un reporte |
| GET | `/api/reportes?tipo=&franja=` | Sesión | Reportes aprobados, con filtros |
| GET | `/api/reportes/pendientes` | Moderador | Reportes por revisar |
| PATCH | `/api/reportes/:id` | Moderador | Aprobar o rechazar |
| POST | `/api/alertas` | Sesión | Registrar una alerta |
| GET | `/api/alertas` | Moderador | Alertas de hoy |
| PATCH | `/api/alertas/:id` | Moderador | Marcar como atendida |
| GET | `/api/config/policia` | Sesión | Teléfono de la policía |
| PUT | `/api/config/policia` | Moderador | Cambiar el teléfono |
| GET | `/api/puntos` | Sesión | Puntos de encuentro activos |
| GET · POST | `/api/grupos` | Sesión | Grupos de hoy / crear grupo |
| POST · DELETE | `/api/grupos/:id/unirse` | Sesión | Unirse o salir de un grupo |

---

## Estructura del proyecto

```text
seguridad-escolar/
├── server.js                 # Punto de entrada: middlewares, rutas, Swagger, errores
├── .env.example              # Plantilla de variables de entorno
├── docs/
│   ├── openapi.yaml          # Contrato de la API (Swagger)
│   └── Guia_Docente_...md    # Guía docente completa
├── src/
│   ├── db/
│   │   ├── esquema.sql       # Tablas
│   │   ├── conexion.js       # Pool de conexiones a PostgreSQL
│   │   └── init.js           # Crea tablas y datos iniciales
│   ├── middlewares/auth.js   # verificarToken y soloRol
│   ├── models/               # SQL por entidad
│   ├── controllers/          # Reglas de negocio
│   └── routes/               # URL → controlador
└── public/                   # Vista
    ├── index.html            # Login
    ├── registro.html
    ├── inicio.html           # Menú y botón de alerta
    ├── reportar.html
    ├── mapa.html
    ├── grupos.html
    ├── perfil.html           # Contactos de confianza
    ├── moderador.html
    ├── css/estilos.css       # Mobile first
    └── js/
        ├── config.js         # Dirección de la API (local o Railway)
        ├── api.js            # fetch con token, un solo lugar
        ├── sesion.js         # Guardar/leer sesión y proteger páginas
        └── *.js              # Un script por pantalla
```

### Variables de entorno

| Variable | Ejemplo | Uso |
| --- | --- | --- |
| `PUERTO` | `3000` | Puerto local (Railway usa `PORT`) |
| `DATABASE_URL` | `postgresql://postgres:clave@localhost:5432/seguridad_escolar` | Conexión a PostgreSQL |
| `JWT_SECRETO` | una frase larga | Firma de los tokens |
| `CODIGO_REGISTRO` | `CBT2026` | Código que piden para registrarse |
| `TELEFONO_POLICIA` | `8100000000` | Número inicial del botón de alerta |
| `FRONTEND_URL` | `http://localhost:3000` | Orígenes permitidos por CORS (separados por coma) |

> `.env` nunca se sube a Git: contiene contraseñas. Solo se sube `.env.example`.

---

## Guía de desarrollo paso a paso

Orden recomendado para escribir la app desde cero. Cada paso se apoya en el anterior y termina con una forma de **comprobar** que funciona antes de avanzar.

```mermaid
flowchart LR
    F1["1. Proyecto<br/>y entorno"] --> F2["2. Base<br/>de datos"] --> F3["3. Servidor"] --> F4["4. Usuarios<br/>y seguridad"] --> F5["5. Vista<br/>base"] --> F6["6. Módulo 1<br/>Reportes"] --> F7["7. Módulo 2<br/>Alerta"] --> F8["8. Módulo 3<br/>Grupos"] --> F9["9. Despliegue"]
```

### Fase 1. Proyecto y entorno

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 1 | Crear la carpeta, `npm init -y`, agregar `"type": "module"` y los scripts `dev`, `start`, `db:init` | `package.json` | npm, módulos ES | `npm run` lista los scripts |
| 2 | Instalar dependencias: `npm i express pg bcryptjs jsonwebtoken cors swagger-ui-express yaml` | `package.json`, `package-lock.json` | Dependencias | Existe `node_modules/` |
| 3 | Excluir `node_modules/` y `.env` de Git | `.gitignore` | Secretos fuera del repositorio | `git status` no muestra `.env` |
| 4 | Escribir la plantilla de variables y copiarla a `.env` con valores reales | `.env.example`, `.env` | Variables de entorno | El archivo `.env` existe y no aparece en `git status` |

### Fase 2. Base de datos

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 5 | Crear la base `seguridad_escolar` en pgAdmin | — | Servidor vs. base de datos | Aparece en pgAdmin |
| 6 | Diseñar el diagrama entidad-relación (ver [Base de datos](#base-de-datos)) | — | PK, FK, cardinalidad, tabla intermedia | El diagrama tiene las 8 tablas |
| 7 | Escribir las tablas con `CREATE TABLE IF NOT EXISTS`, `CHECK`, `UNIQUE` y `REFERENCES` | `src/db/esquema.sql` | DDL, restricciones | Se ejecuta en el Query Tool sin errores |
| 8 | Crear el pool de conexiones leyendo `DATABASE_URL` y fijando la zona horaria | `src/db/conexion.js` | Pool de conexiones | Se importa sin errores |
| 9 | Script que ejecuta el esquema y carga configuración, puntos de encuentro y moderador | `src/db/init.js` | Datos semilla, `ON CONFLICT` | `npm run db:init` → "Base de datos lista" |

### Fase 3. Servidor

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 10 | Servidor mínimo: `express.json()`, `express.static('public')`, `cors` y `GET /api/salud` | `server.js` | Middleware, ruta | http://localhost:3000/api/salud → `{ ok: true }` |
| 11 | Middleware de errores al final (409 por `23505`, 400 por JSON inválido, 500 genérico) | `server.js` | Manejo centralizado de errores | Enviar JSON mal escrito → 400 |

### Fase 4. Usuarios y seguridad (Base)

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 12 | Consultas de usuario (`buscarPorMatricula`, `buscarPorId`, `crear`) y de configuración (`leer`, `guardar`) | `src/models/usuario.model.js`, `src/models/config.model.js` | Consultas parametrizadas | — |
| 13 | `registro` (RN-01, RN-02, RN-03) y `login` que firma el JWT | `src/controllers/auth.controller.js` | bcrypt, JWT | — |
| 14 | `verificarToken` y `soloRol(...roles)` | `src/middlewares/auth.js` | Autenticación vs. autorización | — |
| 15 | Rutas de auth y montarlas en `/api/auth`; agregar `GET /yo` protegido | `src/routes/auth.routes.js`, `server.js` | Router | Thunder Client: registro 201, login devuelve token, `/yo` sin token → 401 |
| 16 | Contactos de confianza: modelo, controlador (máx. 2) y rutas | `contacto.model.js`, `contactos.controller.js`, `contactos.routes.js` | CRUD, propiedad del recurso | Un tercer contacto → 409 |
| 17 | Documentar los endpoints y montar Swagger en `/api-docs` | `docs/openapi.yaml`, `server.js` | OpenAPI | `/api-docs` abre y prueba el login |

### Fase 5. Vista base

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 18 | Estilos *mobile first* | `public/css/estilos.css` | Responsive, variables CSS | Se ve bien en modo celular de DevTools |
| 19 | Dirección de la API, sesión en `localStorage` y función única `api()` con el token | `public/js/config.js`, `sesion.js`, `api.js` | `fetch`, módulos ES | — |
| 20 | Login, registro y menú de inicio con "Hola, nombre" y cerrar sesión | `index.html`, `registro.html`, `inicio.html` | Formularios, eventos, `FormData` | Registro → inicio sin volver a escribir datos |
| 21 | Perfil con datos del usuario y contactos | `perfil.html`, `public/js/perfil.js` | DOM seguro con `textContent` | Agregar y eliminar contactos |

### Fase 6. Módulo 1: Reportes y mapa

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 22 | Modelo de reportes: crear, aprobados con filtros, pendientes, cambiar estado | `src/models/reporte.model.js` | Filtros con parámetros (anti inyección SQL) | — |
| 23 | Controlador (RN-04 a RN-07) y rutas con `soloRol('moderador')` | `reportes.controller.js`, `reportes.routes.js` | Reglas de negocio, privacidad | Alumno en `/pendientes` → 403 |
| 24 | Formulario con ubicación por GPS o tocando el mapa | `reportar.html`, `public/js/reportar.js` | Leaflet, Geolocation API | El reporte queda `pendiente` |
| 25 | Mapa con zonas aprobadas y filtros por tipo y horario | `mapa.html`, `public/js/mapa.js` | Capas, círculos de 100 m | Aparece tras aprobar |
| 26 | Panel del moderador: sección de reportes pendientes | `moderador.html`, `public/js/moderador.js` | Roles en la vista | Aprobar/Rechazar los quita de la lista |

### Fase 7. Módulo 2: Botón de alerta

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 27 | Leer y cambiar el teléfono de la policía (RN-09) | `config.controller.js`, `config.routes.js` | Configuración en BD | Alumno con `PUT` → 403 |
| 28 | Modelo, controlador y rutas de alertas (crear, de hoy, atender) | `alerta.model.js`, `alertas.controller.js`, `alertas.routes.js` | `JOIN`, fechas | `POST /api/alertas` → 201 |
| 29 | Botón "mantener 2 s" con barra de progreso, ubicación y `tel:`; aviso por WhatsApp | `public/js/alerta.js`, `inicio.html` | Temporizadores, eventos de puntero | Soltar antes de 2 s cancela |
| 30 | Panel del moderador: alertas en mapa, atender y cambiar teléfono | `moderador.html`, `public/js/moderador.js` | Refresco periódico | La alerta aparece y se marca atendida |

### Fase 8. Módulo 3: Caminemos juntos

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 31 | Modelo de grupos: puntos, grupos de hoy con integrantes, crear y unirse con **transacción** | `src/models/grupo.model.js` | `BEGIN/COMMIT/ROLLBACK`, `FOR UPDATE` | — |
| 32 | Controlador (RN-10 a RN-14) y rutas, incluido `/api/puntos` | `grupos.controller.js`, `grupos.routes.js`, `server.js` | Validación de enteros | Unirse a un grupo lleno → 409 |
| 33 | Pantalla para listar, crear, unirse y salir | `grupos.html`, `public/js/grupos.js` | Render condicional | El contador `n/cupo` se actualiza |

### Fase 9. Despliegue

| Paso | Qué hacer | Archivos | Concepto clave | Cómo comprobarlo |
| --- | --- | --- | --- | --- |
| 34 | Subir el repositorio a GitHub | — | Control de versiones | El repo no contiene `.env` |
| 35 | API y PostgreSQL en Railway; variables de entorno; `npm run db:init` | Variables en Railway | PaaS, variables en producción | `https://<api>.up.railway.app/api/salud` responde |
| 36 | Poner la URL de Railway en `config.js` y publicar `public/` en Vercel | `public/js/config.js` | Frontend y backend separados | La app abre en un celular |
| 37 | Copiar la URL de Vercel a `FRONTEND_URL` en Railway | Variables en Railway | CORS | Sin errores de CORS en DevTools |

---

## Seguridad: puntos para revisar en clase

- **Contraseñas:** se guardan con `bcrypt`. Ni el docente puede leerlas desde pgAdmin.
- **Inyección SQL:** todas las consultas usan parámetros (`$1`). Nunca se pega texto del usuario en el SQL.
- **XSS:** la vista pinta los datos del usuario con `textContent` y nunca con `innerHTML`.
- **Autorización en el servidor:** ocultar un botón no protege nada. `soloRol('moderador')` sí.
- **Privacidad:** coordenadas redondeadas, reportes anónimos y grupos sin teléfonos.
