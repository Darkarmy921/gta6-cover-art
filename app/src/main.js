/* Vice City Cover Studio — UI wiring.
   Connects the controls in index.html to the cover.js render engine. */
(function () {
  'use strict';

  var Cover = window.VCCover;
  var Samples = window.VCCoverSamples;
  var state = Cover.createState();
  var selectedPanel = 0;
  var showingOriginal = false;

  var PRESETS = [
    { title: 'VICE CITY', subtitle: 'MY STORY, MY RULES', tagline: 'Coming soon to a street near you' },
    { title: 'NEON NIGHTS', subtitle: 'DRIVE FAST, SHINE BRIGHT', tagline: 'The city never sleeps' },
    { title: 'GOLDEN GETAWAY', subtitle: 'ONE LAST JOB', tagline: 'Sunset, palms, and a full tank' }
  ];

  function $(id) { return document.getElementById(id); }

  function previewDims() {
    var size = Cover.SIZES[state.size] || Cover.SIZES['1080x1080'];
    var max = 720, s = Math.min(1, max / size[0], max / size[1]);
    return [Math.round(size[0] * s), Math.round(size[1] * s)];
  }

  function syncChoiceButtons() {
    function mark(containerId, attr, value) {
      var box = $(containerId);
      if (!box) return;
      box.querySelectorAll('.choice').forEach(function (c) {
        c.classList.toggle('is-active', c.getAttribute('data-' + attr) === String(value));
      });
    }
    mark('layoutChoices', 'layout', state.layout);
    mark('gradeChoices', 'grade', state.grade);
    mark('sizeChoices', 'size', state.size);
  }

  function render() {
    syncChoiceButtons();
    var canvas = $('preview');
    var dims = previewDims();
    var view = state;
    if (showingOriginal) {
      view = Object.assign({}, state, { gradeStrength: 0, title: '', subtitle: '', tagline: '' });
    }
    Cover.renderCover(canvas, view, dims[0], dims[1]);
    $('previewHint').style.display = state.panels.some(function (p) { return p.image; }) ? 'none' : 'block';
    buildSlots();
  }

  function buildSlots() {
    var wrap = $('panelSlots');
    var n = Cover.panelCount(state.layout);
    wrap.innerHTML = '';
    for (var i = 0; i < n; i++) {
      (function (i) {
        var p = state.panels[i];
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slot' + (i === selectedPanel ? ' is-active' : '');
        b.textContent = 'Panel ' + (i + 1) + ': ' + (p.label || 'Empty panel');
        b.addEventListener('click', function () { selectedPanel = i; syncPanelControls(); render(); });
        wrap.appendChild(b);
      })(i);
    }
  }

  function syncPanelControls() {
    var p = state.panels[selectedPanel];
    $('zoom').value = Math.round(p.scale * 100);
    $('zoomVal').textContent = Math.round(p.scale * 100) + '%';
    $('fitToggle').checked = !!p.fit;
    $('flipToggle').checked = !!p.flip;
  }

  function setStatus(msg) { $('status').textContent = msg; }

  function loadFiles(files) {
    var list = Array.prototype.slice.call(files || []);
    if (!list.length) return;
    var chain = Promise.resolve();
    list.forEach(function (file) {
      chain = chain.then(function () {
        return new Promise(function (resolve) {
          var reader = new FileReader();
          reader.onload = function () {
            Cover.loadImage(reader.result).then(function (img) {
              var target = selectedPanel;
              if (state.panels[target].image) {
                for (var i = 0; i < Cover.panelCount(state.layout); i++) {
                  if (!state.panels[i].image) { target = i; break; }
                }
              }
              state.panels[target] = Object.assign(Cover.defaultPanel(), {
                image: img, label: file.name || 'Photo', scale: 1, dx: 0, dy: 0
              });
              selectedPanel = target;
              syncPanelControls(); render();
              setStatus('Loaded ' + (file.name || 'photo') + ' into panel ' + (target + 1) + '.');
              resolve();
            }, function () { setStatus('Could not load that file as an image.'); resolve(); });
          };
          reader.readAsDataURL(file);
        });
      });
    });
    return chain;
  }

  function loadSample() {
    var scenes = Samples.scenes;
    var n = Cover.panelCount(state.layout);
    for (var i = 0; i < n; i++) {
      var c = document.createElement('canvas');
      c.width = 900; c.height = 900;
      Samples.paintSample(c, scenes[i % scenes.length]);
      state.panels[i] = Object.assign(Cover.defaultPanel(), {
        image: c, label: 'Sample: ' + scenes[i % scenes.length], scale: 1, dx: 0, dy: 0
      });
    }
    selectedPanel = 0;
    syncPanelControls(); render();
    setStatus('Sample photos loaded — edit the caption, pick a grade, then export.');
  }

  function applyPreset(i) {
    var p = PRESETS[i] || PRESETS[0];
    state.title = p.title; state.subtitle = p.subtitle; state.tagline = p.tagline;
    $('capTitle').value = p.title;
    $('capSubtitle').value = p.subtitle;
    $('capTagline').value = p.tagline;
    render();
  }

  function bindChoices(containerId, attr, fn) {
    var box = $(containerId);
    box.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-' + attr + ']');
      if (!btn) return;
      box.querySelectorAll('.choice').forEach(function (c) { c.classList.remove('is-active'); });
      btn.classList.add('is-active');
      fn(btn.getAttribute('data-' + attr), btn);
    });
  }

  function init() {
    $('fileInput').addEventListener('change', function (ev) { loadFiles(ev.target.files); ev.target.value = ''; });
    $('btnSample').addEventListener('click', loadSample);
    $('btnFillAll').addEventListener('click', function () {
      var src = state.panels[selectedPanel];
      if (!src.image) { setStatus('Load a photo first — there is nothing to fill with yet.'); return; }
      for (var i = 0; i < Cover.panelCount(state.layout); i++) {
        state.panels[i] = Object.assign({}, src, { label: src.label + ' (all panels)' });
      }
      render(); setStatus('One photo now fills every panel.');
    });
    $('btnReset').addEventListener('click', function () {
      state = Cover.createState(); selectedPanel = 0;
      $('capTitle').value = state.title;
      $('capSubtitle').value = state.subtitle;
      $('capTagline').value = state.tagline;
      $('capPos').value = state.captionPos;
      $('capColor').value = state.captionColor;
      $('gradeStrength').value = 70;
      $('gradeVal').textContent = '70%';
      $('capSize').value = 100;
      $('capSizeVal').textContent = '100%';
      document.querySelectorAll('#layoutChoices .choice').forEach(function (c, i) { c.classList.toggle('is-active', i === 2); });
      syncPanelControls(); render(); setStatus('Reset. Ready for a new cover.');
    });

    var hold = $('btnBeforeAfter');
    hold.addEventListener('pointerdown', function () { showingOriginal = true; hold.setAttribute('aria-pressed', 'true'); render(); });
    ['pointerup', 'pointerleave'].forEach(function (evn) {
      hold.addEventListener(evn, function () { showingOriginal = false; hold.setAttribute('aria-pressed', 'false'); render(); });
    });

    bindChoices('layoutChoices', 'layout', function (v) {
      state.layout = v; if (selectedPanel >= Cover.panelCount(v)) selectedPanel = 0;
      syncPanelControls(); render();
    });
    bindChoices('gradeChoices', 'grade', function (v) { state.grade = v; render(); });
    bindChoices('sizeChoices', 'size', function (v) {
      state.size = v;
      $('exportInfo').textContent = 'Exports at ' + v.replace('x', ' × ') + '.';
      render();
    });
    bindChoices('presetChoices', 'preset', function (v) { applyPreset(parseInt(v, 10)); });

    $('zoom').addEventListener('input', function (ev) {
      state.panels[selectedPanel].scale = parseInt(ev.target.value, 10) / 100;
      $('zoomVal').textContent = ev.target.value + '%';
      render();
    });
    $('fitToggle').addEventListener('change', function (ev) {
      state.panels[selectedPanel].fit = ev.target.checked; render();
    });
    $('flipToggle').addEventListener('change', function (ev) {
      state.panels[selectedPanel].flip = ev.target.checked; render();
    });
    $('gradeStrength').addEventListener('input', function (ev) {
      state.gradeStrength = parseInt(ev.target.value, 10) / 100;
      $('gradeVal').textContent = ev.target.value + '%';
      render();
    });
    $('capSize').addEventListener('input', function (ev) {
      state.captionScale = parseInt(ev.target.value, 10) / 100;
      $('capSizeVal').textContent = ev.target.value + '%';
      render();
    });
    $('capTitle').addEventListener('input', function (ev) { state.title = ev.target.value; render(); });
    $('capSubtitle').addEventListener('input', function (ev) { state.subtitle = ev.target.value; render(); });
    $('capTagline').addEventListener('input', function (ev) { state.tagline = ev.target.value; render(); });
    $('capPos').addEventListener('change', function (ev) { state.captionPos = ev.target.value; render(); });
    $('capColor').addEventListener('input', function (ev) { state.captionColor = ev.target.value; render(); });

    var canvas = $('preview');
    var drag = null;
    canvas.addEventListener('pointerdown', function (ev) {
      var r = canvas.getBoundingClientRect();
      var px = (ev.clientX - r.left) * (canvas.width / r.width);
      var py = (ev.clientY - r.top) * (canvas.height / r.height);
      var rects = Cover.layoutRects(state.layout, canvas.width, canvas.height, Math.max(6, Math.round(canvas.width * 0.007)));
      for (var i = 0; i < rects.length; i++) {
        if (px >= rects[i].x && px <= rects[i].x + rects[i].w && py >= rects[i].y && py <= rects[i].y + rects[i].h) {
          selectedPanel = i; syncPanelControls(); buildSlots(); break;
        }
      }
      drag = { x: ev.clientX, y: ev.clientY, panel: state.panels[selectedPanel] };
      canvas.setPointerCapture(ev.pointerId);
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!drag || !drag.panel.image) return;
      var r = canvas.getBoundingClientRect();
      var size = Cover.SIZES[state.size] || Cover.SIZES['1080x1080'];
      var k = size[0] / r.width;
      drag.panel.dx += (ev.clientX - drag.x) * k;
      drag.panel.dy += (ev.clientY - drag.y) * k;
      drag.x = ev.clientX; drag.y = ev.clientY;
      render();
    });
    canvas.addEventListener('pointerup', function () { drag = null; });

    var wrap = $('previewWrap');
    wrap.addEventListener('dragover', function (ev) { ev.preventDefault(); wrap.classList.add('dragging'); });
    wrap.addEventListener('dragleave', function () { wrap.classList.remove('dragging'); });
    wrap.addEventListener('drop', function (ev) {
      ev.preventDefault(); wrap.classList.remove('dragging');
      loadFiles(ev.dataTransfer.files);
    });

    $('btnExport').addEventListener('click', function () {
      setStatus('Exporting PNG…');
      Cover.exportCover(state).then(function (out) {
        var url = URL.createObjectURL(out.blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'vice-city-cover-' + state.size + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
        $('exportInfo').textContent = 'Exported ' + out.width + ' × ' + out.height +
          ' PNG, ' + Math.round(out.bytes / 1024) + ' KB.';
        setStatus('Exported ' + out.width + ' × ' + out.height + ' PNG (' + Math.round(out.bytes / 1024) + ' KB).');
      }, function (err) { setStatus('Export failed: ' + err.message); });
    });

    syncPanelControls();
    render();
  }

  window.__coverStudio = {
    state: function () { return state; },
    render: render,
    loadSample: loadSample,
    applyPreset: applyPreset,
    exportCover: function () { return Cover.exportCover(state); },
    selectPanel: function (i) { selectedPanel = i; syncPanelControls(); render(); },
    loadPhotoDataURL: function (dataUrl, label) {
      return Cover.loadImage(dataUrl).then(function (img) {
        state.panels[selectedPanel] = Object.assign(Cover.defaultPanel(), {
          image: img, label: label || 'Photo', scale: 1, dx: 0, dy: 0
        });
        render();
        return true;
      });
    },
    setState: function (patch) { Object.assign(state, patch); render(); }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
