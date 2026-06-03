import styled, { css } from "styled-components";

const elementTileStyles = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 120px;
  width: 120px;
  border-radius: 8px;
  background-color: rgba(127, 127, 127, 0.1);
  margin: 12px 0;
`;

export const ElementContainer = styled.div`
  ${elementTileStyles}
`;

export const ElementButton = styled.button`
  ${elementTileStyles}
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

export const ElementSymbol = styled(ElementContainer)`
  font-size: 2.5em;
  width: 50px;
  background-color: transparent;
`;

export const ElementImg = styled.img`
  width: 50px;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
`;

export const ElementName = styled.div`
  font-size: 0.5em;
  text-transform: capitalize;
  text-align: center;
  font-weight: 700;
`;
