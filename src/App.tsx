import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "./App.css";
import useData from "./lib/Data";
import { useInstallPrompt } from "./useInstallPrompt";

export const App = () => {
  const { isLoading, getName, getImage, getOptions, getCombinations, getMakesCombinations } = useData();
  const { canInstall, dismissInstallPrompt, installApp } = useInstallPrompt();

  const [selectedID, setSelectedID] = useState<string>();
  const [selectedCombinations, setSelectedCombinations] = useState<string[][]>();
  const [selectedMakes, setSelectedMakes] = useState<{ [key: string]: string[] }>();

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
  useEffect(() => {
    console.log({ selectedID });
    setSelectedCombinations(selectedID ? getCombinations(selectedID) : undefined);
    setSelectedMakes(selectedID ? getMakesCombinations(selectedID) : undefined);
    selectedID && console.log({ makesCombinations: getMakesCombinations(selectedID) });
  }, [selectedID]);

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
            options={getOptions()}
            sx={{ width: 300 }}
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
          {selectedID && (
            <>
              <PrimaryElementContainer>
                <PrimaryElementImg src={getImage(selectedID)} alt={getName(selectedID)} />
                <PrimaryElementName>{getName(selectedID)}</PrimaryElementName>
              </PrimaryElementContainer>
              {selectedCombinations && (
                <>
                  <h2>Combinations ({Object.values(selectedCombinations).length})</h2>
                  {selectedCombinations.map((combination: string[]) => (
                    <CombinationContainer>
                      {combination.map((elementID: string, index: number) => (
                        <>
                          {index > 0 && <ElementSymbol>+</ElementSymbol>}
                          <ElementContainer>
                            <ElementImg src={getImage(elementID)} />
                            <ElementName>{getName(elementID)}</ElementName>
                          </ElementContainer>
                        </>
                      ))}
                    </CombinationContainer>
                  ))}
                </>
              )}
              {selectedMakes && (
                <>
                  <h2>
                    Makes ({Object.values(selectedMakes).reduce((currentCount, row) => currentCount + row.length, 0)})
                  </h2>
                  {Object.entries(selectedMakes).map(([producesID, elementIDs]) =>
                    elementIDs.map((elementID) => (
                      <CombinationContainer>
                        <ElementContainer>
                          <ElementImg src={getImage(selectedID)} />
                          <ElementName>{getName(selectedID)}</ElementName>
                        </ElementContainer>
                        <ElementSymbol>+</ElementSymbol>
                        <ElementContainer>
                          <ElementImg src={getImage(elementID)} />
                          <ElementName>{getName(elementID)}</ElementName>
                        </ElementContainer>
                        <ElementSymbol>=</ElementSymbol>
                        <ElementContainer>
                          <ElementImg src={getImage(producesID)} />
                          <ElementName>{getName(producesID)}</ElementName>
                        </ElementContainer>
                      </CombinationContainer>
                    ))
                  )}
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
`;

const AutoCompleteIcon = styled.img`
  width: 20px;
  filter: drop-shadow(0 0 0 rgba(0, 0, 0, 0.5));
`;

const ElementContainer = styled.div`
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

const PrimaryElementContainer = styled(ElementContainer)`
  height: 200px;
  width: 200px;
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
