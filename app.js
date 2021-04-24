// Selectores
const formulario = document.getElementById('formulario'),
    input = document.getElementById('input'),
    listaTareas = document.getElementById('lista-tareas'),
    template = document.getElementById('template').content,
    fragment = document.createDocumentFragment();

// Definimos como colección de objetos
let tareas = {};

// Pintar las tareas que ya estuvieran almacenadas
document.addEventListener('DOMContentLoaded', () => {
    // Recuperamos las tareas guardas en localStorage
    if (localStorage.getItem('tareas'))
        tareas = JSON.parse(localStorage.getItem('tareas'));
        
    pintarTareas();
});

listaTareas.addEventListener('click', e => {
    btnAccion(e);
})

formulario.addEventListener('submit', e => {
    e.preventDefault(); // para evitar que se ejecute el formulario

    setTarea(e);
});

// Setear la tarea
const setTarea = e => {
    if (input.value.trim() === '') {
        console.log('vacío!!');
        return;
    }

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

// Pintar la tarea
const pintarTareas = () => {

    // Guardamos en localStorage
    localStorage.setItem('tareas', JSON.stringify(tareas));

    // Comprobamos si la lista de objetos está vacío
    if (Object.values(tareas).length === 0) {
        listaTareas.innerHTML = `<div class="alert alert-dark text-center">No hay tareas pendientes 😍</div>`;
        return;
    }

    // Limpiamos la lista de tareas
    listaTareas.innerHTML = '';

    Object.values(tareas).forEach(tarea => {
        const clone = template.cloneNode(true);
        clone.querySelector('p').textContent = tarea.texto;

        if(tarea.estado) {
            // Tarea en estado realizada
            // Cambiamos el fondo
            clone.querySelector('.alert-warning').classList.replace('alert-warning', 'alert-success');
            // Cambiamos el incono del check por el de deshacer
            clone.querySelectorAll('.fas')[0].classList.replace('fa-check-circle', 'fa-undo-alt');
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

// Botones de acción de las tareas
const btnAccion = e => {
    
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
    
    console.log(tareas);

    e.stopPropagation();
}