"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, X, RotateCcw, Check, Image as ImageIcon } from "lucide-react";
import { t } from "@/lib/i18n";

const RF = "'Rubik',sans-serif";
const TEAL = "#64dfdf";

// In-app receipt camera: live preview with a framing guide + capture guidance.
// Falls back to the device's native camera (file input) when getUserMedia is
// unavailable or permission is denied.
export default function ReceiptCamera({ lang, onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileRef = useRef(null);     // native camera fallback (capture)
  const galleryRef = useRef(null);  // pick existing photo (no capture)
  const [shot, setShot] = useState(null); // captured data URL (preview before confirm)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) { triggerNative(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
          setReady(true);
        }
      } catch {
        triggerNative();
      }
    }
    start();
    return () => { cancelled = true; stopStream(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach(tr => tr.stop());
    streamRef.current = null;
  }

  function triggerNative() {
    fileRef.current?.click();
  }

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    setShot(canvas.toDataURL("image/jpeg", 0.92));
    stopStream();
    setReady(false);
  }

  async function retake() {
    setShot(null);
    // restart stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
        setReady(true);
      }
    } catch { triggerNative(); }
  }

  function useShot() {
    if (!shot) return;
    const arr = shot.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bin = atob(arr[1]);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const file = new File([u8], `receipt-${Date.now()}.jpg`, { type: mime });
    onCapture(file);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 3000, background: "#000", display: "flex", flexDirection: "column" }} dir={lang === "he" ? "rtl" : "ltr"}>
      <style>{`@keyframes camfade{from{opacity:0}to{opacity:1}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: "rgba(0,0,0,0.6)" }}>
        <button onClick={() => { stopStream(); onClose(); }}
          style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <X size={18} color="#fff" />
        </button>
        <div style={{ color: "#fff", fontFamily: RF, fontWeight: 700, fontSize: 15 }}>{t("cam_title", lang)}</div>
        <div style={{ width: 36 }} />
      </div>

      {/* Live / preview area */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {shot ? (
          <img src={shot} alt="receipt" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
        ) : (
          <>
            <video ref={videoRef} playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* Framing guide */}
            {ready && (
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", animation: "camfade 0.3s" }}>
                <div style={{
                  position: "absolute", top: "12%", bottom: "20%", left: "12%", right: "12%",
                  border: `2.5px dashed ${TEAL}`, borderRadius: 16,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                }} />
                {/* Tips */}
                <div style={{ position: "absolute", bottom: 24, left: 16, right: 16, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                  {[t("cam_tip1", lang), t("cam_tip2", lang), t("cam_tip3", lang)].map((tip, i) => (
                    <div key={i} style={{ color: "#fff", fontFamily: RF, fontSize: 12, fontWeight: 500, background: "rgba(0,0,0,0.5)", padding: "4px 12px", borderRadius: 999, backdropFilter: "blur(4px)" }}>
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      <div style={{ padding: "18px 24px 28px", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 28 }}>
        {shot ? (
          <>
            <button onClick={retake}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", color: "#fff", fontFamily: RF, fontSize: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)" }}>
                <RotateCcw size={22} color="#fff" />
              </div>
              {t("cam_retake", lang)}
            </button>
            <button onClick={useShot}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", color: TEAL, fontFamily: RF, fontSize: 12, fontWeight: 700 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={28} color="#0d2137" strokeWidth={2.5} />
              </div>
              {t("cam_use", lang)}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => galleryRef.current?.click()}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", color: "#fff", fontFamily: RF, fontSize: 11 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.08)" }}>
                <ImageIcon size={20} color="#fff" />
              </div>
              {t("cam_gallery", lang)}
            </button>
            <button onClick={capture} disabled={!ready}
              style={{ border: "none", background: "transparent", cursor: ready ? "pointer" : "default", opacity: ready ? 1 : 0.4 }}>
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={30} color="#0d2137" />
              </div>
            </button>
            <div style={{ width: 48 }} />
          </>
        )}
      </div>

      {/* Native camera fallback (used when getUserMedia is blocked) */}
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { stopStream(); onCapture(f); } }} />
      {/* Pick an existing photo */}
      <input ref={galleryRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) { stopStream(); onCapture(f); } }} />
    </div>
  );
}
