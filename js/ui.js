/* EDUCA+ — UI: tema, navegação, roteador, modal e toasts */
(function () {
  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const NAV = {
    diretor: ["painel", "turmas", "alunos", "notas", "ocorrencias", "comunicados"],
    coordenador: ["painel", "alunos", "turmas", "frequencia", "notas", "ocorrencias", "comunicados"],
    professor: ["painel", "frequencia", "conteudo", "notas", "atividades", "ocorrencias", "comunicados"],
    aluno: ["painel", "notas", "frequencia", "atividades", "ocorrencias", "comunicados"],
    responsavel: ["painel", "notas", "frequencia", "atividades", "boletos", "comunicados"],
  };

  const LABELS = {
    painel: "Painel",
    alunos: "Alunos",
    turmas: "Turmas",
    frequencia: "Frequência",
    conteudo: "Conteúdo de Aula",
    notas: "Notas",
    atividades: "Atividades",
    ocorrencias: "Ocorrências",
    comunicados: "Comunicados",
    boletos: "Boletos",
  };

  const UI = {
    esc,
    LABELS,

    icon(name, className = "icon") {
      const paths = {
        sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
        moon: '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>',
        close: '<path d="m6 6 12 12M18 6 6 18"/>',
        eye: '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/>',
        user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
        users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
        teacher: '<path d="M3 7.5 12 3l9 4.5-9 4.5-9-4.5Z"/><path d="M6 10.5V16c2.8 2.4 9.2 2.4 12 0v-5.5M21 8v6"/>',
        school: '<path d="m3 10 9-6 9 6v10H3V10Z"/><path d="M7 20v-6h10v6M9 10h.01M12 10h.01M15 10h.01"/>',
        document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
        chart: '<path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 5-6"/>',
        signal: '<path d="M2 12h4l2 7 4-14 2 7h8"/>',
        ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
        trendDown: '<path d="m3 6 6 6 4-4 8 8M21 16v4h-4"/>',
        folder: '<path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
        target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
        book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z"/><path d="M4 19h16"/>',
        check: '<path d="m4 12 5 5L20 6"/>',
        phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.8.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1Z"/>',
        clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M8 10h8M8 14h6"/>',
        chevronLeft: '<path d="m15 18-6-6 6-6"/>',
        chevronRight: '<path d="m9 18 6-6-6-6"/>',
        settings: '<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 1 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.3a2 2 0 1 1-4 0v-.2A2 2 0 0 0 5.8 18l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A2 2 0 0 0 1.6 12h-.1a2 2 0 1 1 0-4h.2A2 2 0 0 0 3 4.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A2 2 0 0 0 9.2.5V.3a2 2 0 1 1 4 0v.2A2 2 0 0 0 16.6 2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A2 2 0 0 0 20.8 8h.2a2 2 0 1 1 0 4h-.2a2 2 0 0 0-1.4 3Z"/>',
        shield: '<path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
        logout: '<path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/>',
      };
      return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${paths[name] || paths.document}</svg>`;
    },

    /* ---- tema ---- */
    applyTheme(theme) {
      document.documentElement.dataset.theme = theme;
      Store.theme(theme);
    },
    initTheme() {
      this.applyTheme(Store.theme());
      document.getElementById("theme-toggle").addEventListener("click", () => {
        this.applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
      });
    },
    hydrateIcons(root = document) {
      root.querySelectorAll("[data-icon]").forEach((el) => {
        el.innerHTML = this.icon(el.dataset.icon);
      });
    },

    /* ---- toasts ---- */
    toast(message, kind) {
      const el = document.createElement("div");
      el.className = "toast toast--" + (kind || "ok");
      el.textContent = message;
      document.getElementById("toasts").append(el);
      setTimeout(() => el.remove(), 3200);
    },

    /* ---- modal ---- */
    openModal(title, html) {
      document.getElementById("modal-title").textContent = title;
      document.getElementById("modal-body").innerHTML = html;
      document.getElementById("modal-root").hidden = false;
      return document.getElementById("modal-body");
    },
    closeModal() {
      document.getElementById("modal-root").hidden = true;
      document.getElementById("modal-body").innerHTML = "";
    },
    confirm(message, onYes) {
      const body = this.openModal("Confirmar ação", `
        <p style="font-size:.9rem">${esc(message)}</p>
        <div class="form-actions mt">
          <button class="btn btn--outline" data-cancel>Cancelar</button>
          <button class="btn btn--danger" data-yes>Confirmar</button>
        </div>`);
      body.querySelector("[data-cancel]").onclick = () => this.closeModal();
      body.querySelector("[data-yes]").onclick = () => {
        this.closeModal();
        onYes();
      };
    },

    /* ---- navegação ---- */
    renderShell(user) {
      document.getElementById("auth-screen").hidden = true;
      document.getElementById("app").hidden = false;
      document.getElementById("user-name").textContent = user.name;
      document.getElementById("user-role").textContent = user.roleLabel;
      const nav = document.getElementById("main-nav");
      nav.innerHTML = (NAV[user.role] || NAV.aluno)
        .map((r) => `<button class="nav-link" data-route="${r}">${LABELS[r]}</button>`)
        .join("");
    },
    setActiveNav(route) {
      document.querySelectorAll(".nav-link").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.route === route);
      });
    },
    go(hash) {
      location.hash = "#/" + hash;
    },
    render() {
      const user = Store.session();
      if (!user) return;
      const parts = (location.hash.replace(/^#\/?/, "") || "painel").split("/");
      const route = parts[0];
      const allowed = NAV[user.role] || NAV.aluno;
      const view = document.getElementById("view");
      document.getElementById("main-nav").classList.remove("is-open");

      if (route === "conta") {
        this.setActiveNav("");
        view.innerHTML = Modules.conta(user);
        Modules.bind(view, user);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (route === "aluno" && parts[1]) {
        this.setActiveNav("alunos");
        view.innerHTML = Modules.perfilAluno(parts[1], user);
        Modules.bind(view, user);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const target = allowed.includes(route) ? route : "painel";
      this.setActiveNav(target);
      view.innerHTML =
        target === "painel" ? Dashboards.render(user) : Modules.render(target, user);
      Dashboards.bind(view, user);
      Modules.bind(view, user);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    initShellEvents() {
      this.hydrateIcons();
      document.getElementById("main-nav").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-route]");
        if (btn) this.go(btn.dataset.route);
      });
      document.getElementById("nav-toggle").addEventListener("click", () => {
        document.getElementById("main-nav").classList.toggle("is-open");
      });
      document.getElementById("modal-root").addEventListener("click", (e) => {
        if (e.target.closest("[data-close-modal]")) this.closeModal();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.closeModal();
      });
      window.addEventListener("hashchange", () => this.render());
    },

    /* ---- blocos reutilizáveis ---- */
    metric(title, value, foot, icon) {
      return `<article class="metric">
        <div class="metric__head"><h3>${esc(title)}</h3><span class="metric__icon">${icon || ""}</span></div>
        <p class="metric__value">${esc(value)}</p>
        <p class="metric__foot">${esc(foot || "")}</p>
      </article>`;
    },
    pageHead(title, subtitle, actions) {
      return `<header class="page-head">
        <div><h1>${esc(title)}</h1><p>${esc(subtitle || "")}</p></div>
        <div class="row-actions">${actions || ""}</div>
      </header>`;
    },
    comunicadosCard(publico) {
      const itens = Store.comunicadosPara(publico);
      return `<section class="card">
        <h2 class="card__title">Comunicados</h2>
        <div class="list">${
          itens.length
            ? itens
                .map(
                  (c) => `<div class="list-item"><span class="dot"></span>
            <div><strong>${esc(c.titulo)}</strong><small>${esc(c.autor)} · ${Store.date(c.data)} · para ${esc(c.publico.toLowerCase())}</small></div>
            <span class="tag tag--purple">${esc(c.publico)}</span></div>`,
                )
                .join("")
            : '<p class="empty">Nenhum comunicado.</p>'
        }</div>
      </section>`;
    },
    carousel(slides) {
      return `<div class="carousel" data-carousel>
        ${slides
          .map(
            (s, i) => `<div class="carousel__slide ${i === 0 ? "is-active" : ""}">
            ${s.image
  ? `<img class="carousel__image" src="${s.image}" alt="">`
  : `<span class="carousel__icon">${s.icon}</span>`
}
            <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div>`,
          )
          .join("")}
        <button class="carousel__nav carousel__nav--prev" type="button" data-carousel-nav="-1" aria-label="Anterior">${this.icon("chevronLeft")}</button>
        <button class="carousel__nav carousel__nav--next" type="button" data-carousel-nav="1" aria-label="Próximo">${this.icon("chevronRight")}</button>
        <div class="carousel__dots">${slides.map((s, i) => `<span class="${i === 0 ? "is-active" : ""}"></span>`).join("")}</div>
      </div>`;
    },
    bindCarousel(root) {
      root.querySelectorAll("[data-carousel]").forEach((car) => {
        const slides = [...car.querySelectorAll(".carousel__slide")];
        const dots = [...car.querySelectorAll(".carousel__dots span")];
        let idx = 0;
        const show = (n) => {
          idx = (n + slides.length) % slides.length;
          slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
          dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
        };
        car.querySelectorAll("[data-carousel-nav]").forEach((btn) => {
          btn.onclick = () => show(idx + Number(btn.dataset.carouselNav));
        });
        const timer = setInterval(() => show(idx + 1), 6000);
        car.addEventListener("mouseenter", () => clearInterval(timer));
      });
    },
    selectOptions(items, valueKey, labelKey, selected) {
      return items
        .map(
          (i) =>
            `<option value="${esc(i[valueKey])}" ${i[valueKey] === selected ? "selected" : ""}>${esc(i[labelKey])}</option>`,
        )
        .join("");
    },
  };

  window.UI = UI;
})();
