-- Pásele · esquema inicial (FUTURO: no se conecta en la etapa mock)
-- Postgres + PostGIS en Supabase. Refleja los contratos de src/lib/schemas.ts.

create extension if not exists postgis;
create extension if not exists unaccent;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;

-- ---------- catálogo territorial ----------
create table alcaldias (
  id smallserial primary key,
  nombre text unique not null,
  geom geometry(MultiPolygon, 4326)
);

create type precision_ubicacion as enum ('punto','colonia','aproximada');

create table mercados (
  id text primary key,                         -- slug, ej. 'la-merced'
  numero text,                                 -- número oficial (puede repetirse en la guía)
  nombre text not null,
  nombre_display text not null,
  alcaldia text not null,
  direccion text not null,
  colonia text,
  cp text,
  ubicacion geography(Point, 4326) not null,
  precision_ubicacion precision_ubicacion not null default 'colonia',
  categoria_guia text,
  tipos text[] not null default '{}',
  giros text[] not null default '{}',
  destacado boolean not null default false,
  lema text, lema_en text, resumen text, resumen_en text, historia text,
  horario jsonb,                               -- {texto, abre, cierra, dias[]}
  imperdibles text[], transporte text[],
  cifras jsonb, extra jsonb,                   -- sub_mercados, fiesta, programas, etc.
  interior_disponible boolean not null default false,
  fuente text,
  created_at timestamptz default now()
);
create index mercados_geo on mercados using gist (ubicacion);
-- wrapper IMMUTABLE para poder indexar la búsqueda sin acentos
create or replace function f_busqueda(nombre text, alcaldia text, giros text[]) returns text
  language sql immutable parallel safe as
  $$ select lower(public.unaccent('public.unaccent'::regdictionary, coalesce(nombre,'') || ' ' || coalesce(alcaldia,'') || ' ' || array_to_string(coalesce(giros,'{}'),' '))) $$;
create index mercados_busqueda on mercados using gin (f_busqueda(nombre_display, alcaldia, giros) gin_trgm_ops);

-- ---------- interior ----------
create table interiores (
  mercado_id text primary key references mercados(id) on delete cascade,
  lienzo jsonb not null, edificios jsonb not null, calles jsonb not null, accesos jsonb not null, grafo jsonb not null,
  version int not null default 1, updated_at timestamptz default now()
);

create type plan_locatario as enum ('Gratis','Pro','Plus');

create table puestos (
  id text primary key,
  mercado_id text not null references mercados(id) on delete cascade,
  nombre text not null, giro text not null, edificio text, nodo_cercano text,
  ubicacion_texto text, local text, x real, y real,
  horario_texto text, acepta text[] default '{QR CoDi/SPEI,Tarjeta,Efectivo}',
  sello_comercio_justo boolean default false, plan plan_locatario default 'Gratis',
  owner_id uuid references auth.users(id),     -- locatario
  qr_checkin_token text unique default encode(gen_random_bytes(12),'hex'),
  created_at timestamptz default now()
);

create table productos (
  id bigserial primary key,
  puesto_id text references puestos(id) on delete cascade,
  productor_id text,                           -- si es lote de productor
  nombre text not null, precio_mxn int not null check (precio_mxn >= 0), unidad text not null,
  origen_texto text, huerto_id text,
  activo boolean default true
);

-- ---------- huertos ----------
create table zonas_huerto (
  id text primary key, nombre text not null, alcaldia text not null,
  centro geography(Point,4326), poligono geometry(Polygon,4326), cultivos text[], descripcion text
);

create table productores (
  id text primary key, nombre text not null, titular text, pueblo text, alcaldia text,
  zona_id text references zonas_huerto(id), ubicacion geography(Point,4326),
  producto_principal text, temporada text, practicas text[],
  precio_mayoreo jsonb, comercio_justo jsonb,   -- ver schemas.ts
  venta_minima text, entrega text, visitas_huerto boolean default false, precio_visita int,
  owner_id uuid references auth.users(id)
);
alter table productos add constraint productos_productor_fk foreign key (productor_id) references productores(id);

-- ---------- agenda y rutas ----------
create table eventos (
  id text primary key, titulo text not null, inicio date, fin date, recurrente boolean default false,
  lugar text, ubicacion geography(Point,4326), categoria text, descripcion text,
  fecha_confirmada boolean default true, mercado_id text references mercados(id)
);
create table rutas (
  id text primary key, titulo text not null, paradas text[] not null, duracion_h numeric, km numeric,
  tipo text check (tipo in ('gratis','premium')), precio_guiada int, incluye text
);

-- ---------- usuarios, pedidos, pagos ----------
create type rol as enum ('consumidor','locatario','productor','gobierno','admin');
create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text, rol rol not null default 'consumidor', idioma text default 'es',
  plan text default 'Gratis', puntos int default 0, created_at timestamptz default now()
);

create type estado_pedido as enum ('nuevo','pagado','preparando','listo','en_ruta','entregado','cancelado');
create type tipo_entrega as enum ('recoger','terceros','mayoreo_recoger','mayoreo_envio');
create table pedidos (
  id bigserial primary key, folio text unique not null,
  cliente_id uuid references perfiles(id), puesto_id text references puestos(id), productor_id text references productores(id),
  items jsonb not null, subtotal int not null, tarifa_servicio int default 0, envio int default 0, total int not null,
  entrega tipo_entrega not null, proveedor_envio text, estado estado_pedido not null default 'nuevo',
  qr_recogida text, created_at timestamptz default now()
);
create type metodo_pago as enum ('codi_spei','tarjeta','efectivo_checkin');
create table pagos (
  id bigserial primary key, pedido_id bigint references pedidos(id), puesto_id text references puestos(id),
  metodo metodo_pago not null, monto int not null, comision int default 0, referencia_externa text,
  estado text default 'pendiente', created_at timestamptz default now()
);

-- ---------- lealtad y reseñas ----------
create table checkins (
  id bigserial primary key, usuario_id uuid references perfiles(id), puesto_id text references puestos(id),
  mercado_id text references mercados(id), puntos int not null default 10, created_at timestamptz default now()
);
create unique index checkin_un_dia on checkins (usuario_id, puesto_id, ((created_at at time zone 'America/Mexico_City')::date));
create table sellos (usuario_id uuid references perfiles(id), mercado_id text references mercados(id), created_at timestamptz default now(), primary key (usuario_id, mercado_id));
create table movimientos_puntos (id bigserial primary key, usuario_id uuid references perfiles(id), motivo text, puntos int, ref text, created_at timestamptz default now());
create table resenas (
  id bigserial primary key, objetivo_tipo text check (objetivo_tipo in ('mercado','puesto','productor')), objetivo_id text not null,
  autor_id uuid references perfiles(id), idioma text, estrellas smallint check (estrellas between 1 and 5), texto text,
  verificada text check (verificada in ('compra','check-in QR')), fotos text[], created_at timestamptz default now()
);

-- ---------- rescate de alimentos ----------
create table rescates (
  id bigserial primary key, puesto_id text references puestos(id), producto text, cantidad numeric, unidad text,
  precio_original int, precio_rescate int, donable boolean default true, vence timestamptz, kg_estimados numeric,
  estado text default 'disponible', created_at timestamptz default now()
);

-- ---------- RLS (esqueleto) ----------
alter table perfiles enable row level security;
alter table pedidos enable row level security;
alter table pagos enable row level security;
alter table checkins enable row level security;
alter table resenas enable row level security;
create policy "perfil propio" on perfiles for all using (auth.uid() = id);
create policy "pedidos del cliente" on pedidos for select using (auth.uid() = cliente_id);
create policy "pedidos del locatario" on pedidos for select using (exists (select 1 from puestos p where p.id = pedidos.puesto_id and p.owner_id = auth.uid()));
create policy "reseñas públicas" on resenas for select using (true);
create policy "reseña propia" on resenas for insert with check (auth.uid() = autor_id);
-- Lectura pública del catálogo:
alter table mercados enable row level security; create policy "lectura pública" on mercados for select using (true);
alter table puestos enable row level security;  create policy "lectura pública" on puestos for select using (true);
