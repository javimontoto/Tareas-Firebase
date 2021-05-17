/*** SELECTORES ***/
const formulario = document.getElementById('formulario'),
    input = document.getElementById('input'),
    listaTareas = document.getElementById('lista-tareas'),
    template = document.getElementById('template').content,
    fragment = document.createDocumentFragment();


/*** VARIABLES ***/
let tareas = {}; //=> Contiene las tareas 


/*** LISTENERS ***/
document.addEventListener('DOMContentLoaded', () => {
    // Incializamos Firebase
    initFirebase();

    // Recuperamos las tareas guardas en localStorage
    if (localStorage.getItem('tareas'))
        tareas = JSON.parse(localStorage.getItem('tareas'));

    pintarTareas();
});

listaTareas.addEventListener('click', e => {
    btnAccion(e);
})

formulario.addEventListener('submit', e => {
    e.preventDefault();
    setTarea(e);
});


/*** FUNCIONES ***/

/**
 * Guardar la tarea
 * @param {event} e 
 */
function setTarea(e) {
    if (input.value.trim() === '')
        return;

    // Creamos la tarea
    const tarea = {};
    tarea.id = Date.now();
    tarea.texto = input.value;
    tarea.estado = false;

    // Añadimos a la colección
    tareas[tarea.id] = tarea;

    formulario.reset();
    input.focus();

    pintarTareas();
}

/**
 * Pintar las tareas que esten guardadas
 */
function pintarTareas() {

    // Guardamos en localStorage
    localStorage.setItem('tareas', JSON.stringify(tareas));

    // Comprobamos si la lista de objetos está vacía
    if (Object.values(tareas).length === 0) {
        listaTareas.innerHTML = `<div class="alert alert-dark text-center">No hay tareas pendientes 😍</div>`;
        return;
    }

    // Limpiamos la lista de tareas
    listaTareas.innerHTML = '';

    Object.values(tareas).forEach(tarea => {
        const clone = template.cloneNode(true);
        clone.querySelector('p').textContent = tarea.texto;

        // Comprobamos si la tarea tiene el estado realizada
        if (tarea.estado) {
            // Cambiamos el fondo
            clone.querySelector('.alert-warning').classList.replace('alert-warning', 'alert-success');

            // Actualizamos icono del check por el de deshacer y su title
            const firstActionButton = clone.querySelectorAll('.fas')[0];
            firstActionButton.classList.replace('fa-check-circle', 'fa-undo-alt');
            firstActionButton.setAttribute('title', 'Reactivar');

            // Tachamos el texto de la tarea
            clone.querySelector('p').style.textDecoration = 'line-through';
        }

        // Guardamos el id en dataset de cada uno de los iconos
        clone.querySelectorAll('.fas')[0].dataset.id = tarea.id
        clone.querySelectorAll('.fas')[1].dataset.id = tarea.id
        fragment.appendChild(clone);
    });

    listaTareas.appendChild(fragment);
}

/**
 * Acciones de los botones de tarea
 * @param {event} e 
 */
function btnAccion(e) {

    // Botón marcar realizada
    if (e.target.classList.contains('fa-check-circle')) {
        tareas[e.target.dataset.id].estado = true;
        pintarTareas();
    }

    // Botón borrar tarea
    if (e.target.classList.contains('fa-minus-circle')) {
        delete tareas[e.target.dataset.id];
        pintarTareas();
    }

    // Botón deshacer marcar tarea realizada
    if (e.target.classList.contains('fa-undo-alt')) {
        tareas[e.target.dataset.id].estado = false;
        pintarTareas();
    }

    e.stopPropagation();
}