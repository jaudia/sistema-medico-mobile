import * as React from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import MyCalendar from "../components/calendario";

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

function turnos(medico, especialidad) {

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    if (docState.data == null) {
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/reservaMedico?medico=${medico}&especialidad=${especialidad}`)
                .then(resp => resp.json())
                .then(datos => {
                    console.log(datos);
                    setDocState({
                        isLoading: false,
                        data: datos
                    });
                }).catch(e=>{
               console.log("Error o sin datos en fetch de solicitarTurnoScreen4");
            });
    }

    return docState.data;
}

export default function SolicitarTurnoScreen3({route, navigation}) {

    if (route.params === undefined)
        return null;

    return (
    <>
    <LinearGradient
            colors={['#05408E', '#228FBD']}
            style={globalStyle.grad}>
            <View style={styles.subContainer}>
                <Text style={globalStyle.textoBlanco}>
                    Especialidad elegida:{"\n"}{route.params.especialidad.toUpperCase()}{"\n"}{"\n"}
                </Text>
                <Text style={globalStyle.textoBlanco}>
                    Medico elegido:{"\n"}{route.params.medico.nombre.toUpperCase()} {route.params.medico.apellido.toUpperCase()}{"\n"}{"\n"}
                    Selecciona una fecha:
                </Text>
            </View>
    </LinearGradient>
    <View style={globalStyle.calendarioContainer}>
                <MyCalendar cbDatos={turnos(route.params.medico.id, route.params.especialidad)} //datos que se van a manejar
                            cbColorDia={(dia, mes, datos) => {
                                return colorear(dia, mes, datos)
                            }} //logica para el color del dia
                            pie='Turnos' //pie de calendario
                            colorPie='#ed160e' //color del pie
                            cbOnPressDia={(diaElegido, mesElegido, anioElegido, todosLosTurnos) => {
                                return navigation.navigate('SolicitarTurnoScreen4', {
                                    dia: diaElegido,
                                    marcar: true,
                                    mes: mesElegido,
                                    anio: anioElegido,
                                    medico: route.params.medico,
                                    especialidad: route.params.especialidad,
                                    arrTurnos: todosLosTurnos
                                })
                            }}
                />
    </View>
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
    }
});
