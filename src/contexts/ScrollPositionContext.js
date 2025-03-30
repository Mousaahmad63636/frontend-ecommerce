// src/contexts/ScrollPositionContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ScrollPositionContext = createContext();

export function ScrollPositionProvider({ children }) {
  const [scrollPositions, setScrollPositions] = useState({});

  // Load saved positions from sessionStorage on initial render
  useEffect(() => {
    const savedPositions = sessionStorage.getItem('scrollPositions');
    if (savedPositions) {
      try {
        setScrollPositions(JSON.parse(savedPositions));
      } catch (error) {
        console.error('Error parsing saved scroll positions:', error);
      }
    }
  }, []);

  // Save positions to sessionStorage whenever they change
  useEffect(() => {
    if (Object.keys(scrollPositions).length) {
      sessionStorage.setItem('scrollPositions', JSON.stringify(scrollPositions));
    }
  }, [scrollPositions]);

  const saveScrollPosition = (key, position) => {
    setScrollPositions(prev => ({
      ...prev,
      [key]: position
    }));
  };

  const getScrollPosition = (key) => {
    return scrollPositions[key];
  };

  const clearScrollPosition = (key) => {
    setScrollPositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[key];
      return newPositions;
    });
  };

  return (
    <ScrollPositionContext.Provider value={{
      saveScrollPosition,
      getScrollPosition,
      clearScrollPosition
    }}>
      {children}
    </ScrollPositionContext.Provider>
  );
}

export function useScrollPosition() {
  return useContext(ScrollPositionContext);
}