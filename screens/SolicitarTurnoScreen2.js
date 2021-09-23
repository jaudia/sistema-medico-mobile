import * as React from 'react';
import {StyleSheet, Text, View, FlatList, TouchableOpacity} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";

const Especialidades = (props) => {
    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null,
        // especialidad: ''
    });

    const [especialidadState, setEspecialidadState] = React.useState('');

    console.log('Especialiad elegida: ' + props.prop)
    React.useEffect(() => {

        if (especialidadState.localeCompare(props.prop) !== 0) { //revisar --> Corregido ;)

            setEspecialidadState(props.prop);

            setDocState({
                isLoading: true,
                data: null,
            });
        }

            if (docState.isLoading) {

                console.log("haciendo fetch......");

                fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/listaespecialidadmedicos?especialidad=${props.prop}`)
                    .then(resp => resp.json())
                    .then(datos => {
                        console.log("se encontraron estos datos en listaespecialidad: " + JSON.stringify(datos));
                        setDocState({
                            isLoading: false,
                            data: datos,
                            especialidad: props.prop
                        });
                    })
                    .catch(err => {
                        console.log(`hubo un error en la url o no hay datos`);
                        setDocState({
                            isLoading: false,
                            data: null,
                            especialidad: props.prop
                        });
                    });
            }


    });

    return <View>
        {docState.isLoading && <Text>Cargando....</Text>}

        {!docState.isLoading && !docState.data &&
        <Text style={globalStyle.textoBlanco}>No hay medicos disponibles para la especialidad elegida</Text>}

        {docState.data && Array.isArray(docState.data) && <View>
            <FlatList
                data={docState.data}
                renderItem={({item}) =>
                    <TouchableOpacity onPress={() => onclick_item(props.prop, item, props.nav)}>
                        <Text style={styles.item}>{item.nombre.toUpperCase()} {item.apellido.toUpperCase()}</Text>
                    </TouchableOpacity>
                }
                keyExtractor={item => item.id}>

            </FlatList>
        </View>}
    </View>

}

function onclick_item(especialidad, idMedico, navigation) {
    return navigation.navigate('SolicitarTurnoScreen3', {
        especialidad: especialidad,
        medico: idMedico
    })
}

export default function SolicitarTurnoScreen2({route, navigation}) {
    const unsubscribe = navigation.addListener('didFocus', () => {
        console.log('focussed');
    });

    if (route.params === undefined)
        return null;

    return (
        <View style={globalStyle.container}>
            {unsubscribe()}
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.container}>
                    <View style={styles.subContainer}>
                        <Text style={globalStyle.textoBlanco}>
                            Especialidad elegida:{"\n"}{route.params.especialidad.toUpperCase()}{"\n"}{"\n"}
                        </Text>
                        <Text style={globalStyle.textoBlanco}>
                            Seleccione un profesional:{"\n"}
                        </Text>
                        <Especialidades prop={route.params.especialidad} nav={navigation}></Especialidades>
                    </View>
                </View>
            </LinearGradient>
        </View>

    )
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
