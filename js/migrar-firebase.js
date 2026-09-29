// EDUCA+ — Migração LocalStorage → Firestore

import {
  collection,
  doc,
  setDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const { db } = window.EducaFirebase;

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
  "eventos"
];

async function migrarColecao(nome, registros) {
  if (!Array.isArray(registros)) {
    console.log(`⚠️ ${nome}: nenhum array encontrado.`);
    return 0;
  }

  let total = 0;

  for (const registro of registros) {
    if (!registro || !registro.id) {
      console.warn(`⚠️ Registro ignorado em ${nome}:`, registro);
      continue;
    }

    const referencia = doc(db, nome, String(registro.id));

    await setDoc(referencia, registro, { merge: true });

    total++;
  }

  console.log(`✅ ${nome}: ${total} registro(s) migrado(s).`);

  return total;
}

async function migrarEscola(escola) {
  if (!escola) {
    console.log("⚠️ escola: nenhum dado encontrado.");
    return;
  }

  await setDoc(
    doc(db, "escola", "config"),
    escola,
    { merge: true }
  );

  console.log("✅ escola: configuração migrada.");
}

async function migrarDesempenhoEEventos() {

  console.log("📈 Migrando desempenho e eventos...");

  // ---------------------------------------------
  // DESEMPENHO
  // ---------------------------------------------

  const desempenho = [
    { id: "fev", mes: "Fev", media: 6.1 },
    { id: "mar", mes: "Mar", media: 6.4 },
    { id: "abr", mes: "Abr", media: 6.9 },
    { id: "mai", mes: "Mai", media: 7.2 },
    { id: "jun", mes: "Jun", media: 7.6 },
    { id: "jul", mes: "Jul", media: 8.0 },
    { id: "ago", mes: "Ago", media: 8.4 },
    { id: "set", mes: "Set", media: 8.8 }
  ];

  for (const registro of desempenho) {

    const referencia = doc(
      db,
      "desempenho",
      registro.id
    );

    await setDoc(
      referencia,
      {
        mes: registro.mes,
        media: registro.media
      },
      { merge: true }
    );
  }

  console.log("✅ desempenho: 8 registros migrados.");

  // ---------------------------------------------
  // EVENTOS
  // ---------------------------------------------

  const eventos = [
    {
      id: "2026-09-09",
      data: "2026-09-09",
      titulo: "Conselho de classe"
    },
    {
      id: "2026-09-15",
      data: "2026-09-15",
      titulo: "Reunião com responsáveis"
    },
    {
      id: "2026-09-18",
      data: "2026-09-18",
      titulo: "Entrega de trabalhos"
    },
    {
      id: "2026-09-22",
      data: "2026-09-22",
      titulo: "Semana técnica"
    },
    {
      id: "2026-09-28",
      data: "2026-09-28",
      titulo: "Avaliação bimestral"
    }
  ];

  for (const evento of eventos) {

    const referencia = doc(
      db,
      "eventos",
      evento.id
    );

    await setDoc(
      referencia,
      {
        data: evento.data,
        titulo: evento.titulo
      },
      { merge: true }
    );
  }

  console.log("✅ eventos: 5 registros migrados.");

  alert(
    "Desempenho e eventos foram enviados para o Firebase!"
  );
}

async function migrar() {
  try {
    console.log("🚀 Iniciando migração...");

    const dados = JSON.parse(
      localStorage.getItem("educaplus:db:v1")
    );

    if (!dados) {
      console.error(
        "❌ Nenhum banco local encontrado."
      );
      alert(
        "Nenhum dado do Educa+ foi encontrado no LocalStorage."
      );
      return;
    }

    console.log("📦 Dados encontrados:", dados);

    let totalGeral = 0;

    for (const colecao of COLLECTIONS) {
      totalGeral += await migrarColecao(
        colecao,
        dados[colecao]
      );
    }

    await migrarEscola(dados.escola);

    console.log(
      `🎉 Migração concluída! ${totalGeral} registros enviados.`
    );

    alert(
      `Migração concluída!\\n\\n${totalGeral} registros foram enviados para o Firebase.`
    );

  } catch (erro) {
    console.error("❌ Erro durante a migração:", erro);

    alert(
      "Ocorreu um erro durante a migração. Veja o Console (F12)."
    );
  }
}

window.migrarEducaFirebase = migrar;
window.migrarDesempenhoEEventos = migrarDesempenhoEEventos;

console.log(
  "🛠️ Migrador carregado. Execute: migrarEducaFirebase()"
);