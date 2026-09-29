import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    updatePassword
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =====================================================
// CONFIGURAÇÃO DO FIREBASE
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyC7LtXLVWHq0SyMRfy2eApW5N1w51Tdrug",
    authDomain: "educa-mais-851d8.firebaseapp.com",
    projectId: "educa-mais-851d8",
    storageBucket: "educa-mais-851d8.firebasestorage.app",
    messagingSenderId: "86867183660",
    appId: "1:86867183660:web:650ac9db3a552977d8e989"
};


// =====================================================
// INICIALIZAÇÃO
// =====================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =====================================================
// DISPONIBILIZA O FIREBASE PARA O RESTO DO SISTEMA
// =====================================================

const firebaseAPI = {
    app,
    auth,
    db,

    updatePassword,

    // Firestore
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    writeBatch
};


// Disponibiliza globalmente
window.EducaFirebase = firebaseAPI;


// Promise para outros arquivos esperarem o Firebase
window.EducaFirebaseReady = Promise.resolve(firebaseAPI);


// =====================================================
// EVENTO DE FIREBASE PRONTO
// =====================================================

window.dispatchEvent(
    new Event("educa-firebase-ready")
);


// =====================================================
// TESTES
// =====================================================

console.log("🔥 Firebase conectado!");
console.log("🔐 Authentication conectado!");
console.log("🗄️ Firestore conectado!");
console.log("📡 Firebase disponível para o Store!");