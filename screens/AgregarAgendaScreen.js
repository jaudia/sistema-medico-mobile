import * as React from 'react';
import {AsyncStorage, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import MyCalendar from "../components/calendario";

/*Cuando se trata de "agregar agenda", me alcanza con saber solo las reservas
* para ver la disponibilidad de los dias */

/*Ademas, un medico solo puede agregar agenda para los 2 meses siguientes al actual, segun la consigna
* del tpo*/
function colorear(dia, mes, arr) {
    let color;
    let d = new Date();
    let mesActual = d.getMonth() + 1;
    let mesLimite = d.getMonth() + 3;

    if (mes > mesActual && mes <= mesLimite) {
        color = '#32a852';
        if (arr != null) {
            if (Array.isArray(arr))
                arr.forEach((i) => {
                    if (i.dia == dia &&
                        i.mes == mes &&
                        !i.hayEspacio)
                        color = '#000';
                })
            else {
                if (arr.dia == dia &&
                    arr.mes == mes &&
                    !arr.hayEspacio)
                    color = '#000';
            }
        }
    } else
        color = '#000';

    return color;

}

function getReservas() {

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });


    // React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            let idMedico = JSON.parse(value).id;
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/reservas?idmedico=${idMedico}`)
                .then(resp => resp.json())
                .then(datos => {
                    setDocState({
                        isLoading: false,
                        data: datos
                    });
                }).catch(e => {
                console.log(`No se encontraron datos en reservas de agregarAgendaScreen`);
            });
        })
            .catch(err => {
                console.log(`Error al obtener datos locales en agregarAgendaScreen`);
                setDocState({
                    isLoading: false,
                    data: null
                });
            });

    // });

    return docState.data;

}

//
/* *************GESTION DE RESERVAS************************* */
export default function AgregarAgendaScreen({navigation}) {


    /*refrescar pantalla*/
    const unsubscribe = navigation.addListener('didFocus', () => {
        console.log('focussed');
    });
//

    return (
        <>
            {/*{console.log(navigation.isFocused())}*/}
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
                            pie='Espacio disponible'
                            colorPie='#32a852'
                            cbOnPressDia={(diaElegido, mesElegido, anioElegido, datosDisponibilidad) => {
                                return navigation.navigate('AgregarAgendaScreen2', {
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
