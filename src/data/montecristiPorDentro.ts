export interface MontecristiGuide {
  slug: string;
  title: string;
  excerpt: string;
  eyebrow: string;
  keywords: string[];
  sections: Array<{ heading: string; paragraphs: string[] }>;
}

export interface MontecristiGuideDetails {
  image: string;
  imageAlt: string;
  imageCredit: { label: string; url: string };
  videoId?: string;
  videoTitle?: string;
  mapQuery: string;
  facts: Array<{ label: string; value: string }>;
  faq: Array<{ question: string; answer: string }>;
  additionalSections: Array<{ heading: string; paragraphs: string[] }>;
  sources: Array<{ label: string; url: string }>;
}

const tourismSource = { label: "Ministerio de Turismo — Montecristi", url: "https://es.godominicanrepublic.com/destinos/montecristi" };
const localSource = { label: "Ayuntamiento Municipal de Montecristi — Turismo", url: "https://ayuntamientomontecristi.gob.do/turismo/" };
const historySource = { label: "Ayuntamiento Municipal de Montecristi — Historia", url: "https://ayuntamientomontecristi.gob.do/historia/" };
const videoMontecristi = "OqbJwIEfDw";

const beachImage = "https://d2wsgnpmkga52i.cloudfront.net/assets/media/Z46aPJbqstJ99ptV_montecristi_2_eed6a5ca-d5aa-419a-b3e8-c707e183b67f-2.jpg";
const coastImage = "https://d2wsgnpmkga52i.cloudfront.net/assets/media/Z4_BXJbqstJ99siO_montecristi-1_78d22f0d-cb74-684c-01244d365b7a1b5d-2.jpg";
const morroImage = "https://d2wsgnpmkga52i.cloudfront.net/assets/media/Z-b1yHdAxsiBwEux_Montecristi_Morro_b9216c26-4d6b-42e5-b19f-1ade58cd231e-3.jpg";

export const montecristiGuideDetails: Record<string, MontecristiGuideDetails> = {
  "playas-en-montecristi-republica-dominicana": {
    image: beachImage, imageAlt: "Costa y paisaje natural de Montecristi", imageCredit: tourismSource, videoId: videoMontecristi, videoTitle: "Montecristi y los Cayos de los Siete Hermanos", mapQuery: "Playas de Montecristi República Dominicana",
    facts: [{ label: "Ideal para", value: "Naturaleza, fotografía y paseos en bote" }, { label: "Paisaje", value: "Costa, manglares, cayos y bosque seco" }, { label: "Antes de ir", value: "Confirmar marea, oleaje y transporte" }],
    faq: [{ question: "¿Cuáles son las playas más conocidas de Montecristi?", answer: "La costa de Montecristi incluye playas cercanas a El Morro y otros puntos del litoral. El acceso y las condiciones cambian, por lo que conviene confirmar la ruta con un guía local." }, { question: "¿La playa de Montecristi es tranquila?", answer: "El oleaje puede ser fuerte en algunos tramos del litoral. No asumas que toda playa es apta para nadar: pregunta por las condiciones del día y respeta las señales." }],
    additionalSections: [{ heading: "Cómo escoger una playa según tu plan", paragraphs: ["Si buscas fotografías y paisaje, prioriza los puntos con vista a El Morro y la costa. Si buscas bañarte, pregunta específicamente por un área habilitada y por el estado del mar; las playas del Atlántico no ofrecen siempre la misma calma.", "Para un día de excursión, lleva agua, protección solar, efectivo, funda para proteger el teléfono y una bolsa para retirar tus residuos. En zonas naturales, la visita responsable es parte de la experiencia."] }, { heading: "Una ruta de un día", paragraphs: ["Una ruta sencilla puede combinar el centro histórico, una parada panorámica en El Morro y una actividad de costa. Deja margen para el traslado y la marea: en Montecristi, el orden de las paradas importa."] }],
    sources: [tourismSource, localSource],
  },
  "villa-dona-emilia-montecristi": {
    image: coastImage, imageAlt: "Arquitectura y patrimonio de Montecristi", imageCredit: localSource, mapQuery: "Villa Doña Emilia Montecristi",
    facts: [{ label: "Tipo de visita", value: "Patrimonio y arquitectura local" }, { label: "Combínala con", value: "Centro histórico y reloj público" }, { label: "Recomendación", value: "Confirmar horario y acceso" }],
    faq: [{ question: "¿Dónde queda Villa Doña Emilia?", answer: "Se encuentra en el entorno urbano de Montecristi. Antes de ir, verifica la ubicación exacta y si está abierta al público, porque las condiciones de visita pueden variar." }, { question: "¿Cuánto dura la visita?", answer: "Depende de si haces solo la parada fotográfica o un recorrido patrimonial por la ciudad. Reserva entre una y dos horas para verla con calma junto a otros puntos del centro." }],
    additionalSections: [{ heading: "Qué observar durante la visita", paragraphs: ["Más que llegar, hacer una buena visita significa mirar los detalles: proporciones, balcones, materiales, ventilación y la relación de la vivienda con la calle. Esos elementos ayudan a leer la historia urbana de Montecristi.", "Pregunta a residentes o gestores culturales por el contexto del inmueble y evita publicar como hechos los datos que no estén documentados."] }],
    sources: [localSource, historySource],
  },
  "hoteles-en-montecristi": {
    image: beachImage, imageAlt: "Paisaje costero de Montecristi para viajeros", imageCredit: tourismSource, mapQuery: "Hoteles en Montecristi República Dominicana",
    facts: [{ label: "Mejor base", value: "Centro de San Fernando para moverte" }, { label: "Para naturaleza", value: "Busca cercanía a costa y excursiones" }, { label: "Reserva", value: "Confirma servicios directamente" }],
    faq: [{ question: "¿Dónde es mejor hospedarse en Montecristi?", answer: "Para una primera visita, el centro facilita comida, diligencias y desplazamientos. Si vas por playa o excursión, compara la distancia hasta el punto de salida y no solo el precio de la habitación." }, { question: "¿Hay hoteles frente a la playa?", answer: "Hay alojamientos orientados al turismo de costa, pero la disponibilidad cambia. Confirma ubicación, acceso real a la playa, estacionamiento y condiciones de reserva antes de pagar." }],
    additionalSections: [{ heading: "Checklist para reservar", paragraphs: ["Pregunta si el precio incluye desayuno, parqueo, impuestos, Wi-Fi y aire acondicionado. Confirma la hora de entrada, la política de cancelación y si aceptan tarjeta o transferencia.", "Si viajas para una excursión a los cayos, pregunta cuánto tardas desde el hotel hasta el muelle o punto de encuentro. Un hotel más barato puede salir más caro si obliga a pagar transporte adicional."] }, { heading: "Qué revisar en las reseñas", paragraphs: ["Lee primero las reseñas recientes sobre limpieza, agua, ruido, seguridad y atención. Las fotos promocionales muestran el mejor ángulo; las reseñas te dicen cómo funciona el lugar en un día normal."] }],
    sources: [tourismSource],
  },
  "piscina-natural-montecristi": {
    image: coastImage, imageAlt: "Aguas y costa natural de Montecristi", imageCredit: tourismSource, videoId: videoMontecristi, videoTitle: "Paisajes naturales de Montecristi", mapQuery: "Piscina natural Montecristi República Dominicana",
    facts: [{ label: "Depende de", value: "Marea, oleaje y condiciones del día" }, { label: "Más seguro", value: "Visitar con guía que conozca la zona" }, { label: "No olvides", value: "Agua, calzado y protección solar" }],
    faq: [{ question: "¿La piscina natural de Montecristi está siempre disponible?", answer: "No necesariamente. Estos espacios dependen de la marea y del estado del mar. Confirma el acceso y las condiciones antes de salir." }, { question: "¿Se puede llegar sin guía?", answer: "Algunos accesos pueden ser sencillos y otros no. Para una primera visita, un guía local ayuda a identificar la ruta segura y a respetar las áreas protegidas." }],
    additionalSections: [{ heading: "Seguridad antes de entrar al agua", paragraphs: ["No entres si el oleaje está levantado, si no ves claramente la profundidad o si el guía recomienda esperar. Las rocas mojadas resbalan y una piscina natural puede conectarse con el mar con fuerza.", "Usa calzado acuático, no camines sobre corales y mantén a los niños siempre al alcance de un adulto. La foto bonita nunca vale una imprudencia."] }],
    sources: [tourismSource, localSource],
  },
  "hoteles-baratos-en-montecristi": {
    image: morroImage, imageAlt: "El Morro y paisaje de Montecristi", imageCredit: tourismSource, mapQuery: "Hospedaje económico en Montecristi República Dominicana",
    facts: [{ label: "Ahorro real", value: "Comparar tarifa más transporte" }, { label: "Pregunta por", value: "Parqueo, desayuno y aire" }, { label: "Mejor práctica", value: "Confirmar por llamada o WhatsApp" }],
    faq: [{ question: "¿Cómo encontrar hoteles baratos en Montecristi?", answer: "Compara fechas, ubicación y qué incluye la tarifa. Llamar directamente a alojamientos locales puede revelar disponibilidad que no aparece en plataformas." }, { question: "¿Es mejor quedarse en el centro?", answer: "Para ahorrar en transporte y comer cerca, el centro suele ser práctico. Para una experiencia de playa, calcula la distancia y el costo de llegar a la costa." }],
    additionalSections: [{ heading: "El precio más bajo no siempre es la mejor oferta", paragraphs: ["Suma el transporte, el desayuno, el parqueo y el tiempo de traslado. Un cuarto económico con buena ubicación puede valer más que una tarifa menor alejada de todo.", "Pide por escrito la tarifa final y las condiciones de cancelación. No envíes depósitos a cuentas personales sin verificar que el alojamiento existe y que estás hablando con su responsable."] }],
    sources: [tourismSource],
  },
  "reloj-de-montecristi": {
    image: coastImage, imageAlt: "Patrimonio urbano de Montecristi", imageCredit: localSource, mapQuery: "Reloj público de Montecristi República Dominicana",
    facts: [{ label: "Qué representa", value: "Un símbolo urbano de la ciudad" }, { label: "Ideal para", value: "Recorrido histórico y fotografía" }, { label: "Cerca de", value: "Otros puntos del centro histórico" }],
    faq: [{ question: "¿Dónde está el reloj de Montecristi?", answer: "Está en el centro urbano de San Fernando de Montecristi. Usa el mapa de esta guía para confirmar la ubicación y combinarlo con otros lugares patrimoniales." }, { question: "¿Quién diseñó el reloj de Montecristi?", answer: "La autoría debe confirmarse con documentos históricos y fuentes locales. Esta sección no atribuye el diseño a una persona sin una fuente primaria verificable." }],
    additionalSections: [{ heading: "Cómo hacer una visita con contexto", paragraphs: ["Mira el reloj como parte de un conjunto: la plaza, las fachadas, las calles y la memoria de quienes se han dado cita allí. Una buena fotografía puede ir acompañada de una historia, una fecha y una fuente.", "Si tienes documentos, fotografías antiguas o testimonios familiares sobre el reloj, puedes compartirlos con la redacción para ampliar esta investigación."] }],
    sources: [localSource, historySource],
  },
  "quien-diseno-el-reloj-de-montecristi": {
    image: coastImage, imageAlt: "Arquitectura patrimonial de Montecristi", imageCredit: localSource, mapQuery: "Reloj público de Montecristi",
    facts: [{ label: "Pregunta clave", value: "Autoría, fecha y procedencia" }, { label: "Fuente ideal", value: "Archivo municipal o documento original" }, { label: "Estado", value: "Investigación abierta a aportes locales" }],
    faq: [{ question: "¿Ya está confirmado quién diseñó el reloj?", answer: "No publicamos una atribución definitiva sin respaldo documental. La respuesta responsable es separar la tradición oral de la evidencia histórica." }, { question: "¿Cómo aportar información?", answer: "La comunidad puede aportar fotografías, recortes, libros, actas o testimonios identificables para ser contrastados por la redacción." }],
    additionalSections: [{ heading: "Qué debe comprobar una investigación seria", paragraphs: ["Una respuesta completa debería identificar al diseñador o fabricante, el año, el mecanismo, la procedencia de las piezas y las intervenciones que ha recibido. Un artículo que solo repite un nombre sin documento no resuelve la búsqueda del lector.", "Por eso esta entrada funciona como investigación en desarrollo: publicaremos una actualización cuando exista una fuente verificable y accesible."] }],
    sources: [localSource, historySource],
  },
  "odontologo-en-montecristi": {
    image: morroImage, imageAlt: "Montecristi, República Dominicana", imageCredit: tourismSource, mapQuery: "Odontólogo en Montecristi República Dominicana",
    facts: [{ label: "Antes de llamar", value: "Confirma especialidad y horarios" }, { label: "Para urgencias", value: "Pregunta si atienden el mismo día" }, { label: "Verifica", value: "Dirección, pagos y colegiatura" }],
    faq: [{ question: "¿Cómo elegir un odontólogo en Montecristi?", answer: "Confirma la especialidad que necesitas, la dirección, los horarios, el costo de evaluación y los métodos de pago. Para tratamientos complejos, solicita un plan explicado por escrito." }, { question: "¿Dónde buscar una emergencia dental?", answer: "Llama primero a consultorios cercanos y pregunta si atienden urgencias. Si hay sangrado abundante, trauma facial o dificultad para respirar, busca atención médica inmediata." }],
    additionalSections: [{ heading: "Preguntas útiles para la primera cita", paragraphs: ["Pregunta qué incluye la evaluación, qué alternativas existen y cuál es el costo total estimado. No aceptes un tratamiento que no entiendas: un profesional debe explicarte beneficios, riesgos y mantenimiento.", "La información de contacto cambia con frecuencia. Por eso recomendamos verificarla directamente con el consultorio y no presentar este artículo como un directorio permanente."] }],
    sources: [localSource],
  },
  "excursiones-en-montecristi": {
    image: beachImage, imageAlt: "Excursión costera en Montecristi", imageCredit: tourismSource, videoId: videoMontecristi, videoTitle: "Qué hacer en Montecristi y los Cayos de los Siete Hermanos", mapQuery: "Excursiones en Montecristi República Dominicana",
    facts: [{ label: "Actividades", value: "Bote, manglares, cayos y fotografía" }, { label: "Reserva", value: "Pregunta qué incluye el precio" }, { label: "Seguridad", value: "Chaleco y operador local responsable" }],
    faq: [{ question: "¿Qué incluye una excursión a los cayos?", answer: "Depende del operador: puede incluir transporte en bote, guía, equipo y comida. Solicita el itinerario y el precio final antes de reservar." }, { question: "¿Qué llevar a una excursión?", answer: "Agua, protección solar, ropa que se seque rápido, funda impermeable, identificación y efectivo. Sigue la lista específica del operador." }],
    additionalSections: [{ heading: "Cómo comparar operadores", paragraphs: ["No compares solo por precio. Pregunta por el tamaño del grupo, la embarcación, el chaleco para cada pasajero, el punto de salida, la duración y qué ocurre si el clima impide navegar.", "Un operador serio no promete el mar perfecto todos los días: explica cuándo se cancela o reprograma y prioriza la seguridad."] }],
    sources: [tourismSource, localSource],
  },
  "cayo-levantado-montecristi": {
    image: beachImage, imageAlt: "Cayos y costa del noroeste dominicano", imageCredit: tourismSource, videoId: videoMontecristi, videoTitle: "Los Cayos de los Siete Hermanos en Montecristi", mapQuery: "Cayos de los Siete Hermanos Montecristi",
    facts: [{ label: "Aclaración", value: "Cayo Levantado está en Samaná" }, { label: "Montecristi", value: "Tiene los Cayos de los Siete Hermanos" }, { label: "Antes de reservar", value: "Confirma provincia y punto de salida" }],
    faq: [{ question: "¿Cayo Levantado está en Montecristi?", answer: "No. Cayo Levantado es un destino de Samaná. Montecristi tiene otros cayos y rutas costeras, entre ellos los Cayos de los Siete Hermanos." }, { question: "¿Por qué aparece Montecristi en algunas búsquedas?", answer: "Porque viajeros y anuncios mezclan nombres de destinos dominicanos. Revisa siempre la provincia, el muelle y el itinerario exacto antes de pagar." }],
    additionalSections: [{ heading: "La ruta correcta para el viajero", paragraphs: ["Si buscas la experiencia de Cayo Levantado, organiza el viaje hacia Samaná. Si quieres conocer Montecristi, busca excursiones a sus cayos, manglares, El Morro y playas del noroeste.", "Esta aclaración evita una de las confusiones más costosas del turismo local: comprar una excursión esperando llegar a un lugar que está en otra provincia."] }],
    sources: [tourismSource],
  },
  "montecristi-grand-grossier": {
    image: morroImage, imageAlt: "El Morro y el paisaje costero de Montecristi", imageCredit: tourismSource, videoId: videoMontecristi, videoTitle: "Montecristi: paisaje, historia y cayos", mapQuery: "Grand Grossier Montecristi República Dominicana",
    facts: [{ label: "Tema", value: "Geografía histórica y memoria local" }, { label: "Investigar con", value: "Mapas, archivos y fuentes locales" }, { label: "No confundir", value: "Topónimos históricos con destinos actuales" }],
    faq: [{ question: "¿Qué es Grand Grossier?", answer: "Es un topónimo que aparece en referencias históricas y geográficas vinculadas al entorno de Montecristi. Su ubicación y significado deben leerse según la época y la fuente consultada." }, { question: "¿Dónde queda exactamente?", answer: "La respuesta depende del mapa o documento histórico que utilices. No presentamos una coordenada definitiva sin una fuente cartográfica verificable." }],
    additionalSections: [{ heading: "Por qué importan los nombres antiguos", paragraphs: ["Los nombres de la costa cambian con los mapas, las rutas marítimas y la forma en que las comunidades describen el territorio. Investigar Grand Grossier permite conectar geografía, navegación e historia local.", "Esta guía está pensada como punto de partida: la redacción seguirá incorporando mapas históricos, documentos y voces de investigadores de Montecristi."] }],
    sources: [historySource, localSource],
  },
};

export const montecristiGuides: MontecristiGuide[] = [
  {
    slug: "playas-en-montecristi-republica-dominicana",
    title: "Playas en Montecristi, República Dominicana: guía para conocer la costa",
    excerpt: "Descubre cómo planificar una visita a las playas, cayos y paisajes costeros más representativos de Montecristi.",
    eyebrow: "Guía de viaje",
    keywords: ["playas en Montecristi República Dominicana", "playas de Montecristi", "qué hacer en Montecristi"],
    sections: [
      {
        heading: "Una costa para explorar con calma",
        paragraphs: [
          "Montecristi combina playas, manglares, cayos y una costa de gran valor paisajístico. Es un destino ideal para quienes buscan naturaleza, fotografía, pesca, paseos en bote y una experiencia más tranquila que la de los grandes polos turísticos.",
          "Antes de salir, conviene confirmar el estado del tiempo, el acceso, el transporte disponible y si la visita requiere guía local. La marea y el sol pueden cambiar por completo la experiencia en la costa.",
        ],
      },
      {
        heading: "Qué llevar y cómo cuidar el entorno",
        paragraphs: [
          "Lleva agua, protector solar, sombrero, calzado cómodo y una bolsa para retirar tus residuos. En áreas naturales es importante no extraer conchas, no alimentar la fauna y respetar las indicaciones de los guías y las comunidades.",
        ],
      },
    ],
  },
  {
    slug: "villa-dona-emilia-montecristi",
    title: "Villa Doña Emilia en Montecristi: qué saber antes de visitarla",
    excerpt: "Una guía práctica para conocer Villa Doña Emilia y organizar una escapada con información local y recomendaciones de planificación.",
    eyebrow: "Lugares de interés",
    keywords: ["Villa Doña Emilia Montecristi", "qué hacer en Montecristi", "turismo en Montecristi"],
    sections: [
      {
        heading: "Una parada con identidad montecristeña",
        paragraphs: [
          "Villa Doña Emilia forma parte de los lugares que despiertan interés entre quienes buscan conocer el patrimonio y los espacios de descanso de Montecristi. Su visita puede combinarse con un recorrido por el centro histórico, el reloj y otros atractivos de la provincia.",
          "Como ocurre con muchos espacios locales, los horarios, servicios y condiciones de acceso pueden cambiar. La mejor práctica es confirmar la disponibilidad directamente antes de trasladarte.",
        ],
      },
    ],
  },
  {
    slug: "hoteles-en-montecristi",
    title: "Hoteles en Montecristi: dónde hospedarse y cómo elegir",
    excerpt: "Compara zonas, servicios y recomendaciones para encontrar alojamiento en Montecristi según tu tipo de viaje.",
    eyebrow: "Alojamiento",
    keywords: ["hoteles en Montecristi", "dónde hospedarse en Montecristi", "alojamiento Montecristi"],
    sections: [
      {
        heading: "Elige según tu plan",
        paragraphs: [
          "Para conocer la ciudad y moverte con facilidad, busca un hotel cercano al centro de San Fernando de Montecristi. Si tu prioridad son la playa, los paseos en bote o la tranquilidad, revisa alojamientos próximos a la costa y confirma la distancia real a los puntos de interés.",
          "Compara estacionamiento, aire acondicionado, desayuno, piscina, política de cancelación y métodos de pago. Las fotos pueden variar con el tiempo, por lo que también es útil leer reseñas recientes.",
        ],
      },
    ],
  },
  {
    slug: "piscina-natural-montecristi",
    title: "Piscina natural de Montecristi: guía para disfrutarla responsablemente",
    excerpt: "Consejos para planificar una visita a las piscinas naturales y espacios de agua de la costa montecristeña.",
    eyebrow: "Naturaleza",
    keywords: ["piscina natural Montecristi", "piscinas naturales en Montecristi", "excursiones Montecristi"],
    sections: [
      {
        heading: "La marea es parte del recorrido",
        paragraphs: [
          "Las piscinas naturales dependen de la marea, el oleaje y las condiciones del día. Por eso, una excursión organizada con personas que conozcan la zona suele ser la opción más segura y provechosa.",
          "Usa chaleco cuando el operador lo indique, evita caminar sobre corales y consulta siempre las condiciones del mar. No hay dos visitas iguales: el nivel del agua y el acceso pueden cambiar.",
        ],
      },
    ],
  },
  {
    slug: "hoteles-baratos-en-montecristi",
    title: "Hoteles baratos en Montecristi: cómo ahorrar sin sacrificar comodidad",
    excerpt: "Ideas para encontrar hospedaje económico en Montecristi y aprovechar mejor el presupuesto de tu viaje.",
    eyebrow: "Alojamiento",
    keywords: ["hoteles baratos en Montecristi", "hotel económico Montecristi", "hospedaje barato Montecristi"],
    sections: [
      {
        heading: "Busca el mejor valor, no solo el menor precio",
        paragraphs: [
          "Un alojamiento económico puede ser una excelente base para conocer Montecristi. Revisa qué incluye la tarifa y calcula el costo del transporte, el desayuno y el estacionamiento antes de comparar.",
          "Reservar con anticipación, viajar entre semana y llamar directamente a negocios locales puede ayudarte a encontrar opciones disponibles. Confirma siempre las condiciones antes de pagar.",
        ],
      },
    ],
  },
  {
    slug: "reloj-de-montecristi",
    title: "El reloj de Montecristi: historia, ubicación y por qué es un símbolo local",
    excerpt: "Conoce el valor cultural y arquitectónico del reloj de Montecristi, uno de los puntos más reconocibles de la ciudad.",
    eyebrow: "Historia y cultura",
    keywords: ["reloj Montecristi", "reloj público de Montecristi", "monumento de Montecristi"],
    sections: [
      {
        heading: "Un punto de encuentro en la ciudad",
        paragraphs: [
          "El reloj de Montecristi es uno de los símbolos que identifican visualmente a San Fernando de Montecristi. Además de su función como referencia urbana, forma parte de la memoria colectiva y de los recorridos fotográficos por la ciudad.",
          "Visitarlo es una oportunidad para caminar por el entorno, conocer la arquitectura local y escuchar las historias que los montecristeños han transmitido alrededor de este monumento.",
        ],
      },
    ],
  },
  {
    slug: "quien-diseno-el-reloj-de-montecristi",
    title: "¿Quién diseñó el reloj de Montecristi? Historia de un monumento emblemático",
    excerpt: "Una mirada a la historia del reloj de Montecristi y a las preguntas que rodean su diseño, construcción y conservación.",
    eyebrow: "Historia y cultura",
    keywords: ["quién diseñó el reloj de Montecristi", "historia del reloj de Montecristi", "reloj de Montecristi diseñador"],
    sections: [
      {
        heading: "Una historia que merece fuentes locales",
        paragraphs: [
          "La historia del reloj se cuenta con frecuencia en conversaciones, visitas y publicaciones locales. Para documentar con precisión quién lo diseñó, cuándo se construyó y cómo llegó a convertirse en símbolo de la ciudad, es importante contrastar archivos municipales, investigaciones históricas y testimonios de la comunidad.",
          "En Montecristi por Dentro iremos ampliando esta entrada con documentos y entrevistas verificadas. El objetivo es conservar la memoria local sin repetir datos que no tengan respaldo.",
        ],
      },
    ],
  },
  {
    slug: "excursiones-en-montecristi",
    title: "Excursiones en Montecristi: experiencias, rutas y consejos",
    excerpt: "Planifica excursiones por la costa, los cayos, los manglares y los espacios históricos de Montecristi.",
    eyebrow: "Guía de viaje",
    keywords: ["excursiones Montecristi", "tour Montecristi", "paseos en Montecristi"],
    sections: [
      {
        heading: "Qué tipo de excursión buscas",
        paragraphs: [
          "Montecristi ofrece planes de naturaleza, recorridos históricos, pesca, paseos en bote y experiencias gastronómicas. Define primero si quieres pasar el día en el agua, conocer la ciudad o combinar varias actividades.",
          "Pregunta por la duración, el punto de salida, el tamaño del grupo, lo que incluye el precio y el equipo de seguridad. Un operador local responsable debe explicar las condiciones del recorrido con claridad.",
        ],
      },
    ],
  },
  {
    slug: "odontologo-en-montecristi",
    title: "Odontólogo en Montecristi: cómo encontrar atención dental confiable",
    excerpt: "Recomendaciones para buscar un odontólogo en Montecristi y elegir una consulta según tus necesidades.",
    eyebrow: "Servicios locales",
    keywords: ["odontólogo en Montecristi", "dentista en Montecristi", "clínica dental Montecristi"],
    sections: [
      {
        heading: "Qué preguntar antes de reservar",
        paragraphs: [
          "Si buscas un odontólogo en Montecristi, confirma la ubicación, los horarios, las especialidades disponibles y si atienden emergencias. También pregunta por los métodos de pago y si necesitas una cita previa.",
          "Para tratamientos como limpiezas, restauraciones, ortodoncia o urgencias, compara la experiencia del profesional y las indicaciones que recibas. La información de contacto debe verificarse directamente con el consultorio porque puede cambiar.",
        ],
      },
    ],
  },
  {
    slug: "cayo-levantado-montecristi",
    title: "Cayo Levantado y Montecristi: aclaremos la ruta antes de viajar",
    excerpt: "Una guía para diferenciar Cayo Levantado de los cayos de Montecristi y evitar confusiones al organizar tu viaje.",
    eyebrow: "Guía de viaje",
    keywords: ["Cayo Levantado Montecristi", "cayos de Montecristi", "excursiones Montecristi"],
    sections: [
      {
        heading: "Dos destinos que suelen confundirse",
        paragraphs: [
          "Cayo Levantado es un destino conocido de la provincia Samaná, mientras Montecristi cuenta con sus propios cayos y rutas costeras en el noroeste dominicano. Son zonas diferentes y conviene revisar la provincia, el punto de salida y el tiempo de traslado antes de reservar.",
          "Si encontraste una excursión anunciada con este término, pregunta exactamente qué lugar visitarás. Una descripción clara protege tu presupuesto y te ayuda a elegir la experiencia que realmente deseas.",
        ],
      },
    ],
  },
  {
    slug: "montecristi-grand-grossier",
    title: "Montecristi y Grand Grossier: geografía, historia y memoria del noroeste",
    excerpt: "Explora la relación entre Montecristi, Grand Grossier y la historia geográfica del noroeste dominicano.",
    eyebrow: "Historia y territorio",
    keywords: ["Montecristi Grand Grossier", "Grand Grossier Montecristi", "historia de Montecristi"],
    sections: [
      {
        heading: "Nombres que cuentan la historia del territorio",
        paragraphs: [
          "Grand Grossier aparece asociado a referencias históricas y geográficas del entorno de Montecristi. Estos nombres ayudan a entender cómo se ha descrito la costa y cómo han cambiado los mapas, las rutas y las comunidades del noroeste.",
          "La investigación de topónimos requiere consultar mapas históricos y fuentes especializadas. Esta guía servirá como punto de partida para reunir esa memoria y explicar el territorio de forma sencilla.",
        ],
      },
    ],
  },
];

export const montecristiGuideKeywords = montecristiGuides.flatMap((guide) => guide.keywords);
