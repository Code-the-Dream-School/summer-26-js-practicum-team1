import { createContext } from 'react';
import { useCurrentUser } from '../hooks/admin/useCurrentUser';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { data: user, isLoading, error } = useCurrentUser();

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppContext;
