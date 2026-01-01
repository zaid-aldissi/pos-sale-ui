const DRAFT_KEY = "pos_ui_sale_draft_v1";
const PARKED_KEY = "pos_ui_sale_parked_v1";
const HISTORY_KEY = "pos_ui_sale_history_v1";
const COUNTER_KEY = "pos_ui_sale_counter_v1";

export function saveDraft<T>(draft: T) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}
export function loadDraft<T>(): T | null {
  const raw = localStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}
export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export function saveParked<T>(parked: T) {
  localStorage.setItem(PARKED_KEY, JSON.stringify(parked));
}
export function loadParked<T>(): T | null {
  const raw = localStorage.getItem(PARKED_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function saveHistory<T>(history: T) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}
export function loadHistory<T>(): T | null {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export function getNextSaleNumber(): number {
  const raw = localStorage.getItem(COUNTER_KEY);
  const current = raw ? Number(raw) : 0;
  const next = Number.isFinite(current) ? current + 1 : 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}
