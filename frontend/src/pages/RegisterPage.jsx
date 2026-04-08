import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import useAuthStore from '../stores/authStore';

const BG = '#0f0f1a';
const CARD = '#1e1e35';
const BORDER = 'rgba(255,255,255,0.07)';
const INPUT_BG = '#151525';
const GRADIENT = 'linear-gradient(135deg, #7c3aed, #3b82f6)';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    setLoading(true);
    try {
      const result = await register(email, name, password);
      if (result.loggedIn) {
        navigate('/dashboard');
        toast.success('Compte créé avec succès');
      } else {
        toast.success(result.message || 'Vérifiez votre email');
      }
    } catch (err) {
      const msg = err?.error || err?.message || 'Erreur lors de la création du compte';
      if (msg.includes('already exists') || msg.includes('duplicate') || msg.includes('E11000')) {
        toast.error('Cet email est déjà utilisé');
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
      toast.success('Compte créé avec succès');
    } catch {
      toast.error('Erreur de connexion Google');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-xl font-bold text-white">Créer un compte</h1>
            <p className="text-gray-400 text-sm mt-1">Commencez à créer vos sites en quelques minutes</p>
          </div>

          {/* Google Sign-Up */}
          <div className="flex justify-center mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Erreur Google Sign-In')}
              theme="filled_black"
              shape="pill"
              size="large"
              width="320"
              text="signup_with"
              locale="fr"
            />
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-gray-500 uppercase tracking-wider">ou</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nom</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                placeholder="Votre nom"
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required
                placeholder="votre@email.com"
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required
                placeholder="8 caractères minimum"
                className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/40 transition-shadow"
                style={{ background: INPUT_BG, border: `1px solid rgba(255,255,255,0.1)` }} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 mt-2 text-white font-semibold rounded-lg transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: GRADIENT }}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
