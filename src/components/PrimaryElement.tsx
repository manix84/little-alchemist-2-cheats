import styled from "styled-components";
import { ElementContainer, ElementImg, ElementName } from "./ElementTile";

type PrimaryElementProps = {
  elementID: string;
  getImage: (elementID: string) => string;
  getName: (elementID: string) => string | undefined;
};

export const PrimaryElement = ({ elementID, getImage, getName }: PrimaryElementProps) => (
  <StickyPrimaryElement>
    <PrimaryElementContainer>
      <PrimaryElementImg src={getImage(elementID)} alt={getName(elementID) ?? ""} />
      <PrimaryElementName>{getName(elementID)}</PrimaryElementName>
    </PrimaryElementContainer>
  </StickyPrimaryElement>
);

const PrimaryElementContainer = styled(ElementContainer)`
  height: 200px;
  width: 200px;
`;

const StickyPrimaryElement = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 8px 0;
  background: color-mix(in srgb, Canvas 96%, transparent);
  color: CanvasText;
`;

const PrimaryElementImg = styled(ElementImg)`
  width: 150px;
`;

const PrimaryElementName = styled(ElementName)`
  font-size: 0.9em;
`;
