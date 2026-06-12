"use client";
import { useLang } from "@/lib/LangContext";
import SiteNav from "@/components/SiteNav";
import SiteFooter from "@/components/SiteFooter";
import { blogPosts } from "@/lib/blog-posts";
import { useParams } from "next/navigation";

const T = {
  notFound: { he: "מאמר לא נמצא", en: "Post not found", es: "Artículo no encontrado" },
  back:     { he: "← חזרה לבלוג", en: "← Back to blog", es: "← Volver al blog" },
  min:      { he: "דק׳ קריאה",    en: "min read",       es: "min de lectura"    },
  cta: {
    he: "רוצים לתכנן טיול? נסו את טיולון — חינמי לחלוטין",
    en: "Ready to plan a trip? Try Tulon — completely free",
    es: "¿Listo para planificar un viaje? Prueba Tulon — completamente gratis",
  },
  ctaBtn: { he: "פתח את טיולון", en: "Open Tulon", es: "Abrir Tulon" },
} as const;

function formatDate(dateStr: string, lang: "he"|"en"|"es") {
  const d = new Date(dateStr);
  const locales = { he: "he-IL", en: "en-US", es: "es-ES" };
  return d.toLocaleDateString(locales[lang], { year:"numeric", month:"long", day:"numeric" });
}

/** Very simple markdown-to-HTML: bold, headers, paragraphs */
function renderBody(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push(<div key={key++} style={{height:8}}/>);
      continue;
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      const content = trimmed.slice(2,-2);
      elements.push(
        <h3 key={key++} style={{fontSize:16,fontWeight:800,color:"#fff",marginTop:20,marginBottom:6}}>
          {content}
        </h3>
      );
      continue;
    }
    // Inline bold
    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g).map((p,i) => {
      if (p.startsWith("**") && p.endsWith("**")) {
        return <strong key={i} style={{color:"#fff",fontWeight:700}}>{p.slice(2,-2)}</strong>;
      }
      return p;
    });
    elements.push(
      <p key={key++} style={{fontSize:15,color:"rgba(255,255,255,0.6)",lineHeight:1.8,marginBottom:2}}>
        {parts}
      </p>
    );
  }
  return elements;
}

export default function BlogPostPage() {
  const { lang } = useLang();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const isHe = lang === "he";

  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div style={{fontFamily:"'Rubik',sans-serif",background:"#0d2137",color:"#fff",minHeight:"100vh"}} dir={isHe?"rtl":"ltr"}>
        <SiteNav/>
        <div style={{padding:"80px 24px",textAlign:"center",fontSize:20,color:"rgba(255,255,255,0.4)"}}>
          {T.notFound[lang]}
        </div>
        <SiteFooter/>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Rubik', sans-serif; background: #0d2137; }
      `}</style>
      <div style={{fontFamily:"'Rubik',sans-serif",background:"#0d2137",color:"#fff",minHeight:"100vh"}} dir={isHe?"rtl":"ltr"}>
        <SiteNav/>

        <div style={{maxWidth:660,margin:"0 auto",padding:"40px 24px 60px"}}>

          {/* Back */}
          <a href="/blog" style={{
            display:"inline-block",marginBottom:32,
            fontSize:14,color:"rgba(100,223,223,0.7)",
            textDecoration:"none",fontWeight:600,
          }}>
            {T.back[lang]}
          </a>

          {/* Category + emoji */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <span style={{fontSize:32}}>{post.emoji}</span>
            <span style={{
              fontSize:12,fontWeight:700,
              color:"rgba(100,223,223,0.75)",
              background:"rgba(100,223,223,0.08)",
              border:"0.5px solid rgba(100,223,223,0.2)",
              borderRadius:999,padding:"4px 12px",
            }}>
              {post.category[lang]}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize:28,fontWeight:900,color:"#fff",
            lineHeight:1.3,marginBottom:14,letterSpacing:-0.5,
          }}>
            {post.title[lang]}
          </h1>

          {/* Meta */}
          <div style={{
            fontSize:12,color:"rgba(255,255,255,0.25)",
            marginBottom:32,display:"flex",gap:16,flexWrap:"wrap",
          }}>
            <span>{formatDate(post.date, lang)}</span>
            <span>{post.readMin} {T.min[lang]}</span>
          </div>

          {/* Divider */}
          <div style={{height:0.5,background:"rgba(255,255,255,0.08)",marginBottom:32}}/>

          {/* Body */}
          <div>{renderBody(post.body[lang])}</div>

          {/* CTA */}
          <div style={{
            marginTop:52,
            background:"linear-gradient(135deg,rgba(100,223,223,0.1),rgba(100,223,223,0.04))",
            border:"0.5px solid rgba(100,223,223,0.2)",
            borderRadius:18,padding:"28px 24px",textAlign:"center",
          }}>
            <div style={{fontSize:17,fontWeight:700,color:"rgba(255,255,255,0.85)",marginBottom:18,lineHeight:1.5}}>
              {T.cta[lang]}
            </div>
            <a href="/login" style={{
              display:"inline-block",
              background:"#64dfdf",color:"#0d2137",
              fontFamily:"'Rubik',sans-serif",
              fontSize:15,fontWeight:800,
              padding:"12px 30px",borderRadius:999,
              textDecoration:"none",
            }}>
              {T.ctaBtn[lang]} →
            </a>
          </div>

        </div>

        <SiteFooter/>
      </div>
    </>
  );
}
