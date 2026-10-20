/*
 * Los rivales. Cada uno tiene un estilo; su nivel sale de su lugar en la carrera (más abajo).
 * Para sumar un campeón alcanza con agregar una entrada con estilo, avatar y frases, y ubicarlo en una provincia.
 */
window.PERSONAS = [
  {
    id: 'coca',
    name: 'Abuela Coca',
    level: 1,
    style: ['equilibrado'],
    avatar: '👵',
    color: '#c27ba0',
    desc: 'Aprendió a jugar el domingo pasado en la casa de la nieta. Se olvida qué cartas salieron y casi nunca miente.',
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
    style: ['mentiroso', 'agresivo'],
    avatar: '🧢',
    color: '#e08a2c',
    desc: 'El pibe del barrio. Canta todo lo que se mueve: mucho grito y poco fundamento. Si le aguantás, se cae solo.',
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
    level: 5,
    style: ['prudente'],
    avatar: '👩‍🦱',
    color: '#4a9b8e',
    desc: 'La del almacén de la esquina, en San Juan. Prudente y calculadora: si canta, es porque tiene. Lleva la cuenta como la libreta del fiado.',
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
    level: 7,
    style: ['mentiroso'],
    avatar: '🧔',
    color: '#c0392b',
    desc: 'Tucumano de familia italiana y mentiroso de alto vuelo. Juega rápido, canta fuerte y te hace dudar de todo. Cuando calla, ojo.',
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
    level: 9,
    style: ['equilibrado'],
    avatar: '🤠',
    color: '#8a6d3b',
    desc: 'Campeón invicto de la pulpería "La Esquina", en Gualeguaychú, desde el \'78. Cuenta las cartas, te lee la cara y te miente sin pestañear.',
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
    level: 11,
    style: ['equilibrado'],
    avatar: '🧕',
    color: '#7d4bb3',
    desc: 'Correntina. Tira el tarot los martes y las del truco todos los días. Te lee la cara mejor que vos mismo: cada canto tuyo le cuenta algo.',
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
    level: 13,
    style: ['prudente'],
    avatar: '👨‍🏫',
    color: '#2f6f9f',
    desc: 'Profesor de matemática jubilado en Neuquén. Escribió un libro de probabilidades del truco que nadie leyó. Cada canto suyo tiene la cuenta hecha.',
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
    level: 16,
    style: ['equilibrado'],
    avatar: '😈',
    color: '#8b1a1a',
    desc: 'Dicen que espera en el fin del mundo, pasada la medianoche, y que nadie le ganó nunca. Juega fino, miente con criterio y aprende de cada mano tuya.',
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
  },
  {
    id: 'sofi',
    name: 'Sofi',
    level: 3,
    style: ['envidero'],
    avatar: '👩‍🎓',
    color: '#d16b8f',
    desc: 'Estudiante de Sociales en Córdoba. Aprendió en los recreos del centro de estudiantes y le encanta cantar envido. Aprende rápido.',
    say: {
      flor: ['¡Flor! Esto lo tengo que contar en el grupo.'],
      greet: ['¡Hola! Juego entre parcial y parcial, no me tengas piedad.', 'Dale, una rápida que tengo que estudiar.'],
      truco: ['¡Truco!', 'Truco, ¿no?'],
      retruco: ['¡Quiero retruco!'],
      vale4: ['¡Vale cuatro, a todo o nada!'],
      envido: ['¡Envido!', 'Envido, obvio.', 'Envidooo.'],
      real: ['¡Real envido!'],
      falta: ['¡Falta envido!'],
      quiero: ['Quiero.', '¡Dale, quiero!'],
      noquiero: ['No quiero.', 'Mmm, no.'],
      mazo: ['Me voy al mazo.'],
      winHand: ['¡Sí!', 'Bieeen.'],
      loseHand: ['Uf.', 'Bueno, ya fue.'],
      winGame: ['¡Gané! Me lo merezco después de esta semana.'],
      loseGame: ['Me ganaste. La próxima vengo con apuntes.']
    }
  },
  {
    id: 'rulo',
    name: 'Rulo',
    level: 4,
    style: ['prudente'],
    avatar: '🚌',
    color: '#3f8f5a',
    desc: 'Chofer de micro de larga distancia. Juega en la terminal de San Luis entre viaje y viaje. Tranquilo, ordenado y difícil de apurar.',
    say: {
      flor: ['Flor. Como el boleto capicúa.'],
      greet: ['Tengo veinte minutos hasta la próxima vuelta. Alcanza.', 'Subí, que arrancamos.'],
      truco: ['Truco.', 'Va un truco, pibe.'],
      retruco: ['Quiero retruco.'],
      vale4: ['Vale cuatro. Fin del recorrido.'],
      envido: ['Envido.'],
      real: ['Real envido.'],
      falta: ['Falta envido.'],
      quiero: ['Quiero.', 'Dale, quiero.'],
      noquiero: ['No quiero. Te dejo en la parada.', 'Paso.'],
      mazo: ['Al mazo. Esta no para.'],
      winHand: ['Siguiente parada.', 'Tranqui.'],
      loseHand: ['Se me pasó la parada.', 'Bien ahí.'],
      winGame: ['Terminal. Bajan todos.'],
      loseGame: ['Me ganaste. Te debo un cortado.']
    }
  },
  {
    id: 'pocha',
    name: 'Doña Pocha',
    level: 6,
    style: ['envidero', 'mentiroso'],
    avatar: '👩‍🦳',
    color: '#b5651d',
    desc: 'Reina del club de jubilados de Catamarca. Habla sin parar para distraerte y te canta envido con lo que sea.',
    say: {
      flor: ['¡Flor! ¿Viste lo que es la experiencia, nene?'],
      greet: ['Ay, sentate, ¿querés unas galletitas? Ah, y te voy a ganar.', 'En el club nadie me quiere jugar. Por algo será.'],
      truco: ['¡Truco! Y no me mirés con esa cara.', 'Truco, querido.'],
      retruco: ['¡Quiero retruco! ¿Qué te creíste?'],
      vale4: ['¡Vale cuatro! Como en el setenta y uno.'],
      envido: ['¡Envido!', 'Envido, mi vida.', 'Te canto envido, a ver.'],
      real: ['¡Real envido! Uy, se me escapó.'],
      falta: ['¡Falta envido! A esta edad no hay tiempo que perder.'],
      quiero: ['Quiero, ¿cómo no?', 'Quiero, faltaba más.'],
      noquiero: ['No quiero, querido.', 'Esta pasa.'],
      mazo: ['Me voy al mazo, que se me enfría el té.'],
      winHand: ['¡Ja! ¿Viste?', 'Esto en el club no pasa.'],
      loseHand: ['Bueno, bueno.', 'Te dejé, ¿eh? Te dejé.'],
      winGame: ['Gané. Contale a tu abuela que la saludo.'],
      loseGame: ['Me ganaste. Pero el domingo hay revancha en el club.']
    }
  },
  {
    id: 'benitez',
    name: 'El Negro Benítez',
    level: 8,
    style: ['agresivo'],
    avatar: '🎸',
    color: '#5a4a8a',
    desc: 'Cantor de peñas salteñas. Canta cada jugada en verso y te apura a puro ritmo. Debajo de la guitarra hay un jugador de verdad.',
    say: {
      flor: ['Flor de lindo lo que tengo, flor de lindo lo que traigo.'],
      greet: ['Buenas noches, compañero, vengo a jugar y a cantar; si me gana, lo festejo, y si no, lo hago llorar.'],
      truco: ['¡Truco le canto, paisano, que la mano está pa\' mí!', '¡Truco! Y a ver qué decís.'],
      retruco: ['¡Quiero retruco, hermano, que no me asusto de vos!'],
      vale4: ['¡Vale cuatro, y que lo diga la guitarra!'],
      envido: ['Envido, por la flor del cardo.', '¡Envido, y le doy la mano!'],
      real: ['¡Real envido, señor mío!'],
      falta: ['¡Falta envido, que esto es todo o nada!'],
      quiero: ['¡Quiero, y que suene el bordón!', 'Quiero, paisano.'],
      noquiero: ['No quiero, que la noche es larga.', 'Ésta no, compañero.'],
      mazo: ['Al mazo me voy cantando.'],
      winHand: ['¡Y así se canta, señores!', 'Una más pa\'l cancionero.'],
      loseHand: ['Bien jugada, compañero.', 'Se me desafinó la prima.'],
      winGame: ['Gané la payada, paisano. Otra vez será.'],
      loseGame: ['Me ganó en buena ley. Le dedico una milonga.']
    }
  },
  {
    id: 'chiche',
    name: 'Chiche',
    level: 10,
    style: ['mentiroso'],
    avatar: '🕶️',
    color: '#2e7d7a',
    desc: 'Cuidacoches de la cancha en Resistencia. Se pasa el día leyendo a la gente: sabe quién paga, quién miente y quién se achica.',
    say: {
      flor: ['Flor, jefe. Hoy estoy de suerte.'],
      greet: ['Buenas, jefe. Se lo cuido, quédese tranquilo… el puntaje no.', 'Ah, lo conozco. Usted es de los que se achican.'],
      truco: ['Truco, jefe.', 'Truco. ¿Se anima o se lo cuido?'],
      retruco: ['Quiero retruco, maestro.'],
      vale4: ['Vale cuatro. Lo que sea su voluntad.'],
      envido: ['Envido, jefe.', 'Envido, y no se haga el distraído.'],
      real: ['Real envido.'],
      falta: ['Falta envido, jefe.'],
      quiero: ['Quiero, maestro.', 'Quiero. Ya lo calé.'],
      noquiero: ['No quiero. Se la dejo, jefe.', 'Paso, paso.'],
      mazo: ['Al mazo. Mañana será otro día.'],
      winHand: ['Gracias, jefe.', 'Ya lo tenía calado.'],
      loseHand: ['Uh, me la hizo.', 'Bien ahí, maestro.'],
      winGame: ['Se lo dejé impecable, jefe. Vuelva cuando quiera.'],
      loseGame: ['Me ganó, jefe. Hoy no le cobro.']
    }
  },
  {
    id: 'gringa',
    name: 'La Gringa Bauer',
    level: 12,
    style: ['prudente'],
    avatar: '👱‍♀️',
    color: '#4d6fa8',
    desc: 'Tres veces campeona provincial en Santa Fe. Fría como la helada en el campo: no habla, no mira, no se equivoca.',
    say: {
      flor: ['Flor.'],
      greet: ['Hola.', 'Empecemos.'],
      truco: ['Truco.'],
      retruco: ['Quiero retruco.'],
      vale4: ['Vale cuatro.'],
      envido: ['Envido.'],
      real: ['Real envido.'],
      falta: ['Falta envido.'],
      quiero: ['Quiero.'],
      noquiero: ['No.'],
      mazo: ['Mazo.'],
      winHand: ['Mhm.', '…'],
      loseHand: ['Bien.', '…'],
      winGame: ['Buen partido.'],
      loseGame: ['Buen partido. De verdad.']
    }
  },
  {
    id: 'pibe',
    name: 'El Pibe Maravilla',
    level: 14,
    style: ['agresivo', 'mentiroso'],
    avatar: '🧒',
    color: '#e0a020',
    desc: 'Pibe de Bariloche. Tiene 14 años y ya ganó el nacional juvenil. Calcula como el Profe, miente como el Tano y no le tiene miedo a nadie.',
    say: {
      flor: ['Flor. Ez.'],
      greet: ['Hola, señor. ¿Usted también se va a enojar cuando pierda?', 'Mi viejo dice que no le gane a los grandes. No le hago caso.'],
      truco: ['Truco.', 'Truco, jaja.'],
      retruco: ['Quiero retruco. Obvio.'],
      vale4: ['Vale cuatro. No me da miedo.'],
      envido: ['Envido.', 'Envido, a ver.'],
      real: ['Real envido.'],
      falta: ['Falta envido.'],
      quiero: ['Quiero.', 'Obvio que quiero.'],
      noquiero: ['No quiero.', 'Nah.'],
      mazo: ['Al mazo.'],
      winHand: ['Ez.', 'Jaja.'],
      loseHand: ['Bueno, esa sí.', 'Ok, bien.'],
      winGame: ['Gané. ¿Otro? No se enoje, eh.'],
      loseGame: ['Me ganó… ¿Me enseña cómo hizo eso?']
    }
  },
  {
    id: 'rivero',
    name: 'El Gaucho Rivero',
    level: 15,
    style: ['equilibrado'],
    avatar: '🐴',
    color: '#7a5230',
    desc: 'Leyenda de las estancias patagónicas. Dicen que una noche le ganó a Mandinga… y que desde entonces lo anda buscando.',
    say: {
      flor: ['Flor, paisano. Del campo.'],
      greet: ['Güenas. Siéntese, que la noche es larga y el truco es largo.', 'A mí me enseñó mi tata, y a él el suyo.'],
      truco: ['Truco, paisano.', 'Truco. Despacito.'],
      retruco: ['Quiero retruco.'],
      vale4: ['Vale cuatro, y a la marchanta.'],
      envido: ['Envido.'],
      real: ['Real envido, paisano.'],
      falta: ['Falta envido. Ahí va.'],
      quiero: ['Quiero.', 'Le quiero, amigo.'],
      noquiero: ['No quiero. Paciencia.', 'Ésa se la dejo.'],
      mazo: ['Al mazo, que no corre apuro.'],
      winHand: ['Así es la cosa.', 'Despacito se llega.'],
      loseHand: ['Güena, paisano.', 'Se me fue esa.'],
      winGame: ['Juega bien, paisano. Pero le falta campo.'],
      loseGame: ['Me ganó en buena ley. Ahora vaya y búsquelo a Mandinga.']
    }
  }
];

(function () {
  /*
   * La carrera recorre el país: 24 provincias, 3 rivales en cada una, cada vez más difíciles.
   * Los personajes de arriba son el "campeón" de su provincia; los demás se arman con variaciones.
   */
  const ROUTE = [
    ['Ciudad de Buenos Aires', 'Centro', ['Palermo', 'Boedo', 'Mataderos']],
    ['Buenos Aires', 'Centro', ['Quilmes', 'Mar del Plata', 'Tandil']],
    ['La Pampa', 'Centro', ['Santa Rosa', 'General Pico']],
    ['Córdoba', 'Centro', ['Villa Carlos Paz', 'Río Cuarto', 'Cosquín']],
    ['San Luis', 'Cuyo', ['Merlo', 'Villa Mercedes']],
    ['Mendoza', 'Cuyo', ['Maipú', 'San Rafael', 'Luján de Cuyo']],
    ['San Juan', 'Cuyo', ['Caucete', 'Jáchal']],
    ['La Rioja', 'Norte', ['Chilecito', 'Chamical']],
    ['Catamarca', 'Norte', ['Belén', 'Tinogasta']],
    ['Tucumán', 'Norte', ['Tafí del Valle', 'Concepción', 'Yerba Buena']],
    ['Santiago del Estero', 'Norte', ['La Banda', 'Termas de Río Hondo']],
    ['Salta', 'Norte', ['Cafayate', 'Cachi', 'Orán']],
    ['Jujuy', 'Norte', ['Humahuaca', 'Tilcara', 'Purmamarca']],
    ['Formosa', 'Litoral', ['Clorinda', 'Pirané']],
    ['Chaco', 'Litoral', ['Resistencia', 'Sáenz Peña']],
    ['Corrientes', 'Litoral', ['Goya', 'Paso de los Libres', 'Esquina']],
    ['Misiones', 'Litoral', ['Oberá', 'Eldorado', 'Puerto Iguazú']],
    ['Entre Ríos', 'Litoral', ['Paraná', 'Concordia', 'Colón']],
    ['Santa Fe', 'Litoral', ['Rosario', 'Rafaela', 'Venado Tuerto']],
    ['Neuquén', 'Patagonia', ['San Martín de los Andes', 'Zapala', 'Cutral Có']],
    ['Río Negro', 'Patagonia', ['Bariloche', 'General Roca', 'Viedma']],
    ['Chubut', 'Patagonia', ['Trelew', 'Esquel', 'Puerto Madryn']],
    ['Santa Cruz', 'Patagonia', ['El Calafate', 'Caleta Olivia', 'Río Gallegos']],
    ['Tierra del Fuego', 'Patagonia', ['Ushuaia', 'Río Grande']]
  ];
  const CHAMPIONS = {
    coca: 'Ciudad de Buenos Aires', lucho: 'Buenos Aires', sofi: 'Córdoba', rulo: 'San Luis', marta: 'San Juan',
    pocha: 'Catamarca', tano: 'Tucumán', benitez: 'Salta', chiche: 'Chaco', yamila: 'Corrientes', anselmo: 'Entre Ríos',
    gringa: 'Santa Fe', profe: 'Neuquén', pibe: 'Río Negro', rivero: 'Santa Cruz', mandinga: 'Tierra del Fuego'
  };

  // Azar con semilla: los rivales generados son siempre los mismos
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const NAMES = [
    ['Cacho', '🧔'], ['Tito', '👴'], ['Pocho', '👨‍🦲'], ['La Negra', '👩🏽'], ['Nené', '👵'], ['Coco', '👨'], ['Beto', '🧑‍🔧'],
    ['Mabel', '👩‍🦰'], ['Raúl', '👨‍🦳'], ['Norma', '👩‍🦳'], ['El Flaco', '🧍'], ['Pato', '🧑'], ['Fede', '👦'], ['Vicky', '👱‍♀️'],
    ['Romi', '👩'], ['Oscar', '🧓'], ['El Turco', '🧔🏽'], ['El Ruso', '👱‍♂️'], ['La Colorada', '👩‍🦰'], ['Don Ramón', '🤠'],
    ['Doña Rosa', '👵🏻'], ['Juanci', '🧢'], ['Mati', '🧑‍🎤'], ['Chola', '🧕'], ['El Gordo', '🧔‍♂️'], ['Lalo', '👨‍🌾'],
    ['Marisa', '👩‍🍳'], ['Quique', '👨‍🍳'], ['La Tana', '💁‍♀️'], ['Toto', '🧑‍🚀'], ['Gringo', '👨‍🌾'], ['Chueco', '🚶'],
    ['Pirucha', '👩‍🦱'], ['El Colo', '👨‍🦰'], ['Lucía', '👩‍💼'], ['Facu', '🧑‍💻'], ['Rulo', '🧑‍🦱'], ['Mono', '🐒'],
    ['Pepa', '👩‍🌾'], ['Nacho', '🧑‍🏫'], ['Cholo', '🧑‍🔧'], ['Gaby', '👩‍🎨'], ['Tati', '👩‍🎤'], ['Bocha', '⚽']
  ];
  const JOBS = ['Mozo del bar', 'Remisero', 'Kiosquero', 'Peluquera', 'Albañil', 'Panadero', 'Maestra rural', 'Verdulero',
    'Jubilado del club', 'Mecánico', 'Enfermera', 'Puestero', 'Bancario', 'Estudiante', 'Camionero', 'Almacenera',
    'Guía de turismo', 'Tambero', 'Profesor de gimnasia', 'Feriante', 'Carnicero', 'Costurera', 'Cartero', 'Sodero'];
  const COLORS = ['#c27ba0', '#e08a2c', '#4a9b8e', '#c0392b', '#8a6d3b', '#7d4bb3', '#2f6f9f', '#3f8f5a', '#b5651d',
    '#5a4a8a', '#2e7d7a', '#4d6fa8', '#d16b8f', '#a0522d', '#6b8e23', '#8b4513'];
  const STYLES = ['equilibrado', 'mentiroso', 'prudente', 'envidero', 'agresivo'];
  const TRAITS = {
    equilibrado: 'Juega derecho: ni muy mentiroso ni muy cauto.',
    mentiroso: 'Miente más de lo que dice la verdad. Aguantale los cantos.',
    prudente: 'Si canta, es porque tiene. Cuesta sacarle puntos.',
    envidero: 'Le encanta el envido: lo canta con lo que sea.',
    agresivo: 'Canta truco temprano y te apura todo el tiempo.'
  };
  // Frases por estilo; {p} = provincia, {c} = ciudad
  const SAY = {
    equilibrado: {
      greet: ['Bienvenido a {c}. Siéntese, que acá se juega en serio.', 'Buenas. En {p} el truco se juega despacito.'],
      truco: ['Truco.', 'Va truco.'], retruco: ['Quiero retruco.'], vale4: ['Vale cuatro.'],
      envido: ['Envido.'], real: ['Real envido.'], falta: ['Falta envido.'], flor: ['Flor.'],
      quiero: ['Quiero.', 'Bueno, quiero.'], noquiero: ['No quiero.', 'Ésta no.'], mazo: ['Al mazo.'],
      winHand: ['Así es.', 'Bien.'], loseHand: ['Bien jugado.', 'Uh.'],
      winGame: ['Buen partido. Volvé a {c} cuando quieras.'], loseGame: ['Me ganaste en buena ley. Seguí viaje.']
    },
    mentiroso: {
      greet: ['¡Llegó el turista! En {c} te vamos a enseñar.', '¿Venís de lejos? Acá en {p} no se le gana a nadie de afuera.'],
      truco: ['¡Truco! Y mirame bien.', '¡Truco, papá!', 'Truco… ¿te animás?'], retruco: ['¡Quiero retruco! ¿Qué te creías?'],
      vale4: ['¡Vale cuatro!'], envido: ['¡Envido!', 'Envido, ¿qué tal?'], real: ['¡Real envido!'], falta: ['¡Falta envido!'],
      flor: ['¡Flor! Y de las lindas.'], quiero: ['¡Quiero!', 'Quiero, obvio.'], noquiero: ['No quiero. Te la regalo.'],
      mazo: ['Me voy al mazo.'], winHand: ['¿Viste? ¡Te lo dije!', '¡Tomá!'], loseHand: ['Te la dejé ganar.', 'Suerte nomás.'],
      winGame: ['¡Te volvés a tu casa con las manos vacías!'], loseGame: ['Bueno… en {c} no se habla de esto.']
    },
    prudente: {
      greet: ['Buenas.', 'Tranquilo, que acá en {c} no hay apuro.'],
      truco: ['Truco.'], retruco: ['Quiero retruco.'], vale4: ['Vale cuatro.'], envido: ['Envido.'], real: ['Real envido.'],
      falta: ['Falta envido.'], flor: ['Flor.'], quiero: ['Quiero.'], noquiero: ['No quiero.', 'Paso.'], mazo: ['Al mazo.'],
      winHand: ['Mhm.', 'Como corresponde.'], loseHand: ['Bien.', 'Mmm.'],
      winGame: ['Buen partido.'], loseGame: ['Muy bien jugado. Mis respetos.']
    },
    envidero: {
      greet: ['¡Hola! Acá en {c} se canta envido con todo.', 'Dale, una rápida, que tengo ganas de cantar.'],
      truco: ['¡Truco!'], retruco: ['¡Quiero retruco!'], vale4: ['¡Vale cuatro!'],
      envido: ['¡Envido!', '¡Envidooo!', 'Envido, obvio.'], real: ['¡Real envido!'], falta: ['¡Falta envido!'],
      flor: ['¡Flor! ¡Qué lindo!'], quiero: ['¡Quiero!'], noquiero: ['Mmm, no.'], mazo: ['Me voy al mazo.'],
      winHand: ['¡Sí!', '¡Bien!'], loseHand: ['Uf.', 'Ya fue.'],
      winGame: ['¡Gané! Hoy festejamos en {c}.'], loseGame: ['Me ganaste. La próxima te canto más envidos.']
    },
    agresivo: {
      greet: ['Dale que no tengo todo el día.', '¿Vos sos el que viene ganando? En {p} se te termina.'],
      truco: ['¡TRUCO!', '¡Truco y a cobrar!'], retruco: ['¡Quiero retruco!'], vale4: ['¡Vale cuatro, dale!'],
      envido: ['Envido.'], real: ['¡Real envido!'], falta: ['¡Falta envido!'], flor: ['¡Flor!'],
      quiero: ['¡Quiero!', '¡Y quiero!'], noquiero: ['Naa.'], mazo: ['Al mazo, rápido.'],
      winHand: ['¡Adentro!', '¡Vamos!'], loseHand: ['¡Uh!', '¡Qué bronca!'],
      winGame: ['¡Te pasé por arriba!'], loseGame: ['Bueno… revancha cuando quieras.']
    }
  };

  const fill = (text, prov, city) => text.replace(/\{p\}/g, prov).replace(/\{c\}/g, city);
  const sayFor = (style, prov, city) => {
    const base = SAY[style];
    const out = {};
    for (const k in base) out[k] = base[k].map((t) => fill(t, prov, city));
    return out;
  };

  const champions = {};
  for (const p of window.PERSONAS) champions[p.id] = p;
  const list = [];
  ROUTE.forEach(([prov, region, cities], i) => {
    const r = rng(1000 + i * 77);
    const champ = Object.keys(CHAMPIONS).find((id) => CHAMPIONS[id] === prov);
    const slots = champ ? 2 : 3;
    for (let j = 0; j < slots; j++) {
      const [name, avatar] = NAMES[Math.floor(r() * NAMES.length)];
      const style = STYLES[Math.floor(r() * STYLES.length)];
      const city = cities[Math.floor(r() * cities.length)];
      list.push({
        id: 'g' + i + '-' + j,
        name: name + (name.startsWith('El ') || name.startsWith('La ') || name.startsWith('Don') || name.startsWith('Doña') ? '' : ' de ' + city),
        avatar,
        color: COLORS[Math.floor(r() * COLORS.length)],
        style: [style],
        desc: `${JOBS[Math.floor(r() * JOBS.length)]} de ${city}. ${TRAITS[style]}`,
        say: sayFor(style, prov, city),
        province: prov, region, city
      });
    }
    if (champ) list.push(Object.assign(champions[champ], { province: prov, region, champion: true }));
  });
  // Los apodos sin ciudad se pueden repetir: les agrego la ciudad para que no se confundan
  const seenNames = {};
  for (const p of list) {
    if (seenNames[p.name] && p.city) p.name = p.name + ' de ' + p.city;
    if (seenNames[p.name]) p.name = p.name + ' (' + p.province + ')';
    seenNames[p.name] = true;
  }
  window.PERSONAS = list;
  window.PROVINCES = ROUTE.map(([name, region]) => ({ name, region }));
  window.REGIONS = ['Centro', 'Cuyo', 'Norte', 'Litoral', 'Patagonia'];
})();

(function () {
  const MAX = window.PERSONAS.length;
  const TIERS = [[0.15, 'Principiante'], [0.35, 'Intermedio'], [0.55, 'Avanzado'], [0.75, 'Experto'], [0.97, 'Maestro'], [1, 'Leyenda']];
  const lerp = (a, b, t) => a + (b - a) * t;

  // Cómo juega cada nivel: del primero (se equivoca seguido, no lee al rival) al último (juego fino y lectura completa)
  function aiFor(level, styles) {
    const t = (level - 1) / (MAX - 1);
    const ai = {
      samples: Math.round(20 * Math.pow(800 / 20, t)),
      mistake: 0.45 * Math.pow(1 - t, 2.5),
      noise: 0.3 * Math.pow(1 - t, 2),
      model: Math.min(1, 0.1 + 1.1 * t),
      reads: t >= 0.33,
      trucoCall: lerp(0.75, 0.66, t),
      trucoCaution: lerp(0.18, 0.03, t),
      trucoRaise: lerp(0.92, 0.8, t),
      bluff: lerp(0.02, 0.12, t),
      slowplay: lerp(0, 0.4, t),
      envCall: lerp(0.7, 0.58, t),
      envReal: lerp(0.88, 0.78, t),
      envFalta: lerp(0.97, 0.92, t),
      envCaution: lerp(0.18, 0.04, t),
      envRaise: lerp(0.9, 0.78, t),
      envBluff: lerp(0.02, 0.11, t)
    };
    for (const s of styles || []) {
      if (s === 'mentiroso') { ai.bluff = ai.bluff * 1.6 + 0.05; ai.trucoCaution -= 0.02; ai.envBluff += 0.07; }
      if (s === 'prudente') { ai.bluff *= 0.45; ai.trucoCaution += 0.04; ai.trucoCall += 0.03; ai.envCaution += 0.03; ai.envBluff *= 0.5; }
      if (s === 'envidero') { ai.envCall -= 0.08; ai.envReal -= 0.06; ai.envBluff += 0.06; ai.envCaution -= 0.03; }
      if (s === 'agresivo') { ai.trucoCall -= 0.06; ai.trucoRaise -= 0.05; ai.trucoCaution -= 0.03; }
    }
    return ai;
  }

  window.PERSONAS.forEach((p, i) => {
    p.level = i + 1;
    p.ai = aiFor(p.level, p.style);
    const t = i / (MAX - 1);
    p.levelName = TIERS.find(([max]) => t <= max)[1];
  });
  window.PERSONA_TIERS = TIERS.map(([, name]) => name);
})();
