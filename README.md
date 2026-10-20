# Truco Argentino 🃏

Truco argentino mano a mano contra la máquina, en el navegador. Cinco rivales ficticios, uno por nivel, cada uno con su forma de jugar y su manera de hablar.

**Jugar:** https://jonatanquiro.github.io/truco-argentino/

Se puede **instalar como app (PWA)** y jugar **sin conexión**: en el celu, abrí el link y elegí *Agregar a la pantalla de inicio* / *Instalar app*; en la compu, el ícono de instalar en la barra de direcciones (o el botón *Instalar app* del menú). Después de la primera carga funciona sin internet.

## Los rivales

| Nivel | Rival | Estilo |
|---|---|---|
| ★ | **Abuela Coca** | Recién aprende. Se equivoca seguido y casi nunca miente. |
| ★★ | **Lucho** | El pibe del barrio. Canta todo, miente mucho y mal. |
| ★★★ | **Marta** | La del almacén. Prudente: si canta, es porque tiene. |
| ★★★★ | **El Tano Ferrari** | Mentiroso de alto vuelo. Agresivo y bueno. |
| ★★★★★ | **Don Anselmo** | Campeón de la pulpería. Cuenta las cartas, te lee y te miente. |

La máquina no hace trampa: sólo usa lo que vería un jugador de verdad (sus cartas, las que ya salieron, los cantos y los tantos que mostraste). Para decidir, simula muchas manos posibles tuyas y las resuelve; los rivales de más nivel simulan más, se equivocan menos, mienten mejor y los de nivel 4 y 5 aprenden si vos mentís seguido.

## Reglas implementadas

- Mazo español de 40 cartas, partido a 15 o 30 puntos (malas y buenas).
- Envido, real envido y falta envido con todas sus combinaciones. *El envido está primero*.
- Truco, retruco y vale cuatro; sólo sube quien tiene el quiero.
- Pardas, irse al mazo, alternancia de la mano.
- Sin flor (por ahora).

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
- `js/ui.js` — mesa, tanteador con fósforos y desarrollo del partido.
- `sw.js` + `manifest.webmanifest` — instalación y juego sin conexión.

Si cambiás archivos, subí el número de `VERSION` en `sw.js` para que las apps instaladas se actualicen.
