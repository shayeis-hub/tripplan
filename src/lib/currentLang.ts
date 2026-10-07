// The language the user is actually using, read where LangProvider reads it:
// the saved `tulon_lang`, else the device language (he / es / en). Reading it
// directly (instead of from React context) avoids saving LangProvider's
// transient first-render default of "he" for someone whose real language is
// English.
export type AppLang = "he" | "en" | "es";

export function currentLang(): AppLang {
  try {
    const saved = localStorage.getItem("tulon_lang");
    if (saved === "he" || saved === "en" || saved === "es") return saved;
  } catch {
    /* fall through to the device language */
  }
  const device = (typeof navigator !== "undefined" ? navigator.language || "" : "").toLowerCase();
  if (device.startsWith("he")) return "he";
  if (device.startsWith("es")) return "es";
  return "en";
}
