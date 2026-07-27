import { createContext, useContext } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  return (
    <AppContext.Provider value={{ appName: 'Neighborhood Helper' }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }

  return context;
};
