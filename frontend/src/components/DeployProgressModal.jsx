import { CheckCircle, Loader, Code2, Upload, Server, Lock, Globe, X, ExternalLink, AlertCircle, RotateCcw } from 'lucide-react';

const STEPS = [
  { key: 'building', label: 'Génération du site', icon: Code2 },
  { key: 'uploading', label: 'Transfert des fichiers', icon: Upload },
  { key: 'configuring', label: 'Configuration serveur', icon: Server },
  { key: 'ssl', label: 'Certificat SSL', icon: Lock },
  { key: 'done', label: 'Site en ligne !', icon: Globe },
];

function getStepState(stepKey, currentStep, status) {
  if (status === 'published') return 'done';
  if (status === 'error') return 'error';
  const currentIdx = STEPS.findIndex(s => s.key === currentStep);
  const stepIdx = STEPS.findIndex(s => s.key === stepKey);
  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return 'active';
  return 'pending';
}

function StepRow({ step, state }) {
  const Icon = step.icon;
  return (
    <div className="flex items-center gap-3 py-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
        state === 'done' ? 'bg-green-500/15 text-green-400' :
        state === 'active' ? 'bg-accent/15 text-accent-text ring-2 ring-accent/30' :
        state === 'error' ? 'bg-red-500/15 text-red-500' :
        'text-slate-600'
      }`}
      style={state === 'pending' ? { background: 'rgba(255,255,255,0.05)' } : undefined}>
        {state === 'done' ? <CheckCircle size={16} /> :
         state === 'active' ? <Loader size={16} className="animate-spin" /> :
         state === 'error' ? <AlertCircle size={16} /> :
         <Icon size={16} />}
      </div>
      <span className={`text-sm font-medium transition-colors duration-300 ${
        state === 'done' ? 'text-green-400' :
        state === 'active' ? 'text-white' :
        state === 'error' ? 'text-red-400' :
        'text-slate-500'
      }`}>
        {step.label}
      </span>
    </div>
  );
}

export default function DeployProgressModal({ deployStep, deployProgress, status, buildError, domain, onClose, onRetry }) {
  const isFinished = status === 'published';
  const isError = status === 'error';
  const progress = isFinished ? 100 : (deployProgress || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative rounded-2xl max-w-md w-full overflow-hidden" style={{ background: '#1e1e35', border: '1px solid rgba(255,255,255,0.07)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isFinished ? 'bg-green-500/15' : isError ? 'bg-red-500/15' : 'bg-accent/10'
              }`}>
                {isFinished ? <CheckCircle size={20} className="text-green-400" /> :
                 isError ? <AlertCircle size={20} className="text-red-500" /> :
                 <Loader size={20} className="text-accent animate-spin" />}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {isFinished ? 'Déploiement terminé' : isError ? 'Erreur de déploiement' : 'Déploiement en cours'}
                </h3>
                <p className="text-sm text-slate-400">{domain}</p>
              </div>
            </div>
            {(isFinished || isError) && (
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.05] text-slate-500 hover:text-slate-300 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Steps */}
        <div className="px-6 py-5">
          <div className="space-y-0.5">
            {STEPS.map(step => (
              <StepRow key={step.key} step={step} state={getStepState(step.key, deployStep, status)} />
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">Progression</span>
              <span className="text-xs font-mono text-slate-400">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  isError ? 'bg-red-400' : isFinished ? 'bg-green-500' : 'bg-accent'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Error message */}
          {isError && buildError && (
            <div className="mt-4 rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}>
              <p className="text-xs text-red-400 font-mono break-all">{buildError.substring(0, 200)}</p>
            </div>
          )}
        </div>

        {/* Success info */}
        {isFinished && (
          <div className="px-6 pb-4">
            <a
              href={`https://${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
              style={{ background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)' }}
            >
              <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                <ExternalLink size={14} className="text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-400 truncate">https://{domain}</p>
                <p className="text-xs text-green-500">Ouvrir dans un nouvel onglet</p>
              </div>
            </a>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Le site peut mettre quelques minutes avant d'être accessible sur Internet.
            </p>
          </div>
        )}

        {/* Footer */}
        {(isFinished || isError) && (
          <div className="px-6 py-4 flex items-center justify-end gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
            {isError && onRetry && (
              <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-text hover:bg-accent/10 rounded-lg transition-colors">
                <RotateCcw size={14} />
                Réessayer
              </button>
            )}
            <button onClick={onClose} className="px-5 py-2 rounded-lg font-medium text-sm bg-accent text-primary hover:bg-accent/90 transition-colors">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
