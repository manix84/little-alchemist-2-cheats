import QRCode from "qrcode";
import { useEffect, useState } from "react";
import styled from "styled-components";

type ProgressTransferDialogProps = {
  closeDialog: () => void;
  transferUrl: string;
};

export const ProgressTransferDialog = ({ closeDialog, transferUrl }: ProgressTransferDialogProps) => {
  const [qrCodeError, setQrCodeError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    setQrCodeError("");
    setQrCodeUrl("");

    QRCode.toString(transferUrl, {
      errorCorrectionLevel: "L",
      margin: 2,
      type: "svg",
      width: 256,
    }).then((nextQrCodeSvg) => {
      if (isMounted) {
        setQrCodeUrl(`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(nextQrCodeSvg)}`);
      }
    }).catch(() => {
      if (isMounted) {
        setQrCodeError("This progress link is too large for a QR code. Copy the link instead.");
      }
    });

    return () => {
      isMounted = false;
    };
  }, [transferUrl]);

  const copyTransferUrl = async () => {
    await navigator.clipboard?.writeText(transferUrl);
  };

  return (
    <DialogBackdrop role={"presentation"}>
      <DialogCard role={"dialog"} aria-modal={"true"} aria-labelledby={"progress-transfer-title"}>
        <DialogTitle id={"progress-transfer-title"}>Transfer progress</DialogTitle>
        <QrFrame>
          {qrCodeUrl ? (
            <QrImage src={qrCodeUrl} alt={"Progress transfer QR code"} />
          ) : (
            <QrPlaceholder>{qrCodeError || "Generating QR"}</QrPlaceholder>
          )}
        </QrFrame>
        <DialogActions>
          <CopyButton type={"button"} onClick={copyTransferUrl}>
            Copy link
          </CopyButton>
          <CloseButton type={"button"} onClick={closeDialog}>
            Close
          </CloseButton>
        </DialogActions>
      </DialogCard>
    </DialogBackdrop>
  );
};

const DialogBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.5);
`;

const DialogCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: min(340px, 100%);
  padding: 20px;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2933;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 22px;
`;

const QrFrame = styled.div`
  display: grid;
  place-items: center;
  width: 256px;
  max-width: 100%;
  aspect-ratio: 1;
  padding: 8px;
  border-radius: 8px;
  background: #ffffff;
`;

const QrImage = styled.img`
  width: 100%;
  height: 100%;
`;

const QrPlaceholder = styled.div`
  color: #2f2f2f;
  font-size: 14px;
  font-weight: 700;
`;

const DialogActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
`;

const DialogButton = styled.button`
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  font: inherit;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
`;

const CopyButton = styled(DialogButton)`
  background: #1f7a8c;
`;

const CloseButton = styled(DialogButton)`
  background: rgba(127, 127, 127, 0.95);
`;
