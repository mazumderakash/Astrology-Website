(function () {
  const languageIndexes = { es: 0, hi: 1, bn: 2 };
  const translations = {
    'JyotishLab | Vedic Astrology': ['JyotishLab | Astrologia vedica', 'ज्योतिषलैब | वैदिक ज्योतिष', 'জ্যোতিষল্যাব | বৈদিক জ্যোতিষ'],
    'Home': ['Inicio', 'होम', 'হোম'],
    'JyotishLab home': ['Inicio de JyotishLab', 'JyotishLab होम', 'JyotishLab হোম'],
    'JyotishLab logo': ['Logotipo de JyotishLab', 'JyotishLab लोगो', 'JyotishLab লোগো'],
    'Breadcrumb': ['Ruta de navegación', 'ब्रेडक्रंब', 'ব্রেডক্রাম্ব'],
    'Toggle navigation': ['Alternar navegación', 'नेविगेशन टॉगल करें', 'নেভিগেশন টগল করুন'],
    'Birth Chart Preparation': ['Preparación de la carta natal', 'जन्म कुंडली की तैयारी', 'জন্মকুণ্ডলী প্রস্তুতি'],
    'Ask JyotishLab': ['Pregunta a JyotishLab', 'JyotishLab से पूछें', 'JyotishLab-কে জিজ্ঞাসা করুন'],
    'Daily Panchang': ['Panchang diario', 'दैनिक पंचांग', 'দৈনিক পঞ্জিকা'],
    'Zodiac Guide': ['Guía del zodiaco', 'राशि मार्गदर्शिका', 'রাশিচক্র নির্দেশিকা'],
    'Consultation': ['Consulta', 'परामर्श', 'পরামর্শ'],
    'Login': ['Iniciar sesión', 'लॉग इन', 'লগ ইন'],
    'Register': ['Registrarse', 'पंजीकरण', 'নিবন্ধন'],
    'Language': ['Idioma', 'भाषा', 'ভাষা'],
    'Select language': ['Seleccionar idioma', 'भाषा चुनें', 'ভাষা নির্বাচন করুন'],
    'Dark mode': ['Modo oscuro', 'डार्क मोड', 'ডার্ক মোড'],
    'Light mode': ['Modo claro', 'लाइट मोड', 'লাইট মোড'],
    'Ancient Wisdom': ['Sabiduría ancestral', 'प्राचीन ज्ञान', 'প্রাচীন জ্ঞান'],
    'Precise Calculations': ['Cálculos precisos', 'सटीक गणनाएँ', 'নির্ভুল গণনা'],
    'Deeper Insights': ['Perspectivas más profundas', 'गहन अंतर्दृष्टि', 'গভীর উপলব্ধি'],
    'Vedic Astrology for a Deeper Understanding of Life': ['Astrología védica para comprender mejor la vida', 'जीवन को गहराई से समझने के लिए वैदिक ज्योतिष', 'জীবনকে গভীরভাবে বোঝার জন্য বৈদিক জ্যোতিষ'],
    'Explore your birth chart, planetary periods, yogas, and life timing through traditional Jyotisha knowledge and thoughtful astrological analysis.': ['Explora tu carta natal, períodos planetarios, yogas y etapas de la vida mediante el conocimiento tradicional del Jyotisha y un análisis astrológico cuidadoso.', 'पारंपरिक ज्योतिष ज्ञान और विचारपूर्ण ज्योतिषीय विश्लेषण से अपनी जन्म कुंडली, ग्रहों की दशाओं, योगों और जीवन के समय-चक्र को जानें।', 'প্রথাগত জ্যোতিষ জ্ঞান ও মননশীল জ্যোতিষ বিশ্লেষণের মাধ্যমে জন্মকুণ্ডলী, গ্রহের দশা, যোগ এবং জীবনের সময়চক্র জানুন।'],
    'Create Your Chart': ['Crear tu carta', 'अपनी कुंडली बनाएँ', 'আপনার কুণ্ডলী তৈরি করুন'],
    'Explore Daily Panchang': ['Explorar el Panchang diario', 'दैनिक पंचांग देखें', 'দৈনিক পঞ্জিকা দেখুন'],
    'Chart': ['Carta', 'कुंडली', 'কুণ্ডলী'],
    'NATAL CHART': ['CARTA NATAL', 'जन्म कुंडली', 'জন্মকুণ্ডলী'],
    'Enter birth details to prepare a natal chart using the live kundli API.': ['Introduce los datos de nacimiento para crear una carta natal con la API de kundli.', 'लाइव कुंडली API से जन्म कुंडली बनाने के लिए जन्म विवरण भरें।', 'লাইভ কুণ্ডলী API দিয়ে জন্মকুণ্ডলী তৈরি করতে জন্মের তথ্য দিন।'],
    'Name': ['Nombre', 'नाम', 'নাম'],
    '(optional)': ['(opcional)', '(वैकल्पिक)', '(ঐচ্ছিক)'],
    'Your name': ['Tu nombre', 'आपका नाम', 'আপনার নাম'],
    'Date': ['Fecha', 'तारीख', 'তারিখ'],
    'Time': ['Hora', 'समय', 'সময়'],
    'Birth day': ['Día de nacimiento', 'जन्म का दिन', 'জন্মদিন'],
    'Birth month': ['Mes de nacimiento', 'जन्म का महीना', 'জন্মমাস'],
    'Birth year': ['Año de nacimiento', 'जन्म का वर्ष', 'জন্মবছর'],
    'Birth hour': ['Hora de nacimiento', 'जन्म का घंटा', 'জন্মের ঘণ্টা'],
    'Birth minute': ['Minuto de nacimiento', 'जन्म का मिनट', 'জন্মের মিনিট'],
    'AM or PM': ['AM o PM', 'पूर्वाह्न या अपराह्न', 'AM বা PM'],
    'Place of Birth': ['Lugar de nacimiento', 'जन्म स्थान', 'জন্মস্থান'],
    'Place name (e.g. New Delhi)': ['Lugar (p. ej., Nueva Delhi)', 'स्थान का नाम (जैसे नई दिल्ली)', 'স্থানের নাম (যেমন নয়াদিল্লি)'],
    'Place suggestions': ['Sugerencias de lugares', 'स्थान सुझाव', 'স্থানের পরামর্শ'],
    'Panchang location suggestions': ['Sugerencias de ubicación del Panchang', 'पंचांग स्थान सुझाव', 'পঞ্জিকার অবস্থানের পরামর্শ'],
    'Timezone': ['Zona horaria', 'समय क्षेत्र', 'সময় অঞ্চল'],
    '(automatic)': ['(automática)', '(स्वचालित)', '(স্বয়ংক্রিয়)'],
    'Calculated from place and birth time': ['Calculada según el lugar y la hora de nacimiento', 'स्थान और जन्म समय के आधार पर गणना', 'স্থান ও জন্মসময় থেকে গণনা করা'],
    'Latitude': ['Latitud', 'अक्षांश', 'অক্ষাংশ'],
    'Longitude': ['Longitud', 'देशांतर', 'দ্রাঘিমাংশ'],
    'Resolved automatically': ['Determinada automáticamente', 'स्वचालित रूप से निर्धारित', 'স্বয়ংক্রিয়ভাবে নির্ধারিত'],
    'Prepare Chart': ['Crear carta', 'कुंडली तैयार करें', 'কুণ্ডলী তৈরি করুন'],
    'Reset': ['Restablecer', 'रीसेट', 'রিসেট'],
    'Birth Details': ['Datos de nacimiento', 'जन्म विवरण', 'জন্মের বিবরণ'],
    'Preview PDF': ['Vista previa del PDF', 'PDF पूर्वावलोकन', 'PDF প্রিভিউ'],
    'Download PDF': ['Descargar PDF', 'PDF डाउनलोड करें', 'PDF ডাউনলোড করুন'],
    'Complete Birth Details': ['Datos completos de nacimiento', 'जन्म का पूरा विवरण', 'জন্মের সম্পূর্ণ বিবরণ'],
    'Birth Chart': ['Carta natal', 'जन्म कुंडली', 'জন্মকুণ্ডলী'],
    'Birth chart style': ['Estilo de carta natal', 'जन्म कुंडली शैली', 'জন্মকুণ্ডলীর ধরন'],
    'North Indian': ['Estilo del norte de India', 'उत्तर भारतीय शैली', 'উত্তর ভারতীয় রীতি'],
    'South Indian': ['Estilo del sur de India', 'दक्षिण भारतीय शैली', 'দক্ষিণ ভারতীয় রীতি'],
    'East Indian': ['Estilo del este de India', 'पूर्व भारतीय शैली', 'পূর্ব ভারতীয় রীতি'],
    'Birth Chart PDF Preview': ['Vista previa del PDF de la carta natal', 'जन्म कुंडली PDF पूर्वावलोकन', 'জন্মকুণ্ডলী PDF প্রিভিউ'],
    'Birth chart PDF preview': ['Vista previa del PDF de la carta natal', 'जन्म कुंडली PDF पूर्वावलोकन', 'জন্মকুণ্ডলী PDF প্রিভিউ'],
    'Close': ['Cerrar', 'बंद करें', 'বন্ধ করুন'],
    'Planets': ['Planetas', 'ग्रह', 'গ্রহ'],
    'Sign': ['Signo', 'राशि', 'রাশি'],
    'Degree': ['Grado', 'अंश', 'ডিগ্রি'],
    'Nakshatra': ['Nakshatra', 'नक्षत्र', 'নক্ষত্র'],
    'Ascendant': ['Ascendente', 'लग्न', 'লগ্ন'],
    'Pada': ['Pada', 'पाद', 'পদ'],
    'Nakshatra Lord': ['Regente del nakshatra', 'नक्षत्र स्वामी', 'নক্ষত্র অধিপতি'],
    'Karaka': ['Karaka', 'कारक', 'কারক'],
    'Atmakaraka': ['Indicador del alma', 'आत्मकारक', 'আত্মকারক'],
    'Amatyakaraka': ['Indicador del ministerio', 'अमात्यकारक', 'অমাত্যকারক'],
    'Bhratrikaraka': ['Indicador de hermanos', 'भ्रातृकारक', 'ভ্রাতৃকারক'],
    'Matrikaraka': ['Indicador materno', 'मातृकारक', 'মাতৃকারক'],
    'Putrakaraka': ['Indicador de hijos', 'पुत्रकारक', 'পুত্রকারক'],
    'Gnatikaraka': ['Indicador de parientes', 'ज्ञातिकारक', 'জ্ঞাতিকরক'],
    'Darakaraka': ['Indicador de pareja', 'दारकारक', 'দারকারক'],
    'Planetary Aspects': ['Aspectos planetarios', 'ग्रहीय दृष्टि', 'গ্রহদৃষ্টি'],
    'Navatara Chakra': ['Chakra Navatara', 'नवतारा चक्र', 'নবতারা চক্র'],
    'Chart section controls': ['Controles de secciones de la carta', 'कुंडली अनुभाग नियंत्रण', 'কুণ্ডলী বিভাগের নিয়ন্ত্রণ'],
    'Expand All': ['Expandir todo', 'सभी खोलें', 'সব প্রসারিত করুন'],
    'Collapse All': ['Contraer todo', 'सभी बंद करें', 'সব গুটিয়ে নিন'],
    'Planet': ['Planeta', 'ग्रह', 'গ্রহ'],
    'Aspect': ['Aspecto', 'दृष्टि', 'দৃষ্টি'],
    'Planets Aspected': ['Planetas aspectados', 'दृष्ट ग्रह', 'দৃষ্ট গ্রহ'],
    'No aspect': ['Sin aspecto', 'कोई दृष्टि नहीं', 'কোনো দৃষ্টি নেই'],
    'No planets in aspected houses.': ['No hay planetas en las casas aspectadas.', 'दृष्ट भावों में कोई ग्रह नहीं है।', 'দৃষ্ট ভাবে কোনো গ্রহ নেই।'],
    'Prepare a chart to load planetary aspects.': ['Crea una carta para cargar los aspectos planetarios.', 'ग्रहीय दृष्टि देखने के लिए कुंडली बनाएँ।', 'গ্রহদৃষ্টি দেখতে একটি কুণ্ডলী তৈরি করুন।'],
    '7th': ['7.º', '7वाँ', '৭ম'],
    '4th, 7th, 8th': ['4.º, 7.º, 8.º', '4था, 7वाँ, 8वाँ', '৪র্থ, ৭ম, ৮ম'],
    '5th, 7th, 9th': ['5.º, 7.º, 9.º', '5वाँ, 7वाँ, 9वाँ', '৫ম, ৭ম, ৯ম'],
    '3rd, 7th, 10th': ['3.º, 7.º, 10.º', '3रा, 7वाँ, 10वाँ', '৩য়, ৭ম, ১০ম'],
    '5th, 9th, 12th': ['5.º, 9.º, 12.º', '5वाँ, 9वाँ, 12वाँ', '৫ম, ৯ম, ১২তম'],
    'Prepare a chart to load planet details.': ['Crea una carta para cargar los detalles de los planetas.', 'ग्रहों का विवरण देखने के लिए कुंडली बनाएँ।', 'গ্রহের বিবরণ দেখতে একটি কুণ্ডলী তৈরি করুন।'],
    'Vimshottari Dasha Periods': ['Períodos de Dasha Vimshottari', 'विंशोत्तरी दशा अवधि', 'বিংশোত্তরী দশার সময়কাল'],
    'Mahadasha': ['Mahadasha', 'महादशा', 'মহাদশা'],
    'Antardasha': ['Antardasha', 'अंतर्दशा', 'অন্তর্দশা'],
    'Start': ['Inicio', 'आरंभ', 'শুরু'],
    'End': ['Fin', 'समाप्ति', 'শেষ'],
    'Duration': ['Duración', 'अवधि', 'সময়কাল'],
    'Status': ['Estado', 'स्थिति', 'অবস্থা'],
    'Before Birth': ['Antes del nacimiento', 'जन्म से पहले', 'জন্মের আগে'],
    'At Birth': ['Al nacer', 'जन्म के समय', 'জন্মের সময়'],
    'Completed': ['Completado', 'पूर्ण', 'সম্পন্ন'],
    'Running': ['En curso', 'चल रही है', 'চলমান'],
    'Upcoming': ['Próximo', 'आगामी', 'আসন্ন'],
    'Prepare a chart to load dasha periods.': ['Crea una carta para cargar los períodos de dasha.', 'दशा अवधि देखने के लिए कुंडली बनाएँ।', 'দশার সময়কাল দেখতে একটি কুণ্ডলী তৈরি করুন।'],
    'House Interpretation': ['Interpretación de casas', 'भावों का विश्लेषण', 'ভাবের বিশ্লেষণ'],
    'House Number': ['Número de casa', 'भाव संख्या', 'ভাব নম্বর'],
    'Planets Posited': ['Planetas ubicados', 'स्थित ग्रह', 'অবস্থিত গ্রহ'],
    'Prepare a chart to load house interpretation.': ['Crea una carta para cargar la interpretación de las casas.', 'भावों का विश्लेषण देखने के लिए कुंडली बनाएँ।', 'ভাবের বিশ্লেষণ দেখতে একটি কুণ্ডলী তৈরি করুন।'],
    'Ashtakavarga Strength': ['Fuerza de Ashtakavarga', 'अष्टकवर्ग बल', 'অষ্টকবর্গ শক্তি'],
    'Prepare a chart to load Ashtakavarga strength.': ['Crea una carta para cargar la fuerza de Ashtakavarga.', 'अष्टकवर्ग बल देखने के लिए कुंडली बनाएँ।', 'অষ্টকবর্গ শক্তি দেখতে একটি কুণ্ডলী তৈরি করুন।'],
    'PERSONAL CHART GUIDE': ['GUÍA PERSONAL DE LA CARTA', 'व्यक्तिगत कुंडली मार्गदर्शिका', 'ব্যক্তিগত কুণ্ডলী নির্দেশিকা'],
    'Share your birth details naturally. You can send everything at once or fill in what is missing as we go.': ['Comparte tus datos de nacimiento con naturalidad. Puedes enviarlos todos juntos o completar lo que falte.', 'जन्म विवरण सहज रूप से बताएँ। सब कुछ एक साथ भेजें या बातचीत के दौरान छूटी जानकारी जोड़ें।', 'স্বাভাবিকভাবে জন্মের তথ্য জানান। একসঙ্গে সব পাঠাতে পারেন, অথবা কথোপকথনে বাকি তথ্য যোগ করতে পারেন।'],
    'Tell me your birth date, time, and place. For example: “Born on 27 Nov 1988 at noon in Kolkata.”': ['Dime tu fecha, hora y lugar de nacimiento. Por ejemplo: «Nací el 27 de noviembre de 1988 al mediodía en Calcuta».', 'अपनी जन्मतिथि, समय और स्थान बताएँ। उदाहरण: “27 नवंबर 1988 को दोपहर में कोलकाता में जन्म।”', 'জন্মতারিখ, সময় ও স্থান জানান। যেমন: “২৭ নভেম্বর ১৯৮৮ দুপুরে কলকাতায় জন্ম।”'],
    'Your birth details': ['Tus datos de nacimiento', 'आपका जन्म विवरण', 'আপনার জন্মের তথ্য'],
    'Type your birth details...': ['Escribe tus datos de nacimiento…', 'अपने जन्म का विवरण लिखें…', 'জন্মের তথ্য লিখুন…'],
    'Start voice input': ['Iniciar entrada de voz', 'आवाज़ से लिखना शुरू करें', 'ভয়েস ইনপুট শুরু করুন'],
    'Stop voice input': ['Detener entrada de voz', 'आवाज़ से लिखना रोकें', 'ভয়েস ইনপুট বন্ধ করুন'],
    'Speak your birth details': ['Di tus datos de nacimiento', 'अपने जन्म का विवरण बोलें', 'জন্মের তথ্য বলুন'],
    'Send': ['Enviar', 'भेजें', 'পাঠান'],
    'BIRTH DETAILS': ['DATOS DE NACIMIENTO', 'जन्म विवरण', 'জন্মের তথ্য'],
    'Confirm your details': ['Confirma tus datos', 'अपने विवरण की पुष्टि करें', 'আপনার তথ্য নিশ্চিত করুন'],
    'Date of Birth': ['Fecha de nacimiento', 'जन्मतिथि', 'জন্মতারিখ'],
    'Time of Birth': ['Hora de nacimiento', 'जन्म समय', 'জন্মসময়'],
    'Generate Chart': ['Generar carta', 'कुंडली बनाएँ', 'কুণ্ডলী তৈরি করুন'],
    'Your Vedic birth chart is ready.': ['Tu carta natal védica está lista.', 'आपकी वैदिक जन्म कुंडली तैयार है।', 'আপনার বৈদিক জন্মকুণ্ডলী প্রস্তুত।'],
    'View My Chart': ['Ver mi carta', 'मेरी कुंडली देखें', 'আমার কুণ্ডলী দেখুন'],
    'Location': ['Ubicación', 'स्थान', 'অবস্থান'],
    'Local time': ['Hora local', 'स्थानीय समय', 'স্থানীয় সময়'],
    'Calculate Panchang': ['Calcular Panchang', 'पंचांग की गणना करें', 'পঞ্জিকা গণনা করুন'],
    'Search a city or place': ['Buscar una ciudad o lugar', 'शहर या स्थान खोजें', 'শহর বা স্থান খুঁজুন'],
    'Calculations use the selected location, date, and local time.': ['Los cálculos usan la ubicación, fecha y hora local seleccionadas.', 'गणना में चुने गए स्थान, तारीख और स्थानीय समय का उपयोग होता है।', 'গণনায় নির্বাচিত স্থান, তারিখ ও স্থানীয় সময় ব্যবহার করা হয়।'],
    'Loading today’s calculations…': ['Cargando los cálculos de hoy…', 'आज की गणना लोड हो रही है…', 'আজকের গণনা লোড হচ্ছে…'],
    'Book a consultation with an astrologer.': ['Reserva una consulta con un astrólogo.', 'ज्योतिषी से परामर्श बुक करें।', 'একজন জ্যোতিষীর সঙ্গে পরামর্শের সময় নিন।'],
    'Your Name': ['Tu nombre', 'आपका नाम', 'আপনার নাম'],
    'Email': ['Correo electrónico', 'ईमेल', 'ইমেল'],
    'Phone Number': ['Número de teléfono', 'फ़ोन नंबर', 'ফোন নম্বর'],
    'General Guidance': ['Orientación general', 'सामान्य मार्गदर्शन', 'সাধারণ পরামর্শ'],
    'Career': ['Carrera profesional', 'करियर', 'কর্মজীবন'],
    'Love & Marriage': ['Amor y matrimonio', 'प्रेम और विवाह', 'প্রেম ও বিবাহ'],
    'Health': ['Salud', 'स्वास्थ्य', 'স্বাস্থ্য'],
    'Business': ['Negocios', 'व्यवसाय', 'ব্যবসা'],
    'Brief details': ['Breve descripción', 'संक्षिप्त विवरण', 'সংক্ষিপ্ত বিবরণ'],
    'Request Consultation': ['Solicitar consulta', 'परामर्श का अनुरोध करें', 'পরামর্শের অনুরোধ করুন'],
    'Welcome back. Sign in with your mobile number and OTP.': ['Te damos la bienvenida. Inicia sesión con tu número de móvil y el código OTP.', 'वापसी पर स्वागत है। मोबाइल नंबर और OTP से लॉग इन करें।', 'ফিরে আসার জন্য স্বাগতম। মোবাইল নম্বর ও OTP দিয়ে লগ ইন করুন।'],
    'Send OTP': ['Enviar OTP', 'OTP भेजें', 'OTP পাঠান'],
    'Enter OTP': ['Introduce el OTP', 'OTP दर्ज करें', 'OTP লিখুন'],
    'Create an account with your mobile number and OTP verification.': ['Crea una cuenta con tu número de móvil y verificación OTP.', 'मोबाइल नंबर और OTP सत्यापन से खाता बनाएँ।', 'মোবাইল নম্বর ও OTP যাচাই করে অ্যাকাউন্ট তৈরি করুন।'],
    'Full Name': ['Nombre completo', 'पूरा नाम', 'পুরো নাম'],
    'Verify & Create Account': ['Verificar y crear cuenta', 'सत्यापित करें और खाता बनाएँ', 'যাচাই করে অ্যাকাউন্ট তৈরি করুন'],
    'Aries': ['Aries', 'मेष', 'মেষ'],
    'Taurus': ['Tauro', 'वृषभ', 'বৃষ'],
    'Gemini': ['Géminis', 'मिथुन', 'মিথুন'],
    'Cancer': ['Cáncer', 'कर्क', 'কর্কট'],
    'Leo': ['Leo', 'सिंह', 'সিংহ'],
    'Virgo': ['Virgo', 'कन्या', 'কন্যা'],
    'Libra': ['Libra', 'तुला', 'তুলা'],
    'Scorpio': ['Escorpio', 'वृश्चिक', 'বৃশ্চিক'],
    'Sagittarius': ['Sagitario', 'धनु', 'ধনু'],
    'Capricorn': ['Capricornio', 'मकर', 'মকর'],
    'Aquarius': ['Acuario', 'कुंभ', 'কুম্ভ'],
    'Pisces': ['Piscis', 'मीन', 'মীন'],
    'Initiative': ['Iniciativa', 'पहल', 'উদ্যোগ'],
    'Courage': ['Valentía', 'साहस', 'সাহস'],
    'Pioneering': ['Espíritu pionero', 'अग्रणी भावना', 'অগ্রণী মনোভাব'],
    'Stability': ['Estabilidad', 'स्थिरता', 'স্থিতিশীলতা'],
    'Patience': ['Paciencia', 'धैर्य', 'ধৈর্য'],
    'Steadfastness': ['Constancia', 'दृढ़ता', 'অটলতা'],
    'Curiosity': ['Curiosidad', 'जिज्ञासा', 'কৌতূহল'],
    'Communication': ['Comunicación', 'संचार', 'যোগাযোগ'],
    'Adaptability': ['Adaptabilidad', 'अनुकूलनशीलता', 'অভিযোজন ক্ষমতা'],
    'Nurturing': ['Cuidado', 'पालन-पोषण', 'লালন-পালন'],
    'Protection': ['Protección', 'सुरक्षा', 'সুরক্ষা'],
    'Emotional Depth': ['Profundidad emocional', 'भावनात्मक गहराई', 'আবেগের গভীরতা'],
    'Leadership': ['Liderazgo', 'नेतृत्व', 'নেতৃত্ব'],
    'Creativity': ['Creatividad', 'रचनात्मकता', 'সৃজনশীলতা'],
    'Confidence': ['Confianza', 'आत्मविश्वास', 'আত্মবিশ্বাস'],
    'Analysis': ['Análisis', 'विश्लेषण', 'বিশ্লেষণ'],
    'Service': ['Servicio', 'सेवा', 'সেবা'],
    'Precision': ['Precisión', 'सटीकता', 'নির্ভুলতা'],
    'Balance': ['Equilibrio', 'संतुलन', 'ভারসাম্য'],
    'Diplomacy': ['Diplomacia', 'कूटनीति', 'কূটনীতি'],
    'Partnership': ['Alianza', 'साझेदारी', 'অংশীদারিত্ব'],
    'Depth': ['Profundidad', 'गहराई', 'গভীরতা'],
    'Resilience': ['Resiliencia', 'लचीलापन', 'সহনশীলতা'],
    'Transformation': ['Transformación', 'परिवर्तन', 'রূপান্তর'],
    'Wisdom': ['Sabiduría', 'ज्ञान', 'প্রজ্ঞা'],
    'Exploration': ['Exploración', 'अन्वेषण', 'অনুসন্ধান'],
    'Aspiration': ['Aspiración', 'आकांक्षा', 'আকাঙ্ক্ষা'],
    'Ambition': ['Ambición', 'महत्वाकांक्षा', 'উচ্চাকাঙ্ক্ষা'],
    'Discipline': ['Disciplina', 'अनुशासन', 'শৃঙ্খলা'],
    'Perseverance': ['Perseverancia', 'दृढ़ संकल्प', 'অধ্যবসায়'],
    'Independence': ['Independencia', 'स्वतंत्रता', 'স্বাধীনতা'],
    'Innovation': ['Innovación', 'नवाचार', 'উদ্ভাবন'],
    'Community': ['Comunidad', 'समुदाय', 'সম্প্রদায়'],
    'Compassion': ['Compasión', 'करुणा', 'সহমর্মিতা'],
    'Intuition': ['Intuición', 'अंतर्ज्ञान', 'অন্তর্দৃষ্টি'],
    'Spirituality': ['Espiritualidad', 'आध्यात्मिकता', 'আধ্যাত্মিকতা'],
    'Aries (Mesha Rashi), ruled by Mars, is associated with initiative, courage, independence, and pioneering action.': ['Aries (Mesha Rashi), regido por Marte, se asocia con iniciativa, valentía, independencia y espíritu pionero.', 'मंगल द्वारा शासित मेष (मेष राशि) पहल, साहस, स्वतंत्रता और अग्रणी भावना से जुड़ा है।', 'মঙ্গল-শাসিত মেষ (মেষ রাশি) উদ্যোগ, সাহস, স্বাধীনতা ও অগ্রণী কর্মের সঙ্গে যুক্ত।'],
    'Taurus (Vrishabha Rashi) values stability, patience, comfort, and the steady growth of resources.': ['Tauro (Vrishabha Rashi) valora la estabilidad, la paciencia, el bienestar y el crecimiento constante de los recursos.', 'वृषभ (वृषभ राशि) स्थिरता, धैर्य, सुख-सुविधा और संसाधनों की निरंतर वृद्धि को महत्व देता है।', 'বৃষ (বৃষ রাশি) স্থিতি, ধৈর্য, স্বাচ্ছন্দ্য ও সম্পদের ধারাবাহিক বৃদ্ধিকে গুরুত্ব দেয়।'],
    'Gemini (Mithuna Rashi), ruled by Mercury, is linked with curiosity, adaptability, communication, and the exchange of ideas.': ['Géminis (Mithuna Rashi), regido por Mercurio, se relaciona con la curiosidad, la adaptabilidad, la comunicación y el intercambio de ideas.', 'बुध द्वारा शासित मिथुन (मिथुन राशि) जिज्ञासा, अनुकूलनशीलता, संचार और विचारों के आदान-प्रदान से जुड़ा है।', 'বুধ-শাসিত মিথুন (মিথুন রাশি) কৌতূহল, অভিযোজন, যোগাযোগ ও ভাবের আদান-প্রদানের সঙ্গে যুক্ত।'],
    'Cancer (Karka Rashi), ruled by the Moon, is linked with nurturing, protection, emotional depth, and a secure home life.': ['Cáncer (Karka Rashi), regido por la Luna, se relaciona con el cuidado, la protección, la profundidad emocional y la seguridad del hogar.', 'चंद्रमा द्वारा शासित कर्क (कर्क राशि) पालन-पोषण, सुरक्षा, भावनात्मक गहराई और सुरक्षित पारिवारिक जीवन से जुड़ा है।', 'চন্দ্র-শাসিত কর্কট (কর্ক রাশি) যত্ন, সুরক্ষা, আবেগের গভীরতা ও নিরাপদ পারিবারিক জীবনের সঙ্গে যুক্ত।'],
    'Leo (Simha Rashi), ruled by the Sun, expresses confidence, leadership, creativity, and a strong sense of purpose.': ['Leo (Simha Rashi), regido por el Sol, expresa confianza, liderazgo, creatividad y un firme sentido de propósito.', 'सूर्य द्वारा शासित सिंह (सिंह राशि) आत्मविश्वास, नेतृत्व, रचनात्मकता और दृढ़ उद्देश्य-बोध दर्शाता है।', 'সূর্য-শাসিত সিংহ (সিংহ রাশি) আত্মবিশ্বাস, নেতৃত্ব, সৃজনশীলতা ও দৃঢ় লক্ষ্যবোধ প্রকাশ করে।'],
    'Virgo (Kanya Rashi), ruled by Mercury, combines practical intelligence with analysis, precision, and a drive to improve.': ['Virgo (Kanya Rashi), regido por Mercurio, combina inteligencia práctica, análisis, precisión y deseo de mejorar.', 'बुध द्वारा शासित कन्या (कन्या राशि) व्यावहारिक बुद्धि, विश्लेषण, सटीकता और सुधार की प्रवृत्ति का मेल है।', 'বুধ-শাসিত কন্যা (কন্যা রাশি) বাস্তব বুদ্ধি, বিশ্লেষণ, নির্ভুলতা ও উন্নতির আগ্রহকে একত্র করে।'],
    'Libra (Tula Rashi), ruled by Venus, brings diplomacy, partnership, fairness, and a desire for balance.': ['Libra (Tula Rashi), regido por Venus, aporta diplomacia, colaboración, equidad y búsqueda de equilibrio.', 'शुक्र द्वारा शासित तुला (तुला राशि) कूटनीति, साझेदारी, निष्पक्षता और संतुलन की चाह से जुड़ी है।', 'শুক্র-শাসিত তুলা (তুলা রাশি) কূটনীতি, অংশীদারিত্ব, ন্যায়বোধ ও ভারসাম্যের আকাঙ্ক্ষা আনে।'],
    'Scorpio (Vrishchika Rashi), ruled by Mars, brings emotional depth, determination, resilience, and transformation.': ['Escorpio (Vrishchika Rashi), regido por Marte, aporta profundidad emocional, determinación, resiliencia y transformación.', 'मंगल द्वारा शासित वृश्चिक (वृश्चिक राशि) भावनात्मक गहराई, दृढ़ता, सहनशीलता और परिवर्तन से जुड़ा है।', 'মঙ্গল-শাসিত বৃশ্চিক (বৃশ্চিক রাশি) আবেগের গভীরতা, দৃঢ়তা, সহনশীলতা ও রূপান্তরের সঙ্গে যুক্ত।'],
    'Sagittarius (Dhanu Rashi), ruled by Jupiter, seeks wisdom, exploration, and higher meaning.': ['Sagitario (Dhanu Rashi), regido por Júpiter, busca sabiduría, exploración y un sentido más elevado.', 'बृहस्पति द्वारा शासित धनु (धनु राशि) ज्ञान, अन्वेषण और उच्चतर अर्थ की खोज करता है।', 'বৃহস্পতি-শাসিত ধনু (ধনু রাশি) প্রজ্ঞা, অন্বেষণ ও উচ্চতর অর্থের সন্ধান করে।'],
    'Capricorn (Makara Rashi), ruled by Saturn, combines ambition, discipline, and patient effort toward long-term goals.': ['Capricornio (Makara Rashi), regido por Saturno, combina ambición, disciplina y esfuerzo paciente hacia metas a largo plazo.', 'शनि द्वारा शासित मकर (मकर राशि) महत्वाकांक्षा, अनुशासन और दीर्घकालिक लक्ष्यों के लिए धैर्यपूर्ण प्रयास का मेल है।', 'শনি-শাসিত মকর (মকর রাশি) উচ্চাকাঙ্ক্ষা, শৃঙ্খলা ও দীর্ঘমেয়াদি লক্ষ্যে ধৈর্যশীল প্রচেষ্টার সমন্বয়।'],
    'Aquarius (Kumbha Rashi), ruled by Saturn, brings independence, innovation, and a systems-minded concern for communities.': ['Acuario (Kumbha Rashi), regido por Saturno, aporta independencia, innovación e interés por los sistemas comunitarios.', 'शनि द्वारा शासित कुंभ (कुंभ राशि) स्वतंत्रता, नवाचार और समुदाय से जुड़े तंत्रों के प्रति सोच दर्शाता है।', 'শনি-শাসিত কুম্ভ (কুম্ভ রাশি) স্বাধীনতা, উদ্ভাবন ও সমাজব্যবস্থা নিয়ে চিন্তা আনে।'],
    'Pisces (Meena Rashi), ruled by Jupiter, brings compassion, intuition, imagination, and spiritual depth.': ['Piscis (Meena Rashi), regido por Júpiter, aporta compasión, intuición, imaginación y profundidad espiritual.', 'बृहस्पति द्वारा शासित मीन (मीन राशि) करुणा, अंतर्ज्ञान, कल्पनाशक्ति और आध्यात्मिक गहराई से जुड़ा है।', 'বৃহস্পতি-শাসিত মীন (মীন রাশি) সহমর্মিতা, অন্তর্দৃষ্টি, কল্পনা ও আধ্যাত্মিক গভীরতা আনে।'],
    'Explore Detailed Overview': ['Ver descripción detallada', 'विस्तृत जानकारी देखें', 'বিস্তারিত বিবরণ দেখুন'],
    'Sign Overview': ['Descripción del signo', 'राशि का परिचय', 'রাশির পরিচিতি'],
    'Today’s Panchang': ['Panchang de hoy', 'आज का पंचांग', 'আজকের পঞ্জিকা'],
    'Tithi': ['Tithi', 'तिथि', 'তিথি'],
    'Vara': ['Día de la semana', 'वार', 'বার'],
    'Yoga': ['Yoga', 'योग', 'যোগ'],
    'Karana': ['Karana', 'करण', 'করণ'],
    'Sunrise': ['Amanecer', 'सूर्योदय', 'সূর্যোদয়'],
    'Sunset': ['Atardecer', 'सूर्यास्त', 'সূর্যাস্ত'],
    'Prepare a chart to load Ashtakavarga strength.': ['Crea una carta para cargar la fuerza de Ashtakavarga.', 'अष्टकवर्ग बल देखने के लिए कुंडली बनाएँ।', 'অষ্টকবর্গ শক্তি দেখতে একটি কুণ্ডলী তৈরি করুন।'],
    'Chart prepared successfully': ['Carta preparada correctamente', 'कुंडली सफलतापूर्वक तैयार हुई', 'কুণ্ডলী সফলভাবে তৈরি হয়েছে'],
    'Enter a location, date, and local time to calculate the Panchang.': ['Introduce una ubicación, fecha y hora local para calcular el Panchang.', 'पंचांग की गणना के लिए स्थान, तारीख और स्थानीय समय दर्ज करें।', 'পঞ্জিকা গণনার জন্য স্থান, তারিখ ও স্থানীয় সময় দিন।'],
    'Unable to load today’s Panchang.': ['No se pudo cargar el Panchang de hoy.', 'आज का पंचांग लोड नहीं हो सका।', 'আজকের পঞ্জিকা লোড করা যায়নি।'],
    'This calculation could not be loaded.': ['No se pudo cargar este cálculo.', 'यह गणना लोड नहीं हो सकी।', 'এই গণনাটি লোড করা যায়নি।'],
    'The Ashtakavarga response did not contain report data.': ['La respuesta de Ashtakavarga no contenía datos del informe.', 'अष्टकवर्ग के उत्तर में रिपोर्ट डेटा नहीं था।', 'অষ্টকবর্গের উত্তরে প্রতিবেদনের তথ্য ছিল না।'],
    'Loading Ashtakavarga strength…': ['Cargando la fuerza de Ashtakavarga…', 'अष्टकवर्ग बल लोड हो रहा है…', 'অষ্টকবর্গ শক্তি লোড হচ্ছে…'],
    'Chart preparation failed.': ['No se pudo preparar la carta.', 'कुंडली तैयार नहीं हो सकी।', 'কুণ্ডলী তৈরি করা যায়নি।'],
    'Unable to load chart SVG': ['No se pudo cargar el SVG de la carta.', 'कुंडली SVG लोड नहीं हो सका।', 'কুণ্ডলীর SVG লোড করা যায়নি।'],
    'Sending your consultation request…': ['Enviando tu solicitud de consulta…', 'आपका परामर्श अनुरोध भेजा जा रहा है…', 'আপনার পরামর্শের অনুরোধ পাঠানো হচ্ছে…'],
    'Your consultation request was sent successfully.': ['Tu solicitud de consulta se envió correctamente.', 'आपका परामर्श अनुरोध सफलतापूर्वक भेजा गया।', 'আপনার পরামর্শের অনুরোধ সফলভাবে পাঠানো হয়েছে।'],
    'Unable to send your consultation request. Please try again later.': ['No se pudo enviar tu solicitud de consulta. Inténtalo de nuevo más tarde.', 'परामर्श अनुरोध भेजा नहीं जा सका। कृपया बाद में फिर कोशिश करें।', 'পরামর্শের অনুরোধ পাঠানো যায়নি। পরে আবার চেষ্টা করুন।'],
    'Not logged in': ['No has iniciado sesión', 'लॉग इन नहीं है', 'লগ ইন করা নেই'],
    'Logged in': ['Sesión iniciada', 'लॉग इन है', 'লগ ইন করা হয়েছে'],
    'Please fill in a valid birth date, birth time, and place of birth.': ['Introduce una fecha, hora y lugar de nacimiento válidos.', 'कृपया सही जन्मतिथि, जन्म समय और जन्म स्थान भरें।', 'সঠিক জন্মতারিখ, সময় ও জন্মস্থান দিন।'],
    'Select a resolved birthplace and wait for its timezone to be calculated before preparing the chart.': ['Selecciona un lugar de nacimiento confirmado y espera a que se calcule la zona horaria antes de crear la carta.', 'कुंडली बनाने से पहले जन्म स्थान चुनें और समय क्षेत्र की गणना पूरी होने दें।', 'কুণ্ডলী তৈরির আগে নিশ্চিত জন্মস্থান বেছে সময় অঞ্চল গণনা হওয়া পর্যন্ত অপেক্ষা করুন।'],
    'Preparing your chart and loading planetary details...': ['Preparando tu carta y cargando los detalles planetarios…', 'आपकी कुंडली तैयार की जा रही है और ग्रहों का विवरण लोड हो रहा है…', 'কুণ্ডলী তৈরি ও গ্রহের বিবরণ লোড হচ্ছে…'],
    'Please enter a phone number first.': ['Introduce primero un número de teléfono.', 'पहले फ़ोन नंबर दर्ज करें।', 'আগে ফোন নম্বর দিন।'],
    'Unable to send OTP.': ['No se pudo enviar el OTP.', 'OTP भेजा नहीं जा सका।', 'OTP পাঠানো যায়নি।'],
    'Login failed.': ['Error al iniciar sesión.', 'लॉग इन विफल हुआ।', 'লগ ইন ব্যর্থ হয়েছে।'],
    'Registration failed.': ['Error en el registro.', 'पंजीकरण विफल हुआ।', 'নিবন্ধন ব্যর্থ হয়েছে।'],
    'Please enter a location, date, and local time to calculate the Panchang.': ['Introduce una ubicación, fecha y hora local para calcular el Panchang.', 'पंचांग की गणना के लिए स्थान, तारीख और स्थानीय समय दर्ज करें।', 'পঞ্জিকা গণনার জন্য স্থান, তারিখ ও স্থানীয় সময় দিন।'],
    'Resolving location and calculating Panchang…': ['Buscando la ubicación y calculando el Panchang…', 'स्थान खोजा जा रहा है और पंचांग की गणना हो रही है…', 'অবস্থান নির্ধারণ করে পঞ্জিকা গণনা হচ্ছে…'],
    'Could not resolve the place timezone.': ['No se pudo determinar la zona horaria del lugar.', 'स्थान का समय क्षेत्र निर्धारित नहीं हो सका।', 'স্থানের সময় অঞ্চল নির্ধারণ করা যায়নি।'],
    'Select the birth date and time to calculate the correct local timezone.': ['Selecciona la fecha y hora de nacimiento para calcular la zona horaria local correcta.', 'सही स्थानीय समय क्षेत्र की गणना के लिए जन्मतिथि और समय चुनें।', 'সঠিক স্থানীয় সময় অঞ্চল গণনা করতে জন্মতারিখ ও সময় বেছে নিন।'],
    'Resolving place and timezone…': ['Buscando el lugar y la zona horaria…', 'स्थान और समय क्षेत्र निर्धारित हो रहा है…', 'স্থান ও সময় অঞ্চল নির্ধারণ হচ্ছে…'],
    'Several places match. Select the correct place from the suggestions.': ['Hay varios lugares coincidentes. Selecciona el lugar correcto en las sugerencias.', 'कई स्थान मिले हैं। सुझावों में से सही स्थान चुनें।', 'একাধিক স্থান পাওয়া গেছে। পরামর্শ থেকে সঠিক স্থানটি বেছে নিন।'],
    'Preparing your PDF…': ['Preparando tu PDF…', 'आपका PDF तैयार हो रहा है…', 'আপনার PDF তৈরি হচ্ছে…'],
    'PDF preview is ready.': ['La vista previa del PDF está lista.', 'PDF पूर्वावलोकन तैयार है।', 'PDF প্রিভিউ প্রস্তুত।'],
    'Birth chart PDF downloaded.': ['Se descargó el PDF de la carta natal.', 'जन्म कुंडली PDF डाउनलोड हो गया।', 'জন্মকুণ্ডলী PDF ডাউনলোড হয়েছে।'],
    'Unable to create the PDF.': ['No se pudo crear el PDF.', 'PDF बनाया नहीं जा सका।', 'PDF তৈরি করা যায়নি।'],
    'No planet data available.': ['No hay datos planetarios disponibles.', 'ग्रहों का डेटा उपलब्ध नहीं है।', 'গ্রহের তথ্য পাওয়া যায়নি।'],
    'No dasha details available.': ['No hay detalles de dasha disponibles.', 'दशा का विवरण उपलब्ध नहीं है।', 'দশার বিবরণ পাওয়া যায়নি।'],
    'Antardasha details are unavailable for this period.': ['No hay detalles de Antardasha para este período.', 'इस अवधि के लिए अंतर्दशा का विवरण उपलब्ध नहीं है।', 'এই সময়ের অন্তর্দশার বিবরণ পাওয়া যায়নি।'],
    'Chart data is unavailable for this birth profile.': ['Los datos de la carta no están disponibles para este perfil natal.', 'इस जन्म विवरण के लिए कुंडली डेटा उपलब्ध नहीं है।', 'এই জন্মতথ্যের জন্য কুণ্ডলীর তথ্য পাওয়া যায়নি।'],
    'Calculated': ['Calculado', 'गणना की गई', 'গণনা করা হয়েছে'],
    'Unavailable': ['No disponible', 'उपलब्ध नहीं', 'পাওয়া যায়নি'],
    'Close': ['Cerrar', 'बंद करें', 'বন্ধ করুন'],
    'English': ['English', 'English', 'English'],
  };

  const zodiacNames = {
    Aries: ['Aries', 'मेष', 'মেষ'], Taurus: ['Tauro', 'वृषभ', 'বৃষ'],
    Gemini: ['Géminis', 'मिथुन', 'মিথুন'], Cancer: ['Cáncer', 'कर्क', 'কর্কট'],
    Leo: ['Leo', 'सिंह', 'সিংহ'], Virgo: ['Virgo', 'कन्या', 'কন্যা'],
    Libra: ['Libra', 'तुला', 'তুলা'], Scorpio: ['Escorpio', 'वृश्चिक', 'বৃশ্চিক'],
    Sagittarius: ['Sagitario', 'धनु', 'ধনু'], Capricorn: ['Capricornio', 'मकर', 'মকর'],
    Aquarius: ['Acuario', 'कुंभ', 'কুম্ভ'], Pisces: ['Piscis', 'मीन', 'মীন'],
  };
  const nakshatraNames = {
    ashwini: ['Ashwini', 'अश्विनी', 'অশ্বিনী'],
    bharani: ['Bharani', 'भरणी', 'ভরণী'], krittika: ['Krittika', 'कृत्तिका', 'কৃত্তিকা'],
    rohini: ['Rohini', 'रोहिणी', 'রোহিণী'], mrigashira: ['Mrigashira', 'मृगशिरा', 'মৃগশিরা'],
    mrigashirsha: ['Mrigashirsha', 'मृगशीर्ष', 'মৃগশীর্ষ'], ardra: ['Ardra', 'आर्द्रा', 'আর্দ্রা'],
    punarvasu: ['Punarvasu', 'पुनर्वसु', 'পুনর্বসু'], pushya: ['Pushya', 'पुष्य', 'পুষ্যা'],
    ashlesha: ['Ashlesha', 'आश्लेषा', 'আশ্লেষা'], magha: ['Magha', 'मघा', 'মঘা'],
    'purva phalguni': ['Purva Phalguni', 'पूर्वा फाल्गुनी', 'পূর্বফাল্গুনী'],
    'uttara phalguni': ['Uttara Phalguni', 'उत्तरा फाल्गुनी', 'উত্তরফাল্গুনী'],
    hasta: ['Hasta', 'हस्त', 'হস্তা'], chitra: ['Chitra', 'चित्रा', 'চিত্রা'],
    swati: ['Swati', 'स्वाति', 'স্বাতী'], vishakha: ['Vishakha', 'विशाखा', 'বিশাখা'],
    anuradha: ['Anuradha', 'अनुराधा', 'অনুরাধা'], jyeshtha: ['Jyeshtha', 'ज्येष्ठा', 'জ্যেষ্ঠা'],
    mula: ['Mula', 'मूल', 'মূলা'], 'purva ashadha': ['Purva Ashadha', 'पूर्वाषाढ़ा', 'পূর্বাষাঢ়া'],
    'uttara ashadha': ['Uttara Ashadha', 'उत्तराषाढ़ा', 'উত্তরাষাঢ়া'],
    shravana: ['Shravana', 'श्रवण', 'শ্রবণা'], dhanishta: ['Dhanishta', 'धनिष्ठा', 'ধনিষ্ঠা'],
    dhanista: ['Dhanishta', 'धनिष्ठा', 'ধনিষ্ঠা'], shatabhisha: ['Shatabhisha', 'शतभिषा', 'শতভিষা'],
    'purva bhadrapada': ['Purva Bhadrapada', 'पूर्वभाद्रपदा', 'পূর্বভাদ্রপদ'],
    'uttara bhadrapada': ['Uttara Bhadrapada', 'उत्तरभाद्रपदा', 'উত্তরভাদ্রপদ'],
    revati: ['Revati', 'रेवती', 'রেবতী'],
  };
  const planetNames = {
    sun: ['Sol', 'सूर्य', 'সূর্য'], moon: ['Luna', 'चंद्रमा', 'চন্দ্র'],
    mars: ['Marte', 'मंगल', 'মঙ্গল'], mercury: ['Mercurio', 'बुध', 'বুধ'],
    jupiter: ['Júpiter', 'बृहस्पति', 'বৃহস্পতি'], venus: ['Venus', 'शुक्र', 'শুক্র'],
    saturn: ['Saturno', 'शनि', 'শনি'], rahu: ['Rahu', 'राहु', 'রাহু'],
    ketu: ['Ketu', 'केतु', 'কেতু'], asc: ['Ascendant', 'लग्न', 'লগ্ন'],
  };
  const planetAbbreviations = {
    Su: ['So', 'सू', 'সূ'], Mo: ['Lu', 'चं', 'চ'], Ma: ['Ma', 'मं', 'ম'],
    Me: ['Me', 'बु', 'বু'], Ju: ['Ju', 'बृ', 'বৃ'], Ve: ['Ve', 'शु', 'শু'],
    Sa: ['Sa', 'श', 'শ'], Ra: ['Ra', 'रा', 'রা'], Ke: ['Ke', 'के', 'কে'],
    Asc: ['Asc', 'लग्न', 'লগ্ন'],
  };
  const textRecords = new WeakMap();
  const attributeRecords = new WeakMap();
  const observedAttributes = ['aria-label', 'placeholder', 'title', 'data-summary'];
  let activeLanguage = 'en';

  function translateValue(value, language = activeLanguage) {
    if (language === 'en') return value;
    const index = languageIndexes[language];
    if (translations[value]) return translations[value][index] || value;
    const signName = Object.keys(zodiacNames).find((name) => name.toLowerCase() === value.toLowerCase());
    if (signName) return zodiacNames[signName][index];
    const ascendantValue = value.match(/^([A-Za-z]+)(\s+[\d.]+°)$/);
    if (ascendantValue) {
      const sign = Object.keys(zodiacNames).find((name) => name.toLowerCase() === ascendantValue[1].toLowerCase());
      if (sign) return `${zodiacNames[sign][index]}${ascendantValue[2]}`;
    }
    const nakshatraValue = value.match(/^(.+?)(?:\s*\(Pada\s+(\d+)\))?$/i);
    if (nakshatraValue) {
      const normalizedNakshatra = nakshatraValue[1].trim().toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
      const nakshatra = nakshatraNames[normalizedNakshatra];
      if (nakshatra) {
        const pada = nakshatraValue[2];
        if (!pada) return nakshatra[index];
        const padaLabel = ['Pada', 'पाद', 'পদ'][index];
        return `${nakshatra[index]} (${padaLabel} ${pada})`;
      }
    }
    const planetName = planetNames[value.toLowerCase()];
    if (planetName) return planetName[index];
    const dashaPair = value.match(/^([A-Za-z]+) - ([A-Za-z]+)$/);
    if (dashaPair) {
      const first = planetNames[dashaPair[1].toLowerCase()];
      const second = planetNames[dashaPair[2].toLowerCase()];
      if (first && second) return `${first[index]} - ${second[index]}`;
    }
    const chartPlanets = value.trim().split(/\s+/);
    if (chartPlanets.length && chartPlanets.every((token) => planetAbbreviations[token] || token === 'R' || token === 'C')) {
      return chartPlanets.map((token) => planetAbbreviations[token]?.[index] || token).join(' ');
    }
    const houseLabel = value.match(/^H(\d+) (\d+) (.+)$/);
    if (houseLabel) {
      const sign = zodiacNames[houseLabel[3]]?.[index] || houseLabel[3];
      const houseWord = ['House', 'भाव', 'ঘর'][index];
      return `${houseWord} ${houseLabel[1]} ${houseLabel[2]} ${sign}`;
    }
    const elapsed = value.match(/^Elapsed (.+) · (\d+)%$/);
    if (elapsed) {
      const prefix = ['Transcurrido', 'बीता समय', 'অতিবাহিত'][index];
      return `${prefix} ${elapsed[1]} · ${elapsed[2]}%`;
    }
    const mode = value.match(/^(Dark|Light) mode$/);
    if (mode) return translations[`${mode[1]} mode`][index];
    const chartName = value.match(/^Chart - (.+)$/);
    if (chartName) return `${['Carta', 'कुंडली', 'কুণ্ডলী'][index]} - ${chartName[1]}`;
    const signOverview = value.match(/^(.+) Overview$/);
    if (signOverview && zodiacNames[signOverview[1]]) {
      return `${zodiacNames[signOverview[1]][index]} ${translations['Sign Overview'][index]}`;
    }
    const timezone = value.match(/^Timezone: (.+)$/);
    if (timezone) return `${['Zona horaria', 'समय क्षेत्र', 'সময় অঞ্চল'][index]}: ${timezone[1]}`;
    const otp = value.match(/^OTP sent to (.+)\. Demo code: (.+)$/);
    if (otp) return [
      `OTP enviado a ${otp[1]}. Código de demostración: ${otp[2]}`,
      `${otp[1]} पर OTP भेजा गया। डेमो कोड: ${otp[2]}`,
      `${otp[1]} নম্বরে OTP পাঠানো হয়েছে। ডেমো কোড: ${otp[2]}`,
    ][index];
    const login = value.match(/^Login successful for (.+)$/);
    if (login) return [`Inicio de sesión correcto para ${login[1]}`, `${login[1]} के लिए लॉग इन सफल`, `${login[1]}-এর লগ ইন সফল হয়েছে`][index];
    const registration = value.match(/^Registration successful for (.+)$/);
    if (registration) return [`Registro completado para ${registration[1]}`, `${registration[1]} के लिए पंजीकरण सफल`, `${registration[1]}-এর নিবন্ধন সফল হয়েছে`][index];
    return value;
  }

  function translateTextNode(node) {
    const current = node.nodeValue;
    const previous = textRecords.get(node);
    const source = previous && current === previous.translated ? previous.source : current;
    const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/);
    if (!match) return;
    const translated = translateValue(match[2].trim());
    textRecords.set(node, { source, translated: `${match[1]}${translated}${match[3]}` });
    const result = `${match[1]}${translated}${match[3]}`;
    if (current !== result) node.nodeValue = result;
  }

  function translateAttribute(element, attribute) {
    if (!element.hasAttribute(attribute)) return;
    let records = attributeRecords.get(element);
    if (!records) {
      records = new Map();
      attributeRecords.set(element, records);
    }
    const current = element.getAttribute(attribute);
    const previous = records.get(attribute);
    const source = previous && current === previous.translated ? previous.source : current;
    const translated = translateValue(source);
    records.set(attribute, { source, translated });
    if (current !== translated) element.setAttribute(attribute, translated);
  }

  function translateSubtree(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType === Node.ELEMENT_NODE && root.matches(observedAttributes.map((name) => `[${name}]`).join(','))) {
      observedAttributes.forEach((attribute) => translateAttribute(root, attribute));
    }
    if (root.querySelectorAll) {
      root.querySelectorAll(observedAttributes.map((name) => `[${name}]`).join(',')).forEach((element) => {
        observedAttributes.forEach((attribute) => translateAttribute(element, attribute));
      });
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) translateTextNode(node);
  }

  function setLanguage(language) {
    activeLanguage = languageIndexes[language] != null || language === 'en' ? language : 'en';
    document.documentElement.lang = activeLanguage;
    try {
      localStorage.setItem('jyotishlab_language', activeLanguage);
    } catch (error) {
      // Language selection still works when storage is unavailable.
    }
    document.title = translateValue('JyotishLab | Vedic Astrology');
    translateSubtree(document.body);
    document.querySelectorAll('template').forEach((template) => translateSubtree(template.content));
    const select = document.getElementById('languageSelect');
    if (select) select.value = activeLanguage;
  }

  const select = document.getElementById('languageSelect');
  let savedLanguage = 'en';
  try {
    savedLanguage = localStorage.getItem('jyotishlab_language') || 'en';
  } catch (error) {
    savedLanguage = 'en';
  }
  setLanguage(savedLanguage);
  if (select) select.addEventListener('change', () => setLanguage(select.value));
  window.jyotishTranslate = (value) => translateValue(String(value));

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') mutation.addedNodes.forEach(translateSubtree);
      else if (mutation.type === 'characterData') translateTextNode(mutation.target);
      else if (mutation.type === 'attributes') translateAttribute(mutation.target, mutation.attributeName);
    });
  });
  observer.observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: observedAttributes,
  });
})();
