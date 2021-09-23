import * as React from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";


const Especialidades = (props) => {
    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    React.useEffect(() => {
        if (docState.data == null) {
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/listaespecialidades`)
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
        }
    });

    return <View>
        {docState.isLoading && <Text>Cargando....</Text>}

        {!docState.isLoading && !docState.data && <Text>No hay especialidades cargadas</Text>}

        {docState.data && Array.isArray(docState.data) && <View>
            <FlatList
                data={docState.data}
                renderItem={({item}) =>
                    <TouchableOpacity onPress={() => onclick_item(item.id, props.nav)}>
                        <Text style={styles.item}>{item.id.toUpperCase()}</Text>
                    </TouchableOpacity>
                }
                keyExtractor={item => item.id}>

            </FlatList>
        </View>}
    </View>

}

function onclick_item(item, navigation) {
    return navigation.navigate('SolicitarTurnoScreen2', {
        especialidad: item
    })
}

export default function SolicitarTurnoScreen({navigation}) {
    const unsubscribe = navigation.addListener('didFocus', () => {
        console.log('focussed');
    });

    return (
        <View style={globalStyle.container}>
            {unsubscribe()}
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.container}>
                    <View style={styles.subContainer}>
                        <Text style={globalStyle.textoBlanco}>Solicitud de turnos{"\n"}Elija la
                            especialidad{"\n"}{"\n"}</Text>
                        <Especialidades nav={navigation}></Especialidades>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );

}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginVertical: 2,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 16,
    },
    container: {
        marginTop: 80,
        width: 300,
        height: 500,
        borderRadius: 15,
    },
    subContainer: {
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
    }
});
