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


/*** AUTENTIFICACIÓN ***/
/**
 * Entra en Firebase
 */
function singInFB() {

    if (Object.keys(user).length === 0) {
        let email = document.getElementById('email-login').value,
            password = document.getElementById('pass-login').value;

        if (!checkEmailAndPass(email, password, 'login'))
            return;

        // Sign in with email and pass.
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                closeModal('login-modal');
                user = firebase.auth().currentUser;
                localStorage.setItem('user', JSON.stringify(user));
                showCloseButton(true);
                getAllTasks();
            })
            .catch((error) => {
                // Handle Errors here.
                closeModal('login-modal');
                const errorCode = error.code;
                const errorMessage = error.message;
                switch (errorCode) {
                    case 'auth/wrong-password':
                        myAlert('Atención', 'La contraseña es incorrecta.');
                        break;
                    case 'auth/user-not-found':
                        myAlert('Atención', 'No hay ningún usuario con ese email.')
                        break;
                    default:
                        myAlert('Atención', errorMessage);
                        break;
                }
                console.log(error);
                showCloseButton(false);
            });
    } else {
        console.log('Había usuario');
        closeModal('login-modal');
    }
}

/**
 * Registra nuevo usuario en Firebase
 */
function signUpFB() {

    const email = document.getElementById('email-register').value;
    const password = document.getElementById('pass-register').value;

    if (!checkEmailAndPass(email, password, 'register'))
        return;

    // Create user with email and pass.
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            closeModal('register-modal');
            showCloseButton(true);

            // Enviamos correo de verificación
            sendEmailVerification();

        })
        .catch((error) => {
            // Handle Errors here.
            closeModal('register-modal');

            const errorCode = error.code;
            const errorMessage = error.message;
            switch (errorCode) {
                case 'auth/weak-password':
                    myAlert('Atención', 'La contraseña debe tener al menos 6 caracteres.');
                    break;
                case 'auth/email-already-in-use':
                    myAlert('Atención', 'La dirección de correo electrónico ya está siendo utilizada por otra cuenta.');
                    break;

                default:
                    myAlert('Atención', errorMessage);
                    break;
            }

            console.log(error);
        });
}

/**
 * Cierra la sesión en Firebase
 */
function signOutFB() {
    if (user) {
        firebase.auth().signOut();
        localStorage.clear();
        user = {};
        showCloseButton(false);
    }
}

/**
 * Envía el email de verificación del correo electrónico proporcionado
 */
function sendEmailVerification() {

    firebase.auth().currentUser.sendEmailVerification()
        .then(() => {
            myAlert('Confirmación de email', 'Se ha enviado un correo electrónico para que confirme la dirección de email proporcionada.');
        })
        .catch((error) => {
            console.log(error);
        });
}

/**
 * Envía un email para resetear la contraseña
 * @returns Boolean Devuelve true si todo fue bien, false en otro caso
 */
function sendPasswordReset() {
    let email = document.getElementById('email-login').value;

    if (!checkEmailAndPass(email, '', 'resetPass'))
        return;

    firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        myAlert('Reseteo de contraseña', 'Se ha enviado un correo electrónico con las instrucciones para resetear la contraseña.');
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        if (errorCode == 'auth/invalid-email') {
            myAlert('Atención', errorMessage);
        } else if (errorCode == 'auth/user-not-found') {
            myAlert('Atención', errorMessage);
        }
        console.log(error);
    });
}


/*** MÉTODOS FB */
/**
 * Guarda la tarea en FB
 * @param {Object} task Objeto de tipo tarea con id, status y title
 */
function saveTask(task) {
    firebase.database().ref('tareas/' + user.uid + '/' + task.id).set({
            id: task.id,
            title: task.title,
            status: task.status,
            position: task.position
        })
        .catch((error) => {
            myAlert('Atención', error.message);
            return false;
        });

    return true;
}

/**
 * Recupera las tareas almacenadas en FB
 * @param {function} callback Función que se ejutará después de realizar la petición a FB si todo va bien
 */
function getFBTasks(callback) {
    const db = firebase.database().ref();
    db.child('tareas').child(user.uid).get()
        .then((taskList) => {
            if (taskList.exists()) {
                tareas = taskList.val();
            } else {
                tareas = {};
                lastPosition = 0;
            }
            callback();

        }).catch((error) => {
            myAlert('Atención', error.message);
        });

}

/**
 * Actualiza una tarea
 * @param {Object} task Objeto de tipo tarea con id, status y title
 */
function updateTask(task) {
    firebase.database().ref('tareas/' + user.uid + '/' + task.id).update({
            id: task.id,
            title: task.title,
            status: task.status,
            position: task.position
        })
        .catch((error) => {
            myAlert('Atención', error.message);
            return false;
        });
}

/**
 * Elimina una tarea
 * @param {Object} task Objeto de tipo tarea con id, status y title
 */
function removeTask(task) {
    firebase.database().ref('tareas/' + user.uid + '/' + task.id).remove()
        .catch((error) => {
            myAlert('Atención', error.message);
            return false;
        });
}