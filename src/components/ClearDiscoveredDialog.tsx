import styled from "styled-components";

type ClearDiscoveredDialogProps = {
  clearDiscoveredCombinations: () => void;
  closeDialog: () => void;
};

export const ClearDiscoveredDialog = ({ clearDiscoveredCombinations, closeDialog }: ClearDiscoveredDialogProps) => (
  <ModalBackdrop role={"presentation"}>
    <ConfirmationDialog role={"dialog"} aria-modal={"true"} aria-labelledby={"clear-discovered-title"}>
      <ConfirmationTitle id={"clear-discovered-title"}>Clear discovered combinations?</ConfirmationTitle>
      <ConfirmationText>This will remove all locally saved discovered checkmarks.</ConfirmationText>
      <ConfirmationActions>
        <CancelButton type={"button"} onClick={closeDialog}>
          Cancel
        </CancelButton>
        <DangerButton type={"button"} onClick={clearDiscoveredCombinations}>
          Clear all
        </DangerButton>
      </ConfirmationActions>
    </ConfirmationDialog>
  </ModalBackdrop>
);

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.52);
`;

const ConfirmationDialog = styled.div`
  width: min(420px, 100%);
  padding: 20px;
  border-radius: 8px;
  background: Canvas;
  color: CanvasText;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
`;

const ConfirmationTitle = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const ConfirmationText = styled.p`
  margin: 12px 0 20px;
  font-size: 15px;
`;

const ConfirmationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const CancelButton = styled.button`
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(127, 127, 127, 0.4);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

const DangerButton = styled.button`
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 6px;
  background: #c62828;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
`;
