"use client";
import { useEffect } from "react";
import { captureFirstTouch } from "@/lib/acquisitionClient";

// Mounted in every root layout so the very first page a visitor lands on
// (which may be one of the English SEO pages) is the one remembered.
export default function AcquisitionCapture() {
  useEffect(() => {
    captureFirstTouch();
  }, []);
  return null;
}
