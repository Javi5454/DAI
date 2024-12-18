//Se ejecuta cuando la página está completamente cargada
document.addEventListener('DOMContentLoaded', () => {
    console.log("Iniciando fetch del rating...");

    const ele_stars = document.getElementsByClassName('stars'); //Todos los elementos de la clase stars que haya

    for (const ele of ele_stars) { //Para cada evento, calculamos sus estrellas
        const ide = ele.dataset._id;

        //Realizamos el fetch para obtener las estrellas asociadas al _id
        fetch(`/api/ratings/${ide}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error en la solicitud: ${response.status}`);
                }
                return response.json(); //Convertimos la respuesta a JSON
            })
            .then(product => {
                //Extraemos solo el rating.rate de la respuesta
                const rating = product.rate;

                if (rating == undefined) {
                    throw new Error(`El producto con id ${ide} no tiene un rating válido`);
                }

                //Generamos el HTML con las estrellas basándonos en el rating recibido
                let html_nuevo = '';

                for (let i = 1; i <= 5; i++) {
                    if (i <= Math.round(rating)) { //Redondeamos el rating
                        html_nuevo += `<span class="fa fa-star checked" data-_id="${ide}" data-star="${i}"></span>`; //Estrella llena
                    }
                    else {
                        html_nuevo += `<span class="fa fa-star" data-_id="${ide}" data-star="${i}"></span>`; //Estrella vacia
                    }
                }

                //Actualizamos el contenido del elemento
                ele.innerHTML = html_nuevo;

                //Añadimos los listeners de clic para permitir votar
                for (const ele_hijo of ele.children) {
                    ele_hijo.addEventListener('click', Vota);
                }
            })
            .catch(error => {
                console.error('Error al obtener las estrellas', error);
                ele.innerHTML = '<span class="error">Error al cargar las estrellas</span>';
            });
    }
});

//Funcion que maneja el voto del usuario
function Vota(evt) { //evt es el objeto con la informacion del evento
    const ide = evt.target.dataset._id; //ID del producto
    const pun = parseInt(evt.target.dataset.star);

    console.log(evt.target.dataset)

    if (!ide || isNaN(pun)) {
        console.log(ide);
        console.log(pun);
        console.error('Datos inválidos para votar');
    }

    const parentElement = evt.target.parentElement; //Referencia al contenedor de estrellas
    const messageElement = document.getElementById(`rating-message-${ide}`); // Contenedor del mensaje

    const estrellasOriginales = parentElement.innerHTML; //Guardamos el estado actual de las estrellas

    //Actualizamos optimistamente las estrellas en la interfaz
    let html_nuevo = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= pun) { //Redondeamos el rating
            html_nuevo += `<span class="fa fa-star checked" data-_id="${ide}" data-star="${i}"></span>`; //Estrella llena
        }
        else {
            html_nuevo += `<span class="fa fa-star" data-_id="${ide}" data-star="${i}"></span>`; //Estrella vacia
        }
    }

    parentElement.innerHTML = html_nuevo;

    //Añadimos nuevamente los listerners a las nuevas estrellas generadas
    for (const ele_hijo of parentElement.children) {
        ele_hijo.addEventListener('click', Vota);
    }

    //Realizamos el fetch para actualizar la clasificación en la BD
    fetch(`/api/vote/${ide}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', //Indicamos que enviaremos un JSON
        },
        body: JSON.stringify({
            rate: pun, //Nueva clasificacion
            count: 1,
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }

            return response.json();
        })
        .then(data => {
            console.log("Clasificación actualizada exitosamente: ", data);

            // Mostrar mensaje de confirmación
            messageElement.style.display = 'inline';
            messageElement.style.color = 'green';
            messageElement.textContent = '¡Gracias por tu voto!';

            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000); // Ocultar mensaje después de 3 segundos

            // Renovamos el elemento con las nuevas estrellas promedio devueltas por la API
            const rating = data.rating.rate; // Nueva calificación promedio
            let html_actualizado = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= Math.round(rating)) {
                    html_actualizado += `<span class="fa fa-star checked" data-_id="${ide}" data-star="${i}"></span>`;
                } else {
                    html_actualizado += `<span class="fa fa-star" data-_id="${ide}" data-star="${i}"></span>`;
                }
            }
            parentElement.innerHTML = html_actualizado;

            // Añadimos nuevamente los listeners a las nuevas estrellas generadas dinámicamente
            for (const ele_hijo of parentElement.children) {
                ele_hijo.addEventListener('click', Vota);
            }
        })
        .catch(error => {
            console.error('Error al actualizar la calificación:', error);

            // Revertimos los cambios si ocurre un error
            parentElement.innerHTML = estrellasOriginales;

            // Añadimos nuevamente los listeners para restaurar funcionalidad
            for (const ele_hijo of parentElement.children) {
                ele_hijo.addEventListener('click', Vota);
            }

            // Mostrar mensaje de error
            messageElement.style.display = 'inline';
            messageElement.style.color = 'red';
            messageElement.textContent = 'Hubo un error. Inténtalo nuevamente.';

            setTimeout(() => {
                messageElement.style.display = 'none';
              }, 3000); // Ocultar mensaje después de 3 segundos
        });
}