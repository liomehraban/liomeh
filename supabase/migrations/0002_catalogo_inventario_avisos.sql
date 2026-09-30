-- Bara Bara · 0002: catálogo, inventario, avisos, reservas, planes y vistas agregadas.
-- Refleja lo que la demo hoy simula en localStorage (src/store/useAppStore.ts) y en src/lib
-- (catalogo-simulado.ts, inventario.ts, notificaciones.ts). No se conecta en esta etapa.

-- ---------- catálogo ----------
-- Puestos de la guía vs. puestos dados de alta en la app (la demo los simula por mercado).
alter table puestos add column if not exists real_segun_guia boolean not null default false;
alter table puestos add column if not exists activo boolean not null default true;
create index if not exists puestos_mercado on puestos (mercado_id) where activo;
create index if not exists productos_puesto on productos (puesto_id) where activo;

-- ---------- inventario ----------
-- Existencia por producto y día: se surte al abrir y baja con cada venta (app o mostrador).
create table inventario (
  producto_id bigint not null references productos(id) on delete cascade,
  dia date not null default ((now() at time zone 'America/Mexico_City')::date),
  inicial int not null check (inicial >= 0),
  vendido int not null default 0 check (vendido >= 0),
  pausado boolean not null default false,          -- el locatario lo marcó «no disponible»
  updated_at timestamptz not null default now(),
  primary key (producto_id, dia),
  check (vendido <= inicial)
);

-- Descuenta existencia de forma atómica (llamar dentro de la transacción del pedido).
create or replace function descontar_inventario(p_producto bigint, p_cantidad int)
returns int language plpgsql as $$
declare restante int;
begin
  update inventario
     set vendido = vendido + p_cantidad, updated_at = now()
   where producto_id = p_producto
     and dia = (now() at time zone 'America/Mexico_City')::date
     and not pausado
     and inicial - vendido >= p_cantidad
  returning inicial - vendido into restante;
  if restante is null then raise exception 'sin_existencia' using errcode = 'P0001'; end if;
  return restante;
end $$;

-- ---------- avisos (notificaciones) ----------
create type tipo_aviso as enum ('bienvenida','pedido','evento','rescate','surtido','checkin','nuevoPedido','stock','cobro','mayoreo','lote','impacto');
create table avisos (
  id text primary key,                              -- clave de dedupe (no se repite un aviso)
  usuario_id uuid not null references perfiles(id) on delete cascade,
  perfil rol not null,                              -- bandeja por perfil (consumidor, locatario…)
  tipo tipo_aviso not null,
  clave text not null,                              -- messages: notificaciones.avisos.<clave>
  params jsonb not null default '{}',
  href text,
  leida boolean not null default false,
  created_at timestamptz not null default now()
);
create index avisos_bandeja on avisos (usuario_id, perfil, created_at desc);

-- ---------- reservas ----------
create table reservas_tour (
  id bigserial primary key, folio text unique not null,
  usuario_id uuid not null references perfiles(id) on delete cascade,
  ruta_id text not null references rutas(id),
  fecha date not null, personas int not null check (personas between 1 and 20), total int not null check (total >= 0),
  estado text not null default 'confirmada' check (estado in ('confirmada','cancelada','realizada')),
  created_at timestamptz not null default now()
);
create table reservas_visita (
  id bigserial primary key, folio text unique not null,
  usuario_id uuid not null references perfiles(id) on delete cascade,
  productor_id text not null references productores(id),
  fecha date not null, personas int not null check (personas between 1 and 20), total int not null check (total >= 0),
  estado text not null default 'confirmada' check (estado in ('confirmada','cancelada','realizada')),
  created_at timestamptz not null default now()
);

-- ---------- planes (consumidor: Pase Turista, Mercado+ · locatario: Pro, Plus) ----------
create table suscripciones (
  id bigserial primary key,
  usuario_id uuid not null references perfiles(id) on delete cascade,
  plan text not null check (plan in ('Pase Turista','Mercado+','Pro','Plus')),  -- consumidor · locatario
  inicia timestamptz not null default now(),
  vence timestamptz,                                -- Pase Turista: 7 días
  pago_id bigint references pagos(id),
  created_at timestamptz not null default now()
);
create index suscripciones_vigentes on suscripciones (usuario_id, vence desc);

-- ---------- rescate: compra con folio ----------
alter table rescates add column if not exists pedido_id bigint references pedidos(id);
alter table pedidos add column if not exists kg_rescatados numeric default 0;

-- ---------- vistas agregadas (Repository: ratings, puestosEnLinea, productosPorMercado) ----------
create or replace view ratings_objetivo as
  select objetivo_id, round(avg(estrellas)::numeric, 1) as promedio, count(*)::int as total
    from resenas group by objetivo_id;

create or replace view puestos_en_linea as
  select p.*, to_jsonb(m) as mercado
    from puestos p join mercados m on m.id = p.mercado_id
    join interiores i on i.mercado_id = m.id
   where p.activo;

create or replace view productos_por_mercado as
  select pu.mercado_id, array_agg(distinct pr.nombre order by pr.nombre) as productos
    from productos pr join puestos pu on pu.id = pr.puesto_id
   where pr.activo and pu.activo
   group by pu.mercado_id;

-- ---------- RLS ----------
alter table inventario enable row level security;
create policy "inventario público" on inventario for select using (true);
create policy "inventario del locatario" on inventario for update using (
  exists (select 1 from productos pr join puestos pu on pu.id = pr.puesto_id where pr.id = inventario.producto_id and pu.owner_id = auth.uid())
);
alter table avisos enable row level security;
create policy "avisos propios" on avisos for select using (auth.uid() = usuario_id);
create policy "marcar leídos" on avisos for update using (auth.uid() = usuario_id);
alter table reservas_tour enable row level security;
create policy "reservas de tour propias" on reservas_tour for all using (auth.uid() = usuario_id);
alter table reservas_visita enable row level security;
create policy "reservas de visita propias" on reservas_visita for all using (auth.uid() = usuario_id);
create policy "visitas del productor" on reservas_visita for select using (
  exists (select 1 from productores p where p.id = reservas_visita.productor_id and p.owner_id = auth.uid())
);
alter table suscripciones enable row level security;
create policy "suscripciones propias" on suscripciones for select using (auth.uid() = usuario_id);
