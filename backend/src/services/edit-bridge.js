/**
 * Edit bridge JavaScript — injected into generated HTML for iframe preview editing.
 * Handles PostMessage communication between the preview iframe and the parent editor.
 *
 * Protocol: resamatic:* messages (kept for backward compatibility)
 * - Parent → Iframe: updateField, updateStyle, toggleSection, selectSection, updateHeader
 * - Iframe → Parent: ready, navigate, edit, inlineEdit
 */

export const EDIT_BRIDGE_SCRIPT = `
if (window.parent !== window) {
  document.body.classList.add('is-editor');

  // Nav link interception
  document.querySelectorAll('a[href]').forEach(function(a) {
    var href = a.getAttribute('href');
    if (href && href.endsWith('.html')) {
      a.addEventListener('click', function(e) {
        e.preventDefault();
        window.parent.postMessage({ type: 'resamatic:navigate', href: href }, '*');
      });
    }
  });

  // Click section → select
  document.querySelectorAll('[data-section]').forEach(function(sec) {
    sec.style.cursor = 'pointer';
    sec.addEventListener('click', function(e) {
      if (e.target.closest('[data-editable]') || e.target.isContentEditable) return;
      e.preventDefault();
      window.parent.postMessage({
        type: 'resamatic:edit', field: '', sectionType: sec.dataset.section, isMedia: false
      }, '*');
    });
  });

  // Click-to-edit fields
  document.querySelectorAll('[data-editable]').forEach(function(el) {
    el.style.cursor = 'pointer';
    el.style.position = el.style.position || 'relative';
    var isMedia = el.dataset.editable.indexOf('MediaId') !== -1;
    el.addEventListener('mouseenter', function() {
      el.style.outline = '2px dashed rgba(124,58,237,0.6)';
      el.style.outlineOffset = '3px';
    });
    el.addEventListener('mouseleave', function() {
      if (!el.isContentEditable) { el.style.outline = ''; el.style.outlineOffset = ''; el.blur(); }
    });
    el.addEventListener('click', function(e) {
      e.preventDefault(); e.stopPropagation();
      var section = el.closest('[data-section]');
      window.parent.postMessage({
        type: 'resamatic:edit', field: el.dataset.editable,
        sectionType: section ? section.dataset.section : '', isMedia: isMedia
      }, '*');
    });

    // Double-click inline editing
    var field = el.dataset.editable;
    var isHtmlField = field === 'body' || field === 'text';
    if (!isMedia) {
      el.addEventListener('dblclick', function(e) {
        e.preventDefault(); e.stopPropagation();
        if (el.isContentEditable) return;
        el.contentEditable = 'true';
        el.style.outline = '2px solid rgba(124,58,237,1)';
        el.style.outlineOffset = '3px';
        el.style.background = 'rgba(255,255,255,0.95)';
        el.focus();
        function finish() {
          el.contentEditable = 'false';
          el.style.outline = ''; el.style.outlineOffset = ''; el.style.background = '';
          el.removeEventListener('blur', finish); el.removeEventListener('keydown', onKey);
          var section = el.closest('[data-section]');
          window.parent.postMessage({
            type: 'resamatic:inlineEdit', field: el.dataset.editable,
            sectionType: section ? section.dataset.section : '',
            value: isHtmlField ? el.innerHTML : el.textContent
          }, '*');
        }
        function onKey(ev) {
          if (ev.key === 'Escape') el.blur();
          if (ev.key === 'Enter' && !ev.shiftKey && !isHtmlField) { ev.preventDefault(); el.blur(); }
        }
        el.addEventListener('blur', finish);
        el.addEventListener('keydown', onKey);
      });
    }
  });

  // Real-time updates from parent
  window.addEventListener('message', function(e) {
    var d = e.data;
    if (!d || !d.type) return;

    if (d.type === 'resamatic:updateField') {
      var section = document.querySelector('[data-section="' + d.sectionType + '"]');
      if (!section) return;
      var el = section.querySelector('[data-editable="' + d.field + '"]');
      if (el) {
        var htmlFields = ['body', 'text'];
        if (htmlFields.indexOf(d.field) !== -1) el.innerHTML = d.value;
        else el.textContent = d.value;
      }
    }

    if (d.type === 'resamatic:toggleSection') {
      var sec = document.querySelector('[data-section="' + d.sectionType + '"]');
      if (sec) sec.style.display = d.visible ? '' : 'none';
    }

    if (d.type === 'resamatic:updateStyle') {
      var sec2 = document.querySelector('[data-section="' + d.sectionType + '"]');
      if (sec2) {
        sec2.style.backgroundColor = d.backgroundColor || '';
        sec2.style.color = d.textColor || '';
        var colorEls = sec2.querySelectorAll('h1,h2,h3,h4,p,span,li,a,strong,em,div');
        if (d.textColor) colorEls.forEach(function(el) { el.style.color = d.textColor; });
        else colorEls.forEach(function(el) { el.style.color = ''; });
      }
    }

    if (d.type === 'resamatic:updateHeader') {
      var header = document.querySelector('nav');
      if (header) {
        if (d.bgColor) header.style.backgroundColor = d.bgColor;
        else header.style.backgroundColor = '';
      }
    }

    if (d.type === 'resamatic:selectSection') {
      document.querySelectorAll('[data-section]').forEach(function(s) { s.style.boxShadow = ''; });
      var target = document.querySelector('[data-section="' + d.sectionType + '"]');
      if (target) {
        target.style.boxShadow = 'inset 0 0 0 2px rgba(124,58,237,0.5)';
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  window.parent.postMessage({ type: 'resamatic:ready' }, '*');
}
`;
