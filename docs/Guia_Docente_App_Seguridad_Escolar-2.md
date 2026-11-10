# Guía docente — App de Seguridad Escolar (MVP)

**Proyecto:** aplicación web responsiva para enfrentar la inseguridad alrededor del plantel en horarios de entrada y salida.
**Duración:** 7 semanas · 7 sesiones por semana · 50 minutos por sesión · 49 sesiones.
**Modalidad:** desarrollo guiado. El docente programa en vivo, paso a paso; cada equipo replica el código en su propio repositorio y escribe toda la documentación.
**Documento para alumnos:** `Proyecto_App_Seguridad_Escolar_Alumnos.docx` (se entrega en la sesión 1).
**Versión 2 (octubre 2026):** la base de datos pasa de SQLite a **PostgreSQL** (paquete `pg`, administrada con **pgAdmin 4**) y la etapa final es el **despliegue**: backend y base de datos en **Railway**, frontend en **Vercel** (sección 14).

---

## Índice

1. [Enfoque y cambios respecto al plan anterior](#1-enfoque-y-cambios-respecto-al-plan-anterior)
2. [Dinámica de cada sesión](#2-dinámica-de-cada-sesión)
3. [Alcance del MVP](#3-alcance-del-mvp)
4. [Stack y estructura del proyecto](#4-stack-y-estructura-del-proyecto)
5. [Arquitectura](#5-arquitectura)
6. [Modelo de datos (diagrama ER y SQL)](#6-modelo-de-datos)
7. [Reglas de negocio](#7-reglas-de-negocio)
8. [Diagramas de flujo de los módulos](#8-diagramas-de-flujo-de-los-módulos)
9. [Diagramas de secuencia: MVC, JWT y middleware](#9-diagramas-de-secuencia)
10. [API REST y Swagger](#10-api-rest-y-swagger)
11. [Plan sesión por sesión](#11-plan-sesión-por-sesión)
12. [Banco de conceptos para explicar](#12-banco-de-conceptos-para-explicar)
13. [Código de referencia](#13-código-de-referencia)
14. [Despliegue: Railway + Vercel](#14-despliegue-railway--vercel)
15. [Entregas y evaluación](#15-entregas-y-evaluación)
16. [Riesgos y lista de verificación del docente](#16-riesgos-y-lista-de-verificación-del-docente)

---

## 1. Enfoque y cambios respecto al plan anterior

Como el grupo no trae bases sólidas, el proyecto deja de ser "cada equipo construye solo" y pasa a ser **"construimos juntos, ustedes documentan"**. Cada concepto se ve primero en teoría y en la misma sesión se aplica en el proyecto.

| Antes | Ahora |
| --- | --- |
| Cada equipo programaba la app por su cuenta | El docente programa en vivo; los equipos replican en su repositorio |
| Se asumían bases de HTML, CSS y JS | Semana 2 completa de repaso de fundamentos, aplicado al proyecto |
| PostgreSQL / SQLite / MongoDB a elegir (y en la versión 1, solo SQLite) | Solo **PostgreSQL** con el paquete `pg`, administrado con **pgAdmin 4**: el mismo motor en el taller y en producción |
| `bcrypt` | `bcryptjs` (JavaScript puro, no falla al instalar en Windows) |
| Despliegue en un solo servicio (Render) | **Backend + base de datos en Railway** y **frontend en Vercel**: arquitectura real separada, con CORS |
| La funcionalidad pesaba 40% | La **documentación pesa 50%**; el código replicado y funcionando, 25% |
| Teoría implícita | Cada sesión declara los conceptos y cómo se explican |

**Por qué PostgreSQL y no SQLite (para explicarlo al grupo y para su justificación):** SQLite es un archivo que vive junto al código; en la nube ese archivo se pierde cada vez que el servidor se reinicia. PostgreSQL es un **servidor de base de datos**: corre aparte, guarda los datos de forma permanente y recibe conexiones de la app por la red. Es lo que se usa en la industria, y lo que aprendan en pgAdmin 4 en el taller es exactamente lo que verán en Railway.

**Idea clave para los alumnos:** "No se trata de que memoricen el código, sino de que entiendan por qué cada pieza existe y lo puedan explicar en su documentación."

---

## 2. Dinámica de cada sesión

Todas las sesiones de desarrollo siguen el mismo formato de 50 minutos:

| Momento | Minutos | Qué pasa |
| --- | --- | --- |
| Apertura | 5 | Pregunta detonadora o recordatorio de la sesión anterior |
| Teoría | 10–15 | Concepto con analogía, diagrama en pizarrón y un ejemplo mínimo |
| Práctica guiada | 25–30 | El docente programa en el proyecto proyectado; los equipos replican en su repo |
| Cierre | 5 | Cada equipo hace `git commit` y llena su **bitácora** (qué hicimos, qué concepto vimos, qué dudas quedan) |

**Roles rotativos dentro del equipo (cambian cada semana):**

| Rol | Qué hace en la sesión |
| --- | --- |
| Piloto | Escribe el código en la computadora del equipo |
| Copiloto | Lee en voz alta lo que proyecta el docente y detecta errores de dedo |
| Documentador | Toma notas y capturas para la documentación y la bitácora |
| Investigador | Busca en la documentación oficial (MDN, Express, Leaflet, PostgreSQL) lo que se pida |
| Integrador (equipos de 5) | Revisa que el código corra, hace commit y push |

**Reglas de la práctica guiada:**

- El docente avanza en **bloques pequeños** (5 a 10 líneas) y espera a que la mayoría de los equipos lo tenga funcionando.
- Al terminar cada bloque se prueba algo visible (consola, navegador, Swagger, pgAdmin).
- El docente sube su versión al final de cada sesión a un repositorio "de referencia" (rama por semana: `semana-3`, `semana-4`...) para que el equipo que se atrase pueda alcanzar al grupo.

---

## 3. Alcance del MVP

| Módulo | Qué hace | Terminado cuando |
| --- | --- | --- |
| Base: usuarios y roles | Registro con código de grupo, login con JWT, roles alumno y moderador, contactos de confianza | Un alumno se registra, inicia sesión y ve su pantalla de inicio |
| 1. Reportes y mapa de zonas | El alumno reporta un incidente; el moderador lo aprueba; aparece como zona aproximada en el mapa, con filtros | Un reporte hecho desde un celular aparece en el mapa tras aprobarse |
| 2. Botón de alerta | Mantener presionado 2 s → registra la alerta con ubicación y abre la llamada a la **policía municipal**; opción de avisar a un contacto por WhatsApp | El botón abre el marcador con el número correcto y la alerta aparece en el panel del moderador |
| 3. Caminemos juntos | Grupos de salida por ruta, con punto de encuentro predefinido, franja y cupo; caducan al terminar el día | Dos alumnos en celulares distintos crean un grupo y se unen |
| Despliegue | Frontend en Vercel, API y base de datos en Railway | La app abre desde un celular con una liga `https://...vercel.app` y guarda datos en PostgreSQL de Railway |

**Fuera del MVP** (van en "trabajo futuro" de la documentación): cuenta para padres, "Llegué bien", puntos seguros con comercios, padres vigía, tablero para la cuatrimoto, notificaciones push.

**Sobre el número de la policía:** la app llama al número directo de la policía municipal porque la comunidad reporta que responde en 15–20 minutos frente a más de una hora por el 911. Antes de la semana 6, dirección debe confirmar con la policía municipal el número directo de cabina y que atiende las 24 horas. El 911 queda como botón pequeño de respaldo. Una página web no puede marcar sola: el enlace `tel:` abre el marcador con el número listo y el alumno solo pulsa "llamar".

---

## 4. Stack y estructura del proyecto

| Capa | Tecnología | Por qué la elegimos (para la justificación de los alumnos) |
| --- | --- | --- |
| Frontend | HTML5, CSS3 (Flexbox, media queries), JavaScript con módulos ES | Lo que ya ven en clase; corre en cualquier celular sin instalar nada |
| Mapas | Leaflet + OpenStreetMap | Gratis, sin clave de API, documentación sencilla |
| Ubicación | Geolocation API del navegador | Viene en todos los navegadores modernos |
| Servidor | Node.js 22.9 o superior (recomendado 24 LTS) + Express 5 | JavaScript en frontend y backend: un solo lenguaje. Express 5 atrapa solo los errores de funciones `async` |
| Base de datos | **PostgreSQL** 16 o superior | Servidor de base de datos relacional, gratuito, estándar en la industria; los datos no se pierden al reiniciar la app |
| Conexión a la BD | Paquete **`pg`** (node-postgres) con un *pool* de conexiones | El cliente oficial de PostgreSQL para Node; consultas parametrizadas con `$1, $2...` |
| Administración de la BD | **pgAdmin 4** | Interfaz gráfica para ver tablas, ejecutar SQL (Query Tool), generar el diagrama ER y conectarse a la BD de Railway |
| Contraseñas | `bcryptjs` | Cifrado con hash y sal; JavaScript puro, se instala sin errores |
| Sesiones | `jsonwebtoken` (JWT) | Autenticación sin guardar sesiones en el servidor |
| Comunicación entre dominios | `cors` | Permite que el frontend de Vercel llame a la API de Railway (están en dominios distintos) |
| Documentación de la API | `swagger-ui-express` + `yaml` + archivo `openapi.yaml` | Estándar de la industria; permite probar la API desde el navegador |
| Variables de entorno | Bandera `--env-file-if-exists` de Node | No requiere paquete extra; en la nube las variables se capturan en el panel |
| Control de versiones | Git + GitHub | Trabajo en equipo e historial de cambios; Railway y Vercel despliegan desde GitHub |
| Despliegue del backend y la BD | **Railway** | Corre el servidor Node y un PostgreSQL administrado en el mismo proyecto, con HTTPS |
| Despliegue del frontend | **Vercel** | Publica la carpeta `public/` como sitio estático con HTTPS (requisito del GPS en el celular) |

**Instalación (sesión 15):**

```bash
mkdir seguridad-escolar && cd seguridad-escolar
npm init -y
npm install express pg cors bcryptjs jsonwebtoken swagger-ui-express yaml
```

`package.json` (agregar `"type": "module"` y los scripts):

```json
{
  "name": "seguridad-escolar",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch --env-file-if-exists=.env server.js",
    "start": "node server.js",
    "db:init": "node --env-file-if-exists=.env src/db/init.js"
  },
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "express": "^5.3.0",
    "jsonwebtoken": "^9.0.3",
    "pg": "^8.23.1",
    "swagger-ui-express": "^5.0.1",
    "yaml": "^2.9.1"
  }
}
```

- `--env-file-if-exists=.env` carga el `.env` cuando existe (en el taller) y no falla cuando no existe (en Railway, donde las variables vienen del panel).

`.gitignore`:

```text
node_modules/
.env
```

**Estructura de carpetas (arquitectura en capas / MVC):**

```text
seguridad-escolar/
├── server.js                  # Arranca Express: CORS, rutas, estáticos y Swagger
├── .env                       # DATABASE_URL, JWT_SECRETO... (NO se sube a GitHub)
├── .env.example               # Plantilla del .env SIN secretos (sí se sube)
├── .gitignore                 # node_modules, .env
├── docs/
│   └── openapi.yaml           # Documentación Swagger de la API
├── src/
│   ├── db/
│   │   ├── conexion.js        # Pool de conexiones a PostgreSQL
│   │   ├── esquema.sql        # CREATE TABLE ...
│   │   └── init.js            # Crea tablas y datos iniciales (seed)
│   ├── middlewares/
│   │   └── auth.js            # verificarToken, soloRol
│   ├── models/                # MODELO: solo consultas SQL
│   │   ├── usuario.model.js
│   │   ├── contacto.model.js
│   │   ├── reporte.model.js
│   │   ├── alerta.model.js
│   │   ├── grupo.model.js
│   │   └── config.model.js
│   ├── controllers/           # CONTROLADOR: reglas de negocio, req → res
│   │   ├── auth.controller.js
│   │   ├── contactos.controller.js
│   │   ├── reportes.controller.js
│   │   ├── alertas.controller.js
│   │   ├── grupos.controller.js
│   │   └── config.controller.js
│   └── routes/                # RUTAS: URL + método → middleware → controlador
│       ├── auth.routes.js
│       ├── contactos.routes.js
│       ├── reportes.routes.js
│       ├── alertas.routes.js
│       ├── grupos.routes.js
│       └── config.routes.js
└── public/                    # VISTA: lo que ve el alumno (en producción vive en Vercel)
    ├── index.html             # Login
    ├── registro.html
    ├── inicio.html            # Menú + botón de alerta
    ├── reportar.html
    ├── mapa.html
    ├── grupos.html
    ├── perfil.html            # Contactos de confianza
    ├── moderador.html
    ├── css/estilos.css
    └── js/
        ├── config.js          # Dirección de la API (local o Railway)
        ├── api.js             # fetch con token (un solo lugar)
        ├── sesion.js          # guardar/leer token, proteger páginas
        ├── alerta.js
        ├── mapa.js
        ├── reportar.js
        ├── grupos.js
        ├── perfil.js
        └── moderador.js
```

Se usan **páginas HTML separadas** (no una SPA) porque es más fácil de entender para el grupo: cada pantalla es un archivo y cada archivo tiene su script.

**Un repositorio, dos destinos.** Todo vive en un solo repositorio por equipo. En el taller, `npm run dev` levanta Express, que sirve la API **y** la carpeta `public/` en `http://localhost:3000`. En producción, Railway corre el servidor (API) y Vercel publica solo la carpeta `public/`.

---

## 5. Arquitectura

Arquitectura **cliente-servidor** con **API REST** y **arquitectura en capas** en el servidor. El celular nunca toca la base de datos: todo pasa por la API.

```mermaid
flowchart TB
  subgraph CEL["📱 Celular del alumno (navegador)"]
    direction LR
    P["Pantallas<br/>HTML + CSS<br/>mobile first"]
    J["Módulos JS<br/>config · api · sesion<br/>mapa · reportar · alerta · grupos"]
    L["Leaflet + GPS<br/>mapa y ubicación"]
  end
  subgraph VER["▲ Vercel"]
    ST["Archivos de public/<br/>HTML · CSS · JS"]
  end
  subgraph RW["🚆 Railway"]
    direction TB
    subgraph SRV["Servidor Node.js + Express"]
      direction TB
      CO["CORS<br/>solo el dominio de Vercel"]
      R["Rutas<br/>/api/auth · /api/reportes<br/>/api/alertas · /api/grupos"]
      M["Middleware<br/>verificarToken · soloRol"]
      C["Controladores<br/>reglas de negocio"]
      MO["Modelos<br/>consultas SQL con pg"]
      SW["Swagger UI<br/>/api-docs"]
      CO --> R --> M --> C --> MO
    end
    BD[("🐘 PostgreSQL<br/>usuarios · contactos · reportes<br/>alertas · grupos · grupo_integrantes<br/>puntos_encuentro · configuracion")]
    MO <-- "SQL por red privada<br/>DATABASE_URL" --> BD
  end
  subgraph EXT["Servicios fuera de la app"]
    direction TB
    OSM["OpenStreetMap<br/>mosaicos del mapa"]
    TEL["Marcador del teléfono<br/>tel: policía municipal"]
    WA["WhatsApp<br/>ubicación al contacto"]
  end
  PGA["🛠️ pgAdmin 4<br/>(computadora del equipo)"]
  P -- "1. HTTPS: descarga las páginas" --> ST
  J <-- "2. HTTPS · JSON · token JWT" --> CO
  L -.-> EXT
  PGA -. "conexión pública (TCP proxy)" .-> BD
```

**Cómo explicarlo:** "El celular es el cliente que pide. Primero va a Vercel por las páginas (como recoger el menú en la entrada). Luego le hace pedidos a la API en Railway: el mesero recibe el pedido, revisa que tengas reservación (middleware), se lo pasa al chef (controlador), que saca ingredientes de la alacena (modelo y PostgreSQL). pgAdmin es la puerta trasera del almacén: solo la usa el encargado para revisar el inventario."

**En el taller (desarrollo)** todo corre en la misma computadora: Express sirve las páginas y la API en `localhost:3000`, y PostgreSQL corre como servicio local que se administra con pgAdmin 4.

---

## 6. Modelo de datos

```mermaid
erDiagram
  USUARIOS ||--o{ CONTACTOS : "tiene"
  USUARIOS ||--o{ REPORTES : "crea"
  USUARIOS |o--o{ REPORTES : "modera"
  USUARIOS ||--o{ ALERTAS : "envía"
  USUARIOS ||--o{ GRUPOS : "crea"
  PUNTOS_ENCUENTRO ||--o{ GRUPOS : "es punto de"
  GRUPOS ||--o{ GRUPO_INTEGRANTES : "tiene"
  USUARIOS ||--o{ GRUPO_INTEGRANTES : "participa en"

  USUARIOS {
    serial id PK
    varchar nombre
    varchar matricula UK
    varchar grupo_escolar
    text password_hash
    varchar rol "alumno | moderador"
    boolean activo
    timestamptz creado_en
  }
  CONTACTOS {
    serial id PK
    int usuario_id FK
    varchar nombre
    varchar telefono
  }
  REPORTES {
    serial id PK
    int usuario_id FK
    varchar tipo "asalto, agresion, acoso, sospechoso, otro"
    text descripcion
    date fecha
    varchar franja "entrada | salida | otra"
    double lat
    double lng
    boolean anonimo
    varchar estado "pendiente | aprobado | rechazado"
    int moderado_por FK "nullable"
    timestamptz creado_en
  }
  ALERTAS {
    serial id PK
    int usuario_id FK
    double lat "nullable"
    double lng "nullable"
    boolean atendida
    timestamptz creada_en
  }
  PUNTOS_ENCUENTRO {
    serial id PK
    varchar nombre
    text descripcion
    double lat
    double lng
    boolean activo
  }
  GRUPOS {
    serial id PK
    int creador_id FK
    int punto_id FK
    varchar ruta
    date fecha
    varchar franja "entrada | salida"
    int cupo
    timestamptz creado_en
  }
  GRUPO_INTEGRANTES {
    int grupo_id PK, FK
    int usuario_id PK, FK
    timestamptz unido_en
  }
  CONFIGURACION {
    varchar clave PK
    text valor
  }
```

| Tabla               | Para qué sirve                                                        | Relaciones                                                             |
| ------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `usuarios`          | Alumnos y moderadores                                                 | Origen de casi todas las relaciones                                    |
| `contactos`         | 1 o 2 contactos de confianza por alumno                               | N contactos → 1 usuario                                                |
| `reportes`          | Incidentes reportados                                                 | N reportes → 1 usuario que crea; N → 1 moderador que revisa (opcional) |
| `alertas`           | Registro de cada vez que se presiona el botón                         | N alertas → 1 usuario                                                  |
| `puntos_encuentro`  | Lugares predefinidos por el moderador                                 | 1 punto → N grupos                                                     |
| `grupos`            | Grupos de salida del día                                              | N grupos → 1 creador, N → 1 punto                                      |
| `grupo_integrantes` | **Tabla intermedia** de la relación muchos a muchos usuarios ↔ grupos | Llave primaria compuesta (`grupo_id`, `usuario_id`)                    |
| `configuracion`     | Pares clave-valor: `telefono_policia`, `codigo_registro`              | Sin relaciones                                                         |

**Tipos de dato de PostgreSQL que se usan (para explicarlos en S18–S19):**

| Tipo | Para qué | Ejemplo en el proyecto |
| --- | --- | --- |
| `SERIAL` | Entero que se numera solo (1, 2, 3...) | Todos los `id` |
| `VARCHAR(n)` | Texto con límite de caracteres | `matricula VARCHAR(20)` |
| `TEXT` | Texto sin límite | `descripcion`, `password_hash` |
| `BOOLEAN` | Verdadero / falso (`TRUE` / `FALSE`) | `anonimo`, `activo`, `atendida` |
| `DOUBLE PRECISION` | Número con decimales (precisión suficiente para coordenadas) | `lat`, `lng` |
| `DATE` | Solo fecha | `reportes.fecha`, `grupos.fecha` |
| `TIMESTAMPTZ` | Fecha y hora con zona horaria | `creado_en` |

**`src/db/esquema.sql`:**

```sql
-- src/db/esquema.sql — tablas de la app (PostgreSQL)
-- IF NOT EXISTS: se puede ejecutar varias veces sin borrar nada

CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  matricula     VARCHAR(20)  NOT NULL UNIQUE,
  grupo_escolar VARCHAR(10)  NOT NULL,
  password_hash TEXT         NOT NULL,
  rol           VARCHAR(10)  NOT NULL DEFAULT 'alumno' CHECK (rol IN ('alumno','moderador')),
  activo        BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contactos (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre     VARCHAR(100) NOT NULL,
  telefono   VARCHAR(10)  NOT NULL
);

CREATE TABLE IF NOT EXISTS reportes (
  id           SERIAL PRIMARY KEY,
  usuario_id   INTEGER          NOT NULL REFERENCES usuarios(id),
  tipo         VARCHAR(20)      NOT NULL CHECK (tipo IN ('asalto','agresion','acoso','sospechoso','otro')),
  descripcion  TEXT             NOT NULL,
  fecha        DATE             NOT NULL,
  franja       VARCHAR(10)      NOT NULL CHECK (franja IN ('entrada','salida','otra')),
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  anonimo      BOOLEAN          NOT NULL DEFAULT FALSE,
  estado       VARCHAR(10)      NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aprobado','rechazado')),
  moderado_por INTEGER          REFERENCES usuarios(id),
  creado_en    TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS alertas (
  id         SERIAL PRIMARY KEY,
  usuario_id INTEGER          NOT NULL REFERENCES usuarios(id),
  lat        DOUBLE PRECISION,
  lng        DOUBLE PRECISION,
  atendida   BOOLEAN          NOT NULL DEFAULT FALSE,
  creada_en  TIMESTAMPTZ      NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS puntos_encuentro (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100)     NOT NULL,
  descripcion TEXT,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  activo      BOOLEAN          NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS grupos (
  id         SERIAL PRIMARY KEY,
  creador_id INTEGER      NOT NULL REFERENCES usuarios(id),
  punto_id   INTEGER      NOT NULL REFERENCES puntos_encuentro(id),
  ruta       VARCHAR(100) NOT NULL,
  fecha      DATE         NOT NULL DEFAULT CURRENT_DATE,
  franja     VARCHAR(10)  NOT NULL CHECK (franja IN ('entrada','salida')),
  cupo       INTEGER      NOT NULL CHECK (cupo BETWEEN 2 AND 10),
  creado_en  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grupo_integrantes (
  grupo_id   INTEGER     NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  usuario_id INTEGER     NOT NULL REFERENCES usuarios(id),
  unido_en   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (grupo_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS configuracion (
  clave VARCHAR(50) PRIMARY KEY,
  valor TEXT        NOT NULL
);
```

Diferencias con la versión SQLite que conviene señalar al grupo: ya no hace falta `PRAGMA foreign_keys` (PostgreSQL siempre revisa las llaves foráneas); `INTEGER PRIMARY KEY AUTOINCREMENT` se vuelve `SERIAL PRIMARY KEY`; los "1 o 0" se vuelven `BOOLEAN`; y las fechas tienen tipo propio (`DATE`, `TIMESTAMPTZ`) en vez de guardarse como texto.

---

## 7. Reglas de negocio

Las reglas de negocio viven en los **controladores**. Los alumnos deben listarlas en su documentación (capítulo 3) y señalar en qué archivo se aplican.

| # | Regla | Dónde se aplica | Respuesta si no se cumple |
| --- | --- | --- | --- |
| RN-01 | Solo se registra quien tenga el código de registro vigente del plantel | `auth.controller.js` | 403 |
| RN-02 | La matrícula es única | `auth.controller.js` + `UNIQUE` en BD | 409 |
| RN-03 | La contraseña tiene mínimo 8 caracteres y se guarda solo cifrada | `auth.controller.js` | 400 |
| RN-04 | Todo reporte nace como `pendiente`; solo un moderador lo aprueba o rechaza | `reportes.controller.js` + `soloRol` | 403 |
| RN-05 | El mapa público solo muestra reportes `aprobados` | `reporte.model.js` | — |
| RN-06 | Las coordenadas públicas se redondean a 3 decimales (≈ 100 m) para no revelar el punto exacto | `reportes.controller.js` | — |
| RN-07 | En un reporte anónimo nunca se devuelve el nombre del autor, ni al público ni al moderador | `reportes.controller.js` | — |
| RN-08 | La alerta se confirma manteniendo el botón 2 segundos | `public/js/alerta.js` | Se cancela |
| RN-09 | El número de la policía se lee de `configuracion` y solo el moderador lo cambia | `config.controller.js` | 403 |
| RN-10 | Un grupo tiene cupo de 2 a 10; nadie se une si está lleno | `grupos.controller.js` + `CHECK` + transacción en `grupo.model.js` | 409 |
| RN-11 | Un alumno no puede estar dos veces en el mismo grupo | Llave primaria compuesta | 409 |
| RN-12 | Solo se listan grupos con fecha de hoy (caducan al día siguiente) | `grupo.model.js` (`CURRENT_DATE` con hora de Monterrey) | — |
| RN-13 | El punto de encuentro se elige de la lista del moderador; nunca un domicilio | `grupos.controller.js` | 400 |
| RN-14 | Los integrantes de un grupo se muestran solo con nombre y grupo escolar; nunca teléfono | `grupo.model.js` | — |

---

## 8. Diagramas de flujo de los módulos

Estos diagramas son **para el docente**. En la sesión 6 se explica la simbología y los alumnos dibujan los suyos en draw.io o Mermaid; luego se comparan con estos.

### 8.1 Registro de usuario

```mermaid
flowchart TD
  I([Inicio]) --> F[/Alumno llena nombre, matrícula,<br/>grupo, contraseña y código de registro/]
  F --> V1{¿Campos completos y<br/>contraseña ≥ 8 caracteres?}
  V1 -- No --> E1[Mostrar error 400] --> F
  V1 -- Sí --> V2{¿Código de registro<br/>correcto?}
  V2 -- No --> E2[Error 403:<br/>código inválido] --> F
  V2 -- Sí --> V3{¿La matrícula<br/>ya existe?}
  V3 -- Sí --> E3[Error 409:<br/>matrícula registrada] --> F
  V3 -- No --> H[Cifrar contraseña con bcrypt]
  H --> G[(INSERT en usuarios<br/>rol = alumno)]
  G --> OK[201: Cuenta creada] --> L[Ir a iniciar sesión] --> FIN([Fin])
```

### 8.2 Módulo 1 — Reportar un incidente

```mermaid
flowchart TD
  I([Inicio]) --> S{¿Tiene sesión<br/>iniciada?}
  S -- No --> LOG[Ir a login] --> FIN([Fin])
  S -- Sí --> F[/Elige tipo, descripción,<br/>fecha y franja horaria/]
  F --> U{¿Cómo marca<br/>la ubicación?}
  U -- GPS --> G[navigator.geolocation<br/>obtiene lat y lng]
  U -- Mapa --> M[Toca el mapa y se<br/>coloca un marcador]
  G --> A[/¿Reporte anónimo? sí / no/]
  M --> A
  A --> E[POST /api/reportes]
  E --> V{¿Datos válidos?}
  V -- No --> ERR[400: mostrar qué falta] --> F
  V -- Sí --> DB[(INSERT reporte<br/>estado = pendiente)]
  DB --> OK[Mensaje: tu reporte será<br/>revisado por un moderador] --> FIN
```

### 8.3 Módulo 1 — Moderación

```mermaid
flowchart TD
  I([Moderador entra al panel]) --> L[GET /api/reportes/pendientes]
  L --> H{¿Hay reportes<br/>pendientes?}
  H -- No --> N[Mostrar: no hay pendientes] --> FIN([Fin])
  H -- Sí --> R[Lee el reporte]
  R --> D{¿Es real y<br/>respetuoso?}
  D -- Sí --> AP[PATCH estado = aprobado]
  D -- No --> RE[PATCH estado = rechazado]
  AP --> MAP[Aparece en el mapa público<br/>como zona aproximada]
  RE --> NO[No se publica]
  MAP --> H
  NO --> H
```

### 8.4 Módulo 2 — Botón de alerta

```mermaid
flowchart TD
  I([Alumno en peligro]) --> B[Mantiene presionado<br/>el botón de alerta]
  B --> T{¿Lo sostuvo<br/>2 segundos?}
  T -- No --> C[Se cancela:<br/>evita llamadas accidentales] --> FIN([Fin])
  T -- Sí --> P[Pide ubicación al GPS]
  P --> G{¿Dio permiso?}
  G -- Sí --> E1[POST /api/alertas con lat y lng]
  G -- No --> E2[POST /api/alertas sin ubicación]
  E1 --> TEL[Abre tel: número de la<br/>policía municipal]
  E2 --> TEL
  TEL --> LL[El alumno pulsa llamar]
  LL --> W{¿Quiere avisar a<br/>su contacto?}
  W -- Sí --> WA[Abre WhatsApp con mensaje<br/>y liga de Google Maps] --> PM
  W -- No --> PM[La alerta aparece en el<br/>panel del moderador] --> FIN
```

### 8.5 Módulo 3 — Caminemos juntos

```mermaid
flowchart TD
  I([Alumno abre Caminemos juntos]) --> L[GET /api/grupos<br/>solo grupos de hoy]
  L --> Q{¿Hay un grupo<br/>de su ruta?}
  Q -- No --> CR[/Crea grupo: ruta, punto de encuentro,<br/>franja y cupo/] --> PC[POST /api/grupos] --> AUTO[Queda como primer integrante] --> FIN([Fin])
  Q -- Sí --> U[POST /api/grupos/:id/unirse]
  U --> Y{¿Ya está<br/>en el grupo?}
  Y -- Sí --> E1[409: ya eres integrante] --> FIN
  Y -- No --> C{¿Hay cupo?}
  C -- No --> E2[409: grupo lleno] --> L
  C -- Sí --> OK[(INSERT en grupo_integrantes)] --> MSG[Ve punto y hora de encuentro] --> FIN
```

---

## 9. Diagramas de secuencia

### 9.1 Recorrido de una petición por las capas MVC

```mermaid
flowchart LR
  V["VISTA<br/>(public/)<br/>HTML + JS en el celular"] -- "1. fetch POST /api/reportes" --> RT["RUTA<br/>reportes.routes.js"]
  RT -- "2. pasa por" --> MW["MIDDLEWARE<br/>verificarToken"]
  MW -- "3. next()" --> CT["CONTROLADOR<br/>reportes.controller.js<br/>valida y aplica reglas"]
  CT -- "4. await" --> MD["MODELO<br/>reporte.model.js<br/>INSERT INTO reportes"]
  MD -- "5. pool.query(sql, [$1...])" --> DB[("PostgreSQL")]
  DB -- "6. fila creada (RETURNING)" --> MD
  MD -- "7. objeto" --> CT
  CT -- "8. res.status(201).json(...)" --> V
```

### 9.2 Inicio de sesión con JWT

```mermaid
sequenceDiagram
  autonumber
  actor A as Alumno
  participant F as Frontend (index.html)
  participant S as API Express
  participant D as PostgreSQL
  A->>F: Escribe matrícula y contraseña
  F->>S: POST /api/auth/login {matricula, password}
  S->>D: SELECT * FROM usuarios WHERE matricula = $1
  D-->>S: usuario con password_hash
  S->>S: bcrypt.compare(password, password_hash)
  alt contraseña correcta
    S->>S: jwt.sign({id, rol}, SECRETO, {expiresIn: '8h'})
    S-->>F: 200 {token, usuario}
    F->>F: localStorage.setItem('token', token)
    F-->>A: Redirige a inicio.html
  else contraseña incorrecta
    S-->>F: 401 {error: 'Matrícula o contraseña incorrectas'}
    F-->>A: Muestra mensaje de error
  end
```

### 9.3 Petición protegida: cadena de middlewares

```mermaid
sequenceDiagram
  autonumber
  participant F as Frontend
  participant VT as verificarToken
  participant SR as soloRol('moderador')
  participant C as Controlador
  F->>VT: PATCH /api/reportes/7<br/>Authorization: Bearer eyJ...
  alt sin token o token inválido
    VT-->>F: 401 No autenticado
  else token válido
    VT->>VT: req.usuario = {id, rol}
    VT->>SR: next()
    alt rol no es moderador
      SR-->>F: 403 Sin permiso
    else rol correcto
      SR->>C: next()
      C-->>F: 200 Reporte aprobado
    end
  end
```

### 9.4 Petición desde Vercel a Railway (CORS)

```mermaid
sequenceDiagram
  autonumber
  participant N as Navegador (página en equipo1.vercel.app)
  participant S as API en Railway
  N->>S: OPTIONS /api/reportes (pregunta previa)<br/>Origin: https://equipo1.vercel.app
  alt el origen está en FRONTEND_URL
    S-->>N: 204 Access-Control-Allow-Origin: https://equipo1.vercel.app
    N->>S: POST /api/reportes + Authorization: Bearer ...
    S-->>N: 201 {id, estado}
  else origen desconocido
    S-->>N: respuesta SIN permiso
    N-->>N: el navegador bloquea: "blocked by CORS policy"
  end
```

**Cómo explicarlo:** "El navegador es un guardia: si una página de Vercel quiere hablar con un servidor de otro dominio, primero le pregunta al servidor '¿dejas pasar a gente de Vercel?'. Si el servidor no lo tiene en su lista, el guardia no deja salir la petición."

---

## 10. API REST y Swagger

| Método | Ruta | Rol | Qué hace | Respuestas |
| --- | --- | --- | --- | --- |
| GET | `/api/salud` | Público | Confirma que el servidor y la base de datos responden | 200, 500 |
| POST | `/api/auth/registro` | Público | Crea cuenta de alumno | 201, 400, 403, 409 |
| POST | `/api/auth/login` | Público | Devuelve token y datos del usuario | 200, 400, 401 |
| GET | `/api/auth/yo` | Alumno | Datos del usuario del token | 200, 401 |
| GET | `/api/contactos` | Alumno | Sus contactos de confianza | 200, 401 |
| POST | `/api/contactos` | Alumno | Agrega contacto (máximo 2) | 201, 400, 401, 409 |
| DELETE | `/api/contactos/:id` | Alumno | Borra un contacto suyo | 204, 401, 404 |
| POST | `/api/reportes` | Alumno | Crea reporte pendiente | 201, 400, 401 |
| GET | `/api/reportes?tipo=&franja=` | Alumno | Reportes aprobados (coordenadas redondeadas) | 200, 401 |
| GET | `/api/reportes/pendientes` | Moderador | Reportes por revisar | 200, 401, 403 |
| PATCH | `/api/reportes/:id` | Moderador | `{ "estado": "aprobado" }` o `"rechazado"` | 200, 400, 401, 403, 404 |
| POST | `/api/alertas` | Alumno | Registra alerta con `lat`/`lng` opcionales | 201, 401 |
| GET | `/api/alertas` | Moderador | Alertas del día | 200, 401, 403 |
| PATCH | `/api/alertas/:id` | Moderador | Marca como atendida | 200, 401, 403, 404 |
| GET | `/api/config/policia` | Alumno | Número de la policía municipal | 200, 401 |
| PUT | `/api/config/policia` | Moderador | Cambia el número | 200, 400, 401, 403 |
| GET | `/api/puntos` | Alumno | Puntos de encuentro activos | 200, 401 |
| GET | `/api/grupos` | Alumno | Grupos de hoy con integrantes y cupo | 200, 401 |
| POST | `/api/grupos` | Alumno | Crea grupo; el creador queda como integrante | 201, 400, 401 |
| POST | `/api/grupos/:id/unirse` | Alumno | Se une si hay cupo | 201, 401, 404, 409 |
| DELETE | `/api/grupos/:id/unirse` | Alumno | Sale del grupo | 204, 401, 404 |

**Códigos de estado que se explican (sesión 17 y 27):**

| Código | Significado | Ejemplo en el proyecto |
| --- | --- | --- |
| 200 OK | Todo bien | Lista de grupos |
| 201 Created | Se creó algo | Reporte creado |
| 204 No Content | Se hizo, sin nada que devolver | Salir de un grupo |
| 400 Bad Request | Faltan datos o son inválidos | Reporte sin ubicación |
| 401 Unauthorized | No hay sesión o el token no sirve | Token vencido |
| 403 Forbidden | Hay sesión pero no permiso | Alumno intenta aprobar un reporte |
| 404 Not Found | No existe | Grupo con id inexistente |
| 409 Conflict | Choca con el estado actual | Grupo lleno, matrícula repetida |
| 500 Internal Server Error | Falla del servidor | La base de datos no responde (`DATABASE_URL` mal escrita) |

**Swagger.** El archivo `docs/openapi.yaml` se escribe por partes conforme se crean los endpoints, y se publica en `/api-docs`. En cada demo se verifica que Swagger coincida con la API real. Como `servers` usa la ruta relativa `/api`, el mismo archivo funciona en `http://localhost:3000/api-docs` y en `https://SU-API.up.railway.app/api-docs` sin cambiar nada. Fragmento inicial (sesión 26):

```yaml
openapi: 3.0.3
info:
  title: API App de Seguridad Escolar
  version: 1.0.0
  description: API del proyecto de seguridad alrededor del plantel.
servers:
  - url: /api
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  schemas:
    Error:
      type: object
      properties:
        error: { type: string, example: Matrícula o contraseña incorrectas }
paths:
  /auth/login:
    post:
      tags: [Autenticación]
      summary: Inicia sesión y devuelve un token JWT
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [matricula, password]
              properties:
                matricula: { type: string, example: "24316001" }
                password:  { type: string, example: "secreto123" }
      responses:
        '200':
          description: Sesión iniciada
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:   { type: string }
                  usuario: { type: object }
        '401':
          description: Matrícula o contraseña incorrectas
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Error' }
  /reportes:
    post:
      tags: [Reportes]
      summary: Crea un reporte (queda pendiente)
      security: [{ bearerAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [tipo, descripcion, fecha, franja, lat, lng]
              properties:
                tipo:        { type: string, enum: [asalto, agresion, acoso, sospechoso, otro] }
                descripcion: { type: string }
                fecha:       { type: string, format: date, example: "2026-11-03" }
                franja:      { type: string, enum: [entrada, salida, otra] }
                lat:         { type: number, example: 25.7969 }
                lng:         { type: number, example: -100.3134 }
                anonimo:     { type: boolean, default: false }
      responses:
        '201': { description: Reporte creado como pendiente }
        '400': { description: Datos incompletos o inválidos }
        '401': { description: Sin sesión }
```

---

## 11. Plan sesión por sesión

Cada sesión indica: **Conceptos** (lo que se explica en teoría, ver el banco de conceptos en la sección 12), **Práctica guiada** (lo que el docente programa o hace con el grupo), **Documentación** (lo que el equipo escribe) y **Producto** (lo que se revisa al cierre).

### Vista general

| Semana | Tema | Sesiones | Cierra con |
| --- | --- | --- | --- |
| 1 | El problema y la investigación | 1–7 | Entrega 1: capítulos 1 y 2 |
| 2 | Herramientas y fundamentos web aplicados al proyecto | 8–14 | Entrega 2: capítulo 3 + wireframes |
| 3 | Servidor, API y base de datos PostgreSQL | 15–21 | Entrega 3: capítulo 4 (arquitectura, ER, stack) |
| 4 | Usuarios, seguridad y Swagger | 22–28 | Demo 1: registro y login + Swagger |
| 5 | Módulo 1: reportes y mapa | 29–35 | Demo 2: módulo 1 |
| 6 | Módulos 2 y 3: alerta y Caminemos juntos | 36–42 | Demo 3: MVP completo + cuentas de Railway y Vercel |
| 7 | Despliegue (Railway + Vercel), pruebas y presentación | 43–49 | App publicada, documento final y presentación |

---

### Semana 1 — El problema y la investigación

#### S1. Presentación del proyecto

- **Conceptos:** problema social, proyecto comunitario (NEM), MVP, documentación técnica.
- **Práctica guiada:** se lee en grupo la sección 1 del documento para alumnos; lluvia de ideas: "¿qué ha pasado alrededor de la escuela?". Formación de equipos (4–5) y asignación de roles de la semana.
- **Documentación:** portada provisional y bitácora 1.
- **Producto:** equipos y roles registrados.

#### S2. Cómo investigar un problema

- **Conceptos:** investigación de campo, encuesta, entrevista, preguntas cerradas vs. abiertas, muestra, consentimiento y anonimato.
- **Práctica guiada:** el grupo diseña UNA encuesta común en Google Forms (cada equipo propone 3 preguntas y se votan). Debe preguntar: lugares, horarios, tipo de incidente, si caminan solos, qué les ayudaría. Sin nombres.
- **Documentación:** borrador de "Metodología".
- **Producto:** encuesta publicada. **Tarea:** cada equipo consigue mínimo 15 respuestas de otros grupos.
- **Nota:** pedir a dirección permiso para aplicar la encuesta; no preguntar detalles íntimos de agresiones.

#### S3. Cómo funciona la web

- **Conceptos:** cliente-servidor, URL, HTTP, petición y respuesta, métodos GET y POST, códigos de estado, HTTPS.
- **Práctica guiada:** abrir las DevTools (F12) → pestaña *Red/Network* en cualquier página; identificar peticiones, métodos y códigos. Dibujar en el pizarrón el diagrama celular → servidor → base de datos. Adelantar que al final del proyecto el celular hablará con **dos** servidores: Vercel (páginas) y Railway (API y datos).
- **Documentación:** glosario personal (cliente, servidor, HTTP, URL).
- **Producto:** captura de la pestaña Network con 3 peticiones explicadas.

#### S4. Análisis de resultados

- **Conceptos:** tabulación, gráficas (barras para categorías, pastel solo para partes de un todo), interpretación vs. opinión.
- **Práctica guiada:** exportar respuestas a hoja de cálculo; cada equipo hace 3 gráficas. En un croquis de la zona (captura de Google Maps u OpenStreetMap) marcan los lugares más mencionados.
- **Documentación:** "Resultados de la investigación" con gráficas y croquis.
- **Producto:** 3 gráficas + croquis.

#### S5. Requerimientos e historias de usuario

- **Conceptos:** requerimiento funcional vs. no funcional, actor/rol, historia de usuario ("Como … quiero … para …"), criterio de aceptación.
- **Práctica guiada:** el docente modela 2 historias por módulo; los equipos escriben el resto. Requerimientos no funcionales: responsivo, HTTPS, privacidad, tiempo de respuesta, disponibilidad en internet (desplegada).
- **Documentación:** borrador del capítulo 3.2 y 3.3.
- **Producto:** lista de requerimientos e historias.

#### S6. Reglas de negocio y diagramas de flujo

- **Conceptos:** regla de negocio, diagrama de flujo, simbología (inicio/fin, proceso, decisión, entrada/salida, base de datos).
- **Práctica guiada:** el docente dibuja en vivo el flujo de **registro** (sección 8.1). Cada equipo dibuja el de **reportar incidente** en draw.io; se comparan contra el del docente.
- **Documentación:** reglas de negocio y 1 diagrama de flujo.
- **Producto:** diagrama de flujo del módulo 1.

#### S7. Entrega 1 y redacción

- **Conceptos:** introducción, justificación, objetivos SMART; formato APA para citas.
- **Práctica guiada:** el docente muestra un ejemplo de justificación bien escrita (usa datos propios de la encuesta) y uno mal escrito (genérico). Tiempo de redacción con asesoría por equipo.
- **Documentación:** capítulos 1 y 2 completos.
- **Producto:** **Entrega 1.**

---

### Semana 2 — Herramientas y fundamentos web aplicados al proyecto

#### S8. Git y GitHub

- **Conceptos:** control de versiones, repositorio, commit, rama, push, pull, `.gitignore`.
- **Práctica guiada:** instalar/configurar Git (`git config --global user.name/user.email`); cada equipo crea su repo `seguridad-escolar-equipoN` en GitHub, agrega a los integrantes y al docente; primer commit con un `README.md`. Explicar que este mismo repo será el que Railway y Vercel publiquen en la semana 7.
- **Documentación:** liga del repo en el anexo; bitácora.
- **Producto:** repo con un commit de cada integrante.

#### S9. HTML semántico y formularios

- **Conceptos:** estructura de un documento, etiquetas semánticas (`header`, `main`, `nav`, `section`), formularios (`form`, `label`, `input`, `select`, `button`), atributos `required`, `type`, `minlength`.
- **Práctica guiada:** crear `public/index.html` (login) y `public/registro.html` con sus formularios.
- **Documentación:** captura de las pantallas.
- **Producto:** 2 páginas HTML.

#### S10. CSS responsivo (mobile first)

- **Conceptos:** modelo de caja, Flexbox, unidades (`rem`, `%`, `vh`), `meta viewport`, media queries, mobile first, tamaño mínimo de botones táctiles (≈ 48 px).
- **Práctica guiada:** `public/css/estilos.css` con variables de color, formularios a ancho completo en celular y centrados en escritorio; probar con el modo dispositivo de DevTools.
- **Documentación:** requerimiento no funcional "responsivo" con evidencia.
- **Producto:** login y registro responsivos.

#### S11. Wireframes y navegación

- **Conceptos:** wireframe, flujo de navegación, jerarquía visual, accesibilidad básica (contraste, textos claros).
- **Práctica guiada:** el docente bosqueja en papel `inicio.html` (menú + botón de alerta grande); los equipos dibujan los wireframes de las 8 pantallas en papel o Excalidraw.
- **Documentación:** wireframes en el capítulo 4.6.
- **Producto:** 8 wireframes.

#### S12. JavaScript esencial

- **Conceptos:** variables (`const`, `let`), tipos de dato, funciones (incluidas flecha), objetos, arreglos, métodos `map`/`filter`/`find`, JSON (`JSON.stringify`, `JSON.parse`).
- **Práctica guiada:** en la consola del navegador, modelar un reporte como objeto y una lista de reportes como arreglo; filtrar por tipo. Este código se reutiliza después en el mapa.
- **Documentación:** glosario.
- **Producto:** archivo `practica-js.js` en el repo.

#### S13. DOM, eventos y asincronía

- **Conceptos:** DOM, `querySelector`, eventos (`addEventListener`, `submit`, `preventDefault`), **patrón Observer** (el botón "avisa" a quien lo escucha), promesas, `async/await`, `fetch`.
- **Práctica guiada:** validar el formulario de registro en el cliente (contraseña ≥ 8) y mostrar errores en pantalla. Hacer un `fetch` a una API pública (por ejemplo `https://jsonplaceholder.typicode.com/users`) y pintar los resultados.
- **Documentación:** explicar el patrón Observer con el ejemplo del formulario.
- **Producto:** validación funcionando.
- **Nota:** insistir en `async/await`: en la semana 3 **todo el acceso a PostgreSQL es asíncrono** (la base de datos responde por la red), así que este tema se vuelve a usar en cada modelo y controlador.

#### S14. Entrega 2

- **Conceptos:** repaso con preguntas rápidas (quiz) de semanas 1 y 2.
- **Práctica guiada:** revisión por equipo; corrección de capítulos 1 y 2 según retroalimentación.
- **Documentación:** capítulo 3 completo + wireframes.
- **Producto:** **Entrega 2.**

---

### Semana 3 — Servidor, API y base de datos PostgreSQL

#### S15. Node.js, npm y PostgreSQL instalado

- **Conceptos:** qué es Node.js (JavaScript fuera del navegador), npm, `package.json`, dependencias, `node_modules`, módulos ES (`import`/`export`), variables de entorno, **servidor de base de datos** (PostgreSQL corre aparte, como un servicio).
- **Práctica guiada:** `npm init -y`, instalar dependencias (sección 4, incluye `pg` y `cors`), `"type": "module"`, `.gitignore` con `node_modules` y `.env`. Abrir **pgAdmin 4**, conectarse al servidor local (contraseña del usuario `postgres` que se definió al instalar) y comprobar que responde. Crear el `.env` a partir de `.env.example` (sección 13) con `DATABASE_URL`.
- **Documentación:** stack (capítulo 4.2) — qué es cada dependencia y para qué se usa; por qué PostgreSQL.
- **Producto:** proyecto Node inicializado y pgAdmin conectado al servidor local.
- **Nota:** PostgreSQL y pgAdmin 4 deben quedar instalados por el docente o el responsable del taller en la semana 0 (sección 16). Si en una máquina no se puede, ese equipo usa la computadora de otro integrante o una base de datos de Railway (sección 14.6).

#### S16. Express: el servidor

- **Conceptos:** servidor web, puerto, `app.listen`, middleware `express.json()`, `express.static()` para servir la carpeta `public`.
- **Práctica guiada:** escribir la primera versión de `server.js` (sin CORS ni rutas todavía; versión final en la sección 13.1) y abrir `http://localhost:3000` para ver el login servido por Express.
- **Documentación:** bitácora.
- **Producto:** servidor corriendo con `npm run dev`.

#### S17. API REST

- **Conceptos:** recurso, endpoint, verbos (GET, POST, PUT, PATCH, DELETE), JSON como formato de intercambio, códigos de estado, parámetros de ruta (`:id`) y de consulta (`?tipo=`).
- **Práctica guiada:** crear `GET /api/salud` que responda `{ ok: true, hora }` (primero con la hora de Node; en S19 se cambia para que pregunte la hora a PostgreSQL); probarlo con el navegador y con **Thunder Client** (extensión de VS Code). Diseñar en el pizarrón la tabla de endpoints (sección 10).
- **Documentación:** tabla de endpoints en el capítulo 4.5.
- **Producto:** primer endpoint.

#### S18. Bases de datos relacionales y diagrama ER

- **Conceptos:** tabla, registro, campo, tipo de dato, llave primaria (PK), llave foránea (FK), llave única, cardinalidad (1:1, 1:N, N:M), tabla intermedia.
- **Práctica guiada:** construir el diagrama ER en el pizarrón **junto con el grupo**, preguntando "¿un alumno puede tener muchos reportes?", "¿un grupo tiene muchos alumnos y un alumno muchos grupos?" → aparece `grupo_integrantes`. Luego mostrar el diagrama de la sección 6 y la tabla de tipos de dato de PostgreSQL.
- **Documentación:** diagrama ER (lo dibujan ellos en draw.io o Mermaid) y descripción de tablas.
- **Producto:** diagrama ER del equipo.

#### S19. SQL con PostgreSQL y pgAdmin 4

- **Conceptos:** `CREATE TABLE`, tipos (`SERIAL`, `VARCHAR`, `BOOLEAN`, `DOUBLE PRECISION`, `DATE`, `TIMESTAMPTZ`), restricciones (`NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, `REFERENCES`), `INSERT ... RETURNING`, `SELECT ... WHERE`, `UPDATE`, `DELETE`, `JOIN`, `ON CONFLICT`, **consultas parametrizadas** (`$1, $2`) contra inyección SQL, **cadena de conexión** y **pool de conexiones**.
- **Práctica guiada:**
  1. En pgAdmin 4: clic derecho en *Databases* → *Create* → *Database...* → nombre `seguridad_escolar`.
  2. Escribir `src/db/esquema.sql`, `src/db/conexion.js` e `init.js` (sección 13.2) y correr `npm run db:init`.
  3. En pgAdmin: *seguridad_escolar* → *Schemas* → *public* → *Tables* (clic derecho → *Refresh*) y ver las 8 tablas. Clic derecho en `usuarios` → *View/Edit Data* → *All Rows* para ver al moderador inicial.
  4. Abrir el **Query Tool** (clic derecho en la base → *Query Tool*) y practicar: `SELECT * FROM puntos_encuentro;`, un `INSERT`, un `UPDATE` y un `JOIN`.
  5. Generar el diagrama ER automático: clic derecho en la base → *ERD For Database*; comparar con el que dibujaron en S18.
  6. Cambiar `/api/salud` para que haga `SELECT now()` y comprobar que la API "ve" a PostgreSQL.
- **Documentación:** script SQL en el anexo; captura de las tablas en pgAdmin y del ERD generado.
- **Producto:** base de datos creada con datos de prueba y `/api/salud` respondiendo con la hora de PostgreSQL.

#### S20. Arquitectura en capas y MVC

- **Conceptos:** separación de responsabilidades, **MVC** (Modelo, Vista, Controlador), capa de rutas, **patrón Repositorio** (el modelo encapsula el SQL), por qué no mezclar SQL en las rutas, **funciones `async`** en modelos y controladores (`await pool.query(...)`).
- **Práctica guiada:** crear las carpetas `routes`, `controllers`, `models`, `middlewares`. Implementar de punta a punta `GET /api/puntos` (ruta → controlador → modelo → BD) para que vean el recorrido completo (diagrama 9.1). Mostrar qué pasa si se olvida el `await` (llega una `Promise` en vez de los datos).
- **Documentación:** capítulo 4.1 y 4.3: arquitectura y patrones, con el ejemplo de `/api/puntos`.
- **Producto:** primer endpoint con las 3 capas.

#### S21. Entrega 3

- **Conceptos:** quiz de semana 3 (¿qué capa hace qué?, ¿qué guarda `DATABASE_URL`?).
- **Práctica guiada:** revisión de repos: ¿corre `npm run dev`? ¿responde `/api/puntos`? ¿se ven las tablas en pgAdmin?
- **Documentación:** capítulo 4.1 a 4.4 (arquitectura, stack, patrones, modelo de datos).
- **Producto:** **Entrega 3.**

---

### Semana 4 — Usuarios, seguridad y Swagger

#### S22. Contraseñas seguras: hash

- **Conceptos:** por qué nunca se guardan contraseñas en texto plano, función hash, sal (*salt*), `bcrypt`, filtraciones de datos.
- **Práctica guiada:** en la consola de Node: `bcrypt.hashSync('hola', 10)` dos veces → hashes distintos; `compareSync`. Luego `POST /api/auth/registro` con RN-01, RN-02 y RN-03 (sección 13.3). Ver en pgAdmin la columna `password_hash`: nadie (ni el docente) puede leer la contraseña.
- **Documentación:** capítulo 4.7 Seguridad: "cómo guardamos las contraseñas".
- **Producto:** registro funcionando en Thunder Client.

#### S23. Autenticación con JWT

- **Conceptos:** autenticación vs. autorización, sesión, **JWT** (encabezado.carga.firma), firma con secreto, expiración, por qué no se pone información sensible en el token. Analogía: pulsera de un evento.
- **Práctica guiada:** `POST /api/auth/login` (sección 13.3); copiar el token en [jwt.io](https://jwt.io) para ver su contenido. Explicar con el diagrama 9.2.
- **Documentación:** diagrama de secuencia del login (lo dibujan ellos).
- **Producto:** login que devuelve token.

#### S24. Middleware

- **Conceptos:** **middleware** como cadena de filtros (*cadena de responsabilidad*), `req`, `res`, `next()`, encabezado `Authorization: Bearer`, códigos 401 vs. 403.
- **Práctica guiada:** `src/middlewares/auth.js` con `verificarToken` y `soloRol` (sección 13.4); `GET /api/auth/yo` protegido. Probar sin token (401), con token de alumno en ruta de moderador (403).
- **Documentación:** explicar la cadena de middlewares con el diagrama 9.3.
- **Producto:** rutas protegidas.

#### S25. Sesión en el frontend

- **Conceptos:** `localStorage`, centralizar `fetch` en un módulo (`api.js`), **dirección de la API en un solo lugar** (`config.js`), redirecciones, proteger páginas en el cliente (y por qué la protección real es la del servidor).
- **Práctica guiada:** `public/js/config.js`, `api.js` y `sesion.js` (sección 13.5); conectar formularios de login y registro; `inicio.html` muestra "Hola, nombre" y botón de cerrar sesión. Explicar que `config.js` hoy usa `/api` y en la semana 7 apuntará a Railway sin tocar ningún otro archivo.
- **Documentación:** capturas del flujo registro → login → inicio.
- **Producto:** registro y login desde el navegador.

#### S26. Documentar la API con Swagger

- **Conceptos:** documentación de API, especificación **OpenAPI**, YAML, Swagger UI, esquema de seguridad `bearerAuth`.
- **Práctica guiada:** `docs/openapi.yaml` con los endpoints de auth (sección 10); montar `/api-docs`; iniciar sesión desde Swagger, pegar el token en *Authorize* y probar `/auth/yo`.
- **Documentación:** capítulo 4.5 con captura de Swagger.
- **Producto:** Swagger funcionando.

#### S27. Validación y manejo de errores; contactos de confianza

- **Conceptos:** validar en cliente **y** en servidor, mensajes de error útiles, middleware de errores, **errores de PostgreSQL con código** (`23505` = valor repetido en una columna `UNIQUE`), Express 5 manda solos los errores de funciones `async` al middleware de errores.
- **Práctica guiada:** endpoints de contactos (máx. 2) y `perfil.html`; agregar el middleware de errores al final de `server.js` (sección 13.1). Provocar errores a propósito: JSON mal escrito (400), detener el servicio de PostgreSQL y llamar `/api/salud` (500).
- **Documentación:** casos de prueba de auth (capítulo 5).
- **Producto:** perfil con contactos.

#### S28. Demo 1

- **Práctica guiada:** cada equipo demuestra registro, login, perfil y Swagger en 3 minutos, y muestra el usuario recién creado en pgAdmin. El docente fusiona su referencia en la rama `semana-4`.
- **Documentación:** bitácora y actualización del capítulo 4.
- **Producto:** **Demo 1.**

---

### Semana 5 — Módulo 1: reportes y mapa de zonas

#### S29. Mapas web con Leaflet

- **Conceptos:** coordenadas (latitud, longitud), mosaicos (*tiles*), OpenStreetMap, librería externa por CDN, atribución de mapas.
- **Práctica guiada:** `mapa.html` con Leaflet centrado en el plantel (obtener coordenadas reales en OpenStreetMap: clic derecho → "Mostrar dirección"); marcador del plantel (sección 13.6).
- **Documentación:** stack: por qué Leaflet.
- **Producto:** mapa en pantalla.

#### S30. Geolocalización

- **Conceptos:** Geolocation API, permisos del navegador, **contexto seguro** (solo HTTPS o `localhost`), precisión, manejo de "permiso denegado".
- **Práctica guiada:** en `reportar.html`: botón "Usar mi ubicación" y alternativa "tocar el mapa" que coloca un marcador y guarda `lat/lng`.
- **Documentación:** requerimiento no funcional de HTTPS explicado (y por qué Vercel y Railway lo resuelven en la semana 7).
- **Producto:** selección de ubicación.

#### S31. Crear reportes (backend)

- **Conceptos:** reglas de negocio en el controlador, validación de enums, `201 Created`, `req.usuario` llenado por el middleware, `RETURNING` para obtener la fila creada.
- **Práctica guiada:** modelo, controlador y ruta `POST /api/reportes` (RN-04) (sección 13.7); probar en Swagger y ver la fila nueva en pgAdmin con `estado = pendiente`.
- **Documentación:** Swagger de reportes.
- **Producto:** reporte guardado como pendiente.

#### S32. Formulario de reporte (frontend)

- **Conceptos:** construir un objeto desde un formulario (`FormData`), casilla de anonimato, retroalimentación al usuario.
- **Práctica guiada:** conectar `reportar.html` con `api.js`; mensaje "Tu reporte será revisado".
- **Documentación:** captura y caso de prueba.
- **Producto:** reporte desde el celular (en `localhost` o con túnel `npx cloudflared tunnel --url http://localhost:3000`, que da HTTPS temporal para probar el GPS).

#### S33. Panel de moderación

- **Conceptos:** **autorización por rol**, `PATCH` para cambios parciales, privacidad del reporte anónimo (RN-07).
- **Práctica guiada:** `GET /api/reportes/pendientes` y `PATCH /api/reportes/:id` con `soloRol('moderador')`; `moderador.html` con botones Aprobar/Rechazar. Convertir un usuario en moderador desde el **Query Tool de pgAdmin**: `UPDATE usuarios SET rol = 'moderador' WHERE matricula = '...';`.
- **Documentación:** diagrama de flujo de moderación.
- **Producto:** moderación funcionando.

#### S34. Mapa de zonas con filtros

- **Conceptos:** parámetros de consulta, SQL dinámico seguro (los `$1, $2` se numeran según los filtros que lleguen), **privacidad por diseño** (redondeo de coordenadas, RN-06), círculos en vez de marcadores, leyenda de colores.
- **Práctica guiada:** `GET /api/reportes?tipo=&franja=`; dibujar `L.circle` de 100 m coloreados por tipo; filtros con `select`. Demostrar que `?tipo=acoso' OR '1'='1` no devuelve nada gracias a los parámetros.
- **Documentación:** capítulo 4.7: por qué no mostramos el punto exacto.
- **Producto:** mapa de zonas con filtros.

#### S35. Demo 2

- **Práctica guiada:** demo del flujo completo: alumno reporta → moderador aprueba → aparece en el mapa. Swagger actualizado.
- **Producto:** **Demo 2.**
- **Sugerido:** el docente despliega su versión de referencia en Railway + Vercel esta semana (sección 14) para que el grupo pruebe el GPS en celulares reales y vea el resultado final que alcanzarán en la semana 7.

---

### Semana 6 — Módulos 2 y 3

#### S36. Botón de alerta

- **Conceptos:** esquemas de URL (`tel:`, `sms:`, `https://wa.me/`), eventos de puntero (`pointerdown`, `pointerup`, `pointerleave`), temporizadores (`setTimeout`, `clearTimeout`), diseño para situaciones de estrés (botón grande, una sola acción).
- **Práctica guiada:** botón en `inicio.html` con "mantener 2 segundos" y barra de progreso (sección 13.8); `GET/PUT /api/config/policia`.
- **Documentación:** diagrama de flujo de la alerta.
- **Producto:** botón que abre el marcador con el número de la policía.

#### S37. Registro y panel de alertas

- **Conceptos:** enviar datos opcionales, tolerancia a fallos (si la API falla, **la llamada se hace igual**), orden de las acciones en una emergencia, filtrar "las de hoy" con `creada_en::date = CURRENT_DATE`.
- **Práctica guiada:** `POST /api/alertas`, `GET /api/alertas` (del día) y `PATCH` atendida; sección de alertas en `moderador.html` con mapa.
- **Documentación:** reglas RN-08 y RN-09.
- **Producto:** alerta visible para el moderador.

#### S38. Avisar a mi contacto

- **Conceptos:** `encodeURIComponent`, ligas de Google Maps con coordenadas, consentimiento.
- **Práctica guiada:** botón "Avisar a mi contacto" que abre `https://wa.me/52XXXXXXXXXX?text=...` con la ubicación.
- **Documentación:** manual de usuario del módulo 2.
- **Producto:** mensaje con ubicación.

#### S39. Relación muchos a muchos

- **Conceptos:** relación N:M, tabla intermedia, llave primaria compuesta, `JOIN` y `COUNT ... GROUP BY` (en PostgreSQL `COUNT` se convierte a entero con `::int`), `CURRENT_DATE` y **zona horaria** (por qué la conexión usa la hora de Monterrey).
- **Práctica guiada:** `GET /api/grupos` con integrantes y lugares disponibles; `POST /api/grupos` (el creador se agrega como integrante, dentro de una transacción).
- **Documentación:** explicar la tabla intermedia en el capítulo 4.4.
- **Producto:** API de grupos.

#### S40. Unirse y salir: reglas de cupo

- **Conceptos:** condiciones de carrera (dos alumnos al mismo tiempo), **transacción** (`BEGIN`, `COMMIT`, `ROLLBACK`), **bloqueo de fila** (`SELECT ... FOR UPDATE`), por qué la transacción necesita **una sola conexión** del pool (`pool.connect()` y `release()`), `409 Conflict`.
- **Práctica guiada:** `POST` y `DELETE /api/grupos/:id/unirse` con RN-10 y RN-11 dentro de una transacción (sección 13.9). Demostración: dos pestañas de pgAdmin con el Query Tool; en la primera `BEGIN; SELECT * FROM grupos WHERE id = 1 FOR UPDATE;` y en la segunda la misma consulta: la segunda "se queda esperando" hasta que la primera hace `COMMIT`.
- **Documentación:** casos de prueba: grupo lleno, unirse dos veces.
- **Producto:** reglas de cupo funcionando.

#### S41. Pantalla Caminemos juntos

- **Conceptos:** renderizar listas con `map` y plantillas, estados vacíos ("no hay grupos hoy").
- **Práctica guiada:** `grupos.html`: listar, crear (con `select` de puntos), unirse y salir.
- **Documentación:** manual de usuario del módulo 3.
- **Producto:** módulo 3 completo.

#### S42. Demo 3: MVP completo y cuentas para el despliegue

- **Práctica guiada:** demo de los 3 módulos. Se congela el código: a partir de aquí solo corrección de errores. En los últimos 10 minutos, el integrador de cada equipo crea su cuenta en **Railway** y en **Vercel** entrando con GitHub (sección 14.1), para que la verificación de Railway esté lista para la siguiente sesión.
- **Producto:** **Demo 3** y cuentas creadas.

---

### Semana 7 — Despliegue, pruebas y presentación

#### S43. Despliegue del backend y la base de datos en Railway

- **Conceptos:** entorno de desarrollo vs. producción, plataforma como servicio (PaaS), **despliegue continuo** desde GitHub, variables de entorno en la nube, **variables de referencia** (`${{Postgres.DATABASE_URL}}`), red privada vs. pública, dominio con HTTPS, comando previo al despliegue (*pre-deploy*).
- **Práctica guiada:** el docente proyecta su despliegue paso a paso y los equipos lo replican: proyecto en Railway desde el repo, agregar PostgreSQL, variables, `npm run db:init` como *pre-deploy*, generar dominio y probar `https://SU-API.up.railway.app/api/salud` y `/api-docs` (sección 14.2). Al final, conectar **pgAdmin 4** a la base de Railway y ver las tablas creadas en la nube (sección 14.4).
- **Documentación:** liga de la API y de Swagger en el anexo; captura de Railway con los dos servicios.
- **Producto:** API en internet con HTTPS y base de datos en Railway.

#### S44. Despliegue del frontend en Vercel y CORS

- **Conceptos:** sitio estático, CDN, **origen** (protocolo + dominio + puerto), **CORS** y petición previa (*preflight*), por qué el frontend necesita conocer la URL de la API (`config.js`).
- **Práctica guiada:** poner la URL de Railway en `public/js/config.js`, commit y push; importar el repo en Vercel con *Root Directory* = `public`; copiar la URL de Vercel a la variable `FRONTEND_URL` de Railway (sección 14.3). Abrir la app en celulares reales: registro, login, GPS, mapa, alerta y grupos. Provocar a propósito un error de CORS (borrar `FRONTEND_URL`) y leerlo en la consola de DevTools.
- **Documentación:** capítulo 4.8 Despliegue: diagrama propio (qué vive en Vercel, qué en Railway) y explicación de CORS con sus palabras.
- **Producto:** **app completa en internet** (`https://...vercel.app`) funcionando desde un celular.

#### S45. Pruebas cruzadas sobre la app publicada

- **Conceptos:** caso de prueba (entrada, pasos, resultado esperado, resultado obtenido), prueba de caja negra, prueba cruzada.
- **Práctica guiada:** cada equipo prueba la app **publicada de otro equipo** desde su celular con la plantilla de casos del documento para alumnos y reporta errores. Al corregir, cada `git push` vuelve a desplegar solo (despliegue continuo).
- **Documentación:** capítulo 5.
- **Producto:** reporte de pruebas.

#### S46. Corrección, manual de usuario y cierre del documento

- **Conceptos:** conclusiones (qué se logró, qué no y por qué), trabajo futuro, referencias APA.
- **Práctica guiada:** corregir errores reportados; tomar capturas desde el celular sobre la app publicada; revisión con la lista de verificación del documento para alumnos.
- **Documentación:** capítulo 6 (manual de usuario) y documento final.
- **Producto:** documento final entregado.

#### S47. Preparación de la presentación

- **Conceptos:** estructura de una presentación técnica (problema → datos → solución → demo → aprendizajes).
- **Práctica guiada:** ensayo cronometrado (8 min por equipo + 2 de preguntas) usando la app publicada. Abrir la app unos minutos antes para confirmar que Railway responde.
- **Producto:** presentación lista.

#### S48. Presentación final (parte 1)

Mitad de los equipos. Invitar a dirección, orientación y, si es posible, a padres de familia. Los invitados pueden abrir la liga de Vercel en su propio celular.

#### S49. Presentación final (parte 2) y cierre

Resto de equipos, coevaluación y retroalimentación final. Acordar qué pasa con los servicios de Railway después del cierre (sección 14.5).

---

## 12. Banco de conceptos para explicar

Cada concepto tiene una explicación en palabras simples, una analogía para el pizarrón y el lugar exacto del proyecto donde se aplica. La regla de la clase: **primero la idea, luego la analogía, luego el código del proyecto**.

### 12.1 Web y comunicación

| Concepto | Explicación simple | Analogía | Dónde se aplica | Sesión |
| --- | --- | --- | --- | --- |
| Cliente-servidor | Un programa pide (cliente) y otro responde (servidor) | Cliente y mesero en un restaurante | Celular ↔ Express | S3 |
| HTTP | Las reglas de cómo se escribe un pedido y una respuesta en la web | El formato de una comanda | Todas las llamadas `fetch` | S3 |
| HTTPS | HTTP cifrado: nadie en medio puede leer los datos | Carta en sobre cerrado vs. postal | Vercel y Railway; requisito del GPS | S3, S43 |
| URL | Dirección de un recurso | Dirección de una casa | `/api/reportes?tipo=acoso` | S3 |
| Métodos HTTP | GET leer, POST crear, PUT reemplazar, PATCH modificar una parte, DELETE borrar | Verbos de la comanda: "tráeme", "agrégame", "cámbiame", "quítame" | Tabla de endpoints | S17 |
| Código de estado | Número que resume cómo salió la petición | Semáforo: 2xx verde, 4xx "te equivocaste", 5xx "nos equivocamos" | Sección 10 | S17, S27 |
| JSON | Formato de texto para intercambiar datos, igual a un objeto de JS | Formulario con campos y valores | Cuerpos de petición y respuesta | S12 |
| API REST | Conjunto de URLs que exponen recursos y se usan con métodos HTTP | Menú del restaurante | `/api/...` | S17 |
| Endpoint | Una combinación método + URL | Un platillo del menú | `POST /api/reportes` | S17 |
| Origen | Protocolo + dominio + puerto de una página | El domicilio completo, con colonia y código postal | `https://equipo1.vercel.app` ≠ `https://api.up.railway.app` | S44 |
| **CORS** | Regla del navegador: una página solo puede llamar a otro origen si ese servidor lo autoriza | El guardia de la caseta pregunta al vecino si te deja pasar | `cors({ origin: FRONTEND_URL })` en `server.js` | S44 |

### 12.2 Frontend

| Concepto | Explicación simple | Analogía | Dónde se aplica | Sesión |
| --- | --- | --- | --- | --- |
| HTML semántico | Etiquetas que dicen qué es cada parte | Rotular cajas en una mudanza | Todas las páginas | S9 |
| Mobile first | Diseñar primero para el celular y luego ampliar | Empacar primero lo indispensable | `estilos.css` | S10 |
| Media query | Reglas de CSS que aplican según el tamaño de pantalla | Ropa según el clima | `@media (min-width: 768px)` | S10 |
| Flexbox | Acomodar elementos en fila o columna | Repartir libros en un estante | Formularios, encabezado | S10 |
| DOM | El HTML convertido en objetos que JS puede modificar | El árbol genealógico de la página | `querySelector` | S13 |
| Evento | Algo que pasa (clic, enviar, tocar) | El timbre de la casa | `submit`, `pointerdown` | S13 |
| Patrón **Observer** | Un objeto avisa y otros "suscritos" reaccionan | Suscribirse a un canal: cuando hay video, te llega notificación | `addEventListener` | S13 |
| Promesa / `async-await` | Un resultado que llegará después, sin congelar la página | Ficha de turno en la tortillería | `fetch`, GPS, consultas a PostgreSQL | S13, S20 |
| `fetch` | Función para hacer peticiones HTTP desde JS | Mandar un mensajero | `api.js` | S13, S25 |
| Módulo ES | Archivo que exporta funciones para que otros las importen | Cajón con etiqueta en una caja de herramientas | `import { api } from './api.js'` | S15, S25 |
| `localStorage` | Memoria del navegador que sobrevive al cerrar la pestaña | Guardar el boleto en la cartera | `sesion.js` | S25 |
| Configuración en un solo lugar | La dirección de la API se escribe una vez y todos la usan | La dirección del restaurante impresa en todos los volantes desde una sola plantilla | `config.js` | S25, S44 |
| Geolocation API | Pedir la ubicación al dispositivo, con permiso del usuario | Preguntar "¿dónde estás?" y que el otro decida si responde | Reportes y alerta | S30 |
| Esquema de URL | Ligas que abren otras apps: `tel:`, `sms:`, `wa.me` | Un atajo que abre otra puerta | Botón de alerta | S36 |

### 12.3 Backend y arquitectura

| Concepto | Explicación simple | Analogía | Dónde se aplica | Sesión |
| --- | --- | --- | --- | --- |
| Node.js | JavaScript que corre fuera del navegador | Un chef que antes solo servía y ahora también cocina | Servidor | S15 |
| npm / `package.json` | Gestor de paquetes y lista de dependencias del proyecto | Lista del súper | Instalación | S15 |
| Variable de entorno | Configuración secreta fuera del código | La combinación de la caja fuerte no se escribe en la pared | `.env` en el taller, panel de Railway en producción | S15, S43 |
| Express | Librería para crear servidores y rutas fácilmente | El sistema de comandas del restaurante | `server.js` | S16 |
| **Arquitectura en capas** | Dividir el sistema en partes con una sola responsabilidad | En el restaurante: mesero, chef, almacén | Carpetas de `src/` | S20 |
| **MVC** | Modelo (datos), Vista (lo que ve el usuario), Controlador (decide qué hacer) | Almacén, comedor y chef | `models/`, `public/`, `controllers/` | S20 |
| Ruta | Asocia método + URL con quien lo atiende | El mesero que lleva la comanda a la cocina | `routes/` | S20 |
| Controlador | Recibe la petición, aplica reglas de negocio y responde | El chef que decide si el pedido se puede preparar | `controllers/` | S20 |
| Modelo / **Repositorio** | Encapsula las consultas a la base de datos | El almacenista: solo él entra a la bodega | `models/` | S20 |
| **Middleware** | Función que se ejecuta antes del controlador y puede dejar pasar (`next()`) o detener | Los filtros del aeropuerto: boleto, revisión, puerta | `auth.js`, `express.json()`, `cors()` | S24 |
| Cadena de responsabilidad | Varios filtros en fila; cada uno decide si sigue | Retenes en carretera | `verificarToken → soloRol → controlador` | S24 |
| Regla de negocio | Condición propia del problema que el sistema debe cumplir | Reglamento de la escuela | Sección 7 | S6, S31 |
| Validación | Revisar que los datos estén completos y correctos | Revisar el formulario antes de sellarlo | Controladores | S27 |
| Middleware de errores | Último filtro: atrapa cualquier error y responde con un mensaje controlado | El gerente que atiende las quejas | Final de `server.js` | S27 |

### 12.4 Base de datos

| Concepto | Explicación simple | Analogía | Dónde se aplica | Sesión |
| --- | --- | --- | --- | --- |
| Base de datos relacional | Datos en tablas relacionadas por llaves | Archivero con carpetas que se refieren entre sí | PostgreSQL | S18 |
| Servidor de base de datos | Programa que guarda los datos y atiende conexiones por la red | La bodega central que surte a varias sucursales | PostgreSQL local y en Railway | S15, S19 |
| pgAdmin 4 | Programa con ventanas para ver y administrar PostgreSQL | La ventanilla del encargado de la bodega | Query Tool, View/Edit Data, ERD | S19 |
| Cadena de conexión | Texto con usuario, contraseña, servidor, puerto y base | La dirección completa más la llave de la bodega | `DATABASE_URL` | S19, S43 |
| Pool de conexiones | Grupo de conexiones abiertas que se reutilizan | Una fila de cajeros: cada cliente pasa con el que esté libre | `conexion.js` | S19 |
| Llave primaria (PK) | Identificador único de cada fila | La matrícula del alumno | `id SERIAL` | S18 |
| Llave foránea (FK) | Campo que apunta a la PK de otra tabla | "Ver expediente número 15" | `usuario_id` | S18 |
| Cardinalidad | Cuántos de A se relacionan con cuántos de B | Un tutor, muchos alumnos | Diagrama ER | S18 |
| Tabla intermedia (N:M) | Tabla que une dos tablas con relación muchos a muchos | Lista de asistencia: alumnos ↔ clases | `grupo_integrantes` | S18, S39 |
| SQL | Lenguaje para crear, leer, modificar y borrar datos | Las instrucciones al almacenista | `models/` | S19 |
| `JOIN` | Combinar filas de varias tablas por su relación | Juntar la lista de grupo con las calificaciones | Pendientes, grupos | S19, S39 |
| `RETURNING` | El `INSERT` o `UPDATE` devuelve la fila que tocó | El ticket que te dan al dejar un paquete | `crear` en los modelos | S19, S31 |
| Consulta parametrizada | Los datos van aparte (`$1`, `$2`), nunca pegados al SQL | Llenar un formulario impreso en vez de escribir la instrucción a mano | Todos los modelos | S19 |
| Inyección SQL | Ataque que mete código SQL en un campo de texto | Alguien escribe "y también dame la llave" en el formulario | Se evita con `$1` | S19, S34 |
| Transacción | Varias operaciones que pasan todas o ninguna | Pagar y recibir el producto: o las dos o ninguna | Crear grupo, unirse a un grupo | S40 |
| Bloqueo de fila (`FOR UPDATE`) | Mientras una transacción revisa una fila, las demás esperan su turno | Apartar el último lugar del camión mientras pagas | `unirse` en `grupo.model.js` | S40 |
| Zona horaria | La hora depende del lugar; los servidores en la nube usan UTC | Llamar a un primo en otro país y preguntar "¿qué hora es allá?" | `TimeZone=America/Monterrey` en `conexion.js` | S39 |

### 12.5 Seguridad y privacidad

| Concepto | Explicación simple | Analogía | Dónde se aplica | Sesión |
| --- | --- | --- | --- | --- |
| Autenticación | Comprobar **quién eres** | Mostrar la credencial en la entrada | Login | S23 |
| Autorización | Comprobar **qué puedes hacer** | Tener o no llave de la dirección | `soloRol` | S24 |
| Hash | Transformación de un solo sentido: no se puede regresar | Licuar fruta: no se puede "deslicuar" | `password_hash` | S22 |
| Sal (*salt*) | Dato aleatorio que se agrega antes del hash para que dos contraseñas iguales den hashes distintos | Cada licuado lleva un ingrediente secreto distinto | `bcrypt.hashSync(p, 10)` | S22 |
| **JWT** | Token firmado con 3 partes (encabezado.carga.firma) que prueba quién eres | Pulsera de un evento: el guardia ve que es auténtica sin buscarte en la lista | Login y middleware | S23 |
| Expiración | El token deja de servir después de un tiempo | La pulsera solo vale ese día | `expiresIn: '8h'` | S23 |
| Bearer token | Forma de enviar el token: `Authorization: Bearer <token>` | Mostrar la pulsera en cada puerta | `api.js` | S24 |
| Secretos fuera del repositorio | Contraseñas y llaves nunca se suben a GitHub | No pegar la contraseña del wifi en la puerta | `.env` en `.gitignore`; variables en Railway | S15, S43 |
| Privacidad por diseño | Desde el diseño se decide qué datos NO se muestran ni se guardan | No poner la dirección de la casa en el gafete | RN-06, RN-07, RN-14 | S34 |
| Datos de menores | Requieren aviso de privacidad y el mínimo de datos | — | Registro | S5, S46 |

### 12.6 Despliegue

| Concepto | Explicación simple | Analogía | Dónde se aplica | Sesión |
| --- | --- | --- | --- | --- |
| Desarrollo vs. producción | El taller es el ensayo; producción es la función con público | Ensayo general vs. estreno | `localhost` vs. Vercel + Railway | S43 |
| PaaS (plataforma como servicio) | Empresas que corren tu código sin que administres servidores | Rentar un local amueblado en vez de construirlo | Railway y Vercel | S43 |
| Sitio estático | Archivos que se entregan tal cual, sin programa del lado del servidor | Folletos impresos listos para repartir | `public/` en Vercel | S44 |
| CDN | Red de servidores en muchas ciudades que entregan los archivos desde el más cercano | Sucursales de la misma tienda en cada colonia | Vercel | S44 |
| Despliegue continuo | Cada `git push` vuelve a publicar la app sola | La imprenta reimprime el periódico cada vez que llega una nota nueva | Railway y Vercel conectados a GitHub | S43–S45 |
| Variable de referencia | En Railway, una variable que copia el valor de otro servicio | "Lo mismo que pidió la mesa 3" | `DATABASE_URL=${{Postgres.DATABASE_URL}}` | S43 |
| Red privada vs. pública | Dentro de Railway la API llega a la BD por una red interna; desde fuera hace falta un acceso público | Pasillo interno del edificio vs. puerta a la calle | `DATABASE_URL` vs. `DATABASE_PUBLIC_URL` (pgAdmin) | S43 |
| *Pre-deploy* | Comando que corre antes de arrancar cada versión nueva | Barrer y acomodar mesas antes de abrir | `npm run db:init` | S43 |
| Bitácora de despliegue (logs) | Lo que el servidor escribe en consola, visible en el panel | La caja negra del avión | *Deploy Logs* de Railway | S43 |

### 12.7 Herramientas y proceso

| Concepto | Explicación simple | Dónde se aplica | Sesión |
| --- | --- | --- | --- |
| Git / commit / push | Historial de cambios y copia en la nube | Al cierre de cada sesión | S8 |
| Rama (*branch*) | Línea de trabajo paralela | Repo de referencia por semana | S8 |
| OpenAPI / Swagger | Especificación estándar de una API y página para probarla | `docs/openapi.yaml`, `/api-docs` | S26 |
| Thunder Client / Postman | Programa para probar peticiones HTTP | Pruebas de cada endpoint | S17 |
| pgAdmin 4 | Administrador gráfico de PostgreSQL | Tablas, Query Tool, ERD, conexión a Railway | S19, S43 |
| Caso de prueba | Entrada + pasos + resultado esperado | Capítulo 5 | S45 |
| Despliegue | Publicar la app en servidores en internet | Railway (API + BD) y Vercel (páginas) | S43, S44 |
| MVP | La versión mínima que resuelve el problema principal | Alcance del proyecto | S1 |

---

## 13. Código de referencia

Este código fue **probado de punta a punta contra PostgreSQL 18** con Node.js 22, Express 5 y `pg` 8: registro, login, roles, contactos, reportes, moderación, mapa con coordenadas redondeadas, filtros (incluido un intento de inyección SQL), alertas, grupos con cupo (7 alumnos intentando unirse al mismo tiempo a un grupo con un solo lugar libre: entra exactamente 1), CORS y Swagger. Úsalo como guion de la práctica guiada: se escribe por bloques en la sesión indicada, explicando cada línea.

**Lo que cambia respecto a la versión con SQLite (para explicarlo en S19–S20):**

| Antes (SQLite, `node:sqlite`) | Ahora (PostgreSQL, `pg`) | Por qué |
| --- | --- | --- |
| `db.prepare(sql).get(x)` (síncrono) | `await pool.query(sql, [x])` (asíncrono) | La base de datos es otro programa y responde por la red |
| Parámetros `?` | Parámetros numerados `$1, $2, $3` | Así los escribe PostgreSQL |
| `.get()` / `.all()` | `const { rows } = await pool.query(...)` → `rows[0]` / `rows` | `pg` siempre devuelve un objeto con `rows` y `rowCount` |
| `.run(...).changes` | `rowCount` | Cuántas filas tocó un `UPDATE` o `DELETE` |
| `lastInsertRowid` | `INSERT ... RETURNING id` | PostgreSQL devuelve la fila creada en la misma consulta |
| `INSERT OR IGNORE` | `INSERT ... ON CONFLICT DO NOTHING` | Sintaxis estándar de PostgreSQL |
| `date('now','localtime')` | `CURRENT_DATE` (con la zona horaria de la conexión) | Funciones de fecha de PostgreSQL |
| `BEGIN IMMEDIATE` | `pool.connect()` + `BEGIN` + `SELECT ... FOR UPDATE` | En un pool cada consulta podría ir por otra conexión; la transacción debe usar una sola |
| Controladores normales | Controladores `async` | Deben esperar (`await`) al modelo |

Las páginas que no aparecen aquí (`registro.html`, `perfil.html`, `grupos.html`, `moderador.html`) siguen exactamente el mismo patrón que `index.html` y `reportar.html`: formulario o lista + `api()` + `protegerPagina()`. Son buen ejercicio para que los equipos las completen con apoyo.

**Para empezar desde cero en el taller (resumen):**

1. En pgAdmin 4, crear la base de datos `seguridad_escolar` (clic derecho en *Databases* → *Create* → *Database...*).
2. Copiar `.env.example` como `.env` y poner la contraseña de PostgreSQL de esa computadora.
3. Ejecutar:

```bash
npm install            # instala dependencias
npm run db:init        # crea las tablas, la configuración, los puntos y el usuario moderador
npm run dev            # http://localhost:3000  ·  Swagger en http://localhost:3000/api-docs
```

Usuario moderador inicial: matrícula `moderador`, contraseña `moderador123` (cambiarla después). `npm run db:init` se puede ejecutar varias veces: no borra ni duplica nada.

`.env.example` (este **sí** se sube a GitHub, sin secretos reales; cada equipo lo copia como `.env`):

```text
PUERTO=3000
JWT_SECRETO=cambia-esto-por-una-frase-larga
CODIGO_REGISTRO=CBT2026
TELEFONO_POLICIA=8100000000
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@localhost:5432/seguridad_escolar
FRONTEND_URL=http://localhost:3000
```

| Variable | Para qué | En el taller | En Railway |
| --- | --- | --- | --- |
| `PUERTO` | Puerto local de Express | `3000` | No se usa (Railway define `PORT`) |
| `JWT_SECRETO` | Firma de los tokens | Cualquier frase larga | Una frase larga **distinta** a la del taller |
| `CODIGO_REGISTRO` | Código que se pide al registrarse (RN-01) | `CBT2026` | El que defina el docente |
| `TELEFONO_POLICIA` | Número inicial de la policía (RN-09) | De prueba | El confirmado por dirección |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://postgres:CONTRASEÑA@localhost:5432/seguridad_escolar` | `${{Postgres.DATABASE_URL}}` |
| `FRONTEND_URL` | Orígenes permitidos por CORS (separados por coma) | `http://localhost:3000` | `https://SU-APP.vercel.app` |

**Partes de la cadena de conexión** (para dibujarla en el pizarrón en S19):

```text
postgresql://postgres:CONTRASEÑA@localhost:5432/seguridad_escolar
└─protocolo─┘ └usuario┘ └contraseña┘ └servidor┘ └puerto┘ └─base de datos─┘
```

### 13.1 `server.js` (S16, S26, S27, S44)

```js
// server.js — punto de entrada
import express from 'express';
import cors from 'cors';
import { readFileSync } from 'node:fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import pool from './src/db/conexion.js';

import authRoutes from './src/routes/auth.routes.js';
import contactosRoutes from './src/routes/contactos.routes.js';
import reportesRoutes from './src/routes/reportes.routes.js';
import alertasRoutes from './src/routes/alertas.routes.js';
import configRoutes from './src/routes/config.routes.js';
import gruposRoutes, { puntosRouter } from './src/routes/grupos.routes.js';

const app = express();

// CORS: qué otros dominios pueden llamar a esta API desde el navegador.
// En producción, FRONTEND_URL es la dirección de Vercel (pueden ser varias separadas por coma)
const origenes = (process.env.FRONTEND_URL ?? 'http://localhost:3000').split(',').map((o) => o.trim());
app.use(cors({ origin: origenes }));

app.use(express.json());                 // middleware: convierte el cuerpo JSON en req.body
app.use(express.static('public'));       // en local, Express también sirve la VISTA

// Salud: confirma que el servidor Y la base de datos responden (útil al desplegar)
app.get('/api/salud', async (req, res) => {
  const { rows } = await pool.query('SELECT now() AS hora');
  res.json({ ok: true, hora: rows[0].hora });
});

app.use('/api/auth', authRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/alertas', alertasRoutes);
app.use('/api/config', configRoutes);
app.use('/api/puntos', puntosRouter);
app.use('/api/grupos', gruposRoutes);

// Swagger: documentación interactiva en /api-docs
const openapi = YAML.parse(readFileSync('./docs/openapi.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

// Middleware de errores: va AL FINAL y recibe 4 parámetros.
// Express 5 manda aquí los errores de los controladores async automáticamente
app.use((err, req, res, next) => {
  if (err.code === '23505') {                          // PostgreSQL: valor UNIQUE repetido
    return res.status(409).json({ error: 'Ese registro ya existe' });
  }
  if (err.type === 'entity.parse.failed') {           // JSON mal escrito en la petición
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PUERTO = process.env.PORT ?? process.env.PUERTO ?? 3000;   // Railway define PORT
app.listen(PUERTO, () => console.log(`Servidor en http://localhost:${PUERTO}`));
```

### 13.2 Base de datos (S19)

`src/db/conexion.js`

```js
// src/db/conexion.js — pool de conexiones a PostgreSQL
import pg from 'pg';

const { Pool, types } = pg;

// Las columnas DATE llegan como texto '2026-11-03' (y no como objeto Date con hora UTC)
types.setTypeParser(types.builtins.DATE, (valor) => valor);

// DATABASE_URL viene del .env en local, o de las variables de Railway en producción.
// options: cada conexión usa la hora de Monterrey, así CURRENT_DATE es "hoy" en el plantel
// (los servidores en la nube trabajan en hora UTC, 6 horas adelante)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  options: '-c TimeZone=America/Monterrey'
});

export default pool;
```

Por qué cada línea:

- **`Pool`** mantiene varias conexiones abiertas y las reparte entre peticiones; abrir una conexión nueva por cada petición sería lento.
- **`setTypeParser(DATE)`**: sin esta línea, `pg` convierte las columnas `DATE` en objetos `Date` de JavaScript y la API devolvería `"2026-11-03T00:00:00.000Z"`; al mostrarlo en un celular en México se vería como "2 de noviembre, 6:00 p. m.". Con la línea, llega simplemente `"2026-11-03"`.
- **`TimeZone=America/Monterrey`**: Railway corre en hora UTC (6 horas adelante). Sin esto, a partir de las 6 p. m. `CURRENT_DATE` ya sería "mañana" y los grupos de la tarde desaparecerían (RN-12).

`src/db/init.js`

```js
// src/db/init.js — crea las tablas y carga datos iniciales (npm run db:init)
// Se puede ejecutar varias veces: no duplica ni borra datos
import { readFileSync } from 'node:fs';
import bcrypt from 'bcryptjs';
import pool from './conexion.js';

const esquema = readFileSync(new URL('./esquema.sql', import.meta.url), 'utf8');
await pool.query(esquema);

// Configuración inicial (ON CONFLICT DO NOTHING: si ya existe, no la toca)
const sqlConfig = 'INSERT INTO configuracion (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO NOTHING';
await pool.query(sqlConfig, ['codigo_registro', process.env.CODIGO_REGISTRO ?? 'CAMBIAME']);
await pool.query(sqlConfig, ['telefono_policia', process.env.TELEFONO_POLICIA ?? '0000000000']);

// Puntos de encuentro de ejemplo (cambiar por coordenadas reales del plantel)
const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM puntos_encuentro');
if (rows[0].n === 0) {
  const sqlPunto = 'INSERT INTO puntos_encuentro (nombre, descripcion, lat, lng) VALUES ($1, $2, $3, $4)';
  await pool.query(sqlPunto, ['Puerta principal', 'Frente a la caseta de prefectura', 25.7969, -100.3134]);
  await pool.query(sqlPunto, ['Parada de camión', 'Esquina de la avenida principal', 25.7975, -100.3120]);
}

// Moderador inicial
await pool.query(
  `INSERT INTO usuarios (nombre, matricula, grupo_escolar, password_hash, rol)
   VALUES ($1, $2, $3, $4, 'moderador')
   ON CONFLICT (matricula) DO NOTHING`,
  ['Docente moderador', 'moderador', 'DOCENTE', bcrypt.hashSync('moderador123', 10)]
);

console.log('Base de datos lista');
await pool.end();   // cierra las conexiones para que el script termine
```

### 13.3 Autenticación: modelo, controlador y rutas (S22, S23)

`src/models/usuario.model.js`

```js
// src/models/usuario.model.js — MODELO: solo consultas SQL
import pool from '../db/conexion.js';

export async function buscarPorMatricula(matricula) {
  const { rows } = await pool.query('SELECT * FROM usuarios WHERE matricula = $1', [matricula]);
  return rows[0];                       // undefined si no existe
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    'SELECT id, nombre, matricula, grupo_escolar, rol FROM usuarios WHERE id = $1', [id]);
  return rows[0];
}

export async function crear({ nombre, matricula, grupoEscolar, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, matricula, grupo_escolar, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, matricula, grupo_escolar, rol`,      // devuelve la fila creada
    [nombre, matricula, grupoEscolar, passwordHash]);
  return rows[0];
}
```

`src/models/config.model.js`

```js
import pool from '../db/conexion.js';

export async function leer(clave) {
  const { rows } = await pool.query('SELECT valor FROM configuracion WHERE clave = $1', [clave]);
  return rows[0]?.valor;
}

export async function guardar(clave, valor) {
  await pool.query(
    `INSERT INTO configuracion (clave, valor) VALUES ($1, $2)
     ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`, [clave, valor]);
}
```

`src/controllers/auth.controller.js`

```js
// src/controllers/auth.controller.js — CONTROLADOR: reglas de negocio
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as Usuario from '../models/usuario.model.js';
import * as Config from '../models/config.model.js';

// async: el controlador ESPERA (await) al modelo, porque la BD responde por la red
export async function registro(req, res) {
  const { nombre, matricula, grupoEscolar, password, codigo } = req.body ?? {};

  if (!nombre || !matricula || !grupoEscolar || !password || !codigo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  if (password.length < 8) {                                         // RN-03
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (codigo !== await Config.leer('codigo_registro')) {              // RN-01
    return res.status(403).json({ error: 'Código de registro inválido' });
  }
  if (await Usuario.buscarPorMatricula(matricula)) {                 // RN-02
    return res.status(409).json({ error: 'Esa matrícula ya está registrada' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);                // nunca texto plano
  const usuario = await Usuario.crear({ nombre, matricula, grupoEscolar, passwordHash });
  res.status(201).json(usuario);
}

export async function login(req, res) {
  const { matricula, password } = req.body ?? {};
  if (!matricula || !password) {
    return res.status(400).json({ error: 'Matrícula y contraseña son obligatorias' });
  }

  const usuario = await Usuario.buscarPorMatricula(matricula);
  // Mismo mensaje en ambos casos: no revelamos si la matrícula existe
  if (!usuario || !usuario.activo || !bcrypt.compareSync(password, usuario.password_hash)) {
    return res.status(401).json({ error: 'Matrícula o contraseña incorrectas' });
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },  // carga (payload)
    process.env.JWT_SECRETO,                                       // secreto para firmar
    { expiresIn: '8h' }                                            // caduca en una jornada
  );
  res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
}

export async function yo(req, res) {
  res.json(await Usuario.buscarPorId(req.usuario.id));
}
```

`src/routes/auth.routes.js`

```js
// src/routes/auth.routes.js — RUTAS: URL + método → middleware → controlador
import { Router } from 'express';
import { registro, login, yo } from '../controllers/auth.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();
router.post('/registro', registro);
router.post('/login', login);
router.get('/yo', verificarToken, yo);

export default router;
```

### 13.4 Middleware de autenticación y roles (S24)

`src/middlewares/auth.js`

```js
// src/middlewares/auth.js — filtros que se ejecutan ANTES del controlador
import jwt from 'jsonwebtoken';

// 1) ¿Trae un token válido? → llena req.usuario
export function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization ?? '';   // "Bearer eyJhbGci..."
  const [tipo, token] = encabezado.split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Debes iniciar sesión' });
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRETO); // { id, rol, nombre }
    next();                                                     // pasa al siguiente
  } catch {
    return res.status(401).json({ error: 'Sesión vencida o inválida' });
  }
}

// 2) ¿Tiene el rol necesario? Se usa DESPUÉS de verificarToken
export function soloRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tienes permiso para esta acción' });
    }
    next();
  };
}
```

### 13.5 Frontend: configuración, sesión y llamadas a la API (S25)

`public/js/config.js` — en la semana 7 solo se cambia la línea de Railway:

```js
// public/js/config.js — ¿a qué servidor le habla el frontend?
// En local: Express sirve las páginas y la API en el mismo lugar → '/api'
// En Vercel: las páginas viven en Vercel y la API en Railway → URL completa de Railway
const EN_VERCEL = location.hostname.endsWith('.vercel.app');

export const API_URL = EN_VERCEL
  ? 'https://CAMBIAR-POR-SU-API.up.railway.app/api'   // ← dominio que les dio Railway
  : '/api';
```

`public/js/sesion.js`

```js
// public/js/sesion.js — guardar y leer la sesión en el navegador
export const leerToken = () => localStorage.getItem('token');
export const leerUsuario = () => JSON.parse(localStorage.getItem('usuario') ?? 'null');

export function guardarSesion({ token, usuario }) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
}

export function cerrarSesion() {
  localStorage.clear();
  location.href = 'index.html';
}

// Llamar al inicio de cada página privada. OJO: la protección REAL es la del servidor.
export function protegerPagina(rol) {
  const usuario = leerUsuario();
  if (!leerToken() || !usuario) return cerrarSesion();
  if (rol && usuario.rol !== rol) location.href = 'inicio.html';
  return usuario;
}
```

`public/js/api.js`

```js
// public/js/api.js — TODAS las llamadas al servidor pasan por aquí
import { API_URL } from './config.js';
import { leerToken, cerrarSesion } from './sesion.js';

export async function api(ruta, { metodo = 'GET', datos } = {}) {
  const opciones = { method: metodo, headers: {} };
  const token = leerToken();
  if (token) opciones.headers.Authorization = `Bearer ${token}`;
  if (datos !== undefined) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(datos);
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, opciones);
  if (respuesta.status === 401 && token) cerrarSesion();     // token vencido → al login
  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new Error(cuerpo.error ?? 'Error inesperado');
  return cuerpo;
}
```

`public/index.html` (login)

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Iniciar sesión · Seguridad Escolar</title>
  <link rel="stylesheet" href="css/estilos.css">
</head>
<body>
  <header><h1>Seguridad Escolar</h1></header>
  <main>
    <h2>Iniciar sesión</h2>
    <form id="form-login">
      <label for="matricula">Matrícula</label>
      <input id="matricula" name="matricula" required>
      <label for="password">Contraseña</label>
      <input id="password" name="password" type="password" required minlength="8">
      <button type="submit">Entrar</button>
      <p id="mensaje" class="mensaje error oculto"></p>
    </form>
    <p>¿No tienes cuenta? <a href="registro.html">Regístrate</a></p>
  </main>
  <script type="module">
    import { api } from './js/api.js';
    import { guardarSesion } from './js/sesion.js';

    const form = document.querySelector('#form-login');
    const mensaje = document.querySelector('#mensaje');

    form.addEventListener('submit', async (evento) => {   // Observer: escuchamos el evento
      evento.preventDefault();                              // evita que la página se recargue
      const datos = Object.fromEntries(new FormData(form));
      try {
        guardarSesion(await api('/auth/login', { metodo: 'POST', datos }));
        location.href = 'inicio.html';
      } catch (error) {
        mensaje.textContent = error.message;
        mensaje.classList.remove('oculto');
      }
    });
  </script>
</body>
</html>
```

`public/css/estilos.css` (S10)

```css
/* public/css/estilos.css — mobile first: primero el celular, luego pantallas grandes */
:root {
  --primario: #1f4e79;
  --peligro: #c62828;
  --fondo: #f5f6f8;
  --texto: #1d1d1f;
  --borde: #d0d4da;
}
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: var(--fondo); color: var(--texto); }
header { background: var(--primario); color: #fff; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
header h1 { font-size: 1.1rem; margin: 0; }
main { padding: 1rem; max-width: 640px; margin: 0 auto; }
form { display: flex; flex-direction: column; gap: .75rem; }
label { font-weight: 600; }
input, select, textarea, button { font: inherit; padding: .75rem; border-radius: 8px; border: 1px solid var(--borde); width: 100%; }
button { background: var(--primario); color: #fff; border: none; min-height: 48px; cursor: pointer; }
button.secundario { background: #fff; color: var(--primario); border: 1px solid var(--primario); }
.mensaje { padding: .75rem; border-radius: 8px; background: #e8f0fe; }
.mensaje.error { background: #fdecea; color: var(--peligro); }
.menu { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-top: 1rem; }
.menu a { background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 1rem; text-align: center; color: var(--texto); text-decoration: none; font-weight: 600; }
#boton-alerta { position: relative; overflow: hidden; background: var(--peligro); font-size: 1.25rem; font-weight: 700; min-height: 120px; border-radius: 16px; user-select: none; touch-action: none; }
#boton-alerta .progreso { position: absolute; left: 0; bottom: 0; height: 8px; width: 0; background: #fff; }
#mapa { height: 60vh; border-radius: 12px; }
.tarjeta { background: #fff; border: 1px solid var(--borde); border-radius: 12px; padding: 1rem; margin-bottom: .75rem; }
.oculto { display: none; }

@media (min-width: 768px) {
  .menu { grid-template-columns: repeat(4, 1fr); }
}
```

### 13.6 Módulo 1: mapa de zonas (S29, S34)

`public/mapa.html`

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mapa de zonas · Seguridad Escolar</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="css/estilos.css">
</head>
<body>
  <header><h1>Mapa de zonas de riesgo</h1><a href="inicio.html" style="color:#fff">Inicio</a></header>
  <main>
    <form id="filtros" style="flex-direction:row">
      <select name="tipo">
        <option value="">Todos los tipos</option>
        <option value="asalto">Asalto</option>
        <option value="agresion">Agresión</option>
        <option value="acoso">Acoso</option>
        <option value="sospechoso">Persona sospechosa</option>
        <option value="otro">Otro</option>
      </select>
      <select name="franja">
        <option value="">Todo horario</option>
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
        <option value="otra">Otra</option>
      </select>
    </form>
    <div id="mapa"></div>
  </main>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module" src="js/mapa.js"></script>
</body>
</html>
```

`public/js/mapa.js`

```js
// public/js/mapa.js — Módulo 1: mapa de zonas (L viene de leaflet.js)
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

protegerPagina();

const PLANTEL = [25.7969, -100.3134];          // CAMBIAR por las coordenadas reales
const COLORES = { asalto: '#c62828', agresion: '#ef6c00', acoso: '#6a1b9a', sospechoso: '#1565c0', otro: '#546e7a' };

const mapa = L.map('mapa').setView(PLANTEL, 16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(mapa);
L.marker(PLANTEL).addTo(mapa).bindPopup('Plantel');

const capaZonas = L.layerGroup().addTo(mapa);
const filtros = document.querySelector('#filtros');

async function pintarZonas() {
  capaZonas.clearLayers();
  const parametros = new URLSearchParams(new FormData(filtros)).toString();
  const reportes = await api(`/reportes?${parametros}`);
  reportes.forEach((r) => {
    L.circle([r.lat, r.lng], { radius: 100, color: COLORES[r.tipo], fillOpacity: 0.25 })
      .bindPopup(`<b>${r.tipo}</b><br>${r.fecha} · ${r.franja}`)
      .addTo(capaZonas);
  });
}

filtros.addEventListener('change', pintarZonas);
pintarZonas();
```

### 13.7 Módulo 1: reportes (S30–S33)

`src/models/reporte.model.js`

```js
// src/models/reporte.model.js
import pool from '../db/conexion.js';

export async function crear(r) {
  const { rows } = await pool.query(
    `INSERT INTO reportes (usuario_id, tipo, descripcion, fecha, franja, lat, lng, anonimo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, estado`,
    [r.usuarioId, r.tipo, r.descripcion, r.fecha, r.franja, r.lat, r.lng, Boolean(r.anonimo)]);
  return rows[0];
}

// RN-05: solo aprobados. Los filtros se agregan con parámetros ($1, $2), nunca pegando texto
export async function listarAprobados({ tipo, franja }) {
  let sql = "SELECT id, tipo, fecha, franja, lat, lng FROM reportes WHERE estado = 'aprobado'";
  const params = [];
  if (tipo)   { params.push(tipo);   sql += ` AND tipo = $${params.length}`; }
  if (franja) { params.push(franja); sql += ` AND franja = $${params.length}`; }
  const { rows } = await pool.query(sql + ' ORDER BY fecha DESC', params);
  return rows;
}

export async function listarPendientes() {
  const { rows } = await pool.query(
    `SELECT r.*, u.nombre AS autor, u.grupo_escolar
     FROM reportes r JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.estado = 'pendiente' ORDER BY r.creado_en`);
  return rows;
}

export async function cambiarEstado(id, estado, moderadorId) {
  const { rowCount } = await pool.query(
    'UPDATE reportes SET estado = $1, moderado_por = $2 WHERE id = $3',
    [estado, moderadorId, id]);
  return rowCount;                      // 0 si el id no existe
}
```

`src/controllers/reportes.controller.js`

```js
// src/controllers/reportes.controller.js
import * as Reporte from '../models/reporte.model.js';

const TIPOS = ['asalto', 'agresion', 'acoso', 'sospechoso', 'otro'];
const FRANJAS = ['entrada', 'salida', 'otra'];

export async function crear(req, res) {
  const { tipo, descripcion, fecha, franja, lat, lng, anonimo } = req.body ?? {};
  if (!TIPOS.includes(tipo) || !FRANJAS.includes(franja) || !descripcion || !fecha) {
    return res.status(400).json({ error: 'Revisa tipo, franja, descripción y fecha' });
  }
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'Falta la ubicación del incidente' });
  }
  // RN-04: siempre nace pendiente (lo pone la BD con DEFAULT)
  const reporte = await Reporte.crear({ usuarioId: req.usuario.id, tipo, descripcion, fecha, franja, lat, lng, anonimo });
  res.status(201).json(reporte);
}

export async function listar(req, res) {
  const redondear = (n) => Math.round(n * 1000) / 1000;          // RN-06: ≈ 100 m
  const reportes = (await Reporte.listarAprobados(req.query)).map((r) => ({
    ...r, lat: redondear(r.lat), lng: redondear(r.lng)
  }));
  res.json(reportes);
}

export async function pendientes(req, res) {
  // RN-07: si es anónimo, ni el moderador ve el nombre
  const lista = (await Reporte.listarPendientes()).map(({ autor, grupo_escolar, usuario_id, ...r }) =>
    r.anonimo ? r : { ...r, autor, grupo_escolar });
  res.json(lista);
}

export async function moderar(req, res) {
  const { estado } = req.body ?? {};
  if (!['aprobado', 'rechazado'].includes(estado)) {
    return res.status(400).json({ error: 'Estado debe ser aprobado o rechazado' });
  }
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).json({ error: 'Reporte no encontrado' });
  const cambios = await Reporte.cambiarEstado(id, estado, req.usuario.id);
  if (cambios === 0) return res.status(404).json({ error: 'Reporte no encontrado' });
  res.json({ id, estado });
}
```

`src/routes/reportes.routes.js`

```js
import { Router } from 'express';
import * as C from '../controllers/reportes.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);                 // todas las rutas de reportes requieren sesión

router.post('/', C.crear);
router.get('/', C.listar);
router.get('/pendientes', soloRol('moderador'), C.pendientes);
router.patch('/:id', soloRol('moderador'), C.moderar);

export default router;
```

`public/reportar.html`

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reportar incidente · Seguridad Escolar</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="css/estilos.css">
</head>
<body>
  <header><h1>Reportar incidente</h1><a href="inicio.html" style="color:#fff">Inicio</a></header>
  <main>
    <form id="form-reporte">
      <label for="tipo">¿Qué pasó?</label>
      <select id="tipo" name="tipo" required>
        <option value="">Elige una opción</option>
        <option value="asalto">Asalto</option>
        <option value="agresion">Agresión</option>
        <option value="acoso">Acoso</option>
        <option value="sospechoso">Persona sospechosa</option>
        <option value="otro">Otro</option>
      </select>
      <label for="descripcion">Describe brevemente (sin nombres de personas)</label>
      <textarea id="descripcion" name="descripcion" rows="3" required></textarea>
      <label for="fecha">Fecha</label>
      <input id="fecha" name="fecha" type="date" required>
      <label for="franja">Horario</label>
      <select id="franja" name="franja" required>
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
        <option value="otra">Otro horario</option>
      </select>
      <label>¿Dónde fue? Toca el mapa o usa tu ubicación</label>
      <button id="usar-gps" class="secundario" type="button">Usar mi ubicación</button>
      <div id="mapa" style="height:40vh"></div>
      <label><input name="anonimo" type="checkbox" style="width:auto"> Enviar de forma anónima</label>
      <button type="submit">Enviar reporte</button>
      <p id="mensaje" class="mensaje oculto"></p>
    </form>
  </main>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module" src="js/reportar.js"></script>
</body>
</html>
```

`public/js/reportar.js`

```js
// public/js/reportar.js — Módulo 1: formulario de reporte
import { api } from './api.js';
import { protegerPagina } from './sesion.js';

protegerPagina();

const PLANTEL = [25.7969, -100.3134];          // CAMBIAR por las coordenadas reales
const form = document.querySelector('#form-reporte');
const mensaje = document.querySelector('#mensaje');
let ubicacion = null;                          // { lat, lng }
let marcador = null;

const mapa = L.map('mapa').setView(PLANTEL, 16);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapa);

function marcar(lat, lng) {
  ubicacion = { lat, lng };
  if (marcador) marcador.setLatLng([lat, lng]);
  else marcador = L.marker([lat, lng]).addTo(mapa);
  mapa.setView([lat, lng], 17);
}

mapa.on('click', (e) => marcar(e.latlng.lat, e.latlng.lng));   // opción 1: tocar el mapa

document.querySelector('#usar-gps').addEventListener('click', () => {   // opción 2: GPS
  navigator.geolocation.getCurrentPosition(
    (pos) => marcar(pos.coords.latitude, pos.coords.longitude),
    () => alert('No se pudo obtener tu ubicación. Toca el mapa para marcarla.')
  );
});

function mostrar(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('error', esError);
  mensaje.classList.remove('oculto');
}

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!ubicacion) return mostrar('Marca en el mapa dónde ocurrió', true);
  const datos = Object.fromEntries(new FormData(form));
  try {
    await api('/reportes', {
      metodo: 'POST',
      datos: { ...datos, anonimo: datos.anonimo === 'on', ...ubicacion }
    });
    form.reset();
    mostrar('Gracias. Tu reporte será revisado por un moderador antes de aparecer en el mapa.');
  } catch (error) {
    mostrar(error.message, true);
  }
});
```

### 13.8 Módulo 2: alerta, configuración y contactos (S36–S38)

`public/inicio.html`

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Inicio · Seguridad Escolar</title>
  <link rel="stylesheet" href="css/estilos.css">
</head>
<body>
  <header><h1 id="saludo">Hola</h1><button id="salir" class="secundario" style="width:auto">Salir</button></header>
  <main>
    <button id="boton-alerta" type="button">
      MANTÉN PRESIONADO 2 s<br>PARA LLAMAR A LA POLICÍA
      <span class="progreso"></span>
    </button>
    <p id="estado-alerta" class="mensaje oculto"></p>
    <p><a id="enlace-911" href="tel:911">¿No contestan? Llamar al 911</a></p>
    <button id="avisar-contacto" class="secundario" type="button">Avisar a mi contacto por WhatsApp</button>

    <nav class="menu">
      <a href="reportar.html">Reportar incidente</a>
      <a href="mapa.html">Mapa de zonas</a>
      <a href="grupos.html">Caminemos juntos</a>
      <a href="perfil.html">Mis contactos</a>
    </nav>
  </main>
  <script type="module">
    import { protegerPagina, cerrarSesion } from './js/sesion.js';
    import { iniciarAlerta } from './js/alerta.js';

    const usuario = protegerPagina();
    document.querySelector('#saludo').textContent = `Hola, ${usuario.nombre}`;
    document.querySelector('#salir').addEventListener('click', cerrarSesion);
    iniciarAlerta();
  </script>
</body>
</html>
```

`public/js/alerta.js`

```js
// public/js/alerta.js — Módulo 2: botón de alerta
import { api } from './api.js';

const TIEMPO_MS = 2000;   // RN-08: mantener presionado 2 segundos

// Pide la ubicación, pero no espera más de 4 s: en una emergencia no se puede esperar
function obtenerUbicacion() {
  return new Promise((resolver) => {
    if (!navigator.geolocation) return resolver(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolver({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolver(null),                       // sin permiso → seguimos sin ubicación
      { enableHighAccuracy: true, timeout: 4000 }
    );
  });
}

async function dispararAlerta(telefono, estado) {
  estado.textContent = 'Abriendo llamada a la policía municipal...';
  estado.classList.remove('oculto');
  const ubicacion = await obtenerUbicacion();
  // Registrar la alerta NO debe impedir la llamada: si falla, se llama igual
  api('/alertas', { metodo: 'POST', datos: ubicacion ?? {} }).catch(() => {});
  location.href = `tel:${telefono}`;
}

export async function iniciarAlerta() {
  const boton = document.querySelector('#boton-alerta');
  const barra = boton.querySelector('.progreso');
  const estado = document.querySelector('#estado-alerta');
  const { telefono } = await api('/config/policia');
  let temporizador = null;

  const empezar = () => {
    barra.style.transition = `width ${TIEMPO_MS}ms linear`;
    barra.style.width = '100%';
    temporizador = setTimeout(() => dispararAlerta(telefono, estado), TIEMPO_MS);
  };
  const cancelar = () => {
    clearTimeout(temporizador);
    barra.style.transition = 'none';
    barra.style.width = '0';
  };

  boton.addEventListener('pointerdown', empezar);
  boton.addEventListener('pointerup', cancelar);       // soltó antes de 2 s
  boton.addEventListener('pointerleave', cancelar);    // deslizó el dedo fuera

  document.querySelector('#avisar-contacto').addEventListener('click', async () => {
    const [contacto] = await api('/contactos');
    if (!contacto) return alert('Primero agrega un contacto en "Mis contactos"');
    const ubicacion = await obtenerUbicacion();
    const liga = ubicacion ? ` Mi ubicación: https://maps.google.com/?q=${ubicacion.lat},${ubicacion.lng}` : '';
    const texto = encodeURIComponent(`Necesito ayuda, estoy cerca de la escuela.${liga}`);
    location.href = `https://wa.me/52${contacto.telefono}?text=${texto}`;
  });
}
```

`src/models/alerta.model.js`

```js
import pool from '../db/conexion.js';

export async function crear(usuarioId, lat, lng) {
  const { rows } = await pool.query(
    'INSERT INTO alertas (usuario_id, lat, lng) VALUES ($1, $2, $3) RETURNING *',
    [usuarioId, lat ?? null, lng ?? null]);
  return rows[0];
}

export async function listarDeHoy() {
  const { rows } = await pool.query(
    `SELECT a.*, u.nombre, u.grupo_escolar
     FROM alertas a JOIN usuarios u ON u.id = a.usuario_id
     WHERE a.creada_en::date = CURRENT_DATE
     ORDER BY a.creada_en DESC`);
  return rows;
}

export async function marcarAtendida(id) {
  const { rowCount } = await pool.query('UPDATE alertas SET atendida = TRUE WHERE id = $1', [id]);
  return rowCount;
}
```

`src/controllers/alertas.controller.js`

```js
import * as Alerta from '../models/alerta.model.js';

export async function crear(req, res) {
  const { lat, lng } = req.body ?? {};            // la ubicación es opcional
  const alerta = await Alerta.crear(req.usuario.id,
    typeof lat === 'number' ? lat : null,
    typeof lng === 'number' ? lng : null);
  res.status(201).json(alerta);
}

export async function deHoy(req, res) {
  res.json(await Alerta.listarDeHoy());
}

export async function atender(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || await Alerta.marcarAtendida(id) === 0) {
    return res.status(404).json({ error: 'Alerta no encontrada' });
  }
  res.json({ id, atendida: true });
}
```

`src/routes/alertas.routes.js`

```js
import { Router } from 'express';
import * as C from '../controllers/alertas.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);
router.post('/', C.crear);
router.get('/', soloRol('moderador'), C.deHoy);
router.patch('/:id', soloRol('moderador'), C.atender);
export default router;
```

`src/controllers/config.controller.js`

```js
import * as Config from '../models/config.model.js';

export async function leerPolicia(req, res) {
  res.json({ telefono: await Config.leer('telefono_policia') });
}

export async function guardarPolicia(req, res) {         // RN-09
  const { telefono } = req.body ?? {};
  if (!/^\d{10}$/.test(telefono ?? '')) {
    return res.status(400).json({ error: 'El teléfono debe tener 10 dígitos' });
  }
  await Config.guardar('telefono_policia', telefono);
  res.json({ telefono });
}
```

`src/routes/config.routes.js`

```js
import { Router } from 'express';
import * as C from '../controllers/config.controller.js';
import { verificarToken, soloRol } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);
router.get('/policia', C.leerPolicia);
router.put('/policia', soloRol('moderador'), C.guardarPolicia);
export default router;
```

`src/models/contacto.model.js`

```js
import pool from '../db/conexion.js';

export async function listar(usuarioId) {
  const { rows } = await pool.query(
    'SELECT id, nombre, telefono FROM contactos WHERE usuario_id = $1 ORDER BY id', [usuarioId]);
  return rows;
}

export async function crear(usuarioId, nombre, telefono) {
  const { rows } = await pool.query(
    'INSERT INTO contactos (usuario_id, nombre, telefono) VALUES ($1, $2, $3) RETURNING id, nombre, telefono',
    [usuarioId, nombre, telefono]);
  return rows[0];
}

// Solo borra si el contacto es del mismo usuario
export async function borrar(id, usuarioId) {
  const { rowCount } = await pool.query(
    'DELETE FROM contactos WHERE id = $1 AND usuario_id = $2', [id, usuarioId]);
  return rowCount;
}
```

`src/controllers/contactos.controller.js`

```js
import * as Contacto from '../models/contacto.model.js';

export async function listar(req, res) {
  res.json(await Contacto.listar(req.usuario.id));
}

export async function crear(req, res) {
  const { nombre, telefono } = req.body ?? {};
  if (!nombre || !/^\d{10}$/.test(telefono ?? '')) {
    return res.status(400).json({ error: 'Nombre y teléfono de 10 dígitos' });
  }
  if ((await Contacto.listar(req.usuario.id)).length >= 2) {
    return res.status(409).json({ error: 'Máximo 2 contactos de confianza' });
  }
  res.status(201).json(await Contacto.crear(req.usuario.id, nombre, telefono));
}

export async function borrar(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || await Contacto.borrar(id, req.usuario.id) === 0) {
    return res.status(404).json({ error: 'Contacto no encontrado' });
  }
  res.status(204).end();
}
```

`src/routes/contactos.routes.js`

```js
import { Router } from 'express';
import * as C from '../controllers/contactos.controller.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();
router.use(verificarToken);
router.get('/', C.listar);
router.post('/', C.crear);
router.delete('/:id', C.borrar);
export default router;
```

### 13.9 Módulo 3: Caminemos juntos (S39–S41)

`src/models/grupo.model.js`

```js
// src/models/grupo.model.js
import pool from '../db/conexion.js';

export async function puntosActivos() {
  const { rows } = await pool.query(
    'SELECT id, nombre, descripcion, lat, lng FROM puntos_encuentro WHERE activo = TRUE ORDER BY id');
  return rows;
}

export async function puntoExiste(id) {
  const { rowCount } = await pool.query(
    'SELECT id FROM puntos_encuentro WHERE id = $1 AND activo = TRUE', [id]);
  return rowCount > 0;
}

// RN-12: solo grupos de hoy. RN-14: integrantes solo con nombre y grupo escolar
export async function listarDeHoy() {
  const { rows: grupos } = await pool.query(`
    SELECT g.id, g.ruta, g.franja, g.cupo, p.nombre AS punto, p.lat, p.lng,
           COUNT(gi.usuario_id)::int AS integrantes
    FROM grupos g
    JOIN puntos_encuentro p ON p.id = g.punto_id
    LEFT JOIN grupo_integrantes gi ON gi.grupo_id = g.id
    WHERE g.fecha = CURRENT_DATE
    GROUP BY g.id, p.id
    ORDER BY g.franja, g.ruta`);

  for (const g of grupos) {
    const { rows } = await pool.query(
      `SELECT u.id, u.nombre, u.grupo_escolar FROM grupo_integrantes gi
       JOIN usuarios u ON u.id = gi.usuario_id WHERE gi.grupo_id = $1`, [g.id]);
    g.miembros = rows;
  }
  return grupos;
}

// Transacción: el grupo y su primer integrante se guardan juntos, o ninguno
export async function crear({ creadorId, puntoId, ruta, franja, cupo }) {
  const cliente = await pool.connect();          // una sola conexión para toda la transacción
  try {
    await cliente.query('BEGIN');
    const { rows } = await cliente.query(
      `INSERT INTO grupos (creador_id, punto_id, ruta, franja, cupo)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [creadorId, puntoId, ruta, franja, cupo]);
    const id = rows[0].id;
    await cliente.query(
      'INSERT INTO grupo_integrantes (grupo_id, usuario_id) VALUES ($1, $2)', [id, creadorId]);
    await cliente.query('COMMIT');
    return id;
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();                           // devuelve la conexión al pool
  }
}

// RN-10 y RN-11 dentro de una transacción. FOR UPDATE "aparta" el grupo:
// si dos alumnos se unen al mismo tiempo, el segundo espera a que termine el primero
export async function unirse(grupoId, usuarioId) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const { rows } = await cliente.query(
      'SELECT cupo FROM grupos WHERE id = $1 AND fecha = CURRENT_DATE FOR UPDATE', [grupoId]);
    const grupo = rows[0];
    if (!grupo) { await cliente.query('ROLLBACK'); return 'no-existe'; }

    const ya = await cliente.query(
      'SELECT 1 FROM grupo_integrantes WHERE grupo_id = $1 AND usuario_id = $2', [grupoId, usuarioId]);
    if (ya.rowCount > 0) { await cliente.query('ROLLBACK'); return 'ya-integrante'; }

    const { rows: conteo } = await cliente.query(
      'SELECT COUNT(*)::int AS n FROM grupo_integrantes WHERE grupo_id = $1', [grupoId]);
    if (conteo[0].n >= grupo.cupo) { await cliente.query('ROLLBACK'); return 'lleno'; }

    await cliente.query(
      'INSERT INTO grupo_integrantes (grupo_id, usuario_id) VALUES ($1, $2)', [grupoId, usuarioId]);
    await cliente.query('COMMIT');
    return 'ok';
  } catch (e) {
    await cliente.query('ROLLBACK');
    throw e;
  } finally {
    cliente.release();
  }
}

export async function salir(grupoId, usuarioId) {
  const { rowCount } = await pool.query(
    'DELETE FROM grupo_integrantes WHERE grupo_id = $1 AND usuario_id = $2', [grupoId, usuarioId]);
  return rowCount;
}
```

`src/controllers/grupos.controller.js`

```js
// src/controllers/grupos.controller.js
import * as Grupo from '../models/grupo.model.js';

export async function puntos(req, res) {
  res.json(await Grupo.puntosActivos());
}

export async function listar(req, res) {
  res.json(await Grupo.listarDeHoy());
}

export async function crear(req, res) {
  const { puntoId, ruta, franja, cupo } = req.body ?? {};
  if (!ruta || !['entrada', 'salida'].includes(franja)) {
    return res.status(400).json({ error: 'Indica la ruta y si es entrada o salida' });
  }
  if (!Number.isInteger(cupo) || cupo < 2 || cupo > 10) {           // RN-10
    return res.status(400).json({ error: 'El cupo debe ser de 2 a 10' });
  }
  if (!Number.isInteger(puntoId) || !(await Grupo.puntoExiste(puntoId))) {   // RN-13
    return res.status(400).json({ error: 'Elige un punto de encuentro de la lista' });
  }
  const id = await Grupo.crear({ creadorId: req.usuario.id, puntoId, ruta, franja, cupo });
  res.status(201).json({ id });
}

export async function unirse(req, res) {
  const id = Number(req.params.id);
  const resultado = Number.isInteger(id) ? await Grupo.unirse(id, req.usuario.id) : 'no-existe';
  const respuestas = {
    'no-existe':     [404, { error: 'El grupo no existe o ya caducó' }],
    'ya-integrante': [409, { error: 'Ya eres integrante de este grupo' }],
    'lleno':         [409, { error: 'El grupo está lleno' }],
    'ok':            [201, { mensaje: 'Te uniste al grupo' }]
  };
  const [codigo, cuerpo] = respuestas[resultado];
  res.status(codigo).json(cuerpo);
}

export async function salir(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || await Grupo.salir(id, req.usuario.id) === 0) {
    return res.status(404).json({ error: 'No estás en ese grupo' });
  }
  res.status(204).end();
}
```

`src/routes/grupos.routes.js`

```js
import { Router } from 'express';
import * as C from '../controllers/grupos.controller.js';
import { verificarToken } from '../middlewares/auth.js';

export const puntosRouter = Router().get('/', verificarToken, C.puntos);

const router = Router();
router.use(verificarToken);
router.get('/', C.listar);
router.post('/', C.crear);
router.post('/:id/unirse', C.unirse);
router.delete('/:id/unirse', C.salir);
export default router;
```

### 13.10 Pruebas rápidas con `curl` o Thunder Client

```bash
# Salud: servidor + base de datos
curl http://localhost:3000/api/salud

# Registro
curl -X POST http://localhost:3000/api/auth/registro -H "Content-Type: application/json" \
  -d '{"nombre":"Ana","matricula":"24001","grupoEscolar":"5A","password":"secreto123","codigo":"CBT2026"}'

# Login (copiar el token de la respuesta)
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" \
  -d '{"matricula":"24001","password":"secreto123"}'

# Ruta protegida
curl http://localhost:3000/api/auth/yo -H "Authorization: Bearer PEGA_AQUI_EL_TOKEN"
```

Las mismas pruebas sirven en producción cambiando `http://localhost:3000` por `https://SU-API.up.railway.app`.

Resultados esperados verificados: salud 200 con la hora de PostgreSQL · registro 201 · matrícula repetida 409 · código inválido 403 · contraseña corta 400 · JSON mal escrito 400 · contraseña incorrecta 401 · sin token 401 · alumno en ruta de moderador 403 · tercer contacto 409 · borrar contacto ajeno 404 · reporte nuevo `pendiente` · reporte sin ubicación 400 · mapa vacío antes de aprobar · mapa devuelve coordenadas redondeadas (25.797, -100.313) · filtro por tipo y franja · `?tipo=acoso' OR '1'='1` devuelve lista vacía · reporte anónimo sin nombre del autor en el panel · fechas como texto `2026-11-03` · alumno cambia teléfono de la policía 403 · alerta con y sin ubicación 201 · alertas de hoy · grupo con punto inexistente 400 · cupo 11 → 400 · unirse dos veces 409 · grupo lleno 409 (también con 7 peticiones simultáneas) · salir 204 · CORS permite el dominio de Vercel y bloquea otros · `/api-docs` 200.

---

## 14. Despliegue: Railway + Vercel

La etapa final del proyecto es publicar la app para que cualquiera la abra desde su celular. Se reparte en dos plataformas, como en muchos proyectos reales:

| Qué se publica | Dónde | Por qué ahí |
| --- | --- | --- |
| Frontend: la carpeta `public/` (HTML, CSS, JS) | **Vercel** | Son archivos estáticos: Vercel los entrega rápido desde su red (CDN) con HTTPS, gratis en el plan Hobby |
| Backend: el servidor Express (API + Swagger) | **Railway** | Necesita un proceso de Node encendido todo el tiempo |
| Base de datos: PostgreSQL | **Railway** (mismo proyecto que el backend) | La API se conecta por la red privada de Railway, sin salir a internet |

```mermaid
flowchart TB
  subgraph GH["GitHub · repo del equipo"]
    REPO["seguridad-escolar-equipoN<br/>server.js · src/ · public/"]
  end
  subgraph VER["Vercel (Root Directory = public)"]
    WEB["https://equipoN.vercel.app<br/>index.html · js/config.js ..."]
  end
  subgraph RW["Railway · proyecto del equipo"]
    API["Servicio web Node<br/>https://equipoN.up.railway.app<br/>/api · /api-docs"]
    PG[("PostgreSQL<br/>base: railway")]
    API -- "DATABASE_URL<br/>(red privada)" --> PG
  end
  CEL["📱 Celular"]
  PGA["🛠️ pgAdmin 4"]
  REPO -- "git push → despliega solo" --> WEB
  REPO -- "git push → despliega solo" --> API
  CEL -- "1. páginas" --> WEB
  CEL -- "2. fetch con JWT<br/>(CORS: FRONTEND_URL)" --> API
  PGA -. "DATABASE_PUBLIC_URL<br/>(TCP proxy)" .-> PG
```

**Orden obligatorio:** primero Railway (para conocer la URL de la API), luego Vercel (para conocer la URL del frontend) y al final se regresa a Railway a poner esa URL en `FRONTEND_URL`. Así cada lado sabe con quién hablar.

### 14.1 Cuentas y costos (revisado en octubre de 2026)

| Plataforma | Plan | Qué incluye | Para quién |
| --- | --- | --- | --- |
| Vercel | **Hobby** (gratis) | Sitios estáticos con HTTPS, despliegue desde GitHub | Cada equipo |
| Railway | **Trial** (prueba) | Crédito único de **5 USD**, válido hasta **30 días** o hasta gastarlo | Cada equipo, para la semana 7 |
| Railway | **Free** (al terminar la prueba) | 1 USD de crédito al mes; servicios muy limitados | No alcanza para tener API + base de datos encendidas todo el mes |
| Railway | **Hobby** | 5 USD al mes, incluye 5 USD de consumo | El docente (repositorio de referencia) o la escuela, si la app se queda en uso |

Implicaciones para la planeación:

- **No crear las cuentas de Railway antes de tiempo**: la prueba dura 30 días desde que se crea la cuenta. Crearlas en S42 deja margen de sobra hasta las presentaciones (S48–S49).
- Al entrar con GitHub, Railway hace una **verificación automática** de la cuenta. Las cuentas no verificadas quedan en *Limited Trial*: pueden desplegar código y bases de datos, pero con salida a internet restringida. Este proyecto no necesita salir a internet desde el servidor, así que funciona igual; aun así, crear la cuenta una sesión antes evita sorpresas.
- Cada equipo despliega **una sola vez** (un proyecto de Railway con dos servicios). No crear proyectos de prueba que consuman el crédito.
- Si un equipo no logra crear su cuenta de Railway, despliega su frontend en Vercel apuntando a la API del docente (cambiando solo `config.js`) y documenta el problema.

Fuentes de los planes: [Railway: planes](https://docs.railway.com/pricing/plans), [Railway: prueba gratuita](https://docs.railway.com/pricing/free-trial). Los precios cambian; revisarlos antes de la semana 7.

### 14.2 Backend y base de datos en Railway (S43)

**Antes de empezar:** el repositorio del equipo debe tener en GitHub el código final, con `package.json` (scripts `start` y `db:init`), `.env.example` y **sin** el archivo `.env`.

1. **Entrar:** [railway.com](https://railway.com) → *Login* → con GitHub. Autorizar el acceso a los repositorios del equipo.
2. **Crear el proyecto desde GitHub:** *New Project* → *Deploy from GitHub repo* → elegir `seguridad-escolar-equipoN`. Railway detecta Node (usa Railpack), ejecuta `npm install` y arranca con `npm start`. **El primer despliegue va a fallar** porque todavía no hay base de datos ni variables: es normal y es buen momento para enseñar a leer los *Deploy Logs*.
3. **Agregar PostgreSQL:** en el lienzo del proyecto, botón *+ Create* (o *+ New*) → *Database* → *PostgreSQL*. Aparece un segundo servicio llamado `Postgres`.
4. **Variables del servicio web:** clic en el servicio de la app → pestaña *Variables* → *Raw Editor* y pegar (con los valores del equipo):

   ```text
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRETO=una-frase-larga-distinta-a-la-del-taller
   CODIGO_REGISTRO=CBT2026
   TELEFONO_POLICIA=8100000000
   FRONTEND_URL=http://localhost:3000
   ```

   - `${{Postgres.DATABASE_URL}}` es una **variable de referencia**: Railway la reemplaza por la cadena de conexión interna de la base de datos. Si el servicio de base de datos tiene otro nombre, se usa ese nombre en lugar de `Postgres`.
   - `FRONTEND_URL` se deja temporalmente así; en 14.3 se cambia por la URL de Vercel.
   - **No** se define `PORT`: Railway lo pone solo y `server.js` ya lo lee (`process.env.PORT`).
   - Los cambios de variables quedan "en espera" hasta pulsar *Deploy* (Railway muestra el aviso de cambios pendientes).
5. **Crear las tablas en cada despliegue:** servicio web → *Settings* → sección *Deploy* → *Pre-deploy Command* → `npm run db:init`. Railway lo ejecuta antes de arrancar cada versión nueva, con las variables del servicio y dentro de la red privada; si falla, la versión nueva no se publica. Como `init.js` usa `IF NOT EXISTS` y `ON CONFLICT`, correrlo en cada despliegue no borra datos.
   - Alternativa si no encuentran la opción: *Settings* → *Deploy* → *Custom Start Command* → `npm run db:init && npm start`.
6. **Publicar la API:** servicio web → *Settings* → *Networking* → *Generate Domain*. Railway da una dirección como `https://seguridad-escolar-equipon-production.up.railway.app`.
7. **Verificar** en el navegador del celular:
   - `https://SU-API.up.railway.app/api/salud` → `{"ok":true,"hora":"..."}` (prueba servidor **y** base de datos).
   - `https://SU-API.up.railway.app/api-docs` → Swagger. Registrar un usuario desde ahí.
   - Dato útil: como Express también sirve `public/`, la app completa abre en `https://SU-API.up.railway.app` aunque Vercel no esté listo. Sirve como plan B para la presentación.

### 14.3 Frontend en Vercel (S44)

1. **Apuntar el frontend a la API:** en `public/js/config.js`, cambiar `https://CAMBIAR-POR-SU-API.up.railway.app/api` por la URL real de Railway **terminada en `/api`**. Commit y push.
2. **Entrar:** [vercel.com](https://vercel.com) → *Sign Up* → con GitHub → plan **Hobby**.
3. **Importar el repositorio:** *Add New...* → *Project* → *Import* en `seguridad-escolar-equipoN`.
4. **Configurar antes de desplegar** (pantalla *Configure Project*):
   - *Framework Preset*: **Other**.
   - *Root Directory*: *Edit* → elegir **`public`**. Así Vercel solo publica las páginas y no intenta ejecutar el servidor de Express (que vive en Railway).
   - No hace falta *Build Command* ni variables de entorno.
5. **Deploy.** Vercel da una dirección como `https://seguridad-escolar-equipon.vercel.app`.
6. **Autorizar a Vercel en la API (CORS):** regresar a Railway → servicio web → *Variables* → `FRONTEND_URL` = la URL de Vercel, **sin diagonal al final** (por ejemplo `https://seguridad-escolar-equipon.vercel.app`). Pulsar *Deploy*. Si también quieren probar en local contra Railway, pueden poner varias separadas por coma: `https://seguridad-escolar-equipon.vercel.app,http://localhost:3000`.
7. **Probar desde celulares reales:** abrir la URL de Vercel → registro → login → reportar con GPS → aprobar como moderador → ver el mapa → botón de alerta → grupos.

Vercel crea también direcciones de "vista previa" (*preview*) para cada rama; esas tienen otro dominio y **CORS las bloqueará**. Para el proyecto se usa solo la dirección de producción.

### 14.4 pgAdmin 4 conectado a la base de datos de Railway (S43)

1. En Railway, clic en el servicio `Postgres` → *Variables*: copiar `DATABASE_PUBLIC_URL`. Si no aparece, activar el acceso público en *Settings* → *Networking* (Railway crea un *TCP Proxy* y genera esa variable).
2. La cadena tiene esta forma: `postgresql://postgres:CONTRASEÑA@SERVIDOR.proxy.rlwy.net:PUERTO/railway`.
3. En pgAdmin 4: clic derecho en *Servers* → *Register* → *Server...*
   - Pestaña *General* → *Name*: `Railway equipo N`.
   - Pestaña *Connection* → *Host name/address*: `SERVIDOR.proxy.rlwy.net` · *Port*: el `PUERTO` de la cadena · *Maintenance database*: `railway` · *Username*: `postgres` · *Password*: la `CONTRASEÑA` de la cadena (marcar *Save password* solo en computadoras personales, nunca en las del taller).
4. *Save* → *Databases* → `railway` → *Schemas* → *public* → *Tables*: deben aparecer las 8 tablas que creó el *pre-deploy*.
5. Desde aquí se hacen en producción las mismas tareas del taller: ver reportes, convertir un usuario en moderador con el Query Tool, revisar alertas.

Advertencias para el grupo: la conexión pública usa la red de Railway y **consume crédito** (tráfico de salida), así que se abre para revisar y se cierra; y esa cadena es una **llave maestra** de la base de datos: no se sube a GitHub, no se pega en el chat del grupo ni en la documentación (en las capturas se tapa).

### 14.5 Después del despliegue

- **Despliegue continuo:** cada `git push` a la rama principal vuelve a publicar Railway y Vercel solos. Para corregir un error encontrado en S45: arreglar en local → probar → commit → push → esperar 1–2 minutos.
- **Ver errores en producción:** Railway → servicio web → *Deployments* → *View logs* (ahí aparece todo lo que el servidor escribe con `console.error`). En el celular, los errores del frontend se ven conectándolo a la computadora o probando primero en la computadora con DevTools.
- **Cambiar el número de la policía en producción:** desde la app como moderador (`PUT /api/config/policia`) o desde pgAdmin conectado a Railway.
- **Al cerrar el curso:** si la app no se va a usar con alumnos reales, el docente acuerda con los equipos eliminar el proyecto de Railway (*Settings* → *Danger* → eliminar) para no consumir crédito ni conservar datos. Si dirección decide usarla de verdad, se mantiene **un solo** despliegue (el del docente, en el plan Hobby) con aviso de privacidad aprobado.

### 14.6 Problemas frecuentes al desplegar

| Síntoma | Causa más común | Solución |
| --- | --- | --- |
| En Railway: *Application failed to respond* | El servidor escucha en un puerto fijo o no arrancó | Usar `process.env.PORT` (ya está en `server.js`) y revisar *Deploy Logs* |
| `/api/salud` responde 500 o los logs dicen `ECONNREFUSED 127.0.0.1:5432` | `DATABASE_URL` no está definida o se escribió a mano con `localhost` | Usar exactamente `${{Postgres.DATABASE_URL}}` y volver a desplegar |
| Logs: `relation "usuarios" does not exist` | No corrió `npm run db:init` | Configurar el *Pre-deploy Command* (14.2, paso 5) y volver a desplegar |
| Logs: `password authentication failed` | Se copió mal la contraseña o se mezcló la cadena del taller | Volver a la variable de referencia; no copiar cadenas a mano |
| En el navegador: *blocked by CORS policy* | `FRONTEND_URL` no coincide con la URL de Vercel (falta, tiene `/` al final, es una URL de *preview* o es `http` en vez de `https`) | Corregir `FRONTEND_URL` en Railway y pulsar *Deploy* |
| En el navegador: 404 en `/api/...` desde Vercel | `config.js` todavía dice `CAMBIAR-POR-SU-API` o le falta `/api` al final | Corregir `config.js`, commit y push |
| Vercel muestra 404 en la página principal | *Root Directory* no es `public` | Vercel → *Settings* → *Build and Deployment* → *Root Directory* = `public` → *Redeploy* |
| El login funciona en la computadora pero no en el celular | El celular abre la URL de Railway o de *preview* en vez de la de producción de Vercel | Compartir solo la URL de producción de Vercel |
| El GPS no pide permiso | La página se abrió con `http://` | Abrir siempre con `https://` (Vercel y Railway lo dan) |
| Los grupos de la tarde "desaparecen" | La conexión no tiene la zona horaria | Revisar la línea `options: '-c TimeZone=America/Monterrey'` de `conexion.js` |
| Railway deja de responder a mitad de la semana | Se terminó el crédito de la prueba | Revisar *Usage* en Railway; usar la API del docente como respaldo |

---

## 15. Entregas y evaluación

| Sesión | Entrega | Contenido | Peso |
| --- | --- | --- | --- |
| 7 | Entrega 1 | Capítulos 1 y 2 (introducción, investigación con datos propios) | 10% |
| 14 | Entrega 2 | Capítulo 3 (análisis, requerimientos, reglas, diagramas de flujo) + wireframes | 10% |
| 21 | Entrega 3 | Capítulo 4.1–4.4 (arquitectura, stack, patrones, ER) | 10% |
| 28 | Demo 1 | Registro, login, perfil y Swagger funcionando en su repo, con datos visibles en pgAdmin | 5% |
| 35 | Demo 2 | Módulo 1 funcionando en su repo | 10% |
| 42 | Demo 3 | Módulos 2 y 3 funcionando en su repo | 10% |
| 46 | Documento final | Todos los capítulos (incluido 4.8 Despliegue), pruebas, manual y conclusiones | 20% |
| 48–49 | Presentación | Exposición con demo en vivo desde la app **publicada en Vercel + Railway** | 15% |
| Todo el periodo | Bitácora, commits y coevaluación | Bitácora semanal, commits de todos, coevaluación | 10% |

**Resumen de pesos:** documentación 50% (entregas 1–3 + documento final) · funcionamiento 25% · presentación 15% · proceso 10%.

### Rúbrica de la documentación final

| Criterio | Excelente (10) | Suficiente (7) | Insuficiente (5) |
| --- | --- | --- | --- |
| Investigación del problema | Datos propios (encuesta y entrevista) con gráficas, croquis y análisis | Datos propios sin análisis | Información genérica de internet |
| Justificación y objetivos | Justificación apoyada en sus datos; objetivos medibles por módulo | Justificación general | Copiada o ausente |
| Análisis | Requerimientos, historias, reglas de negocio y 4 diagramas de flujo coherentes | Faltan algunos elementos | Muy incompleto |
| Diseño técnico | Arquitectura, ER (propio y el generado en pgAdmin) y patrones explicados **con ejemplos de su propio código** | Diagramas correctos pero explicación genérica | Diagramas faltantes o incorrectos |
| Conceptos | Explican con sus palabras MVC, middleware, JWT, hash, REST, pool de conexiones y transacción | Definiciones copiadas | Ausentes |
| API y Swagger | Swagger completo, coincide con la API, capturas de pruebas | Swagger incompleto | Sin Swagger |
| Seguridad y privacidad | Explican hash, JWT, roles, secretos fuera del repositorio y por qué no se muestran ubicaciones exactas ni nombres | Mencionan algunos | Ausente |
| Despliegue | Diagrama propio de qué vive en Vercel y qué en Railway; explican variables de entorno y CORS; ligas funcionando | Ligas funcionando con explicación mínima | Sin despliegue o sin explicación |
| Pruebas y manual | Casos de prueba con resultado; manual con capturas desde celular sobre la app publicada | Uno de los dos completo | Ausentes |
| Redacción y formato | Ortografía cuidada, APA, índice, numeración | Errores menores | Desorden notable |

### Rúbrica de las demos

| Criterio | Sí (2) | Parcial (1) | No (0) |
| --- | --- | --- | --- |
| El proyecto corre con `npm run dev` contra su PostgreSQL local | | | |
| Cumple el criterio de "terminado" del módulo | | | |
| Swagger actualizado con los endpoints del módulo | | | |
| Commits de todos los integrantes en la semana | | | |
| El piloto explica qué hace un archivo elegido por el docente | | | |

---

## 16. Riesgos y lista de verificación del docente

| Riesgo | Prevención |
| --- | --- |
| Equipos que se atrasan en la práctica guiada | Repo de referencia con una rama por semana; al inicio de la siguiente sesión pueden copiar lo faltante |
| Computadoras del taller sin Node 22.9+ | Verificar en la semana 0; instalar Node 24 LTS o usar GitHub Codespaces como alternativa |
| PostgreSQL no se puede instalar en el taller (permisos de administrador) | Pedir la instalación a soporte en la semana 0. Plan B: los equipos sin PostgreSQL local usan una base de datos de Railway desde S19 (cambia solo `DATABASE_URL`), sabiendo que consume su crédito de prueba antes de tiempo |
| Cada computadora tiene una contraseña distinta de `postgres` | Usar la misma contraseña de taller en todas al instalar y anotarla en el pizarrón el día de S15; cada equipo la pone en su `.env` |
| Bloqueo de red escolar a npm, GitHub, Railway o Vercel | Probar `npm install`, `github.com`, `railway.com` y `vercel.com` desde el taller antes de S15 y S43; tener paquetes en USB (`npm pack`); como último recurso, desplegar desde la red de un celular |
| El GPS no funciona en el celular | Solo funciona con HTTPS: túnel (`npx cloudflared tunnel --url http://localhost:3000`) en la semana 5 y Vercel/Railway en la semana 7 |
| Errores de CORS al desplegar | Tabla 14.6; practicar el error a propósito en S44 para que lo reconozcan |
| Se acaba el crédito de Railway o la cuenta queda en *Limited Trial* | Crear cuentas en S42, no antes; un solo proyecto por equipo; la API del docente (plan Hobby) como respaldo |
| Un equipo sube su `.env` o la `DATABASE_PUBLIC_URL` a GitHub | `.gitignore` desde S15; revisar los repos en cada demo; si pasa, cambiar `JWT_SECRETO` y regenerar la contraseña de la base en Railway |
| Número de policía equivocado | Dirección confirma el número directo con la policía municipal antes de S36; se captura desde el panel o pgAdmin |
| Reportes o alertas falsos durante pruebas | Usar datos de prueba; explicar que en producción todo queda ligado a una cuenta |
| Datos personales de menores | No usar la app con datos reales sin aval de dirección y aviso de privacidad; eliminar los proyectos de Railway al cierre si no se usarán (14.5) |
| Documentación copiada entre equipos | La rúbrica premia ejemplos de **su** código, sus datos, sus capturas y sus ligas |

**Antes de empezar (semana 0):**

- [ ] Node 22.9+ instalado en las computadoras del taller (`node -v`); recomendado 24 LTS
- [ ] **PostgreSQL 16 o superior con pgAdmin 4** instalado en cada computadora del taller (el instalador oficial para Windows incluye pgAdmin 4), con la misma contraseña para el usuario `postgres`
- [ ] Servicio de PostgreSQL configurado para iniciar con Windows (o explicar cómo iniciarlo)
- [ ] VS Code con extensiones: Thunder Client, Live Server (opcional)
- [ ] Cuenta de GitHub para cada alumno
- [ ] Repositorio de referencia del docente creado
- [ ] Cuenta del docente en Railway (plan Hobby recomendado) y en Vercel (Hobby)
- [ ] Coordenadas reales del plantel y de 2–3 puntos de encuentro
- [ ] Permiso de dirección para aplicar la encuesta
- [ ] Número directo de la policía municipal confirmado por dirección
- [ ] Documento para alumnos impreso o compartido

**Antes de la semana 7:**

- [ ] Despliegue de referencia del docente funcionando (Railway + Vercel)
- [ ] Revisar precios y condiciones vigentes de Railway y Vercel
- [ ] Probar desde la red del taller que `railway.com`, `vercel.com` y los dominios `*.up.railway.app` y `*.vercel.app` abren
- [ ] Cuentas de Railway y Vercel de cada equipo creadas en S42

**Cada semana:**

- [ ] Subir la rama `semana-N` del repo de referencia
- [ ] Revisar bitácoras y commits de cada equipo
- [ ] Ajustar el ritmo: si más de la mitad no terminó el bloque, la siguiente sesión empieza con 10 minutos de nivelación
