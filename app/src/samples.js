/* Procedural sample photos for Vice City Cover Studio.
   Every sample is drawn with canvas code — no photo files, no network.
   paintSample(canvas, scene) fills the canvas with one of the scenes. */
(function () {
  'use strict';

  function sky(ctx, w, h, stops) {
    var g = ctx.createLinearGradient(0, 0, 0, h);
    for (var i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function sun(ctx, x, y, r, colour) {
    var g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    g.addColorStop(0, colour);
    g.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, Math.PI * 2); ctx.fill();
  }

  function skyline(ctx, w, h, base, colour, seed) {
    ctx.fillStyle = colour;
    var x = 0, s = seed;
    while (x < w) {
      s = (s * 16807) % 2147483647;
      var bw = 40 + (s % 90), bh = h * (0.18 + ((s >> 4) % 100) / 320);
      ctx.fillRect(x, base - bh, bw, bh + 4);
      s = (s * 16807) % 2147483647;
      if (s % 3 === 0) { ctx.fillRect(x + bw * 0.3, base - bh - 26, 6, 26); }
      x += bw + 6;
    }
  }

  function palm(ctx, x, y, s, colour) {
    ctx.strokeStyle = colour; ctx.fillStyle = colour; ctx.lineWidth = Math.max(3, 7 * s);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 14 * s, y - 70 * s, x + 34 * s, y - 110 * s); ctx.stroke();
    var tx = x + 34 * s, ty = y - 110 * s;
    for (var i = 0; i < 6; i++) {
      var a = -Math.PI * (0.08 + i * 0.16);
      ctx.beginPath(); ctx.moveTo(tx, ty);
      ctx.quadraticCurveTo(tx + Math.cos(a) * 52 * s, ty + Math.sin(a) * 30 * s - 12 * s,
        tx + Math.cos(a) * 78 * s, ty + Math.sin(a) * 52 * s + 22 * s);
      ctx.lineWidth = Math.max(2, 4 * s); ctx.stroke();
    }
  }

  function birds(ctx, w, h, n) {
    ctx.strokeStyle = 'rgba(20,8,24,0.85)'; ctx.lineWidth = 3;
    for (var i = 0; i < n; i++) {
      var x = w * (0.08 + i * 0.13), y = h * 0.07 + (i % 3) * h * 0.035;
      ctx.beginPath();
      ctx.moveTo(x - 14, y); ctx.quadraticCurveTo(x - 5, y - 10, x, y);
      ctx.quadraticCurveTo(x + 5, y - 10, x + 14, y);
      ctx.stroke();
    }
  }

  function sceneSunset(ctx, w, h) {
    sky(ctx, w, h, [[0, '#2b0a4e'], [0.42, '#c22a6b'], [0.68, '#ff7a18'], [1, '#ffc93c']]);
    sun(ctx, w * 0.68, h * 0.46, w * 0.16, 'rgba(255,190,80,0.9)');
    skyline(ctx, w, h, h * 0.82, '#1c0b2e', 12345);
    ctx.fillStyle = '#12061f'; ctx.fillRect(0, h * 0.82, w, h * 0.18);
    ctx.fillStyle = '#ff9e3d';
    ctx.fillRect(0, h * 0.82, w, 3);
    palm(ctx, w * 0.12, h * 0.86, 1.15, '#0a0512');
    palm(ctx, w * 0.88, h * 0.9, 0.9, '#0a0512');
    birds(ctx, w, h, 4);
  }

  function sceneNeon(ctx, w, h) {
    sky(ctx, w, h, [[0, '#05021a'], [0.55, '#12083a'], [1, '#3d0a54']]);
    var i, x;
    ctx.fillStyle = '#0b0626';
    for (i = 0; i < 7; i++) {
      x = i * (w / 6.4);
      ctx.fillRect(x, h * (0.2 + (i % 3) * 0.12), w * 0.11, h);
    }
    var signs = ['#19e3c2', '#ff2e88', '#ffc93c', '#7a5cff', '#19e3c2', '#ff2e88'];
    for (i = 0; i < 6; i++) {
      x = 20 + i * (w / 6);
      ctx.fillStyle = signs[i];
      ctx.fillRect(x, h * 0.34, w * 0.1, h * 0.05);
      ctx.fillRect(x, h * 0.52, w * 0.1, h * 0.05);
      ctx.fillRect(x, h * 0.68, w * 0.06, h * 0.05);
    }
    ctx.fillStyle = '#1a0f33'; ctx.fillRect(0, h * 0.84, w, h * 0.16);
    ctx.strokeStyle = '#ff2e88'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, h * 0.84); ctx.lineTo(w, h * 0.84); ctx.stroke();
    ctx.fillStyle = 'rgba(25,227,194,0.25)';
    for (i = 0; i < 5; i++) ctx.fillRect(30 + i * 150, h * 0.88, 90, 6);
    palm(ctx, w * 0.9, h * 0.88, 0.8, '#04020c');
  }

  function sceneBeach(ctx, w, h) {
    sky(ctx, w, h, [[0, '#7ec8e3'], [0.5, '#ffd9a0'], [0.72, '#ff9e5e'], [1, '#ff7a18']]);
    sun(ctx, w * 0.5, h * 0.52, w * 0.13, 'rgba(255,220,120,0.9)');
    ctx.fillStyle = '#2e7fa8'; ctx.fillRect(0, h * 0.62, w, h * 0.14);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (var i = 0; i < 6; i++) ctx.fillRect(40 + i * 130, h * (0.65 + (i % 2) * 0.05), 80, 4);
    ctx.fillStyle = '#f2d8a0'; ctx.fillRect(0, h * 0.76, w, h * 0.24);
    ctx.fillStyle = '#d9a05e';
    ctx.beginPath(); ctx.moveTo(0, h * 0.76); ctx.quadraticCurveTo(w * 0.5, h * 0.7, w, h * 0.78);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    palm(ctx, w * 0.16, h * 0.82, 1.25, '#3a2410');
    palm(ctx, w * 0.82, h * 0.86, 0.95, '#3a2410');
    birds(ctx, w, h, 3);
  }

  var PAINTERS = { sunset: sceneSunset, neon: sceneNeon, beach: sceneBeach };

  function paintSample(canvas, scene) {
    var name = PAINTERS[scene] ? scene : 'sunset';
    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    PAINTERS[name](ctx, canvas.width, canvas.height);
    ctx.restore();
    return canvas;
  }

  window.VCCoverSamples = {
    scenes: ['sunset', 'neon', 'beach'],
    paintSample: paintSample
  };
})();
