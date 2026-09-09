# Estudio de Obra

App móvil (Expo/React Native) de uso personal para una diseñadora de
interiores que trabaja en obra (visitas a clientes, medición, seguimiento
de proyectos). Pensada para funcionar bien con conexión inestable o sin
conexión, porque se usa dentro de obras en construcción.

Guarda todo localmente en el dispositivo (SQLite vía `expo-sqlite`) — sin
backend ni cuentas.

## Probarla

```bash
npm install
npx expo prebuild
npx expo run:ios      # o: npx expo run:android
```

⚠️ Ya **no** se puede probar con la app Expo Go — el módulo de
transcripción de voz requiere un *development build* propio (ver detalle
en [`PROPUESTA.md`](./PROPUESTA.md)). Después del primer build, `npx expo
start` sirve para seguir desarrollando con recarga en caliente. Usa Node
18 o 20.

## Qué tiene hasta ahora

Los 6 módulos del pedido original están construidos:

- **Clientes / proyectos**: ficha por cliente (nombre, dirección de obra,
  contacto, notas, estado del proyecto) — listar, crear, ver, editar,
  eliminar.
- **Pinturas**: por cliente y área (catálogo fijo) — marca, color,
  acabado, nota. Filtro por área.
- **Materiales y acabados**: por cliente — tipo, referencia, proveedor,
  detalle. Filtro por tipo.
- **Notas de campo**: foto, video, nota de voz (con transcripción
  automática *on-device*, mejor esfuerzo) o texto — reproducibles desde la
  ficha de la nota.
- **Pendientes**: título, prioridad, fecha opcional con recordatorio real
  en el calendario nativo del teléfono. Marcar como hecho, archivar.
- **Medidas estándar**: biblioteca de referencia fija y buscable (alturas
  y distancias típicas de diseño de interiores), ~34 medidas con buscador
  por palabra clave, accesible desde la lista de clientes.

Ver el detalle completo de la estructura de carpetas, el modelo de datos
SQLite, cómo funciona la grabación/transcripción de notas de voz, y qué
falta, en [`PROPUESTA.md`](./PROPUESTA.md).

## Diseño visual

Estilo cálido y editorial: fondo tipo papel (`#FAF7F1`), tinta oscura
(`#2A2823`), acento terracota (`#A85C3B`) y azul (`#34556B`) como
secundario. Tipografía serif — Fraunces para títulos, Source Serif 4 para
cuerpo. Botones grandes y poco texto pequeño, pensado para usarse con una
mano, en obra, con el teléfono a veces sucio o con guantes.
