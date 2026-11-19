/* Vice City Cover Studio — render engine.
   Draws the multi-panel poster, colour grade and caption onto a canvas,
   and exports it as a PNG. No network: every pixel comes from the user's
   photos, the procedural samples, or code. */
(function () {
  'use strict';

  var SIZES = {
    '1080x1080': [1080, 1080],
    '1080x1350': [1080, 1350],
    '1920x1080': [1920, 1080]
  };

  var GRADES = {
    sunset: {
      label: 'Vice City Sunset',
      stops: [[0, 'rgba(255,46,136,0.55)'], [0.55, 'rgba(255,122,24,0.35)'], [1, 'rgba(25,227,194,0.30)']],
      wash: '#ff7a18', washAlpha: 0.10
    },
    neon: {
      label: 'Neon Night',
      stops: [[0, 'rgba(122,92,255,0.55)'], [0.5, 'rgba(255,46,136,0.40)'], [1, 'rgba(25,227,194,0.45)']],
      wash: '#19e3c2', washAlpha: 0.10
    },
    golden: {
      label: 'Golden Hour',
      stops: [[0, 'rgba(255,201,60,0.40)'], [0.6, 'rgba(255,122,24,0.35)'], [1, 'rgba(120,60,0,0.30)']],
      wash: '#ffc93c', washAlpha: 0.12
    },
    noir: {
      label: 'Mono Noir',
      stops: [[0, 'rgba(0,0,0,0.25)'], [1, 'rgba(0,0,0,0.55)']],
      wash: '#888888', washAlpha: 0.0, grey: true
    }
  };

  function defaultPanel() {
    return { image: null, label: 'Empty panel', scale: 1, dx: 0, dy: 0, fit: false, flip: false };
  }

  function createState() {
    return {
      layout: 'comic',
      grade: 'sunset',
      gradeStrength: 0.7,
      title: 'VICE CITY',
      subtitle: 'MY STORY, MY RULES',
      tagline: 'Coming soon to a street near you',
      captionPos: 'bottom',
      captionColor: '#ffffff',
      captionScale: 1,
      size: '1080x1080',
      panels: [defaultPanel(), defaultPanel(), defaultPanel(), defaultPanel()]
    };
  }

  function panelCount(layout) {
    return { hero: 1, split: 2, comic: 3, grid: 4 }[layout] || 1;
  }

  function layoutRects(layout, w, h, gap) {
    var g = gap || 8, half = g / 2;
    if (layout === 'split') {
      var mw = (w - g) / 2;
      return [
        { x: 0, y: 0, w: mw, h: h },
        { x: mw + g, y: 0, w: mw, h: h }
      ];
    }
    if (layout === 'comic') {
      var topH = Math.round(h * 0.62) - half;
      var bw = (w - g) / 2, bh = h - topH - g;
      return [
        { x: 0, y: 0, w: w, h: topH },
        { x: 0, y: topH + g, w: bw, h: bh },
        { x: bw + g, y: topH + g, w: bw, h: bh }
      ];
    }
    if (layout === 'grid') {
      var cw = (w - g) / 2, ch = (h - g) / 2;
      return [
        { x: 0, y: 0, w: cw, h: ch },
        { x: cw + g, y: 0, w: cw, h: ch },
        { x: 0, y: ch + g, w: cw, h: ch },
        { x: cw + g, y: ch + g, w: cw, h: ch }
      ];
    }
    return [{ x: 0, y: 0, w: w, h: h }];
  }

  function drawPhoto(ctx, panel, rect) {
    if (!panel.image) {
      var g = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.w, rect.y + rect.h);
      g.addColorStop(0, '#241a3d'); g.addColorStop(1, '#120a24');
      ctx.fillStyle = g;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(rect.x + 14, rect.y + 14, rect.w - 28, rect.h - 28);
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '700 ' + Math.max(16, rect.w * 0.05) + 'px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+ ADD PHOTO', rect.x + rect.w / 2, rect.y + rect.h / 2);
      return;
    }
    var img = panel.image;
    var iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    var base = panel.fit
      ? Math.min(rect.w / iw, rect.h / ih)
      : Math.max(rect.w / iw, rect.h / ih);
    var s = base * panel.scale;
    var dw = iw * s, dh = ih * s;
    var dx = rect.x + (rect.w - dw) / 2 + panel.dx;
    var dy = rect.y + (rect.h - dh) / 2 + panel.dy;
    ctx.save();
    ctx.beginPath(); ctx.rect(rect.x, rect.y, rect.w, rect.h); ctx.clip();
    if (panel.flip) { ctx.translate(rect.x * 2 + rect.w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(img, dx, dy, dw, dh);
    ctx.restore();
  }

  function applyGrade(ctx, w, h, gradeName, strength) {
    var grade = GRADES[gradeName] || GRADES.sunset;
    if (strength <= 0) return;
    var g = ctx.createLinearGradient(0, 0, 0, h);
    for (var i = 0; i < grade.stops.length; i++) g.addColorStop(grade.stops[i][0], grade.stops[i][1]);
    ctx.save();
    ctx.globalAlpha = strength;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = grade.wash;
    ctx.globalAlpha = strength * grade.washAlpha * 4;
    ctx.fillRect(0, 0, w, h);
    if (grade.grey) {
      ctx.globalCompositeOperation = 'saturation';
      ctx.globalAlpha = strength;
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
    var v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,' + (0.28 * strength + 0.08) + ')');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }

  function fitLines(ctx, text, maxWidth) {
    var words = String(text || '').split(/\s+/).filter(Boolean);
    var lines = [], line = '';
    for (var i = 0; i < words.length; i++) {
      var next = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = words[i]; }
      else line = next;
    }
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  function drawCaption(ctx, state, w, h) {
    var title = (state.title || '').toUpperCase();
    var scale = state.captionScale || 1;
    var titlePx = Math.round(w * 0.085 * scale);
    var font = '900 ' + titlePx + 'px "Arial Black", "DejaVu Sans", sans-serif';
    ctx.save();
    try { ctx.letterSpacing = Math.round(titlePx * 0.04) + 'px'; } catch (e) { /* older canvas: no letter spacing */ }
    ctx.font = font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    var maxW = w * 0.92;
    var lines = fitLines(ctx, title, maxW);
    var lineH = titlePx * 1.04;
    var subPx = Math.round(w * 0.028 * scale);
    var tagPx = Math.round(w * 0.02 * scale);
    // Measured height from the band top to the tagline's descenders, so the
    // whole caption always fits inside the canvas with a margin. The title
    // loop advances y once per line (including the last), the subtitle adds
    // 2.1 sub-heights, and the tagline sits half a tag-height past that.
    var blockH = titlePx * 0.72 + lines.length * lineH
      + (state.subtitle ? subPx * 2.1 : 0)
      + (state.tagline ? tagPx * 0.85 : 0) + 16;
    var y0;
    if (state.captionPos === 'top') y0 = h * 0.045;
    else if (state.captionPos === 'center') y0 = (h - blockH) / 2;
    else y0 = h - blockH - h * 0.04;
    if (y0 < 8) y0 = 8;

    ctx.fillStyle = 'rgba(8,4,18,0.55)';
    var bandY = y0 - 10, bandH = blockH + 10;
    ctx.fillRect(w * 0.02, bandY, w * 0.96, bandH);
    ctx.fillStyle = '#ff2e88';
    ctx.fillRect(w * 0.02, bandY, w * 0.96, Math.max(4, h * 0.006));

    var y = y0 + titlePx * 0.72;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    for (var li = 0; li < lines.length; li++) {
      ctx.lineWidth = Math.max(3, titlePx * 0.09);
      ctx.strokeStyle = 'rgba(10,4,20,0.95)';
      ctx.strokeText(lines[li], w / 2, y);
      ctx.fillStyle = state.captionColor || '#ffffff';
      ctx.shadowColor = 'rgba(255,46,136,0.85)';
      ctx.shadowBlur = titlePx * 0.16;
      ctx.shadowOffsetY = titlePx * 0.03;
      ctx.fillText(lines[li], w / 2, y);
      ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      y += lineH;
    }
    if (state.subtitle) {
      ctx.font = '800 ' + subPx + 'px "Arial Black", "DejaVu Sans", sans-serif';
      ctx.fillStyle = '#ffc93c';
      ctx.fillText(state.subtitle.toUpperCase(), w / 2, y + subPx * 0.4);
      y += subPx * 1.7;
    }
    if (state.tagline) {
      ctx.font = 'italic 600 ' + tagPx + 'px Georgia, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(state.tagline, w / 2, y + tagPx * 0.5);
    }
    ctx.restore();
  }

  function renderCover(canvas, state, width, height) {
    var w = width || 1080, h = height || 1080;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = '#0d0a14';
    ctx.fillRect(0, 0, w, h);
    var rects = layoutRects(state.layout, w, h, Math.max(6, Math.round(w * 0.007)));
    var n = panelCount(state.layout);
    for (var i = 0; i < n; i++) drawPhoto(ctx, state.panels[i] || defaultPanel(), rects[i]);
    applyGrade(ctx, w, h, state.grade, state.gradeStrength);
    drawCaption(ctx, state, w, h);
    ctx.restore();
    return canvas;
  }

  function exportCover(state) {
    var size = SIZES[state.size] || SIZES['1080x1080'];
    var canvas = document.createElement('canvas');
    renderCover(canvas, state, size[0], size[1]);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) return reject(new Error('PNG export produced no data'));
        resolve({ blob: blob, width: size[0], height: size[1], bytes: blob.size });
      }, 'image/png');
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('Could not load image')); };
      img.src = src;
    });
  }

  window.VCCover = {
    SIZES: SIZES,
    GRADES: GRADES,
    createState: createState,
    panelCount: panelCount,
    layoutRects: layoutRects,
    renderCover: renderCover,
    exportCover: exportCover,
    loadImage: loadImage,
    defaultPanel: defaultPanel
  };
})();
