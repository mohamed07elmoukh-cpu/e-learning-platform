import React, { useEffect, useState } from "react";
import { tokenStorage } from "../auth/tokenStorage";

const CATALOG_BASE =
  (import.meta as any).env?.VITE_CATALOG_URL ??
  (import.meta as any).env?.VITE_API_BASE_URL ??
  "http://localhost:8080";

type ActionState = { type: "success" | "error" | null; message: string | null };

async function catalogRequest(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}) {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.auth !== false) {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("Session expirée. Reconnecte-toi.");
    }
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${CATALOG_BASE}${path}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!res.ok) {
    let message = `Erreur HTTP ${res.status}`;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export default function Admin() {
  const [status, setStatus] = useState<ActionState>({ type: null, message: null });
  const [busy, setBusy] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [publishedCourses, setPublishedCourses] = useState<any[]>([]);
  const [courseCreate, setCourseCreate] = useState({ title: "", description: "", level: "", thumbnailUrl: "" });
  const [courseUpdate, setCourseUpdate] = useState({ courseId: "", title: "", description: "", level: "", thumbnailUrl: "" });
  const [courseDeleteId, setCourseDeleteId] = useState("");
  const [coursePublishId, setCoursePublishId] = useState("");
  const [courseUnpublishId, setCourseUnpublishId] = useState("");
  const [moduleCreate, setModuleCreate] = useState({ courseId: "", title: "", orderIndex: "", isPublished: false });
  const [moduleUpdate, setModuleUpdate] = useState({ moduleId: "", title: "", orderIndex: "", isPublished: "" });
  const [moduleDeleteId, setModuleDeleteId] = useState("");
  const [lessonCreate, setLessonCreate] = useState({ moduleId: "", title: "", type: "VIDEO", contentUrl: "", contentText: "", durationMin: "", orderIndex: "", isPublished: false });
  const [lessonUpdate, setLessonUpdate] = useState({ lessonId: "", title: "", type: "", contentUrl: "", contentText: "", durationMin: "", orderIndex: "", isPublished: "" });
  const [lessonDeleteId, setLessonDeleteId] = useState("");

  function setError(message: string) {
    setStatus({ type: "error", message });
  }

  function setSuccess(message: string) {
    setStatus({ type: "success", message });
  }

