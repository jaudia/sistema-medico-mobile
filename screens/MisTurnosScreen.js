import * as React from 'react';
import {AsyncStorage, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import Constants from "expo-constants";


const TurnosView = (props) => {

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    let idUsuario = '';

    React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            idUsuario = JSON.parse(value).id;
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/misTurnos?idUsuario=${idUsuario}&tipoUsuario=paciente`)
                .then(resp => resp.json())
                .then(datos => {
                    setDocState({
                        isLoading: false,
                        data: datos
                    });
                })
                .catch(err => {
                    console.log(`hubo un error en la url o no hay datos`);
                    setDocState({
                        isLoading: false,
                        data: null
                    });
                });
        })
            .catch(err => {
                console.log(`hubo un error en la url o no hay datos`);
                setDocState({
                    isLoading: false,
                    data: null
                });
            });
    }, []);

    
    return <View> 
        {docState.isLoading && <Text style={styles.item}>Cargando....</Text>}

        {!docState.isLoading && !docState.data && <Text style={styles.item}>No hay turnos pendientes</Text>}

        {docState.data && Array.isArray(docState.data) && <View style={styles.subContainer}>
        <FlatList

            data={docState.data}
            renderItem={({item}) => <View style={styles.item}>
                    <TouchableOpacity onPress={() => 
                    {(item.estado.toUpperCase()==='INICIADO' || item.estado.toUpperCase()==='CONFIRMADO' )&&
                    irOpciones(item, props.nav)}
                    }>
                    <Text style={styles.title}>{`Fecha: ${item.dia}/${item.mes}/${item.anio} - ${item.hora} \n\nEstado: ${item.estado.toUpperCase()}\n\nEspecialidad: ${item.especialidad.toUpperCase()}`}</Text>
                    </TouchableOpacity>
            </View>}
            keyExtractor={item => item.id}>    
        </FlatList>
        </View>    
        }
    </View>
}

function irOpciones(item, navigation){
    return navigation.navigate('MisTurnosScreen2', {
        turno: item
    })
}

export default function MisTurnosScreen({navigation}) {
    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Mis turnos</Text>
                    <TurnosView nav={navigation}></TurnosView>
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

