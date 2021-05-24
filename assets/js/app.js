/*** VARIABLES GLOBALES ***/
/** Array con las tareas */
let tareas = {};
/** Última posición ocupada */
let lastPosition = 0;
/** Objeto con el usuario usuario de FB */
let user = {}; //=> Usuario de firebase 


/*** SELECTORES ***/
const formulario = document.getElementById('formulario'),
    input = document.getElementById('input'),
    listaTareas = document.getElementById('lista-tareas'),
    pdteVerificar = document.getElementById('pendiente-verificar'),
    template = document.getElementById('template').content,
    fragment = document.createDocumentFragment(),
    loginModalButton = document.getElementById('login-modal-button'),
    registerModalButton = document.getElementById('register-modal-button'),
    loginButton = document.getElementById('login-button'),
    registerButton = document.getElementById('register-button'),
    verificationButton = document.getElementById('verification-button'),
    logoutButton = document.getElementById('logout-button'),
    resetPassButton = document.getElementById('reset-pass-button');


/*** LISTENERS ***/
document.addEventListener('DOMContentLoaded', () => {
    // Incializamos Firebase
    initFirebase();

    getAllTasks();
});

listaTareas.addEventListener('click', e => { btnAccion(e); });
formulario.addEventListener('submit', e => { addTarea(e); });
loginButton.addEventListener('click', singInFB, false);
registerButton.addEventListener('click', signUpFB, false);
verificationButton.addEventListener('click', sendEmailVerification, false);
logoutButton.addEventListener('click', signOutFB, false);
resetPassButton.addEventListener('click', sendPasswordReset, false);

/*** FUNCIONES PRINCIPALES ***/
/**
 * Carga la lista de tareas de FB si hay sesión o si no del localStorage
 */
function getAllTasks() {
    if (localStorage.getItem('user')) {
        // Tenemos usuario logueado => recuperamos tareas de FB
        user = JSON.parse(localStorage.getItem('user'));
        showCloseButton(true);
        showLoader(true);
        getFBTasks(pintarTareas);

    } else {
        // No tenemos usuario logueado
        showCloseButton(false);
    }
}

/**
 * Guardar la tarea
 * @param {Event} e 
 */
function addTarea(e) {
    e.preventDefault();

    if (input.value.trim() === '')
        return;

    // Creamos la tarea
    const tarea = {};
    tarea.id = Date.now();
    tarea.title = input.value;
    tarea.status = 'active';
    tarea.position = lastPosition + 1;

    // Comprobamos si estamos logueados y si se añadió bien la tarea a FB
    if (localStorage.getItem('user')) {
        saveTask(tarea, pintarTareas);
    }

    formulario.reset();
    input.focus();
}

/**
 * Pintar las tareas que esten guardadas
 */
function pintarTareas() {

    // Ocultamos el loader
    showLoader(false);

    // Comprobamos si la lista de objetos está vacía
    if (Object.values(tareas).length === 0) {
        listaTareas.innerHTML = `<div class="alert alert-dark text-center">No hay tareas pendientes 😍</div>`;
        return;
    }

    // Ordenamos las tareas según su posición
    sortTasks();

    // Limpiamos la lista de tareas
    listaTareas.innerHTML = '';

    Object.values(tareas).forEach(tarea => {
        const clone = template.cloneNode(true);
        clone.querySelector('li').dataset.id = tarea.id;
        clone.querySelector('p').textContent = tarea.title;

        // Comprobamos si la tarea tiene el status realizada
        if (tarea.status === 'completed') {
            // Cambiamos el fondo
            clone.querySelector('.alert-warning').classList.replace('alert-warning', 'alert-success');

            // Actualizamos icono del check por el de deshacer y su title
            const firstActionButton = clone.querySelectorAll('.fas')[0];
            firstActionButton.classList.replace('fa-check-circle', 'fa-undo-alt');
            firstActionButton.setAttribute('title', 'Reactivar');

            // Tachamos el título de la tarea
            clone.querySelector('p').style.textDecoration = 'line-through';
        }

        // Guardamos el id en dataset de cada uno de los iconos
        clone.querySelectorAll('.fas')[0].dataset.id = tarea.id;
        clone.querySelectorAll('.fas')[1].dataset.id = tarea.id;
        fragment.appendChild(clone);
    });

    listaTareas.appendChild(fragment);

    // Hacemos la lista de tareas ordenable utilizando la función de Bootstrap
    Sortable.create(listaTareas, {
        animation: 150,
        onSort: e => {
            listaTareas.querySelectorAll('li').forEach((el, index) => {
                tareas[el.dataset.id].position = index + 1;
            });

            // Actualizamos las tareas en FB
            // TODO: Crear función que guarde todas las tareas a la vez
            Object.values(tareas).forEach(tarea => saveTask(tarea));
        }
    });

}

/**
 * Acciones de los botones de tarea
 * @param {Event} e 
 */
function btnAccion(e) {

    // Botón marcar realizada
    if (e.target.classList.contains('fa-check-circle')) {
        tareas[e.target.dataset.id].status = 'completed';
        updateTask(tareas[e.target.dataset.id]);
    }

    // Botón deshacer marcar tarea realizada
    if (e.target.classList.contains('fa-undo-alt')) {
        tareas[e.target.dataset.id].status = 'active';
        updateTask(tareas[e.target.dataset.id]);
    }

    // Botón borrar tarea
    if (e.target.classList.contains('fa-minus-circle')) {
        removeTask(tareas[e.target.dataset.id]);
        delete tareas[e.target.dataset.id];
    }

    pintarTareas();

    e.stopPropagation();
}



/*** FUNCIONES AUXILIARES ***/
/**
 * Muestra u oculta el botón de cerrar sesión, y a la vez muestra u oculta los botones de entrar y registrarse
 * @param {boolean} show True = muestra, False = oculta
 */
function showCloseButton(show) {
    if (show) {
        // Mostramos el botón de salir y ocultamos los de entrar y registrarse
        loginModalButton.classList.replace('active', 'hidden');
        registerModalButton.classList.replace('active', 'hidden');
        logoutButton.classList.replace('hidden', 'active');

        // Si no ha verificado el email mostramos el botón de reenvío
        if (user.emailVerified) {
            formulario.classList.replace('hidden', 'active');
            listaTareas.classList.replace('hidden', 'active');
        } else {
            pdteVerificar.classList.replace('hidden', 'active');
        }

    } else {
        // Ocultamos el botón de salir y mostramos los de entrar y registrarse
        logoutButton.classList.replace('active', 'hidden');
        pdteVerificar.classList.replace('active', 'hidden');
        formulario.classList.replace('active', 'hidden');
        listaTareas.classList.replace('active', 'hidden');
        loginModalButton.classList.replace('hidden', 'active');
        registerModalButton.classList.replace('hidden', 'active');

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
 * @param {String} type Acción que lo ejecuta: login, register o resetPass
 * @returns {Boolean}
 */
function checkEmailAndPass(email, pass, type) {
    let result = true,
        resetPass = false;
    const mailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Si la acción es resetear contraseña 
    if (type === 'resetPass') {
        type = 'login';
        resetPass = true;
    }

    // Comprobamos el email
    const emailInput = document.getElementById('email-' + type);
    if (email.length === 0 || !mailFormat.test(String(email).toLowerCase())) {
        emailInput.classList.add('is-invalid');
        emailInput.nextElementSibling.classList.replace('hidden', 'active');
        result = false;
    } else {
        emailInput.classList.remove('is-invalid');
        emailInput.nextElementSibling.classList.replace('active', 'hidden');
    }

    if (!resetPass) {
        // Comprobamos la contraseña
        const passInput = document.getElementById('pass-' + type);
        if (pass.length < 6) {
            passInput.classList.add('is-invalid');
            passInput.nextElementSibling.classList.replace('hidden', 'active');
            result = false;
        } else {
            passInput.classList.remove('is-invalid');
            passInput.nextElementSibling.classList.replace('active', 'hidden');
        }
    }

    return result;
}

/**
 * Muestra u oculta el gif de cargando
 * @param {Boolean} show Muestra (true) u oculta (false)
 */
function showLoader(show) {
    if (show) {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.classList.add('center');
        listaTareas.appendChild(loader);
    } else if (document.getElementById('loader')) {
        document.getElementById('loader').remove();
    }
}

/**
 * Ordena las tareas según el campo posición
 */
function sortTasks() {
    let tareasArray = Object.values(tareas);
    if (tareasArray.length > 1) {
        tareasArray.sort((a, b) => {
            return a.position - b.position;
        });
        lastPosition = tareasArray[tareasArray.length - 1].position;
        tareas = {};
        tareasArray.forEach(tarea => tareas[tarea.id] = tarea);

    } else
        lastPosition = 1;

}