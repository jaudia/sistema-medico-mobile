import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AuthContext} from "../App";
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";

export default function ModalidadScreen({navigation}) {

    const {modoIngresado} = React.useContext(AuthContext);

    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={styles.contentContainer}>
                <Text style={globalStyle.textoBlanco}>Elige el modo en que quieras usar la aplicacion</Text>
                </View>
                <View style={styles.spaceBtn}>
                    {/* <Button style={styles.boton} title="Ingresar" onPress={() => signIn({username, password})}/> */}
                    <TouchableOpacity
                        style={styles.botonMedico}
                        onPress={() => modoIngresado({loguearMedico: true})}
                        underlayColor='#fff'>
                        <Text style={styles.textoBtn}>Medico</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.spaceBtn}>
                    {/* <Button style={styles.boton} title="Ingresar" onPress={() => signIn({username, password})}/> */}
                    <TouchableOpacity
                        style={styles.botonPaciente}
                        onPress={() => modoIngresado({loguearMedico: false})}
                        underlayColor='#fff'>
                        <Text style={styles.textoBtn}>Paciente</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        marginTop: 60,
    },
    botonMedico: {
        backgroundColor: '#38a14f',
        color: 'white',
        width: 250,
        height: 50,
        borderRadius: 5
    },
    botonPaciente: {
        backgroundColor: '#f02b16',
        color: 'white',
        width: 250,
        height: 50,
        borderRadius: 5
    },
    inputLogin: {
        backgroundColor: '#ffffff',
        width: 250,
        height: 50,
        borderRadius: 5,
        textAlign: 'center'
    },
    space: {
        paddingBottom: 10,
        marginTop: 200
    },
    spaceBtn: {
        paddingTop: 150
    },
    textoBlanco: {
        fontSize: 17,
        color: "#FFFFFF"
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
    }
});
