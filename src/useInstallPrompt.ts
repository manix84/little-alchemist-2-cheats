import { useEffect, useMemo, useState } from "react";

type UserChoice = Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: UserChoice;
};

const INSTALL_PROMPT_DISMISSED_KEY = "la2-install-prompt-dismissed";

const isStandalone = () =>
  Boolean(window.matchMedia?.("(display-mode: standalone)").matches) ||
  Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

export const useInstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>();
  const [isDismissed, setIsDismissed] = useState(() => window.localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "true");
  const [isInstalled, setIsInstalled] = useState(() => isStandalone());

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      if (isDismissed || isInstalled) return;

      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallEvent(undefined);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isDismissed, isInstalled]);

  return useMemo(
    () => ({
      canInstall: Boolean(installEvent) && !isDismissed && !isInstalled,
      dismissInstallPrompt: () => {
        window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
        setIsDismissed(true);
        setInstallEvent(undefined);
      },
      installApp: async () => {
        if (!installEvent) return;

        await installEvent.prompt();
        const choice = await installEvent.userChoice;
        setInstallEvent(undefined);

        if (choice.outcome === "dismissed") {
          window.localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "true");
          setIsDismissed(true);
        }
      },
    }),
    [installEvent, isDismissed, isInstalled]
  );
};
