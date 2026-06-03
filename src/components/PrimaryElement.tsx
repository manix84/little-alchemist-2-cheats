import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

type PrimaryElementProps = {
  children?: ReactNode;
  compactLogoSrc: string;
  logoSrc: string;
};

export const PrimaryElement = ({
  children,
  compactLogoSrc,
  logoSrc,
}: PrimaryElementProps) => (
  <FixedPrimaryElement>
    <PrimaryElementContainer>
      <LogoLink to={"/"} aria-label={"Back to element search"}>
        <PrimaryLogo src={logoSrc} alt={""} />
        <CompactPrimaryLogo src={compactLogoSrc} alt={""} />
      </LogoLink>
      <PrimaryRightGroup>
        <PrimaryElementTools>
          {children && (
            <PrimaryElementControls>{children}</PrimaryElementControls>
          )}
        </PrimaryElementTools>
      </PrimaryRightGroup>
    </PrimaryElementContainer>
  </FixedPrimaryElement>
);

const PrimaryElementContainer = styled.nav`
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  max-width: 980px;
  min-height: 68px;
  padding: 8px 16px;

  @media (max-width: 640px) {
    gap: 10px;
    padding: 8px 12px;
  }
`;

const PrimaryRightGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;

  @media (max-width: 640px) {
    gap: 8px;
    justify-content: space-between;
    width: 100%;
  }
`;

const FixedPrimaryElement = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 6;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  width: 100%;
  border-bottom: 1px solid rgba(26, 30, 38, 0.14);
  background: rgba(255, 255, 255, 0.82);
  color: #1d2430;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(14px) saturate(1.18);

  @media (prefers-color-scheme: dark) {
    border-bottom-color: rgba(255, 255, 255, 0.16);
    background: rgba(18, 22, 30, 0.86);
    color: #f4f7fb;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.44);
  }

  @media (max-width: 640px) {
    min-width: 320px;
  }
`;

const LogoLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
`;

const PrimaryLogo = styled.img`
  width: 120px;
  height: auto;
  pointer-events: none;
  filter: drop-shadow(rgba(0, 0, 0, 0.42) 3px 4px 4px);

  @media (prefers-color-scheme: dark) {
    filter: drop-shadow(rgba(0, 0, 0, 0.68) 3px 4px 5px);
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const CompactPrimaryLogo = styled(PrimaryLogo)`
  display: none;
  width: 42px;
  border-radius: 10px;

  @media (max-width: 640px) {
    display: block;
  }
`;

const PrimaryElementTools = styled.div`
  flex: 0 1 360px;
  width: min(360px, 100%);
  min-width: 0;

  @media (max-width: 640px) {
    flex: 1 1 auto;
  }
`;

const PrimaryElementControls = styled.div`
  width: min(360px, 100%);
  min-width: 0;

  @media (max-width: 640px) {
    width: 100%;
  }
`;
