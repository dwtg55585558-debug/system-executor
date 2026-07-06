const KEY = "system-executor-state";

export async function loadState() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load state", e);
    return null;
  }
}

export async function saveState(state) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error("Failed to save state", e);
    return false;
  }
}

export function clearState() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (e) {
    console.error("Failed to clear state", e);
  }
}
