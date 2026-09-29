/* EDUCA+ — dashboards por perfil */

(function () {

  const esc = (v) => UI.esc(v);

  const SLIDES = [
    {
      image: "./assets/educacao-futuro.png",
      icon: "school",
      title: "Juntos por uma educação ainda melhor!",
      text: "Tecnologia, inovação e pessoas construindo o futuro.",
    },
    {
      image: "./assets/indicadores.jpg",
      icon: "chart",
      title: "Acompanhe indicadores em tempo real",
      text: "Frequência, notas e ocorrências sempre atualizados.",
    },
    {
      image: "./assets/conexao.jpg",
      icon: "users",
      title: "Escola e família em conexão",
      text: "Comunicados e boletins digitais em um só lugar.",
    },
  ];

  const calState = {
    year: 2026,
    month: 8,
    selected: "2026-09-15",
  };

  /* =========================================================
     HERO
  ========================================================= */

  function hero(user, opts) {
    return `
      <section class="hero">

        <div class="hero__panel">

          <span class="badge">
            2º Semestre · Ano Letivo 2026
          </span>

          <h2>${esc(opts.title)}</h2>

          <p>${esc(opts.text)}</p>

          <div class="hero__actions">

            ${opts.actions
        .map(
          (a) => `
                  <button
                    class="btn ${a.cls || ""}"
                    data-route="${a.route}"
                  >
                    ${esc(a.label)}
                  </button>
                `
        )
        .join("")}

          </div>

          <div class="hero__stats">

            ${opts.stats
        .map(
          (s) => `
                  <div>
                    <small>${esc(s.label)}</small>
                    <strong>${esc(s.value)}</strong>
                  </div>
                `
        )
        .join("")}

          </div>

        </div>

        ${UI.carousel(SLIDES)}

      </section>
    `;
  }

  /* =========================================================
     ÚLTIMAS PRESENÇAS — UM ALUNO
  ========================================================= */

  function ultimasPresencas(alunoId) {

    const regs = Store.all("frequencia")
      .filter((f) => !alunoId || f.alunoId === alunoId)
      .slice()
      .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))
      .slice(0, 6);

    return `
      <section class="card">

        <h2 class="card__title">
          Últimas presenças
        </h2>

        <div class="list">

          ${regs.length
        ? regs
          .map((f) => {

            const cls =
              f.status === "Presente"
                ? "tag--ok"
                : f.status === "Falta"
                  ? "tag--bad"
                  : "tag--warn";

            return `
                      <div class="list-item">

                        <span class="list-item__day">
                          ${f.data ? f.data.slice(8) : "--"}
                        </span>

                        <div>

                          <strong>
                            ${esc(f.disciplina || "Frequência")}
                          </strong>

                          <small>
                            ${f.data ? Store.date(f.data) : ""}
                            ·
                            ${esc(Store.alunoNome(f.alunoId))}
                          </small>

                        </div>

                        <span class="tag ${cls}">
                          ${esc(f.status || "Registrado")}
                        </span>

                      </div>
                    `;
          })
          .join("")
        : '<p class="empty">Nenhum registro.</p>'
      }

        </div>

      </section>
    `;
  }

  /* =========================================================
     ÚLTIMAS PRESENÇAS — TODOS OS ALUNOS DO PROFESSOR
  ========================================================= */

  function ultimasPresencasTurmas(alunoIds) {

    const ids = Array.isArray(alunoIds) ? alunoIds : [];

    const regs = Store.all("frequencia")
      .filter((f) => ids.includes(f.alunoId))
      .slice()
      .sort((a, b) => String(b.data || "").localeCompare(String(a.data || "")))
      .slice(0, 8);

    return `
      <section class="card">

        <h2 class="card__title">
          Últimas presenças
        </h2>

        <div class="list">

          ${regs.length
        ? regs
          .map((f) => {

            const cls =
              f.status === "Presente"
                ? "tag--ok"
                : f.status === "Falta"
                  ? "tag--bad"
                  : "tag--warn";

            return `
                      <div class="list-item">

                        <span class="list-item__day">
                          ${f.data ? f.data.slice(8) : "--"}
                        </span>

                        <div>

                          <strong>
                            ${esc(Store.alunoNome(f.alunoId))}
                          </strong>

                          <small>
                            ${f.data ? Store.date(f.data) : ""}
                            ${f.disciplina
                ? " · " + esc(f.disciplina)
                : ""
              }
                          </small>

                        </div>

                        <span class="tag ${cls}">
                          ${esc(f.status || "Registrado")}
                        </span>

                      </div>
                    `;
          })
          .join("")
        : '<p class="empty">Nenhum registro de frequência encontrado.</p>'
      }

        </div>

      </section>
    `;
  }

  /* =========================================================
     DIRETOR
  ========================================================= */

  function diretor(user) {

    const turmas = Store.all("turmas");
    const alunos = Store.all("alunos");

    const professores = Store.all("usuarios").filter(
      (usuario) => usuario.role === "professor"
    );

    const e = {
      turmasAtivas: turmas.length,
      professores: professores.length,
      totalAlunos: alunos.length,
      aprovacoes: Store.db.escola?.aprovacoes ?? 0,
    };

    const destaques = alunos
      .map((a) => ({
        nome: a.nome,
        turma: Store.turmaNome(a.turmaId),
        media: Store.mediaGeralAluno(a.id),
      }))
      .sort((x, y) => y.media - x.media)
      .slice(0, 5);

    return `

      ${hero(user, {

      title: `Olá, Diretor ${user.firstName}! Bem-vindo ao Portal de Gestão`,

      text:
        "Acompanhe o desempenho da escola, monitore alunos, professores e tenha acesso a relatórios importantes.",

      actions: [
        {
          label: "Todas as turmas",
          route: "turmas",
        },
        {
          label: "Comunicados",
          route: "comunicados",
          cls: "btn--ghost",
        },
      ],

      stats: [
        {
          label: "Turmas",
          value: e.turmasAtivas,
        },
        {
          label: "Professores",
          value: e.professores,
        },
        {
          label: "Alunos",
          value: e.totalAlunos,
        },
      ],

    })}

      <div class="grid grid--4 mt">

        ${UI.metric(
      "Total de Alunos",
      e.totalAlunos,
      "+12 este mês",
      UI.icon("users")
    )}

        ${UI.metric(
      "Professores",
      e.professores,
      "+2 este mês",
      UI.icon("teacher")
    )}

        ${UI.metric(
      "Turmas Ativas",
      e.turmasAtivas,
      "+1 nova turma",
      UI.icon("school")
    )}

        ${UI.metric(
      "Aprovações",
      e.aprovacoes + "%",
      "+6% este mês",
      UI.icon("document")
    )}

      </div>

      <div class="grid grid--2 mt">

        <section class="card">

          <h2 class="card__title">
            Calendário Escolar
          </h2>

          <div data-calendar-slot>
            ${Charts.calendar(calState)}
          </div>

        </section>

        <section class="card">

          <h2 class="card__title">
            Desempenho da Escola

            <span class="tag tag--info">
              Últimos 8 meses
            </span>
          </h2>

          <p
            style="
              font-size:.8rem;
              color:var(--text-dim);
              margin-bottom:8px
            "
          >
            Evolução das notas médias dos alunos
          </p>

          ${Charts.lineChart(Store.db.desempenho)}

        </section>

      </div>

      <div class="grid grid--2 mt">

        ${UI.comunicadosCard("Todos")}

        <section class="card">

          <h2 class="card__title">
            ${UI.icon("target")}
            Notas em Destaque
          </h2>

          <div class="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Aluno</th>
                  <th>Turma</th>
                  <th>Média</th>
                </tr>
              </thead>

              <tbody>

                ${destaques
        .map(
          (d) => `
                      <tr>

                        <td>
                          ${esc(d.nome)}
                        </td>

                        <td>
                          ${esc(d.turma)}
                        </td>

                        <td>
                          <strong style="color:var(--cyan)">
                            ${d.media.toFixed(1)}
                          </strong>
                        </td>

                      </tr>
                    `
        )
        .join("")}

              </tbody>

            </table>

          </div>

        </section>

      </div>
    `;
  }

  /* =========================================================
     COORDENADOR
  ========================================================= */

  function coordenador(user) {

    const baixoRendimento = Store.all("alunos")
      .filter((a) => Store.mediaGeralAluno(a.id) < 7)
      .length;

    const faltas = Store.all("frequencia")
      .filter((f) => f.status === "Falta")
      .length;

    const pendentes = Store.all("atividades")
      .filter((a) => a.status !== "Entregue")
      .length;

    return `

      ${hero(user, {

      title:
        `Olá, ${user.firstName}. Aqui está o resumo de hoje.`,

      text:
        "Acompanhe notas, frequência, atividades e comunicados.",

      actions: [
        {
          label: "Todas as turmas",
          route: "turmas",
        },
        {
          label: "Comunicados",
          route: "comunicados",
          cls: "btn--ghost",
        },
      ],

      stats: [
        {
          label: "Turmas",
          value: Store.all("turmas").length,
        },
        {
          label: "Alunos",
          value: Store.all("alunos").length,
        },
        {
          label: "Atividades",
          value: Store.all("atividades").length,
        },
      ],

    })}

      <div class="grid grid--4 mt">

        ${UI.metric(
      "Frequência Média",
      Store.frequenciaGeral() + "%",
      "todas as turmas",
      UI.icon("signal")
    )}

        ${UI.metric(
      "Faltas registradas",
      faltas,
      "no período",
      UI.icon("ban")
    )}

        ${UI.metric(
      "Baixo rendimento",
      baixoRendimento,
      "alunos",
      UI.icon("trendDown")
    )}

        ${UI.metric(
      "Atividades pendentes",
      pendentes,
      "até 18/09, às 17:00",
      UI.icon("folder")
    )}

      </div>

      <div class="grid grid--2 mt">

        <section class="card">

          <h2 class="card__title">

            Turmas

            <button
              class="btn btn--sm btn--outline"
              data-route="turmas"
            >
              Gerenciar
            </button>

          </h2>

          <div class="list">

            ${Store.all("turmas")
        .map(
          (t) => `
                  <div class="list-item">

                    <span class="list-item__day">
                      ${Store.alunosDaTurma(t.id).length}
                    </span>

                    <div>

                      <strong>
                        ${esc(t.nome)}
                      </strong>

                      <small>
                        ${esc(t.turno)} ·
                        ${esc(t.professor)}
                      </small>

                    </div>

                    <span class="tag tag--info">
                      ${Store.frequenciaTurma(t.id)}%
                    </span>

                  </div>
                `
        )
        .join("")}

          </div>

        </section>

        ${UI.comunicadosPara ? UI.comunicadosCard("Professores") : ""}

      </div>

      <section class="card mt">

        <h2 class="card__title">

          Alunos — visão geral

          <button
            class="btn btn--sm btn--outline"
            data-route="alunos"
          >
            Ver todos
          </button>

        </h2>

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Aluno</th>
                <th>Turma</th>
                <th>Média</th>
                <th>Frequência</th>
                <th>Situação</th>
                <th></th>
              </tr>

            </thead>

            <tbody>

              ${Store.all("alunos")
        .map((a) => {

          const m = Store.mediaGeralAluno(a.id);
          const s = Store.situacaoNota(m);

          return `
                    <tr>

                      <td>
                        ${esc(a.nome)}
                      </td>

                      <td>
                        ${esc(Store.turmaNome(a.turmaId))}
                      </td>

                      <td>
                        ${m.toFixed(1)}
                      </td>

                      <td>
                        ${Store.frequenciaAluno(a.id)}%
                      </td>

                      <td>
                        <span class="tag ${s.cls}">
                          ${s.label}
                        </span>
                      </td>

                      <td>

                        <button
                          class="btn btn--sm btn--ghost"
                          data-open-aluno="${a.id}"
                        >
                          Boletim
                        </button>

                      </td>

                    </tr>
                  `;
        })
        .join("")}

            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  /* =========================================================
     PROFESSOR — VERSÃO FINAL
  ========================================================= */

  function professor(user) {

    /*
      ---------------------------------------------------------
      1. TURMAS DO PROFESSOR
      ---------------------------------------------------------
    */

    const turmaIds = Array.isArray(user.turmaIds)
      ? user.turmaIds
      : [];

    /*
      ---------------------------------------------------------
      2. ALUNOS DAS TURMAS DO PROFESSOR
      ---------------------------------------------------------
    */

    const alunosProfessor = Store.all("alunos")
      .filter((aluno) => turmaIds.includes(aluno.turmaId));

    const alunoIds = alunosProfessor.map(
      (aluno) => aluno.id
    );

    /*
      ---------------------------------------------------------
      3. FREQUÊNCIA DAS TURMAS
      ---------------------------------------------------------
    */

    const frequencias = turmaIds
      .map((turmaId) =>
        Store.frequenciaTurma(turmaId)
      )
      .filter(
        (valor) =>
          typeof valor === "number" &&
          !Number.isNaN(valor)
      );

    const frequenciaMedia = frequencias.length
      ? Math.round(
        frequencias.reduce(
          (total, valor) => total + valor,
          0
        ) / frequencias.length
      )
      : 0;

    /*
      ---------------------------------------------------------
      4. NOTAS DOS ALUNOS DO PROFESSOR
      ---------------------------------------------------------
    */

    const notasProfessor = Store.all("notas")
      .filter((nota) =>
        alunoIds.includes(nota.alunoId)
      );

    /*
      Pendência = nota que ainda não possui AV.
    */

    const pendenciaNotas = notasProfessor
      .filter((nota) => !nota.av)
      .length;

    /*
      ---------------------------------------------------------
      5. AULAS DAS TURMAS DO PROFESSOR
      ---------------------------------------------------------
    */

    const aulasProfessor = Store.all("aulas")
      .filter((aula) =>
        turmaIds.includes(aula.turmaId)
      )
      .slice()
      .sort((a, b) =>
        String(b.data || "").localeCompare(
          String(a.data || "")
        )
      );

    const conteudos = aulasProfessor.length;

    /*
      ---------------------------------------------------------
      6. AULAS DE HOJE
      ---------------------------------------------------------
    */

    const hoje = new Date()
      .toISOString()
      .slice(0, 10);

    const aulasHoje = aulasProfessor.filter(
      (aula) => aula.data === hoje
    ).length;

    /*
      ---------------------------------------------------------
      7. ATIVIDADES DAS TURMAS DO PROFESSOR
      ---------------------------------------------------------
    */

    const atividadesProfessor = Store.all("atividades")
      .filter((atividade) =>
        turmaIds.includes(atividade.turmaId)
      )
      .slice()
      .sort((a, b) =>
        String(b.entrega || "").localeCompare(
          String(a.entrega || "")
        )
      );

    const atividadesPendentes =
      atividadesProfessor.filter(
        (atividade) =>
          atividade.status !== "Entregue"
      ).length;

    /*
      ---------------------------------------------------------
      8. NOMES DAS TURMAS
      ---------------------------------------------------------
    */

    const nomesTurmas = turmaIds
      .map((turmaId) =>
        Store.turmaNome(turmaId)
      )
      .filter(Boolean);

    const descricaoTurmas = nomesTurmas.length
      ? nomesTurmas.join(", ")
      : "Nenhuma turma vinculada";

    /*
      ---------------------------------------------------------
      9. DASHBOARD
      ---------------------------------------------------------
    */

    return `

      ${hero(user, {

      title:
        `Olá, ${user.firstName}. Aqui está o resumo de hoje.`,

      text:
        "Acompanhe suas turmas, frequência, aulas, atividades e comunicados.",

      actions: [
        {
          label: "Registrar presença",
          route: "frequencia",
        },
        {
          label: "Lançar notas",
          route: "notas",
          cls: "btn--ghost",
        },
      ],

      stats: [

        {
          label: "Turmas",
          value: turmaIds.length,
        },

        {
          label: "Alunos",
          value: alunosProfessor.length,
        },

        {
          label: "Aulas hoje",
          value: aulasHoje,
        },

      ],

    })}

      <!-- ===================================================
           MÉTRICAS
      ==================================================== -->

      <div class="grid grid--4 mt">

        ${UI.metric(
      "Frequência média",
      frequenciaMedia + "%",
      descricaoTurmas,
      UI.icon("signal")
    )}

        ${UI.metric(
      "Pendência de notas",
      pendenciaNotas,
      "alunos das suas turmas",
      UI.icon("target")
    )}

        ${UI.metric(
      "Conteúdos lançados",
      conteudos,
      "aulas registradas",
      UI.icon("book")
    )}

        ${UI.metric(
      "Atividades pendentes",
      atividadesPendentes,
      "das suas turmas",
      UI.icon("folder")
    )}

      </div>

      <!-- ===================================================
           TURMAS + COMUNICADOS
      ==================================================== -->

      <div class="grid grid--2 mt">

        <section class="card">

          <h2 class="card__title">

            Suas turmas

            <button
              class="btn btn--sm btn--outline"
              data-route="frequencia"
            >
              Ver turmas
            </button>

          </h2>

          <div class="list">

            ${turmaIds.length

        ? turmaIds
          .map((turmaId) => {

            const turma =
              Store.find(
                "turmas",
                turmaId
              );

            const alunos =
              Store.alunosDaTurma(
                turmaId
              );

            return `

                        <div class="list-item">

                          <span class="list-item__day">
                            ${alunos.length}
                          </span>

                          <div>

                            <strong>
                              ${esc(
              Store.turmaNome(
                turmaId
              )
            )}
                            </strong>

                            <small>

                              ${turma
                ? esc(
                  turma.turno ||
                  ""
                )
                : ""
              }

                              ${turma &&
                turma.professor
                ? " · " +
                esc(
                  turma.professor
                )
                : ""
              }

                            </small>

                          </div>

                          <span class="tag tag--info">

                            ${Store.frequenciaTurma(
                turmaId
              )}%

                          </span>

                        </div>

                      `;

          })
          .join("")

        : `
                    <p class="empty">
                      Nenhuma turma vinculada ao seu perfil.
                    </p>
                  `
      }

          </div>

        </section>

        ${UI.comunicadosCard("Professores")}

      </div>

      <!-- ===================================================
           ALUNOS
      ==================================================== -->

      <section class="card mt">

        <h2 class="card__title">

          Alunos das minhas turmas

          <button
            class="btn btn--sm btn--outline"
            data-route="alunos"
          >
            Ver todos
          </button>

        </h2>

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>Aluno</th>
                <th>Turma</th>
                <th>Média</th>
                <th>Frequência</th>
                <th>Situação</th>
                <th></th>

              </tr>

            </thead>

            <tbody>

              ${alunosProfessor.length

        ? alunosProfessor
          .map((aluno) => {

            const media =
              Store.mediaGeralAluno(
                aluno.id
              );

            const situacao =
              Store.situacaoNota(
                media
              );

            return `

                          <tr>

                            <td>
                              ${esc(aluno.nome)}
                            </td>

                            <td>
                              ${esc(
              Store.turmaNome(
                aluno.turmaId
              )
            )}
                            </td>

                            <td>
                              ${media.toFixed(1)}
                            </td>

                            <td>
                              ${Store.frequenciaAluno(
              aluno.id
            )}%
                            </td>

                            <td>

                              <span
                                class="tag ${situacao.cls}"
                              >
                                ${situacao.label}
                              </span>

                            </td>

                            <td>

                              <button
                                class="btn btn--sm btn--ghost"
                                data-open-aluno="${aluno.id}"
                              >
                                Boletim
                              </button>

                            </td>

                          </tr>

                        `;

          })
          .join("")

        : `

                      <tr>

                        <td colspan="6">

                          <p class="empty">
                            Nenhum aluno encontrado nas suas turmas.
                          </p>

                        </td>

                      </tr>

                    `
      }

            </tbody>

          </table>

        </div>

      </section>

      <!-- ===================================================
           ATIVIDADES DAS TURMAS
      ==================================================== -->

      <section class="card mt">

        <h2 class="card__title">

          Atividades das minhas turmas

          <button
            class="btn btn--sm btn--outline"
            data-route="atividades"
          >
            Gerenciar
          </button>

        </h2>

        <div class="list">

          ${atividadesProfessor.length

        ? atividadesProfessor
          .slice(0, 6)
          .map((atividade) => {

            const status =
              atividade.status ||
              "Pendente";

            const statusClass =
              status === "Entregue"
                ? "tag--ok"
                : status === "Atrasado"
                  ? "tag--bad"
                  : "tag--warn";

            return `

                      <div class="list-item">

                        <span class="list-item__day">

                          ${atividade.entrega
                ? atividade.entrega.slice(
                  8
                )
                : "--"
              }

                        </span>

                        <div>

                          <strong>
                            ${esc(
                atividade.titulo ||
                "Atividade"
              )}
                          </strong>

                          <small>

                            ${atividade.disciplina
                ? esc(
                  atividade.disciplina
                )
                : "Atividade"
              }

                            ${atividade.turmaId
                ? " · " +
                esc(
                  Store.turmaNome(
                    atividade.turmaId
                  )
                )
                : ""
              }

                            ${atividade.entrega
                ? " · Entrega: " +
                Store.date(
                  atividade.entrega
                )
                : ""
              }

                          </small>

                        </div>

                        <span
                          class="tag ${statusClass}"
                        >
                          ${esc(status)}
                        </span>

                      </div>

                    `;

          })
          .join("")

        : `
                  <p class="empty">
                    Nenhuma atividade registrada nas suas turmas.
                  </p>
                `
      }

        </div>

      </section>

      <!-- ===================================================
           ÚLTIMAS AULAS
      ==================================================== -->

      <section class="card mt">

        <h2 class="card__title">

          Últimas aulas registradas

          <button
            class="btn btn--sm btn--outline"
            data-route="conteudo"
          >
            Nova aula
          </button>

        </h2>

        <div class="list">

          ${aulasProfessor.length

        ? aulasProfessor
          .slice(0, 5)
          .map((aula) => {

            const status =
              aula.status ||
              "Registrada";

            const statusClass =
              status === "Lançado"
                ? "tag--ok"
                : "tag--bad";

            return `

                      <div class="list-item">

                        <span class="list-item__day">

                          ${aula.data
                ? aula.data.slice(8)
                : "--"
              }

                        </span>

                        <div>

                          <strong>
                            ${esc(
                aula.disciplina ||
                "Aula"
              )}
                          </strong>

                          <small>

                            ${aula.data
                ? Store.date(
                  aula.data
                )
                : ""
              }

                            ${aula.turmaId
                ? " · " +
                esc(
                  Store.turmaNome(
                    aula.turmaId
                  )
                )
                : ""
              }

                            ${aula.conteudo
                ? " · " +
                esc(
                  aula.conteudo
                )
                : ""
              }

                          </small>

                        </div>

                        <span
                          class="tag ${statusClass}"
                        >
                          ${esc(status)}
                        </span>

                      </div>

                    `;

          })
          .join("")

        : `
                  <p class="empty">
                    Nenhuma aula registrada.
                  </p>
                `
      }

        </div>

      </section>

      <!-- ===================================================
           FREQUÊNCIA
      ==================================================== -->

      ${ultimasPresencasTurmas(alunoIds)}

    `;
  }

  /* =========================================================
     ALUNO
  ========================================================= */

  function aluno(user) {

    const id = user.alunoId;

    const alunoAtual =
      Store.find("alunos", id);

    const pendentes =
      Store.all("atividades")
        .filter(
          (a) => a.status !== "Entregue"
        )
        .length;

    return `

      ${hero(user, {

      title:
        `Olá, ${user.firstName}. Aqui está o resumo de hoje.`,

      text:
        "Acompanhe notas, frequência, atividades e comunicados.",

      actions: [
        {
          label: "Ver minhas notas",
          route: "notas",
        },
        {
          label: "Comunicados",
          route: "comunicados",
          cls: "btn--ghost",
        },
      ],

      stats: [

        {
          label: "Turma",
          value:
            alunoAtual
              ? Store.turmaNome(
                alunoAtual.turmaId
              )
              : "-",
        },

        {
          label: "Disciplinas",
          value:
            Store.all("notas")
              .filter(
                (n) => n.alunoId === id
              )
              .length,
        },

        {
          label: "Atividades",
          value: pendentes,
        },

      ],

    })}

      <div class="grid grid--4 mt">

        ${UI.metric(
      "Frequência",
      Store.frequenciaAluno(id) + "%",
      alunoAtual
        ? Store.turmaNome(
          alunoAtual.turmaId
        )
        : "-",
      UI.icon("signal")
    )}

        ${UI.metric(
      "Faltas",
      Store.faltasAluno(id),
      "no período",
      UI.icon("ban")
    )}

        ${UI.metric(
      "Média geral",
      Store.mediaGeralAluno(id).toFixed(1),
      "cálculo automático",
      UI.icon("chart")
    )}

        ${UI.metric(
      "Atividades pendentes",
      pendentes,
      "até 18/09, às 17:00",
      UI.icon("folder")
    )}

      </div>

      <div class="grid grid--2 mt">

        ${ultimasPresencas(id)}

        ${UI.comunicadosCard("Alunos")}

      </div>

    `;
  }

  /* =========================================================
     RESPONSÁVEL — MÚLTIPLOS FILHOS
  ========================================================= */

  function alunosDoResponsavel(user) {
    const ids = Array.isArray(user.alunoIds)
      ? user.alunoIds
      : user.alunoId
        ? [user.alunoId]
        : [];

    return ids
      .map((id) => Store.find("alunos", id))
      .filter(Boolean);
  }

  function alunoSelecionadoResponsavel(user) {
    const alunos = alunosDoResponsavel(user);

    if (!alunos.length) {
      return null;
    }

    const ids = alunos.map((aluno) => aluno.id);

    // Se já existe um filho selecionado e ele pertence
    // ao responsável, mantém esse filho.
    if (
      user.alunoSelecionadoId &&
      ids.includes(user.alunoSelecionadoId)
    ) {
      return user.alunoSelecionadoId;
    }

    // Compatibilidade com o formato antigo.
    if (
      user.alunoId &&
      ids.includes(user.alunoId)
    ) {
      return user.alunoId;
    }

    // Primeiro filho como padrão.
    return alunos[0].id;
  }

  /* =========================================================
     RESPONSÁVEL
  ========================================================= */

  function responsavel(user) {

    const filhos = alunosDoResponsavel(user);

    const id = alunoSelecionadoResponsavel(user);

    const alunoAtual = id
      ? Store.find("alunos", id)
      : null;

    const boletos = id
      ? Store.all("boletos").filter(
        (b) => b.alunoId === id
      )
      : [];

    const notasAluno = id
      ? Store.all("notas").filter(
        (n) => n.alunoId === id
      )
      : [];

    return `
    ${hero(user, {
      title:
        `Olá, ${user.firstName}. Aqui está o resumo do seu filho!`,

      text:
        "Acompanhe notas, frequência, atividades e comunicados.",

      actions: [
        {
          label: "Ver notas",
          route: "notas",
        },
        {
          label: "Comunicados",
          route: "comunicados",
          cls: "btn--ghost",
        },
      ],

      stats: [
        {
          label: "Filhos",
          value: filhos.length,
        },

        {
          label: "Disciplinas",
          value: notasAluno.length,
        },

        {
          label: "Boletos",
          value: boletos.length,
        },
      ],
    })}

    <!-- ===================================================
         SELEÇÃO DO FILHO
    ==================================================== -->

    ${filhos.length > 1
        ? `
          <section class="card mt">
            <h2 class="card__title">
              Meus filhos
            </h2>

            <div class="field">
              <label for="responsavel-filho">
                Selecione o filho
              </label>

              <select
                id="responsavel-filho"
                data-responsavel-filho
              >
                ${filhos
          .map(
            (filho) => `
                      <option
                        value="${esc(filho.id)}"
                        ${filho.id === id
                ? "selected"
                : ""
              }
                      >
                        ${esc(filho.nome)}
                        ${filho.turmaId
                ? " — " +
                esc(
                  Store.turmaNome(
                    filho.turmaId
                  )
                )
                : ""
              }
                      </option>
                    `
          )
          .join("")}
              </select>
            </div>
          </section>
        `
        : ""
      }

    <div class="grid grid--4 mt">

      ${UI.metric(
        "Frequência",

        id
          ? Store.frequenciaAluno(id) + "%"
          : "0%",

        alunoAtual
          ? Store.turmaNome(
            alunoAtual.turmaId
          )
          : "-",

        UI.icon("signal")
      )}

      ${UI.metric(
        "Faltas",

        id
          ? Store.faltasAluno(id)
          : 0,

        "no período",

        UI.icon("ban")
      )}

      ${UI.metric(
        "Média geral do(a) aluno(a)",

        id
          ? Store.mediaGeralAluno(id).toFixed(1)
          : "0.0",

        "cálculo automático",

        UI.icon("chart")
      )}

      ${UI.metric(
        "Boletos",

        boletos.length,

        "histórico financeiro",

        UI.icon("document")
      )}

    </div>

    <div class="grid grid--2 mt">

      <section class="card">

        <h2 class="card__title">

          Últimos boletos

          <button
            class="btn btn--sm btn--outline"
            data-route="boletos"
          >
            Ver todos
          </button>

        </h2>

        <div class="list">

          ${boletos.length
        ? boletos
          .map(
            (b) => `
                      <div class="list-item">

                        <span class="dot"></span>

                        <div>

                          <strong>
                            ${esc(
              b.descricao
            )}
                          </strong>

                          <small>
                            ${Store.money(b.valor)}
                            · vence
                            ${Store.date(
              b.vencimento
            )}
                          </small>

                        </div>

                        <span
                          class="tag ${b.status === "Pago"
                ? "tag--ok"
                : "tag--bad"
              }"
                        >
                          ${esc(b.status)}
                        </span>

                      </div>
                    `
          )
          .join("")
        : `
                  <p class="empty">
                    Nenhum boleto encontrado para este aluno.
                  </p>
                `
      }

        </div>

      </section>

      ${UI.comunicadosCard("Responsáveis")}

    </div>
  `;
  }

  /* =========================================================
     DASHBOARDS
  ========================================================= */

  const Dashboards = {

    render(user) {

      if (user.role === "diretor") {
        return diretor(user);
      }

      if (user.role === "coordenador") {
        return coordenador(user);
      }

      if (user.role === "professor") {
        return professor(user);
      }

      if (user.role === "responsavel") {
        return responsavel(user);
      }

      return aluno(user);
    },

    /* =======================================================
       EVENTOS DO DASHBOARD
    ======================================================= */

    bind(root, user) {

      UI.bindCarousel(root);

      /* -----------------------------------------------
         BOTÕES DE ROTA
      ------------------------------------------------ */

      root
        .querySelectorAll("[data-route]")
        .forEach((btn) => {

          btn.onclick = () => {
            UI.go(btn.dataset.route);
          };

        });

      /* -----------------------------------------------
         BOTÕES DE BOLETIM
      ------------------------------------------------ */

      root
        .querySelectorAll("[data-open-aluno]")
        .forEach((btn) => {

          btn.onclick = () => {
            UI.go(
              "aluno/" +
              btn.dataset.openAluno
            );
          };

        });

      /* -----------------------------------------------
 SELEÇÃO DO FILHO — RESPONSÁVEL
------------------------------------------------ */

      const seletorFilho = root.querySelector(
        "[data-responsavel-filho]"
      );

      if (seletorFilho) {

        seletorFilho.onchange = () => {

          const novoAlunoId =
            seletorFilho.value;

          const filhos = alunosDoResponsavel(user);

          const permitido = filhos.some(
            (filho) => filho.id === novoAlunoId
          );

          // Segurança: só permite selecionar
          // um dos filhos vinculados ao responsável.
          if (!permitido) {
            return;
          }

          const sessaoAtual =
            Store.session() || user;

          Store.session({
            ...sessaoAtual,

            alunoId: novoAlunoId,

            alunoSelecionadoId:
              novoAlunoId,

            alunoIds:
              Array.isArray(sessaoAtual.alunoIds)
                ? sessaoAtual.alunoIds
                : filhos.map(
                  (filho) => filho.id
                ),
          });

          UI.render();
        };
      }

      /* -----------------------------------------------
         CALENDÁRIO
      ------------------------------------------------ */

      const slot =
        root.querySelector(
          "[data-calendar-slot]"
        );

      if (slot) {

        const refresh = () => {

          slot.innerHTML =
            Charts.calendar(calState);

          wire();

        };

        const wire = () => {

          slot
            .querySelectorAll(
              "[data-cal-day]"
            )
            .forEach((d) => {

              d.onclick = () => {

                calState.selected =
                  d.dataset.calDay;

                refresh();

              };

            });

          slot
            .querySelectorAll(
              "[data-cal-nav]"
            )
            .forEach((b) => {

              b.onclick = () => {

                calState.month += Number(
                  b.dataset.calNav
                );

                if (
                  calState.month < 0
                ) {

                  calState.month = 11;
                  calState.year--;

                }

                if (
                  calState.month > 11
                ) {

                  calState.month = 0;
                  calState.year++;

                }

                refresh();

              };

            });

        };

        wire();

      }

    },

  };

  window.Dashboards = Dashboards;

})();