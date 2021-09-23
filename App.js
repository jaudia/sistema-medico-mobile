import {NavigationContainer} from '@react-navigation/native';
//import { createStackNavigator } from '@react-navigation/stack'; se reemplaza por drawer
import {createDrawerNavigator} from '@react-navigation/drawer';
// import {useContext,useMemo,useEffect,useReducer,createContext} from 'react';
import * as React from 'react';
import {StyleSheet, Platform, StatusBar, View, Text, AsyncStorage, YellowBox} from 'react-native';
import useCachedResources from './hooks/useCachedResources';
import HomeScreen from "./screens/HomeScreen";
import MisTurnosScreen from "./screens/MisTurnosScreen";
import NotificacionesPacienteScreen from "./screens/NotificacionesPacienteScreen";
import SolicitarTurnoScreen from "./screens/SolicitarTurnoScreen";
import CerrarSessionPopup from "./screens/CerrarSessionPopup";
import SignInScreen from "./screens/SignInScreen";
import {decode, encode} from 'base-64'
import ModalidadScreen from "./screens/ModalidadScreen";
import NotificacionesMedicoScreen from "./screens/NotificacionesMedicoScreen";
import AgendaScreen from "./screens/AgendaScreen";
import AgregarAgendaScreen from "./screens/AgregarAgendaScreen";
import MisTurnosMedicoScreen from "./screens/MisTurnosMedicoScreen";
import AgregarAgendaScreen2 from "./screens/AgregarAgendaScreen2";
import BienvenidoScreen from "./screens/BienvenidoScreen";
import {PopupUnBoton} from "./components/popup";
import SolicitarTurnoScreen2 from "./screens/SolicitarTurnoScreen2";
import SolicitarTurnoScreen3 from "./screens/SolicitarTurnoScreen3";
import SolicitarTurnoScreen4 from "./screens/SolicitarTurnoScreen4";
import ModificarAgendaScreen from "./screens/ModificarAgendaScreen";
import ModificarAgendaScreen2 from "./screens/ModificarAgendaScreen2";
import MisTurnosScreen2 from "./screens/MisTurnosScreen2";

if (!global.btoa) {
    global.btoa = encode
}

if (!global.atob) {
    global.atob = decode
}


YellowBox.ignoreWarnings(["Require cycle:", "Remote debugger", "Setting a timer"]); //quitar mensajes warnings

export const AuthContext = React.createContext();


function obtenerRutaInicio(opcion) {
    if (opcion)
        return "Inicio"
    else
        return "CambiarModo"
}

function SplashScreen() {
    return (
        <View>
            <Text>CARGANDO...</Text>
        </View>
    );
}


//const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();


export default function App({navigation}) {

    const isLoadingComplete = useCachedResources();
    const [state, dispatch] = React.useReducer(
        (prevState, action) => {

            switch (action.type) {
                case 'RESTORE_TOKEN':
                    return {
                        ...prevState,
                        userToken: action.token,
                        isLoading: false,
                        opcionCambio: action.opcionCambio,
                        modoMedico: action.modoMedico,
                        modoPaciente: action.modoPaciente
                    };
                case 'SIGN_IN':
                    return {
                        ...prevState,
                        isSignout: false,
                        userToken: action.token,
                        opcionCambio: action.opcionCambio,
                        modoMedico: action.modoMedico,
                        modoPaciente: action.modoPaciente
                    };
                case 'SIGN_OUT':
                    return {
                        ...prevState,
                        isSignout: true,
                        userToken: null,
                        opcionCambio: false,
                        modoMedico: false,
                        modoPaciente: false
                    };
                case 'SETEAR_MODO':
                    return {
                        ...prevState,
                        modoMedico: action.modoMedico,
                        modoPaciente: action.modoPaciente
                    };
            }
        },
        {
            isLoading: true,
            isSignout: false,
            userToken: null,
            opcionCambio: false, //Sirve para los casos de un usuario que es medico y paciente  a la vez
            // modoMedico y modoPaciente nunca pueden ser ambos a la vez "TRUE"
            modoMedico: false,
            modoPaciente: false
        }
    );

    React.useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const bootstrapAsync = async () => {
            // let userToken;
            let tok;

            try {
                tok = await AsyncStorage.getItem('datosUsr')
                    .then((value) => {
                        let valor = JSON.parse(value);
                        if (valor.esMedico && valor.esPaciente)
                            dispatch({
                                type: 'RESTORE_TOKEN', token: valor.id, opcionCambio: true,
                                modoMedico: false, modoPaciente: false
                            });
                        else if (valor.esMedico && !valor.esPaciente)
                            dispatch({
                                type: 'RESTORE_TOKEN', token: valor.id, opcionCambio: false,
                                modoMedico: true, modoPaciente: false
                            });
                        else
                            dispatch({
                                type: 'RESTORE_TOKEN', token: valor.id, opcionCambio: false,
                                modoMedico: false, modoPaciente: true
                            });

                    });

            } catch (e) {
                console.log('fallo en restore_token');
                dispatch({type: 'RESTORE_TOKEN', token: null});
            }

            // After restoring token, we may need to validate it in production apps

            // This will switch to the App screen or Auth screen and this loading
            // screen will be unmounted and thrown away.

        };

        bootstrapAsync();
    }, []);

    // este authContext es distinto del AuthContext por la primera letra
    const authContext = React.useMemo(
        () => ({
            signIn: async datos => {
                // In a production app, we need to send some data (usually username, password) to server and get a token
                // We will also need to handle errors if sign in failed
                // After getting token, we need to persist the token using `AsyncStorage`
                // In the example, we'll use a dummy token

                // en datos.username y datos.password esta lo que encesito
                //Como token usaremos el id de usuario


                await fetch(`https://us-central1-aplicacionesdistibuidas1c2020.cloudfunctions.net/AD1C2020/logueo?email=${datos.username.toLowerCase()}&pass=${datos.password}`)
                    .then((resp) => resp.json())
                    .then(function (data) {
                        console.log("INGRESASTE A LA URL DE LOGUEO")

                        //Grabamos los datos de usuario en el dispositivo
                        AsyncStorage.setItem('datosUsr', JSON.stringify(data));

                        //Validamos si se trata de un medico para que tenga la opcion de cambio de modalidad
                        console.log(data);
                        console.log("es un medico?? " + data.esMedico);
                        console.log("es un paciente?? " + data.esPaciente);


                        if (data.esMedico && data.esPaciente)
                            dispatch({
                                type: 'SIGN_IN', token: data.id,
                                opcionCambio: true,
                                modoMedico: false,
                                modoPaciente: false,
                            });
                        else
                            dispatch({
                                type: 'SIGN_IN', token: data.id,
                                opcionCambio: false,
                                modoMedico: data.esMedico,
                                modoPaciente: data.esPaciente,
                            });
                    })
                    .catch(err => {
                        console.log(`hubo un error en la url `);
                        PopupUnBoton("Error", "El usuario o contraseña son incorrectos.");
                    });


            },
            signOut: async () => {
                await AsyncStorage.removeItem('datosUsr');
                dispatch({type: 'SIGN_OUT'})
            },
            signUp: async data => {
                // In a production app, we need to send user data to server and get a token
                // We will also need to handle errors if sign up failed
                // After getting token, we need to persist the token using `AsyncStorage`
                // In the example, we'll use a dummy token

                // dispatch({type: 'SIGN_IN', token: 'dummy-auth-token'});
            },
            modoIngresado: async datos => {
                //datos.loguearMedico es un true o false

                //Hacer un await dispatch para obligar a actualizar la pantalla
                await dispatch({
                    type: 'SETEAR_MODO',
                    modoMedico: false,
                    modoPaciente: false
                });
                dispatch({
                    type: 'SETEAR_MODO',
                    modoMedico: datos.loguearMedico,
                    modoPaciente: !datos.loguearMedico
                })
            }
        }),
        []
    );

    if (!isLoadingComplete) {
        return null;
    } else {

        return (

            <AuthContext.Provider value={authContext}>
                {/*{Platform.OS === 'ios' && <StatusBar barStyle="dark-content"/>}*/}
                {/*NAVEGACION PARA PACIENTE*/}
                <NavigationContainer>

                    <Drawer.Navigator drawerStyle={{
                        backgroundColor: '#fff',
                        labelStyle: {color: '#d9790b'}
                    }} initialRouteName="Inicio"
                    >

                        {state.isLoading ? (
                            // We haven't finished checking for the token yet
                            <Drawer.Screen name="Splash" component={SplashScreen}/>
                        ) : state.userToken == null ? (
                            // No token found, user isn't signed in
                            <>
                                <Drawer.Screen
                                    name="BienvenidoScreen"
                                    component={BienvenidoScreen}
                                    options={{
                                        title: 'noDeboAparec',
                                        gestureEnabled: false,
                                        // When logging out, a pop animation feels intuitive
                                        animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                                    }}
                                />
                                <Drawer.Screen
                                    name="SignInScreen"
                                    component={SignInScreen}
                                    options={{
                                        title: 'noDeboAparecer',
                                        gestureEnabled: false,
                                        // When logging out, a pop animation feels intuitive
                                        animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                                    }}
                                />

                            </>
                        ) : (

                            //Si se trata de un medico que a la vez es paciente
                            // y todavia no elegio el cambio
                            state.opcionCambio && !state.modoMedico && !state.modoPaciente ? (
                                <>
                                    <Drawer.Screen name="CambiarModo" component={ModalidadScreen}
                                                   options={{
                                                       title: 'noDeboAparecer',
                                                       gestureEnabled: false
                                                   }}
                                    />
                                </>
                            ) : (

                                state.modoMedico ? ( //Si es medico
                                        <>
                                            <Drawer.Screen name="Inicio" component={HomeScreen}/>
                                            <Drawer.Screen name="Agenda" component={AgendaScreen}/>
                                            <Drawer.Screen name="Notificaciones" component={NotificacionesMedicoScreen}/>
                                            {/*Si estando logueado como paciente resulta que se trata de un medico, le agregamos cambiar el modo*/}
                                            {state.opcionCambio &&
                                            <Drawer.Screen name="Cambiar de Modo" component={ModalidadScreen}/>
                                            }
                                            <Drawer.Screen name="Cerrar Sesion" component={CerrarSessionPopup}/>
                                            <Drawer.Screen name="AgregarAgendaScreen" component={AgregarAgendaScreen}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="MisTurnosMedicoScreen" component={MisTurnosMedicoScreen}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="AgregarAgendaScreen2" component={AgregarAgendaScreen2}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="ModificarAgendaScreen" component={ModificarAgendaScreen}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="ModificarAgendaScreen2" component={ModificarAgendaScreen2}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>                
                                        </>
                                    ) :
                                    ( //Si es paciente
                                        <>
                                            <Drawer.Screen name="Inicio" component={HomeScreen}
                                            />
                                            <Drawer.Screen name="Mis turnos" component={MisTurnosScreen}/>
                                            <Drawer.Screen name="Solicitar turno" component={SolicitarTurnoScreen}/>
                                            <Drawer.Screen name="Notificaciones"
                                                           component={NotificacionesPacienteScreen}/>
                                            {/*Si estando logueado como paciente resulta que se trata de un medico, le agregamos cambiar el modo*/}
                                            {state.opcionCambio &&
                                            <Drawer.Screen name="Cambiar de Modo" component={ModalidadScreen}/>
                                            }
                                            <Drawer.Screen name="Cerrar Sesion" component={CerrarSessionPopup}/>
                                            <Drawer.Screen name="SolicitarTurnoScreen2"
                                                           component={SolicitarTurnoScreen2}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="SolicitarTurnoScreen3"
                                                           component={SolicitarTurnoScreen3}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="SolicitarTurnoScreen4"
                                                           component={SolicitarTurnoScreen4}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>
                                            <Drawer.Screen name="MisTurnosScreen2"
                                                           component={MisTurnosScreen2}
                                                           options={{
                                                               drawerLabel: () => null,
                                                               title: null,
                                                               drawerIcon: () => null
                                                           }}/>                              
                                        </>
                                    )
                            ))}
                    </Drawer.Navigator>
                </NavigationContainer>
            </AuthContext.Provider>

        );
    }


}

const styles = StyleSheet.create({
    itemDrawer: {
        flex: 2,
        color: "#FFFFFF",
    }
});
