// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAYgfhxt5RjLux_8nkE9QQKUrhg708vnxo",
  authDomain: "tareas-4ed92.firebaseapp.com",
  databaseURL: "https://tareas-4ed92-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "tareas-4ed92",
  storageBucket: "tareas-4ed92.appspot.com",
  messagingSenderId: "61545782860",
  appId: "1:61545782860:web:5d3c42ab7f17d927e81ee9",
  measurementId: "G-05Y0MNZ8JN"
};


/**
 * Initialize Firebase
 */
function initFirebase() {
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
}
