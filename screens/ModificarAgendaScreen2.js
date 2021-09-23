import * as React from 'react';
import {
    AsyncStorage,
    FlatList,
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ScrollView,
    TouchableHighlight, Alert
} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import Constants from "expo-constants";
import {
    armarHorario,
    equivalenciaDesde,
    equivalenciaHasta, haySuperposicion, quedaEspacio,
    traerHorario, traerHorarioDesde, traerHorarioHasta,
    validarHorarioDesde,
    validarHorarioHasta, validarRango
} from "../components/TablaHorario";
import {PopupUnBoton} from "../components/popup";
import moment from 'moment';


function validaciones(datos, datosAnteriores) {
    let i = 0;
    let j = 0;
    let primerHoraDesde, primerHoraHasta, segundaHoraDesde, segundaHoraHasta;

    let resultado = {
        ok: true,
        mensaje: 'OK'
    }

    datos = datos.filter(value => !value.eliminar);

    return Promise.resolve(AsyncStorage.getItem('datosUsr')) //obtenemos los datos para saber si coinciden las especialidades
        .then((value) => {
            let valores = JSON.parse(value);

            if (resultado.ok) {
                // validar formato y rango
                try {
                    datos.forEach(value => {
                        // console.log(`paso por foreach con estos valores --> Desde: ${value.desde} - Hasta: ${value.h}`);

                        resultado.ok = validarHorarioDesde(value.horaDesde);
                        if (!resultado.ok) {
                            throw new Error();
                        }

                        resultado.ok = validarHorarioHasta(value.horaHasta);
                        if (!resultado.ok) {
                            throw new Error();
                        }

                        resultado.ok = validarRango(value.horaDesde, value.horaHasta);
                        if (!resultado.ok) {
                            throw new Error();
                        }

                    })
                } catch (e) {
                    resultado.mensaje = 'Los formatos o los rangos son invalidos.';
                }
            }

//En el caso de que se haya ingresado mas de un horario nuevo, validar que no se superpongan entre si
            if (resultado.ok) {
                if (datos.length > 1) {
                    if (resultado.ok) {
                        while (i < datos.length && resultado) {

                            j = i + 1;

                            primerHoraDesde = equivalenciaDesde(datos[i].horaDesde);
                            primerHoraHasta = equivalenciaHasta(datos[i].horaHasta);

                            while (j < datos.length && resultado.ok) {

                                segundaHoraDesde = equivalenciaDesde(datos[j].horaDesde);
                                segundaHoraHasta = equivalenciaHasta(datos[j].horaHasta);


                                resultado.ok = haySuperposicion(primerHoraDesde, primerHoraHasta, segundaHoraDesde, segundaHoraHasta);
                                if (!resultado.ok)
                                    resultado.mensaje = 'Hay superposicion entre las horas ingresadas.';

                                j++;
                            }

                            i++;
                        }
                    }
                }
            }

//validar datos nuevos contra datos anteriores si los hay
            if (datosAnteriores !== null) {
                if (datosAnteriores.length > 0) {

                    if (resultado.ok) {

                        i = 0;

                        const datosAnterioresFiltrado = datosAnteriores.filter(valor => valor.ocupado);

                        do {
                            j = 0;

                            primerHoraDesde = equivalenciaDesde(datos[i].horaDesde);
                            primerHoraHasta = equivalenciaHasta(datos[i].horaHasta);

                            do {

                                segundaHoraDesde = equivalenciaDesde(datosAnterioresFiltrado[j].horaDesde);
                                segundaHoraHasta = equivalenciaHasta(datosAnterioresFiltrado[j].horaHasta);

                                resultado.ok = haySuperposicion(primerHoraDesde, primerHoraHasta, segundaHoraDesde, segundaHoraHasta);

                                if (!resultado.ok)
                                    resultado.mensaje = 'Los horarios nuevos se superponen con los que ya existian.'

                                j++;
                            } while (j < datosAnterioresFiltrado.length && resultado.ok)

                            i++;
                        } while (i < datos.length && resultado.ok)
                    }
                }
            }
            return resultado;
        });
    // return resultado;
}

/*Los datosViejos se refiere a si ya habia reservas para ese dia*/
async function crearReserva(datosNuevos, reservaAntigua, datosViejos, dia, mes, anio) {

    let arr = [];

    console.log(" los datos viejos son: " + JSON.stringify(datosViejos));


    if (datosNuevos === null) {
        console.log("datos nulos");
        return null;
    }
    let resultado = await validaciones(datosNuevos, datosViejos);


    if (!resultado.ok) {
        console.log("los datos son correctos ? -- " + resultado.ok);
        console.log("mensaje: " + resultado.mensaje);
        return resultado.mensaje;
    } else {
        arr = armarHorario(datosNuevos, datosViejos);

        // console.log("el array de horarios quedo " + arr);

        let hayEspacio = quedaEspacio(arr);


        return await AsyncStorage.getItem('datosUsr')
            .then((value) => {

                let valores = JSON.parse(value);

                let objeto = {
                    medico: valores.id,
                    especialidad: 'ssss',
                    anio: anio,
                    mes: mes,
                    dia: dia,
                    hayEspacio: hayEspacio,
                    horarios: arr
                };

                // console.log("");
                // console.log(`URL FINAL -- https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/crearReserva/?hayEspacio=${hayEspacio}&idmedico=${valores.id}&anio=${anio}&mes=${mes}&dia=${dia}${urlHorario}`);

                return fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/crearReserva/?hayEspacio=${hayEspacio}&idmedico=${valores.id}&anio=${anio}&mes=${mes}&dia=${dia}`, {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(objeto)
                })
                    .then(resp => {
                        console.log("Se cancelada correctamente.");
                        return "Se creo la reserva.";
                    })

                    .catch(err => {
                        console.log(`Hubo un error al internar anular la reserva`);
                        return `Hubo un error al crear la reserva`;
                    });
            });
    }
}

function ItemInput(props) {
    const [aparicionState, setApararicionState] = React.useState({
        eliminar: false,
    });


    return (
        <>
            {!props.datos.eliminar && !aparicionState.eliminar &&

            <View style={styles.itemInput}>
                <View style={styles.itemInputHoras}>
                    <TextInput style={styles.formatoHora}
                               onChangeText={text => {
                                   props.datos.horaDesde = text;
                               }}
                               autoCorrect={false}
                    >
                        {props.datos.horaDesde}
                    </TextInput>
                    <Text style={{
                        color: '#FFFFFF',
                        textAlignVertical: 'center',
                    }}> A </Text>

                    <TextInput style={styles.formatoHora}
                               onChangeText={text => {
                                   props.datos.horaHasta = text;
                               }}
                               autoCorrect={false}
                    >
                        {props.datos.horaHasta}
                    </TextInput>

                    <TouchableOpacity
                        style={styles.botonEliminar}
                        onPress={() => {
                            props.datos.eliminar = true;
                            setApararicionState({
                                eliminar: true
                            });
                        }}>
                        <Text style={globalStyle.botoneraTextoBtn}>{`x`}</Text>
                    </TouchableOpacity>
                </View>

                {/*LINEA SEPARADORA*/}
                <View
                    style={{
                        marginTop: 5,
                        borderBottomColor: '#FFFFFF',
                        borderBottomWidth: 1,
                        width: 300,
                    }}
                />

            </View>
            }
        </>
    );
}


// const HorasView = (props) => {
//
//     const [datosState, setDatosState] = React.useState({
//         hayDatos: false,
//         misDatos: []
//     });
//     const [msgState, setMsgState] = React.useState({
//         hayMensaje: false,
//         mensaje: null
//     });
//
//     let horariosReservaElegida = null;
//     let reservaAntigua = null;
//
//
//     let hayDatos = false;
//     let misDatos = [];
//     if (typeof props.arregloReservas !== 'undefined') {
//         if (props.arregloReservas != null) {
//             props.arregloReservas.forEach(value => { //deberia encontrar 1  si es que hay
//                 if (value.dia == props.diaElegido
//                     && value.mes == props.mesElegido) {
//
//                     reservaAntigua = value;
//
//                     horariosReservaElegida = value.horarios.map((x, index) => {
//                         return ({
//                             horaDesde: traerHorarioDesde(index),
//                             horaHasta: traerHorarioHasta(index),
//                             ocupado: x
//                         })
//                     });
//
//                 }
//             })
//         }
//     }
//
//
//     let i = 0;
//
//     return (
//         <>
//             <ScrollView style={styles.nuevaHora}>
//
//                 {datosState.hayDatos && <FlatList
//
//                     data={datosState.misDatos}
//                     renderItem={({item, index}) => {
//
//                         return (<ItemInput datos={item} indice={index}/>)
//                     }}
//                     keyExtractor={item => (i++).toString()}>
//
//                 </FlatList>
//                 }
//
//             </ScrollView>
//
//             {msgState.hayMensaje ?
//                 PopupUnBoton('Resultado', `${msgState.mensaje}`)
//                 : null}
//
//
//             <View style={styles.abajo}>
//                 <View style={globalStyle.botoneraDebajo}>
//                     <TouchableOpacity
//                         style={globalStyle.botonAtras}
//                         onPress={() => {
//
//                             setMsgState({
//                                 hayMensaje: false,
//                                 mensaje: null
//                             });
//
//                             setDatosState({
//                                 hayDatos: false,
//                                 misDatos: []
//                             });
//
//                             props.nav.goBack();
//                         }}>
//                         <Text style={globalStyle.botoneraTextoBtn}>{`<-`}</Text>
//                     </TouchableOpacity>
//
//
//                     <TouchableOpacity
//                         style={globalStyle.botonAvanzar}
//                         onPress={async () => {
//
//                             setMsgState({
//                                 hayMensaje: true,
//                                 mensaje: await crearReserva(datosState.misDatos, reservaAntigua, horariosReservaElegida, props.diaElegido, props.mesElegido, 2020)
//                             });
//
//                         }}>
//                         <Text style={globalStyle.botoneraTextoBtn}>{`->`}</Text>
//                     </TouchableOpacity>
//                 </View>
//             </View>
//         </>
//     );
// }

function Item(props) {

    return (
        <View style={styles.item}>
            <Text style={styles.title} onPress={() => {
                Alert.alert(
                    `Anulacion de reserva`,
                    `¿Desea realmente cancelar la reserva?`,
                    [
                        {
                            text: "No",
                            onPress: () => console.log("Cancel presionado"),
                            style: "cancel"
                        },
                        {
                            text: "Si", onPress: () => {

                                AsyncStorage.getItem('datosUsr')
                                    .then((value) => {

                                        let valores = JSON.parse(value);

                                        let arr = [];

                                        props.reservaObj.horarios.forEach(x => {
                                            if (x.id === props.datos.id)
                                                x.tieneReserva = false;
                                            arr.push(x.tieneReserva)
                                        });

                                        let objeto = {
                                            medico: valores.id,
                                            especialidad: props.reservaObj.especialidad,
                                            anio: props.reservaObj.anio,
                                            mes: props.reservaObj.mes,
                                            dia: props.reservaObj.dia,
                                            hayEspacio: true,
                                            horarios: arr
                                        };

                                        // console.log("");
                                        // console.log(`URL FINAL -- https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/crearReserva/?hayEspacio=${hayEspacio}&idmedico=${valores.id}&anio=${anio}&mes=${mes}&dia=${dia}${urlHorario}`);

                                        return fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/crearReserva/?idmedico=${valores.id}&anio=${props.reservaObj.anio}&mes=${props.reservaObj.mes}&dia=${props.reservaObj.dia}`, {
                                            method: 'post',
                                            headers: {
                                                'Accept': 'application/json, text/plain, */*',  // It can be used to overcome cors errors
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(objeto)
                                        })
                                            .then(resp => {
                                                console.log('modificacion de reserva OK')
                                                PopupUnBoton('Resultado', 'Reserva cancelada correctamente.');
                                            })

                                            .catch(err => {
                                                console.log('se produjo un error');
                                                PopupUnBoton('Resultado', 'Hubo un error al intentar cancelar la reserva');
                                            });
                                    });
                            }
                        }
                    ],
                    {cancelable: false}
                )
            }}
            >{props.datos.hora}
            </Text>
        </View>
    );
}

function datosEnFechaActual(arrDatos, dia, mes) {
    let vec = arrDatos.filter(value => {
        if (value.dia == dia && value.mes == mes)
            return value
    });

    if (vec.length > 0)
        return true
    else
        return false
}

function verificarHayDatos(rese) {

    if (rese !== null)
        return true;
    return false;

}


const DisponibilidadView = (props) => {

    // const [value, setValue] = React.useState(0); // integer state

    const [datosState, setDatosState] = React.useState({
        datos: null,
        dia: 0,
        mes: 99
    });


    const [hayDatosState, setHayDatosState] = React.useState(false);

    let reservaElegida;
    let arr = [];


    if (typeof props.arregloReservas !== 'undefined') {
        if (props.arregloReservas != null) {
            props.arregloReservas.forEach(value => { //deberia encontrar 1 solo si es que hay
                if (value.dia == props.diaElegido
                    && value.mes == props.mesElegido) {

                    if (datosState.dia !== props.diaElegido ||
                        (datosState.mes == props.mesElegido &&
                            datosState.dia !== props.diaElegido)) {

                        reservaElegida = value;

                        value.horarios.forEach((val, indice) => {
                            arr.push({
                                id: indice, //key extractor
                                hora: traerHorario(indice),
                                tieneReserva: val.reservada,
                                tieneTurno: val.tieneTurno
                            });
                        });

                        reservaElegida.horarios = arr;

                        setDatosState({
                            datos: reservaElegida,
                            dia: props.diaElegido,
                            mes: props.mesElegido
                        });

                        setHayDatosState(true);
                    }
                }
            })
        }
    }

//
    if (arr.length === 0) {
        if (datosState.dia !== props.diaElegido ||
            (datosState.mes == props.mesElegido &&
                datosState.dia !== props.diaElegido)) {

            setDatosState({
                datos: [],
                dia: props.diaElegido,
                mes: props.mesElegido
            });

            setHayDatosState(false);
        }
    }


    // let i = 0;

    // let hayDatos = false;
    //
    // if (typeof props.arregloReservas !== 'undefined') {
    //     if (props.arregloReservas != null) {
    //         props.arregloReservas.forEach(value => { //deberia encontrar 1 solo si es que hay
    //             if (value.dia == props.diaElegido
    //                 && value.mes == props.mesElegido) {
    //
    //                 reservaElegida = value;
    //
    //                 value.horarios.forEach((val, indice) => {
    //                     arr.push({
    //                         id: indice, //key extractor
    //                         hora: traerHorario(indice),
    //                         tieneReserva: val,
    //                         marcado: false
    //                     });
    //                 });
    //                 hayDatos = true;
    //             }
    //         })
    //     }
    // }


    // if (!hayDatos)
    //     return (
    //         <>
    //             <View style={styles.subContainer}>
    //                 <Text style={styles.item}>No hay reservas para modificar en esta fecha</Text>
    //             </View>
    //         </>
    //     )

    return (
        <>
            <View style={styles.subContainer}>

                {!hayDatosState && <Text style={styles.item}>No hay reservas para modificar en esta fecha</Text>}

                {hayDatosState &&
                <Text style={globalStyle.textoBlanco}>{`Especialidad: ${datosState.datos.especialidad} \n`} </Text>}

                {hayDatosState &&
                <Text style={globalStyle.textoBlanco}>{`Seleccione la reserva que desee anular: \n`} </Text>}

                {/*{hayDatosState && console.log(datosState.datos)}*/}
                {hayDatosState && <FlatList

                    data={datosState.datos.horarios}
                    renderItem={({item}) => {

                        /*Si "tieneReserva es false, significa que ese horario esta libre y no se modifica.
                        * Por lo tanto no aparecera en pantalla*/
                        if (item.tieneReserva && !item.tieneTurno) {
                            return (
                                <Item datos={item} nav={props.nav} reservaObj={datosState.datos}/>
                            )
                        }
                    }}
                    keyExtractor={item => item.id}
                >

                </FlatList>
                }

            </View>
            {/*<View style={globalStyle.botoneraDebajo}>*/}
            {/*    <TouchableOpacity*/}
            {/*        style={globalStyle.botonAtras}*/}
            {/*        onPress={() => {*/}
            {/*            // setHayDatosState(false);*/}
            {/*            // setDatosState({*/}
            {/*            //     datos: []*/}
            {/*            // });*/}
            {/*            // hayDatos = false;*/}
            {/*            // arr = [];*/}
            {/*            props.nav.goBack();*/}
            {/*        }}>*/}
            {/*        <Text style={globalStyle.botoneraTextoBtn}>{`<-`}</Text>*/}
            {/*    </TouchableOpacity>*/}
            {/*</View>*/}
        </>
    )
}


export default function ModificarAgendaScreen2({route, navigation}) {

    let reservaElegida = null;
    let arr = new Array();
    let encontro = false;

    let d = new Date();
    let mesActual = d.getMonth() + 1;
    let mesLimite = d.getMonth() + 3;

    if (route.params === undefined)
        return null;

    let semanaActual = moment().set({
        'year': d.getFullYear(),
        'month': d.getMonth(),
        'date': d.getDay()
    }).week();

    let semanaIngresada = moment().set({
        'year': route.params.anio,
        'month': (route.params.mes - 1),
        'date': route.params.dia
    }).week();

    console.log("semana actual " + semanaActual + " vs semana ingresada: " + semanaIngresada);


    if (route.params.anio <= d.getFullYear() &&
        ((route.params.mes <= (d.getMonth() + 1) &&
                route.params.dia < d.getDate()) ||
            route.params.mes < (d.getMonth() + 1)
        ))
        return (
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={globalStyle.subContainerCenter}>
                    <Text style={globalStyle.textoBlanco}>
                        No se puede modificar un día anterior al actual.
                    </Text>
                </View>
            </LinearGradient>
        );

    if (route.params.anio == d.getFullYear() &&
        route.params.mes == (d.getMonth() + 1) &&
        route.params.dia == d.getDate())
        return (
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={globalStyle.subContainerCenter}>
                    <Text style={globalStyle.textoBlanco}>
                        No se puede modificar el dia actual.
                    </Text>
                </View>
            </LinearGradient>
        );

    if (semanaIngresada !== semanaActual &&
        semanaIngresada !== (semanaActual + 1))
        return (
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={globalStyle.subContainerCenter}>
                    <Text style={globalStyle.textoBlanco}>
                        Solo puede modificar la semana actual y la siguiente
                    </Text>
                </View>
            </LinearGradient>
        );


    return (
        <View style={globalStyle.container}>

            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text
                        style={globalStyle.textoBlanco}>
                        {`Reservas para ${route.params.dia}-${route.params.mes}-${route.params.anio}`}
                    </Text>
                    <DisponibilidadView diaElegido={route.params.dia}
                                        mesElegido={route.params.mes}
                                        arregloReservas={route.params.arrReservas}
                                        nav={navigation}
                    />
                </View>

                {/*<HorasView diaElegido={route.params.dia}*/}
                {/*           mesElegido={route.params.mes}*/}
                {/*           anioElegido={route.params.anio}*/}
                {/*           arregloReservas={route.params.arrReservas}*/}
                {/*           nav={navigation}*/}
                {/*/>*/}

            </LinearGradient>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
    subContainer: {
        flex: 1,
        // marginVertical: 50,
        marginTop: 30,
    },
    item: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        marginVertical: 1,
        width: 300,
        alignItems: "center"
    },
    itemInput: {
        width: 200,
        marginLeft: 0,
        marginTop: 10,
    },
    itemInputHoras: {
        flexDirection: 'row', //Un objeto al lado del otro
        height: 40,
        justifyContent: 'flex-start',
    },
    botonEliminar: {
        marginLeft: 40,
        backgroundColor: 'red',
        marginBottom: 30,
        height: 40,
        width: 40,
        borderRadius: 20,
    },
    formatoHora: {
        padding: 0,
        width: 68,
        backgroundColor: '#FFFFFF',
        textAlign: 'center',
    },
    nuevaHora: {
        flex: 1,
        marginTop: 10,
        width: 300,
        // alignContent: 'left',
    },
    title: {
        fontSize: 16,
    },
    titleRojo: {
        fontSize: 16,
        backgroundColor: '#fc7458',
    },
    abajo: {
        position: 'absolute',
        marginBottom: 0
    }

});

