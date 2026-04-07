import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { pagesApi, buildApi, aiApi, sitesApi } from '../../services/api';
import useSiteStore from '../../stores/siteStore';

/**
 * Core editor state hook.
 * Encapsulates ALL PostMessage communication, state management,
 * auto-save, and rebuild logic from the original monolith.
 */
export default function useEditorState(siteId, pageId) {
  const navigate = useNavigate();
  const { currentSite, fetchSite, updateSite } = useSiteStore();

  // Page state
  const [page, setPage] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [editingHeader, setEditingHeader] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [building, setBuilding] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const [viewport, setViewport] = useState('desktop');

  // Media picker state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaCallback, setMediaCallback] = useState(null);

  // Refs
  const iframeRef = useRef(null);
  const pageRef = useRef(null);
  const allPagesRef = useRef([]);
  const autoSaveTimer = useRef(null);
  const savingRef = useRef(false);
  const needsFullReload = useRef(false);

  // Keep refs in sync
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { allPagesRef.current = allPages; }, [allPages]);
  useEffect(() => { if (siteId) fetchSite(siteId); }, [siteId]);

  // Fetch all pages for nav link matching
  useEffect(() => {
    (async () => {
      try {
        const { pages } = await pagesApi.getBySite(siteId);
        setAllPages(pages);
      } catch {}
    })();
  }, [siteId]);

  // Fetch current page
  const fetchPage = useCallback(async () => {
    try {
      const { page: p } = await pagesApi.getOne(pageId);
      setPage(p);
      setDirty(false);
      if (p.sections?.length) setSelectedSection(0);
    } catch {
      toast.error('Impossible de charger la page');
      navigate(`/dashboard/sites/${siteId}/pages`);
    }
  }, [pageId, siteId, navigate]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  // --- PostMessage to iframe ---
  const postToIframe = useCallback((msg) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(msg, '*');
    }
  }, []);

  // --- Update section data ---
  const updateSectionData = useCallback((sectionIdx, field, value) => {
    setPage(prev => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const data = { ...sections[sectionIdx].data };
      const keys = field.split('.');
      if (keys.length === 1) {
        data[field] = value;
      } else {
        let obj = data;
        for (let i = 0; i < keys.length - 1; i++) {
          if (Array.isArray(obj[keys[i]])) {
            obj[keys[i]] = [...obj[keys[i]]];
            obj = obj[keys[i]];
          } else {
            obj[keys[i]] = { ...obj[keys[i]] };
            obj = obj[keys[i]];
          }
        }
        obj[keys[keys.length - 1]] = value;
      }
      sections[sectionIdx] = { ...sections[sectionIdx], data };

      const sectionType = sections[sectionIdx].type;
      if (keys.length === 1 && typeof value === 'string' && !field.endsWith('MediaId') && field !== 'style') {
        postToIframe({ type: 'resamatic:updateField', sectionType, field, value });
      } else if (field !== 'style') {
        needsFullReload.current = true;
      }
      if (field === 'style' && typeof value === 'object') {
        postToIframe({
          type: 'resamatic:updateStyle',
          sectionType,
          backgroundColor: value.backgroundColor || '',
          textColor: value.textColor || '',
        });
      }
      return { ...prev, sections };
    });
    setDirty(true);
  }, [postToIframe]);

  // --- Toggle visibility ---
  const toggleVisibility = useCallback((idx) => {
    setPage(prev => {
      const sections = [...prev.sections];
      const newVisible = !sections[idx].visible;
      sections[idx] = { ...sections[idx], visible: newVisible };
      postToIframe({ type: 'resamatic:toggleSection', sectionType: sections[idx].type, visible: newVisible });
      return { ...prev, sections };
    });
    needsFullReload.current = true;
    setDirty(true);
  }, [postToIframe]);

  // --- Move section ---
  const moveSection = useCallback((idx, dir) => {
    setPage(prev => {
      const sections = [...prev.sections];
      const target = idx + dir;
      if (target < 0 || target >= sections.length) return prev;
      [sections[idx], sections[target]] = [sections[target], sections[idx]];
      sections.forEach((s, i) => s.order = i);
      return { ...prev, sections };
    });
    setSelectedSection(prev => prev === idx ? idx + dir : prev);
    needsFullReload.current = true;
    setDirty(true);
  }, []);

  // --- Select section ---
  const selectSection = useCallback((idx) => {
    setSelectedSection(idx);
    setEditingHeader(false);
    const section = pageRef.current?.sections?.[idx];
    if (section) {
      postToIframe({ type: 'resamatic:selectSection', sectionType: section.type });
    }
  }, [postToIframe]);

  // --- Select header ---
  const selectHeader = useCallback(() => {
    setEditingHeader(true);
    setSelectedSection(null);
  }, []);

  // --- Save + rebuild ---
  const handleSave = useCallback(async (forceReload = false) => {
    const currentPage = pageRef.current;
    if (!currentPage || savingRef.current) return;
    const shouldReload = forceReload || needsFullReload.current;
    needsFullReload.current = false;
    savingRef.current = true;
    setSaving(true);
    try {
      await pagesApi.update(pageId, {
        title: currentPage.title,
        seo: currentPage.seo,
        sections: currentPage.sections,
      });
      setDirty(false);
      if (shouldReload) {
        setBuilding(true);
        let savedScrollY = 0;
        try { savedScrollY = iframeRef.current?.contentWindow?.scrollY || 0; } catch {}
        await buildApi.trigger(siteId);
        let attempts = 0;
        const poll = setInterval(async () => {
          attempts++;
          try {
            const { status } = await buildApi.status(siteId);
            if (status !== 'building' || attempts > 20) {
              clearInterval(poll);
              setBuilding(false);
              if (iframeRef.current) {
                setIframeReady(false);
                const restoreScroll = () => {
                  try { iframeRef.current.contentWindow.scrollTo(0, savedScrollY); } catch {}
                  iframeRef.current.removeEventListener('load', restoreScroll);
                };
                iframeRef.current.addEventListener('load', restoreScroll);
                iframeRef.current.src = iframeRef.current.src;
              }
            }
          } catch {
            clearInterval(poll);
            setBuilding(false);
          }
        }, 800);
      }
    } catch {
      toast.error('Erreur de sauvegarde');
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  }, [pageId, siteId]);

  // --- Auto-save ---
  useEffect(() => {
    if (!dirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => handleSave(), 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [dirty, page, handleSave]);

  // --- AI rewrite ---
  const handleAIRewrite = useCallback(async (field, currentText) => {
    const instruction = prompt('Instruction pour l\'IA (ex: "rendre plus persuasif", "raccourcir") :');
    if (!instruction) return;
    try {
      const { text } = await aiApi.rewrite({ text: currentText, instruction });
      if (selectedSection !== null) {
        updateSectionData(selectedSection, field, text);
      }
      toast.success('Texte réécrit');
    } catch {
      toast.error('Erreur IA');
    }
  }, [selectedSection, updateSectionData]);

  // --- Media picker ---
  const openMediaPicker = useCallback((callback) => {
    setMediaCallback(() => callback);
    setShowMediaPicker(true);
  }, []);

  const openMediaPickerRef = useRef(openMediaPicker);
  const updateSectionDataRef = useRef(updateSectionData);
  useEffect(() => { openMediaPickerRef.current = openMediaPicker; });
  useEffect(() => { updateSectionDataRef.current = updateSectionData; });

  // --- PostMessage from iframe ---
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === 'resamatic:ready') { setIframeReady(true); return; }
      if (e.data?.type === 'resamatic:navigate') {
        const href = e.data.href;
        const pages = allPagesRef.current;
        const target = pages.find(p => (href === 'index.html' && p.isMainHomepage) || p.slug + '.html' === href);
        if (target && target._id !== pageId) navigate(`/dashboard/sites/${siteId}/pages/${target._id}`);
        return;
      }
      if (e.data?.type === 'resamatic:edit') {
        const currentPage = pageRef.current;
        if (!currentPage?.sections) return;
        const sIdx = currentPage.sections.findIndex(s => s.type === e.data.sectionType);
        if (sIdx < 0) return;
        setSelectedSection(sIdx);
        setEditingHeader(false);
        if (e.data.isMedia) {
          openMediaPickerRef.current((mediaId) => { updateSectionDataRef.current(sIdx, e.data.field, mediaId); });
        }
        if (e.data.field) {
          setTimeout(() => {
            const fieldEl = document.querySelector(`[data-editor-field="${e.data.field}"]`);
            if (fieldEl) fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      }
      if (e.data?.type === 'resamatic:inlineEdit') {
        const currentPage = pageRef.current;
        if (!currentPage?.sections) return;
        const sIdx = currentPage.sections.findIndex(s => s.type === e.data.sectionType);
        if (sIdx >= 0) updateSectionDataRef.current(sIdx, e.data.field, e.data.value);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [pageId, siteId, navigate]);

  // --- Warn before leaving ---
  useEffect(() => {
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const confirmLeave = useCallback(() => {
    if (!dirty) return true;
    return window.confirm('Vous avez des modifications non sauvegardées. Quitter sans sauvegarder ?');
  }, [dirty]);

  // --- Ctrl+S ---
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  // Computed
  const section = selectedSection !== null ? page?.sections?.[selectedSection] : null;
  const previewUrl = page ? `/api/build/${siteId}/preview/${page.isMainHomepage ? 'index.html' : page.slug + '.html'}` : '';

  return {
    // State
    page, allPages, selectedSection, editingHeader,
    saving, building, dirty, iframeReady, viewport,
    showMediaPicker, mediaCallback,
    section, previewUrl,
    currentSite,

    // Setters
    setViewport, setShowMediaPicker, setDirty,

    // Actions
    postToIframe, updateSectionData, toggleVisibility, moveSection,
    selectSection, selectHeader, handleSave, handleAIRewrite,
    openMediaPicker, confirmLeave, updateSite,

    // Refs
    iframeRef, autoSaveTimer, needsFullReload,
  };
}
