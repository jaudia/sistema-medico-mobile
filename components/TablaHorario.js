import * as React from 'react';

const horario = [
    {desde: "09:00", hasta: "09:30", numeroDesde: 9.00, numeroHasta: 9.30},
    {desde: "09:30", hasta: "10:00", numeroDesde: 9.30, numeroHasta: 10.00},
    {desde: "10:00", hasta: "10:30", numeroDesde: 10.00, numeroHasta: 10.30},
    {desde: "10:30", hasta: "11:00", numeroDesde: 10.30, numeroHasta: 11.00},
    {desde: "11:00", hasta: "11:30", numeroDesde: 11.00, numeroHasta: 11.30},
    {desde: "11:30", hasta: "12:00", numeroDesde: 11.30, numeroHasta: 12.00},
    {desde: "12:00", hasta: "12:30", numeroDesde: 12.00, numeroHasta: 12.30},
    {desde: "12:30", hasta: "13:00", numeroDesde: 12.30, numeroHasta: 13.00},
    {desde: "13:00", hasta: "13:30", numeroDesde: 13.00, numeroHasta: 13.30},
    {desde: "13:30", hasta: "14:00", numeroDesde: 13.30, numeroHasta: 14.00},
    {desde: "14:00", hasta: "14:30", numeroDesde: 14.00, numeroHasta: 14.30},
    {desde: "14:30", hasta: "15:00", numeroDesde: 14.30, numeroHasta: 15.00},
    {desde: "15:00", hasta: "15:30", numeroDesde: 15.00, numeroHasta: 15.30},
    {desde: "15:30", hasta: "16:00", numeroDesde: 15.30, numeroHasta: 16.00},
    {desde: "16:00", hasta: "16:30", numeroDesde: 16.00, numeroHasta: 16.30},
    {desde: "16:30", hasta: "17:00", numeroDesde: 16.30, numeroHasta: 17.00},
    {desde: "17:00", hasta: "17:30", numeroDesde: 17.00, numeroHasta: 17.30},
    {desde: "17:30", hasta: "18:00", numeroDesde: 17.30, numeroHasta: 18.00}];

export function traerHorario(numero) {
    let hora = horario[numero];
    return `${hora.desde} - ${hora.hasta}`;
}

export function traerHorarioDesde(numero) {
    let hora = horario[numero];
    return `${hora.desde}`
}

export function traerHorarioHasta(numero) {
    let hora = horario[numero];
    return `${hora.hasta}`
}

export function validarHorarioDesde(valor) {
    let resultado = false;
    let i = 0;

    while (i < horario.length && !resultado) {
        if (valor.localeCompare(horario[i].desde) === 0) {
            resultado = true;
        }
        i++;
    }
    return resultado;
}

export function validarHorarioHasta(valor) {
    let resultado = false;
    let i = 0;

    while (i < horario.length && !resultado) {
        if (valor.localeCompare(horario[i].hasta) === 0) {
            resultado = true;
        }
        i++;
    }
    return resultado;
}

export function equivalenciaDesde(valor) {
    let i = 0;
    let equivalencia = null;

    while (i < horario.length && equivalencia == null) {
        if (horario[i].desde.localeCompare(valor) === 0) {
            equivalencia = horario[i].numeroDesde;
        }
        i++;
    }

    return equivalencia

}

export function equivalenciaHasta(valor) {
    let i = 0;
    let equivalencia = null;

    while (i < horario.length && equivalencia == null) {
        if (horario[i].hasta.localeCompare(valor) === 0) {
            equivalencia = horario[i].numeroHasta;
        }
        i++;
    }

    return equivalencia
}


export function haySuperposicion(primerHoraDesde, primerHoraHasta, segundaHoraDesde, segundaHoraHasta) {
    let res = true;

    //Hay 4 posibilidades
    if ((primerHoraDesde >= segundaHoraDesde &&  //primer horario dentro del segundo
        primerHoraHasta <= segundaHoraHasta)
        ||
        (primerHoraDesde >= segundaHoraDesde && //interseccion 1
            primerHoraDesde < segundaHoraHasta)
        ||
        (primerHoraHasta > segundaHoraDesde && //interseccion 2
            primerHoraHasta <= segundaHoraHasta)
        ||
        (primerHoraDesde <= segundaHoraDesde &&  //segundo horario dentro del primero
            primerHoraHasta >= segundaHoraHasta)
    ) {
        res = false;
    }

    return res;

}

export function validarRango(desde, hasta) {

    if (equivalenciaDesde(desde) < equivalenciaHasta(hasta))
        return true;
    else
        return false;

}

export function armarHorario(arrNuevo, arrViejos) {

    let arr = [];

    /*Inicializamos el array de horarios ya sea vacio o con lo que ya habia*/
    if (typeof arrViejos !== 'undefined') {
        if (arrViejos != null)
            arrViejos.forEach(value => {
                arr.push(value);
            });

    }

    /*En caso de que no haya horarios anterioremente*/
    if (arr.length === 0) {
        for (let i = 0; i < 18; i++) {
            arr.push(false);
        }
    }

    //por cada hora nueva ingresada por el usuario, buscar en que posicion debe ir (puede ser una o mas)
    // console.log("arr inicializado: " + JSON.stringify(arr));
    // console.log("horarios ingresados: " + JSON.stringify(arrNuevo));
    arrNuevo.forEach(value => {

        horario.forEach((hora, index) => {
            if (equivalenciaDesde(value.horaDesde) < equivalenciaHasta(hora.hasta) &&
                equivalenciaHasta(value.horaHasta) >= equivalenciaHasta(hora.hasta))
                arr[index] = value.ocupado;
        });

    });

    console.log("resultado del horario: " + JSON.stringify(arr));

    return arr;

}


export function quedaEspacio(arr) {

    let vec = [];

    vec = arr.filter(value => !value);

    if (vec.length > 0)
        return true;
    return false;

}
