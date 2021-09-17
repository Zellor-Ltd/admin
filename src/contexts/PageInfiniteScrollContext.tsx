import React, { useState } from "react";

interface PageInfiniteScrollContextProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  eof: boolean;
  setEof: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PageInfiniteScrollContext = React.createContext(
  {} as PageInfiniteScrollContextProps
);

export const PageInfiniteScrollProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [page, setPage] = useState<number>(0);
  const [eof, setEof] = useState<boolean>(false);

  return (
    <PageInfiniteScrollContext.Provider
      value={{
        page,
        setPage,
        eof,
        setEof,
      }}
    >
      {children}
    </PageInfiniteScrollContext.Provider>
  );
};
