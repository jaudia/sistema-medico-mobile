import * as React from 'react';
import {AsyncStorage, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import Constants from "expo-constants";

function Item({title}) {
    return (
        <View style={styles.item}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}

function confirmarTurno(turno){
    var fecha = new Date()
    fecha.setHours(fecha.getHours()-3);

    fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/confirmarTurno?turno=${turno}&fecha=${fecha.getTime()}`, {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json, text/plain, */*', 
                        'Content-Type': 'application/json'
                    },
                })
                    .then(resp => {
                        if(resp.status==200){
                            alert("El turno fue confirmado.");
                        }
                        else{
                            alert("No se puede confirmar. Solo se puede confirmar entre doce horas antes y mas de una hora.")
                        }
                    })

                    .catch(err => {
                        alert("No se pudo confirmar el turno.");
                    }); 
}

function cancelarTurno(turno){
    var fecha = new Date()
    fecha.setHours(fecha.getHours()-3);
    fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/deleteTurno?turno=${turno}&fecha=${fecha.getTime()}`, {
        method: 'post',
        headers: {
            'Accept': 'application/json, text/plain, */*', 
            'Content-Type': 'application/json'
        },
    })
        .then(resp => {
            if(resp.status==200){
                alert("El turno fue cancelado. Si corresponde se aplicaran los costos necesarios.");
            }
            else{
                alert("No se puede cancelar.")
            }
        })

        .catch(err => {
            alert("No se pudo cancelar el turno.");
        }); 
}

export default function MisTurnosScreen2({route, navigation}) {
    if (route.params === undefined)
        return null;
    console.log(route.params.turno.id);
    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Mis turnos{"\n"}</Text>
                    <Item title={`Fecha: ${route.params.turno.dia}/${route.params.turno.mes}/${route.params.turno.anio} - ${route.params.turno.hora} \n\nEstado: ${route.params.turno.estado.toUpperCase()}\n\nEspecialidad: ${route.params.turno.especialidad.toUpperCase()}`}></Item>
                    <View>
                    <TouchableOpacity
                            style={styles.boton}
                            onPress={() => confirmarTurno(route.params.turno.id)}
                            underlayColor='#fff'>
                            <Text style={styles.textoBtn}>CONFIRMAR TURNO</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                            style={styles.botonRojo}
                            onPress={() => cancelarTurno(route.params.turno.id)}
                            underlayColor='#fff'>
                            <Text style={styles.textoBtn}>CANCELAR TURNO</Text>
                    </TouchableOpacity>
                    </View>    
                </View>
            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: Constants.statusBarHeight,
    },
    subContainer: {
        marginVertical: 50,
    },
    item: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginVertical: 2,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 16,
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
    },
    boton: {
        backgroundColor: '#38a14f',
        color: 'white',
        width: 250,
        height: 50,
        marginLeft: 20,
        borderRadius: 5
    },
    botonRojo: {
        backgroundColor: '#CE2929',
        color: 'white',
        width: 250,
        height: 50,
        marginLeft: 20,
        borderRadius: 5
    }
});