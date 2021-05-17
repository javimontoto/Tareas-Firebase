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

/*** SELECTORES ***/
const loginModalButton = document.getElementById('login-modal-button'),
    registerModalButton = document.getElementById('register-modal-button'),
    loginButton = document.getElementById('login-button'),
    registerButton = document.getElementById('register-button'),
    verificationButton = document.getElementById('verification-button'),
    logoutButton = document.getElementById('logout-button');


/*** LISTENERS ***/
loginButton.addEventListener('click', singInFB, false);
registerButton.addEventListener('click', signUpFB, false);
verificationButton.addEventListener('click', sendEmailVerification, false);
logoutButton.addEventListener('click', signOutFB, false);


/*** AUTENTIFICACIÓN ***/
/**
 * Entra en Firebase
 */
function singInFB() {

    if (!firebase.auth().currentUser) {
        let email = document.getElementById('email-login').value,
            password = document.getElementById('pass-login').value;

        if (!checkEmailAndPass(email, password, 'login'))
            return;

        // Sign in with email and pass.
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                closeModal('login-modal');
                console.log('Entramos con email: ', firebase.auth().currentUser.email);
                showCloseButton(true);
                // ...
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
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
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

function sendPasswordReset() {
    var email = document.getElementById('email').value;
    firebase.auth().sendPasswordResetEmail(email).then(function() {
        // Password Reset Email Sent!
        myAlert('Atención', 'Password Reset Email Sent!');
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

/**
 * Muestra u oculta el botón de cerrar sesión, y a la vez muestra u oculta los botones de entrar y registrarse
 * @param {boolean} show True = muestra, False = oculta
 */
function showCloseButton(show) {
    if (show) {
        // Mostramos el botón de salir y ocultamos los de entrar y registrarse
        loginModalButton.classList.replace('d-block', 'd-none');
        registerModalButton.classList.replace('d-block', 'd-none');
        logoutButton.classList.replace('d-none', 'd-block');

        // Si no ha verificado el email mostramos el botón de reenvío
        if (!firebase.auth().currentUser.emailVerified) {
            verificationButton.classList.replace('d-none', 'd-block');
        }

    } else {
        // Ocultamos el botón de salir y mostramos los de entrar y registrarse
        loginModalButton.classList.replace('d-none', 'd-block');
        registerModalButton.classList.replace('d-none', 'd-block');
        logoutButton.classList.replace('d-block', 'd-none');
        verificationButton.classList.replace('d-block', 'd-none');
    }
}

/**
 * Cierra la modal con el id proporcionado
 * @param {string} modalId Id de la modal: login-modal, register-modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('style', 'display: none');

    // get modal backdrops
    const modalsBackdrops = document.getElementsByClassName('modal-backdrop');

    // remove every modal backdrop
    for (let i = 0; i < modalsBackdrops.length; i++) {
        document.body.removeChild(modalsBackdrops[i]);
    }
}

/**
 * Comprueba si el email y la contraseña tienen el formato adecuado y si no marca en rojo el campo
 * @param {String} email 
 * @param {String} pass 
 * @param {String} type Acción que lo ejecuta: login o register
 * @returns true / false
 */
function checkEmailAndPass(email, pass, type) {
    let result = true;
    const mailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    console.log(`Email: ${email.length}, pass: ${pass} y type: ${type}`);

    // Comprobamos el email
    const emailInput = document.getElementById('email-' + type);
    if (email.length === 0 || !mailFormat.test(String(email).toLowerCase())) {
        emailInput.classList.add('is-invalid');
        emailInput.nextElementSibling.classList.replace('d-none', 'd-block');
        result = false;
    } else {
        emailInput.classList.remove('is-invalid');
        emailInput.nextElementSibling.classList.replace('d-block', 'd-none');
    }

    // Comprobamos la contraseña
    const passInput = document.getElementById('pass-' + type);
    if (pass.length < 6) {
        passInput.classList.add('is-invalid');
        passInput.nextElementSibling.classList.replace('d-none', 'd-block');
        result = false;
    } else {
        passInput.classList.remove('is-invalid');
        passInput.nextElementSibling.classList.replace('d-block', 'd-none');
    }

    return result;
}