import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline } from "@mdi/js";
import SvgIcon from "@mui/material/SvgIcon";
import { Fragment } from "react";
import styled from "styled-components";
import { CombinationRowData, formatCombinationCount } from "../lib/discoveredCombinations";
import { ElementButton, ElementImg, ElementName, ElementSymbol } from "./ElementTile";

type CombinationSectionProps = {
  title: string;
  rows: CombinationRowData[];
  discoveredCombinationSet: Set<string>;
  getImage: (elementID: string) => string;
  getName: (elementID: string) => string | undefined;
  navigateToElement: (elementID: string) => void;
  setCombinationDiscovered: (combinationKey: string, isDiscovered: boolean) => void;
};

export const CombinationSection = ({
  title,
  rows,
  discoveredCombinationSet,
  getImage,
  getName,
  navigateToElement,
  setCombinationDiscovered,
}: CombinationSectionProps) => {
  const discoveredCount = rows.filter(({ combinationKey }) => discoveredCombinationSet.has(combinationKey)).length;

  return (
    <>
      <h2>
        {title} ({formatCombinationCount(discoveredCount, rows.length)})
      </h2>
      {rows.map(({ combinationKey, items }) => {
        const isDiscovered = discoveredCombinationSet.has(combinationKey);

        return (
          <CombinationRow key={combinationKey} $isDiscovered={isDiscovered} data-testid={`combination-row-${combinationKey}`}>
            <DiscoveredCheckboxLabel>
              <DiscoveredCheckbox
                type={"checkbox"}
                checked={isDiscovered}
                onChange={(event) => setCombinationDiscovered(combinationKey, event.target.checked)}
              />
              <DiscoveredCheckboxIcon viewBox={"0 0 24 24"} aria-hidden={"true"} $isDiscovered={isDiscovered}>
                <path d={isDiscovered ? mdiCheckboxMarkedCircleOutline : mdiCheckboxBlankCircleOutline} />
              </DiscoveredCheckboxIcon>
              <DiscoveredCheckboxText>Discovered</DiscoveredCheckboxText>
            </DiscoveredCheckboxLabel>
            <CombinationContainer>
              {items.map(({ elementID, symbolBefore }, index) => (
                <Fragment key={`${combinationKey}:${elementID}:${index}`}>
                  {symbolBefore && <ElementSymbol>{symbolBefore}</ElementSymbol>}
                  <ElementButton type={"button"} onClick={() => navigateToElement(elementID)}>
                    <ElementImg src={getImage(elementID)} />
                    <ElementName>{getName(elementID)}</ElementName>
                  </ElementButton>
                </Fragment>
              ))}
            </CombinationContainer>
          </CombinationRow>
        );
      })}
    </>
  );
};

const CombinationContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
  max-width: 90vw;
`;

const CombinationRow = styled.div<{ $isDiscovered: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  opacity: ${({ $isDiscovered }) => ($isDiscovered ? 0.45 : 1)};
  transition: opacity 160ms ease;
`;

const DiscoveredCheckboxLabel = styled.label`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 0 0 78px;
  gap: 3px;
  color: rgba(127, 127, 127, 0.95);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
`;

const DiscoveredCheckbox = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const DiscoveredCheckboxIcon = styled(SvgIcon)<{ $isDiscovered: boolean }>`
  width: 36px;
  height: 36px;
  color: ${({ $isDiscovered }) => ($isDiscovered ? "#2e7d32" : "rgba(127, 127, 127, 0.9)")};
`;

const DiscoveredCheckboxText = styled.span`
  line-height: 1.1;
`;
