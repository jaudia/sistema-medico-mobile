import * as React from 'react';
import {StyleSheet, Text, View, FlatList, AsyncStorage, TouchableOpacity, SafeAreaView} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
import {PopupUnBoton} from "../components/popup";

const horario = [
    {desde: "09:00", hasta: "09:30", numeroDesde: 9.00, numeroHasta: 9.30},
    {desde: "09:30", hasta: "10:00", numeroDesde: 9.30, numeroHasta: 10.00},
    {desde: "10:00", hasta: "10:30", numeroDesde: 10.00, numeroHasta: 10.30},
    {desde: "10:30", hasta: "11:00", numeroDesde: 10.30, numeroHasta: 11.00},
    {desde: "11:00", hasta: "11:30", numeroDesde: 11.00, numeroHasta: 11.30},
    {desde: "11:30", hasta: "12:00", numeroDesde: 11.30, numeroHasta: 12.00},
    {desde: "12:00", hasta: "12:30", numeroDesde: 12.00, numeroHasta: 12.30},
    {desde: "12:30", hasta: "13:00", numeroDesde: 12.30, numeroHasta: 13.00},
    {desde: "13:00", hasta: "13:30", numeroDesde: 13.00, numeroHasta: 13.30},
    {desde: "13:30", hasta: "14:00", numeroDesde: 13.30, numeroHasta: 14.00},
    {desde: "14:00", hasta: "14:30", numeroDesde: 14.00, numeroHasta: 14.30},
    {desde: "14:30", hasta: "15:00", numeroDesde: 14.30, numeroHasta: 15.00},
    {desde: "15:00", hasta: "15:30", numeroDesde: 15.00, numeroHasta: 15.30},
    {desde: "15:30", hasta: "16:00", numeroDesde: 15.30, numeroHasta: 16.00},
    {desde: "16:00", hasta: "16:30", numeroDesde: 16.00, numeroHasta: 16.30},
    {desde: "16:30", hasta: "17:00", numeroDesde: 16.30, numeroHasta: 17.00},
    {desde: "17:00", hasta: "17:30", numeroDesde: 17.00, numeroHasta: 17.30},
    {desde: "17:30", hasta: "18:00", numeroDesde: 17.30, numeroHasta: 18.00}];

const Horarios = (props) => {
    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });
    console.log(props.props.especialidad);
    React.useEffect(() => {
        if (docState.data == null) {
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/reservaMedicoEspecifica?medico=${props.props.medico.id}&dia=${props.props.dia}&mes=${props.props.mes}&anio=${props.props.anio}`)
                .then(resp => resp.json())
                .then(datos => {
                    console.log(datos);
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

        {!docState.isLoading && !docState.data &&
        <Text style={globalStyle.textoBlanco}>No hay horarios disponible para la fecha elegida</Text>}

        {docState.data && Array.isArray(docState.data) && <SafeAreaView>
            <FlatList
                data={docState.data[0].horarios}
                renderItem={({item, index}) =>
                    <View style={{flex: 1}}>
                        <TouchableOpacity onPress={() => onclick_item(props.props, item, index)}>
                            <Text
                                style={styles.item}>{item === true ? horario[index].desde + '-' + horario[index].hasta + ' ' + docState.data[0].especialidad.toUpperCase() : horario[index].desde + '-' + horario[index].hasta + ' NO DISPONIBLE'}</Text>
                        </TouchableOpacity>
                    </View>
                }
                keyExtractor={item => item.horarios}>

            </FlatList>
        </SafeAreaView>}
    </View>
}

function onclick_item(props, item, index) {
    // llamar a crear turno
    if (item === true) {
        crearTurno(props, index);
    } else {
        PopupUnBoton("No disponible", "No puede elegir un horario que no esta disponible");
    }
}

function crearTurno(props, index) {

    let usr;
    AsyncStorage.getItem('datosUsr').then((value) => {
        usr = JSON.parse(value).id;

        if (usr != null) {
            console.log(props.medico.id + ' ' + props.anio + ' ' + props.mes + ' ' + props.dia + ' ' + horario[index].desde + ' ' + usr);
            console.log("el index es: " + index);
            // CREAR TURNO

            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/crearTurno?anio=${props.anio}&dia=${props.dia}&especialidad=${props.especialidad}&hora=${horario[index].desde}&medico=${props.medico.id}&mes=${props.mes}&paciente=${usr}&index=${index}`, {
                method: 'post',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            })
                .then(resp => {
                    console.log("el status es " + resp.status); // returns 200

                    if (resp.status === 200)
                        PopupUnBoton("Correcto!", "El turno fue creado correctamente.");
                    else
                        PopupUnBoton("Error:", "No se pudo crear el turno porque ya existe uno en esa reserva.");

                })
                .catch(err => {
                    PopupUnBoton("Error:", "Se produjo un error en el servidor. Contacte al centro medico");
                });
        }
    }).catch(e => {
        console.log("Error al obtener datos locales en solicitarTurnoScreen4");
    });
}


export default function SolicitarTurnoScreen4({route, navigation}) {
    if (route.params === undefined)
        return null;

    return (
        <LinearGradient
            colors={['#05408E', '#228FBD']}
            style={globalStyle.grad}>
            <View style={styles.subContainer}>
                <Text style={globalStyle.textoBlanco}>
                    Especialidad elegida:{"\n"}{route.params.especialidad.toUpperCase()}{"\n"}
                </Text>
                <Text style={globalStyle.textoBlanco}>
                    Medico
                    elegido:{"\n"}{route.params.medico.nombre.toUpperCase()} {route.params.medico.apellido.toUpperCase()}{"\n"}
                </Text>
                <Text style={globalStyle.textoBlanco}>
                    Fecha elegida:{"\n"}{route.params.dia}-{route.params.mes}-{route.params.anio}{"\n"}
                    {"\n"}Seleccione un horario:
                </Text>
                <Horarios props={route.params}></Horarios>

            </View>
        </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    subContainer: {
        flex: 1,
        marginTop: 30,
    },
    item: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginVertical: 2,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 16,
    }
});
