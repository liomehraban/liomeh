-- Textos en inglés para el locale `en` (mismo patrón que mercados.lema_en / resumen_en).
-- Si una columna *_en viene vacía, la app muestra el texto en español.

alter table zonas_huerto add column nombre_en text, add column cultivos_en text[], add column descripcion_en text;

alter table productores
  add column temporada_en text, add column practicas_en text[],
  add column venta_minima_en text, add column entrega_en text;

alter table eventos add column titulo_en text, add column descripcion_en text;

alter table rutas add column titulo_en text, add column incluye_en text;
