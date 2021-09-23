import * as React from 'react';
import {AsyncStorage, StyleSheet, Text, View} from 'react-native';
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";


const BienvenidaUsuario = () =>{

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    let datos = '';

    React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            datos = JSON.parse(value);
            setDocState({
                isLoading: false,
                data: datos
            });
        })
            
    }, []);
    return <View style={styles.contentContainer}>
    {docState.isLoading && <Text style={globalStyle.textoBlanco}>Cargando....</Text>}
    {!docState.isLoading && !docState.data && <Text style={globalStyle.textoBlanco}>Bienvenido!{"\n"}</Text>}
    {docState.data && <Text style={globalStyle.textoBlanco}>Bienvenido {docState.data.nombre} {docState.data.apellido}!{"\n"}</Text>}
    {docState.data && docState.data.esMedico && docState.data.esPaciente && <Text style={globalStyle.textoBlanco}>- MODO HIBRIDO -</Text>}
    {docState.data && docState.data.esMedico && !docState.data.esPaciente && <Text style={globalStyle.textoBlanco}>- MODO MEDICO -</Text>}
    {docState.data && !docState.data.esMedico && docState.data.esPaciente && <Text style={globalStyle.textoBlanco}>- MODO PACIENTE -</Text>}  
    </View>
}

const PerfilUsuario = () =>{

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null 
    });

    let usr;

    React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            usr = JSON.parse(value);
            setDocState({
                isLoading: false,
                data: usr
            });
        })
            
    }, []);
    
    return <View style={styles.contentContainer}>
    {docState.data && docState.data.esMedico && docState.data.esPaciente && <DashBoardHibrido></DashBoardHibrido>}
    {docState.data && docState.data.esMedico && !docState.data.esPaciente && <DashBoardMedico></DashBoardMedico>}
    {docState.data && !docState.data.esMedico && docState.data.esPaciente && <DashBoardPaciente></DashBoardPaciente>}    
    </View>
}

const DashBoardPaciente = () =>{

    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    let idUsuario = '';

    React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            idUsuario = JSON.parse(value).id;
            console.log(JSON.parse(value));
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
        {docState.isLoading && <Text style={styles.texto}>Cargando....</Text>}
        {!docState.isLoading && !docState.data && <Text style={styles.texto}>No hay datos.{"\n"}</Text>}
        {docState.data && <Text style={styles.texto}>Tu proximo turno es el día: {docState.data[0].dia}-{docState.data[0].mes}-{docState.data[0].anio} a las {docState.data[0].hora}Hs{"\n"}{"\n"}
                                {/* Doctor: {docState.data[0].medico}{"\n"}{"\n"}
                                Especialidad: {docState.data[0].especialidad.toUpperCase()}{"\n"}{"\n"} */}
                                Tienes {docState.data.length} turno(s) asociado(s) a tu cuenta.{"\n"}{"\n"}
        </Text>}
        <Text style={styles.textoOscuro}>Recordatorio: Tienes que confirmar el turno 12 horas antes de la fecha!</Text>
    </View>

}

const DashBoardMedico = () =>{
    const [docState, setDocState] = React.useState({
        isLoading: true,
        data: null
    });

    let idUsuario = '';

    React.useEffect(() => {
        AsyncStorage.getItem('datosUsr').then((value) => {
            idUsuario = JSON.parse(value).id;
            fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/misTurnos?idUsuario=${idUsuario}&tipoUsuario=medico`)
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
        {docState.isLoading && <Text style={styles.texto}>Cargando....</Text>}
        {!docState.isLoading && !docState.data && <Text style={styles.texto}>No hay datos.{"\n"}</Text>}
        {docState.data && <Text style={styles.texto}>Tu proximo paciente es el día: {docState.data[0].dia}-{docState.data[0].mes}-{docState.data[0].anio} a las {docState.data[0].hora}Hs{"\n"}{"\n"}
                                {/* Paciente: {docState.data[0].paciente}{"\n"}{"\n"} */}
                                Tienes {docState.data.length} turno(s) asociado(s) a tu cuenta.{"\n"}
        </Text>}
    </View>
}

const DashBoardHibrido = () =>{
    return <View>
        <Text style={styles.centrado}>Dashboard Medico{"\n"}</Text>
        <DashBoardMedico></DashBoardMedico>
        <Text style={styles.centrado}>----------------------------{"\n"}</Text>
        <Text style={styles.centrado}>Dashboard Paciente{"\n"}</Text>
        <DashBoardPaciente></DashBoardPaciente>
    </View>
}

{/*********************************************************/}

export default function HomeScreen({navigation}) {
    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <BienvenidaUsuario></BienvenidaUsuario>
                <View style={styles.container}>
                    <View style={styles.subContainer}>
                    <PerfilUsuario></PerfilUsuario>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}


const styles = StyleSheet.create({
    contentContainer: {
        marginTop: 60,
        marginBottom: 25
    },
    container:{
        backgroundColor: "#ffffff",
        width: 300,
        height: 500,
        borderRadius:15,
    },
    subContainer:{
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10
    },
    texto:{
      textAlign: 'center'
    },
    textoOscuro:{
        textAlign: 'center',
        fontWeight: 'bold'
    },
    centrado:{
        textAlign: 'center',
        fontWeight: 'bold'
    }
});
