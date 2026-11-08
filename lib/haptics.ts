/**
 * Web Vibration API tactile haptic feedback utility
 * Safe no-op fallback when unsupported or disabled.
 */
export function triggerHaptic(
  type: "light" | "medium" | "heavy" | "selection" | "error" = "light"
): void {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  ) {
    try {
      if (type === "light" || type === "selection") {
        navigator.vibrate(12);
      } else if (type === "medium") {
        navigator.vibrate(24);
      } else if (type === "heavy") {
        navigator.vibrate(45);
      } else if (type === "error") {
        navigator.vibrate([35, 60, 35]);
      }
    } catch {
      // Ignore vibration permissions or platform errors
    }
  }
}
