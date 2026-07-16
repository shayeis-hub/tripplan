"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, X, RotateCcw, Check, Image as ImageIcon } from "lucide-react";
import { t } from "@/lib/i18n";
import { useOnlineStatus } from "@/lib/useOnlineStatus";

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
  const isOffline = useOnlineStatus();

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
    <div style={{ position: "fixed", inset: 0, zIndex: 3000, height: "100dvh", background: "#000", overflow: "hidden" }} dir={lang === "he" ? "rtl" : "ltr"}>
      <style>{`@keyframes camfade{from{opacity:0}to{opacity:1}}`}</style>

      {/* Full-screen video / captured preview */}
      {shot ? (
        <img src={shot} alt="receipt" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      ) : (
        <video ref={videoRef} playsInline muted style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      )}

      {/* Receipt frame hint — large, floating over the live video (no dimming = no "gap" look) */}
      {!shot && ready && (
        <div style={{ position: "absolute", top: 132, bottom: 124, left: "6%", right: "6%", border: `2.5px dashed ${TEAL}`, borderRadius: 16, pointerEvents: "none", animation: "camfade 0.3s" }} />
      )}

      {/* Top overlay: close + title + tips */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "12px 16px 20px", background: "linear-gradient(180deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.5) 60%,transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => { stopStream(); onClose(); }}
            style={{ width: 36, height: 36, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <X size={18} color="#fff" />
          </button>
          <div style={{ color: "#fff", fontFamily: RF, fontWeight: 800, fontSize: 17 }}>{t("cam_title", lang)}</div>
          <div style={{ width: 36 }} />
        </div>
        {!shot && isOffline && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, background: "rgba(124,45,18,0.85)", borderRadius: 10, padding: "8px 12px" }}>
            <span style={{ fontSize: 15, flexShrink: 0 }}>📡</span>
            <span style={{ color: "#fff", fontFamily: RF, fontSize: 12.5, fontWeight: 600, lineHeight: 1.35 }}>{t("scan_offline", lang)}</span>
          </div>
        )}
        {!shot && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
            {[t("cam_tip1", lang), t("cam_tip2", lang), t("cam_tip3", lang)].map((tip, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, background: "rgba(100,223,223,0.22)", border: `1px solid ${TEAL}`, color: TEAL, fontFamily: RF, fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <span style={{ color: "#fff", fontFamily: RF, fontSize: 14, fontWeight: 500, lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}>{tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom overlay: controls */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 24px 22px", background: "linear-gradient(0deg,rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.5) 60%,transparent 100%)", display: "flex", alignItems: "center", justifyContent: "center", gap: 36 }}>
        {shot ? (
          <>
            <button onClick={retake}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", color: "#fff", fontFamily: RF, fontSize: 12 }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                <RotateCcw size={22} color="#fff" />
              </div>
              {t("cam_retake", lang)}
            </button>
            <button onClick={useShot}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, border: "none", background: "transparent", cursor: "pointer", color: TEAL, fontFamily: RF, fontSize: 12, fontWeight: 700 }}>
              <div style={{ width: 66, height: 66, borderRadius: "50%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={28} color="#0d2137" strokeWidth={2.5} />
              </div>
              {t("cam_use", lang)}
            </button>
          </>
        ) : (
          <>
            {/* spacer to keep the shutter centered */}
            <div style={{ width: 54, flexShrink: 0 }} />
            <button onClick={capture} disabled={!ready}
              style={{ border: "none", background: "transparent", cursor: ready ? "pointer" : "default", opacity: ready ? 1 : 0.4 }}>
              <div style={{ width: 76, height: 76, borderRadius: "50%", background: "#fff", border: "4px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Camera size={32} color="#0d2137" />
              </div>
            </button>
            <button onClick={() => galleryRef.current?.click()}
              style={{ width: 54, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, border: "none", background: "transparent", cursor: "pointer", color: "#fff", fontFamily: RF, fontSize: 10 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
                <ImageIcon size={20} color="#fff" />
              </div>
              {t("cam_gallery", lang)}
            </button>
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
