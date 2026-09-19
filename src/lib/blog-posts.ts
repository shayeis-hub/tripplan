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
    slug: "wanderlog-vs-splitwise-vs-tulon",
    emoji: "⚖️",
    category: { he: "השוואות", en: "Comparisons", es: "Comparativas" },
    date: "2026-09-19",
    readMin: 6,
    title: {
      he: "Wanderlog מול Splitwise מול טיולון: איזו אפליקציה באמת צריכים?",
      en: "Wanderlog vs Splitwise vs Tulon: Which One Do You Actually Need?",
      es: "Wanderlog vs Splitwise vs Tulon: ¿Cuál Necesitas Realmente?",
    },
    excerpt: {
      he: "שלוש אפליקציות פופולריות, שלוש מטרות שונות לגמרי. השוואה ישירה שתעזור לכם להבין איזו מהן (או איזה שילוב) מתאימה לטיול שלכם.",
      en: "Three popular apps, three genuinely different jobs. A direct comparison to help you figure out which one — or which combination — actually fits your trip.",
      es: "Tres apps populares, tres funciones completamente distintas. Una comparación directa para saber cuál — o qué combinación — se ajusta a tu viaje.",
    },
    body: {
      he: `אנשים שמחפשים "Wanderlog vs Splitwise" או "Splitwise vs טיולון" בדרך כלל מבולבלים משהו — האפליקציות האלה לא באמת מתחרות זו בזו. כל אחת עושה עבודה אחרת.

**Wanderlog — תכנון מסלול על מפה**
Wanderlog בנויה סביב מפה אינטראקטיבית: מסמנים מקומות, מארגנים לפי ימים, גוררים את הסדר. חזקה מאוד לתכנון חזותי משותף. אין בה שום ניהול תקציב או חלוקת הוצאות.

**Splitwise — חלוקת הוצאות, ורק זה**
Splitwise היא שם דבר בעולם חלוקת ההוצאות המשותפות — לא רק לטיולים, גם לשותפים לדירה. הממשק פשוט, החישוב מדויק. אין בה שום כלי תכנון טיול.

**טיולון — שתיהן ביחד**
טיולון עושה גם מסלול יומי (כמו Wanderlog) וגם ניהול הוצאות וחלוקת תשלומים (כמו Splitwise), באותה אפליקציה. זו לא "אפליקציה שלישית" בתחרות עם השתיים האחרות — זו האפליקציה שחוסכת לכם להשתמש בשתיהן במקביל.

**אז איזו לבחור?**
אם אתם רק צריכים לתאם ויזואלית איפה כולם הולכים — Wanderlog מספיקה. אם אתם רק צריכים לסגור חשבון בסוף בלי שום תכנון — Splitwise מספיקה. אבל אם אתם רוצים גם וגם, בלי לקפוץ בין שתי אפליקציות ולהעתיק נתונים ידנית — טיולון היא הבחירה שחוסכת לכם את זה, וגם היא חינמית. פירוט מלא של כל התכונות נמצא ב[עמוד תכנון הטיול הקבוצתי](/group-travel-planner) שלנו. ואם דווקא Splitwise עצמה היא לא ה-fit, יש עוד כמה [חלופות ל-Splitwise לטיולים](/blog/best-splitwise-alternatives-group-travel) שכדאי להכיר.

**מה עם שילוב של שתיהן?**
הרבה קבוצות בפועל כן מנסות לשלב Wanderlog + Splitwise — אבל זה אומר לתחזק שני מקורות אמת נפרדים. אם מישהו מוסיף פעילות ב-Wanderlog, ההוצאה שלה לא מופיעה אוטומטית ב-Splitwise, וההפך. בטיולון, ההוצאה וההקשר שלה (איזה יום, איזו פעילות) חיים באותו מקום.

**האם Wanderlog ו-Splitwise מתחרות זו בזו?**
לא ממש — הן פותרות בעיות שונות לגמרי. Wanderlog היא כלי תכנון מסלול, Splitwise היא כלי חלוקת הוצאות. אפשר להשתמש בשתיהן יחד, אבל זה אומר לתחזק שני מקורות מידע נפרדים.

**האם אפשר להשתמש בטיולון גם כמו Wanderlog וגם כמו Splitwise?**
כן. טיולון בנתה מסלול יומי (כמו Wanderlog) וניהול הוצאות עם חלוקה אוטומטית (כמו Splitwise) באותה אפליקציה, כך שההוצאות מקושרות ישירות לימים ולפעילויות של הטיול.

**מי צריכה רק Splitwise?**
מי שכבר יש לו כלי תכנון אחר (או לא צריך תכנון מסלול בכלל) ורק רוצה לסגור חשבונות משותפים — לא רק לטיולים.

**מי צריכה רק Wanderlog?**
מי שלא מנהל הוצאות משותפות בטיול — למשל מטייל יחיד, או קבוצה שכל אחד משלם על עצמו בנפרד.

**האם טיולון עולה כסף?**
לא. טיולון חינמית לחלוטין.`,
      en: `Anyone who's searched "Wanderlog vs Splitwise" or "Splitwise vs Tulon" has probably noticed something confusing: these apps aren't really competing with each other. Each one does a different job.

**Wanderlog — Map-Based Itinerary Planning**
Wanderlog is built around an interactive map: pin places, organize them by day, drag the order around. It's excellent for visual, collaborative trip planning. It has no budget management or expense splitting at all.

**Splitwise — Expense Splitting, and Only That**
Splitwise is the standard for splitting shared costs — not just on trips, also roommates and any shared expense. Simple interface, accurate math. It has no trip-planning tools whatsoever.

**Tulon — Both, in One App**
Tulon does both a day-by-day itinerary (like Wanderlog) and expense management with automatic splitting (like Splitwise), in the same app. It's not a "third competitor" fighting the other two — it's the app that saves you from running both of them at once.

**So Which One Should You Use?**
If you only need to visually coordinate where everyone's going, Wanderlog is enough. If you only need to settle up at the end with no planning involved, Splitwise is enough. But if you want both without jumping between two apps and copying numbers by hand, Tulon is the one that saves you that — and it's free. See our [group travel planner page](/group-travel-planner) for the full feature breakdown. And if Splitwise itself isn't quite the right fit, we've also rounded up a few [Splitwise alternatives for travel](/blog/best-splitwise-alternatives-group-travel) worth knowing about.

**What About Using Both Together?**
Plenty of groups do try combining Wanderlog and Splitwise — but that means maintaining two separate sources of truth. Add an activity in Wanderlog and its cost doesn't show up in Splitwise automatically, and vice versa. In Tulon, an expense and its context (which day, which activity) live in the same place.

**Do Wanderlog and Splitwise compete with each other?**
Not really — they solve completely different problems. Wanderlog is an itinerary-planning tool, Splitwise is an expense-splitting tool. You can use both together, but that means keeping two separate sources of information in sync.

**Can Tulon replace both Wanderlog and Splitwise?**
Yes. Tulon combines a day-by-day itinerary (like Wanderlog) with expense management and automatic splitting (like Splitwise) in the same app, so expenses are linked directly to the trip's days and activities.

**Who only needs Splitwise?**
Anyone who already has a separate planning tool (or doesn't need itinerary planning at all) and just wants to settle shared costs — not only for trips.

**Who only needs Wanderlog?**
Anyone not managing shared trip expenses — a solo traveler, for instance, or a group where everyone pays for themselves separately.

**Does Tulon cost anything?**
No. Tulon is completely free.`,
      es: `Cualquiera que haya buscado "Wanderlog vs Splitwise" o "Splitwise vs Tulon" probablemente notó algo confuso: estas apps en realidad no compiten entre sí. Cada una hace un trabajo distinto.

**Wanderlog — Planificación de Itinerario con Mapa**
Wanderlog está construida alrededor de un mapa interactivo: marcas lugares, los organizas por día, arrastras el orden. Es excelente para planificación visual y colaborativa. No tiene gestión de presupuesto ni división de gastos.

**Splitwise — División de Gastos, y Solo Eso**
Splitwise es el estándar para dividir costos compartidos — no solo en viajes, también entre compañeros de piso. Interfaz simple, cálculo preciso. No tiene ninguna herramienta de planificación de viaje.

**Tulon — Ambas Cosas, en Una App**
Tulon ofrece tanto un itinerario día a día (como Wanderlog) como gestión de gastos con división automática (como Splitwise), en la misma app. No es una "tercera competidora" — es la app que te ahorra usar las otras dos a la vez.

**¿Entonces Cuál Deberías Usar?**
Si solo necesitas coordinar visualmente a dónde va cada quien, Wanderlog alcanza. Si solo necesitas ajustar cuentas al final sin ninguna planificación, Splitwise alcanza. Pero si quieres ambas cosas sin saltar entre dos apps copiando números a mano, Tulon es la que te ahorra eso — y es gratis. Mira nuestra [página de planificador de viajes en grupo](/group-travel-planner) para el desglose completo de funciones. Y si Splitwise en sí no es la opción ideal, también reunimos algunas [alternativas a Splitwise para viajes](/blog/best-splitwise-alternatives-group-travel) que vale la pena conocer.

**¿Y Usar las Dos Juntas?**
Muchos grupos sí intentan combinar Wanderlog y Splitwise — pero eso significa mantener dos fuentes de información separadas. Si agregas una actividad en Wanderlog, su costo no aparece automáticamente en Splitwise, y viceversa. En Tulon, un gasto y su contexto (qué día, qué actividad) viven en el mismo lugar.

**¿Wanderlog y Splitwise compiten entre sí?**
No realmente — resuelven problemas completamente distintos. Wanderlog es una herramienta de planificación de itinerario, Splitwise es una herramienta de división de gastos. Puedes usar ambas juntas, pero eso implica mantener dos fuentes de información sincronizadas.

**¿Tulon puede reemplazar tanto a Wanderlog como a Splitwise?**
Sí. Tulon combina un itinerario día a día (como Wanderlog) con gestión de gastos y división automática (como Splitwise) en la misma app, así que los gastos quedan vinculados directamente a los días y actividades del viaje.

**¿Quién solo necesita Splitwise?**
Quien ya tenga otra herramienta de planificación (o no necesite planificar itinerario) y solo quiera ajustar costos compartidos — no solo en viajes.

**¿Quién solo necesita Wanderlog?**
Quien no gestione gastos compartidos del viaje — un viajero solo, por ejemplo, o un grupo donde cada quien paga por su cuenta.

**¿Tulon cuesta algo?**
No. Tulon es completamente gratis.`,
    },
  },
  {
    slug: "best-splitwise-alternatives-group-travel",
    emoji: "🔄",
    category: { he: "השוואות", en: "Comparisons", es: "Comparativas" },
    date: "2026-09-19",
    readMin: 6,
    title: {
      he: "5 חלופות ל-Splitwise לניהול הוצאות בטיול קבוצתי",
      en: "Best Splitwise Alternatives for Group Travel in 2026",
      es: "Las Mejores Alternativas a Splitwise para Viajes en Grupo",
    },
    excerpt: {
      he: "Splitwise נהדרת לחלוקת הוצאות — אבל לטיול היא לא תמיד המענה השלם. הנה חלופות שנבנו במיוחד לניהול הוצאות טיול, כולל אחת שמוסיפה גם מסלול.",
      en: "Splitwise is great for splitting costs — but for an actual trip it's not always the full answer. Here are alternatives built specifically for travel expenses, including one that adds a full itinerary too.",
      es: "Splitwise es genial para dividir costos — pero para un viaje no siempre es la respuesta completa. Aquí hay alternativas creadas específicamente para gastos de viaje, incluida una que también suma un itinerario completo.",
    },
    body: {
      he: `Splitwise היא הבחירה הכי מוכרת לחלוקת הוצאות משותפות, וזה מוצדק — היא פשוטה ומדויקת. אבל היא נבנתה לכל סוג של הוצאה משותפת (שותפים לדירה, חברים, משפחה), לא ספציפית לטיולים. אם אתם מחפשים חלופה שמכוונת יותר לחוויית הטיול עצמו, הנה האפשרויות.

**1. טיולון — כשרוצים גם מסלול**
ההבדל המרכזי: טיולון לא רק מחלקת הוצאות (עם חישוב מספר ההעברות המינימלי, בדיוק כמו Splitwise) — היא גם בונה את מסלול הטיול היומי, עם תחזית מזג אוויר, שיתוף בזמן אמת ומפה משותפת. אם אתם ממילא מתכננים טיול, זה חוסך אפליקציה שלמה. חינמית לגמרי.

**2. Tricount — פשוטה וממוקדת אירופה**
אפליקציה אירופית פופולרית לחלוקת הוצאות קבוצתיות, עם תמיכה חזקה במספר מטבעות. דומה מאוד ל-Splitwise בתפיסה — פשטות ומיקוד בחישוב בלבד, בלי כלי תכנון טיול.

**3. Settle Up — גמישות בקבוצות**
עוד אפליקציית חלוקת הוצאות ותיקה ומוכרת, עם תמיכה בקבוצות מרובות וניהול "חשבונות" נפרדים. כמו Splitwise ו-Tricount, ממוקדת רק בחישוב ההוצאות.

**4. TravelSpend — מעקב תקציב אישי לטיול**
TravelSpend מתמקדת במעקב הוצאות אישי במהלך הטיול (כמה הוצאתי היום, כמה נשאר מהתקציב), עם חלק חברתי לשיתוף. פחות בנויה לחלוקה מדויקת של הוצאות בין כמה משלמים.

**5. גיליון אקסל משותף — הבסיס שכולם מכירים**
עדיין הפתרון שהכי הרבה קבוצות נופלות עליו בברירת מחדל. חינמי וגמיש לגמרי, אבל דורש עדכון ידני וקל לטעות או לשכוח הוצאה.

**מה לבחור?**
אם התכנון והמסלול כבר קורים במקום אחר וכל מה שצריך זה לחלק הוצאות — Splitwise, Tricount או Settle Up יעשו את העבודה. אם רוצים גם לתכנן את הטיול עצמו ולא רק לחלק את החשבון בסוף — טיולון היא האפשרות היחידה ברשימה שעושה את שתיהן, בחינם. הרחבה על ההבדלים בין הגישות נמצאת בהשוואה שלנו [Wanderlog מול Splitwise מול טיולון](/blog/wanderlog-vs-splitwise-vs-tulon), ופירוט מלא של הפיצ'רים ב[עמוד תכנון הטיול הקבוצתי](/group-travel-planner) שלנו.

**מה ההבדל בין Splitwise לטיולון?**
Splitwise עושה רק חלוקת הוצאות. טיולון עושה חלוקת הוצאות וגם מסלול טיול יומי מלא, באותה אפליקציה.

**האם יש חלופה חינמית ל-Splitwise לטיולים?**
כן — טיולון, Tricount ו-Settle Up כולן חינמיות לשימוש הבסיסי. טיולון היא היחידה מביניהן שמוסיפה גם תכנון מסלול.

**האם Tricount או Settle Up תומכות במספר מטבעות?**
שתיהן ידועות בתמיכה במספר מטבעות, בדומה ל-Splitwise. טיולון גם ממירה אוטומטית לפי שער חליפין חי.

**מה הכי מתאים לקבוצה גדולה?**
כל האפליקציות ברשימה תומכות בקבוצות גדולות. ההבדל האמיתי הוא אם אתם רוצים גם תכנון מסלול (טיולון) או רק חלוקת הוצאות (השאר).`,
      en: `Splitwise is the best-known choice for splitting shared expenses, and for good reason — it's simple and accurate. But it was built for any kind of shared cost (roommates, friends, family), not specifically for travel. If you're looking for an alternative more geared toward the trip itself, here are the options.

**1. Tulon — When You Also Want an Itinerary**
The key difference: Tulon doesn't just split expenses (with the same minimum-transfers calculation Splitwise uses) — it also builds your day-by-day trip itinerary, with a weather forecast, real-time sharing, and a shared map. If you're planning a trip anyway, this saves you a whole separate app. Completely free.

**2. Tricount — Simple, Europe-Focused**
A popular European app for splitting group expenses, with strong multi-currency support. Very similar to Splitwise in approach — simplicity and pure expense-calculation focus, with no trip-planning tools.

**3. Settle Up — Flexible for Multiple Groups**
Another established expense-splitting app, supporting multiple groups and separate "accounts." Like Splitwise and Tricount, it's focused solely on expense math.

**4. TravelSpend — Personal Trip Budget Tracking**
TravelSpend focuses on personal expense tracking during a trip (how much you've spent today, how much budget is left), with a social sharing component. Less built for precisely splitting costs between multiple payers.

**5. A Shared Spreadsheet — The Default Everyone Knows**
Still where most groups land by default. Free and completely flexible, but requires manual updates and is easy to get wrong or forget an expense in.

**Which Should You Choose?**
If planning and the itinerary already happen somewhere else and all you need is to split costs, Splitwise, Tricount, or Settle Up will do the job. If you also want to plan the trip itself and not just settle up at the end, Tulon is the only option on this list that does both, for free. For more on the differences between these approaches, see our [Wanderlog vs Splitwise vs Tulon](/blog/wanderlog-vs-splitwise-vs-tulon) comparison, and for the full feature breakdown, our [group travel planner page](/group-travel-planner).

**What's the difference between Splitwise and Tulon?**
Splitwise only splits expenses. Tulon splits expenses and builds a full day-by-day trip itinerary, in the same app.

**Is there a free Splitwise alternative for travel?**
Yes — Tulon, Tricount, and Settle Up are all free for basic use. Tulon is the only one of the three that also adds itinerary planning.

**Do Tricount or Settle Up support multiple currencies?**
Both are known for multi-currency support, similar to Splitwise. Tulon also converts automatically at a live exchange rate.

**What's best for a large group?**
Every app on this list supports larger groups. The real difference is whether you also want itinerary planning (Tulon) or just expense splitting (the rest).`,
      es: `Splitwise es la opción más conocida para dividir gastos compartidos, y con razón — es simple y precisa. Pero fue creada para cualquier tipo de gasto compartido (compañeros de piso, amigos, familia), no específicamente para viajes. Si buscas una alternativa más orientada al viaje en sí, aquí están las opciones.

**1. Tulon — Cuando También Quieres un Itinerario**
La diferencia clave: Tulon no solo divide gastos (con el mismo cálculo de transferencias mínimas que usa Splitwise) — también arma el itinerario día a día de tu viaje, con pronóstico del tiempo, compartición en tiempo real y un mapa compartido. Si de todos modos estás planificando un viaje, esto te ahorra una app completa. Totalmente gratis.

**2. Tricount — Simple, Enfocada en Europa**
Una app europea popular para dividir gastos grupales, con buen soporte multi-moneda. Muy similar a Splitwise en su enfoque — simplicidad y foco puro en el cálculo de gastos, sin herramientas de planificación de viaje.

**3. Settle Up — Flexible para Varios Grupos**
Otra app establecida de división de gastos, con soporte para múltiples grupos y "cuentas" separadas. Como Splitwise y Tricount, se enfoca solo en la matemática de los gastos.

**4. TravelSpend — Seguimiento de Presupuesto Personal**
TravelSpend se enfoca en el seguimiento de gastos personales durante el viaje (cuánto gastaste hoy, cuánto presupuesto queda), con un componente social para compartir. Menos orientada a dividir costos con precisión entre varios pagadores.

**5. Una Planilla Compartida — La Base que Todos Conocen**
Sigue siendo donde cae la mayoría de los grupos por defecto. Gratis y totalmente flexible, pero requiere actualización manual y es fácil de equivocarse u olvidar un gasto.

**¿Cuál Elegir?**
Si la planificación y el itinerario ya ocurren en otro lugar y solo necesitas dividir costos, Splitwise, Tricount o Settle Up harán el trabajo. Si también quieres planificar el viaje en sí y no solo ajustar cuentas al final, Tulon es la única opción de esta lista que hace ambas cosas, gratis. Para más sobre las diferencias entre estos enfoques, mira nuestra comparación [Wanderlog vs Splitwise vs Tulon](/blog/wanderlog-vs-splitwise-vs-tulon), y para el desglose completo de funciones, nuestra [página de planificador de viajes en grupo](/group-travel-planner).

**¿Cuál es la diferencia entre Splitwise y Tulon?**
Splitwise solo divide gastos. Tulon divide gastos y arma un itinerario de viaje completo día a día, en la misma app.

**¿Existe una alternativa gratuita a Splitwise para viajes?**
Sí — Tulon, Tricount y Settle Up son gratis para uso básico. Tulon es la única de las tres que también suma planificación de itinerario.

**¿Tricount o Settle Up admiten múltiples monedas?**
Ambas son conocidas por su soporte multi-moneda, similar a Splitwise. Tulon también convierte automáticamente al tipo de cambio en vivo.

**¿Qué es mejor para un grupo grande?**
Todas las apps de esta lista admiten grupos grandes. La diferencia real es si también quieres planificación de itinerario (Tulon) o solo división de gastos (el resto).`,
    },
  },
  {
    slug: "plan-group-trip-without-spreadsheets",
    emoji: "👥",
    category: { he: "טיולים קבוצתיים", en: "Group Travel", es: "Viaje en Grupo" },
    date: "2026-09-19",
    readMin: 5,
    title: {
      he: "איך מתכננים טיול קבוצתי בלי אקסל (ובלי לאבד את השפיות)",
      en: "How to Plan a Group Trip Without Spreadsheets",
      es: "Cómo Planificar un Viaje en Grupo Sin Hojas de Cálculo",
    },
    excerpt: {
      he: "גיליון אקסל משותף נראה כמו הפתרון הכי פשוט לטיול קבוצתי — עד שמישהו עורך בטעות, מישהו אחר לא רואה את השינוי, וכולם מבולבלים. הנה איך לתכנן בלי זה.",
      en: "A shared spreadsheet looks like the simplest way to plan a group trip — until someone edits it by mistake, someone else doesn't see the change, and everyone's confused. Here's how to plan without one.",
      es: "Una planilla compartida parece la forma más simple de planificar un viaje en grupo — hasta que alguien la edita por error, otro no ve el cambio, y todos quedan confundidos. Así se planifica sin ella.",
    },
    body: {
      he: `גיליון אקסל משותף מרגיש כמו הפתרון הטבעי לטיול קבוצתי: כולם כבר יודעים להשתמש בו, הוא חינמי, ואפשר להוסיף בו כל עמודה שרוצים. הבעיה מתחילה כשהטיול באמת יוצא לדרך.

**למה אקסל נשבר בפועל**
- מישהו עורך תא בטעות ואף אחד לא שם לב.
- אין גרסה "נכונה" אחת — כל אחד פותח עותק אחר, או שכחו לרענן.
- הוצאות נרשמות בטלפון, אבל אקסל פתוח רק במחשב — אז הן נכתבות "אחר כך" ונשכחות.
- אין שום חישוב אוטומטי של מי חייב למי — צריך לעשות את זה ידנית בסוף, וזה בדיוק הרגע שהכי קל לטעות בו.

**מה בעצם צריך במקום זה**
לא צריך "יותר עמודות" — צריך מקור אמת אחד שמתעדכן בזמן אמת לכל הקבוצה, ושעובד מהטלפון באותו רגע שההוצאה קורית.

**1. מקום אחד למסלול**
במקום טאב נפרד באקסל לכל יום, מסלול חי שכולם רואים באותו רגע — כולל שינויים של הרגע האחרון.

**2. רישום הוצאה תוך שניות**
ברגע שמשלמים — לא "מוסיפים לרשימה לזכור לרשום באקסל בערב" — פותחים את הטלפון ורושמים. זה ההבדל בין לתעד הכל לבין לגלות בסוף הטיול שחצי מההוצאות נעלמו.

**3. חישוב אוטומטי בסוף**
לא עוד "רגע, בואו נעשה חשבון" בשדה התעופה. מי שילם, מי חייב וכמה — מחושב אוטומטית, במספר המינימלי של העברות.

**איך טיולון עושה את זה**
טיולון בנויה בדיוק סביב שלוש הבעיות האלה: מסלול משותף שכל חברי הקבוצה רואים ועורכים בזמן אמת, רישום הוצאה מהטלפון תוך שניות (כולל צילום קבלה שהאפליקציה קוראת לבד), והתחשבנות אוטומטית בסוף הטיול. בלי טאבים, בלי גרסאות סותרות, בלי "מי עדכן את זה לאחרונה" — וחינמי לגמרי. פירוט מלא ב[עמוד תכנון הטיול הקבוצתי](/group-travel-planner) שלנו. וברגע שהטיול כבר יצא לדרך, יש לנו גם מדריך ל[ניהול הוצאות בזמן אמת](/blog/manage-expenses-during-group-trip) לאורך הטיול עצמו.

**למה גיליון אקסל לא מספיק לטיול קבוצתי?**
כי אין בו עדכון אמיתי בזמן אמת, אין רישום נוח מהטלפון ברגע ההוצאה, ואין חישוב אוטומטי של מי חייב למי. כל אלה דורשים עבודה ידנית שקל לטעות בה.

**מה האלטרנטיבה הכי טובה לאקסל לתכנון טיול?**
אפליקציה ייעודית שמשלבת מסלול משותף וניהול הוצאות באותו מקום, כמו טיולון — כך שאין צורך לתחזק כלי נפרד לכל דבר.

**האם אפשר לייבא נתונים מאקסל קיים לטיולון?**
כרגע לא, אבל התחלת טיול חדש בטיולון לוקחת פחות מדקה — קל יותר להתחיל טרי מאשר לייבא גיליון מבולגן.

**האם זה עובד גם לקבוצה גדולה?**
כן, אין הגבלה על מספר המשתתפים בטיול.`,
      en: `A shared spreadsheet feels like the obvious solution for a group trip: everyone already knows how to use it, it's free, and you can add any column you want. The problem starts once the trip actually gets underway.

**Why Spreadsheets Actually Break Down**
- Someone edits a cell by accident and nobody notices.
- There's no single "correct" version — everyone opens a different copy, or forgets to refresh.
- Expenses happen on a phone, but the spreadsheet only lives on a laptop — so they get written down "later" and forgotten.
- There's no automatic calculation of who owes whom — you have to do it manually at the end, which is exactly the moment it's easiest to get wrong.

**What You Actually Need Instead**
Not "more columns" — one single source of truth that updates in real time for the whole group, and that works from a phone the moment an expense happens.

**1. One Place for the Itinerary**
Instead of a separate tab per day, a live itinerary everyone sees at the same moment — including last-minute changes.

**2. Logging an Expense in Seconds**
The moment you pay, you don't "add it to the list to remember to enter into the spreadsheet tonight" — you open your phone and log it. That's the difference between capturing everything and discovering at the end of the trip that half the expenses vanished.

**3. Automatic Calculation at the End**
No more "hold on, let's do the math" at the airport. Who paid, who owes, and how much — calculated automatically, in the minimum number of transfers.

**How Tulon Does This**
Tulon is built around exactly these three problems: a shared itinerary the whole group sees and edits in real time, expense logging from a phone in seconds (including a photographed receipt the app reads on its own), and automatic settlement at the end of the trip. No tabs, no conflicting versions, no "who last updated this" — and completely free. Full details on our [group travel planner page](/group-travel-planner). And once the trip is actually underway, see our guide to [managing expenses in real time](/blog/manage-expenses-during-group-trip) throughout the trip itself.

**Why isn't a spreadsheet enough for a group trip?**
Because it has no real real-time sync, no easy way to log an expense from a phone the moment it happens, and no automatic calculation of who owes whom. All of that requires manual work that's easy to get wrong.

**What's the best alternative to a spreadsheet for trip planning?**
A dedicated app that combines a shared itinerary and expense management in one place, like Tulon — so you don't need to maintain a separate tool for each.

**Can I import an existing spreadsheet into Tulon?**
Not currently, but starting a new trip in Tulon takes under a minute — easier than importing a messy spreadsheet.

**Does this work for a large group too?**
Yes, there's no limit on the number of people in a trip.`,
      es: `Una planilla compartida parece la solución obvia para un viaje en grupo: todos ya saben usarla, es gratis, y puedes agregar cualquier columna que quieras. El problema empieza cuando el viaje realmente arranca.

**Por Qué las Planillas Fallan en la Práctica**
- Alguien edita una celda por error y nadie se da cuenta.
- No hay una versión "correcta" única — cada uno abre una copia distinta, o se olvida de actualizar.
- Los gastos ocurren en el celular, pero la planilla solo vive en la laptop — así que se anotan "después" y se olvidan.
- No hay cálculo automático de quién le debe a quién — hay que hacerlo a mano al final, justo el momento en que es más fácil equivocarse.

**Lo Que Realmente Necesitas en Su Lugar**
No hace falta "más columnas" — hace falta una única fuente de verdad que se actualice en tiempo real para todo el grupo, y que funcione desde el celular en el momento mismo del gasto.

**1. Un Solo Lugar para el Itinerario**
En lugar de una pestaña por día, un itinerario en vivo que todos ven en el mismo momento — incluidos los cambios de último minuto.

**2. Registrar un Gasto en Segundos**
En el momento en que pagas, no "lo agregas a la lista para recordar anotarlo en la planilla a la noche" — abres el celular y lo registras. Esa es la diferencia entre capturar todo y descubrir al final del viaje que la mitad de los gastos desaparecieron.

**3. Cálculo Automático al Final**
Nada de "esperen, hagamos la cuenta" en el aeropuerto. Quién pagó, quién debe y cuánto — calculado automáticamente, con el número mínimo de transferencias.

**Cómo Lo Hace Tulon**
Tulon está construida exactamente alrededor de estos tres problemas: un itinerario compartido que todo el grupo ve y edita en tiempo real, registro de gastos desde el celular en segundos (incluida una foto de un recibo que la app lee sola), y liquidación automática al final del viaje. Sin pestañas, sin versiones en conflicto, sin "quién actualizó esto por última vez" — y totalmente gratis. Todos los detalles en nuestra [página de planificador de viajes en grupo](/group-travel-planner). Y una vez que el viaje ya esté en marcha, mira nuestra guía para [gestionar los gastos en tiempo real](/blog/manage-expenses-during-group-trip) durante el viaje mismo.

**¿Por qué no alcanza una planilla para un viaje en grupo?**
Porque no tiene sincronización real en tiempo real, no hay forma fácil de registrar un gasto desde el celular en el momento en que ocurre, y no hay cálculo automático de quién le debe a quién. Todo eso requiere trabajo manual fácil de hacer mal.

**¿Cuál es la mejor alternativa a una planilla para planificar un viaje?**
Una app dedicada que combine itinerario compartido y gestión de gastos en un solo lugar, como Tulon — así no necesitas mantener una herramienta separada para cada cosa.

**¿Puedo importar una planilla existente a Tulon?**
Actualmente no, pero empezar un viaje nuevo en Tulon toma menos de un minuto — más fácil que importar una planilla desordenada.

**¿Esto funciona también para un grupo grande?**
Sí, no hay límite en la cantidad de personas en un viaje.`,
    },
  },
  {
    slug: "manage-expenses-during-group-trip",
    emoji: "📲",
    category: { he: "כלים חכמים", en: "Smart Tools", es: "Herramientas Inteligentes" },
    date: "2026-09-19",
    readMin: 5,
    title: {
      he: "איך לנהל הוצאות בזמן אמת בטיול קבוצתי (לא רק בסוף)",
      en: "How to Manage Expenses During a Group Trip (Not Just at the End)",
      es: "Cómo Gestionar los Gastos Durante un Viaje en Grupo (No Solo al Final)",
    },
    excerpt: {
      he: "רוב המדריכים מתמקדים איך מתחשבנים בסוף. השאלה החשובה יותר היא איך לא מגיעים לסוף עם חצי מהמידע חסר. הרגלים לניהול הוצאות תוך כדי הטיול עצמו.",
      en: "Most guides focus on how to settle up at the end. The more important question is how you avoid reaching the end with half the information missing. Habits for managing expenses while the trip is actually happening.",
      es: "La mayoría de las guías se enfocan en cómo ajustar cuentas al final. La pregunta más importante es cómo evitar llegar al final con la mitad de la información faltante. Hábitos para gestionar gastos mientras el viaje sucede.",
    },
    body: {
      he: `יש הרבה תוכן על "איך מתחשבנים בסוף טיול" — אבל ההתחשבנות בסוף טובה בדיוק כמו המידע שנאסף לאורך הדרך. אם חצי מההוצאות לא נרשמו, שום נוסחה לא תתקן את זה. הנה איך לנהל הוצאות תוך כדי הטיול, לא רק בסופו.

**1. רשמו ברגע התשלום, לא "אחר כך"**
"אחר כך" הופך לעולם לא. הרגל אחד שמשנה הכל: ברגע שמשלמים — טלפון, אפליקציה, 10 שניות. לפני שממשיכים הלאה.

**2. אל תחכו לסוף היום כדי "לרכז"**
ריכוז יומי נשמע מסודר, אבל בפועל הוא אומר לזכור עשר הוצאות מהיום מהזיכרון בערב, עייפים, אחרי יום שלם. עדיף לתעד תוך כדי.

**3. תנו לאפליקציה להמיר מטבע, לא לכם**
בטיול עם כמה מטבעות (למשל אירו למלונות, באט תאילנדי לאוכל), לנסות לחשב "כמה זה בשקלים" בראש בכל פעם זה מתכון לטעויות. אפליקציה שממירה אוטומטית לפי שער חי חוסכת את זה לגמרי.

**4. תעדו מי בפועל שילם, לא מי "היה אמור"**
אם התכנון היה שכל אחד ישלם על עצמו אבל בפועל מישהו שילם על כולם במסעדה — תעדו את מה שקרה באמת, לא את התוכנית המקורית. זה בדיוק המקום שבו זיכרון בסוף הטיול נכשל.

**5. תבדקו את התקציב באמצע, לא רק בסוף**
לדעת שחרגתם מהתקציב ביום השלישי מתוך עשרה נותן זמן לתקן. לגלות את זה ביום העשירי — לא.

**איך טיולון תומכת בזה**
טיולון בנויה סביב רישום מיידי — כולל צילום קבלה שהאפליקציה קוראת לבד, המרת מטבע אוטומטית לפי שער חי, ותצוגת תקציב חיה שמתעדכנת עם כל הוצאה. ההתחשבנות בסוף נהיית קלה כי המידע כבר שם, מדויק, מהרגע הראשון. עוד על ההרגלים הנכונים עוד לפני שיוצאים לדרך — ב[מדריך לתכנון טיול קבוצתי בלי אקסל](/blog/plan-group-trip-without-spreadsheets). ועל מה קורה אחרי שחוזרים — ב[מדריך המלא להתחשבנות בטיול קבוצתי](/blog/group-settlement-guide). פירוט מלא של התכונות ב[עמוד תכנון הטיול הקבוצתי](/group-travel-planner) שלנו.

**מתי הכי טוב לרשום הוצאה?**
מיד ברגע התשלום. זה ההרגל היחיד שבאמת מונע הוצאות נשכחות.

**איך מתמודדים עם כמה מטבעות בטיול אחד?**
עדיף אפליקציה שממירה אוטומטית לפי שער חליפין חי, כדי לא לחשב ידנית כל פעם.

**האם צריך "אחראי הוצאות" אחד בקבוצה?**
לא בהכרח — אם כל אחד רושם את מה ששילם בעצמו ברגע האמת, אין צורך במרכז אחד שאוסף הכל בדיעבד.

**מה עדיף — לעקוב אחר תקציב כולל או לפי קטגוריה?**
שניהם מועילים, אבל מעקב לפי קטגוריה (אוכל, תחבורה, בילויים) עוזר לזהות מוקדם איפה בפועל חורגים.`,
      en: `There's a lot of content out there about "how to settle up at the end of a trip" — but the settlement at the end is only as good as the information gathered along the way. If half the expenses were never logged, no formula fixes that. Here's how to manage expenses while the trip is happening, not just at the end of it.

**1. Log It the Moment You Pay, Not "Later"**
"Later" tends to become never. One habit changes everything: the moment you pay — phone, app, 10 seconds. Before you move on.

**2. Don't Wait Until the End of the Day to "Catch Up"**
Doing it once a day sounds tidy, but in practice it means recalling ten expenses from memory in the evening, tired, after a full day. Logging as you go beats reconstructing later.

**3. Let the App Convert Currency, Not You**
On a trip with several currencies (euros for hotels, Thai baht for food, say), trying to calculate "how much is that in my currency" in your head every time is a recipe for mistakes. An app that converts automatically at a live rate removes that entirely.

**4. Record Who Actually Paid, Not Who Was "Supposed To"**
If the plan was everyone pays for themselves but in practice someone covered the whole table at dinner, log what actually happened, not the original plan. This is exactly where memory fails by the end of the trip.

**5. Check the Budget Midway, Not Only at the End**
Knowing you're over budget on day three of ten leaves time to correct course. Finding out on day ten doesn't.

**How Tulon Supports This**
Tulon is built around instant logging — including a photographed receipt the app reads on its own, automatic currency conversion at a live rate, and a live budget view that updates with every expense. Settlement at the end becomes easy because the information is already there, accurate, from the first moment. For the right habits before you even leave, see our guide to [planning a group trip without spreadsheets](/blog/plan-group-trip-without-spreadsheets). For what happens after you're back, see our [complete guide to settling up after a group trip](/blog/group-settlement-guide). Full feature details on our [group travel planner page](/group-travel-planner).

**When's the best time to log an expense?**
Immediately, the moment you pay. It's the one habit that actually prevents forgotten expenses.

**How do you handle multiple currencies on one trip?**
An app that converts automatically at a live exchange rate is better than calculating it manually every time.

**Does the group need one designated "expense person"?**
Not necessarily — if everyone logs what they personally paid in the moment, there's no need for one person to collect everything after the fact.

**Is it better to track total budget or by category?**
Both help, but tracking by category (food, transport, activities) helps you spot early where you're actually overspending.`,
      es: `Hay mucho contenido sobre "cómo ajustar cuentas al final de un viaje" — pero la liquidación final es tan buena como la información reunida en el camino. Si la mitad de los gastos nunca se registraron, ninguna fórmula lo arregla. Así se gestionan los gastos mientras el viaje sucede, no solo al final.

**1. Regístralo en el Momento en que Pagas, No "Después"**
"Después" tiende a convertirse en nunca. Un hábito que lo cambia todo: en el momento en que pagas — celular, app, 10 segundos. Antes de seguir.

**2. No Esperes al Final del Día para "Ponerte al Día"**
Hacerlo una vez al día suena ordenado, pero en la práctica significa recordar diez gastos de memoria en la noche, cansado, después de un día entero. Registrar sobre la marcha es mejor que reconstruir después.

**3. Deja que la App Convierta la Moneda, No Tú**
En un viaje con varias monedas (euros para hoteles, baht tailandés para comida, digamos), intentar calcular "cuánto es eso en mi moneda" mentalmente cada vez es una receta para errores. Una app que convierte automáticamente al tipo de cambio en vivo elimina eso por completo.

**4. Registra Quién Pagó Realmente, No Quién "Debía" Pagar**
Si el plan era que cada uno pagara lo suyo pero en la práctica alguien cubrió toda la mesa en la cena, registra lo que realmente pasó, no el plan original. Ahí es exactamente donde falla la memoria al final del viaje.

**5. Revisa el Presupuesto a Mitad de Camino, No Solo al Final**
Saber que te pasaste del presupuesto el día tres de diez te da tiempo para corregir. Descubrirlo el día diez, no.

**Cómo Te Ayuda Tulon con Esto**
Tulon está construida alrededor del registro instantáneo — incluida una foto de un recibo que la app lee sola, conversión automática de moneda al tipo de cambio en vivo, y una vista de presupuesto en vivo que se actualiza con cada gasto. La liquidación al final se vuelve fácil porque la información ya está ahí, precisa, desde el primer momento. Para los hábitos correctos incluso antes de salir de viaje, mira nuestra guía para [planificar un viaje en grupo sin hojas de cálculo](/blog/plan-group-trip-without-spreadsheets). Para lo que pasa después de volver, mira nuestra [guía completa para liquidar cuentas tras un viaje en grupo](/blog/group-settlement-guide). Todos los detalles en nuestra [página de planificador de viajes en grupo](/group-travel-planner).

**¿Cuál es el mejor momento para registrar un gasto?**
Inmediatamente, en el momento en que pagas. Es el único hábito que realmente previene los gastos olvidados.

**¿Cómo se manejan varias monedas en un mismo viaje?**
Una app que convierte automáticamente al tipo de cambio en vivo es mejor que calcularlo a mano cada vez.

**¿El grupo necesita una persona designada para los gastos?**
No necesariamente — si cada uno registra lo que pagó personalmente en el momento, no hace falta que una sola persona recopile todo después.

**¿Es mejor seguir el presupuesto total o por categoría?**
Ambos ayudan, pero seguir por categoría (comida, transporte, actividades) ayuda a detectar temprano dónde realmente te estás excediendo.`,
    },
  },
  {
    slug: "best-group-trip-planner-apps-2026",
    emoji: "🏆",
    category: { he: "השוואות", en: "Comparisons", es: "Comparativas" },
    date: "2026-09-14",
    readMin: 7,
    title: {
      he: "5 האפליקציות הכי טובות לתכנון טיול קבוצתי ב-2026",
      en: "Best Trip Planner Apps for Group Travel in 2026 (Compared)",
      es: "Las Mejores Apps para Planificar Viajes en Grupo en 2026",
    },
    excerpt: {
      he: "בדקנו חמש אפליקציות לתכנון טיול קבוצתי בהשוואה כנה — מה כל אחת עושה טוב, איפה היא נופלת, ואיזו אחת באמת עושה גם מסלול וגם חלוקת הוצאות באותו מקום.",
      en: "We compared five group trip planning apps — what each does well, where each falls short, and which one actually handles both the itinerary and splitting expenses in the same place.",
      es: "Comparamos cinco apps para planificar viajes en grupo — qué hace bien cada una, dónde falla y cuál realmente maneja el itinerario y la división de gastos en el mismo lugar.",
    },
    body: {
      he: `מי שתכנן טיול קבוצתי יודע: השאלה היא לא רק לאן נוסעים, אלא איך שומרים על כולם מתואמים — מה קורה מחר, מי שילם על מה, וכמה כל אחד באמת הוציא. בדקנו חמש אפליקציות שאנשים בפועל משתמשים בהן לתכנון טיול קבוצתי, בלי הגזמות ובלי להתעלם מהחסרונות.

**מה הופך אפליקציה לתכנון טיול לשווה שימוש**
לפני ההשוואה עצמה, שווה להגדיר מה בודקים. אפליקציה טובה לטיול קבוצתי צריכה לתכנן מסלול יומי אמיתי (לא רק רשימת מקומות), לנהל תקציב והוצאות ולחשב מי חייב למי, לעדכן את כל הקבוצה בזמן אמת, ולעבוד גם בלי חיבור לאינטרנט. רוב האפליקציות עושות חלק מזה. מעטות עושות את הכל.

**1. טיולון — הכי שלמה: גם מסלול, גם הוצאות, בחינם**
טיולון היא היחידה מבין החמש שעושה גם תכנון מסלול יומי וגם ניהול הוצאות מלא, באותה אפליקציה. בונים לוח זמנים לכל יום — עם תחזית מזג אוויר ומסלול הליכה מומלץ בין המקומות — ומנהלים תקציב שבו כל הוצאה, בכל מטבע, מומרת אוטומטית לפי שער חי. אפשר גם לצלם קבלה והאפליקציה תזהה סכום, מטבע ותאריך לבד.

בסוף הטיול טיולון מחשבת לבד מי חייב למי וכמה, במספר המינימלי של העברות. כל חברי הקבוצה מצטרפים בקישור אחד ורואים את אותו הטיול בזמן אמת, כולל מצב "צפייה בלבד" למי שרק רוצה לעקוב בלי לערוך.

- מה חסר: זו אפליקציה צעירה יחסית, בלי מאגר ההמלצות הענק של Wanderlog ובלי חיבור אוטומטי למיילים של הזמנות כמו TripIt.
- למי מתאימה: לכל קבוצה — משפחה, חברים, נסיעת עבודה — שרוצה גם מסלול וגם הוצאות באותו מקום, בלי לשלם.

**2. Wanderlog — הכי טובה למפה ולתכנון חזותי**
Wanderlog בנויה סביב מפה: מסמנים מקומות, מארגנים לפי ימים, וגוררים את הסדר. לעבודה קבוצתית על מסלול זה מצוין — כולם עורכים יחד ורואים את המסלול על המפה בזמן אמת.

- מה חסר: אין ב-Wanderlog ניהול תקציב מובנה ואין חלוקת הוצאות בכלל. אחרי שהמסלול מוכן, השימוש באפליקציה יורד משמעותית.
- למי מתאימה: לקבוצה שכבר יודעת לאן היא נוסעת וצריכה בעיקר לתאם ויזואלית מי הולך לאן.

**3. TripIt — הכי טובה לארגון הזמנות קיימות**
TripIt לוקחת את כל אישורי ההזמנה שקיבלתם במייל — טיסות, מלונות, השכרת רכב — ומרכזת אותם במסלול אחד אוטומטית. מצוינת אם כבר הזמנתם הכל וצריכים רק סדר.

- מה חסר: אין תכנון פעילויות יומי אמיתי (רק מה שכבר הוזמן), ואין שום ניהול תקציב או הוצאות.
- למי מתאימה: מי שנוסע הרבה לעבודה ורוצה שכל האישורים יהיו במקום אחד — לא לתכנון טיול מאפס.

**4. Splitwise — הכי טובה לחלוקת הוצאות (ורק לזה)**
Splitwise היא שם דבר בחלוקת הוצאות — לא רק לטיולים, גם לשותפים לדירה ולכל הוצאה משותפת. הממשק פשוט והחישוב מדויק.

- מה חסר: אין שום רכיב תכנון טיול — לא מסלול, לא יומן, לא מפה. זו אפליקציית הוצאות בלבד, שצריך להפעיל לצד כלי אחר לגמרי לתכנון עצמו.
- למי מתאימה: קבוצה ששולטת בתכנון בעצמה (או לא צריכה תכנון בכלל) ורוצה רק לסגור חשבון בסוף.

**5. Google Sheets / קבוצת וואטסאפ — מה שרוב האנשים עושים בפועל**
בלי אפליקציה ייעודית, זה מה שקורה: טבלת אקסל משותפת, וקבוצת וואטסאפ עם צילומי מסך של קבלות. זה חינמי וכולם כבר יודעים להשתמש בזה.

- מה חסר: אין חישוב אוטומטי, קל מאוד לטעות או לשכוח הוצאה, והמידע מפוזר בין שני מקומות שונים במקום להיות מרוכז.
- למי מתאימה: טיולים קצרים וקטנים שבהם אף אחד לא רוצה להתקין עוד אפליקציה.

**מי צריך מה**
נוסעים כקבוצה גדולה וצריכים גם מסלול וגם חלוקת הוצאות? טיולון היא האפליקציה היחידה מהחמש שעושה את שתיהן. כבר יודעים לאן נוסעים וצריכים רק לתאם מפה עם חברים? Wanderlog. נוסעים בעיקר לעבודה עם המון הזמנות קיימות? TripIt. רק צריכים לסגור חשבון בלי שום תכנון? Splitwise. טיול של סוף שבוע בלי חשק להתקין כלום? תישארו עם וואטסאפ — אבל דעו שברגע שהטיול מתארך, זה בדיוק המקום שבו הדברים מתחילים להישכח.

**לסיכום**
רוב האפליקציות בהשוואה הזו עושות דבר אחד טוב: מפה, או הזמנות, או הוצאות. טיולון היא היוצאת מהכלל — היא לוקחת את המסלול ואת ההוצאות ומחזיקה אותם באותו מקום, בזמן אמת, בחינם. וזה בדיוק ההבדל בין כלי שפותחים פעם אחת בשלב התכנון, לכלי שפתוח אצלכם לאורך כל הטיול.

לפירוט מלא של כל התכונות לתכנון טיול קבוצתי בטיולון — מסלול, תקציב, חלוקת הוצאות והכל — ראו את [עמוד תכנון הטיול הקבוצתי](/group-travel-planner) שלנו.

**האם יש אפליקציה אחת שעושה גם מסלול טיול וגם חלוקת הוצאות?**
כן — טיולון היא היחידה מבין החמש שבדקנו שמשלבת תכנון מסלול יומי מלא עם ניהול תקציב וחלוקת הוצאות אוטומטית, באותה אפליקציה ובחינם.

**מה ההבדל בין Wanderlog לטיולון?**
Wanderlog מתמקדת בתכנון מסלול על מפה ובשיתוף פעולה ויזואלי, בלי ניהול תקציב. טיולון עושה גם מסלול יומי וגם הוצאות וחלוקת תשלומים, כך שלא צריך שתי אפליקציות נפרדות.

**האם Splitwise מספיקה לטיול קבוצתי?**
לחלוקת הוצאות בלבד — כן. אבל היא לא כוללת שום כלי תכנון מסלול, לוח זמנים או שיתוף פעילויות, אז רוב הקבוצות עדיין צריכות כלי נוסף לצד Splitwise.

**כמה עולה טיולון?**
טיולון חינמית לחלוטין, בלי גרסת פרימיום ובלי פרסומות.

**האם אפשר להשתמש בטיולון בלי חיבור לאינטרנט?**
כן, האפליקציה עובדת גם במצב לא מקוון, ומסתנכרנת ברגע שיש חיבור.`,
      en: `Anyone who's planned a group trip knows the real challenge isn't picking a destination — it's keeping everyone on the same page: what's happening tomorrow, who paid for what, and how much everyone has actually spent. We compared five apps people actually use for group trip planning — no exaggeration, and no skipping the downsides.

**What Makes a Group Trip App Worth Using**
Before comparing, it's worth agreeing on the bar. A good group trip app should plan a real day-by-day itinerary (not just a list of places), manage a shared budget and work out who owes whom, keep the whole group updated in real time, and work offline. Most apps do part of this. Few do all of it.

**1. Tulon — The Only One That Does Both: Itinerary and Expenses, Free**
Tulon is the only one of the five that handles full day-by-day itinerary planning and full expense management in the same app. Build a schedule for each day — with a weather forecast and a suggested walking route between that day's places — and track a budget where every expense, in any currency, converts automatically at a live rate. Photograph a receipt and the app reads the amount, currency, and date on its own.

At the end of the trip, Tulon works out who owes whom and how much, in the minimum number of transfers. Everyone joins with one link and sees the same trip update in real time, including a "view-only" mode for someone who just wants to follow along.

- What's missing: it's a younger app, without Wanderlog's huge place-recommendation database or TripIt's automatic email-confirmation import.
- Best for: any group — family, friends, work trip — that wants itinerary and expenses in the same place, for free.

**2. Wanderlog — Best for Map-Based, Visual Planning**
Wanderlog is built around a map: pin places, group them by day, drag the order around. For collaborative itinerary work it's excellent — everyone edits together and sees the route on the map in real time.

- What's missing: no built-in budget tracker and no expense splitting at all. Once the itinerary is set, the app's usefulness drops off sharply.
- Best for: a group that already knows where it's going and mainly needs to coordinate visually.

**3. TripIt — Best for Organizing Bookings You Already Made**
TripIt pulls every confirmation email you've got — flights, hotels, car rentals — into one automatic itinerary. Great if everything is already booked and you just need it organized.

- What's missing: no real day-by-day activity planning (only what's already booked), and no budget or expense features at all.
- Best for: frequent travelers who want every confirmation in one place, not trip planning from scratch.

**4. Splitwise — Best for Splitting Expenses (And Only That)**
Splitwise is the go-to for splitting shared costs — not just on trips, also roommates and any shared expense. Simple interface, accurate math.

- What's missing: zero trip-planning features — no itinerary, no calendar, no map. It's an expense app you'd have to run alongside a completely separate planning tool.
- Best for: a group that already has planning handled and just needs to settle up at the end.

**5. A Shared Spreadsheet / WhatsApp Group — What Most Groups Actually Use**
Without a dedicated app, this is the default: a shared spreadsheet, plus a WhatsApp thread full of receipt screenshots. Free, and everyone already knows how to use it.

- What's missing: no automatic calculation, easy to make a mistake or forget an expense, and the information is split across two different places instead of living in one.
- Best for: short, small trips where nobody wants to install another app.

**Which One Should You Use?**
Traveling as a larger group and need both an itinerary and expense splitting? Tulon is the only one of the five that does both. Already know where you're going and just need to coordinate on a map? Wanderlog. Mostly traveling for work with a lot of existing bookings? TripIt. Just need to settle up with no planning involved? Splitwise. A weekend trip and nobody wants to install anything? Stick with WhatsApp — but know that's exactly where things start getting forgotten once the trip runs longer than a couple of days.

**The Bottom Line**
Most of the apps in this comparison do one thing well: the map, or the bookings, or the expenses. Tulon is the exception — it keeps the itinerary and the expenses in the same place, in real time, for free. That's the difference between a tool you open once while planning and one that stays open for the whole trip.

For the full rundown of Tulon's group trip planning features — itinerary, budget, expense splitting, all of it — see our [group travel planner page](/group-travel-planner).

**Is there one app that does both trip itinerary planning and expense splitting?**
Yes — Tulon is the only one of the five apps we compared that combines full day-by-day itinerary planning with automatic budget tracking and expense splitting, in the same free app.

**What's the difference between Wanderlog and Tulon?**
Wanderlog focuses on map-based itinerary planning and visual collaboration, with no budget tools. Tulon handles both the day-by-day itinerary and expense splitting, so you don't need two separate apps.

**Is Splitwise enough for a group trip?**
For splitting expenses alone, yes. But it has no trip-planning tools at all — no itinerary, no schedule, no activity sharing — so most groups still need a second app alongside it.

**How much does Tulon cost?**
Tulon is completely free, with no premium tier and no ads.

**Can you use Tulon offline?**
Yes, the app works offline and syncs automatically once you're back online.`,
      es: `Quien haya planificado un viaje en grupo lo sabe: el verdadero desafío no es elegir el destino, sino mantener a todos coordinados — qué pasa mañana, quién pagó qué y cuánto gastó realmente cada uno. Comparamos cinco apps que la gente realmente usa para planificar viajes en grupo, sin exagerar y sin ocultar los defectos.

**Qué Hace que una App de Viajes en Grupo Valga la Pena**
Antes de comparar, conviene definir el criterio. Una buena app de viaje en grupo debería planificar un itinerario real día a día (no solo una lista de lugares), gestionar un presupuesto compartido y calcular quién le debe a quién, mantener a todo el grupo actualizado en tiempo real, y funcionar sin conexión. La mayoría de las apps hacen parte de esto. Pocas lo hacen todo.

**1. Tulon — La Única que Hace Ambas Cosas: Itinerario y Gastos, Gratis**
Tulon es la única de las cinco que ofrece planificación completa de itinerario día a día y gestión completa de gastos en la misma app. Arma un horario para cada día — con pronóstico del tiempo y una ruta a pie sugerida entre los lugares de ese día — y controla un presupuesto donde cada gasto, en cualquier moneda, se convierte automáticamente al tipo de cambio en vivo. Fotografía un recibo y la app reconoce el monto, la moneda y la fecha por sí sola.

Al final del viaje, Tulon calcula sola quién le debe a quién y cuánto, con el número mínimo de transferencias. Todos se unen con un solo enlace y ven el mismo viaje actualizado en tiempo real, incluido un modo "solo lectura" para quien solo quiere seguir el plan sin editarlo.

- Lo que falta: es una app más joven, sin la enorme base de recomendaciones de lugares de Wanderlog ni la importación automática de emails de confirmación de TripIt.
- Ideal para: cualquier grupo — familia, amigos, viaje de trabajo — que quiera itinerario y gastos en el mismo lugar, gratis.

**2. Wanderlog — La Mejor para Planificación Visual con Mapa**
Wanderlog está construida alrededor de un mapa: marcas lugares, los agrupas por día y arrastras el orden. Para trabajar el itinerario en grupo es excelente — todos editan juntos y ven la ruta en el mapa en tiempo real.

- Lo que falta: no tiene control de presupuesto integrado ni división de gastos. Una vez armado el itinerario, la utilidad de la app baja mucho.
- Ideal para: un grupo que ya sabe a dónde va y necesita sobre todo coordinar visualmente.

**3. TripIt — La Mejor para Organizar Reservas Ya Hechas**
TripIt toma todos los emails de confirmación que recibiste — vuelos, hoteles, autos — y los reúne en un itinerario automático. Excelente si ya reservaste todo y solo necesitas orden.

- Lo que falta: no hay planificación real de actividades día a día (solo lo ya reservado), y ningún manejo de presupuesto o gastos.
- Ideal para: quien viaja mucho por trabajo y quiere todas las confirmaciones en un solo lugar, no para planificar un viaje desde cero.

**4. Splitwise — La Mejor para Dividir Gastos (Y Solo Eso)**
Splitwise es la referencia para dividir gastos compartidos — no solo en viajes, también entre compañeros de piso y cualquier gasto en común. Interfaz simple y cálculo preciso.

- Lo que falta: cero herramientas de planificación de viaje — sin itinerario, sin calendario, sin mapa. Es una app de gastos que habría que usar junto a otra herramienta completamente distinta para planificar.
- Ideal para: un grupo que ya tiene la planificación resuelta y solo necesita ajustar cuentas al final.

**5. Planilla Compartida / Grupo de WhatsApp — Lo que la Mayoría Hace en la Práctica**
Sin una app dedicada, esto es lo que pasa: una planilla compartida, más un grupo de WhatsApp lleno de capturas de recibos. Es gratis y todos ya saben usarlo.

- Lo que falta: no hay cálculo automático, es muy fácil equivocarse u olvidar un gasto, y la información queda repartida entre dos lugares distintos en vez de estar centralizada.
- Ideal para: viajes cortos y pequeños donde nadie quiere instalar otra app.

**¿Quién Necesita Qué?**
¿Viajan en un grupo grande y necesitan itinerario y división de gastos? Tulon es la única de las cinco que hace ambas cosas. ¿Ya saben a dónde van y solo necesitan coordinar en un mapa? Wanderlog. ¿Viajan sobre todo por trabajo con muchas reservas ya hechas? TripIt. ¿Solo necesitan ajustar cuentas sin ninguna planificación? Splitwise. ¿Un viaje de fin de semana sin ganas de instalar nada? Sigan con WhatsApp — pero sepan que ahí es exactamente donde las cosas empiezan a olvidarse en cuanto el viaje se alarga.

**En Resumen**
La mayoría de las apps de esta comparación hacen bien una sola cosa: el mapa, o las reservas, o los gastos. Tulon es la excepción — mantiene el itinerario y los gastos en el mismo lugar, en tiempo real, gratis. Esa es la diferencia entre una herramienta que abres una vez durante la planificación y una que queda abierta durante todo el viaje.

Para ver el desglose completo de las funciones de Tulon para viajes en grupo — itinerario, presupuesto, división de gastos, todo — visita nuestra [página de planificador de viajes en grupo](/group-travel-planner).

**¿Existe una app que haga tanto la planificación del itinerario como la división de gastos?**
Sí — Tulon es la única de las cinco apps que comparamos que combina planificación completa de itinerario día a día con control de presupuesto y división de gastos automática, en la misma app gratuita.

**¿Cuál es la diferencia entre Wanderlog y Tulon?**
Wanderlog se enfoca en la planificación de itinerario con mapa y la colaboración visual, sin herramientas de presupuesto. Tulon maneja tanto el itinerario día a día como la división de gastos, así que no necesitas dos apps distintas.

**¿Alcanza con Splitwise para un viaje en grupo?**
Para dividir gastos solamente, sí. Pero no tiene ninguna herramienta de planificación de viaje — ni itinerario, ni horario, ni compartir actividades — así que la mayoría de los grupos igual necesita una segunda app.

**¿Cuánto cuesta Tulon?**
Tulon es completamente gratis, sin nivel premium y sin publicidad.

**¿Se puede usar Tulon sin conexión?**
Sí, la app funciona sin conexión y se sincroniza automáticamente en cuanto vuelve la conexión.`,
    },
  },
  {
    slug: "tishrei-family-destinations",
    emoji: "✈️",
    category: { he: "יעדים", en: "Destinations", es: "Destinos" },
    date: "2026-08-16",
    readMin: 6,
    title: {
      he: "חגי תשרי מתקרבים: 5 יעדים קרובים וזולים לטיול משפחתי",
      en: "The Autumn Holidays Are Coming: 5 Close, Affordable Family Destinations",
      es: "Se Acercan las Fiestas de Otoño: 5 Destinos Cercanos y Económicos en Familia",
    },
    excerpt: {
      he: "חופשה ארוכה, משפחה שלמה ומחירים שמזנקים. הנה חמישה יעדים במרחק טיסה קצרה שמסתדרים עם תקציב אמיתי — ואיך לא לאבד את השליטה עליו בדרך.",
      en: "A long break, the whole family, and prices that spike. Here are five short-flight destinations that work with a real budget — and how to keep control of it along the way.",
      es: "Vacaciones largas, toda la familia y precios que se disparan. Aquí hay cinco destinos a corta distancia que funcionan con un presupuesto real — y cómo no perder el control.",
    },
    body: {
      he: `חגי תשרי מתקרבים, ואיתם החופשה המשפחתית הארוכה של השנה. זו גם התקופה שבה מחירי הטיסות והמלונות מזנקים, כי כולם מחפשים בדיוק באותם שבועות.

הפתרון של רוב המשפחות הוא לא לוותר על הטיול אלא לקצר את הטיסה. יעד במרחק שעתיים-שלוש חוסך גם כסף וגם את היום הראשון שהולך לאיבוד על מעבר זמן וילדים עייפים.

**יוון — האי שמתאים לגיל של הילדים**
רודוס וכרתים גדולים מספיק בשביל שבוע שלם בלי לזוז הרבה, עם חופים רדודים שנוחים לילדים קטנים. האיים הקטנים יפים יותר אבל דורשים מעבורות, וזה פחות מתאים כשנוסעים עם מזוודות ועגלה.

**קפריסין — הטיסה הקצרה ביותר**
פחות משעה באוויר. זה היעד שהכי קל להתחיל איתו אם זו הפעם הראשונה שאתם טסים עם ילדים קטנים, ואפשר גם לעשות ממנו סופ"ש ארוך במקום שבוע שלם.

**בטומי וטביליסי — הכי הרבה תמורה לכסף**
גאורגיה נשארת אחד היעדים המשתלמים באזור: אוכל מצוין במחירים נמוכים, ירוק, ואפשר לשלב ים והרים באותו טיול. הטיסה ארוכה קצת יותר מיוון אבל עדיין קצרה.

**בולגריה — טבע בלי לשלם על זה**
סופיה וההרים סביבה, או החוף בים השחור. יעד שמתאים במיוחד למשפחות שאוהבות טיולי טבע ולא מחפשות חיי לילה או קניות.

**מונטנגרו — היפה שעוד לא התמלא**
קוטור, בודווה והמפרצים. נראה כמו קרואטיה לפני עשור, במחירים נמוכים יותר ועם פחות עומס. מתאים למשפחות עם ילדים גדולים יותר שמוכנים לנסיעות קצרות ברכב.

**איפה התקציב באמת נשבר**
לא בטיסה ולא במלון — אלה הוצאות שסגרתם מראש וידעתם עליהן. התקציב נשבר בשבוע עצמו: ארוחות, מוניות, כניסות לאתרים, קפה פה ושם. במטבע זר, כשכולם משלמים לסירוגין, קשה מאוד להחזיק את התמונה בראש.

זה בדיוק מה שטיולון פותר. כל הוצאה נרשמת במטבע שבו שילמתם ומומרת אוטומטית לפי שער חי, כך שאתם רואים כל הזמן כמה באמת הוצאתם — לא כמה נשאר בארנק. אפשר לצלם קבלה והאפליקציה תמלא את הסכום, המטבע והתאריך לבד.

וכשנוסעים כמה משפחות יחד, החלק הכי לא נעים הוא ההתחשבנות בסוף. טיולון עושה אותה לבד: מי שילם על מה, ומה מספר ההעברות המינימלי שיסגור את החשבון. בלי טבלאות אקסל ובלי שיחות מביכות בטרמינל בחזרה.

**לפני שסוגרים**
תשוו מחירי מלונות מוקדם ככל האפשר — בחגים ההיצע נגמר לפני שהמחירים מתייצבים.

[חיפוש טיסות ב-Kiwi.com](https://kiwi.tpk.ro/XWfXfxVu?sub_id=blog-tishrei)

[חיפוש מלונות ב-Agoda](https://www.agoda.com/search?cid=1966379&utm_source=tulon&utm_medium=blog&utm_campaign=tishrei-family)

חג שמח, ותיסעו בזול.`,
      en: `The autumn holidays are approaching, and with them the long family break of the year. It is also the stretch when flight and hotel prices spike, because everyone is searching for the very same weeks.

Most families do not solve this by skipping the trip — they solve it by shortening the flight. A destination two or three hours away saves money and also saves the first day, which otherwise disappears into travel time and tired kids.

**Greece — pick the island that fits your kids' ages**
Rhodes and Crete are big enough for a full week without moving around much, with shallow beaches that suit small children. The smaller islands are prettier but need ferries, which is less appealing with suitcases and a stroller.

**Cyprus — the shortest flight there is**
Under an hour in the air. This is the easiest destination to start with if it is your first time flying with small children, and it works as a long weekend rather than a full week.

**Batumi and Tbilisi — the most value per shekel**
Georgia remains one of the best-value destinations in the region: excellent food at low prices, lots of green, and you can combine sea and mountains in one trip. The flight is a little longer than Greece but still short.

**Bulgaria — nature without the price tag**
Sofia and the mountains around it, or the Black Sea coast. A good fit for families who like hiking and are not looking for nightlife or shopping.

**Montenegro — the beautiful one that has not filled up yet**
Kotor, Budva and the bays. It looks like Croatia did a decade ago, at lower prices and with less crowding. Best for families with older kids who do not mind short drives.

**Where the budget actually breaks**
Not on flights and not on hotels — those you booked in advance and knew about. The budget breaks during the week itself: meals, taxis, entrance tickets, coffee here and there. In a foreign currency, with everyone paying in turn, holding that picture in your head is close to impossible.

This is exactly what Tulon solves. Every expense is recorded in the currency you actually paid in and converted automatically at a live rate, so you always see what you have really spent — not what is left in your wallet. Photograph a receipt and the app fills in the amount, currency and date by itself.

And when several families travel together, the least pleasant part is settling up at the end. Tulon does it for you: who paid for what, and the minimum number of transfers that closes the account. No spreadsheets, no awkward conversations in the terminal on the way home.

**Before you book**
Compare hotel prices as early as you can — over the holidays availability runs out before prices settle.

[Search flights on Kiwi.com](https://kiwi.tpk.ro/XWfXfxVu?sub_id=blog-tishrei)

[Search hotels on Agoda](https://www.agoda.com/search?cid=1966379&utm_source=tulon&utm_medium=blog&utm_campaign=tishrei-family)

Happy holidays, and travel cheap.`,
      es: `Se acercan las fiestas de otoño y, con ellas, las vacaciones familiares largas del año. Es también la temporada en que los precios de vuelos y hoteles se disparan, porque todo el mundo busca exactamente las mismas semanas.

La mayoría de las familias no lo resuelve renunciando al viaje, sino acortando el vuelo. Un destino a dos o tres horas ahorra dinero y también salva el primer día, que si no se pierde entre el traslado y los niños cansados.

**Grecia — elige la isla según la edad de los niños**
Rodas y Creta son lo bastante grandes para una semana entera sin moverse mucho, con playas poco profundas cómodas para los más pequeños. Las islas menores son más bonitas pero exigen ferris, algo menos atractivo con maletas y carrito.

**Chipre — el vuelo más corto que hay**
Menos de una hora en el aire. Es el destino más fácil para empezar si es vuestra primera vez volando con niños pequeños, y funciona como fin de semana largo en lugar de una semana completa.

**Batumi y Tiflis — la mejor relación calidad-precio**
Georgia sigue siendo uno de los destinos más rentables de la zona: comida excelente a precios bajos, mucho verde, y se pueden combinar mar y montaña en un mismo viaje. El vuelo es algo más largo que a Grecia, pero sigue siendo corto.

**Bulgaria — naturaleza sin pagarla cara**
Sofía y las montañas de alrededor, o la costa del mar Negro. Encaja bien con familias a las que les gusta el senderismo y no buscan vida nocturna ni compras.

**Montenegro — el bonito que aún no se ha llenado**
Kotor, Budva y las bahías. Se parece a la Croacia de hace una década, con precios más bajos y menos aglomeraciones. Mejor para familias con niños algo mayores que no se quejen de trayectos cortos en coche.

**Dónde se rompe de verdad el presupuesto**
No en los vuelos ni en el hotel — eso ya lo reservasteis y lo teníais contado. El presupuesto se rompe durante la semana: comidas, taxis, entradas, un café aquí y allá. En moneda extranjera, y pagando cada uno por turnos, mantener esa foto en la cabeza es casi imposible.

Esto es justo lo que resuelve Tulon. Cada gasto se registra en la moneda en que pagasteis y se convierte automáticamente con tipo de cambio en vivo, así siempre veis lo que habéis gastado de verdad — no lo que queda en la cartera. Fotografiad un recibo y la app rellena sola el importe, la moneda y la fecha.

Y cuando viajan varias familias juntas, la parte más incómoda es cuadrar cuentas al final. Tulon lo hace por vosotros: quién pagó qué, y el número mínimo de transferencias que salda la cuenta. Sin hojas de cálculo y sin conversaciones incómodas en la terminal de vuelta.

**Antes de reservar**
Comparad precios de hotel cuanto antes — en fiestas la disponibilidad se agota antes de que los precios se estabilicen.

[Buscar vuelos en Kiwi.com](https://kiwi.tpk.ro/XWfXfxVu?sub_id=blog-tishrei)

[Buscar hoteles en Agoda](https://www.agoda.com/search?cid=1966379&utm_source=tulon&utm_medium=blog&utm_campaign=tishrei-family)

Felices fiestas, y viajad barato.`,
    },
  },
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
      he: `אחרי כמעט שלושה שבועות בתאילנד וכל המידע שקיבלנו מהקהילה לפני הנסיעה — הגיע הזמן להחזיר. אנחנו זוג דתי, קצת מעל גיל 50, בפעם הראשונה בתאילנד, וחגגנו שם 30 שנות נישואין. ארגנתי הכל לבד, מהטיסות ועד הסיור האחרון — וכמעט הכל עבר דרך מקום אחד: אפליקציית טיולון.

**התקציב — הוגדר מראש, נוצל ב-90%**
לפני הטיול הגדרתי בטיולון תקציב כולל, ומאותו רגע כל הוצאה נרשמה במקום — ברוב המקרים בכלל לא הקלדתי כלום: מצלמים את הקבלה, האפליקציה מזהה סכום, מטבע ותאריך ומתייקת לקטגוריה הנכונה לבד. בסוף הטיול ידעתי בדיוק כמה יצא על מה, וסיימנו על 90% מהתקציב בלי לחסוך יותר מדי. גם יומן הטיול המלא — טיסות, מלונות וסיורים יום-אחרי-יום — ישב שם, אז בכל בוקר ידענו בדיוק מה מחכה לנו.

**טיסות**
אל על ישיר, מחלקת פרימיום — היו הרבה נקודות נוסע מתמיד, ובגילנו זו הדרך היחידה לשרוד 11 שעות טיסה. זו הייתה ההוצאה הגדולה בטיול. טיסות פנים עם תאי איירווייז ובנגקוק איירווייז — מדויקות, תהליכים מהירים, מטוסים סבירים.

**ההסעות משדה התעופה — בזכות תזכורת**
ביום הטיסה קפצה לי בטיולון תזכורת שכדאי לסדר הסעה מהשדה — ובאמת שכחתי. לחצתי על הקישור, הזמנתי דרך GetTransfer, ונהג עם שלט חיכה לנו בנחיתה. בגיל שלנו, אחרי 11 שעות טיסה, זה שווה זהב.

**סים לטלפון — ברגע האחרון**
יום לפני הטיסה נזכרתי שאין לנו אינטרנט לתאילנד. פתחתי את טיולון, לחצתי על ה-eSIM של Airalo, ותוך חמש דקות היה לנו סים דיגיטלי מותקן — בלי לחפש דוכנים בשדה ובלי להחליף כרטיסים.

**מלונות — עם דגש על שבת וכשרות**
את כל המלונות סגרתי דרך אגודה — ישירות מתוך מסך התכנון של טיולון, ככה שההזמנות והתאריכים נכנסו ליומן הטיול בלי הקלדה כפולה:
- **בנגקוק — Chilax Resort:** מלון חמוד וקרוב לבית חב"ד, חשוב לנו בגלל הארוחות.
- **צ'אנג מאי — The Empress Premier:** מפנק מאוד, וצוות שמכיר את נושא השבת ברמה שפנו אלינו מיוזמתם והסבירו שבשבת הם דואגים למעלית ולפתיחת הדלת.
- **קוסמוי — Synergy Resort:** על קו החוף, שתי בריכות, דקה מבית חב"ד ומוקף מסעדות כשרות. שידרגו לנו וילה בהגעה — אפס תלונות.
- **בנגקוק לסיום:** המלון הצמוד ל-MBK (את השם, כנראה, לא אזכור לעולם).

**סיורים**
את הסיורים הגדולים סגרתי מהארץ דרך סיאם טורס: דוי אינתנון, צ'אנג ראי, 42 האיים בסירה איטית, חוות הצלה לפילים וסדנת בישול כשרה. את הסיורים המקומיים הספונטניים סגרתי דרך GetYourGuide מתוך מסך "גלה" של טיולון — מהיום למחר, עם הדרכה באנגלית: ארמון המלך וכמה מקדשים. אפשר להסתובב לבד, אבל הידע שמקבלים מהמדריך שווה כל בהאט (וזה ממש זול).

**טיפ חשוב על 42 האיים:** כדי לחוות הכל באמת — תגיעו בכושר. טיפוס רציני של 500 מטר לנקודת תצפית מטורפת, חתירה בקייאק, ועוד טיפוס ללגונה הירוקה. הנופים שווים כל טיפת זיעה.

**הרגע המיוחד**
לכבוד 30 שנות הנישואין לקחנו בקוסמוי צלמת זוגיות — רעות הלר, מקסימה — וקיבלנו מזכרת מדהימה מהטיול.

**התניידות**
בעיקר Bolt, מדי פעם טוק-טוק (בעיקר בצ'אנג מאי), וכשאפשר — ברגל.

**ולסיום**
קוסמוי הרגישה לפעמים כמו אילת: עברית ברחוב, מסעדות כשרות בכל פינה, ואפילו רכב עם רמקול שמזמין למסיבות בשירים בעברית. אומרים שתאילנד התייקרה — אין לי השוואה לעבר, אבל ליהנות שם אפשר גם בתקציב שפוי. ולאכול כשר כל יום? במקומות אחרים בעולם זה תיק כלכלי כבד. לא כאן.

ואם לסכם במשפט אחד: היומן, ההזמנות, ההוצאות והקבלות — הכל היה במקום אחד. ככה נראה טיול רגוע.`,
      en: `After almost three weeks in Thailand — and all the advice we received from the community before the trip — it's time to give back. We're a religious couple, just over 50, first time in Thailand, celebrating our 30th wedding anniversary. I organized everything myself, from flights to the very last tour — and almost all of it ran through one place: the Tulon app.

**The budget — set in advance, 90% used**
Before the trip I set a total budget in Tulon, and from that moment every expense was logged on the spot — most of the time I didn't even type anything: snap the receipt, and the app reads the amount, currency and date and files it in the right category by itself. By the end I knew exactly what went where, and we finished at 90% of budget without over-scrimping. The full trip itinerary — flights, hotels and tours day by day — lived there too, so every morning we knew exactly what was ahead.

**Flights**
Direct El Al, premium class — we had plenty of frequent-flyer points, and at our age that's the only way to survive an 11-hour flight. It was the biggest expense of the trip. Domestic flights with Thai Airways and Bangkok Airways — punctual, fast processes, decent planes.

**Airport transfers — thanks to a reminder**
On flight day, Tulon popped a reminder to arrange a transfer from the airport — and I had genuinely forgotten. One tap, booked through GetTransfer, and a driver with a name sign was waiting when we landed. At our age, after an 11-hour flight, that's worth gold.

**A SIM for the phone — at the last minute**
The day before the flight I realized we had no data plan for Thailand. Opened Tulon, tapped the Airalo eSIM, and within five minutes we had a digital SIM installed — no hunting for kiosks at the airport, no swapping cards.

**Hotels — with Shabbat and kosher in mind**
I booked all the hotels through Agoda — straight from Tulon's planning screen, so the bookings and dates flowed into the trip calendar without double entry:
- **Bangkok — Chilax Resort:** charming and close to the Chabad House, which mattered for meals.
- **Chiang Mai — The Empress Premier:** very pampering, with staff who understand Shabbat so well they approached us proactively to explain they'd handle the elevator and door for us.
- **Koh Samui — Synergy Resort:** beachfront, two pools, a minute from Chabad and surrounded by kosher restaurants. They upgraded our villa on arrival — zero complaints.
- **Bangkok to finish:** the hotel attached to MBK (whose name I will apparently never remember).

**Tours**
The big tours I booked from home through a local agency: Doi Inthanon, Chiang Rai, the 42 islands by slow boat, an elephant rescue farm and a kosher cooking workshop. The spontaneous local tours I booked through GetYourGuide right from Tulon's Discover screen — a day ahead, with English-speaking guides: the Grand Palace and several temples. You can wander alone, but the knowledge a guide adds is worth every baht (and it's genuinely cheap).

**Important tip about the 42 islands:** to experience it fully — arrive fit. A serious 500-meter climb to an insane viewpoint, kayaking, then another climb to the green lagoon. The views are worth every drop of sweat.

**The special moment**
For our 30th anniversary we hired a couples photographer in Koh Samui and got an amazing keepsake from the trip.

**Getting around**
Mostly Bolt, occasionally tuk-tuks (mainly in Chiang Mai), and on foot whenever possible.

**In closing**
Koh Samui sometimes felt like a resort town back home: Hebrew in the streets, kosher restaurants on every corner. They say Thailand got expensive — I can't compare to the past, but you can absolutely enjoy it on a sane budget. And eating kosher every day? Elsewhere in the world that's a serious financial burden. Not here.

If I had to sum it up in one sentence: the itinerary, the bookings, the expenses and the receipts — all in one place. That's what a calm trip looks like.`,
      es: `Después de casi tres semanas en Tailandia — y todos los consejos que recibimos de la comunidad antes del viaje — es hora de devolver el favor. Somos una pareja religiosa, poco más de 50 años, primera vez en Tailandia, celebrando nuestro 30º aniversario de boda. Lo organicé todo yo mismo, desde los vuelos hasta el último tour — y casi todo pasó por un solo lugar: la app Tulon.

**El presupuesto — definido de antemano, 90% utilizado**
Antes del viaje definí un presupuesto total en Tulon, y desde ese momento cada gasto quedó registrado al instante — la mayoría de las veces ni siquiera escribí nada: fotografías el recibo y la app detecta el importe, la moneda y la fecha, y lo archiva sola en la categoría correcta. Al final sabía exactamente en qué se fue cada parte, y terminamos en el 90% del presupuesto sin privarnos demasiado. El itinerario completo — vuelos, hoteles y tours día a día — también vivía allí, así que cada mañana sabíamos exactamente qué nos esperaba.

**Vuelos**
El Al directo, clase premium — teníamos muchos puntos de viajero frecuente, y a nuestra edad es la única forma de sobrevivir 11 horas de vuelo. Fue el mayor gasto del viaje. Vuelos internos con Thai Airways y Bangkok Airways — puntuales, procesos rápidos, aviones decentes.

**Traslados del aeropuerto — gracias a un recordatorio**
El día del vuelo, Tulon me mostró un recordatorio para organizar el traslado desde el aeropuerto — y realmente lo había olvidado. Un toque, reservado por GetTransfer, y un conductor con cartel nos esperaba al aterrizar. A nuestra edad, después de 11 horas de vuelo, eso vale oro.

**SIM para el teléfono — a último momento**
El día antes del vuelo me di cuenta de que no teníamos datos para Tailandia. Abrí Tulon, toqué el eSIM de Airalo, y en cinco minutos teníamos una SIM digital instalada — sin buscar quioscos en el aeropuerto ni cambiar tarjetas.

**Hoteles — pensando en Shabat y comida kosher**
Reservé todos los hoteles por Agoda — directamente desde la pantalla de planificación de Tulon, así que las reservas y fechas entraron al calendario del viaje sin doble registro:
- **Bangkok — Chilax Resort:** encantador y cerca de la Casa Jabad, importante para las comidas.
- **Chiang Mai — The Empress Premier:** muy acogedor, con personal que entiende tan bien el Shabat que se acercaron proactivamente para explicarnos cómo nos ayudarían con el ascensor y la puerta.
- **Koh Samui — Synergy Resort:** frente a la playa, dos piscinas, a un minuto de Jabad y rodeado de restaurantes kosher. Nos mejoraron la villa al llegar — cero quejas.
- **Bangkok para terminar:** el hotel pegado al MBK (cuyo nombre aparentemente nunca recordaré).

**Tours**
Los grandes los reservé desde casa con una agencia: Doi Inthanon, Chiang Rai, las 42 islas en barco lento, una granja de rescate de elefantes y un taller de cocina kosher. Los tours locales espontáneos los reservé por GetYourGuide directamente desde la pantalla Descubre de Tulon — de un día para otro, con guías en inglés: el Gran Palacio y varios templos. Se puede pasear solo, pero el conocimiento del guía vale cada baht (y es realmente barato).

**Consejo importante sobre las 42 islas:** para vivirlo todo — llega en forma. Una subida seria de 500 metros a un mirador increíble, kayak, y otra subida a la laguna verde. Las vistas valen cada gota de sudor.

**El momento especial**
Por nuestro 30º aniversario contratamos una fotógrafa de parejas en Koh Samui y nos llevamos un recuerdo increíble del viaje.

**Cómo moverse**
Principalmente Bolt, de vez en cuando tuk-tuks (sobre todo en Chiang Mai), y a pie siempre que fuera posible.

**Para terminar**
Koh Samui a veces se sentía como una ciudad turística de casa: hebreo en las calles, restaurantes kosher en cada esquina. Dicen que Tailandia se encareció — no puedo comparar con el pasado, pero se puede disfrutar con un presupuesto sensato. ¿Y comer kosher todos los días? En otras partes del mundo es una carga económica seria. Aquí no.

Si tuviera que resumirlo en una frase: el itinerario, las reservas, los gastos y los recibos — todo en un solo lugar. Así se ve un viaje tranquilo.`,
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
