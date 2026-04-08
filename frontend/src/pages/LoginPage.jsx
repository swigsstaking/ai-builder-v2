import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, LogIn } from 'lucide-react';
import useAuthStore from '../stores/authStore';

const BG = '#0f0f1a';
const CARD = '#1e1e35';
const BORDER = 'rgba(255,255,255,0.07)';
const GRADIENT = 'linear-gradient(135deg, #7c3aed, #3b82f6)';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { loginWithHub } = useAuthStore();

  const handleLogin = () => {
    setLoading(true);
    loginWithHub();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: BG }}>
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full opacity-20 blur-[100px]" style={{ background: '#7c3aed' }} />
      <div className="absolute bottom-1/3 right-1/3 w-56 h-56 rounded-full opacity-15 blur-[100px]" style={{ background: '#3b82f6' }} />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors z-10">
        <ArrowLeft size={14} /> Accueil
      </Link>

      <div className="relative w-full max-w-sm mx-4">
        <div className="rounded-2xl p-8" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: GRADIENT }}>
              <Sparkles size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">AI Builder</h1>
            <p className="text-gray-400 text-sm mt-1">Connectez-vous à votre espace</p>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3 text-white font-semibold rounded-lg transition-all hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: GRADIENT }}
          >
            <LogIn size={18} />
            {loading ? 'Redirection...' : 'Se connecter avec SWIGS'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
