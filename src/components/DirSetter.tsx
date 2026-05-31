"use client";
import { useEffect } from "react";
import { useLang } from "@/lib/LangContext";

export default function DirSetter() {
  const { lang } = useLang();
  useEffect(() => {
    document.documentElement.dir  = lang === "he" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
