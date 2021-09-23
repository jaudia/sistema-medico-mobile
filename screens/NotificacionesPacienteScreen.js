import * as React from 'react';
import {
    AsyncStorage,
    StyleSheet,
    Text,
    View,
    FlatList
} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
// import {dbapp, notificaciones, useFirestoreQuery, useFirestoreRef} from "../components/db";
// import * as firebase from "firebase";
import 'firebase/firestore';
import Constants from 'expo-constants';

function Item({title}) {
    return (
        <View style={styles.item}>
            <Text style={styles.title}>{title}</Text>
        </View>
    );
}


const NotificacionesView = () => {
    // console.log(navigation);

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    let idUsuario = '';

    React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            idUsuario = JSON.parse(value).id;
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/notificaciones?idUsuario=${idUsuario}&tipoUsuario=paciente`)
                .then(resp => resp.json())
                .then(datos => {


                    /*ordenamiento descendente por fecha*/
                    datos = datos.map(v => {
                        return ({
                            ...v,
                            fechaNumerica: `${v.anio}${v.mes}${v.dia}`
                        })
                    });

                    datos.sort(function (a, b) {
                        return b.fechaNumerica - a.fechaNumerica
                    });

                    setDocState({
                        isLoading: false,
                        data: datos
                    });
                }).catch(e => {
                console.log("Error o sin datos en la obtencion de notificaciones");
            });
        })
            .catch(err => {
                console.log(`hubo un error en la url o no hay datos`);
                setDocState({
                    isLoading: false,
                    data: []
                });
            });
    }, []);

    return <View style={styles.subContainer}>
        {docState.isLoading && <Text style={styles.item}>Cargando....</Text>}

        {!docState.isLoading && !docState.data && <Text style={styles.item}>Sin notificaciones para mostrar</Text>}

        {docState.data && Array.isArray(docState.data) && <FlatList

            data={docState.data}
            renderItem={({item}) => <Item title={`${item.dia}/${item.mes}/${item.anio} - ${item.descripcion}`}/>}
            keyExtractor={item => item.id}>

        </FlatList>
        }

        {docState.data && !Array.isArray(docState.data) &&
        <Item title={`${docState.data.dia}/${docState.data.mes}/${docState.data.anio} - ${docState.data.descripcion}`}/>
        }

    </View>
}


export default function NotificacionesScreen({navigation}) {

    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>

                <View style={styles.subContainer}>
                    <Text style={globalStyle.textoBlanco}>Notificaciones</Text>
                    <NotificacionesView/>
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
