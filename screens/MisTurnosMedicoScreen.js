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


const TurnosView = (props) => {

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });


    console.log("el dia seleccionado es " + props.diaElegido);
    let arr = [];
    let hayDatos = false;

    if (props.arregloTurnos != null) {
        props.arregloTurnos.forEach(value => {
            if (value.dia == props.diaElegido
                && value.mes == props.mesElegido) {
                arr.push(value);
                hayDatos = true;
            }
        })
    }

    return <View style={styles.subContainer}>

        {!hayDatos && <Text style={styles.item}>no hay datos</Text>}
        {Array.isArray(arr) && <FlatList

            data={arr}
            renderItem={({item}) => <Item
                title={`${item.dia}/${item.mes}/${item.anio} - ${item.hora} - especialidad: ${item.especialidad} - con el paciente ${item.paciente}`}/>}
            keyExtractor={item => item.id}>

        </FlatList>
        }

    </View>
}


export default function MisTurnosMedicoScreen({route, navigation}) {

    if (route.params === undefined)
        return null;

    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Mis turnos</Text>
                    <TurnosView diaElegido={route.params.dia}
                                mesElegido={route.params.mes}
                                anioElegido={route.params.anio}
                                arregloTurnos={route.params.arrTurnos}/>
                </View>
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
});

