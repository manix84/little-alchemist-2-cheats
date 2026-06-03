import { mdiCheckboxBlankCircleOutline, mdiCheckboxMarkedCircleOutline } from "@mdi/js";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { Fragment, useMemo, useState } from "react";
import styled, { css } from "styled-components";
import "./App.css";
import useData from "./lib/Data";
import { useInstallPrompt } from "./useInstallPrompt";

const DISCOVERED_COMBINATIONS_KEY = "la2-discovered-combinations";

const getStoredDiscoveredCombinations = () => {
  try {
    const value = window.localStorage.getItem(DISCOVERED_COMBINATIONS_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
};

const createCombinationKey = (producesID: string, elementIDs: string[]) => `${producesID}:${elementIDs.join("+")}`;

const sortByDiscoveredState = <Row extends { combinationKey: string }>(rows: Row[], discoveredCombinationSet: Set<string>) =>
  [...rows].sort((firstRow, secondRow) => {
    const firstIsDiscovered = discoveredCombinationSet.has(firstRow.combinationKey);
    const secondIsDiscovered = discoveredCombinationSet.has(secondRow.combinationKey);
    return Number(firstIsDiscovered) - Number(secondIsDiscovered);
  });

export const App = () => {
  const { isLoading, getName, getImage, getOptions, getCombinations, getMakesCombinations } = useData();
  const { canInstall, dismissInstallPrompt, installApp } = useInstallPrompt();

  const [selectedID, setSelectedID] = useState<string>();
  const [discoveredCombinations, setDiscoveredCombinations] = useState<string[]>(getStoredDiscoveredCombinations);
  const [isClearDiscoveredOpen, setIsClearDiscoveredOpen] = useState(false);

  const options = getOptions();
  const selectedOption = options.find((option) => option.id === selectedID) ?? null;
  const selectedCombinations = useMemo(() => (selectedID ? getCombinations(selectedID) : undefined), [getCombinations, selectedID]);
  const selectedMakes = useMemo(() => (selectedID ? getMakesCombinations(selectedID) : undefined), [getMakesCombinations, selectedID]);
  const discoveredCombinationSet = useMemo(() => new Set(discoveredCombinations), [discoveredCombinations]);
  const discoveredCount = discoveredCombinations.length;
  const selectedCombinationRows = useMemo(() => {
    if (!selectedID || !selectedCombinations) return [];

    return sortByDiscoveredState(
      selectedCombinations.map((combination) => ({
        combination,
        combinationKey: createCombinationKey(selectedID, combination),
      })),
      discoveredCombinationSet
    );
  }, [discoveredCombinationSet, selectedCombinations, selectedID]);
  const selectedMakesRows = useMemo(() => {
    if (!selectedID || !selectedMakes) return [];

    return sortByDiscoveredState(
      Object.entries(selectedMakes).flatMap(([producesID, elementIDs]) =>
        elementIDs.map((elementID) => {
          const combination = [selectedID, elementID];
          return {
            combination,
            combinationKey: createCombinationKey(producesID, combination),
            elementID,
            producesID,
          };
        })
      ),
      discoveredCombinationSet
    );
  }, [discoveredCombinationSet, selectedID, selectedMakes]);

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );

  const navigateToElement = (elementID: string) => {
    setSelectedID(elementID);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const setCombinationDiscovered = (combinationKey: string, isDiscovered: boolean) => {
    setDiscoveredCombinations((currentCombinations) => {
      const nextCombinations = new Set(currentCombinations);
      if (isDiscovered) {
        nextCombinations.add(combinationKey);
      } else {
        nextCombinations.delete(combinationKey);
      }

      const nextValue = Array.from(nextCombinations).sort();
      window.localStorage.setItem(DISCOVERED_COMBINATIONS_KEY, JSON.stringify(nextValue));
      return nextValue;
    });
  };

  const clearDiscoveredCombinations = () => {
    window.localStorage.removeItem(DISCOVERED_COMBINATIONS_KEY);
    setDiscoveredCombinations([]);
    setIsClearDiscoveredOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageContainer>
        <Header>
          <img
            src={`${import.meta.env.BASE_URL}brand/la2-logo.svg`}
            style={{ filter: "drop-shadow(rgba(0, 0, 0, 0.5) 5px 5px 3px)" }}
            className={"logo"}
            alt={"Little Alchemy 2 - Cheats"}
          />
        </Header>
        <Main>
          <Autocomplete
            disablePortal
            loading={isLoading}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            options={options}
            sx={{ width: 300 }}
            value={selectedOption}
            renderOption={(props, option) => (
              <Box component={"li"} sx={{ "& > img": { mr: 2, flexShrink: 0 } }} {...props}>
                <AutoCompleteIcon loading={"lazy"} src={option.image} alt={""} />
                {option.label}
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label={"Elements"} />}
            onChange={(_event, option) => {
              setSelectedID(option?.id);
            }}
          />
          {!selectedID && discoveredCount > 0 && (
            <ClearDiscoveredButton type={"button"} onClick={() => setIsClearDiscoveredOpen(true)}>
              Clear discovered combinations
            </ClearDiscoveredButton>
          )}
          {selectedID && (
            <>
              <StickyPrimaryElement>
                <PrimaryElementContainer>
                  <PrimaryElementImg src={getImage(selectedID)} alt={getName(selectedID)} />
                  <PrimaryElementName>{getName(selectedID)}</PrimaryElementName>
                </PrimaryElementContainer>
              </StickyPrimaryElement>
              {selectedCombinations && (
                <>
                  <h2>Combinations ({Object.values(selectedCombinations).length})</h2>
                  {selectedCombinationRows.map(({ combination, combinationKey }) => {
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
                          {combination.map((elementID: string, index: number) => (
                            <Fragment key={`${combinationKey}:${elementID}:${index}`}>
                              {index > 0 && <ElementSymbol>+</ElementSymbol>}
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
              )}
              {selectedMakes && (
                <>
                  <h2>
                    Makes ({Object.values(selectedMakes).reduce((currentCount, row) => currentCount + row.length, 0)})
                  </h2>
                  {selectedMakesRows.map(({ combinationKey, elementID, producesID }) => {
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
                          <ElementButton type={"button"} onClick={() => navigateToElement(selectedID)}>
                            <ElementImg src={getImage(selectedID)} />
                            <ElementName>{getName(selectedID)}</ElementName>
                          </ElementButton>
                          <ElementSymbol>+</ElementSymbol>
                          <ElementButton type={"button"} onClick={() => navigateToElement(elementID)}>
                            <ElementImg src={getImage(elementID)} />
                            <ElementName>{getName(elementID)}</ElementName>
                          </ElementButton>
                          <ElementSymbol>=</ElementSymbol>
                          <ElementButton type={"button"} onClick={() => navigateToElement(producesID)}>
                            <ElementImg src={getImage(producesID)} />
                            <ElementName>{getName(producesID)}</ElementName>
                          </ElementButton>
                        </CombinationContainer>
                      </CombinationRow>
                    );
                  })}
                </>
              )}
            </>
          )}
        </Main>
        {canInstall && (
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
        )}
        {isClearDiscoveredOpen && (
          <ModalBackdrop role={"presentation"}>
            <ConfirmationDialog role={"dialog"} aria-modal={"true"} aria-labelledby={"clear-discovered-title"}>
              <ConfirmationTitle id={"clear-discovered-title"}>Clear discovered combinations?</ConfirmationTitle>
              <ConfirmationText>This will remove all locally saved discovered checkmarks.</ConfirmationText>
              <ConfirmationActions>
                <CancelButton type={"button"} onClick={() => setIsClearDiscoveredOpen(false)}>
                  Cancel
                </CancelButton>
                <DangerButton type={"button"} onClick={clearDiscoveredCombinations}>
                  Clear all
                </DangerButton>
              </ConfirmationActions>
            </ConfirmationDialog>
          </ModalBackdrop>
        )}
      </PageContainer>
    </ThemeProvider>
  );
};
export default App;

const PageContainer = styled.div`
  padding-top: 10vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2vh;
  font-size: calc(10px + 2vmin);
`;

const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const AutoCompleteIcon = styled.img`
  width: 20px;
  filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0.5));
`;

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

const ElementContainer = styled.div`
  ${elementTileStyles}
`;

const ElementButton = styled.button`
  ${elementTileStyles}
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;
`;

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

const ElementSymbol = styled(ElementContainer)`
  font-size: 2.5em;
  width: 50px;
  background-color: transparent;
`;

const ElementImg = styled.img`
  width: 50px;
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
`;
const PrimaryElementImg = styled(ElementImg)`
  width: 150px;
`;

const ElementName = styled.div`
  font-size: 0.5em;
  text-transform: capitalize;
  text-align: center;
  font-weight: 700;
`;
const PrimaryElementName = styled(ElementName)`
  font-size: 0.9em;
`;

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

const ClearDiscoveredButton = styled.button`
  margin-top: 8px;
  border: 0;
  background: transparent;
  color: rgba(127, 127, 127, 0.9);
  font: inherit;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
`;

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
