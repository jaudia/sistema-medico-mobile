import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {AuthContext} from "../App";
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";

export default function CerrarSessionPupUp({navigation}) {
    const {signOut} = React.useContext(AuthContext);
    return (
        <View style={globalStyle.container}>
            <LinearGradient
                colors={['#05408E', '#228FBD']}
                style={globalStyle.grad}>
                <View style={globalStyle.subContainerCenter}>
                    <Text style={globalStyle.textoBlanco}>
                        ¿Desea realmente cerrar la sesión?
                    </Text>
                </View>
                <View style={styles.space}>
                    <TouchableOpacity
                        style={styles.boton}
                        onPress={signOut}
                        underlayColor='#fff'>
                        <Text style={styles.textoBtn}>Cerrar sesión</Text>
                    </TouchableOpacity>
                </View>
                {/*<Button style={styles.textoBtn} title="Cerrar session" onPress={signOut}/>*/}
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    space: {
        paddingTop: 25
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
        backgroundColor: '#CE2929',
        color: 'red',
        width: 250,
        height: 50,
        borderRadius: 5
    }
});
