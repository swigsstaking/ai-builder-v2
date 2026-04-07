import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useIsAdmin } from '../../stores/authStore';
import { DESIGN_STYLES } from '../../components/DesignStyleSelector';
import MediaPicker from '../../components/MediaPicker';
import useEditorState from './useEditorState';
import EditorTopBar from './EditorTopBar';
import SectionNavigator from './SectionNavigator';
import PropertiesPanel from './PropertiesPanel';

const VIEWPORT_WIDTHS = { desktop: '100%', tablet: '768px', mobile: '375px' };

export default function PageEditorPage() {
  const { siteId, pageId } = useParams();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const editor = useEditorState(siteId, pageId);
  const {
    page, allPages, selectedSection, editingHeader,
    saving, building, dirty, viewport,
    showMediaPicker, section, previewUrl,
    currentSite,
    setViewport, setShowMediaPicker, setDirty,
    updateSectionData, toggleVisibility, moveSection,
    selectSection, selectHeader, handleSave, handleAIRewrite,
    openMediaPicker, confirmLeave, updateSite, postToIframe,
    iframeRef, autoSaveTimer, needsFullReload,
  } = editor;

  // Change design style — updates ONLY the layout template, NOT the colors
  const handleChangeDesignStyle = useCallback(async (styleId) => {
    const preset = DESIGN_STYLES.find(s => s.id === styleId);
    if (!preset) return;
    try {
      await updateSite(siteId, {
        designStyle: styleId,
        design: {
          ...currentSite?.design,
          designStyle: styleId,
          // Keep fonts from template preset (they define the style identity)
          fontHeading: preset.fonts.heading,
          fontBody: preset.fonts.body,
          borderRadius: preset.borderRadius,
          // Colors are NOT changed — they are independent
        },
      });
      toast.success(`Template "${preset.name}" appliqué`);
      needsFullReload.current = true;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      handleSave(true);
    } catch {
      toast.error('Erreur lors du changement de template');
    }
  }, [siteId, currentSite, updateSite, handleSave, autoSaveTimer, needsFullReload]);

  // Change colors — independent from template
  const handleChangeColors = useCallback(async (colors) => {
    try {
      await updateSite(siteId, {
        design: {
          ...currentSite?.design,
          primaryColor: colors.primary,
          secondaryColor: colors.secondary,
          accentColor: colors.accent,
        },
      });
      toast.success('Couleurs appliquées');
      needsFullReload.current = true;
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      handleSave(true);
    } catch {
      toast.error('Erreur lors du changement de couleurs');
    }
  }, [siteId, currentSite, updateSite, handleSave, autoSaveTimer, needsFullReload]);

  if (!page) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f1a]">
        <Loader2 className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f1a]">
      {/* Top Bar */}
      <EditorTopBar
        page={page}
        siteId={siteId}
        viewport={viewport}
        setViewport={setViewport}
        saving={saving}
        building={building}
        dirty={dirty}
        designStyle={currentSite?.designStyle || currentSite?.design?.designStyle || 'modern'}
        leftPanelOpen={leftPanelOpen}
        setLeftPanelOpen={setLeftPanelOpen}
        rightPanelOpen={rightPanelOpen}
        setRightPanelOpen={setRightPanelOpen}
        onBack={() => confirmLeave() && navigate(`/dashboard/sites/${siteId}/pages`)}
        onRebuild={() => {
          if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
          handleSave(true);
        }}
        onChangeDesignStyle={handleChangeDesignStyle}
        onChangeColors={handleChangeColors}
        currentColors={{
          primary: currentSite?.design?.primaryColor || '#0ea5e9',
          secondary: currentSite?.design?.secondaryColor || '#1e293b',
          accent: currentSite?.design?.accentColor || '#f59e0b',
        }}
      />

      {/* 3-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Section Navigator */}
        <div className={`transition-all duration-200 overflow-hidden ${leftPanelOpen ? 'w-[240px] min-w-[240px]' : 'w-0 min-w-0'}`}>
          {leftPanelOpen && (
            <SectionNavigator
              sections={page.sections}
              selectedSection={selectedSection}
              editingHeader={editingHeader}
              onSelectSection={selectSection}
              onSelectHeader={selectHeader}
              onToggleVisibility={toggleVisibility}
              onMoveSection={moveSection}
              allPages={allPages}
              pageId={pageId}
              siteId={siteId}
              onNavigatePage={(id) => navigate(`/dashboard/sites/${siteId}/pages/${id}`)}
            />
          )}
        </div>

        {/* Center: Preview iframe */}
        <div className="flex-1 relative overflow-auto flex justify-center min-w-0 bg-[#0a0a15]">
          {building && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg text-xs text-slate-300 bg-[#1e1e35]/95 border border-white/[0.07] backdrop-blur">
                <Loader2 size={12} className="animate-spin text-purple-400" />
                Reconstruction...
              </div>
            </div>
          )}
          <div
            className="h-full transition-all duration-300 bg-white"
            style={{
              width: VIEWPORT_WIDTHS[viewport],
              maxWidth: '100%',
              ...(viewport !== 'desktop' ? { boxShadow: '0 0 40px rgba(0,0,0,0.3)', borderRadius: viewport === 'mobile' ? '20px' : '12px', overflow: 'hidden', margin: '16px 0' } : {}),
            }}
          >
            <iframe
              ref={iframeRef}
              src={previewUrl}
              onLoad={() => editor.setIframeReady?.(true)}
              className="w-full h-full border-0"
              title="Aperçu du site"
            />
          </div>
        </div>

        {/* Right: Properties Panel */}
        <div className={`transition-all duration-200 overflow-hidden ${rightPanelOpen ? 'w-[300px] min-w-[300px]' : 'w-0 min-w-0'}`}>
          {rightPanelOpen && (
            <PropertiesPanel
              section={section}
              selectedSection={selectedSection}
              editingHeader={editingHeader}
              currentSite={currentSite}
              onChange={updateSectionData}
              onAIRewrite={handleAIRewrite}
              onMediaPick={openMediaPicker}
              updateSite={updateSite}
              siteId={siteId}
              postToIframe={postToIframe}
              setDirty={setDirty}
              needsFullReload={needsFullReload}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>

      {/* Media picker modal */}
      {showMediaPicker && (
        <MediaPicker
          siteId={siteId}
          onSelect={(media) => {
            if (editor.mediaCallback) editor.mediaCallback(media._id);
            setShowMediaPicker(false);
            setDirty(true);
          }}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
