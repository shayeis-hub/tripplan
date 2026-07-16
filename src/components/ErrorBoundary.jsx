"use client";
import { Component } from "react";

const RF = "'Rubik',sans-serif";

// Catches render-time exceptions anywhere below it (e.g. a screen dereferencing
// data that hasn't loaded yet while offline) and shows a recoverable screen
// instead of Next.js's blank "Application error" page.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Caught by ErrorBoundary:", error, info);
    this.setState({ info });
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
        {this.state.error && (
          <details style={{ marginTop: 10, maxWidth: 340, textAlign: "left", direction: "ltr" }}>
            <summary style={{ cursor: "pointer", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Details</summary>
            <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", whiteSpace: "pre-wrap", marginTop: 6, maxHeight: 160, overflowY: "auto" }}>
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </div>
          </details>
        )}
      </div>
    );
  }
}
