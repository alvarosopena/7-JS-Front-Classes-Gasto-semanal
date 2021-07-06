//Variables y Selectores
const formulario = document.querySelector("#agregar-gasto")
const gastoListado = document.querySelector("#gastos ul")


//Eventos
eventListeners();
function eventListeners (){
    document.addEventListener("DOMContentLoaded", preguntarPresupuesto);

    formulario.addEventListener("submit", agregarGasto)

}


//Clases
/* hacemos dos clases viendo el proyecto */
/* una que controle el presupuesto,
otra que se encarge de mostrar el hmtl de gastos o validaciones UI */

class Presupuesto {
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }



    nuevoGasto(gasto){
        //spread operator, una copia de this gastos y pasamos el nuevo gasto al final
        this.gastos =[...this.gastos, gasto];
        this.calcularRestante ();
       
    }

    calcularRestante(){
        //itera sobre el arreglo de gastos
        const gastado = this.gastos.reduce(( total, gasto) => total + gasto.cantidad, 0); //reduce() itera sobre los elementos y hace un total
        
        console.log (gastado);

        this.restante = this.presupuesto - gastado;

        console.log ( this.restante );
    }


    eliminarGasto(id){
        //iteramos los gastos y traemos todos menos el que queremos eliminar
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);

        //elimino un gasto y vuelvo a calcular restante
        this.calcularRestante();

    }
}

class UI {
    insertarPresupuesto (cantidad){
        //Extraemos los valores
        const { presupuesto , restante } = cantidad;

        //Agregar al HTML
        document.querySelector("#total").textContent = presupuesto;
        document.querySelector("#restante").textContent = restante;

    }

    imprimirAlerta(mensaje, tipo){
        //crear el div
        const divMensaje = document.createElement("div");
        divMensaje.classList.add("text-center", "alert"); //Bootstrap
        if (tipo === "error"){
            divMensaje.classList.add ("alert-danger");
        } else {
            divMensaje.classList.add ("alert-success");
        }

        //Mensaje
        divMensaje.textContent = mensaje;

        //Insertar en el HTML
        document.querySelector(".primario").insertBefore(divMensaje, formulario); //insertbefore dos argumentos, el mensaje y donde
        
        //Quitar el HTML
        setTimeout(() => {
            divMensaje.remove();
        }, 2000);

    }

    mostrarGastos(gastos){

        this.limpiarHTML(); //Elimina el hmtl previo (abajo esta definida la function)
        
        //Iterar sobre los gastos
        gastos.forEach (gasto => {
            //destructuring
            const { cantidad, nombre, id} = gasto

            //Crear un LI
            const nuevoGasto = document.createElement("li");
            //Diferencia entre classList reporta que classes hay y va con .add o . remove 
            //y className reporta las classes q hay y podemos asignar un valor diferente
            nuevoGasto.className = "list-group-item d-flex justify-content-between align-items-center" //todo bootstrap
            
            //crear atributo, nombre y valor //FORMA VIEJA
           /*  nuevoGasto.setAttribute("data-id", id); */
            
           // Forma NUEVA - el dataset es como poner ("data-") el . le da el nombre y = valor 
            nuevoGasto.dataset.id = id;

            console.log(nuevoGasto)

            //Agregar el HTML del gasto
            nuevoGasto.innerHTML = `${nombre} <span class ="badge badge-primary badge-pill"> $ ${cantidad} </span>`;


            //Boton para borrar el gasto
            const btnBorrar = document.createElement("button");
            btnBorrar.classList.add("btn", "btn-danger", "borrar-gasto");
            btnBorrar.textContent ="X";

            //eliminar item
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }

            nuevoGasto.appendChild(btnBorrar);


            //Agregar al HTML
            gastoListado.appendChild(nuevoGasto);
            //appendchild no borra los registros o html previos, hay que hacer una funcion que limpie el html

        })
    }

    limpiarHTML(){
        while (gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild)
        }
    }

    actualizarRestante(restante){
        document.querySelector("#restante").textContent = restante;
    }

    comprobarPresupuesto(presupuestoObj){
        const { presupuesto, restante } = presupuestoObj;

        const restanteDiv = document.querySelector(".restante");

        //Comprobar 25%
        if( ( presupuesto / 4 ) > restante ){
            restanteDiv.classList.remove("alert-success", "alert-warning");
            restanteDiv.classList.add("alert-danger");

        //Comprobar 50%
        } else if ( ( presupuesto / 2 ) > restante ){
            restanteDiv.classList.remove("alert-success");
            restanteDiv.classList.add("alert-warning");
        //en caso q este en rojo o amarillo y vuelva a verde

        } else {
            restanteDiv.classList.remove("alert-danger","alert-warning");
            restanteDiv.classList.add("alert-success");
        }

        //si el total es 0 o menor - mensaje y desactivo el boton
        if ( restante <= 0){
            ui.imprimirAlerta("El presupuesto se ha agotado", "error");

            formulario.querySelector('button[type="submit"]').disabled = true;
        }
    }

}

//Instanciar
//global
const ui = new UI ();
let presupuesto; //lo iniciamos vacio


//Funciones

function preguntarPresupuesto(){
    const presupuestoUsuario = prompt("¿Cual es tu presupuesto?")

   /*  console.log( Number( presupuestoUsuario) ); */ //Number () convierte texto a numero si es posible sino da NaN
    
    //Si el presupuesto esta vacio o pone cancelar
    if(presupuestoUsuario === "" || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <=0 ){
        window.location.reload(); //Recarga la ventana actual
    } 

    //Presupuesto valido
    presupuesto = new Presupuesto(presupuestoUsuario);
    console.log(presupuesto);

    ui.insertarPresupuesto(presupuesto);

}

//Añade gastos //como es un submit ponemos prevent default
function agregarGasto(e){
    e.preventDefault();


    //Leer los datos del formulario
    const nombre = document.querySelector("#gasto").value;
    const cantidad = Number(document.querySelector("#cantidad").value); //si no ponemos el number lo pasa como string

    //Validar
    if (nombre === "" || cantidad === ""){
     ui.imprimirAlerta("Ambos campos son obligatorios", "error");
        return;
    } else if(cantidad <= 0 || isNaN(cantidad) ){
        ui.imprimirAlerta("Cantidad no valida", "error");
        return;
    }

    //Generar un objeto con el gasto
    //se crea object literal, lo contrario a destructuring
    const gasto = { nombre, cantidad, id: Date.now() }

    //añade un nuevo gasto
    presupuesto.nuevoGasto( gasto );
    
    //Mensaje de agregado
    ui.imprimirAlerta("Agregado!") //no agregamos metodo porque esta en el else
    

    //Imprimir los gastos
    //destructuring
    const { gastos, restante } = presupuesto;

    ui.mostrarGastos(gastos);

    ui.actualizarRestante (restante);

    ui.comprobarPresupuesto(presupuesto);


    //Reinicia el formulario despues de agregado
    formulario.reset();
   
}

function eliminarGasto(id){
    //elimina gastos del objeto
    presupuesto.eliminarGasto(id);

    //elimina gastos del html
    const { gastos, restante } = presupuesto;

    ui.mostrarGastos(gastos);

    ui.actualizarRestante (restante);

    ui.comprobarPresupuesto(presupuesto);

}