/* EDUCA+ — gráfico de linha e calendário (SVG puro, sem bibliotecas) */
(function () {
  function lineChart(points, opts) {
    opts = opts || {};
    const w = 640,
      h = 260,
      padL = 34,
      padB = 28,
      padT = 14,
      padR = 12;
    const max = opts.max || 10;
    const innerW = w - padL - padR;
    const innerH = h - padT - padB;
    const step = points.length > 1 ? innerW / (points.length - 1) : innerW;
    const x = (i) => padL + i * step;
    const y = (v) => padT + innerH - (v / max) * innerH;

    let grid = "";
    for (let g = 0; g <= 5; g++) {
      const v = (max / 5) * g;
      grid += `<line x1="${padL}" x2="${w - padR}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(129,160,255,.18)" />
        <text x="${padL - 8}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="currentColor" opacity=".6">${v.toFixed(0)}</text>`;
    }

    const line = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.media)}`).join(" ");
    const area = `${line} L${x(points.length - 1)},${padT + innerH} L${padL},${padT + innerH} Z`;
    const dots = points
      .map(
        (p, i) =>
          `<circle cx="${x(i)}" cy="${y(p.media)}" r="4" fill="#22d3ee" stroke="#0b1233" stroke-width="2"><title>${p.mes}: ${p.media}</title></circle>`,
      )
      .join("");
    const labels = points
      .map(
        (p, i) =>
          `<text x="${x(i)}" y="${h - 8}" text-anchor="middle" font-size="10" fill="currentColor" opacity=".6">${p.mes}</text>`,
      )
      .join("");

    return `<div class="chart-wrap"><svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Evolução das médias">
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(34,211,238,.45)" />
          <stop offset="100%" stop-color="rgba(34,211,238,0)" />
        </linearGradient>
      </defs>
      ${grid}
      <path d="${area}" fill="url(#chartFill)" />
      <path d="${line}" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linejoin="round" />
      ${dots}${labels}
    </svg></div>`;
  }

  const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  function calendar(state) {
    const { year, month, selected } = state; // month 0-11
    const eventos = Store.db.eventos || {};
    const first = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const pad = (n) => String(n).padStart(2, "0");
    let cells = "";
    for (let i = 0; i < first; i++) cells += `<button class="calendar__day" disabled></button>`;
    for (let d = 1; d <= days; d++) {
      const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
      const cls = [
        "calendar__day",
        eventos[iso] ? "has-event" : "",
        selected === iso ? "is-selected" : "",
      ].join(" ");
      cells += `<button type="button" class="${cls}" data-cal-day="${iso}" title="${eventos[iso] || ""}">${d}</button>`;
    }
    const evento = eventos[selected];
    return `<div class="calendar" data-calendar>
      <div class="calendar__head">
        <button type="button" class="btn btn--ghost btn--sm" data-cal-nav="-1">‹</button>
        <strong>${MESES[month]} ${year}</strong>
        <button type="button" class="btn btn--ghost btn--sm" data-cal-nav="1">›</button>
      </div>
      <div class="calendar__grid">
        <span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span>
        ${cells}
      </div>
      <p class="mt" style="font-size:.8rem;color:var(--text-dim)">
        ${selected ? `<strong style="color:var(--cyan)">${Store.date(selected)}</strong> — ${evento || "sem eventos registrados"}` : "Selecione um dia para ver os eventos."}
      </p>
    </div>`;
  }

  window.Charts = { lineChart, calendar, MESES };
})();
