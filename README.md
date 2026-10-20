# Truco Argentino 🃏

Truco argentino mano a mano contra la máquina, en el navegador. Cinco rivales ficticios, uno por nivel, cada uno con su forma de jugar y su manera de hablar.

**Jugar:** https://jonatanquiro.github.io/truco-argentino/

Se puede **instalar como app (PWA)** y jugar **sin conexión**: en el celu, abrí el link y elegí *Agregar a la pantalla de inicio* / *Instalar app*; en la compu, el ícono de instalar en la barra de direcciones (o el botón *Instalar app* del menú). Después de la primera carga funciona sin internet.

## Modos

- **Carrera:** 16 rivales en orden, del almacén del barrio a Mandinga. Ganale a cada uno para desbloquear al siguiente.
- **Partida libre:** cualquier rival, filtrando por categoría.
- **Partida rápida:** un rival al azar cerca de tu nivel, a 15 puntos.
- **Multijugador:** próximamente.

En **Opciones** elegís el paño (6 colores), el dorso y el estilo de las cartas (clásica, antigua, moderna, noche), los puntos, con o sin flor, la velocidad de la máquina y si querés un resumen al terminar cada mano.

## Los rivales

| Nivel | Categoría | Rival |
|---|---|---|
| 1–3 | Principiante | Abuela Coca · Lucho · Sofi |
| 4–6 | Intermedio | Rulo · Marta · Doña Pocha |
| 7–9 | Avanzado | El Tano Ferrari · El Negro Benítez · Don Anselmo |
| 10–12 | Experto | Chiche · La Turca Yamila · La Gringa Bauer |
| 13–15 | Maestro | El Profe Gutiérrez · El Pibe Maravilla · El Gaucho Rivero |
| 16 | Leyenda | Mandinga |

Cada rival tiene un nivel y un estilo (mentiroso, prudente, envidero, agresivo). Los parámetros de juego salen de esos dos datos (`js/personas.js`), así que sumar un rival nuevo es agregar una entrada con su nivel, estilo, avatar y frases.

La máquina no hace trampa: sólo usa lo que vería un jugador de verdad (sus cartas, las que ya salieron, los cantos y los tantos que mostraste). Para decidir imagina muchas manos posibles tuyas, les da más peso a las que encajan con lo que hiciste ("cantó truco: algo tiene", "no quiso el envido: tiene poco") y las resuelve. Los niveles altos imaginan más manos, leen más fino, se equivocan menos y, desde el nivel 4, aprenden durante el partido cuánto mentís y cuánto te achicás.

## Reglas implementadas

- Mazo español de 40 cartas, partido a 15 o 30 puntos (malas y buenas).
- Envido, real envido y falta envido con todas sus combinaciones. *El envido está primero*.
- Flor (se puede desactivar): obligatoria, anula el envido; contraflor, contraflor al resto y con flor me achico.
- Truco, retruco y vale cuatro; sólo sube quien tiene el quiero.
- Pardas, alternancia de la mano, irse al mazo (en la primera, sin envido jugado, son 2 puntos).

## Correrlo en tu compu

Es HTML, CSS y JavaScript sin dependencias. Abrí `index.html` directamente o serví la carpeta:

```bash
python -m http.server 8000
```

y entrá a http://localhost:8000 (el modo offline necesita servirlo por http/https, no con `file://`).

## Estructura

- `js/cards.js` — mazo, jerarquía de cartas, envido y dibujo de las cartas.
- `js/engine.js` — reglas: cantos, bazas, puntos.
- `js/ai.js` — la máquina (Monte Carlo + resolución de la mano).
- `js/personas.js` — los rivales: parámetros de juego y frases.
- `js/seats.js` — los "asientos": quién decide en cada lugar (persona local o máquina).
- `js/match.js` — el partido: reparte, pide decisiones a cada asiento y anota.
- `js/ui.js` — pantallas, mesa y tanteador con fósforos.
- `sw.js` + `manifest.webmanifest` — instalación y juego sin conexión.

Si cambiás archivos, subí el número de `VERSION` en `sw.js` para que las apps instaladas se actualicen.

## Multijugador (preparado, todavía no está)

El motor de reglas (`engine.js`) no sabe quién juega: sólo recibe acciones en objetos planos (JSON) y devuelve eventos. El partido (`match.js`) le pregunta a cada asiento qué hace, así que jugar contra otra persona es agregar un `RemoteSeat` que mande las opciones por la red y espere la respuesta. `Engine.newHand` acepta un mazo ya mezclado (`opts.deck`) para que el anfitrión reparta y los demás reproduzcan la misma mano. Falta elegir el transporte (WebRTC entre navegadores, o un servidor chico con WebSockets) y cómo se arma la sala.
