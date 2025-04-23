import { createContext, useState } from "react";

export const dataContext = createContext();
export const apiContext = createContext();
export const popupContext = createContext();

export const DataProvider = ({ children }) => {
  const [userLoaded, setUserLoaded] = useState(false);
  const [data, setData] = useState(false);
  const [cmMode, setCmMode] = useState(true);
  const [pfxStateLog, setPfxStateLog] = useState(false);
  const [pfxStateLogTitles, setPfxStateLogTitles] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("pfx");
  const [resultsData, setResultsData] = useState(null); // For results CSV/Excel

  let setMode = () => {
    setCmMode(!cmMode);
  };

  return (
    <dataContext.Provider
      value={{
        data,
        setData,
        pfxStateLog,
        pfxStateLogTitles,
        setPfxStateLogTitles,
        setPfxStateLog,
        userLoaded,
        setUserLoaded,
        setMode,
        cmMode,
        selectedMethod,
        setSelectedMethod,
        resultsData,
        setResultsData,
      }}
    >
      {children}
    </dataContext.Provider>
  );
};