import * as React from 'react';
import {
    AsyncStorage,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import MyCalendar from "../components/calendario";
import AgregarAgendaScreen from "./AgregarAgendaScreen";

//
function colorear(dia, mes, arr) {
    let color = '#000'
    if (arr != null) {
        if (Array.isArray(arr))
            arr.forEach((i) => {
                if (i.dia == dia &&
                    i.mes == mes)
                    color = '#ed160e';
            })
        else {
            if (arr.dia == dia &&
                arr.mes == mes)
                color = '#ed160e';
        }
    }
    return color;
}

//
function turnos() {

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    let idUsuario = '';


    if (docState.data == null) {
        AsyncStorage.getItem('datosUsr').then((value) => {
            idUsuario = JSON.parse(value).id;

            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/misTurnos?idUsuario=${idUsuario}&tipoUsuario=medico`)
                .then(resp => resp.json())
                .then(datos => {
                    setDocState({
                        isLoading: false,
                        data: datos
                    });
                }).catch(e=>{
                console.log(`hubo un error en la url o no hay datos en turnos`);
                setDocState({
                    isLoading: false,
                    data: null
                });
            });
        })
            .catch(err => {
                console.log(`Error al recuperar datos locales`);
                setDocState({
                    isLoading: false,
                    data: null
                });
            });
    }

    return docState.data;

}

/* *************GESTION DE RESERVAS************************* */
export default function AgendaScreen({navigation}) {

    return (
        <>
            {/*<View style={styles.container}>*/}
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Seleccione una fecha para ver los turnos asignados</Text>
                </View>
            </LinearGradient>

            <View style={globalStyle.calendarioContainer}>
                <MyCalendar cbDatos={turnos()} //datos que se van a manejar
                            cbColorDia={(dia, mes, datos) => {
                                return colorear(dia, mes, datos)
                            }} //logica para el color del dia
                            pie='Turnos' //pie de calendario
                            colorPie='#ed160e' //color del pie
                            cbOnPressDia={(diaElegido, mesElegido, anioElegido, todosLosTurnos) => {
                                return navigation.navigate('MisTurnosMedicoScreen', {
                                    dia: diaElegido,
                                    marcar: true, //Decidir si marcar cuando hay coincidencia o al reves
                                    mes: mesElegido,
                                    anio: anioElegido,
                                    arrTurnos: todosLosTurnos
                                })
                            }}
                />
            </View>

            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <TouchableOpacity
                        style={styles.botonAgregar}
                        onPress={() => {
                            navigation.navigate('AgregarAgendaScreen');
                        }}
                    >
                        <Text style={styles.textoBtn}>Agregar agenda</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.botonModificar}
                        onPress={() => {
                            navigation.navigate('ModificarAgendaScreen');
                        }}
                    >
                        <Text style={styles.textoBtn}>Modificar agenda</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            {/*</View>*/}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    subContainer: {
        flex: 3,
        marginTop: 30,
    },
    botonAgregar: {
        backgroundColor: '#38a14f',
        width: 250,
        height: 50,
        borderRadius: 5
    },
    botonModificar: {
        backgroundColor: '#fa8f05',
        width: 250,
        height: 50,
        borderRadius: 5,
        marginTop: 10,
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


