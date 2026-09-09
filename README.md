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
npx expo start
```

Escanea el código QR con la app **Expo Go** en tu teléfono (usa Node 18 o
20; ver nota en `PROPUESTA.md` si usas Node 22).

## Qué tiene hasta ahora

- **Clientes / proyectos**: ficha por cliente (nombre, dirección de obra,
  contacto, notas, estado del proyecto) — listar, crear, ver, editar,
  eliminar. ✅ Construido.
- **Pinturas**, **Materiales y acabados**, **Notas de campo** (foto,
  video, voz con transcripción automática on-device, texto) y
  **Pendientes** (con recordatorio en el calendario nativo): módulos
  planeados, con el modelo de datos ya definido — construcción pendiente.
- **Medidas estándar**: biblioteca de referencia fija y buscable (alturas
  y distancias típicas de diseño de interiores), con ~34 medidas ya
  pobladas.

Ver el detalle completo de la estructura de carpetas, el modelo de datos
SQLite y las notas de viabilidad técnica (transcripción de voz, cámara,
calendario) en [`PROPUESTA.md`](./PROPUESTA.md).

## Diseño visual

Estilo cálido y editorial: fondo tipo papel (`#FAF7F1`), tinta oscura
(`#2A2823`), acento terracota (`#A85C3B`) y azul (`#34556B`) como
secundario. Tipografía serif — Fraunces para títulos, Source Serif 4 para
cuerpo. Botones grandes y poco texto pequeño, pensado para usarse con una
mano, en obra, con el teléfono a veces sucio o con guantes.
