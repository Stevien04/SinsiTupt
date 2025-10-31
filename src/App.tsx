import { useEffect, useState } from 'react';
import { supabase } from './utils/supabase/client';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import './styles/App.css';
import { isBackendLoginType } from './utils/apiConfig';
import { sendLogoutBeacon } from './utils/logout';

interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    avatar_url: string;
    role?: string;
    login_type?: string;
    codigo?: string;
  };
 token?: string | null;
}
interface BackendSession {
  user: User;
  token?: string | null;
  perfil?: unknown;
}

const toUser = (raw: unknown): User | null => {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const id = typeof candidate.id === 'string' ? candidate.id : '';
  const email = typeof candidate.email === 'string' ? candidate.email : '';

  if (!id && !email) {
    return null;
  }

  const metadataRaw = (candidate.user_metadata ?? {}) as Record<string, unknown>;
  const metadata = {
    name: typeof metadataRaw.name === 'string' && metadataRaw.name.trim().length > 0
      ? metadataRaw.name
      : email,
    avatar_url: typeof metadataRaw.avatar_url === 'string' ? metadataRaw.avatar_url : '',
    role: typeof metadataRaw.role === 'string' ? metadataRaw.role : undefined,
    login_type: typeof metadataRaw.login_type === 'string' ? metadataRaw.login_type : undefined,
    codigo: typeof metadataRaw.codigo === 'string' ? metadataRaw.codigo : undefined
  };

  const token = typeof candidate.token === 'string' ? candidate.token : null;

  return {
    id,
    email,
    token,
    user_metadata: metadata
  };
};


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión activa
    const checkSession = async () => {
     const backendSessionRaw = localStorage.getItem('backend_session');
           if (backendSessionRaw) {
             try {
               const backendSession = JSON.parse(backendSessionRaw) as BackendSession;
               if (backendSession?.user) {
                 const normalized = toUser({ ...backendSession.user, token: backendSession.token ?? backendSession.user.token });
                 if (normalized) {
                   setUser(normalized);
                   setLoading(false);
                   return;
                 }
               }
             } catch (error) {
               localStorage.removeItem('backend_session');
             }
           }
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession) {
        try {
           const adminUser = JSON.parse(adminSession) as unknown;
                    const normalized = toUser(adminUser);
                    if (normalized) {
                      setUser(normalized);
                      setLoading(false);
                      return;
                    }
        } catch (error) {
          localStorage.removeItem('admin_session');
        }
      }

      // Check regular Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const normalizedSupabaseUser = toUser(session?.user as unknown);
           setUser(normalizedSupabaseUser);
      setLoading(false);
    };

    checkSession();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('admin_session');
           localStorage.removeItem('backend_session');
        }
          const normalizedSupabaseUser = toUser(session?.user as unknown);
                setUser(normalizedSupabaseUser);
        setLoading(false);
      }
    );

    // Listen for admin login events
       const handleAdminLogin = (event: Event) => {
         const rawUser = (event as CustomEvent).detail;
         const normalized = toUser(rawUser);
         if (normalized) {
           localStorage.setItem('admin_session', JSON.stringify(normalized));
           setUser(normalized);
         }
       };

       const handleBackendLogin = (event: Event) => {
         const session = (event as CustomEvent<BackendSession>).detail;
         if (session?.user) {
           const normalized = toUser({ ...session.user, token: session.token ?? session.user.token });
           if (normalized) {
             setUser(normalized);
           }
         }
    };

    window.addEventListener('admin-login', handleAdminLogin as EventListener);
    window.addEventListener('backend-login', handleBackendLogin as EventListener);
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('admin-login', handleAdminLogin as EventListener);
            window.removeEventListener('backend-login', handleBackendLogin as EventListener);
    };
  }, []);
useEffect(() => {
    const userId = user?.id;
    const loginType = user?.user_metadata?.login_type;

    if (!userId || !isBackendLoginType(loginType)) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const handleBeforeUnload = () => {
      sendLogoutBeacon(userId);
    };

    const handlePageHide = () => {
      sendLogoutBeacon(userId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [user?.id, user?.user_metadata?.login_type]);


  if (loading) {
    return (
      <div className="app-loading-container">
        <div className="app-loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {user ? (
        <Dashboard user={user} />
      ) : (
        <LoginScreen />
      )}
    </div>
  );
}

export default App;