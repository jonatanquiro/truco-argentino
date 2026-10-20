/* Los rivales. Cada uno es un nivel: cambian la precisión, cuánto mienten y cuánto arriesgan. */
window.PERSONAS = [
  {
    id: 'coca',
    name: 'Abuela Coca',
    level: 1,
    levelName: 'Principiante',
    avatar: '👵',
    color: '#c27ba0',
    desc: 'Aprendió a jugar el domingo pasado en la casa de la nieta. Se olvida qué cartas salieron y casi nunca miente.',
    ai: {
      samples: 10, mistake: 0.45, noise: 0.3,
      trucoCall: 0.78, trucoCaution: 0.22, trucoRaise: 0.92, bluff: 0.02, discount: 0, slowplay: 0,
      envCall: 0.72, envReal: 0.9, envFalta: 0.98, envCaution: 0.2, envRaise: 0.92, envBluff: 0.02, reads: false
    },
    say: {
      greet: ['Ay, querido, tené paciencia que estoy aprendiendo.', '¿Cómo era? ¿El ancho de espada mata a todo?'],
      truco: ['¡Truco! ¿Así se dice, no?', 'Truco… creo.'],
      retruco: ['¡Quiero retruco! Ay, qué emoción.'],
      vale4: ['¡Vale cuatro! Que sea lo que Dios quiera.'],
      envido: ['Envido, nene.', '¿Puedo cantar envido? ¡Envido!'],
      real: ['¡Real envido! Me lo enseñó el finado.'],
      falta: ['¡Falta envido! ¿Está bien dicho?'],
      quiero: ['Bueno, quiero.', 'Dale, quiero.'],
      noquiero: ['No, no, no quiero.', 'Ay, no, gracias.'],
      mazo: ['Me voy al mazo, que estas cartas son feas.'],
      winHand: ['¡Mirá vos! Gané.', 'Esta te la gané, ¿viste?'],
      loseHand: ['Ay, qué cabeza la mía.', 'Bueno, la próxima.'],
      winGame: ['¡Le gané al nene! Voy a llamar a tu madre.'],
      loseGame: ['Muy bien, querido. ¿Querés un mate?']
    }
  },
  {
    id: 'lucho',
    name: 'Lucho',
    level: 2,
    levelName: 'Aficionado',
    avatar: '🧢',
    color: '#e08a2c',
    desc: 'El pibe del barrio. Canta todo lo que se mueve: mucho grito y poco fundamento. Si le aguantás, se cae solo.',
    ai: {
      samples: 25, mistake: 0.18, noise: 0.15,
      trucoCall: 0.5, trucoCaution: 0.0, trucoRaise: 0.68, bluff: 0.3, discount: 0, slowplay: 0,
      envCall: 0.45, envReal: 0.68, envFalta: 0.9, envCaution: -0.02, envRaise: 0.66, envBluff: 0.3, reads: false
    },
    say: {
      greet: ['¿Qué hacés, maestro? Preparate que hoy vengo picante.', 'Dale que te dejo en cero.'],
      truco: ['¡TRUCO, papá!', '¡Truco y no me mirés así!', '¡Truco! Andá rezando.'],
      retruco: ['¡Quiero retruco, gil!', '¡Retruco! ¿Qué te pensabas?'],
      vale4: ['¡Vale cuatro y a cobrar!', '¡VALE CUATRO, y que se arme!'],
      envido: ['¡Envido!', '¡Envido, vamos!'],
      real: ['¡Real envido, papito!'],
      falta: ['¡Falta envido, todo o nada!'],
      quiero: ['¡Quiero, obvio!', '¡Y quiero, vieja!'],
      noquiero: ['Naa, no quiero.', 'Esta te la dejo pasar.'],
      mazo: ['Me voy al mazo, me tiraste cualquiera.'],
      winHand: ['¡Tomá! ¡Aprendé!', '¡Adentro!'],
      loseHand: ['Uh, qué mala leche.', 'Tuviste suerte, nada más.'],
      winGame: ['¡Te pasé el trapo! Volvé cuando aprendas.'],
      loseGame: ['Bueno, bueno… revancha y te mato.']
    }
  },
  {
    id: 'marta',
    name: 'Marta',
    level: 3,
    levelName: 'Intermedio',
    avatar: '👩‍🦱',
    color: '#4a9b8e',
    desc: 'La del almacén de la esquina. Prudente y calculadora: si canta, es porque tiene. Lleva la cuenta como la libreta del fiado.',
    ai: {
      samples: 60, mistake: 0.07, noise: 0.08,
      trucoCall: 0.68, trucoCaution: 0.12, trucoRaise: 0.85, bluff: 0.04, discount: 0.1, slowplay: 0.1,
      envCall: 0.62, envReal: 0.8, envFalta: 0.94, envCaution: 0.08, envRaise: 0.82, envBluff: 0.04, reads: false
    },
    say: {
      greet: ['Buenas. Juguemos tranquilos, que después tengo que abrir.', 'A ver qué traés hoy.'],
      truco: ['Truco.', 'Va truco.'],
      retruco: ['Quiero retruco.'],
      vale4: ['Vale cuatro.'],
      envido: ['Envido.'],
      real: ['Real envido.'],
      falta: ['Falta envido.'],
      quiero: ['Quiero.', 'Bueno, quiero.'],
      noquiero: ['No quiero.', 'No, esta no.'],
      mazo: ['Me voy al mazo.'],
      winHand: ['Anotalo en la libreta.', 'Como corresponde.'],
      loseHand: ['Bien jugado.', 'Mmm.'],
      winGame: ['Te gané, pero no te pongas mal. Pasá cuando quieras.'],
      loseGame: ['Muy bien jugado. Me debés la revancha.']
    }
  },
  {
    id: 'tano',
    name: 'El Tano Ferrari',
    level: 4,
    levelName: 'Avanzado',
    avatar: '🧔',
    color: '#c0392b',
    desc: 'Mentiroso de alto vuelo. Juega rápido, canta fuerte y te hace dudar de todo. Cuando calla, ojo.',
    ai: {
      samples: 120, mistake: 0.03, noise: 0.04,
      trucoCall: 0.58, trucoCaution: 0.05, trucoRaise: 0.76, bluff: 0.18, discount: 0.15, slowplay: 0.25,
      envCall: 0.55, envReal: 0.76, envFalta: 0.92, envCaution: 0.04, envRaise: 0.76, envBluff: 0.15, reads: true
    },
    say: {
      greet: ['Sentate, sentate. Hoy te voy a enseñar algo.', 'Mirame a los ojos y decime que tenés buenas cartas.'],
      truco: ['¡Truco! Y mirame bien la cara.', 'Truco, ¿te animás?', '¡Truuuco!'],
      retruco: ['¡Quiero retruco! Mamma mia.', 'Retruco, y no se habla más.'],
      vale4: ['¡Vale cuatro! A ver si tenés lo que hay que tener.'],
      envido: ['Envido, ¿qué tal?', 'Uh… envido.'],
      real: ['¡Real envido! Andá contando.'],
      falta: ['Falta envido. Así de simple.'],
      quiero: ['Quiero, ¿qué te creés?', 'Quiero. A ver.'],
      noquiero: ['No quiero. Disfrutalo.', 'Te la regalo.'],
      mazo: ['Me voy al mazo. Esta no vale la pena.'],
      winHand: ['¿Viste? Te lo dije.', 'Facilito.'],
      loseHand: ['Bueno, te la dejé ganar.', 'Hoy estás con suerte, eh.'],
      winGame: ['Vení cuando quieras, que siempre hay lugar para aprender.'],
      loseGame: ['Tuviste más suerte que cabeza. Revancha ya.']
    }
  },
  {
    id: 'anselmo',
    name: 'Don Anselmo',
    level: 5,
    levelName: 'Leyenda',
    avatar: '🤠',
    color: '#8a6d3b',
    desc: 'Campeón invicto de la pulpería "La Esquina" desde el \'78. Cuenta las cartas, te lee la cara y te miente sin pestañear.',
    ai: {
      samples: 260, mistake: 0, noise: 0,
      trucoCall: 0.6, trucoCaution: 0.03, trucoRaise: 0.78, bluff: 0.12, discount: 0.15, slowplay: 0.35,
      envCall: 0.58, envReal: 0.78, envFalta: 0.92, envCaution: 0.02, envRaise: 0.78, envBluff: 0.1, reads: true
    },
    say: {
      greet: ['Buenas noches, m\'hijo. Siéntese, que el truco no se apura.', 'En este boliche me ganaron una sola vez. Y fue en el \'82.'],
      truco: ['Truco, m\'hijo.', 'Va un truquito.', 'Truco… y que Dios reparta suerte.'],
      retruco: ['Quiero retruco, compadre.', 'Retruco, y con gusto.'],
      vale4: ['Vale cuatro. Y sin pestañear.'],
      envido: ['Envido.', 'Le canto envido, a ver qué dice.'],
      real: ['Real envido, compadre.'],
      falta: ['Falta envido. Que se juegue lo que hay que jugar.'],
      quiero: ['Quiero.', 'Le quiero, compadre.'],
      noquiero: ['No quiero. Se la dejo.', 'Ésta es suya.'],
      mazo: ['Al mazo, que no hay apuro.'],
      winHand: ['Paciencia, m\'hijo.', 'El truco se juega con la cabeza.'],
      loseHand: ['Bien jugado, mozo.', 'Ésa la tenía bien guardada.'],
      winGame: ['Se defendió bien. Vuelva cuando quiera.'],
      loseGame: ['¡Me ganó, carajo! Mozo, una ginebra para el campeón.']
    }
  }
];
