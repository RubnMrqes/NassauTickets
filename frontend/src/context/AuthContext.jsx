import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const AUTH_KEY = 'nassauTickets:token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem(AUTH_KEY);
    return token ? { token, usuario: null } : null;
  });
  const [status, setStatus] = useState(session ? 'loading' : 'ready');
  const [warning, setWarning] = useState('');

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setSession(null);
    setStatus('ready');
  }, []);

  const restore = useCallback(async (token) => {
    if (!token) return;
    setStatus('loading');
    try {
      const data = await api('/auth/me', { token });
      if (localStorage.getItem(AUTH_KEY) !== token) return;
      setSession({ token, usuario: data.usuario });
      setStatus('ready');
      setWarning('');
    } catch (error) {
      if (error.status === 401) {
        clearSession();
        return;
      }
      setWarning(error.message);
      setStatus('error');
    }
  }, [clearSession]);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_KEY);
    if (token) restore(token);
  }, [restore]);

  async function login(email, senha) {
    const data = await api('/auth/login', { method: 'POST', body: { email, senha } });
    localStorage.setItem(AUTH_KEY, data.token);
    setSession(data);
    setStatus('ready');
    setWarning('');
    return data;
  }

  async function logout() {
    const token = session?.token;
    clearSession();
    if (!token) return;
    try {
      await api('/auth/logout', { method: 'POST', token });
      setWarning('');
    } catch {
      setWarning('Você saiu deste navegador. O servidor não confirmou o encerramento da sessão.');
    }
  }

  const request = useCallback(async (path, options = {}) => {
    try {
      return await api(path, { ...options, token: session?.token });
    } catch (error) {
      if (error.status === 401) clearSession();
      throw error;
    }
  }, [session?.token, clearSession]);

  return <AuthContext.Provider value={{ session, status, warning, login, logout, request, restore, clearSession }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
