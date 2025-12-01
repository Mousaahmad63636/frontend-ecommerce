// src/contexts/UIContext.js
import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export const useUI = () => {
  return useContext(UIContext);
};

export const UIProvider = ({ children }) => {
  const [isSideCartOpen, setIsSideCartOpen] = useState(false);

  const value = {
    isSideCartOpen,
    setIsSideCartOpen
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
};