/* EDUCA+ — camada de dados (Firestore) */

(function () {

    const SESSION_KEY = "educaplus:session";
    const THEME_KEY = "educaplus:theme";

    const DISCIPLINAS = [
        "Matemática",
        "Português",
        "História",
        "Química",
        "Educação Física",
        "Desenvolvimento Web",
        "Banco de Dados",
    ];

    const COLLECTIONS = [
        "turmas",
        "alunos",
        "notas",
        "frequencia",
        "aulas",
        "atividades",
        "ocorrencias",
        "comunicados",
        "boletos",
        "desempenho",
        "eventos",
        "usuarios"
    ];

    let db = {
        turmas: [],
        alunos: [],
        notas: [],
        frequencia: [],
        aulas: [],
        atividades: [],
        ocorrencias: [],
        comunicados: [],
        boletos: [],
        desempenho: [],
        eventos: [],
        escola: {
            totalAlunos: 0,
            professores: 0,
            turmasAtivas: 0,
            aprovacoes: 0
        }
    };

    let firestoreCarregado = false;
    let carregando = null;


    // =====================================================
    // FIREBASE
    // =====================================================

    async function firebase() {

        if (window.EducaFirebase) {
            return window.EducaFirebase;
        }

        if (window.EducaFirebaseReady) {
            return await window.EducaFirebaseReady;
        }

        return await new Promise((resolve) => {

            window.addEventListener(
                "educa-firebase-ready",
                () => resolve(window.EducaFirebase),
                { once: true }
            );

        });
    }


    // =====================================================
    // LIMPA OBJETOS ANTES DE ENVIAR PARA O FIRESTORE
    // =====================================================

    function limparUndefined(valor) {

        if (Array.isArray(valor)) {
            return valor.map(limparUndefined);
        }

        if (valor && typeof valor === "object") {

            const novo = {};

            Object.keys(valor).forEach((chave) => {

                if (valor[chave] !== undefined) {
                    novo[chave] = limparUndefined(valor[chave]);
                }

            });

            return novo;
        }

        return valor;
    }


    // =====================================================
    // CARREGAR DADOS DO FIRESTORE
    // =====================================================

    async function carregarFirestore() {

        if (firestoreCarregado) {
            return db;
        }

        if (carregando) {
            return carregando;
        }

        carregando = (async () => {

            const fb = await firebase();

            console.log("📥 Carregando dados do Firestore...");

            const novoDB = {
                turmas: [],
                alunos: [],
                notas: [],
                frequencia: [],
                aulas: [],
                atividades: [],
                ocorrencias: [],
                comunicados: [],
                boletos: [],
                desempenho: [],
                eventos: {},
                escola: {
                    totalAlunos: 0,
                    professores: 0,
                    turmasAtivas: 0,
                    aprovacoes: 0
                }
            };

            // ---------------------------------------------
            // COLEÇÕES
            // ---------------------------------------------

            for (const nomeColecao of COLLECTIONS) {

                const referencia = fb.collection(
                    fb.db,
                    nomeColecao
                );

                const snapshot = await fb.getDocs(referencia);

                // EVENTOS TEM UM FORMATO ESPECIAL
                if (nomeColecao === "eventos") {

                    novoDB.eventos = {};

                    snapshot.docs.forEach((documento) => {

                        const dados = documento.data();

                        const data = dados.data || documento.id;

                        const titulo =
                            dados.titulo ||
                            dados.nome ||
                            dados.evento ||
                            "";

                        novoDB.eventos[data] = titulo;
                    });

                    console.log(
                        `📅 eventos: ${Object.keys(novoDB.eventos).length}`
                    );

                    continue;
                }

                // TODAS AS OUTRAS COLEÇÕES CONTINUAM COMO ARRAY
                novoDB[nomeColecao] = snapshot.docs.map(
                    (documento) => ({
                        id: documento.id,
                        ...documento.data()
                    })
                );

                console.log(
                    `📚 ${nomeColecao}: ${novoDB[nomeColecao].length}`
                );
            }

            // ---------------------------------------------
            // ESCOLA
            // ---------------------------------------------

            const escolaRef = fb.doc(
                fb.db,
                "escola",
                "config"
            );

            const escolaSnapshot = await fb.getDoc(escolaRef);

            if (escolaSnapshot.exists()) {

                novoDB.escola = {
                    ...novoDB.escola,
                    ...escolaSnapshot.data()
                };
            }

            db = novoDB;

            firestoreCarregado = true;

            console.log("✅ Dados do Firestore carregados!");

            return db;

        })();

        try {

            return await carregando;

        } finally {

            carregando = null;

        }
    }

    // =====================================================
    // SALVAR NO FIRESTORE
    // =====================================================

    async function salvarDocumento(col, registro) {

        try {

            const fb = await firebase();

            const dados = limparUndefined({
                ...registro
            });

            delete dados.id;

            const referencia = fb.doc(
                fb.db,
                col,
                String(registro.id)
            );

            await fb.setDoc(
                referencia,
                dados,
                { merge: true }
            );

            console.log(
                `☁️ ${col}/${registro.id} salvo no Firestore`
            );

        } catch (erro) {

            console.error(
                `❌ Erro ao salvar ${col}/${registro.id}:`,
                erro
            );

            throw erro;
        }
    }


    // =====================================================
    // STORE
    // =====================================================

    const Store = {

        get db() {
            return db;
        },

        set db(valor) {
            db = valor;
        },

        DISCIPLINAS,
        // Compatibilidade com o código antigo.
        // Agora os dados vêm do Firestore.
        load() {
            return this.db;
        },


        // -------------------------------------------------
        // FIRESTORE
        // -------------------------------------------------

        async loadFirestore() {
            return await carregarFirestore();
        },


        async ready() {
            return await carregarFirestore();
        },


        // -------------------------------------------------
        // MÉTODOS COMPATÍVEIS COM O SISTEMA ATUAL
        // -------------------------------------------------

        all(col) {

            return db[col] || [];

        },


        find(col, id) {

            return this.all(col).find(
                (registro) =>
                    String(registro.id) === String(id)
            );

        },


        insert(col, rec) {

            const registro = {
                ...rec
            };


            // Gera ID no próprio Firestore
            if (!registro.id) {

                const idBase =
                    col.slice(0, 2) +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2, 9);

                registro.id = idBase;

            }


            // Atualiza a memória imediatamente
            if (!db[col]) {
                db[col] = [];
            }

            db[col].unshift(registro);


            // Salva no Firebase
            salvarDocumento(
                col,
                registro
            ).catch((erro) => {

                console.error(
                    "Falha na gravação:",
                    erro
                );

            });


            return registro;

        },


        update(col, id, patch) {

            const registro = this.find(
                col,
                id
            );

            if (!registro) {
                return null;
            }


            Object.assign(
                registro,
                patch
            );


            salvarDocumento(
                col,
                registro
            ).catch((erro) => {

                console.error(
                    "Falha na atualização:",
                    erro
                );

            });


            return registro;

        },


        remove(col, id) {

            db[col] = this
                .all(col)
                .filter(
                    (registro) =>
                        String(registro.id) !== String(id)
                );


            (async () => {

                try {

                    const fb = await firebase();

                    const referencia = fb.doc(
                        fb.db,
                        col,
                        String(id)
                    );

                    await fb.deleteDoc(
                        referencia
                    );

                    console.log(
                        `🗑️ ${col}/${id} removido`
                    );

                } catch (erro) {

                    console.error(
                        `❌ Erro ao remover ${col}/${id}:`,
                        erro
                    );

                }

            })();

        },


        // -------------------------------------------------
        // COMPATIBILIDADE
        // -------------------------------------------------

        save() {

            // O banco agora é o Firestore.
            // Este método permanece apenas para
            // compatibilidade com o código antigo.

            return db;

        },


        reset() {

            console.warn(
                "⚠️ Store.reset() não apaga dados do Firestore."
            );

            return db;

        },


        // -------------------------------------------------
        // SESSÃO
        // -------------------------------------------------

        session(user) {

            if (user === undefined) {

                try {

                    return JSON.parse(
                        localStorage.getItem(
                            SESSION_KEY
                        ) || "null"
                    );

                } catch (erro) {

                    return null;

                }

            }


            if (user === null) {

                localStorage.removeItem(
                    SESSION_KEY
                );

            } else {

                localStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify(user)
                );

            }

            return user;

        },


        // -------------------------------------------------
        // TEMA
        // -------------------------------------------------

        theme(value) {

            if (value === undefined) {

                return (
                    localStorage.getItem(
                        THEME_KEY
                    ) || "dark"
                );

            }

            localStorage.setItem(
                THEME_KEY,
                value
            );

            return value;

        },


        // -------------------------------------------------
        // NOMES
        // -------------------------------------------------

        turmaNome(id) {

            const turma = this.find(
                "turmas",
                id
            );

            return turma
                ? turma.nome
                : "—";

        },


        alunoNome(id) {

            const aluno = this.find(
                "alunos",
                id
            );

            return aluno
                ? aluno.nome
                : "—";

        },


        alunosDaTurma(turmaId) {

            return this
                .all("alunos")
                .filter(
                    (aluno) =>
                        aluno.turmaId === turmaId
                );

        },


        // -------------------------------------------------
        // NOTAS
        // -------------------------------------------------

        media(n) {

            const valores = [
                n.a1,
                n.a2,
                n.av
            ]
                .map(Number)
                .filter(
                    (valor) =>
                        !isNaN(valor)
                );


            if (!valores.length) {
                return 0;
            }


            return Math.round(
                (
                    valores.reduce(
                        (soma, valor) =>
                            soma + valor,
                        0
                    ) / valores.length
                ) * 10
            ) / 10;

        },


        situacaoNota(media) {

            if (media >= 7) {

                return {
                    label: "Aprovado",
                    cls: "tag--ok"
                };

            }


            if (media >= 5) {

                return {
                    label: "Em Recuperação",
                    cls: "tag--warn"
                };

            }


            return {
                label: "Reprovado",
                cls: "tag--bad"
            };

        },


        mediaGeralAluno(alunoId) {

            const notas = this
                .all("notas")
                .filter(
                    (nota) =>
                        nota.alunoId === alunoId
                );


            if (!notas.length) {
                return 0;
            }


            const soma = notas.reduce(
                (total, nota) =>
                    total + this.media(nota),
                0
            );


            return Math.round(
                (soma / notas.length) * 10
            ) / 10;

        },


        // -------------------------------------------------
        // FREQUÊNCIA
        // -------------------------------------------------

        faltasAluno(alunoId) {

            return this
                .all("frequencia")
                .filter(
                    (registro) =>
                        registro.alunoId === alunoId &&
                        registro.status === "Falta"
                )
                .length;

        },


        frequenciaAluno(alunoId) {

            const registros = this
                .all("frequencia")
                .filter(
                    (registro) =>
                        registro.alunoId === alunoId
                );


            if (!registros.length) {
                return 100;
            }


            const presentes = registros.filter(
                (registro) =>
                    registro.status !== "Falta"
            ).length;


            return Math.round(
                (presentes / registros.length) * 100
            );

        },


        frequenciaTurma(turmaId) {

            const registros = this
                .all("frequencia")
                .filter(
                    (registro) =>
                        registro.turmaId === turmaId
                );


            if (!registros.length) {
                return 100;
            }


            const presentes = registros.filter(
                (registro) =>
                    registro.status !== "Falta"
            ).length;


            return Math.round(
                (presentes / registros.length) * 100
            );

        },


        frequenciaGeral() {

            const registros =
                this.all("frequencia");


            if (!registros.length) {
                return 100;
            }


            const presentes =
                registros.filter(
                    (registro) =>
                        registro.status !== "Falta"
                ).length;


            return Math.round(
                (presentes / registros.length) * 100
            );

        },


        // -------------------------------------------------
        // COMUNICADOS
        // -------------------------------------------------

        comunicadosPara(publico) {

            if (
                !publico ||
                publico === "Todos"
            ) {

                return this.all(
                    "comunicados"
                );

            }


            return this
                .all("comunicados")
                .filter(
                    (comunicado) =>
                        comunicado.publico === "Todos" ||
                        comunicado.publico === publico
                );

        },


        // -------------------------------------------------
        // FORMATAÇÃO
        // -------------------------------------------------

        money(valor) {

            return (
                "R$ " +
                Number(valor)
                    .toFixed(2)
                    .replace(".", ",")
            );

        },


        date(iso) {

            if (!iso) {
                return "—";
            }


            const partes =
                String(iso).split("-");


            if (partes.length !== 3) {
                return iso;
            }


            const [ano, mes, dia] =
                partes;


            return `${dia}/${mes}/${ano}`;

        }

    };


    // =====================================================
    // FUNÇÃO ESPECIAL PARA EXCLUSÃO DE ALUNO
    // =====================================================

    Store.removeAlunoCascade = function (alunoId) {

        const relacionadas = [
            "notas",
            "frequencia",
            "ocorrencias",
            "boletos"
        ];


        // Remove o aluno
        this.remove(
            "alunos",
            alunoId
        );


        // Remove dados relacionados
        relacionadas.forEach(
            (colecao) => {

                const registros = this
                    .all(colecao)
                    .filter(
                        (registro) =>
                            registro.alunoId === alunoId
                    );


                registros.forEach(
                    (registro) => {

                        this.remove(
                            colecao,
                            registro.id
                        );

                    }
                );

            }
        );

    };


    // =====================================================
    // DISPONIBILIZA GLOBALMENTE
    // =====================================================

    window.Store = Store;


    console.log(
        "🗃️ Store carregado — modo Firestore"
    );

})();