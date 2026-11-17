/* OraDesk Web Database Bridge: connects the clinical frontend to Next.js + MySQL */
(() => {
  'use strict';
  const callbacks = { patients: new Set(), appointments: new Set(), lab: new Set(), settings: new Set() };
  let state = null, revision = -1, inflight = false, writes = 0;
  let lastRefresh = 0;

  async function request(url, options = {}) {
    const res = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
    if (res.status === 401) {
      window.location.replace('/login');
      throw new Error('Session expired. Please sign in again.');
    }
    if (!res.ok) {
      let message = `Server returned ${res.status}`;
      try { message = (await res.json()).error || message; } catch (_) {}
      throw new Error(message);
    }
    return res.json();
  }

  function publish(collection) {
    if (!state) return;
    for (const item of callbacks[collection]) {
      try {
        if (collection === 'settings') {
          const doc = state.settings[item.id];
          item.callback({ exists: !!doc, data: () => structuredClone(doc || {}) });
        } else {
          const all = state.collections[collection] || {};
          item.callback({ docs: Object.entries(all).map(([id, v]) => ({ id, data: () => structuredClone(v) })) });
        }
      } catch (err) { console.error('OraDesk subscriber error', err); }
    }
  }

  async function refresh(force = false) {
    if (inflight || writes) return;
    if (!force && Date.now() - lastRefresh < 500) return;
    inflight = true;
    try {
      const next = await request('/api/state');
      lastRefresh = Date.now();
      if (next.revision !== revision || state === null) {
        revision = next.revision;
        state = next;
        Object.keys(callbacks).forEach(publish);
        if (next.user) {
          window.currentUser = next.user;
          const userBadge = document.getElementById('user-header-badge');
          if (userBadge) {
            userBadge.innerHTML = `
              <span style="font-weight:700;color:#003339;">${escapeHtml(next.user.name)}</span>
              <span style="font-size:11px;padding:2px 8px;border-radius:999px;background:#ddf1f1;color:#00666b;font-weight:700;">${next.user.role}</span>
              ${next.user.role === 'SUPER_ADMIN' ? '<a href="/admin" style="font-size:12px;color:#00666b;font-weight:700;text-decoration:underline;margin-left:6px;">⚙️ Admin Panel</a>' : ''}
              <button onclick="fetch('/api/auth/logout',{method:'POST'}).then(()=>location.replace('/login'))" style="margin-left:8px;padding:3px 8px;border-radius:6px;border:1px solid #cce3e3;background:#fff;font-size:11px;cursor:pointer;font-weight:600;">Sign Out</button>
            `;
          }
        }
      }
    } catch (err) {
      for (const entries of Object.values(callbacks)) {
        for (const { fail } of entries) if (fail) {
          try { fail(err); } catch (_) {}
        }
      }
      console.error('OraDesk database connection:', err);
    } finally {
      inflight = false;
    }
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function subscribe(coll, cb, fail, id = '') {
    const item = { callback: cb, fail, id };
    callbacks[coll].add(item);
    if (state) queueMicrotask(() => {
      if (callbacks[coll].has(item)) {
        if (coll === 'settings') {
          const doc = state.settings[id];
          cb({ exists: !!doc, data: () => structuredClone(doc || {}) });
        } else {
          const all = state.collections[coll] || {};
          cb({ docs: Object.entries(all).map(([key, value]) => ({ id: key, data: () => structuredClone(value) })) });
        }
      }
    });
    else queueMicrotask(() => refresh(true));
    return () => callbacks[coll].delete(item);
  }

  const db = {
    collection(name) {
      if (!['patients', 'appointments', 'lab'].includes(name)) throw Error('Unknown collection');
      return { onSnapshot: (cb, fail) => subscribe(name, cb, fail) };
    },
    doc(path) {
      const [coll, id, extra] = path.split('/');
      if (extra || !['patients', 'appointments', 'lab', 'settings'].includes(coll) || !id)
        throw Error('Invalid document path');
      const uri = '/api/doc/' + encodeURIComponent(coll) + '/' + encodeURIComponent(id);
      return {
        onSnapshot: (cb, fail) => subscribe(coll, cb, fail, id),
        async set(doc) {
          writes++;
          try {
            await request(uri, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(doc),
            });
          } finally {
            writes--;
            if (!writes) queueMicrotask(() => refresh(true));
          }
        },
        async delete() {
          writes++;
          try {
            await request(uri, { method: 'DELETE' });
          } finally {
            writes--;
            if (!writes) queueMicrotask(() => refresh(true));
          }
        },
      };
    },
  };

  function saveFile({ filename, data }) {
    if (typeof filename !== 'string' || !filename) throw Error('Missing filename');
    const file = data instanceof Blob ? data : new Blob([data], {
      type: filename.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/[\\/]/g, '-');
    a.style.display = 'none';
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return Promise.resolve();
  }

  window.odhost = {
    use(name) {
      if (name === 'db') return Promise.resolve(db);
      if (name === 'downloads') return Promise.resolve({ save: saveFile });
      return Promise.resolve(null);
    },
  };

  window.addEventListener('focus', () => refresh(true));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(true); });
  setInterval(() => refresh(), 5000);

  /* Built-in zero-dependency offline PDF generator matching jsPDF */
  if (!window.jspdf) {
    const MM = 72 / 25.4, WIDTH = 210 * MM, HEIGHT = 297 * MM;
    const enc = new TextEncoder();
    const fmt = n => Number(n).toFixed(2).replace(/\.00$/, '');
    function sanitize(s) {
      return String(s == null ? '' : s).replace(/[^\x20-\x7e\xa0-\xff]/g, '?')
        .replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');
    }
    class Pdf {
      constructor() {
        this.pages = [[]]; this.page = 0; this.font = 'normal'; this.fontSize = 10;
        this.textRgb = [0, 0, 0]; this.fillRgb = [255, 255, 255]; this.drawRgb = [0, 0, 0]; this.strokeWidth = 0.2;
      }
      getNumberOfPages() { return this.pages.length; }
      setPage(i) { this.page = Math.max(0, Math.min(this.pages.length - 1, i - 1)); return this; }
      addPage() { this.pages.push([]); this.page = this.pages.length - 1; return this; }
      setFont(_name, variant = 'normal') { this.font = variant === 'bold' ? 'bold' : 'normal'; return this; }
      setFontSize(v) { this.fontSize = +v; return this; }
      setTextColor(...a) { this.textRgb = a.length === 1 ? [a[0], a[0], a[0]] : a; return this; }
      setDrawColor(...a) { this.drawRgb = a.length === 1 ? [a[0], a[0], a[0]] : a; return this; }
      setFillColor(...a) { this.fillRgb = a.length === 1 ? [a[0], a[0], a[0]] : a; return this; }
      setLineWidth(v) { this.strokeWidth = +v; return this; }
      rgb(a) { return a.map(n => fmt(n / 255)).join(' '); }
      text(t, x, y, opts = {}) {
        const arr = Array.isArray(t) ? t : [t];
        arr.forEach((line, i) => {
          line = String(line || '');
          let px = x * MM;
          const w = line.length * this.fontSize * (this.font === 'bold' ? .54 : .51);
          if (opts?.align === 'right') px -= w;
          if (opts?.align === 'center') px -= w / 2;
          const py = HEIGHT - (y * MM) - (i * this.fontSize * 1.15);
          this.pages[this.page].push(`BT /${this.font === 'bold' ? 'F2' : 'F1'} ${fmt(this.fontSize)} Tf ` +
            `${this.rgb(this.textRgb)} rg 1 0 0 1 ${fmt(px)} ${fmt(py)} Tm (${sanitize(line)}) Tj ET`);
        });
        return this;
      }
      line(x1, y1, x2, y2) {
        this.pages[this.page].push(`${this.rgb(this.drawRgb)} RG ${fmt(this.strokeWidth * MM)} w ` +
          `${fmt(x1 * MM)} ${fmt(HEIGHT - y1 * MM)} m ${fmt(x2 * MM)} ${fmt(HEIGHT - y2 * MM)} l S`);
        return this;
      }
      rect(x, y, w, h, style) {
        this.pages[this.page].push(`${this.rgb(this.fillRgb)} rg ${this.rgb(this.drawRgb)} RG ` +
          `${fmt(this.strokeWidth * MM)} w ${fmt(x * MM)} ${fmt(HEIGHT - (y + h) * MM)} ` +
          `${fmt(w * MM)} ${fmt(h * MM)} re ${style === 'F' ? 'f' : 'S'}`);
        return this;
      }
      addImage() { return this; }
      splitTextToSize(value, width) {
        const limit = Math.max(1, Math.floor(width * MM / (this.fontSize * .51)));
        const result = [];
        for (const para of String(value || '').split('\n')) {
          let line = '';
          for (const word of para.split(/\s+/)) {
            if (line && (line.length + 1 + word.length) > limit) { result.push(line); line = ''; }
            if (word.length > limit) {
              if (line) { result.push(line); line = ''; }
              for (let i = 0; i < word.length; i += limit) result.push(word.slice(i, i + limit));
            } else line += (line ? ' ' : '') + word;
          }
          result.push(line);
        }
        return result;
      }
      output(kind) {
        const objects = [null,
          '<< /Type /Catalog /Pages 2 0 R >>',
          '',
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
          '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
        const refs = [];
        this.pages.forEach(cmds => {
          const p = objects.length, ct = p + 1;
          refs.push(`${p} 0 R`);
          objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmt(WIDTH)} ${fmt(HEIGHT)}] ` +
            `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${ct} 0 R >>`);
          const stream = cmds.join('\n') + '\n';
          objects.push(`<< /Length ${enc.encode(stream).length} >>\nstream\n${stream}endstream`);
        });
        objects[2] = `<< /Type /Pages /Kids [${refs.join(' ')}] /Count ${refs.length} >>`;
        let blob = '%PDF-1.4\n%OraDesk Web Live\n';
        const offsets = [0];
        for (let i = 1; i < objects.length; i++) {
          offsets[i] = enc.encode(blob).length;
          blob += `${i} 0 obj\n${objects[i]}\nendobj\n`;
        }
        const xref = enc.encode(blob).length;
        blob += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
        for (let i = 1; i < objects.length; i++) blob += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
        blob += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
        const pdf = new Blob([enc.encode(blob)], { type: 'application/pdf' });
        return kind === 'blob' ? pdf : blob;
      }
    }
    window.jspdf = { jsPDF: Pdf };
  }
})();
