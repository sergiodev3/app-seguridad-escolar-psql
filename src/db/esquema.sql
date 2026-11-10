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
