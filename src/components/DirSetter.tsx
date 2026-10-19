"use client";
import { useEffect } from "react";
import { useLang } from "@/lib/LangContext";

export default function DirSetter() {
  const { lang } = useLang();
  useEffect(() => {
    // A page that pins its own language (HebrewGate) records it here so the
    // detected language does not turn a Hebrew page left-to-right.
    const pinned = document.documentElement.dataset.langPinned;
    const effective = pinned === "he" || pinned === "en" || pinned === "es" ? pinned : lang;
    document.documentElement.dir  = effective === "he" ? "rtl" : "ltr";
    document.documentElement.lang = effective;
  }, [lang]);
  return null;
}
