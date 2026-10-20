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
      samples: 30, mistake: 0.3, noise: 0.22, model: 0.3, reads: false,
      trucoCall: 0.75, trucoCaution: 0.18, trucoRaise: 0.92, bluff: 0.02, slowplay: 0,
      envCall: 0.7, envReal: 0.88, envFalta: 0.97, envCaution: 0.18, envRaise: 0.9, envBluff: 0.02
    },
    say: {
      flor: ['¡Flor! ¡Tres del mismo palo, como en la quiniela!'],
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
      samples: 70, mistake: 0.1, noise: 0.1, model: 0.5, reads: false,
      trucoCall: 0.55, trucoCaution: -0.02, trucoRaise: 0.72, bluff: 0.28, slowplay: 0,
      envCall: 0.48, envReal: 0.7, envFalta: 0.9, envCaution: -0.02, envRaise: 0.68, envBluff: 0.25
    },
    say: {
      flor: ['¡FLOR, papá! ¡Tomá!'],
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
      samples: 120, mistake: 0.05, noise: 0.07, model: 0.65, reads: false,
      trucoCall: 0.7, trucoCaution: 0.08, trucoRaise: 0.85, bluff: 0.05, slowplay: 0.1,
      envCall: 0.62, envReal: 0.8, envFalta: 0.93, envCaution: 0.08, envRaise: 0.82, envBluff: 0.05
    },
    say: {
      flor: ['Flor.'],
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
      samples: 180, mistake: 0.02, noise: 0.04, model: 0.8, reads: true,
      trucoCall: 0.65, trucoCaution: 0.03, trucoRaise: 0.8, bluff: 0.15, slowplay: 0.25,
      envCall: 0.56, envReal: 0.76, envFalta: 0.92, envCaution: 0.03, envRaise: 0.76, envBluff: 0.15
    },
    say: {
      flor: ['¡Flor! Y de las lindas.'],
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
    levelName: 'Experto',
    avatar: '🤠',
    color: '#8a6d3b',
    desc: 'Campeón invicto de la pulpería "La Esquina" desde el \'78. Cuenta las cartas, te lee la cara y te miente sin pestañear.',
    ai: {
      samples: 260, mistake: 0, noise: 0.015, model: 0.9, reads: true,
      trucoCall: 0.66, trucoCaution: 0.03, trucoRaise: 0.8, bluff: 0.12, slowplay: 0.3,
      envCall: 0.58, envReal: 0.78, envFalta: 0.92, envCaution: 0.05, envRaise: 0.78, envBluff: 0.1
    },
    say: {
      flor: ['Flor, compadre. Así es la vida.'],
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
  },
  {
    id: 'yamila',
    name: 'La Turca Yamila',
    level: 6,
    levelName: 'Maestra',
    avatar: '🧕',
    color: '#7d4bb3',
    desc: 'Tira el tarot los martes y las del truco todos los días. Te lee la cara mejor que vos mismo: cada canto tuyo le cuenta algo.',
    ai: {
      samples: 360, mistake: 0, noise: 0, model: 1, reads: true,
      trucoCall: 0.66, trucoCaution: 0.03, trucoRaise: 0.8, bluff: 0.14, slowplay: 0.3,
      envCall: 0.58, envReal: 0.78, envFalta: 0.92, envCaution: 0.05, envRaise: 0.78, envBluff: 0.12
    },
    say: {
      flor: ['Flor. Ya lo veía venir en las cartas.'],
      greet: ['Dame la mano, querido… ah, mirá. Hoy no es tu noche.', 'Sentate. Las cartas ya me contaron cómo termina esto.'],
      truco: ['Truco. Y no me mientas, que se te nota.', 'Truco, corazón.'],
      retruco: ['Quiero retruco. Te tiembla el ojo izquierdo.'],
      vale4: ['Vale cuatro. Lo dice el destino.'],
      envido: ['Envido.', 'Envido… ¿o tenés miedo?'],
      real: ['Real envido. Las cartas no mienten.'],
      falta: ['Falta envido. Está escrito.'],
      quiero: ['Quiero. Ya sé lo que tenés.', 'Quiero, mi amor.'],
      noquiero: ['No quiero. Esta vez te creo.', 'Esta te la dejo.'],
      mazo: ['Al mazo. Mala energía.'],
      winHand: ['Te lo dije.', 'Se veía venir.'],
      loseHand: ['Mmm, eso no estaba en las cartas.', 'Mercurio retrógrado.'],
      winGame: ['¿Viste? El destino no se discute. Volvé el martes.'],
      loseGame: ['Me ganaste… Ahora entiendo lo que vi en la borra del café.']
    }
  },
  {
    id: 'profe',
    name: 'El Profe Gutiérrez',
    level: 7,
    levelName: 'Gran maestro',
    avatar: '👨‍🏫',
    color: '#2f6f9f',
    desc: 'Profesor de matemática jubilado. Escribió un libro de probabilidades del truco que nadie leyó. Cada canto suyo tiene la cuenta hecha.',
    ai: {
      samples: 480, mistake: 0, noise: 0, model: 1, reads: true,
      trucoCall: 0.67, trucoCaution: 0.03, trucoRaise: 0.8, bluff: 0.11, slowplay: 0.35,
      envCall: 0.58, envReal: 0.78, envFalta: 0.92, envCaution: 0.05, envRaise: 0.78, envBluff: 0.11
    },
    say: {
      flor: ['Flor. Probabilidad: casi 5 %. Qué suerte la mía.'],
      greet: ['Buenas. Le adelanto que la varianza no perdona.', 'Siéntese. Hoy vamos a hablar de esperanza matemática.'],
      truco: ['Truco. La cuenta da.', 'Truco. Positivo en valor esperado.'],
      retruco: ['Quiero retruco. Hice los números.'],
      vale4: ['Vale cuatro. Queda demostrado.'],
      envido: ['Envido.', 'Envido, con permiso.'],
      real: ['Real envido. Estadísticamente justificado.'],
      falta: ['Falta envido. El riesgo está calculado.'],
      quiero: ['Quiero. Las probabilidades me acompañan.', 'Quiero.'],
      noquiero: ['No quiero. No me da la cuenta.', 'Paso. Esperanza negativa.'],
      mazo: ['Al mazo. Minimizo pérdidas.'],
      winHand: ['Como estaba previsto.', 'La ley de los grandes números.'],
      loseHand: ['Un desvío estándar, nada más.', 'Varianza.'],
      winGame: ['Partido ganado. Le recomiendo mi libro, capítulo 3.'],
      loseGame: ['Me ganó. Voy a tener que revisar mis supuestos.']
    }
  },
  {
    id: 'mandinga',
    name: 'Mandinga',
    level: 8,
    levelName: 'Jefe final',
    avatar: '😈',
    color: '#8b1a1a',
    desc: 'Dicen que aparece en los boliches de campaña pasada la medianoche y que nadie le ganó nunca. Juega fino, miente con criterio y aprende de cada mano tuya.',
    ai: {
      samples: 700, mistake: 0, noise: 0, model: 1, reads: true,
      trucoCall: 0.66, trucoCaution: 0.03, trucoRaise: 0.8, bluff: 0.13, slowplay: 0.4,
      envCall: 0.58, envReal: 0.78, envFalta: 0.92, envCaution: 0.04, envRaise: 0.78, envBluff: 0.12
    },
    say: {
      flor: ['Flor. Del infierno vengo con ella.'],
      greet: ['Buenas noches, cristiano. ¿Qué apostamos? ¿El alma?', 'Al fin alguien con coraje. Sentate.'],
      truco: ['Truco… ¿te animás?', 'Truco. Y que arda.', 'Truco, cristiano.'],
      retruco: ['Quiero retruco. Ja.'],
      vale4: ['Vale cuatro. Hasta el último fósforo.'],
      envido: ['Envido.', 'Envido… a ver si sos valiente.'],
      real: ['Real envido.'],
      falta: ['Falta envido. Todo al fuego.'],
      quiero: ['Quiero.', 'Quiero. Siempre quiero.'],
      noquiero: ['No quiero… por ahora.', 'Te la regalo. Disfrutala.'],
      mazo: ['Al mazo. Ya vendrán otras.'],
      winHand: ['Ja.', 'Era obvio.', 'El diablo sabe por viejo…'],
      loseHand: ['Disfrutala, que dura poco.', 'Interesante…'],
      winGame: ['Otra alma para la colección. Volvé cuando quieras… siempre volvés.'],
      loseGame: ['Me ganaste… Hacía siglos que no pasaba. Esto no queda así.']
    }
  }
];
