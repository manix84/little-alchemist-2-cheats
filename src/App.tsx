import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import React, { useCallback, useMemo, useState } from "react";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import "./App.css";
import { ClearDiscoveredDialog } from "./components/ClearDiscoveredDialog";
import { CombinationSection } from "./components/CombinationSection";
import { ElementSearch } from "./components/ElementSearch";
import { InstallPromptBanner } from "./components/InstallPromptBanner";
import { PrimaryElement } from "./components/PrimaryElement";
import useData from "./lib/Data";
import {
  CombinationRowData,
  createCombinationKey,
  DISCOVERED_COMBINATIONS_KEY,
  formatCombinationCount,
  getDiscoveredCombinationCount,
  getStoredDiscoveredCombinations,
  sortByDiscoveredState,
} from "./lib/discoveredCombinations";
import { useInstallPrompt } from "./useInstallPrompt";

const getElementPath = (elementSlug: string) => `/elements/${encodeURIComponent(elementSlug)}`;
const INCLUDE_DLC_CONTENT_KEY = "la2-include-dlc-content";

const getStoredIncludeDlcContent = () => {
  try {
    return window.localStorage.getItem(INCLUDE_DLC_CONTENT_KEY) === "true";
  } catch {
    return false;
  }
};

export const App = () => {
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Routes>
          <Route path={"/"} element={<RecipeFinder />} />
          <Route path={"/elements/:elementSlug"} element={<RecipeFinder />} />
          <Route
            path={"/500"}
            element={
              <PageContainer>
                <ErrorPage statusCode={500} title={"Something went wrong"} message={"The recipe finder hit an unexpected problem."} />
              </PageContainer>
            }
          />
          <Route
            path={"*"}
            element={
              <PageContainer>
                <ErrorPage statusCode={404} title={"Page not found"} message={"That page does not exist in this recipe guide."} />
              </PageContainer>
            }
          />
        </Routes>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

const RecipeFinder = () => {
  const { isLoading, getName, getSlug, getIDBySlug, getImage, getIsDlc, getOptions, getCombinations, getMakesCombinations } = useData();
  const { canInstall, dismissInstallPrompt, installApp } = useInstallPrompt();
  const navigate = useNavigate();
  const { elementSlug } = useParams();

  const selectedSlug = elementSlug ? decodeURIComponent(elementSlug) : undefined;
  const selectedID = selectedSlug ? getIDBySlug(selectedSlug) : undefined;
  const [discoveredCombinations, setDiscoveredCombinations] = useState<string[]>(getStoredDiscoveredCombinations);
  const [includeDlcContent, setIncludeDlcContent] = useState(getStoredIncludeDlcContent);
  const [isClearDiscoveredOpen, setIsClearDiscoveredOpen] = useState(false);

  const combinationHasDlc = useCallback(
    (combination: string[]) => !includeDlcContent && combination.some((id) => getIsDlc(id)),
    [getIsDlc, includeDlcContent]
  );
  const selectedCombinations = useMemo(
    () => (selectedID ? getCombinations(selectedID)?.filter((combination) => !combinationHasDlc(combination)) : undefined),
    [combinationHasDlc, getCombinations, selectedID]
  );
  const selectedMakes = useMemo(() => {
    if (!selectedID) return undefined;

    return Object.entries(getMakesCombinations(selectedID)).reduce<{ [key: string]: string[][] }>((output, [producesID, combinations]) => {
      if (!includeDlcContent && getIsDlc(producesID)) {
        return output;
      }

      const visibleCombinations = combinations.filter((combination) => !combinationHasDlc(combination));
      if (visibleCombinations.length > 0) {
        output[producesID] = visibleCombinations;
      }

      return output;
    }, {});
  }, [combinationHasDlc, getIsDlc, getMakesCombinations, includeDlcContent, selectedID]);
  const discoveredCombinationSet = useMemo(() => new Set(discoveredCombinations), [discoveredCombinations]);
  const options = useMemo(
    () =>
      getOptions()
        .filter((option) => includeDlcContent || !getIsDlc(option.id))
        .map((option) => {
          const combinations = getCombinations(option.id)?.filter((combination) => !combinationHasDlc(combination));
          const totalCombinationCount = combinations?.length ?? 0;
          const optionDiscoveredCount = getDiscoveredCombinationCount(option.id, combinations, discoveredCombinationSet);

          return {
            ...option,
            label: `${option.label} (${formatCombinationCount(optionDiscoveredCount, totalCombinationCount)})`,
          };
        }),
    [combinationHasDlc, discoveredCombinationSet, getCombinations, getIsDlc, getOptions, includeDlcContent]
  );
  const selectedOption = options.find((option) => option.id === selectedID) ?? null;
  const selectedElementMissing = Boolean(selectedSlug && !isLoading && !selectedOption);
  const discoveredCount = discoveredCombinations.length;
  const selectedCombinationRows = useMemo<CombinationRowData[]>(() => {
    if (!selectedID || !selectedCombinations) return [];

    return sortByDiscoveredState(
      selectedCombinations.map((combination) => ({
        combinationKey: createCombinationKey(selectedID, combination),
        items: combination.map((elementID, index) => ({
          elementID,
          symbolBefore: index > 0 ? ("+" as const) : undefined,
        })),
      })),
      discoveredCombinationSet
    );
  }, [discoveredCombinationSet, selectedCombinations, selectedID]);
  const selectedMakesRows = useMemo<CombinationRowData[]>(() => {
    if (!selectedID || !selectedMakes) return [];

    return sortByDiscoveredState(
      Object.entries(selectedMakes).flatMap(([producesID, combinations]) =>
        combinations.map((combination) => {
          const otherElementID = combination.find((elementID) => elementID !== selectedID) ?? selectedID;

          return {
            combinationKey: createCombinationKey(producesID, combination),
            items: [
              { elementID: selectedID },
              { elementID: otherElementID, symbolBefore: "+" as const },
              { elementID: producesID, symbolBefore: "=" as const },
            ],
          };
        })
      ),
      discoveredCombinationSet
    );
  }, [discoveredCombinationSet, selectedID, selectedMakes]);

  const selectElement = (nextElementID: string | undefined) => {
    const nextSlug = nextElementID ? getSlug(nextElementID) : undefined;
    navigate(nextSlug ? getElementPath(nextSlug) : "/");
  };

  const setDlcContentIncluded = (isIncluded: boolean) => {
    setIncludeDlcContent(isIncluded);
    try {
      window.localStorage.setItem(INCLUDE_DLC_CONTENT_KEY, String(isIncluded));
    } catch {
      // Keep the in-memory preference active even when browser storage is unavailable.
    }
  };

  const navigateToElement = (elementID: string) => {
    const slug = getSlug(elementID);
    if (!slug) return;

    navigate(getElementPath(slug));
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
      try {
        window.localStorage.setItem(DISCOVERED_COMBINATIONS_KEY, JSON.stringify(nextValue));
      } catch {
        // Keep the UI responsive even when browser storage is unavailable.
      }
      return nextValue;
    });
  };

  const clearDiscoveredCombinations = () => {
    try {
      window.localStorage.removeItem(DISCOVERED_COMBINATIONS_KEY);
    } catch {
      // Clearing the in-memory state still gives the user the expected UI result.
    }
    setDiscoveredCombinations([]);
    setIsClearDiscoveredOpen(false);
  };

  return (
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
        <SearchControls>
          <ElementSearch isLoading={isLoading} options={options} selectedOption={selectedOption} onSelect={selectElement} />
          {!selectedSlug && (
            <DlcToggleLabel>
              <DlcToggleCheckbox
                type={"checkbox"}
                checked={includeDlcContent}
                onChange={(event) => setDlcContentIncluded(event.target.checked)}
              />
              Include Myths and Monsters
            </DlcToggleLabel>
          )}
        </SearchControls>
        {selectedElementMissing ? (
          <ErrorPage statusCode={404} title={"Element not found"} message={"That element is not in the current recipe data."} />
        ) : (
          <>
            {!selectedID && discoveredCount > 0 && (
              <ClearDiscoveredButton type={"button"} onClick={() => setIsClearDiscoveredOpen(true)}>
                Clear discovered combinations
              </ClearDiscoveredButton>
            )}
            {selectedID && (
              <>
                <PrimaryElement elementID={selectedID} getImage={getImage} getName={getName} />
                {selectedCombinations && (
                  <CombinationSection
                    title={"Combinations"}
                    rows={selectedCombinationRows}
                    discoveredCombinationSet={discoveredCombinationSet}
                    getImage={getImage}
                    getName={getName}
                    navigateToElement={navigateToElement}
                    setCombinationDiscovered={setCombinationDiscovered}
                  />
                )}
                {selectedMakes && (
                  <CombinationSection
                    title={"Makes"}
                    rows={selectedMakesRows}
                    discoveredCombinationSet={discoveredCombinationSet}
                    getImage={getImage}
                    getName={getName}
                    navigateToElement={navigateToElement}
                    setCombinationDiscovered={setCombinationDiscovered}
                  />
                )}
              </>
            )}
          </>
        )}
      </Main>
      {canInstall && <InstallPromptBanner dismissInstallPrompt={dismissInstallPrompt} installApp={installApp} />}
      {isClearDiscoveredOpen && (
        <ClearDiscoveredDialog clearDiscoveredCombinations={clearDiscoveredCombinations} closeDialog={() => setIsClearDiscoveredOpen(false)} />
      )}
    </PageContainer>
  );
};

export default App;

type ErrorPageProps = {
  message: string;
  statusCode: 404 | 500;
  title: string;
};

const ErrorPage = ({ message, statusCode, title }: ErrorPageProps) => (
  <ErrorContent>
    <ErrorCode>{statusCode}</ErrorCode>
    <ErrorTitle>{title}</ErrorTitle>
    <ErrorMessage>{message}</ErrorMessage>
    <HomeLink to={"/"}>Back to search</HomeLink>
  </ErrorContent>
);

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <PageContainer>
          <ErrorPage statusCode={500} title={"Something went wrong"} message={"The recipe finder hit an unexpected problem."} />
        </PageContainer>
      );
    }

    return this.props.children;
  }
}

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

const SearchControls = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const DlcToggleLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(127, 127, 127, 0.95);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

const DlcToggleCheckbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #2e7d32;
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

const ErrorContent = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: min(560px, calc(100vw - 32px));
  text-align: center;
`;

const ErrorCode = styled.div`
  color: #ff9f1c;
  font-size: 72px;
  font-weight: 900;
  line-height: 1;
`;

const ErrorTitle = styled.h1`
  margin: 0;
  font-size: 32px;
`;

const ErrorMessage = styled.p`
  margin: 0;
  color: rgba(127, 127, 127, 0.95);
  font-size: 18px;
`;

const HomeLink = styled(Link)`
  margin-top: 10px;
  color: inherit;
  font-size: 16px;
  font-weight: 700;
`;
