export async function enterExamFullscreen() {
  if (
    !document.fullscreenEnabled ||
    !document.documentElement.requestFullscreen
  ) {
    throw new Error(
      "This browser cannot start a fullscreen exam. Open the app in a desktop browser with fullscreen support.",
    );
  }
  try {
    if (!document.fullscreenElement)
      await document.documentElement.requestFullscreen();
    if (!document.fullscreenElement)
      throw new Error("Fullscreen was not entered.");
  } catch {
    throw new Error(
      "Fullscreen could not start. Allow fullscreen in your browser, then press Start again. No attempt has been created.",
    );
  }
}

export function leaveExamFullscreen() {
  if (document.fullscreenElement)
    void document.exitFullscreen().catch(() => {});
}

// Browser signals can detect leaving the exam. They cannot lock the OS or
// guarantee proctoring against developer tools or another device.
export function watchExamIntegrity(violation: (reason: string) => void) {
  const fullscreen = () => {
    if (!document.fullscreenElement) violation("Fullscreen was exited.");
  };
  const visibility = () => {
    if (document.hidden)
      violation("The exam tab was hidden or another tab was selected.");
  };
  const blur = () => violation("The exam window lost focus.");
  const navigate = () => violation("The exam page was left or reloaded.");
  document.addEventListener("fullscreenchange", fullscreen);
  document.addEventListener("visibilitychange", visibility);
  window.addEventListener("blur", blur);
  window.addEventListener("pagehide", navigate);
  window.addEventListener("popstate", navigate);
  const poll = window.setInterval(() => {
    fullscreen();
    visibility();
    if (!document.hasFocus()) blur();
  }, 500);
  fullscreen();
  visibility();
  return () => {
    window.clearInterval(poll);
    document.removeEventListener("fullscreenchange", fullscreen);
    document.removeEventListener("visibilitychange", visibility);
    window.removeEventListener("blur", blur);
    window.removeEventListener("pagehide", navigate);
    window.removeEventListener("popstate", navigate);
  };
}
