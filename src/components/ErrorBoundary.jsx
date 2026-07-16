"use client";
import { Component } from "react";

const RF = "'Rubik',sans-serif";

// Catches render-time exceptions anywhere below it (e.g. a screen dereferencing
// data that hasn't loaded yet while offline) and shows a recoverable screen
// instead of Next.js's blank "Application error" page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error("Caught by ErrorBoundary:", error);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{
        minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16, background: "#0d2137", color: "#fff",
        fontFamily: RF, padding: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: 40 }}>😕</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>משהו השתבש</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", maxWidth: 320, lineHeight: 1.6 }}>
          קרתה תקלה בטעינת המסך — ייתכן שזה קשור לחיבור לאינטרנט. נסה לרענן.
        </div>
        <button onClick={() => window.location.reload()} style={{
          marginTop: 8, padding: "12px 28px", borderRadius: 12, border: "none",
          background: "#64dfdf", color: "#0d2137", fontFamily: RF, fontWeight: 800,
          fontSize: 14, cursor: "pointer",
        }}>
          🔄 רענן
        </button>
      </div>
    );
  }
}
