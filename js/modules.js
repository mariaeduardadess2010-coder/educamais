/* EDUCA+ — módulos funcionais (CRUD com Firestore) */

(function () {

  const esc = (v) => UI.esc(v);

  const canManage = (user) =>
    ["diretor", "coordenador", "professor"].includes(user.role);

  const isProfessor = (user) => user.role === "professor";

  const isGlobalManager = (user) =>
    ["diretor", "coordenador"].includes(user.role);

  const filtros = {
    alunosBusca: "",
    alunosSituacao: "",
    freqTurma: "todas",
    notasTurma: "todas",
    comunicadoPublico: "",
  };

  /* -------------------------------------------------------
     HELPERS DE PERMISSÃO / TURMAS
  ------------------------------------------------------- */

  function turmasPermitidas(user) {
    const todas = Store.all("turmas");

    if (isGlobalManager(user)) {
      return todas;
    }

    if (isProfessor(user)) {
      const ids = Array.isArray(user.turmaIds) ? user.turmaIds : [];
      return todas.filter((turma) => ids.includes(turma.id));
    }

    return todas;
  }

  function turmaIdsPermitidas(user) {
    return turmasPermitidas(user).map((turma) => turma.id);
  }

  function disciplinasPermitidas(user) {
  if (isGlobalManager(user)) {
    return Store.DISCIPLINAS;
  }

  if (isProfessor(user)) {
    return Array.isArray(user.disciplinas)
      ? user.disciplinas
      : [];
  }

  return Store.DISCIPLINAS;
}

function disciplinaPermitida(user, disciplina) {
  return disciplinasPermitidas(user).includes(disciplina);
}

function alunosPermitidos(user) {
  const alunos = Store.all("alunos");

  if (isGlobalManager(user)) {
    return alunos;
  }

  if (isProfessor(user)) {
    const ids = turmaIdsPermitidas(user);

    return alunos.filter((aluno) =>
      ids.includes(aluno.turmaId),
    );
  }

  /*
   * Aluno comum:
   * continua vendo somente o próprio cadastro.
   */
  if (user.role === "aluno") {
    return alunos.filter(
      (aluno) => aluno.id === user.alunoId,
    );
  }

  /*
   * Responsável:
   * pode ter vários filhos.
   *
   * Exemplo:
   * alunoIds: ["a2", "a6"]
   */
  if (user.role === "responsavel") {
    const ids = Array.isArray(user.alunoIds)
      ? user.alunoIds
      : user.alunoId
        ? [user.alunoId]
        : [];

    return alunos.filter((aluno) =>
      ids.includes(aluno.id),
    );
  }

  return alunos;
}

function alunoIdsPermitidos(user) {
  return alunosPermitidos(user).map(
    (aluno) => aluno.id,
  );
}

/*
 * Retorna o filho que o responsável selecionou
 * no painel.
 */
function alunoSelecionadoModulo(user) {
  if (user.role !== "responsavel") {
    return user.alunoId || null;
  }

  const ids = Array.isArray(user.alunoIds)
    ? user.alunoIds
    : user.alunoId
      ? [user.alunoId]
      : [];

  if (
    user.alunoSelecionadoId &&
    ids.includes(user.alunoSelecionadoId)
  ) {
    return user.alunoSelecionadoId;
  }

  if (
    user.alunoId &&
    ids.includes(user.alunoId)
  ) {
    return user.alunoId;
  }

  return ids.length ? ids[0] : null;
}

  function turmaSelecionada(filtro, turmas) {
    if (filtro === "todas") {
      return null;
    }

    return turmas.some((turma) => turma.id === filtro)
      ? filtro
      : turmas.length
        ? turmas[0].id
        : null;
  }

  function normalizarFiltrosProfessor(user) {
    const turmas = turmasPermitidas(user);
    const ids = turmas.map((turma) => turma.id);

    if (
      isProfessor(user) &&
      filtros.freqTurma !== "todas" &&
      !ids.includes(filtros.freqTurma)
    ) {
      filtros.freqTurma = "todas";
    }

    if (
      isProfessor(user) &&
      filtros.notasTurma !== "todas" &&
      !ids.includes(filtros.notasTurma)
    ) {
      filtros.notasTurma = "todas";
    }
  }

  /* -------------------------------------------------------
     FORMULÁRIOS
  ------------------------------------------------------- */

  function field(label, name, value, type, options) {

    if (type === "select") {
      return `
        <div class="field">
          <label for="f-${name}">${esc(label)}</label>
          <select id="f-${name}" name="${name}">
            ${options
              .map(
                (o) =>
                  `<option value="${esc(o)}" ${
                    o === value ? "selected" : ""
                  }>${esc(o)}</option>`,
              )
              .join("")}
          </select>
        </div>
      `;
    }

    if (type === "textarea") {
      return `
        <div class="field">
          <label for="f-${name}">${esc(label)}</label>
          <textarea id="f-${name}" name="${name}" rows="3">${esc(
        value || "",
      )}</textarea>
        </div>
      `;
    }

    return `
      <div class="field">
        <label for="f-${name}">${esc(label)}</label>
        <input
          id="f-${name}"
          name="${name}"
          type="${type || "text"}"
          value="${esc(value == null ? "" : value)}"
          ${type === "number" ? 'step="0.1"' : ""}
        />
      </div>
    `;
  }

  function form(fieldsHtml, submitLabel) {
    return `
      <form data-form novalidate>
        <div class="form-grid">${fieldsHtml}</div>

        <div class="form-actions">
          <button type="button" class="btn btn--outline" data-close-modal>
            Cancelar
          </button>

          <button type="submit" class="btn">
            ${esc(submitLabel || "Salvar")}
          </button>
        </div>
      </form>
    `;
  }

  function readForm(el) {
    const data = {};

    new FormData(el).forEach((v, k) => {
      data[k] = typeof v === "string" ? v.trim() : v;
    });

    return data;
  }

  /* -------------------------------------------------------
     ALUNOS
  ------------------------------------------------------- */

  function alunosView(user) {

    normalizarFiltrosProfessor(user);

    const turmas = turmasPermitidas(user);

    let rows = alunosPermitidos(user);

    if (filtros.alunosBusca) {
      const q = filtros.alunosBusca.toLowerCase();

      rows = rows.filter(
        (a) =>
          a.nome?.toLowerCase().includes(q) ||
          String(a.ra || "").includes(q),
      );
    }

    if (filtros.alunosSituacao) {
      rows = rows.filter(
        (a) => a.situacao === filtros.alunosSituacao,
      );
    }

    return `
      ${UI.pageHead(
        "Alunos",
        "Cadastro, busca e acompanhamento dos alunos matriculados.",
        canManage(user)
          ? '<button class="btn" data-new-aluno>+ Novo aluno</button>'
          : "",
      )}

      <section class="card">

        <div class="toolbar">

          <input
            type="search"
            placeholder="Buscar por nome ou RA"
            value="${esc(filtros.alunosBusca)}"
            data-filter="alunosBusca"
          />

          <select data-filter="alunosSituacao">
            <option value="">Todas as situações</option>

            ${["Ativo", "Transferido", "Inativo"]
              .map(
                (s) =>
                  `<option ${
                    s === filtros.alunosSituacao ? "selected" : ""
                  }>${s}</option>`,
              )
              .join("")}
          </select>

          <div
            class="tag tag--info"
            style="display:grid;place-items:center"
          >
            ${rows.length} aluno(s)
          </div>

        </div>

        <div class="table-wrap">
          <table>

            <thead>
              <tr>
                <th>Aluno</th>
                <th>RA</th>
                <th>Turma</th>
                <th>Média</th>
                <th>Freq.</th>
                <th>Situação</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>

              ${
                rows.length
                  ? rows
                      .map((a) => {
                        const m = Store.mediaGeralAluno(a.id);

                        return `
                          <tr>

                            <td>
                              <strong>${esc(a.nome)}</strong>
                            </td>

                            <td>${esc(a.ra)}</td>

                            <td>
                              ${esc(Store.turmaNome(a.turmaId))}
                            </td>

                            <td>${m.toFixed(1)}</td>

                            <td>
                              ${Store.frequenciaAluno(a.id)}%
                            </td>

                            <td>
                              <span class="tag ${
                                a.situacao === "Ativo"
                                  ? "tag--ok"
                                  : a.situacao === "Transferido"
                                    ? "tag--warn"
                                    : "tag--bad"
                              }">
                                ${esc(a.situacao)}
                              </span>
                            </td>

                            <td>
                              <div class="row-actions">

                                <button
                                  class="btn btn--sm btn--ghost"
                                  data-open-aluno="${a.id}"
                                >
                                  Boletim
                                </button>

                                ${
                                  canManage(user)
                                    ? `
                                      <button
                                        class="btn btn--sm btn--outline"
                                        data-edit-aluno="${a.id}"
                                      >
                                        Editar
                                      </button>

                                      <button
                                        class="btn btn--sm btn--danger"
                                        data-del-aluno="${a.id}"
                                      >
                                        Excluir
                                      </button>
                                    `
                                    : ""
                                }

                              </div>
                            </td>

                          </tr>
                        `;
                      })
                      .join("")
                  : `
                    <tr>
                      <td colspan="7">
                        <p class="empty">
                          Nenhum aluno encontrado.
                        </p>
                      </td>
                    </tr>
                  `
              }

            </tbody>

          </table>
        </div>

      </section>
    `;
  }

  function alunoForm(user, id) {

    const a = id ? Store.find("alunos", id) : {};

    const turmas = turmasPermitidas(user);

    const body = UI.openModal(
      id ? "Editar aluno" : "Novo aluno",

      form(
        field("Nome completo", "nome", a.nome) +
          field("RA", "ra", a.ra) +

          `
            <div class="field">
              <label for="f-turmaId">Turma</label>

              <select id="f-turmaId" name="turmaId">
                ${UI.selectOptions(
                  turmas,
                  "id",
                  "nome",
                  a.turmaId,
                )}
              </select>
            </div>
          ` +

          field(
            "Data de nascimento",
            "nascimento",
            a.nascimento,
            "date",
          ) +

          field("CPF", "cpf", a.cpf) +
          field("RG", "rg", a.rg) +

          field(
            "Gênero",
            "genero",
            a.genero || "Feminino",
            "select",
            ["Feminino", "Masculino", "Outro"],
          ) +

          field(
            "Nacionalidade",
            "nacionalidade",
            a.nacionalidade || "Brasileira",
          ) +

          field("Celular", "celular", a.celular) +

          field(
            "Telefone residencial",
            "telefone",
            a.telefone,
          ) +

          field("E-mail", "email", a.email, "email") +

          field(
            "Situação",
            "situacao",
            a.situacao || "Ativo",
            "select",
            ["Ativo", "Transferido", "Inativo"],
          ) +

          field(
            "Endereço residencial",
            "endereco",
            a.endereco,
            "textarea",
          ) +

          field(
            "Responsável 1",
            "responsavel1",
            a.responsavel1,
          ) +

          field(
            "Responsável 2",
            "responsavel2",
            a.responsavel2,
          ),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const data = readForm(e.target);

      if (!data.nome || !data.ra) {
        return UI.toast("Informe nome e RA.", "bad");
      }

      if (!data.turmaId) {
        return UI.toast("Selecione uma turma.", "bad");
      }

      if (
        isProfessor(user) &&
        !turmaIdsPermitidas(user).includes(data.turmaId)
      ) {
        return UI.toast(
          "Você só pode cadastrar alunos nas suas turmas.",
          "bad",
        );
      }

      if (id) {
        Store.update("alunos", id, data);
      } else {
        Store.insert("alunos", data);
      }

      UI.closeModal();

      UI.toast(
        id
          ? "Aluno atualizado."
          : "Aluno cadastrado.",
      );

      UI.render();
    };
  }

  /* -------------------------------------------------------
     TURMAS
  ------------------------------------------------------- */

  function turmasView(user) {

    const turmas = turmasPermitidas(user);

    return `
      ${UI.pageHead(
        "Turmas",
        "Gerenciamento das turmas, turnos e professores responsáveis.",
        canManage(user)
          ? '<button class="btn" data-new-turma>+ Nova turma</button>'
          : "",
      )}

      <div class="grid grid--4">

        ${turmas
          .map(
            (t) => `
              <article class="card">

                <h3 class="card__title">
                  ${esc(t.nome)}
                  <span class="tag tag--purple">
                    ${esc(t.turno)}
                  </span>
                </h3>

                <p
                  style="font-size:.8rem;color:var(--text-dim)"
                >
                  ${esc(t.serie)} · Sala ${esc(t.sala || "—")}
                </p>

                <p style="font-size:.82rem;margin-top:6px">
                  ${esc(t.professor)}
                </p>

                <div
                  class="grid grid--2 mt"
                  style="gap:8px"
                >

                  <div>
                    <small
                      style="color:var(--text-dim);font-size:.66rem"
                    >
                      ALUNOS
                    </small>

                    <br>

                    <strong>
                      ${Store.alunosDaTurma(t.id).length}
                    </strong>
                  </div>

                  <div>
                    <small
                      style="color:var(--text-dim);font-size:.66rem"
                    >
                      FREQUÊNCIA
                    </small>

                    <br>

                    <strong>
                      ${Store.frequenciaTurma(t.id)}%
                    </strong>
                  </div>

                </div>

                ${
                  canManage(user)
                    ? `
                      <div class="row-actions mt">

                        <button
                          class="btn btn--sm btn--outline"
                          data-edit-turma="${t.id}"
                        >
                          Editar
                        </button>

                        <button
                          class="btn btn--sm btn--danger"
                          data-del-turma="${t.id}"
                        >
                          Excluir
                        </button>

                      </div>
                    `
                    : ""
                }

              </article>
            `,
          )
          .join("")}

      </div>
    `;
  }

  function turmaForm(user, id) {

    const t = id ? Store.find("turmas", id) : {};

    const body = UI.openModal(
      id ? "Editar turma" : "Nova turma",

      form(
        field("Nome da turma", "nome", t.nome) +
          field("Série", "serie", t.serie) +

          field(
            "Turno",
            "turno",
            t.turno || "Manhã",
            "select",
            ["Manhã", "Tarde", "Noite"],
          ) +

          field(
            "Professor responsável",
            "professor",
            t.professor,
          ) +

          field("Sala", "sala", t.sala),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const data = readForm(e.target);

      if (!data.nome) {
        return UI.toast(
          "Informe o nome da turma.",
          "bad",
        );
      }

      /*
       * Professor não pode criar/editar turmas.
       * A função continua disponível para diretor/coordenador.
       */
      if (isProfessor(user)) {
        UI.closeModal();

        return UI.toast(
          "Professores não podem gerenciar turmas.",
          "bad",
        );
      }

      if (id) {
        Store.update("turmas", id, data);
      } else {
        Store.insert("turmas", data);
      }

      UI.closeModal();

      UI.toast("Turma salva.");

      UI.render();
    };
  }

/* -------------------------------------------------------
   FREQUÊNCIA / DIÁRIO
------------------------------------------------------- */

function frequenciaView(user) {

  normalizarFiltrosProfessor(user);

  const gestor = canManage(user);

  const turmas = turmasPermitidas(user);

  let turmaId;

if (
  user.role === "aluno" ||
  user.role === "responsavel"
) {

  const alunoId = alunoSelecionadoModulo(user);

  const aluno = Store.find(
    "alunos",
    alunoId,
  );

  turmaId = aluno
    ? aluno.turmaId
    : null;

} else {

    turmaId = turmaSelecionada(
      filtros.freqTurma,
      turmas,
    );

  }

  const alunos = turmaId
    ? alunosPermitidos(user).filter(
        (aluno) => aluno.turmaId === turmaId,
      )
    : [];

  let regs = Store.all("frequencia");

if (
  user.role === "aluno" ||
  user.role === "responsavel"
) {

  const alunoId = alunoSelecionadoModulo(user);

  regs = regs.filter(
    (f) => f.alunoId === alunoId,
  );

} else if (turmaId) {

    regs = regs.filter(
      (f) => f.turmaId === turmaId,
    );

  } else if (isProfessor(user)) {

    const ids = turmaIdsPermitidas(user);

    regs = regs.filter(
      (f) => ids.includes(f.turmaId),
    );

  }

  /* -------------------------------------------------------
     DISCIPLINAS
  ------------------------------------------------------- */

  const disciplinas = Array.isArray(Store.DISCIPLINAS)
    ? Store.DISCIPLINAS
    : [];

  /* -------------------------------------------------------
     CHAMADA
  ------------------------------------------------------- */

  const chamada =
    gestor && turmaId
      ? `
        <section class="card mt">

          <h2 class="card__title">
            Diário de classe — registrar presença
          </h2>

          <form data-chamada>

            <div class="form-grid">

              ${field(
                "Data da aula",
                "data",
                "2026-09-25",
                "date",
              )}

              <div class="field">

                <label for="chamada-disciplina">
                  Disciplina
                </label>

                <select
                  id="chamada-disciplina"
                  name="disciplina"
                  required
                >

                  ${
                    disciplinas.length
                      ? disciplinas
                          .map(
                            (disciplina) => `
                              <option value="${esc(disciplina)}">
                                ${esc(disciplina)}
                              </option>
                            `,
                          )
                          .join("")
                      : `
                          <option value="">
                            Nenhuma disciplina cadastrada
                          </option>
                        `
                  }

                </select>

              </div>

            </div>

            <div class="list">

              ${
                alunos.length
                  ? alunos
                      .map(
                        (a) => `
                          <div class="list-item">

                            <span class="list-item__day">
                              ${esc(a.nome.slice(0, 1))}
                            </span>

                            <div>

                              <strong>
                                ${esc(a.nome)}
                              </strong>

                              <small>
                                RA ${esc(a.ra)}
                                · frequência atual
                                ${Store.frequenciaAluno(a.id)}%
                              </small>

                            </div>

                            <select
                              name="st-${a.id}"
                              style="max-width:190px"
                            >

                              <option value="Presente">
                                Presente
                              </option>

                              <option value="Falta">
                                Falta
                              </option>

                              <option value="Falta justificada">
                                Falta justificada
                              </option>

                            </select>

                          </div>
                        `,
                      )
                      .join("")
                  : `
                      <p class="empty">
                        Nenhum aluno encontrado para esta turma.
                      </p>
                    `
              }

            </div>

            <div class="form-actions mt">

              <button
                class="btn"
                type="submit"
              >
                Salvar chamada
              </button>

            </div>

          </form>

        </section>
      `
      : "";

  /* -------------------------------------------------------
     PÁGINA
  ------------------------------------------------------- */

  return `

    ${UI.pageHead(
      "Frequência",
      "Presenças, faltas e faltas justificadas com cálculo percentual automático.",
    )}

    <div class="grid grid--4">

      ${UI.metric(
        "Frequência da turma",
        turmaId
          ? Store.frequenciaTurma(turmaId) + "%"
          : "—",
        turmaId
          ? Store.turmaNome(turmaId)
          : "Todas as minhas turmas",
        UI.icon("signal"),
      )}

      ${UI.metric(
        "Presenças",
        regs.filter(
          (f) => f.status === "Presente",
        ).length,
        "registros",
        UI.icon("check"),
      )}

      ${UI.metric(
        "Faltas",
        regs.filter(
          (f) => f.status === "Falta",
        ).length,
        "registros",
        UI.icon("ban"),
      )}

      ${UI.metric(
        "Faltas justificadas",
        regs.filter(
          (f) => f.status === "Falta justificada",
        ).length,
        "registros",
        UI.icon("document"),
      )}

    </div>

    ${
      gestor
        ? `
          <section class="card mt">

            <div
              class="toolbar"
              style="margin:0"
            >

              <select data-filter="freqTurma">

                <option
                  value="todas"
                  ${
                    filtros.freqTurma === "todas"
                      ? "selected"
                      : ""
                  }
                >
                  Todas as minhas turmas
                </option>

                ${UI.selectOptions(
                  turmas,
                  "id",
                  "nome",
                  filtros.freqTurma,
                )}

              </select>

            </div>

          </section>
        `
        : ""
    }

    ${chamada}

    <section class="card mt">

      <h2 class="card__title">
        Registros lançados
      </h2>

      <div class="table-wrap">

        <table>

          <thead>

            <tr>

              <th>Data</th>
              <th>Aluno</th>
              <th>Disciplina</th>
              <th>Status</th>

              ${gestor ? "<th></th>" : ""}

            </tr>

          </thead>

          <tbody>

            ${
              regs.length
                ? regs
                    .map((f) => {

                      const cls =
                        f.status === "Presente"
                          ? "tag--ok"
                          : f.status === "Falta"
                            ? "tag--bad"
                            : "tag--warn";

                      return `
                        <tr>

                          <td>
                            ${Store.date(f.data)}
                          </td>

                          <td>
                            ${esc(
                              Store.alunoNome(
                                f.alunoId,
                              ),
                            )}
                          </td>

                          <td>
                            ${esc(f.disciplina || "—")}
                          </td>

                          <td>

                            <span class="tag ${cls}">
                              ${esc(f.status)}
                            </span>

                          </td>

                          ${
                            gestor
                              ? `
                                <td>

                                  <button
                                    class="btn btn--sm btn--danger"
                                    data-del="frequencia:${f.id}"
                                  >
                                    Excluir
                                  </button>

                                </td>
                              `
                              : ""
                          }

                        </tr>
                      `;

                    })
                    .join("")
                : `
                    <tr>

                      <td colspan="${gestor ? 5 : 4}">

                        <p class="empty">
                          Nenhum registro de frequência.
                        </p>

                      </td>

                    </tr>
                  `
            }

          </tbody>

        </table>

      </div>

    </section>

  `;
}

  /* -------------------------------------------------------
     CONTEÚDO DE AULA
  ------------------------------------------------------- */

  function conteudoView(user) {

    const turmas = turmasPermitidas(user);
    const turmaIds = turmas.map((t) => t.id);

    let aulas = Store.all("aulas");

    if (isProfessor(user)) {
      aulas = aulas.filter(
        (aula) => turmaIds.includes(aula.turmaId),
      );
    }

    return `
      ${UI.pageHead(
        "Conteúdo de Aula",
        "Registro dos conteúdos ministrados por turma e disciplina.",
        canManage(user)
          ? '<button class="btn" data-new-aula>+ Lançar conteúdo</button>'
          : "",
      )}

      <section class="card">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Data</th>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Conteúdo</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>

            </thead>

            <tbody>

              ${
                aulas.length
                  ? aulas
                      .slice()
                      .sort(
                        (a, b) =>
                          String(b.data || "").localeCompare(
                            String(a.data || ""),
                          ),
                      )
                      .map(
                        (a) => `
                          <tr>

                            <td>
                              ${a.data ? Store.date(a.data) : "—"}
                            </td>

                            <td>
                              ${esc(
                                Store.turmaNome(
                                  a.turmaId,
                                ),
                              )}
                            </td>

                            <td>
                              ${esc(a.disciplina)}
                            </td>

                            <td>
                              ${esc(a.conteudo)}
                            </td>

                            <td>
                              <span class="tag ${
                                a.status === "Lançado"
                                  ? "tag--ok"
                                  : "tag--bad"
                              }">
                                ${esc(
                                  a.status ||
                                    "Registrado",
                                )}
                              </span>
                            </td>

                            <td>

                              ${
                                canManage(user)
                                  ? `
                                    <div class="row-actions">

                                      <button
                                        class="btn btn--sm btn--outline"
                                        data-edit-aula="${a.id}"
                                      >
                                        Editar
                                      </button>

                                      <button
                                        class="btn btn--sm btn--danger"
                                        data-del="aulas:${a.id}"
                                      >
                                        Excluir
                                      </button>

                                    </div>
                                  `
                                  : ""
                              }

                            </td>

                          </tr>
                        `,
                      )
                      .join("")
                  : `
                    <tr>
                      <td colspan="6">
                        <p class="empty">
                          Nenhum conteúdo registrado.
                        </p>
                      </td>
                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  function aulaForm(user, id) {

    const a = id ? Store.find("aulas", id) : {};

    const turmas = turmasPermitidas(user);

    const body = UI.openModal(
      id
        ? "Editar conteúdo de aula"
        : "Lançar conteúdo de aula",

      form(

        `
          <div class="field">

            <label for="f-turmaId">
              Turma
            </label>

            <select
              id="f-turmaId"
              name="turmaId"
            >

              ${UI.selectOptions(
                turmas,
                "id",
                "nome",
                a.turmaId,
              )}

            </select>

          </div>
        ` +

          field(
            "Data",
            "data",
            a.data || "2026-09-25",
            "date",
          ) +

          field(
            "Disciplina",
            "disciplina",
            a.disciplina ||
              Store.DISCIPLINAS[0],
            "select",
            Store.DISCIPLINAS,
          ) +

          field(
            "Status",
            "status",
            a.status || "Lançado",
            "select",
            ["Lançado", "Pendente"],
          ) +

          field(
            "Conteúdo ministrado",
            "conteudo",
            a.conteudo,
            "textarea",
          ),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const data = readForm(e.target);

      if (!data.conteudo) {
        return UI.toast(
          "Descreva o conteúdo da aula.",
          "bad",
        );
      }

      if (!data.turmaId) {
        return UI.toast(
          "Selecione uma turma.",
          "bad",
        );
      }

      if (
        isProfessor(user) &&
        !turmaIdsPermitidas(user).includes(
          data.turmaId,
        )
      ) {
        return UI.toast(
          "Você só pode lançar conteúdo nas suas turmas.",
          "bad",
        );
      }

      if (id) {
        Store.update("aulas", id, data);
      } else {
        Store.insert("aulas", data);
      }

      UI.closeModal();

      UI.toast("Conteúdo registrado.");

      UI.render();
    };
  }

  /* -------------------------------------------------------
     NOTAS
  ------------------------------------------------------- */

  function notasView(user) {

    normalizarFiltrosProfessor(user);

    const gestor = canManage(user);

    const turmas = turmasPermitidas(user);

    let rows = Store.all("notas");

if (
  user.role === "aluno" ||
  user.role === "responsavel"
) {

  const alunoId = alunoSelecionadoModulo(user);

  rows = rows.filter(
    (n) => n.alunoId === alunoId,
  );

} else {

      const ids = turmaIdsPermitidas(user);

      if (filtros.notasTurma === "todas") {

        rows = rows.filter(
          (n) => ids.includes(n.turmaId),
        );

      } else {

        rows = rows.filter(
          (n) =>
            n.turmaId === filtros.notasTurma &&
            ids.includes(n.turmaId),
        );
      }
    }

    return `
      ${UI.pageHead(
        "Notas",
        "Atividade 1, Atividade 2, Avaliação e média calculada automaticamente.",
        gestor
          ? '<button class="btn" data-new-nota>+ Lançar nota</button>'
          : "",
      )}

      ${
        gestor
          ? `
            <section class="card">

              <div
                class="toolbar"
                style="margin:0"
              >

                <select data-filter="notasTurma">

                  <option
                    value="todas"
                    ${
                      filtros.notasTurma === "todas"
                        ? "selected"
                        : ""
                    }
                  >
                    Todas as minhas turmas
                  </option>

                  ${UI.selectOptions(
                    turmas,
                    "id",
                    "nome",
                    filtros.notasTurma,
                  )}

                </select>

              </div>

            </section>
          `
          : ""
      }

      <section class="card mt">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>Aluno</th>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Ativ. 1</th>
                <th>Ativ. 2</th>
                <th>Avaliação</th>
                <th>Média</th>
                <th>Faltas</th>
                <th>Situação</th>

                ${gestor ? "<th>Ações</th>" : ""}

              </tr>

            </thead>

            <tbody>

              ${
                rows.length
                  ? rows
                      .map((n) => {

                        const m = Store.media(n);
                        const s = Store.situacaoNota(m);

                        return `
                          <tr>

                            <td>
                              ${esc(
                                Store.alunoNome(
                                  n.alunoId,
                                ),
                              )}
                            </td>

                            <td>
                              ${esc(
                                Store.turmaNome(
                                  n.turmaId,
                                ),
                              )}
                            </td>

                            <td>
                              ${esc(n.disciplina)}
                            </td>

                            <td>
                              ${n.a1 ?? 0}
                            </td>

                            <td>
                              ${n.a2 ?? 0}
                            </td>

                            <td>
                              ${n.av ?? 0}
                            </td>

                            <td>
                              <strong
                                style="color:var(--cyan)"
                              >
                                ${m.toFixed(1)}
                              </strong>
                            </td>

                            <td>
                              ${n.faltas || 0}
                            </td>

                            <td>
                              <span class="tag ${s.cls}">
                                ${s.label}
                              </span>
                            </td>

                            ${
                              gestor
                                ? `
                                  <td>

                                    <div class="row-actions">

                                      <button
                                        class="btn btn--sm btn--outline"
                                        data-edit-nota="${n.id}"
                                      >
                                        Editar
                                      </button>

                                      <button
                                        class="btn btn--sm btn--danger"
                                        data-del="notas:${n.id}"
                                      >
                                        Excluir
                                      </button>

                                    </div>

                                  </td>
                                `
                                : ""
                            }

                          </tr>
                        `;
                      })
                      .join("")
                  : `
                    <tr>

                      <td colspan="${gestor ? 10 : 9}">

                        <p class="empty">
                          Nenhuma nota lançada.
                        </p>

                      </td>

                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  function notaForm(user, id) {

    const n = id ? Store.find("notas", id) : {};

    const alunos = alunosPermitidos(user);

    const body = UI.openModal(
      id ? "Editar nota" : "Lançar nota",

      form(

        `
          <div class="field">

            <label for="f-alunoId">
              Aluno
            </label>

            <select
              id="f-alunoId"
              name="alunoId"
            >

              ${UI.selectOptions(
                alunos,
                "id",
                "nome",
                n.alunoId,
              )}

            </select>

          </div>
        ` +

          field(
            "Disciplina",
            "disciplina",
            n.disciplina ||
              Store.DISCIPLINAS[0],
            "select",
            Store.DISCIPLINAS,
          ) +

          field(
            "Bimestre / período",
            "bimestre",
            n.bimestre || "2º Semestre",
          ) +

          field(
            "Atividade 1",
            "a1",
            n.a1,
            "number",
          ) +

          field(
            "Atividade 2",
            "a2",
            n.a2,
            "number",
          ) +

          field(
            "Avaliação",
            "av",
            n.av,
            "number",
          ) +

          field(
            "Faltas na disciplina",
            "faltas",
            n.faltas || 0,
            "number",
          ),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const d = readForm(e.target);

      ["a1", "a2", "av", "faltas"].forEach(
        (k) => {
          d[k] = Number(d[k]) || 0;
        },
      );

      const aluno = Store.find(
        "alunos",
        d.alunoId,
      );

      if (!aluno) {
        return UI.toast(
          "Aluno não encontrado.",
          "bad",
        );
      }

      if (
        isProfessor(user) &&
        !turmaIdsPermitidas(user).includes(
          aluno.turmaId,
        )
      ) {
        return UI.toast(
          "Você só pode lançar notas para alunos das suas turmas.",
          "bad",
        );
      }

      d.turmaId = aluno.turmaId;

      if (id) {
        Store.update("notas", id, d);
      } else {
        Store.insert("notas", d);
      }

      UI.closeModal();

      UI.toast(
        "Nota salva. Média calculada: " +
          Store.media(d).toFixed(1),
      );

      UI.render();
    };
  }

  /* -------------------------------------------------------
     ATIVIDADES
  ------------------------------------------------------- */

  function atividadesView(user) {

    const gestor = canManage(user);

    const turmas = turmasPermitidas(user);
    const turmaIds = turmas.map((t) => t.id);

    let rows = Store.all("atividades");

if (
  user.role === "aluno" ||
  user.role === "responsavel"
) {

  const alunoId = alunoSelecionadoModulo(user);

  const aluno = Store.find(
    "alunos",
    alunoId,
  );

  rows = aluno
    ? rows.filter(
        (a) => a.turmaId === aluno.turmaId,
      )
    : [];

} else if (isProfessor(user)) {

      rows = rows.filter(
        (a) => turmaIds.includes(a.turmaId),
      );
    }

    return `
      ${UI.pageHead(
        "Atividades e Trabalhos",
        "Controle de entregas com status por turma.",
        gestor
          ? '<button class="btn" data-new-atividade>+ Nova atividade</button>'
          : "",
      )}

      <section class="card">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>Atividade</th>
                <th>Turma</th>
                <th>Disciplina</th>
                <th>Entrega</th>
                <th>Status</th>

                ${gestor ? "<th>Ações</th>" : ""}

              </tr>

            </thead>

            <tbody>

              ${
                rows.length
                  ? rows
                      .slice()
                      .sort(
                        (a, b) =>
                          String(a.entrega || "").localeCompare(
                            String(b.entrega || ""),
                          ),
                      )
                      .map(
                        (a) => `
                          <tr>

                            <td>
                              <strong>
                                ${esc(a.titulo)}
                              </strong>
                            </td>

                            <td>
                              ${esc(
                                Store.turmaNome(
                                  a.turmaId,
                                ),
                              )}
                            </td>

                            <td>
                              ${esc(a.disciplina)}
                            </td>

                            <td>
                              ${
                                a.entrega
                                  ? Store.date(
                                      a.entrega,
                                    )
                                  : "—"
                              }
                            </td>

                            <td>

                              <span class="tag ${
                                a.status === "Entregue"
                                  ? "tag--ok"
                                  : a.status === "Atrasado"
                                    ? "tag--bad"
                                    : "tag--warn"
                              }">

                                ${esc(
                                  a.status ||
                                    "Pendente",
                                )}

                              </span>

                            </td>

                            ${
                              gestor
                                ? `
                                  <td>

                                    <div class="row-actions">

                                      <button
                                        class="btn btn--sm btn--outline"
                                        data-edit-atividade="${a.id}"
                                      >
                                        Editar
                                      </button>

                                      <button
                                        class="btn btn--sm btn--danger"
                                        data-del="atividades:${a.id}"
                                      >
                                        Excluir
                                      </button>

                                    </div>

                                  </td>
                                `
                                : ""
                            }

                          </tr>
                        `,
                      )
                      .join("")
                  : `
                    <tr>

                      <td colspan="${gestor ? 6 : 5}">

                        <p class="empty">
                          Nenhuma atividade cadastrada.
                        </p>

                      </td>

                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  function atividadeForm(user, id) {

    const a = id
      ? Store.find("atividades", id)
      : {};

    const turmas = turmasPermitidas(user);

    const body = UI.openModal(
      id ? "Editar atividade" : "Nova atividade",

      form(

        field("Título", "titulo", a.titulo) +

          `
            <div class="field">

              <label for="f-turmaId">
                Turma
              </label>

              <select
                id="f-turmaId"
                name="turmaId"
              >

                ${UI.selectOptions(
                  turmas,
                  "id",
                  "nome",
                  a.turmaId,
                )}

              </select>

            </div>
          ` +

          field(
            "Disciplina",
            "disciplina",
            a.disciplina ||
              Store.DISCIPLINAS[0],
            "select",
            Store.DISCIPLINAS,
          ) +

          field(
            "Data de entrega",
            "entrega",
            a.entrega || "2026-09-28",
            "date",
          ) +

          field(
            "Status",
            "status",
            a.status || "Pendente",
            "select",
            ["Pendente", "Entregue", "Atrasado"],
          ),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const d = readForm(e.target);

      if (!d.titulo) {
        return UI.toast(
          "Informe o título da atividade.",
          "bad",
        );
      }

      if (!d.turmaId) {
        return UI.toast(
          "Selecione uma turma.",
          "bad",
        );
      }

      if (
        isProfessor(user) &&
        !turmaIdsPermitidas(user).includes(
          d.turmaId,
        )
      ) {
        return UI.toast(
          "Você só pode criar atividades para suas turmas.",
          "bad",
        );
      }

      if (id) {
        Store.update("atividades", id, d);
      } else {
        Store.insert("atividades", d);
      }

      UI.closeModal();

      UI.toast("Atividade salva.");

      UI.render();
    };
  }

  /* -------------------------------------------------------
     OCORRÊNCIAS
  ------------------------------------------------------- */

  const CATEGORIAS = [
    "Atraso",
    "Indisciplina",
    "Baixo rendimento",
    "Falta de material",
    "Uniforme",
    "Elogio",
    "Saúde",
  ];

  function ocorrenciasView(user) {

    const gestor = canManage(user);

    const ids = alunoIdsPermitidos(user);

    let rows = Store.all("ocorrencias");

if (
  user.role === "aluno" ||
  user.role === "responsavel"
) {

  const alunoId = alunoSelecionadoModulo(user);

  rows = rows.filter(
    (o) => o.alunoId === alunoId,
  );

} else if (isProfessor(user)) {

      rows = rows.filter(
        (o) => ids.includes(o.alunoId),
      );
    }

    return `
      ${UI.pageHead(
        "Ocorrências",
        "Registros escolares por categoria e gravidade.",
        gestor
          ? '<button class="btn" data-new-ocorrencia>+ Registrar ocorrência</button>'
          : "",
      )}

      <section class="card">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>

                <th>Data</th>
                <th>Aluno</th>
                <th>Categoria</th>
                <th>Gravidade</th>
                <th>Descrição</th>

                ${gestor ? "<th></th>" : ""}

              </tr>

            </thead>

            <tbody>

              ${
                rows.length
                  ? rows
                      .map(
                        (o) => `
                          <tr>

                            <td>
                              ${Store.date(o.data)}
                            </td>

                            <td>
                              ${esc(
                                Store.alunoNome(
                                  o.alunoId,
                                ),
                              )}
                            </td>

                            <td>

                              <span class="tag tag--purple">
                                ${esc(o.categoria)}
                              </span>

                            </td>

                            <td>

                              <span class="tag ${
                                o.gravidade === "Grave"
                                  ? "tag--bad"
                                  : o.gravidade === "Média"
                                    ? "tag--warn"
                                    : "tag--info"
                              }">

                                ${esc(
                                  o.gravidade,
                                )}

                              </span>

                            </td>

                            <td>
                              ${esc(o.descricao)}
                            </td>

                            ${
                              gestor
                                ? `
                                  <td>

                                    <div class="row-actions">

                                      <button
                                        class="btn btn--sm btn--outline"
                                        data-edit-ocorrencia="${o.id}"
                                      >
                                        Editar
                                      </button>

                                      <button
                                        class="btn btn--sm btn--danger"
                                        data-del="ocorrencias:${o.id}"
                                      >
                                        Excluir
                                      </button>

                                    </div>

                                  </td>
                                `
                                : ""
                            }

                          </tr>
                        `,
                      )
                      .join("")
                  : `
                    <tr>

                      <td colspan="${gestor ? 6 : 5}">

                        <p class="empty">
                          Nenhuma ocorrência registrada.
                        </p>

                      </td>

                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  function ocorrenciaForm(user, id) {

    const o = id
      ? Store.find("ocorrencias", id)
      : {};

    const alunos = alunosPermitidos(user);

    const body = UI.openModal(
      id
        ? "Editar ocorrência"
        : "Registrar ocorrência",

      form(

        `
          <div class="field">

            <label for="f-alunoId">
              Aluno
            </label>

            <select
              id="f-alunoId"
              name="alunoId"
            >

              ${UI.selectOptions(
                alunos,
                "id",
                "nome",
                o.alunoId,
              )}

            </select>

          </div>
        ` +

          field(
            "Data",
            "data",
            o.data || "2026-09-25",
            "date",
          ) +

          field(
            "Categoria",
            "categoria",
            o.categoria || CATEGORIAS[0],
            "select",
            CATEGORIAS,
          ) +

          field(
            "Gravidade",
            "gravidade",
            o.gravidade || "Leve",
            "select",
            ["Leve", "Média", "Grave"],
          ) +

          field(
            "Descrição",
            "descricao",
            o.descricao,
            "textarea",
          ),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const d = readForm(e.target);

      if (!d.descricao) {
        return UI.toast(
          "Descreva a ocorrência.",
          "bad",
        );
      }

      const aluno = Store.find(
        "alunos",
        d.alunoId,
      );

      if (!aluno) {
        return UI.toast(
          "Aluno não encontrado.",
          "bad",
        );
      }

      if (
        isProfessor(user) &&
        !turmaIdsPermitidas(user).includes(
          aluno.turmaId,
        )
      ) {
        return UI.toast(
          "Você só pode registrar ocorrências para alunos das suas turmas.",
          "bad",
        );
      }

      if (id) {
        Store.update("ocorrencias", id, d);
      } else {
        Store.insert("ocorrencias", d);
      }

      UI.closeModal();

      UI.toast("Ocorrência registrada.");

      UI.render();
    };
  }

  /* -------------------------------------------------------
     COMUNICADOS
  ------------------------------------------------------- */

  const PUBLICOS = [
    "Todos",
    "Professores",
    "Alunos",
    "Responsáveis",
  ];

  function comunicadosView(user) {

    const gestor = [
      "diretor",
      "coordenador",
      "professor",
    ].includes(user.role);

    let rows = gestor
      ? Store.all("comunicados")
      : Store.comunicadosPara(user.publico);

    if (filtros.comunicadoPublico) {
      rows = rows.filter(
        (c) =>
          c.publico ===
          filtros.comunicadoPublico,
      );
    }

    return `
      ${UI.pageHead(
        "Mural de Comunicados",
        "Avisos segmentados por público-alvo.",
        gestor
          ? '<button class="btn" data-new-comunicado>+ Novo comunicado</button>'
          : "",
      )}

      <section class="card">

        <div class="toolbar">

          <select data-filter="comunicadoPublico">

            <option value="">
              Todos os públicos
            </option>

            ${PUBLICOS
              .map(
                (p) =>
                  `<option ${
                    p === filtros.comunicadoPublico
                      ? "selected"
                      : ""
                  }>${p}</option>`,
              )
              .join("")}

          </select>

        </div>

        <div class="grid grid--2">

          ${
            rows.length
              ? rows
                  .map(
                    (c) => `
                      <article class="card card--purple">

                        <h3 class="card__title">

                          ${esc(c.titulo)}

                          <span class="tag tag--info">
                            ${esc(c.publico)}
                          </span>

                        </h3>

                        <p style="font-size:.84rem">
                          ${esc(c.texto || "")}
                        </p>

                        <p
                          style="
                            font-size:.72rem;
                            color:var(--text-dim);
                            margin-top:8px
                          "
                        >
                          ${esc(c.autor)}
                          ·
                          ${Store.date(c.data)}
                        </p>

                        ${
                          gestor
                            ? `
                              <div class="row-actions mt">

                                <button
                                  class="btn btn--sm btn--outline"
                                  data-edit-comunicado="${c.id}"
                                >
                                  Editar
                                </button>

                                <button
                                  class="btn btn--sm btn--danger"
                                  data-del="comunicados:${c.id}"
                                >
                                  Excluir
                                </button>

                              </div>
                            `
                            : ""
                        }

                      </article>
                    `,
                  )
                  .join("")
              : '<p class="empty">Nenhum comunicado para este público.</p>'
          }

        </div>

      </section>
    `;
  }

  function comunicadoForm(user, id) {

    const c = id
      ? Store.find("comunicados", id)
      : {};

    const body = UI.openModal(
      id ? "Editar comunicado" : "Novo comunicado",

      form(

        field("Título", "titulo", c.titulo) +

          field(
            "Autor",
            "autor",
            c.autor || user.roleLabel,
          ) +

          field(
            "Data",
            "data",
            c.data || "2026-09-25",
            "date",
          ) +

          field(
            "Público-alvo",
            "publico",
            c.publico || "Todos",
            "select",
            PUBLICOS,
          ) +

          field(
            "Mensagem",
            "texto",
            c.texto,
            "textarea",
          ),
      ),
    );

    body.querySelector("[data-form]").onsubmit = (e) => {

      e.preventDefault();

      const d = readForm(e.target);

      if (!d.titulo) {
        return UI.toast(
          "Informe o título.",
          "bad",
        );
      }

      if (id) {
        Store.update("comunicados", id, d);
      } else {
        Store.insert("comunicados", d);
      }

      UI.closeModal();

      UI.toast("Comunicado publicado.");

      UI.render();
    };
  }

  /* -------------------------------------------------------
     BOLETOS
  ------------------------------------------------------- */

  function boletosView(user) {

const alunoId = alunoSelecionadoModulo(user);

const rows = Store.all("boletos").filter(
  (b) => b.alunoId === alunoId,
);

    return `
      ${UI.pageHead(
        "Boletos",
        "Histórico financeiro do(a) aluno(a).",
      )}

      <section class="card">

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
              </tr>

            </thead>

            <tbody>

              ${
                rows.length
                  ? rows
                      .map(
                        (b) => `
                          <tr>

                            <td>
                              ${esc(b.descricao)}
                            </td>

                            <td>
                              ${Store.money(b.valor)}
                            </td>

                            <td>
                              ${Store.date(
                                b.vencimento,
                              )}
                            </td>

                            <td>

                              <span class="tag ${
                                b.status === "Pago"
                                  ? "tag--ok"
                                  : "tag--bad"
                              }">

                                ${esc(b.status)}

                              </span>

                            </td>

                          </tr>
                        `,
                      )
                      .join("")
                  : `
                    <tr>

                      <td colspan="4">

                        <p class="empty">
                          Nenhum boleto.
                        </p>

                      </td>

                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

      </section>
    `;
  }

  /* -------------------------------------------------------
     PERFIL / BOLETIM DIGITAL
  ------------------------------------------------------- */

  function perfilAluno(id, user) {

    const a = Store.find("alunos", id);

    if (!a) {
      return `
        <p class="empty">
          Aluno não encontrado.
        </p>
      `;
    }

    if (
      isProfessor(user) &&
      !turmaIdsPermitidas(user).includes(
        a.turmaId,
      )
    ) {
      return `
        <p class="empty">
          Você não possui acesso a este aluno.
        </p>
      `;
    }

    if (
      user.role === "aluno" &&
      user.alunoId !== id
    ) {
      return `
        <p class="empty">
          Você não possui acesso a este aluno.
        </p>
      `;
    }

if (user.role === "responsavel") {

  const ids = Array.isArray(user.alunoIds)
    ? user.alunoIds
    : user.alunoId
      ? [user.alunoId]
      : [];

  if (!ids.includes(id)) {
    return `
      <p class="empty">
        Você não possui acesso a este aluno.
      </p>
    `;
  }
}

    const notas = Store.all("notas").filter(
      (n) => n.alunoId === id,
    );

    const media = Store.mediaGeralAluno(id);
    const faltas = Store.faltasAluno(id);
    const freq = Store.frequenciaAluno(id);

    return `

      <button
        class="btn btn--ghost btn--sm"
        data-route="alunos"
      >
        ‹ Voltar para alunos
      </button>

      <header class="profile-head mt">

        <span class="avatar-lg">
          ${UI.icon("user", "icon icon--xl")}
        </span>

        <div>

          <h1>
            ${esc(a.nome)}
          </h1>

          <p>
            RA ${esc(a.ra)}
            · Turma:
            ${esc(Store.turmaNome(a.turmaId))}
            · Colégio Íconos
            · Ano Letivo 2026
          </p>

        </div>

      </header>

      <div class="grid grid--2 mt">

        <section class="card card--purple">

          <h2 class="card__title">
            ${UI.icon("user")}
            Dados Pessoais
          </h2>

          <div class="info-grid">

            <div>
              <small>Nome completo</small>
              <strong>${esc(a.nome)}</strong>
            </div>

            <div>
              <small>Data de nascimento</small>
              <strong>
                ${Store.date(a.nascimento)}
              </strong>
            </div>

            <div>
              <small>CPF</small>
              <strong>${esc(a.cpf)}</strong>
            </div>

            <div>
              <small>RG</small>
              <strong>${esc(a.rg)}</strong>
            </div>

            <div>
              <small>Gênero</small>
              <strong>${esc(a.genero)}</strong>
            </div>

            <div>
              <small>Nacionalidade</small>
              <strong>
                ${esc(a.nacionalidade)}
              </strong>
            </div>

            <div style="grid-column:1/-1">
              <small>Endereço residencial</small>
              <strong>
                ${esc(a.endereco)}
              </strong>
            </div>

          </div>

        </section>

        <section class="card card--purple">

          <h2 class="card__title">
            ${UI.icon("phone")}
            Dados de Contato
          </h2>

          <div class="info-grid">

            <div>
              <small>Celular</small>
              <strong>
                ${esc(a.celular)}
              </strong>
            </div>

            <div>
              <small>Telefone residencial</small>
              <strong>
                ${esc(a.telefone)}
              </strong>
            </div>

            <div style="grid-column:1/-1">
              <small>E-mail pessoal</small>
              <strong>
                ${esc(a.email)}
              </strong>
            </div>

          </div>

          <h2 class="card__title mt">
            ${UI.icon("users")}
            Responsáveis
          </h2>

          <div class="info-grid">

            <div>
              <small>Responsável 1</small>
              <strong>
                ${esc(a.responsavel1)}
              </strong>
            </div>

            <div>
              <small>Responsável 2</small>
              <strong>
                ${esc(a.responsavel2 || "—")}
              </strong>
            </div>

          </div>

        </section>

      </div>

      <section class="card mt">

        <h2 class="card__title">

          ${UI.icon("clipboard")}

          Boletim Digital — 2º Semestre 2026

          <span class="tag tag--info">
            Média geral ${media.toFixed(1)}
          </span>

        </h2>

        <div class="table-wrap">

          <table>

            <thead>

              <tr>
                <th>Disciplina</th>
                <th>Ativ. 1</th>
                <th>Ativ. 2</th>
                <th>Avaliação</th>
                <th>Média</th>
                <th>Faltas</th>
                <th>Situação</th>
              </tr>

            </thead>

            <tbody>

              ${
                notas.length
                  ? notas
                      .map((n) => {

                        const m = Store.media(n);
                        const s = Store.situacaoNota(m);

                        return `
                          <tr>

                            <td>
                              ${esc(n.disciplina)}
                            </td>

                            <td>
                              ${n.a1 ?? 0}
                            </td>

                            <td>
                              ${n.a2 ?? 0}
                            </td>

                            <td>
                              ${n.av ?? 0}
                            </td>

                            <td>
                              <strong>
                                ${m.toFixed(1)}
                              </strong>
                            </td>

                            <td>
                              ${n.faltas || 0}
                            </td>

                            <td>
                              <span class="tag ${s.cls}">
                                ${s.label}
                              </span>
                            </td>

                          </tr>
                        `;
                      })
                      .join("")
                  : `
                    <tr>

                      <td colspan="7">

                        <p class="empty">
                          Nenhuma nota lançada
                          para este aluno.
                        </p>

                      </td>

                    </tr>
                  `
              }

            </tbody>

          </table>

        </div>

        <div class="grid grid--4 mt">

          ${UI.metric(
            "Média geral",
            media.toFixed(1),
            "cálculo automático",
            UI.icon("chart"),
          )}

          ${UI.metric(
            "Total de faltas",
            faltas,
            "no período",
            UI.icon("ban"),
          )}

          ${UI.metric(
            "Frequência",
            freq + "%",
            "aproveitamento",
            UI.icon("signal"),
          )}

          ${UI.metric(
            "Situação",
            notas.length
              ? Store.situacaoNota(media).label
              : "Sem notas",
            "consolidado",
            UI.icon("check"),
          )}

        </div>

        <div class="form-actions mt">

          <button
            class="btn btn--outline"
            data-print
          >
            Gerar PDF / imprimir
          </button>

        </div>

      </section>
    `;
  }

  /* -------------------------------------------------------
     CONTA
  ------------------------------------------------------- */

  function conta(user) {

    const prefs = JSON.parse(
      localStorage.getItem(
        "educa-preferences",
      ) || "{}",
    );

    const initials = user.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

    return `
      ${UI.pageHead(
        "Minha Conta",
        "Gerencie suas informações pessoais e preferências de acesso.",
        '<button class="btn btn--ghost" data-route="painel">Voltar ao painel</button>',
      )}

      <section class="account-hero card">

        <div class="account-avatar">
          ${initials}
        </div>

        <div class="account-identity">

          <span class="tag tag--info">
            ${esc(user.roleLabel)}
          </span>

          <h2>
            ${esc(user.name)}
          </h2>

          <p>
            ${esc(user.email)}
          </p>

        </div>

        <span class="account-status">
          <span class="status-dot"></span>
          Conta ativa
        </span>

      </section>

      <div class="grid grid--2 mt">

        <section class="card card--purple">

          <h2 class="card__title account-section-title">

            <span>
              ${UI.icon("user")}
              <span>Informações gerais</span>
            </span>

          </h2>

          <div class="info-grid account-info">

            <div>
              <small>Nome completo</small>
              <strong>
                ${esc(user.name)}
              </strong>
            </div>

            <div>
              <small>Perfil de acesso</small>
              <strong>
                ${esc(user.roleLabel)}
              </strong>
            </div>

            <div>
              <small>E-mail cadastrado</small>
              <strong>
                ${esc(user.email)}
              </strong>
            </div>

            <div>
              <small>Público de atuação</small>
              <strong>
                ${esc(user.publico)}
              </strong>
            </div>

          </div>

          <button
            class="btn btn--outline mt"
            data-account-action="profile"
          >
            Editar informações
          </button>

        </section>

        <section class="card">

          <h2 class="card__title">
            ${UI.icon("settings")}
            Preferências
          </h2>

          <div class="settings-list">

            <label class="setting-row">

              <span>
                <strong>
                  Notificações no portal
                </strong>

                <small>
                  Receba alertas sobre novidades
                  e atividades.
                </small>
              </span>

              <input
                type="checkbox"
                data-pref="notifications"
                ${
                  prefs.notifications !== false
                    ? "checked"
                    : ""
                }
              >

            </label>

            <label class="setting-row">

              <span>
                <strong>
                  Resumo por e-mail
                </strong>

                <small>
                  Receba um resumo periódico
                  do seu ambiente.
                </small>
              </span>

              <input
                type="checkbox"
                data-pref="emailSummary"
                ${
                  prefs.emailSummary
                    ? "checked"
                    : ""
                }
              >

            </label>

            <label class="setting-row">

              <span>
                <strong>
                  Modo compacto
                </strong>

                <small>
                  Use uma densidade maior
                  nas listas e tabelas.
                </small>
              </span>

              <input
                type="checkbox"
                data-pref="compact"
                ${
                  prefs.compact
                    ? "checked"
                    : ""
                }
              >

            </label>

          </div>

        </section>

      </div>

      <section class="card mt account-security">

        <div>

          <h2 class="card__title">
            ${UI.icon("shield")}
            Segurança e acesso
          </h2>

          <p>
            Senha protegida e sessão atual
            vinculada a este dispositivo.
          </p>

        </div>

        <div class="row-actions">

          <button
            class="btn btn--outline"
            data-account-action="password"
          >
            Alterar senha
          </button>

          <button
            class="btn btn--danger"
            data-account-logout
          >
            ${UI.icon("logout")}
            Sair da conta
          </button>

        </div>

      </section>
    `;
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  const Modules = {

    perfilAluno,

    conta,

    render(route, user) {

      switch (route) {

        case "alunos":
          return alunosView(user);

        case "turmas":
          return turmasView(user);

        case "frequencia":
          return frequenciaView(user);

        case "conteudo":
          return conteudoView(user);

        case "notas":
          return notasView(user);

        case "atividades":
          return atividadesView(user);

        case "ocorrencias":
          return ocorrenciasView(user);

        case "comunicados":
          return comunicadosView(user);

        case "boletos":
          return boletosView(user);

        default:
          return `
            <p class="empty">
              Módulo não encontrado.
            </p>
          `;
      }
    },

    /* -----------------------------------------------------
       BIND
    ----------------------------------------------------- */

    bind(root, user) {

      const on = (sel, fn) =>
        root
          .querySelectorAll(sel)
          .forEach(
            (el) =>
              (el.onclick = () => fn(el)),
          );

      /* FILTROS */

      root
        .querySelectorAll("[data-filter]")
        .forEach((el) => {

          el.onchange = () => {

            filtros[el.dataset.filter] =
              el.value;

            UI.render();
          };

          if (el.type === "search") {

            el.oninput = () => {

              filtros[el.dataset.filter] =
                el.value;

              const pos =
                el.selectionStart;

              UI.render();

              const next =
                document.querySelector(
                  '[data-filter="' +
                    el.dataset.filter +
                    '"]',
                );

              if (next) {

                next.focus();

                next.setSelectionRange(
                  pos,
                  pos,
                );
              }
            };
          }
        });

      /* ROTAS */

      on("[data-route]", (el) =>
        UI.go(el.dataset.route),
      );

      on("[data-open-aluno]", (el) =>
        UI.go(
          "aluno/" +
            el.dataset.openAluno,
        ),
      );

      /* ALUNOS */

      on("[data-new-aluno]", () =>
        alunoForm(user),
      );

      on("[data-edit-aluno]", (el) =>
        alunoForm(
          user,
          el.dataset.editAluno,
        ),
      );

      on("[data-del-aluno]", (el) =>
        UI.confirm(
          "Excluir este aluno e seus registros?",
          () => {

            const id =
              el.dataset.delAluno;

            const aluno =
              Store.find("alunos", id);

            if (
              isProfessor(user) &&
              aluno &&
              !turmaIdsPermitidas(user).includes(
                aluno.turmaId,
              )
            ) {
              return UI.toast(
                "Você não pode excluir este aluno.",
                "bad",
              );
            }

            Store.removeAlunoCascade(id);

            UI.toast(
              "Aluno excluído.",
            );

            UI.render();
          },
        ),
      );

      /* TURMAS */

      on("[data-new-turma]", () =>
        turmaForm(user),
      );

      on("[data-edit-turma]", (el) =>
        turmaForm(
          user,
          el.dataset.editTurma,
        ),
      );

      on("[data-del-turma]", (el) =>
        UI.confirm(
          "Excluir esta turma?",
          () => {

            if (isProfessor(user)) {
              return UI.toast(
                "Professores não podem excluir turmas.",
                "bad",
              );
            }

            Store.remove(
              "turmas",
              el.dataset.delTurma,
            );

            UI.toast(
              "Turma excluída.",
            );

            UI.render();
          },
        ),
      );

      /* AULAS */

      on("[data-new-aula]", () =>
        aulaForm(user),
      );

      on("[data-edit-aula]", (el) =>
        aulaForm(
          user,
          el.dataset.editAula,
        ),
      );

      /* NOTAS */

      on("[data-new-nota]", () =>
        notaForm(user),
      );

      on("[data-edit-nota]", (el) =>
        notaForm(
          user,
          el.dataset.editNota,
        ),
      );

      /* ATIVIDADES */

      on("[data-new-atividade]", () =>
        atividadeForm(user),
      );

      on("[data-edit-atividade]", (el) =>
        atividadeForm(
          user,
          el.dataset.editAtividade,
        ),
      );

      /* OCORRÊNCIAS */

      on("[data-new-ocorrencia]", () =>
        ocorrenciaForm(user),
      );

      on("[data-edit-ocorrencia]", (el) =>
        ocorrenciaForm(
          user,
          el.dataset.editOcorrencia,
        ),
      );

      /* COMUNICADOS */

      on("[data-new-comunicado]", () =>
        comunicadoForm(user),
      );

      on("[data-edit-comunicado]", (el) =>
        comunicadoForm(
          user,
          el.dataset.editComunicado,
        ),
      );

      /* IMPRESSÃO */

      on("[data-print]", () =>
        window.print(),
      );

      /* LOGOUT */

      on("[data-account-logout]", () =>
        window.Auth.signOut(),
      );

      /* CONTA */

on("[data-account-action]", async (el) => {
  if (el.dataset.accountAction !== "password") {
    UI.toast("As informações são gerenciadas pela secretaria.");
    return;
  }

  const novaSenha = prompt("Digite sua nova senha:");

  if (!novaSenha) {
    return;
  }

  if (novaSenha.length < 6) {
    UI.toast("A senha precisa ter pelo menos 6 caracteres.", "bad");
    return;
  }

  const confirmarSenha = prompt("Digite a nova senha novamente:");

  if (novaSenha !== confirmarSenha) {
    UI.toast("As senhas não coincidem.", "bad");
    return;
  }

  try {
    const firebase = await window.EducaFirebaseReady;
    const usuario = firebase.auth.currentUser;

    if (!usuario) {
      UI.toast("Usuário não está autenticado.", "bad");
      return;
    }

    await firebase.updatePassword(usuario, novaSenha);

    UI.toast("Senha alterada com sucesso!");
} catch (error) {
  console.error("❌ ERRO COMPLETO AO ALTERAR SENHA:", error);
  console.error("Código:", error.code);
  console.error("Mensagem:", error.message);

  if (error.code === "auth/requires-recent-login") {
    UI.toast(
      "Por segurança, faça login novamente antes de alterar a senha.",
      "bad",
    );
  } else {
    UI.toast(
      `Erro: ${error.code || "desconhecido"}`,
      "bad",
    );
  }
}
});

      /* PREFERÊNCIAS */

      root
        .querySelectorAll("[data-pref]")
        .forEach((input) => {

          input.onchange = () => {

            const prefs =
              JSON.parse(
                localStorage.getItem(
                  "educa-preferences",
                ) || "{}",
              );

            prefs[input.dataset.pref] =
              input.checked;

            localStorage.setItem(
              "educa-preferences",
              JSON.stringify(prefs),
            );

            UI.toast(
              "Preferência atualizada.",
            );
          };
        });

      /* EXCLUSÃO GENÉRICA */

      on("[data-del]", (el) => {

        const [col, id] =
          el.dataset.del.split(":");

        UI.confirm(
          "Excluir este registro?",
          () => {
if (
  isProfessor(user) &&
  col === "frequencia"
) {
  const registro = Store.find("frequencia", id);

  if (
    registro &&
    !disciplinaPermitida(user, registro.disciplina)
  ) {
    return UI.toast(
      "Você não pode excluir frequência desta disciplina.",
      "bad",
    );
  }

  if (
    registro &&
    !turmaIdsPermitidas(user).includes(
      registro.turmaId,
    )
  ) {
    return UI.toast(
      "Você não pode excluir frequência desta turma.",
      "bad",
    );
  }
}
            Store.remove(col, id);

            UI.toast(
              "Registro excluído.",
            );

            UI.render();
          },
        );
      });

      /* CHAMADA */

      const chamada =
        root.querySelector(
          "[data-chamada]",
        );

      if (chamada) {

        chamada.onsubmit = (e) => {

          e.preventDefault();

          const d =
            readForm(chamada);

          const turmaId =
            turmaSelecionada(
              filtros.freqTurma,
              turmasPermitidas(user),
            );

          if (!turmaId) {
            return UI.toast(
              "Selecione uma turma antes de registrar a chamada.",
              "bad",
            );
          }

          if (
            isProfessor(user) &&
            !turmaIdsPermitidas(user).includes(
              turmaId,
            )
          ) {
            return UI.toast(
              "Você não pode registrar chamada para esta turma.",
              "bad",
            );
          }

          if (
  isProfessor(user) &&
  !disciplinaPermitida(user, d.disciplina)
) {
  return UI.toast(
    "Você não pode registrar frequência nesta disciplina.",
    "bad",
  );
}

          let n = 0;

          alunosPermitidos(user)
            .filter(
              (a) =>
                a.turmaId === turmaId,
            )
            .forEach((a) => {

              const status =
                d["st-" + a.id];

              if (!status) return;

              Store.insert(
                "frequencia",
                {
                  alunoId: a.id,
                  turmaId,
                  data: d.data,
                  disciplina: d.disciplina,
                  status,
                },
              );

              n++;
            });

          UI.toast(
            `Chamada salva: ${n} registro(s). Frequência da turma: ${Store.frequenciaTurma(turmaId)}%`,
          );

          UI.render();
        };
      }
    },
  };

  window.Modules = Modules;

})();