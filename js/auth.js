/* EDUCA+ — autenticação com Firebase */

(function () {

  const esc = (v) => UI.esc(v);

  // =====================================================
  // PAINEL DE LOGIN
  // =====================================================

  function loginPanel(email) {

    return `
      <h2 class="auth-title">Digite a sua senha</h2>

      <form data-login>

        <div class="field">
          <label for="login-email">E-mail</label>

          <input
            id="login-email"
            name="email"
            type="email"
            value="${esc(email || "")}"
            placeholder="seu@email.com"
          />
        </div>

        <div class="field">
          <label for="login-pass">Senha</label>

          <div class="password-wrap">

            <input
              id="login-pass"
              name="senha"
              type="password"
              placeholder="Insira sua senha"
            />

            <button
              type="button"
              data-eye
              aria-label="Mostrar senha"
            >
              ${UI.icon("eye")}
            </button>

          </div>
        </div>

        <button
          type="button"
          class="link-btn"
          data-forgot
        >
          Esqueceu sua senha?
        </button>

        <div class="form-actions mt">

          <button class="btn" type="submit">
            ACESSAR
          </button>

        </div>

      </form>

      <p style="text-align:center;font-size:.8rem;margin-top:10px;color:var(--text-dim)">

        Não tem conta?

        <button class="link-btn" data-signup>
          Cadastre-se
        </button>

      </p>
    `;

  }


  // =====================================================
  // PAINEL DE CADASTRO
  // =====================================================

function signupPanel() {

  const turmas = Array.isArray(Store?.db?.turmas)
    ? Store.db.turmas
    : [];

  const disciplinas = Array.isArray(Store?.DISCIPLINAS)
    ? Store.DISCIPLINAS
    : [];

  return `
    <h2 class="auth-title">Cadastre-se</h2>

    <form data-signup-form>

      <div class="field">
        <label for="s-nome">Nome completo</label>

        <input
          id="s-nome"
          name="nome"
          type="text"
          placeholder="Digite seu nome completo"
          required
        />
      </div>


      <div class="field">
        <label for="s-email">E-mail</label>

        <input
          id="s-email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          required
        />
      </div>


      <div class="field">
        <label for="s-senha">Senha</label>

        <input
          id="s-senha"
          name="senha"
          type="password"
          placeholder="Crie uma senha"
          required
        />
      </div>


      <div class="field">
        <label for="s-conf">Confirmar senha</label>

        <input
          id="s-conf"
          name="conf"
          type="password"
          placeholder="Repita sua senha"
          required
        />
      </div>


      <div class="field">
        <label for="s-perfil">Perfil</label>

        <select id="s-perfil" name="perfil">

          <option value="aluno">
            Aluno
          </option>

          <option value="responsavel">
            Pai / Responsável
          </option>

          <option value="professor">
            Professor
          </option>

        </select>
      </div>


      <!-- =========================================
           ALUNO
      ========================================== -->

      <div
        id="signup-aluno-area"
        class="field"
      >

        <label for="s-turmaId">
          Turma
        </label>

        <select
          id="s-turmaId"
          name="turmaId"
          required
        >

          <option value="">
            Selecione sua turma
          </option>

          ${
            turmas.length
              ? turmas
                  .map(
                    (turma) => `
                      <option value="${esc(turma.id)}">
                        ${esc(turma.nome)}
                      </option>
                    `,
                  )
                  .join("")
              : `
                  <option value="">
                    Nenhuma turma cadastrada
                  </option>
                `
          }

        </select>

        <small
          id="signup-turma-info"
          style="
            display:block;
            margin-top:8px;
            color:var(--text-dim);
          "
        >
          Selecione a turma em que você está matriculado.
        </small>

      </div>


      <!-- =========================================
           RESPONSÁVEL
      ========================================== -->

      <div
        id="signup-responsavel-area"
        class="field"
        hidden
      >

        <label for="s-alunoIds">
          Alunos vinculados
        </label>

        <select
          id="s-alunoIds"
          name="alunoIds"
          multiple
          size="4"
        >

          ${
            Array.isArray(Store?.db?.alunos) &&
            Store.db.alunos.length
              ? Store.db.alunos
                  .map(
                    (aluno) => `
                      <option value="${esc(aluno.id)}">
                        ${esc(aluno.nome)}
                      </option>
                    `,
                  )
                  .join("")
              : `
                  <option value="">
                    Nenhum aluno cadastrado
                  </option>
                `
          }

        </select>

        <small
          style="
            display:block;
            margin-top:8px;
            color:var(--text-dim);
          "
        >
          Segure Ctrl para selecionar mais de um aluno.
        </small>

      </div>


      <!-- =========================================
           PROFESSOR
      ========================================== -->

      <div
        id="signup-professor-area"
        hidden
      >

        <div class="field">

          <label for="s-turmaIds">
            Turmas
          </label>

          <select
            id="s-turmaIds"
            name="turmaIds"
            multiple
            size="4"
          >

            ${
              turmas.length
                ? turmas
                    .map(
                      (turma) => `
                        <option value="${esc(turma.id)}">
                          ${esc(turma.nome)}
                        </option>
                      `,
                    )
                    .join("")
                : `
                    <option value="">
                      Nenhuma turma cadastrada
                    </option>
                  `
            }

          </select>

          <small
            style="
              display:block;
              margin-top:8px;
              color:var(--text-dim);
            "
          >
            Selecione todas as turmas que o professor atende.
          </small>

        </div>


        <div class="field">

          <label for="s-disciplinas">
            Disciplinas
          </label>

          <select
            id="s-disciplinas"
            name="disciplinas"
            multiple
            size="4"
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

          <small
            style="
              display:block;
              margin-top:8px;
              color:var(--text-dim);
            "
          >
            Selecione todas as disciplinas ministradas.
          </small>

        </div>

      </div>


      <div class="form-actions">

        <button
          type="button"
          class="btn btn--outline"
          data-back
        >
          Voltar
        </button>

        <button
          class="btn"
          type="submit"
        >
          Cadastrar
        </button>

      </div>

    </form>
  `;
}

async function carregarOpcoesCadastro() {
  try {
    const firebase = await window.EducaFirebaseReady;

    const turmasSnapshot = await firebase.getDocs(
      firebase.collection(firebase.db, "turmas")
    );

    const alunosSnapshot = await firebase.getDocs(
      firebase.collection(firebase.db, "alunos")
    );

    Store.db.turmas = turmasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    Store.db.alunos = alunosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("📚 Turmas carregadas para cadastro:", Store.db.turmas);
    console.log("👩‍🎓 Alunos carregados para cadastro:", Store.db.alunos);

  } catch (error) {
    console.error("❌ Erro ao carregar opções do cadastro:", error);
  }
}
  // =====================================================
  // RENDER AUTH
  // =====================================================

async function renderAuth(panel, email) {
  const holder = document.getElementById("auth-panels");

  if (panel === "signup") {
    await carregarOpcoesCadastro();
  }

  holder.innerHTML =
    panel === "signup"
      ? signupPanel()
      : loginPanel(email);

  bindAuth();
}


  // =====================================================
  // EVENTOS DE LOGIN / CADASTRO
  // =====================================================

  function bindAuth() {

    const holder =
      document.getElementById("auth-panels");


    // ===================================================
    // LOGIN
    // ===================================================

    const loginForm =
      holder.querySelector("[data-login]");


    if (loginForm) {

      // -----------------------------------------------
      // Mostrar / esconder senha
      // -----------------------------------------------

      holder.querySelector("[data-eye]").onclick = () => {

        const input =
          holder.querySelector("#login-pass");

        input.type =
          input.type === "password"
            ? "text"
            : "password";

      };


      // -----------------------------------------------
      // RECUPERAÇÃO DE SENHA
      // -----------------------------------------------

      holder.querySelector("[data-forgot]").onclick = async () => {

        const email =
          holder
            .querySelector("#login-email")
            .value
            .trim();

        if (!email) {

          return UI.toast(
            "Digite seu e-mail primeiro.",
            "bad"
          );

        }


        try {

          const { auth } =
            window.EducaFirebase;

          const {
            sendPasswordResetEmail
          } = await import(
            "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
          );


          await sendPasswordResetEmail(
            auth,
            email
          );


          UI.openModal(
            "Recuperação de senha",

            `

              <p style="font-size:.88rem">

                Enviamos um e-mail para

                <strong>
                  ${esc(email)}
                </strong>

                com as instruções para redefinir sua senha.

              </p>

              <div class="form-actions mt">

                <button
                  class="btn"
                  data-close-modal
                >
                  Entendi
                </button>

              </div>

            `
          );


        } catch (error) {

          console.error(
            "Erro ao enviar recuperação:",
            error
          );

          UI.toast(
            "Não foi possível enviar o e-mail de recuperação.",
            "bad"
          );

        }

      };


      // -----------------------------------------------
      // IR PARA CADASTRO
      // -----------------------------------------------

      holder.querySelector("[data-signup]").onclick = () => {

        renderAuth("signup");

      };


      // -----------------------------------------------
      // LOGIN REAL
      // -----------------------------------------------

      loginForm.onsubmit = async (e) => {

        e.preventDefault();


        const email =
          holder
            .querySelector("#login-email")
            .value
            .trim()
            .toLowerCase();


        const senha =
          holder
            .querySelector("#login-pass")
            .value;


        if (!email || !senha) {

          return UI.toast(
            "Preencha e-mail e senha.",
            "bad"
          );

        }


        try {

          const {
            auth,
            db
          } = window.EducaFirebase;


          const {
            signInWithEmailAndPassword
          } = await import(
            "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
          );


          const {
            collection,
            doc,
            getDoc
          } = await import(
            "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
          );


          // Login no Firebase Authentication

          const credential =
            await signInWithEmailAndPassword(
              auth,
              email,
              senha
            );


          const firebaseUser =
            credential.user;


          // Buscar perfil no Firestore

          const profileRef =
            doc(
              db,
              "usuarios",
              firebaseUser.uid
            );


          const profileSnap =
            await getDoc(profileRef);


          if (!profileSnap.exists()) {

            UI.toast(
              "Usuário autenticado, mas o perfil não foi encontrado.",
              "bad"
            );

            return;

          }


          const profile =
            profileSnap.data();


          // =============================================
          // CRIAR OBJETO DO USUÁRIO
          // =============================================

          const user = {

            id: firebaseUser.uid,

            email: firebaseUser.email,

            name:
              profile.name ||
              firebaseUser.displayName ||
              "Usuário",

            firstName:
              profile.firstName ||
              profile.name ||
              "Usuário",

            role:
              profile.role ||
              "aluno",

            roleLabel:
              profile.roleLabel ||
              "Aluno",

            publico:
              profile.publico ||
              "Alunos",


            // ALUNO

            ...(profile.alunoId
              ? {
                  alunoId: profile.alunoId
                }
              : {}),


            // RESPONSÁVEL

            ...(Array.isArray(profile.alunoIds)

              ? {

                  alunoIds:
                    profile.alunoIds,

                  ...(profile.alunoIds.length > 0
                    ? {
                        alunoId:
                          profile.alunoIds[0]
                      }
                    : {})

                }

              : profile.alunoId

                ? {

                    alunoIds:
                      [profile.alunoId],

                    alunoId:
                      profile.alunoId

                  }

                : {}),


            // PROFESSOR

            ...(Array.isArray(profile.turmaIds)
              ? {
                  turmaIds:
                    profile.turmaIds
                }
              : {}),


            ...(Array.isArray(profile.disciplinas)
              ? {
                  disciplinas:
                    profile.disciplinas
                }
              : {})

          };


          console.log(
            "👤 Usuário carregado do Firebase:",
            user
          );

          console.log(
            "🏫 Turmas do usuário:",
            user.turmaIds
          );

          console.log(
            "📚 Disciplinas do professor:",
            user.disciplinas
          );


          await signIn(user);

        } catch (error) {

          console.error(
            "Erro no login:",
            error
          );


          let message =
            "Não foi possível realizar o login.";


          if (
            error.code ===
            "auth/invalid-credential"
          ) {

            message =
              "E-mail ou senha incorretos.";

          }


          if (
            error.code ===
            "auth/user-not-found"
          ) {

            message =
              "Usuário não encontrado.";

          }


          if (
            error.code ===
            "auth/wrong-password"
          ) {

            message =
              "Senha incorreta.";

          }


          if (
            error.code ===
            "auth/too-many-requests"
          ) {

            message =
              "Muitas tentativas. Tente novamente mais tarde.";

          }


          UI.toast(
            message,
            "bad"
          );

        }

      };

    }


    // ===================================================
    // CADASTRO
    // ===================================================

    const signup =
      holder.querySelector(
        "[data-signup-form]"
      );


    if (signup) {

      const perfilSelect =
        signup.querySelector("#s-perfil");

      const alunoArea =
        signup.querySelector(
          "#signup-aluno-area"
        );

      const responsavelArea =
        signup.querySelector(
          "#signup-responsavel-area"
        );

      const professorArea =
        signup.querySelector(
          "#signup-professor-area"
        );


      // -----------------------------------------------
      // MOSTRAR CAMPOS DE ACORDO COM O PERFIL
      // -----------------------------------------------

function atualizarCamposCadastro() {
  const perfil = perfilSelect.value;

  // Áreas visuais
  alunoArea.hidden = perfil !== "aluno";
  responsavelArea.hidden = perfil !== "responsavel";
  professorArea.hidden = perfil !== "professor";

  // Campo de turma do ALUNO
  const turmaId = signup.querySelector("#s-turmaId");

  if (turmaId) {
    turmaId.required = perfil === "aluno";
    turmaId.disabled = perfil !== "aluno";
  }

  // Campo de alunos do RESPONSÁVEL
  const alunoIds = signup.querySelector("#s-alunoIds");

  if (alunoIds) {
    alunoIds.disabled = perfil !== "responsavel";
  }

  // Campo de turmas do PROFESSOR
  const turmaIds = signup.querySelector("#s-turmaIds");

  if (turmaIds) {
    turmaIds.disabled = perfil !== "professor";
  }

  // Campo de disciplinas do PROFESSOR
  const disciplinas = signup.querySelector("#s-disciplinas");

  if (disciplinas) {
    disciplinas.disabled = perfil !== "professor";
  }
}




      perfilSelect.addEventListener(
        "change",
        atualizarCamposCadastro
      );


      atualizarCamposCadastro();


      // -----------------------------------------------
      // VOLTAR
      // -----------------------------------------------

      holder.querySelector("[data-back]").onclick = () => {

        renderAuth("login");

      };


      // -----------------------------------------------
      // CADASTRAR
      // -----------------------------------------------

signup.onsubmit = async (e) => {
  e.preventDefault();

  // =============================================
  // PEGAR OS CAMPOS
  // =============================================

  const formData = new FormData(signup);

  const d = {
    nome: String(
      formData.get("nome") || ""
    ).trim(),

    email: String(
      formData.get("email") || ""
    ).trim().toLowerCase(),

    senha: String(
      formData.get("senha") || ""
    ),

    conf: String(
      formData.get("conf") || ""
    ),

    perfil: String(
      formData.get("perfil") || ""
    ).trim(),

    // ALUNO
    turmaId: String(
      formData.get("turmaId") || ""
    ).trim(),

    // RESPONSÁVEL
    alunoIds: formData
      .getAll("alunoIds")
      .map((id) => String(id).trim())
      .filter(Boolean),

    // PROFESSOR
    turmaIds: formData
      .getAll("turmaIds")
      .map((id) => String(id).trim())
      .filter(Boolean),

    disciplinas: formData
      .getAll("disciplinas")
      .map((disciplina) => String(disciplina).trim())
      .filter(Boolean)
  };

  console.log("📝 Dados do cadastro:", d);

  // =============================================
  // VALIDAÇÕES
  // =============================================

  if (!d.nome || !d.email) {
    return UI.toast(
      "Preencha nome e e-mail.",
      "bad"
    );
  }

  if (d.senha.length < 6) {
    return UI.toast(
      "A senha deve ter ao menos 6 caracteres.",
      "bad"
    );
  }

  if (d.senha !== d.conf) {
    return UI.toast(
      "As senhas não coincidem.",
      "bad"
    );
  }

  // ALUNO precisa escolher uma turma
  if (
    d.perfil === "aluno" &&
    !d.turmaId
  ) {
    return UI.toast(
      "Selecione a turma em que você está matriculado.",
      "bad"
    );
  }

  // RESPONSÁVEL precisa de pelo menos 1 aluno
  if (
    d.perfil === "responsavel" &&
    d.alunoIds.length === 0
  ) {
    return UI.toast(
      "Selecione pelo menos um aluno para vincular ao responsável.",
      "bad"
    );
  }

  // PROFESSOR precisa de pelo menos 1 turma
  if (
    d.perfil === "professor" &&
    d.turmaIds.length === 0
  ) {
    return UI.toast(
      "Selecione pelo menos uma turma para o professor.",
      "bad"
    );
  }

  // PROFESSOR precisa de pelo menos 1 disciplina
  if (
    d.perfil === "professor" &&
    d.disciplinas.length === 0
  ) {
    return UI.toast(
      "Selecione pelo menos uma disciplina para o professor.",
      "bad"
    );
  }

  // =============================================
  // FIREBASE
  // =============================================

  let firebaseUser = null;
  let novoAlunoId = null;

  try {

    const {
      auth,
      db
    } = window.EducaFirebase;

    // ===========================================
    // IMPORTS
    // ===========================================

    const {
      createUserWithEmailAndPassword,
      deleteUser
    } = await import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
    );

    const {
      collection,
      doc,
      setDoc,
      deleteDoc
    } = await import(
      "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
    );

    // ===========================================
    // CRIAR USUÁRIO NO AUTHENTICATION
    // ===========================================

    const credential =
      await createUserWithEmailAndPassword(
        auth,
        d.email,
        d.senha
      );

    firebaseUser = credential.user;

    console.log(
      "✅ Usuário criado no Authentication:",
      firebaseUser.uid
    );

    // ===========================================
    // DEFINIR PERFIL
    // ===========================================

    let roleLabel = "Aluno";
    let publico = "Alunos";

    if (d.perfil === "professor") {
      roleLabel = "Professor";
      publico = "Professores";
    }

    if (d.perfil === "responsavel") {
      roleLabel = "Responsável";
      publico = "Responsáveis";
    }

    // ===========================================
    // MONTAR PERFIL DO FIRESTORE
    // ===========================================

    const perfilFirestore = {
      name: d.nome,

      firstName:
        d.nome.split(" ")[0],

      email: d.email,

      role: d.perfil,

      roleLabel,

      publico
    };

    // ===========================================
    // ALUNO
    // ===========================================

    if (d.perfil === "aluno") {

      console.log(
        "🔎 Procurando turma:",
        d.turmaId
      );

      const turmaSelecionada =
        Store.find(
          "turmas",
          d.turmaId
        );

      if (!turmaSelecionada) {
        throw new Error(
          "A turma selecionada não foi encontrada."
        );
      }

      console.log(
        "🏫 Turma encontrada:",
        turmaSelecionada
      );

      // -----------------------------------------
      // CRIAR DOCUMENTO DO ALUNO
      // -----------------------------------------

      const novoAlunoRef = doc(
        collection(db, "alunos")
      );

      novoAlunoId =
        novoAlunoRef.id;

      await setDoc(
        novoAlunoRef,
        {
          nome: d.nome,

          email: d.email,

          turmaId: d.turmaId,

          turma:
            turmaSelecionada.nome || "",

          ativo: true,

          situacao: "Ativo",

          criadoEm:
            new Date().toISOString()
        }
      );

      console.log(
        "🎓 Novo aluno criado:",
        novoAlunoId
      );

      // -----------------------------------------
      // VINCULAR USUÁRIO AO ALUNO
      // -----------------------------------------

      perfilFirestore.alunoId =
        novoAlunoId;

      perfilFirestore.turmaId =
        d.turmaId;

      console.log(
        "🔗 Aluno vinculado à conta:",
        {
          alunoId: novoAlunoId,
          turmaId: d.turmaId
        }
      );
    }

    // ===========================================
    // RESPONSÁVEL
    // ===========================================

    if (
      d.perfil === "responsavel"
    ) {

      perfilFirestore.alunoIds =
        d.alunoIds;

      // Compatibilidade com sistema antigo
      perfilFirestore.alunoId =
        d.alunoIds[0];

      console.log(
        "👨‍👩‍👧 Alunos vinculados:",
        d.alunoIds
      );
    }

    // ===========================================
    // PROFESSOR
    // ===========================================

    if (
      d.perfil === "professor"
    ) {

      perfilFirestore.turmaIds =
        d.turmaIds;

      perfilFirestore.disciplinas =
        d.disciplinas;

      console.log(
        "👨‍🏫 Turmas do professor:",
        d.turmaIds
      );

      console.log(
        "📚 Disciplinas do professor:",
        d.disciplinas
      );
    }

    // ===========================================
    // SALVAR PERFIL DO USUÁRIO
    // ===========================================

    await setDoc(
      doc(
        db,
        "usuarios",
        firebaseUser.uid
      ),
      perfilFirestore
    );

    console.log(
      "✅ Perfil salvo no Firestore:",
      perfilFirestore
    );

    // ===========================================
    // ATUALIZAR STORE
    // ===========================================

    try {

      await Store.loadFirestore();

      console.log(
        "🔄 Store atualizado após cadastro."
      );

    } catch (erroStore) {

      console.warn(
        "⚠️ Não foi possível atualizar o Store imediatamente:",
        erroStore
      );
    }

    // ===========================================
    // SUCESSO
    // ===========================================

    UI.toast(
      "Cadastro realizado com sucesso!"
    );

    await renderAuth(
      "login",
      d.email
    );

  } catch (error) {

    console.error(
      "❌ ERRO COMPLETO NO CADASTRO:",
      error
    );

    // ===========================================
    // TENTAR DESFAZER CRIAÇÕES PARCIAIS
    // ===========================================

    try {

      if (
        firebaseUser &&
        novoAlunoId
      ) {

        const {
          db
        } = window.EducaFirebase;

        const {
          doc,
          deleteDoc
        } = await import(
          "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js"
        );

        await deleteDoc(
          doc(
            db,
            "alunos",
            novoAlunoId
          )
        );

        console.log(
          "🧹 Documento de aluno incompleto removido."
        );
      }

      if (firebaseUser) {

        const {
          auth
        } = window.EducaFirebase;

        const {
          deleteUser
        } = await import(
          "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
        );

        await deleteUser(
          firebaseUser
        );

        console.log(
          "🧹 Conta Authentication incompleta removida."
        );
      }

    } catch (rollbackError) {

      console.error(
        "⚠️ Não foi possível desfazer completamente o cadastro:",
        rollbackError
      );
    }

    // ===========================================
    // MENSAGENS DE ERRO
    // ===========================================

    let message =
      "Não foi possível realizar o cadastro.";

    if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      message =
        "Este e-mail já está cadastrado.";
    }

    if (
      error.code ===
      "auth/invalid-email"
    ) {

      message =
        "O e-mail informado é inválido.";
    }

    if (
      error.code ===
      "auth/weak-password"
    ) {

      message =
        "A senha é muito fraca.";
    }

    if (
      error.message ===
      "A turma selecionada não foi encontrada."
    ) {

      message =
        "A turma selecionada não foi encontrada.";
    }

    UI.toast(
      message,
      "bad"
    );
  }
};

    }

  }


  // =====================================================
  // LOGIN E CARREGAMENTO DOS DADOS
  // =====================================================

  async function signIn(user) {

    try {

      Store.session(user);

      await Store.loadFirestore();


      UI.renderShell(user);


      UI.toast(
        `Bem-vindo(a), ${user.name}!`
      );


      if (
        location.hash !== "#/painel"
      ) {

        location.hash =
          "#/painel";

      } else {

        UI.render();

      }

    } catch (error) {

      console.error(
        "Erro ao carregar os dados do Firebase:",
        error
      );


      UI.toast(
        "Login realizado, mas não foi possível carregar os dados do sistema.",
        "bad"
      );

    }

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  async function signOut() {

    try {

      const {
        auth
      } = window.EducaFirebase;


      const {
        signOut: firebaseSignOut
      } = await import(
        "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js"
      );


      await firebaseSignOut(
        auth
      );


    } catch (error) {

      console.error(
        "Erro ao sair do Firebase:",
        error
      );

    }


    Store.session(null);


    document.getElementById(
      "app"
    ).hidden = true;


    document.getElementById(
      "auth-screen"
    ).hidden = false;


    renderAuth("login");

  }


  // =====================================================
  // BOOTSTRAP
  // =====================================================

  Store.load();

  UI.initTheme();

  UI.initShellEvents();

  renderAuth("login");


  window.Auth = {
    signOut
  };


  document
    .getElementById("user-chip")
    .addEventListener(
      "click",
      () => UI.go("conta")
    );


  // =====================================================
  // RESTAURAR SESSÃO
  // =====================================================

  const session =
    Store.session();


  if (session) {

    (async () => {

      try {

        console.log(
          "☁️ Sessão encontrada. Carregando dados do Firestore..."
        );


        await Store.loadFirestore();


        console.log(
          "✅ Dados carregados. Restaurando sessão..."
        );


        UI.renderShell(session);

        UI.render();


      } catch (error) {

        console.error(
          "❌ Erro ao restaurar a sessão:",
          error
        );


        Store.session(null);


        document.getElementById(
          "app"
        ).hidden = true;


        document.getElementById(
          "auth-screen"
        ).hidden = false;


        renderAuth("login");


        UI.toast(
          "Sua sessão expirou. Faça login novamente.",
          "bad"
        );

      }

    })();

  }

})();