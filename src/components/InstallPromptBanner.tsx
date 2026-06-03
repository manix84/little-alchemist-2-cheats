import styled from "styled-components";

type InstallPromptBannerProps = {
  dismissInstallPrompt: () => void;
  installApp: () => void;
};

export const InstallPromptBanner = ({ dismissInstallPrompt, installApp }: InstallPromptBannerProps) => (
  <InstallPrompt role={"status"} aria-live={"polite"}>
    <InstallPromptText>
      <InstallPromptTitle>Install app 🧪</InstallPromptTitle>
      <InstallPromptDescription>Keep the recipe finder one tap away.</InstallPromptDescription>
    </InstallPromptText>
    <InstallPromptActions>
      <InstallPromptButton type={"button"} onClick={installApp}>
        Install
      </InstallPromptButton>
      <DismissInstallPromptButton type={"button"} onClick={dismissInstallPrompt} aria-label={"Dismiss install prompt"}>
        ×
      </DismissInstallPromptButton>
    </InstallPromptActions>
  </InstallPrompt>
);

const InstallPrompt = styled.aside`
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(360px, calc(100vw - 32px));
  padding: 10px 10px 10px 14px;
  border: 1px solid rgba(127, 127, 127, 0.25);
  border-radius: 8px;
  background: rgba(24, 24, 24, 0.94);
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
  font-size: 14px;
`;

const InstallPromptText = styled.div`
  min-width: 0;
`;

const InstallPromptTitle = styled.div`
  font-weight: 700;
  line-height: 1.2;
`;

const InstallPromptDescription = styled.div`
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.25;
`;

const InstallPromptActions = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const InstallPromptButton = styled.button`
  min-height: 34px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: #ffffff;
  color: #111111;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
`;

const DismissInstallPromptButton = styled.button`
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  font: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
`;
