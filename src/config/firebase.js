import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBzD10r38w6FyD3VzVwBpsrBpZT13uNkxI",
    authDomain: "schede-telefoniche-3a36f.firebaseapp.com",
    databaseURL: "https://schede-telefoniche-3a36f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "schede-telefoniche-3a36f",
    storageBucket: "schede-telefoniche-3a36f.appspot.com",
    messagingSenderId: "498585607656",
    appId: "1:498585607656:web:9689720270f034cf82585d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
