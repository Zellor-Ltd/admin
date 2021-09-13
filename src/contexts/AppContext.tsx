import React, { useState } from "react";

type FilterValue = {
  [key: string]: string;
};

interface AppContextProps {
  filterValues: FilterValue;
  setFilterValues: React.Dispatch<React.SetStateAction<FilterValue>>;
}

export const AppContext = React.createContext({} as AppContextProps);

export const AppProvider = ({ children }: { children: JSX.Element }) => {
  const [filterValues, setFilterValues] = useState<FilterValue>({});

  return (
    <AppContext.Provider
      value={{
        filterValues,
        setFilterValues,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
