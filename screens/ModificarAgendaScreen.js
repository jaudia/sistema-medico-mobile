import * as React from 'react';
import {AsyncStorage, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import MyCalendar from "../components/calendario";
import moment from 'moment';
import {equivalenciaDesde, traerHorarioDesde} from "../components/TablaHorario";


/*Cuando se trata de "agregar agenda", me alcanza con saber solo las reservas
* para ver la disponibilidad de los dias */

/*Ademas, un medico solo puede agregar agenda para los 2 meses siguientes al actual, segun la consigna
* del tpo*/
function colorear(dia, mes, arr) {
    let color = '#000';
    let d = new Date();
    let mesActual = d.getMonth() + 1;
    let diaActual = d.getDate();

    // if (dia == diaActual && mes == mesActual)
    if (dia == diaActual && mes == mesActual)
        color = '#3261ed';

    return color;

}


function getReservas() {

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    React.useEffect(() => {
    console.log("pasando por useeffect de screen1 get reservas");

    AsyncStorage.getItem('datosUsr').then((value) => {
        let idMedico = JSON.parse(value).id;
        fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/reservas?idmedico=${idMedico}`)
            .then(resp => resp.json())
            .then(datos => {

                let filtroSemanal = [];
                let d = new Date();

                let semanaActual = moment().set({
                    'year': d.getFullYear(),
                    'month': d.getMonth() + 1,
                    'date': d.getDay()
                }).week();

                datos.forEach(reserva => {
                    let semanaReserva = moment().set({
                        'year': reserva.anio,
                        'month': reserva.mes,
                        'date': reserva.dia
                    }).week();

                    if (semanaReserva === semanaActual ||
                        semanaReserva === (semanaActual + 1)) {

                        reserva.horarios = reserva.horarios.map(x => {
                            return ({
                                reservada: x,
                                tieneTurno: false
                            });
                        });

                        filtroSemanal.push(reserva);
                    }
                });

                /*Ya tenemos todas las reservas del medico para la semana actual y la siguiente.
                Ahora vamos a buscar todos los turnos (dia actual en adelante) y por cada turno
                 validamos si hay coincidencia de fecha-hora con alguna reserva. Si la hay, entonces
                 se marca la reserva como "tieneTurno" por un turno*/
                fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/misTurnos?idUsuario=${idMedico}&tipoUsuario=medico`)
                    .then(resp => resp.json())
                    .then(datos => {

                        /*Excluir los turnos cancelados*/
                        datos = datos.filter(value => {
                            if (value.estado.toLowerCase().localeCompare('cancelado') !== 0)
                                return value;
                        });


                        /*Por cada turno*/
                        datos.forEach(tur => {

                            /*Por cada reserva */
                            filtroSemanal = filtroSemanal.map(reser => {

                                /*Por cada horario de dicha reserva*/
                                reser.horarios = reser.horarios.map((hor, index) => {

                                    if (traerHorarioDesde(index).localeCompare(tur.hora) === 0)
                                        hor.tieneTurno = true;
                                    return hor;
                                });
                                return reser;
                            });


                        });

                        setDocState({
                            isLoading: false,
                            data: filtroSemanal
                        });

                    }).catch(er => {
                    console.log("no se encontraron turnos para este medico.")
                    setDocState({
                        isLoading: false,
                        data: filtroSemanal
                    });
                });


                // setDocState({
                //     isLoading: false,
                //     data: filtroSemanal
                // });
            }).catch(e => {
            console.log("error o sin datos en obtener reservas en ModificarAgendaScreen")
        });
    })
        .catch(err => {
            console.log(`hubo un error en la url o no hay datos`);
            setDocState({
                isLoading: false,
                data: null
            });
        });
    });

    // console.log(`asi quedaron las reservas: ${docState.data}`);

    return docState.data;

}

/* *************GESTION DE RESERVAS************************* */
export default function AgregarAgendaScreen({navigation}) {


    /*refrescar pantalla*/
    const unsubscribe = navigation.addListener('didFocus', () => {
        console.log('focussed');
    });


    return (
        <>
            {unsubscribe()}
            {/*<View style={styles.container}>*/}
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Seleccione una fecha</Text>
                </View>


            </LinearGradient>

            <View style={globalStyle.calendarioContainer}>
                <MyCalendar cbDatos={getReservas()} //datos que se van a manejar.
                            cbColorDia={(dia, mes, datos) => {
                                return colorear(dia, mes, datos)
                            }} //logica para el color del dia
                            pie='Dia Actual'
                            colorPie='#3261ed'
                            cbOnPressDia={(diaElegido, mesElegido, anioElegido, datosDisponibilidad) => {
                                return navigation.navigate('ModificarAgendaScreen2', {
                                    dia: diaElegido,
                                    mes: mesElegido,
                                    anio: anioElegido,
                                    arrReservas: datosDisponibilidad
                                })
                            }}
                />
            </View>

            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>

            </LinearGradient>

            {/*<LinearGradient*/}
            {/*    colors={['#05408E', '#228FBD']}*/}
            {/*    style={globalStyle.grad}>*/}

            {/*</LinearGradient>*/}

        </>
    );
}

const styles = StyleSheet.create({

    subContainer: {
        flex: 1,
        marginTop: 40,
    },
    textoBlanco: {
        fontSize: 17,
        color: "#FFFFFF"
    },
    textoBtn: {
        fontSize: 17,
        color: "#FFFFFF",
        textAlign: 'center',
        borderRadius: 10,
        marginRight: 40,
        marginLeft: 40,
        marginTop: 5,
        paddingTop: 10,
        paddingBottom: 10
    }
});
