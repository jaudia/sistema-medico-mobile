import * as React from 'react';
import {StyleSheet, Text, Button, View, TouchableOpacity, Image} from 'react-native';
import IngresoScreen from "./SignInScreen";
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";


export default function BienvenidoScreen({navigation}) {

    return (
        // <View style={globalStyle.container}>
        <LinearGradient
            colors={['#05408E', '#228FBD']}
            style={globalStyle.grad}>

            <View style={styles.subContainerCenter}>

                <Image
                    style={styles.tinyLogo}
                    source={require('../assets/images/logo_plusalud.jpeg')}
                />

                <Text style={styles.textoBlanco}>Bienvenido</Text>

                <TouchableOpacity
                    style={styles.boton}
                    onPress={() => {
                        navigation.navigate('SignInScreen');
                    }}>
                    <Text style={styles.textoBtn}>{`Avanzar`}</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
        // </View>

    );
}

const styles = StyleSheet.create({

    subContainerCenter: {
        marginTop: 60,
        alignItems: 'center',
    },
    boton: {
        marginTop: 60,
        backgroundColor: '#189e3d',
        color: 'white',
        width: 250,
        height: 50,
        justifyContent: 'center',
        borderRadius: 5
    },
    tinyLogo: {
        width: 250,
        height: 300,
        borderRadius: 5
    },
    textoBtn: {
        fontSize: 20,
        color: "#FFFFFF",
        textAlign: 'center',
        borderRadius: 10,
    },
    textoBlanco: {
        marginTop: 20,
        fontSize: 30,
        color: "#FFFFFF",
        textAlign: 'center',
    },
});
