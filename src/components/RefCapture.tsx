"use client";
import { useEffect } from "react";

const KEY = "tulon_ref";
const TTL_DAYS = 90;

export default function RefCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref && /^[A-Za-z0-9_-]{2,32}$/.test(ref)) {
        localStorage.setItem(KEY, JSON.stringify({ code: ref, ts: Date.now() }));
        return;
      }
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const { ts } = JSON.parse(raw);
        if (Date.now() - ts > TTL_DAYS * 24 * 60 * 60 * 1000) {
          localStorage.removeItem(KEY);
        }
      }
    } catch {}
  }, []);
  return null;
}
