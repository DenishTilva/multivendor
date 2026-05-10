import { createContext, createElement, useContext, useMemo, useState } from "react";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const value = useMemo(() => {
    const login = (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
    };

    const logout = () => {
      localStorage.clear();
      setUser(null);
    };

    return { user, login, logout };
  }, [user]);

  return createElement(AuthContext.Provider, { value }, children);
};

export default AuthProvider;
