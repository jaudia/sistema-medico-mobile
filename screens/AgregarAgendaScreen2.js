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
    ScrollView
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


function validaciones(datos, datosAnteriores, espec) {
    let i = 0;
    let j = 0;
    let primerHoraDesde, primerHoraHasta, segundaHoraDesde, segundaHoraHasta;

    let resultado = {
        ok: true,
        mensaje: 'OK'
    }

    //validamos que por cada especialidad del medico, las especialidades ingresada en las reservas
    let especialidadErronea = '';

    datos = datos.filter(value => !value.eliminar);


    return Promise.resolve(AsyncStorage.getItem('datosUsr')) //obtenemos los datos para saber si coinciden las especialidades
        .then((value) => {
            let valores = JSON.parse(value);

            try {
                let encontro = false;
                valores.especialidades.forEach(esp => { //especialidades del medico
                    if (espec.localeCompare(esp) === 0)
                        encontro = true;
                });

                if (!encontro) {
                    especialidadErronea = item.especialidad
                    throw new Error();
                }

                resultado.ok = true,
                    resultado.mensaje = `OK`;
            } catch (err) {
                console.log(`La especialidad ${especialidadErronea} es erronea.`);
                return {
                    ok: false,
                    mensaje: `La especialidad ${especialidadErronea} es erronea.`,
                }

            }

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
async function crearReserva(datosNuevos, espec, reservaAntigua, datosViejos, dia, mes, anio) {

    let arr = [];

    console.log("la especialidad es " + espec);

    console.log(" los datos viejos son: " + JSON.stringify(datosViejos));

    console.log(espec);

    if (reservaAntigua !== null) {
        if (reservaAntigua.especialidad.localeCompare(espec) !== 0)
            return "La especialidad no coincide con la que ya estaba."
    }

    if (datosNuevos === null) {
        console.log("datos nulos");
        return null;
    }
    let resultado = await validaciones(datosNuevos, datosViejos, espec);


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
                    especialidad: espec,
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
                        console.log("Se creo la reserva.");
                        return "Se creo la reserva.";
                    })

                    .catch(err => {
                        console.log(`Hubo un error al crear la reserva`);
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

//
const HorasView = (props) => {

    const [datosState, setDatosState] = React.useState({
        hayDatos: false,
        misDatos: []
    });
    const [msgState, setMsgState] = React.useState({
        hayMensaje: false,
        mensaje: null
    });

    const [fechaState, setFechaState] = React.useState({
        dia: 0,
        mes: 99
    });
    const [especialidadState, setEspecialidadState] = React.useState('ingrese especialidad');


    // console.log(`El dia pasado en HorasView es: ${props.diaElegido}`);

    // const [horaState, setHoraState] = React.useState({
    //     diaActual: props.diaElegido,
    //     mesActual: props.mesElegido,
    // });

    // const [datosState, setDatosState] = React.useState({
    //     hayDatos: false,
    //     data: null,
    // });

    // const [especialidadState, setEspecialidadState] = React.useState({
    //     especialidad: `ingrese especialidad`
    // });

    // const [mensajeState, setMensajeState] = React.useState({
    //     mensaje: null
    // });


    let horariosReservaElegida = null;
    let reservaAntigua = null;


    let hayDatos = false;
    let misDatos = [];

    /*Validar si se eligio el otra fecha para re-renderizar*/
    // if (props.diaElegido !== horaState.diaActual ||
    //     props.mesElegido !== horaState.mesActual) {
    //
    //     setHoraState({
    //         diaActual: props.diaElegido,
    //         mesActual: props.mesElegido,
    //     });
    //
    //     setMensajeState({
    //         mensaje: null
    //     });
    //
    //     especialidadEncontrada = 'ingrese especialidad';
    // }
    //
    React.useEffect(() => {

        if (fechaState.dia !== props.diaElegido ||
            (fechaState.dia === props.diaElegido &&
                fechaState.mes !== props.mesElegido)
        ) {
            setFechaState({
                dia: props.diaElegido,
                mes: props.mesElegido
            });
        }


        if (typeof props.arregloReservas !== 'undefined') {
            if (props.arregloReservas != null) {
                props.arregloReservas.forEach(value => { //deberia encontrar 1  si es que hay
                    if (value.dia == props.diaElegido
                        && value.mes == props.mesElegido) {

                        reservaAntigua = value;

                        horariosReservaElegida = value.horarios.map((x, index) => {
                            return ({
                                horaDesde: traerHorarioDesde(index),
                                horaHasta: traerHorarioHasta(index),
                                ocupado: x
                            })
                        });

                    }
                })
            }
        }
    });


    let i = 0;

    return (
        <>
            <ScrollView style={styles.nuevaHora}>

                <View>
                    <TextInput style={{
                        backgroundColor: '#FFFFFF',
                        color: '#000',
                        textAlign: 'center'
                    }}
                               onChangeText={text => {

                                   if (msgState.hayMensaje)
                                       setMsgState({
                                           hayMensaje: false,
                                           mensaje: null
                                       });

                                   setEspecialidadState(`${text}`);
                               }}
                    >{especialidadState}</TextInput>
                </View>


                {datosState.hayDatos && <FlatList

                    data={datosState.misDatos}
                    renderItem={({item, index}) => {

                        return (<ItemInput datos={item} indice={index}/>)
                    }}
                    keyExtractor={item => (i++).toString()}>

                </FlatList>
                }

            </ScrollView>

            {msgState.hayMensaje ?
                PopupUnBoton('Resultado', `${msgState.mensaje}`)
                : null}


            <View style={globalStyle.botoneraDebajo}>
                <TouchableOpacity
                    style={globalStyle.botonAtras}
                    onPress={() => {

                        setMsgState({
                            hayMensaje: false,
                            mensaje: null
                        });

                        setDatosState({
                            hayDatos: false,
                            misDatos: []
                        });

                        setEspecialidadState('ingrese especialidad');

                        props.nav.goBack();
                    }}>
                    <Text style={globalStyle.botoneraTextoBtn}>{`<-`}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyle.botonAgregar}
                    onPress={() => {


                        if (msgState.hayMensaje)
                            setMsgState({
                                hayMensaje: false,
                                mensaje: null
                            });

                        let arr = [];

                        if (datosState.hayDatos)
                            arr = datosState.misDatos

                        let nuevo = {
                            horaDesde: '09:00',
                            horaHasta: '18:00',
                            eliminar: false,
                            ocupado: true
                        };

                        // agregar()
                        arr.push(nuevo);
                        /*Aca los datos se conservan bien*/
                        setDatosState({
                            hayDatos: true,
                            misDatos: arr
                        });

                    }}>
                    <Text style={globalStyle.botoneraTextoBtn}>+</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={globalStyle.botonAvanzar}
                    onPress={async () => {

                        setMsgState({
                            hayMensaje: true,
                            mensaje: await crearReserva(datosState.misDatos, especialidadState.toLowerCase(), reservaAntigua, horariosReservaElegida, props.diaElegido, props.mesElegido, 2020)
                        });

                    }}>
                    <Text style={globalStyle.botoneraTextoBtn}>{`->`}</Text>
                </TouchableOpacity>
            </View>
        </>
    );

}

function Item({title}) {
    return (
        <View style={styles.item}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

const DisponibilidadView = (props) => {

    const [docState, setDocState] = React.useState({
        data: null
    });

    // console.log(`En disponibilidad VIEW, el dia es ${props.diaElegido}`);

    let i = 0;
    let reservaElegida;
    let arr = [];
    let hayDatos = false;

    if (typeof props.arregloReservas !== 'undefined') {
        if (props.arregloReservas != null) {
            props.arregloReservas.forEach(value => { //deberia encontrar 1 solo si es que hay
                if (value.dia == props.diaElegido
                    && value.mes == props.mesElegido) {

                    reservaElegida = value;

                    value.horarios.forEach((val, indice) => {
                        arr.push({
                            id: indice, //key extractor
                            hora: traerHorario(indice),
                            ocupado: val,
                        });
                    });
                    hayDatos = true;
                }
            })
        }
    }

    return <View style={styles.subContainer}>

        {!hayDatos && <Text style={styles.item}>No hay reservas para esta fecha</Text>}

        {hayDatos &&
        <Item style={styles.item}
              title={`Reserva para la fecha ${reservaElegida.dia}/${reservaElegida.mes}/${reservaElegida.anio}:`}> </Item>}

        {hayDatos && <FlatList

            data={arr}
            renderItem={({item}) => {
                if (item.ocupado) {
                    return (<Item title={`${item.hora}`}/>)
                }
            }}
            keyExtractor={item => item.id}>

        </FlatList>
        }

    </View>
}


export default function AgregarAgendaScreen2({route, navigation}) {


    let d = new Date();
    let mesActual = d.getMonth() + 1;
    let mesLimite = d.getMonth() + 3;

    if (route.params === undefined)
        return null;

    if (route.params.mes <= mesActual || route.params.mes > mesLimite)
        return (
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={globalStyle.subContainerCenter}>
                    <Text style={globalStyle.textoBlanco}>
                        Solo puede agregar agenda para los 2 meses siguientes al actual.
                    </Text>
                </View>
            </LinearGradient>
        )

    return (
        <View style={globalStyle.container}>

            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Reservas</Text>
                    <DisponibilidadView diaElegido={route.params.dia}
                                        mesElegido={route.params.mes}
                                        arregloReservas={route.params.arrReservas}/>
                </View>

                <HorasView diaElegido={route.params.dia}
                           mesElegido={route.params.mes}
                           anioElegido={route.params.anio}
                           arregloReservas={route.params.arrReservas}
                           nav={navigation}
                />

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

});

