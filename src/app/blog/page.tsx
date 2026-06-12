"use client";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts } from "@/lib/blog-posts";

const T = {
  heroTitle: {
    he: "בלוג הטיולים של טיולון",
    en: "The Tulon Travel Blog",
    es: "El Blog de Viajes de Tulon",
  },
  heroSub: {
    he: "טיפים, מסלולים ומדריכים לטיולים מושלמים",
    en: "Tips, itineraries and guides for the perfect trip",
    es: "Consejos, itinerarios y guías para el viaje perfecto",
  },
  readMore: { he: "קרא עוד", en: "Read more", es: "Leer más" },
  min:  { he: "דק׳ קריאה", en: "min read", es: "min de lectura" },
} as const;

function formatDate(dateStr: string, lang: "he"|"en"|"es") {
  const d = new Date(dateStr);
  const locales = { he: "he-IL", en: "en-US", es: "es-ES" };
  return d.toLocaleDateString(locales[lang], { year:"numeric", month:"long", day:"numeric" });
}

export default function BlogPage() {
  const { lang } = useLang();
  const isHe = lang === "he";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
        .blog-card {
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 18px; padding: 24px 22px;
          text-decoration: none; color: inherit;
          display: block; transition: all 0.18s;
        }
        .blog-card:hover {
          background: rgba(100,223,223,0.05);
          border-color: rgba(100,223,223,0.2);
          transform: translateY(-1px);
        }
        .blog-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }
        @media (max-width: 560px) { .blog-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div style={{fontFamily:"'Rubik',sans-serif",background:"#0d2137",color:"#fff",minHeight:"100vh"}} dir={isHe?"rtl":"ltr"}>
        <SiteNav />

        {/* Hero */}
        <div style={{
          background:"linear-gradient(160deg,#091928 0%,#0d2137 60%,#0a3050 100%)",
          padding:"56px 24px 48px",textAlign:"center",
        }}>
          <div style={{maxWidth:520,margin:"0 auto"}}>
            <div style={{fontSize:30,fontWeight:900,color:"#fff",lineHeight:1.25,marginBottom:12,letterSpacing:-0.5}}>
              {T.heroTitle[lang]}
            </div>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.4)",lineHeight:1.6}}>
              {T.heroSub[lang]}
            </div>
          </div>
        </div>

        {/* Posts grid */}
        <div style={{maxWidth:720,margin:"0 auto",padding:"48px 20px 60px"}}>
          <div className="blog-grid">
            {blogPosts.map(post => (
              <a key={post.slug} className="blog-card" href={`/blog/${post.slug}`}>
                {/* Emoji + category */}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                  <span style={{fontSize:26}}>{post.emoji}</span>
                  <span style={{
                    fontSize:11,fontWeight:700,
                    color:"rgba(100,223,223,0.75)",
                    background:"rgba(100,223,223,0.08)",
                    border:"0.5px solid rgba(100,223,223,0.2)",
                    borderRadius:999,padding:"3px 10px",
                  }}>
                    {post.category[lang]}
                  </span>
                </div>

                {/* Title */}
                <div style={{
                  fontSize:16,fontWeight:800,color:"#fff",
                  lineHeight:1.4,marginBottom:10,
                }}>
                  {post.title[lang]}
                </div>

                {/* Excerpt */}
                <div style={{
                  fontSize:13,color:"rgba(255,255,255,0.42)",
                  lineHeight:1.65,marginBottom:16,
                }}>
                  {post.excerpt[lang]}
                </div>

                {/* Meta */}
                <div style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  fontSize:12,color:"rgba(255,255,255,0.25)",
                }}>
                  <span>{formatDate(post.date, lang)}</span>
                  <span style={{color:"rgba(100,223,223,0.6)",fontWeight:600}}>
                    {post.readMin} {T.min[lang]} ↗
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        <SiteFooter />
      </div>
    </>
  );
}
