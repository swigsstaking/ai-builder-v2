import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Mail } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';

const BG = '#0f0f1a';
const CARD = '#1e1e35';
const BORDER = 'rgba(255,255,255,0.07)';
const INPUT_BG = '#151525';
const GRADIENT = 'linear-gradient(135deg, #7c3aed, #3b82f6)';

export default function LoginPage() {
  const [tab, setTab] = useState('password'); // 'password' | 'magic'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const { login, googleLogin, requestMagicLink } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'magic') {
        await requestMagicLink(email);
        setMagicSent(true);
        toast.success('Lien de connexion envoyé !');
      } else {
        await login(email, password);
        navigate('/dashboard');
        toast.success('Connexion réussie');
      }
    } catch (err) {
      const msg = err?.error || 'Identifiants incorrects';
      if (err?.code === 'NO_PASSWORD') {
        toast.error('Ce compte utilise le Magic Link. Utilisez l\'onglet Magic Link.');
        setTab('magic');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setLoading(true);
    try {
      await googleLogin(response.credential);
      navigate('/dashboard');
      toast.success('Connexion réussie');
    } catch {
      toast.error('Erreur de connexion Google');
    } finally {
      setLoading(false);
    }
  };

  const tabClass = (t) =>
    `flex-1 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
      tab === t ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
    }`;

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

          {/* Google Sign-In */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Erreur Google Sign-In')}
              theme="filled_black"
              shape="pill"
              size="large"
              width="320"
              text="signin_with"
              locale="fr"
            />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: INPUT_BG }}>
            <button type="button" className={tabClass('magic')} onClick={() => { setTab('magic'); setMagicSent(false); }}>
              Magic Link
            </button>
            <button type="button" className={tabClass('password')} onClick={() => setTab('password')}>
              Email + Mot de passe
            </button>
          </div>

          {magicSent && tab === 'magic' ? (
            <div className="text-center py-4">
              <Mail size={32} className="mx-auto mb-3 text-purple-400" />
              <p className="text-white font-medium">Email envoyé !</p>
              <p className="text-gray-400 text-sm mt-1">Vérifiez votre boîte mail et cliquez sur le lien de connexion.</p>
              <button
                type="button"
                onClick={() => setMagicSent(false)}
                className="text-purple-400 text-sm mt-4 hover:text-purple-300 transition-colors"
              >
                Renvoyer le lien
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required
                  className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                  style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }} />
              </div>

              {tab === 'password' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required
                    className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                    style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }} />
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 mt-2 text-white font-semibold rounded-lg transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: GRADIENT }}>
                {loading ? 'Connexion...' : tab === 'magic' ? 'Envoyer le lien' : 'Se connecter'}
              </button>
            </form>
          )}

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
