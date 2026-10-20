# Truco Argentino 🃏

Truco argentino mano a mano contra la máquina, en el navegador. Cinco rivales ficticios, uno por nivel, cada uno con su forma de jugar y su manera de hablar.

**Jugar:** https://jonatanquiro.github.io/truco-argentino/

Se puede **instalar como app (PWA)** y jugar **sin conexión**: en el celu, abrí el link y elegí *Agregar a la pantalla de inicio* / *Instalar app*; en la compu, el ícono de instalar en la barra de direcciones (o el botón *Instalar app* del menú). Después de la primera carga funciona sin internet.

## Los rivales

| Nivel | Rival | Estilo |
|---|---|---|
| 1 · Principiante | **Abuela Coca** | Recién aprende. Se equivoca seguido y casi nunca miente. |
| 2 · Aficionado | **Lucho** | El pibe del barrio. Canta todo, miente mucho y mal. |
| 3 · Intermedio | **Marta** | La del almacén. Prudente: si canta, es porque tiene. |
| 4 · Avanzado | **El Tano Ferrari** | Mentiroso de alto vuelo. Agresivo y bueno. |
| 5 · Experto | **Don Anselmo** | Campeón de la pulpería. Cuenta las cartas y te lee. |
| 6 · Maestra | **La Turca Yamila** | Cada canto tuyo le cuenta algo. |
| 7 · Gran maestro | **El Profe Gutiérrez** | Profesor de matemática: todo con la cuenta hecha. |
| 8 · Jefe final | **Mandinga** | El diablo en persona. Juega fino y aprende de cada mano tuya. |

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
