export interface BlogPost {
  slug: string;
  emoji: string;
  category: { he: string; en: string; es: string };
  title: { he: string; en: string; es: string };
  excerpt: { he: string; en: string; es: string };
  body: { he: string; en: string; es: string };
  date: string;
  readMin: number;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "thailand-kosher-anniversary-trip",
    emoji: "💑",
    category: { he: "סיפורי מטיילים", en: "Traveler Stories", es: "Historias de Viajeros" },
    date: "2026-07-12",
    readMin: 6,
    title: {
      he: "שלושה שבועות בתאילנד: זוג 50+, כשרות, שבת — וחגיגת 30 שנות נישואין",
      en: "Three Weeks in Thailand: A 50+ Couple, Kosher Food, Shabbat — and a 30th Anniversary",
      es: "Tres Semanas en Tailandia: Pareja 50+, Comida Kosher, Shabat — y un 30º Aniversario",
    },
    excerpt: {
      he: "פעם ראשונה בתאילנד, הכל מאורגן לבד, תקציב מוגדר מראש — וניצול של 90% ממנו בדיוק. סיפור אמיתי של מטיילים, כולל המלונות, הסיורים והטיפים ששווים זהב.",
      en: "First time in Thailand, everything self-organized, a budget set in advance — and exactly 90% of it used. A real traveler story with the hotels, tours and tips worth gold.",
      es: "Primera vez en Tailandia, todo organizado por cuenta propia, presupuesto definido de antemano — y exactamente el 90% utilizado. Una historia real con hoteles, tours y consejos de oro.",
    },
    body: {
      he: `אחרי כמעט שלושה שבועות בתאילנד וכל המידע שקיבלנו מהקהילה לפני הנסיעה — הגיע הזמן להחזיר. אנחנו זוג דתי, קצת מעל גיל 50, בפעם הראשונה בתאילנד, וחגגנו שם 30 שנות נישואין. ארגנתי הכל לבד, מהטיסות ועד הסיור האחרון.

**התקציב — הוגדר מראש, נוצל ב-90%**
לפני הטיול הגדרתי תקציב כולל, ולאורך כל הדרך ניהלתי אותו באפליקציית טיולון — כל הוצאה נרשמה במקום, כולל סריקת קבלות ותיוק אוטומטי לקטגוריות. בסוף הטיול ידעתי בדיוק כמה יצא על מה, וסיימנו על 90% מהתקציב בלי לחסוך יותר מדי. גם יומן הטיול המלא — טיסות, מלונות וסיורים יום-אחרי-יום — ישב שם, אז בכל בוקר ידענו בדיוק מה מחכה לנו.

**טיסות**
אל על ישיר, מחלקת פרימיום — היו הרבה נקודות נוסע מתמיד, ובגילנו זו הדרך היחידה לשרוד 11 שעות טיסה. זו הייתה ההוצאה הגדולה בטיול. טיסות פנים עם תאי איירווייז ובנגקוק איירווייז — מדויקות, תהליכים מהירים, מטוסים סבירים.

**מלונות — עם דגש על שבת וכשרות**
- **בנגקוק — Chilax Resort:** מלון חמוד וקרוב לבית חב"ד, חשוב לנו בגלל הארוחות.
- **צ'אנג מאי — The Empress Premier:** מפנק מאוד, וצוות שמכיר את נושא השבת ברמה שפנו אלינו מיוזמתם והסבירו שבשבת הם דואגים למעלית ולפתיחת הדלת.
- **קוסמוי — Synergy Resort:** על קו החוף, שתי בריכות, דקה מבית חב"ד ומוקף מסעדות כשרות. שידרגו לנו וילה בהגעה — אפס תלונות.
- **בנגקוק לסיום:** המלון הצמוד ל-MBK (את השם, כנראה, לא אזכור לעולם).

**סיורים**
את הסיורים הגדולים סגרתי מהארץ דרך סיאם טורס: דוי אינתנון, צ'אנג ראי, 42 האיים בסירה איטית, חוות הצלה לפילים וסדנת בישול כשרה. סיורים מקומיים ספונטניים — דרך GetYourGuide, מהיום למחר, עם הדרכה באנגלית: ארמון המלך וכמה מקדשים. אפשר להסתובב לבד, אבל הידע שמקבלים מהמדריך שווה כל בהאט (וזה ממש זול).

**טיפ חשוב על 42 האיים:** כדי לחוות הכל באמת — תגיעו בכושר. טיפוס רציני של 500 מטר לנקודת תצפית מטורפת, חתירה בקייאק, ועוד טיפוס ללגונה הירוקה. הנופים שווים כל טיפת זיעה.

**הרגע המיוחד**
לכבוד 30 שנות הנישואין לקחנו בקוסמוי צלמת זוגיות — רעות הלר, מקסימה — וקיבלנו מזכרת מדהימה מהטיול.

**התניידות**
בעיקר Bolt, מדי פעם טוק-טוק (בעיקר בצ'אנג מאי), וכשאפשר — ברגל.

**ולסיום**
קוסמוי הרגישה לפעמים כמו אילת: עברית ברחוב, מסעדות כשרות בכל פינה, ואפילו רכב עם רמקול שמזמין למסיבות בשירים בעברית. אומרים שתאילנד התייקרה — אין לי השוואה לעבר, אבל ליהנות שם אפשר גם בתקציב שפוי. ולאכול כשר כל יום? במקומות אחרים בעולם זה תיק כלכלי כבד. לא כאן.`,
      en: `After almost three weeks in Thailand — and all the advice we received from the community before the trip — it's time to give back. We're a religious couple, just over 50, first time in Thailand, celebrating our 30th wedding anniversary. I organized everything myself, from flights to the very last tour.

**The budget — set in advance, 90% used**
Before the trip I defined a total budget, and managed it throughout with the Tulon app — every expense logged on the spot, including receipt scanning with automatic categorization. By the end I knew exactly what went where, and we finished at 90% of budget without over-scrimping. The full trip itinerary — flights, hotels and tours day by day — lived there too, so every morning we knew exactly what was ahead.

**Flights**
Direct El Al, premium class — we had plenty of frequent-flyer points, and at our age that's the only way to survive an 11-hour flight. It was the biggest expense of the trip. Domestic flights with Thai Airways and Bangkok Airways — punctual, fast processes, decent planes.

**Hotels — with Shabbat and kosher in mind**
- **Bangkok — Chilax Resort:** charming and close to the Chabad House, which mattered for meals.
- **Chiang Mai — The Empress Premier:** very pampering, with staff who understand Shabbat so well they approached us proactively to explain they'd handle the elevator and door for us.
- **Koh Samui — Synergy Resort:** beachfront, two pools, a minute from Chabad and surrounded by kosher restaurants. They upgraded our villa on arrival — zero complaints.
- **Bangkok to finish:** the hotel attached to MBK (whose name I will apparently never remember).

**Tours**
The big tours I booked from home through a local agency: Doi Inthanon, Chiang Rai, the 42 islands by slow boat, an elephant rescue farm and a kosher cooking workshop. Spontaneous local tours — via GetYourGuide, booked a day ahead with English guides: the Grand Palace and several temples. You can wander alone, but the knowledge a guide adds is worth every baht (and it's genuinely cheap).

**Important tip about the 42 islands:** to experience it fully — arrive fit. A serious 500-meter climb to an insane viewpoint, kayaking, then another climb to the green lagoon. The views are worth every drop of sweat.

**The special moment**
For our 30th anniversary we hired a couples photographer in Koh Samui and got an amazing keepsake from the trip.

**Getting around**
Mostly Bolt, occasionally tuk-tuks (mainly in Chiang Mai), and on foot whenever possible.

**In closing**
Koh Samui sometimes felt like a resort town back home: Hebrew in the streets, kosher restaurants on every corner. They say Thailand got expensive — I can't compare to the past, but you can absolutely enjoy it on a sane budget. And eating kosher every day? Elsewhere in the world that's a serious financial burden. Not here.`,
      es: `Después de casi tres semanas en Tailandia — y todos los consejos que recibimos de la comunidad antes del viaje — es hora de devolver el favor. Somos una pareja religiosa, poco más de 50 años, primera vez en Tailandia, celebrando nuestro 30º aniversario de boda. Lo organicé todo yo mismo, desde los vuelos hasta el último tour.

**El presupuesto — definido de antemano, 90% utilizado**
Antes del viaje definí un presupuesto total y lo gestioné todo el tiempo con la app Tulon — cada gasto registrado al momento, incluido el escaneo de recibos con categorización automática. Al final sabía exactamente en qué se fue cada parte, y terminamos en el 90% del presupuesto sin privarnos demasiado. El itinerario completo — vuelos, hoteles y tours día a día — también vivía allí, así que cada mañana sabíamos exactamente qué nos esperaba.

**Vuelos**
El Al directo, clase premium — teníamos muchos puntos de viajero frecuente, y a nuestra edad es la única forma de sobrevivir 11 horas de vuelo. Fue el mayor gasto del viaje. Vuelos internos con Thai Airways y Bangkok Airways — puntuales, procesos rápidos, aviones decentes.

**Hoteles — pensando en Shabat y comida kosher**
- **Bangkok — Chilax Resort:** encantador y cerca de la Casa Jabad, importante para las comidas.
- **Chiang Mai — The Empress Premier:** muy acogedor, con personal que entiende tan bien el Shabat que se acercaron proactivamente para explicarnos cómo nos ayudarían con el ascensor y la puerta.
- **Koh Samui — Synergy Resort:** frente a la playa, dos piscinas, a un minuto de Jabad y rodeado de restaurantes kosher. Nos mejoraron la villa al llegar — cero quejas.
- **Bangkok para terminar:** el hotel pegado al MBK (cuyo nombre aparentemente nunca recordaré).

**Tours**
Los grandes los reservé desde casa con una agencia: Doi Inthanon, Chiang Rai, las 42 islas en barco lento, una granja de rescate de elefantes y un taller de cocina kosher. Tours locales espontáneos — vía GetYourGuide, de un día para otro con guías en inglés: el Gran Palacio y varios templos. Se puede pasear solo, pero el conocimiento del guía vale cada baht (y es realmente barato).

**Consejo importante sobre las 42 islas:** para vivirlo todo — llega en forma. Una subida seria de 500 metros a un mirador increíble, kayak, y otra subida a la laguna verde. Las vistas valen cada gota de sudor.

**El momento especial**
Por nuestro 30º aniversario contratamos una fotógrafa de parejas en Koh Samui y nos llevamos un recuerdo increíble del viaje.

**Cómo moverse**
Principalmente Bolt, de vez en cuando tuk-tuks (sobre todo en Chiang Mai), y a pie siempre que fuera posible.

**Para terminar**
Koh Samui a veces se sentía como una ciudad turística de casa: hebreo en las calles, restaurantes kosher en cada esquina. Dicen que Tailandia se encareció — no puedo comparar con el pasado, pero se puede disfrutar con un presupuesto sensato. ¿Y comer kosher todos los días? En otras partes del mundo es una carga económica seria. Aquí no.`,
    },
  },
  {
    slug: "group-travel-tips",
    emoji: "👥",
    category: { he: "טיולים קבוצתיים", en: "Group Travel", es: "Viaje en Grupo" },
    date: "2025-11-10",
    readMin: 5,
    title: {
      he: "5 טיפים לתכנון טיול קבוצתי ללא כאבי ראש",
      en: "5 Tips for Stress-Free Group Travel Planning",
      es: "5 Consejos para Planificar un Viaje en Grupo sin Estrés",
    },
    excerpt: {
      he: "טיול קבוצתי יכול להיות החוויה הכי כיפית — אם יודעים לתכנן נכון. אלה 5 הכללים שישמרו על כולם מאושרים.",
      en: "Group travel can be the most fun experience — if you plan it right. Here are 5 rules to keep everyone happy.",
      es: "Viajar en grupo puede ser la experiencia más divertida — si lo planificas bien. Estos son 5 consejos para mantener a todos contentos.",
    },
    body: {
      he: `תכנון טיול קבוצתי הוא אמנות בפני עצמה. הנה 5 טיפים שיעזרו:

**1. קבעו תקציב מראש**
לפני כל הזמנה, הגדירו יחד מה התקציב לכל אחד. זה ימנע אי-נעימויות בהמשך ויעזור לכולם לדעת מה לצפות.

**2. חלקו תפקידים**
מנו אחד שאחראי על טיסות, אחד על מלונות, ואחד על אטרקציות. ריכוז הכל באדם אחד יוצר לחץ מיותר.

**3. השתמשו בכלי שיתוף**
אפליקציות כמו טיולון מאפשרות לכולם לראות את לוח הזמנים ולרשום הוצאות בזמן אמת — אין יותר "מי שילם מה".

**4. תכננו זמן חופשי**
לא כולם רוצים את אותן פעילויות. השאירו לפחות חצי יום לכל יום לאנשים לעשות מה שהם רוצים.

**5. התחשבנות בסוף**
עם אפליקציה כמו טיולון, ההתחשבנות הסופית היא לחיצת כפתור — כמה כל אחד חייב ולמי. פשוט ושקוף.`,
      en: `Planning a group trip is an art form. Here are 5 tips that will help:

**1. Set a budget upfront**
Before any booking, define a per-person budget together. This prevents awkwardness later and helps everyone know what to expect.

**2. Divide responsibilities**
Assign one person for flights, one for hotels, one for activities. Centralizing everything in one person creates unnecessary pressure.

**3. Use shared tools**
Apps like Tulon let everyone see the itinerary and log expenses in real time — no more "who paid what."

**4. Plan free time**
Not everyone wants the same activities. Leave at least half a day each day for people to do their own thing.

**5. Settle up at the end**
With an app like Tulon, the final settlement is just a button press — how much each person owes and to whom. Simple and transparent.`,
      es: `Planificar un viaje en grupo es un arte. Aquí tienes 5 consejos que te ayudarán:

**1. Establece un presupuesto por adelantado**
Antes de hacer cualquier reserva, define juntos el presupuesto por persona. Esto evita incomodidades más tarde y ayuda a todos a saber qué esperar.

**2. Divide las responsabilidades**
Asigna a una persona para los vuelos, otra para hoteles y otra para actividades. Centralizar todo en una persona crea presión innecesaria.

**3. Usa herramientas compartidas**
Apps como Tulon permiten a todos ver el itinerario y registrar gastos en tiempo real — sin más "¿quién pagó qué?"

**4. Planifica tiempo libre**
No todos quieren las mismas actividades. Deja al menos medio día cada día para que las personas hagan lo que quieran.

**5. Liquida las cuentas al final**
Con una app como Tulon, el ajuste final es solo un toque — cuánto debe cada persona y a quién. Simple y transparente.`,
    },
  },
  {
    slug: "budget-travel",
    emoji: "💰",
    category: { he: "תקציב", en: "Budget Travel", es: "Viaje con Presupuesto" },
    date: "2025-11-24",
    readMin: 6,
    title: {
      he: "איך לנהל תקציב טיול בלי לוותר על הכיף",
      en: "How to Manage Your Travel Budget Without Sacrificing Fun",
      es: "Cómo Gestionar tu Presupuesto de Viaje Sin Sacrificar la Diversión",
    },
    excerpt: {
      he: "ניהול תקציב בטיול לא אומר לחיות בצניעות. עם הכלים הנכונים, תוכלו לבלות כמו מלכים ועדיין לחזור עם כסף.",
      en: "Managing a travel budget doesn't mean roughing it. With the right tools, you can live like royalty and still come home with money.",
      es: "Gestionar el presupuesto de viaje no significa privarse. Con las herramientas adecuadas, puedes disfrutar al máximo y aún volver con dinero.",
    },
    body: {
      he: `ניהול תקציב בטיול הוא אחד האתגרים הכי גדולים — ומהכי חשובים.

**רשמו כל הוצאה — תמיד**
גם קפה של 3 דולר. בסוף היום, סכום הקפות שניתן לשכוח יכול להיות 20-30 דולר.

**חלקו לקטגוריות**
מלון, אוכל, תחבורה, אטרקציות — כשאתם יודעים כמה הוצאתם בכל קטגוריה, קל יותר לנהל.

**הגדירו "תקציב יומי"**
חשבו כמה יש לכם לכל היום ונסו לעמוד בו. אפליקציות כמו טיולון מראות לכם בזמן אמת איפה אתם עומדים.

**הזמינו מלון מוקדם**
מחירי מלונות עולים ככל שמתקרבים לתאריך. Agoda ו-Booking.com מציעים מחירים טובים יותר כשמזמינים מוקדם.

**השוו מחירי אטרקציות**
Viator ו-GetYourGuide מציעים לפעמים את אותו הסיור במחירים שונים — שווה להשוות.`,
      en: `Managing a travel budget is one of the biggest challenges — and most important ones.

**Record every expense — always**
Even a $3 coffee. By end of day, the forgotten coffees can add up to $20-30.

**Break it into categories**
Hotel, food, transport, activities — when you know how much you've spent in each category, it's easier to manage.

**Set a "daily budget"**
Calculate how much you have per day and try to stick to it. Apps like Tulon show you in real time where you stand.

**Book your hotel early**
Hotel prices rise as the date approaches. Agoda and Booking.com offer better prices when you book early.

**Compare activity prices**
Viator and GetYourGuide sometimes offer the same tour at different prices — worth comparing.`,
      es: `Gestionar el presupuesto de viaje es uno de los mayores desafíos — y el más importante.

**Registra cada gasto — siempre**
Incluso un café de $3. Al final del día, los cafés olvidados pueden sumar $20-30.

**Divide por categorías**
Hotel, comida, transporte, actividades — cuando sabes cuánto has gastado en cada categoría, es más fácil gestionar.

**Establece un "presupuesto diario"**
Calcula cuánto tienes por día e intenta cumplirlo. Apps como Tulon te muestran en tiempo real dónde estás.

**Reserva el hotel con antelación**
Los precios de hotel suben a medida que se acerca la fecha. Agoda y Booking.com ofrecen mejores precios cuando reservas con antelación.

**Compara precios de actividades**
Viator y GetYourGuide a veces ofrecen el mismo tour a diferentes precios — vale la pena comparar.`,
    },
  },
  {
    slug: "thailand-10-days",
    emoji: "🌴",
    category: { he: "מסלולים", en: "Itineraries", es: "Itinerarios" },
    date: "2025-12-05",
    readMin: 8,
    title: {
      he: "מסלול 10 ימים בתאילנד: מה לא לפספס",
      en: "10-Day Thailand Itinerary: What Not to Miss",
      es: "Itinerario de 10 Días en Tailandia: Qué No Perderse",
    },
    excerpt: {
      he: "תאילנד היא יעד חלומות — אבל עם כל כך הרבה אפשרויות, לאן הולכים? הנה המסלול האולטימטיבי ל-10 ימים.",
      en: "Thailand is a dream destination — but with so many options, where do you go? Here's the ultimate 10-day route.",
      es: "Tailandia es un destino de ensueño — pero con tantas opciones, ¿adónde vas? Aquí está la ruta definitiva de 10 días.",
    },
    body: {
      he: `10 ימים בתאילנד — זה מספיק לטעימה טובה מהמדינה המדהימה הזו.

**ימים 1-3: בנגקוק**
הגיעו לבנגקוק, בירת התרבות. בקרו בוואט פו, שוק חתוצ'אק, וקניות ב-MBK. נסו פאד תאי מהרחוב — לא תצטערו.

**ימים 4-6: צ'יאנג מאי**
טוסו צפונה לצ'יאנג מאי. בקרו במקדש דוי סות'פ, עשו קורס בישול תאי, ובקרו בקיגרי האוסים האתיים לפילים.

**ימים 7-10: האיים**
טוסו לפוקט או קו סמוי. שנורקל, שכבו על החוף, ואכלו סיפוד טרי. נסיעת כלל ג'יימס בונד היא חובה.

**טיפים מעשיים:**
- GrabTaxi הוא אפליקציית המוניות הנוחה ביותר
- SIM מקומי עולה כ-15$ לחודש
- תמיד משא ומתן על מחיר בשווקים`,
      en: `10 days in Thailand — enough for a great taste of this amazing country.

**Days 1-3: Bangkok**
Arrive in Bangkok, the cultural capital. Visit Wat Pho, Chatuchak Market, and shop at MBK. Try street pad thai — you won't regret it.

**Days 4-6: Chiang Mai**
Fly north to Chiang Mai. Visit Doi Suthep temple, take a Thai cooking class, and visit ethical elephant sanctuaries.

**Days 7-10: The Islands**
Fly to Phuket or Koh Samui. Snorkel, lie on the beach, and eat fresh seafood. James Bond Island boat trip is a must.

**Practical tips:**
- GrabTaxi is the most convenient ride app
- Local SIM costs about $15/month
- Always negotiate price at markets`,
      es: `10 días en Tailandia — suficiente para disfrutar de este increíble país.

**Días 1-3: Bangkok**
Llega a Bangkok, la capital cultural. Visita Wat Pho, el mercado Chatuchak y compra en MBK. Prueba el pad thai callejero — no te arrepentirás.

**Días 4-6: Chiang Mai**
Vuela al norte hacia Chiang Mai. Visita el templo Doi Suthep, toma una clase de cocina tailandesa y visita santuarios éticos de elefantes.

**Días 7-10: Las Islas**
Vuela a Phuket o Koh Samui. Practica snorkel, descansa en la playa y come mariscos frescos. El tour en bote a la Isla James Bond es imprescindible.

**Consejos prácticos:**
- GrabTaxi es la app de transporte más conveniente
- Una SIM local cuesta unos $15/mes
- Siempre negocia el precio en los mercados`,
    },
  },
  {
    slug: "group-settlement-guide",
    emoji: "🤝",
    category: { he: "כלים חכמים", en: "Smart Tools", es: "Herramientas Inteligentes" },
    date: "2025-12-18",
    readMin: 4,
    title: {
      he: "המדריך המלא להתחשבנות בטיול קבוצתי",
      en: "The Complete Guide to Settling Up After a Group Trip",
      es: "La Guía Completa para Liquidar Cuentas Tras un Viaje en Grupo",
    },
    excerpt: {
      he: "אחרי טיול קבוצתי, ההתחשבנות יכולה להיות כאב ראש גדול. כך תעשו את זה בצורה חכמה, מהירה ובלי ריבים.",
      en: "After a group trip, settling up can be a major headache. Here's how to do it smartly, quickly, and without arguments.",
      es: "Después de un viaje en grupo, ajustar las cuentas puede ser un gran dolor de cabeza. Así es cómo hacerlo de forma inteligente, rápida y sin discusiones.",
    },
    body: {
      he: `ההתחשבנות אחרי טיול קבוצתי היא לפעמים יותר מסובכת מהטיול עצמו.

**השיטה הישנה vs השיטה החדשה**
בשיטה הישנה: ניסיון לזכור מי שילם מה, אקסל מסובך, ויכוחים.
בשיטה החדשה: כל הוצאה נרשמת בזמן אמת באפליקציה, וההתחשבנות היא אוטומטית.

**עקרון ה"מינימום עסקאות"**
אפליקציה חכמה לא רק מחשבת מי חייב כמה — היא מחשבת את המינימום מספר ההעברות הדרושות. במקום שכל אחד ישלם לכולם, כל אחד עושה העברה אחת בלבד.

**טיפ: רשמו הוצאות בזמן אמת**
אל תחכו לסוף הטיול. ברגע ששילמתם, פיתחו את האפליקציה ורשמו. זה לוקח 10 שניות ומונע שכחה.

**מה עושים עם שערי חליפין?**
כשמטיילים בחו"ל, הוצאות יכולות להיות במטבעות שונים. אפליקציה כמו טיולון ממירה הכל למטבע ברירת המחדל שלכם אוטומטית.`,
      en: `Settling up after a group trip is sometimes more complicated than the trip itself.

**Old method vs New method**
Old method: Trying to remember who paid what, complicated spreadsheets, arguments.
New method: Every expense logged in real time via app, and settlement is automatic.

**The "minimum transactions" principle**
A smart app doesn't just calculate who owes what — it calculates the minimum number of transfers needed. Instead of everyone paying everyone, each person makes just one transfer.

**Tip: Log expenses in real time**
Don't wait until the end of the trip. The moment you pay, open the app and log it. Takes 10 seconds and prevents forgetting.

**What about exchange rates?**
When traveling abroad, expenses can be in different currencies. An app like Tulon converts everything to your default currency automatically.`,
      es: `Ajustar las cuentas después de un viaje en grupo a veces es más complicado que el viaje en sí.

**Método antiguo vs Método nuevo**
Método antiguo: Intentar recordar quién pagó qué, hojas de cálculo complicadas, discusiones.
Método nuevo: Cada gasto registrado en tiempo real en la app, y el ajuste es automático.

**El principio de "transacciones mínimas"**
Una app inteligente no solo calcula quién debe qué — calcula el número mínimo de transferencias necesarias. En lugar de que todos paguen a todos, cada persona hace solo una transferencia.

**Consejo: Registra los gastos en tiempo real**
No esperes hasta el final del viaje. En el momento en que pagas, abre la app y regístralo. Toma 10 segundos y evita olvidos.

**¿Qué pasa con los tipos de cambio?**
Al viajar al extranjero, los gastos pueden estar en diferentes monedas. Una app como Tulon convierte todo a tu moneda predeterminada automáticamente.`,
    },
  },
  {
    slug: "winter-destinations-2026",
    emoji: "❄️",
    category: { he: "יעדים", en: "Destinations", es: "Destinos" },
    date: "2026-01-08",
    readMin: 5,
    title: {
      he: "6 יעדים מומלצים לחורף 2026 — בכל תקציב",
      en: "6 Recommended Winter 2026 Destinations — For Every Budget",
      es: "6 Destinos Recomendados para el Invierno 2026 — Para Cada Presupuesto",
    },
    excerpt: {
      he: "החורף מגיע — ואיתו ההזדמנות המושלמת לברוח לאיפשהו חם, מרתק או שלג. הנה 6 יעדים שכדאי לשקול.",
      en: "Winter is coming — and with it the perfect opportunity to escape somewhere warm, exciting, or snowy. Here are 6 destinations worth considering.",
      es: "El invierno llega — y con él la oportunidad perfecta de escapar a algún lugar cálido, emocionante o nevado. Aquí hay 6 destinos que vale la pena considerar.",
    },
    body: {
      he: `החורף הוא זמן מצוין לטיולים — טיסות זולות יותר, פחות תיירים, ובמקומות מסוימים גם מזג אוויר מושלם.

**🌞 תאילנד (תקציב נמוך)**
חורף הוא עונת השיא בתאילנד — שמש, חופים, ואוכל מדהים. כ-1,500$ לשבוע כולל טיסה.

**🏔️ יפן (תקציב בינוני)**
שלג, אוניסן (ביתרמאל), ופסטיבל שלג בסאפורו. חוויה יוצאת דופן. כ-2,500$ לשבוע.

**🌊 פורטוגל (תקציב בינוני)**
ליסבון בחורף — ללא תיירים, מחירים נמוכים, ואוכל מדהים. כ-1,200$ לשבוע.

**🏝️ המלדיביים (תקציב גבוה)**
חלום. אבל שווה כל שקל. כ-4,000$+ לשבוע.

**🌮 מקסיקו (תקציב נמוך-בינוני)**
קנקון, מקסיקו סיטי, או אואחקה — כל אחת חוויה שונה. כ-1,500$ לשבוע.

**🏛️ מרוקו (תקציב נמוך)**
מראקש בחורף — חם, צבעוני, ומדהים. כ-900$ לשבוע.`,
      en: `Winter is a great time to travel — cheaper flights, fewer tourists, and in some places perfect weather.

**🌞 Thailand (Low budget)**
Winter is peak season in Thailand — sun, beaches, and incredible food. About $1,500/week including flights.

**🏔️ Japan (Mid budget)**
Snow, onsen (hot springs), and the snow festival in Sapporo. An extraordinary experience. About $2,500/week.

**🌊 Portugal (Mid budget)**
Lisbon in winter — no tourists, low prices, and amazing food. About $1,200/week.

**🏝️ Maldives (High budget)**
A dream. But worth every penny. About $4,000+/week.

**🌮 Mexico (Low-mid budget)**
Cancun, Mexico City, or Oaxaca — each a different experience. About $1,500/week.

**🏛️ Morocco (Low budget)**
Marrakech in winter — warm, colorful, and stunning. About $900/week.`,
      es: `El invierno es un gran momento para viajar — vuelos más baratos, menos turistas, y en algunos lugares el clima perfecto.

**🌞 Tailandia (Presupuesto bajo)**
El invierno es la temporada alta en Tailandia — sol, playas y comida increíble. Alrededor de $1,500/semana incluyendo vuelos.

**🏔️ Japón (Presupuesto medio)**
Nieve, onsen (aguas termales) y el festival de nieve en Sapporo. Una experiencia extraordinaria. Alrededor de $2,500/semana.

**🌊 Portugal (Presupuesto medio)**
Lisboa en invierno — sin turistas, precios bajos y comida increíble. Alrededor de $1,200/semana.

**🏝️ Maldivas (Presupuesto alto)**
Un sueño. Pero vale cada céntimo. Alrededor de $4,000+/semana.

**🌮 México (Presupuesto bajo-medio)**
Cancún, Ciudad de México u Oaxaca — cada una una experiencia diferente. Alrededor de $1,500/semana.

**🏛️ Marruecos (Presupuesto bajo)**
Marrakech en invierno — cálido, colorido e impresionante. Alrededor de $900/semana.`,
    },
  },
  {
    slug: "packing-smart",
    emoji: "🎒",
    category: { he: "טיפים", en: "Travel Tips", es: "Consejos de Viaje" },
    date: "2026-02-03",
    readMin: 4,
    title: {
      he: "האריזה החכמה: איך לארוז לשבועיים בתיק יד אחד",
      en: "Smart Packing: How to Pack Two Weeks Into One Carry-On",
      es: "Equipaje Inteligente: Cómo Empacar Dos Semanas en un Equipaje de Mano",
    },
    excerpt: {
      he: "עם הגישה הנכונה, אפשר לטייל שבועיים עם תיק יד בלבד — ולחסוך זמן, כסף, ועצבים בשדה התעופה.",
      en: "With the right approach, you can travel two weeks with just a carry-on — saving time, money, and airport stress.",
      es: "Con el enfoque correcto, puedes viajar dos semanas con solo equipaje de mano — ahorrando tiempo, dinero y estrés en el aeropuerto.",
    },
    body: {
      he: `האריזה החכמה היא מיומנות שכל מטייל מנוסה מכיר. הנה העקרונות:

**כלל 5-4-3-2-1**
5 גרביים, 4 חולצות, 3 מכנסיים (כולל זוג שאתם לובשים), 2 נעליים, 1 ז'קט.

**בגדים סינטטיים מהירי ייבוש**
כלביגדי מריינו או טכניים — יבשים תוך שעות ואפשר לכבס בכיור המלון.

**Packing cubes**
מארגני ביגוד לוחצים את הבגדים ומארגנים את התיק. שינוי מהפכני.

**נעליים קומפקטיות**
נעל מולטי-פנקשיונלית שמתאימה גם לטיולים רגליים וגם לארוחות ערב.

**הרשימה הדיגיטלית**
השתמשו באפליקציה כמו טיולון לניהול רשימת הציוד — לא תשכחו כלום, ותוכלו לשתף עם שאר הקבוצה.`,
      en: `Smart packing is a skill every experienced traveler knows. Here are the principles:

**The 5-4-3-2-1 rule**
5 socks, 4 shirts, 3 pants (including the pair you're wearing), 2 shoes, 1 jacket.

**Quick-dry synthetic clothes**
Merino wool or technical fabrics — dry in hours and can be washed in the hotel sink.

**Packing cubes**
Clothing organizers compress clothes and organize your bag. A revolutionary change.

**Compact shoes**
A multi-functional shoe suitable for hiking and dinner alike.

**Digital packing list**
Use an app like Tulon to manage your packing list — you won't forget anything, and you can share with the rest of the group.`,
      es: `Empacar de forma inteligente es una habilidad que todo viajero experimentado conoce. Aquí están los principios:

**La regla 5-4-3-2-1**
5 calcetines, 4 camisetas, 3 pantalones (incluido el par que llevas puesto), 2 zapatos, 1 chaqueta.

**Ropa sintética de secado rápido**
Lana merino o tejidos técnicos — se secan en horas y se pueden lavar en el lavabo del hotel.

**Cubos de equipaje**
Organizadores de ropa que comprimen la ropa y organizan la bolsa. Un cambio revolucionario.

**Zapatos compactos**
Un zapato multifuncional adecuado tanto para senderismo como para cenas.

**Lista de equipaje digital**
Usa una app como Tulon para gestionar tu lista de equipaje — no olvidarás nada, y puedes compartirla con el resto del grupo.`,
    },
  },
];
