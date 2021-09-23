import * as React from 'react';
import {StyleSheet, Text, TouchableOpacity, TextInput, View, Image, ScrollView} from 'react-native';
import {AuthContext} from "../App";
import {LinearGradient} from "expo-linear-gradient";
import {globalStyle} from "../components/globalStyle";
//
export default function SignInScreen({navigation}) {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const {signIn} = React.useContext(AuthContext);

    return (
        <LinearGradient
            colors={['#05408E', '#228FBD']}
            style={globalStyle.grad}>
            <ScrollView style={{alignSelf: 'stretch'}}>
                <View style={styles.subContainerCenter}>

                    <Image
                        style={styles.tinyLogo}
                        source={require('../assets/images/usuario.png')}
                    />


                    <View style={styles.datosIngreso}>

                        <Text style={styles.textoBlanco}>E-MAIL </Text>
                        <TextInput style={styles.inputLogin}
                                   placeholder="Correo"
                                   value={username}
                                   onChangeText={setUsername}

                        />

                        <Text style={styles.textoBlanco}>CONTRASEÑA </Text>

                        <TextInput style={styles.inputLogin}
                                   placeholder="Contraseña"
                                   value={password}
                                   onChangeText={setPassword}
                                   secureTextEntry
                        />

                        {/*</View>*/}
                        {/*<View style={styles.spaceBtn}>*/}
                        <TouchableOpacity
                            style={styles.boton}
                            onPress={() => signIn({username, password})}
                            underlayColor='#fff'>
                            <Text style={styles.textoBtn}>INGRESAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    subContainerCenter: {
        marginTop: 50,
        alignItems: 'center',
    },
    boton: {
        marginTop: 25,
        backgroundColor: '#38a14f',
        color: 'white',
        width: 250,
        height: 50,
        borderRadius: 5
    },
    datosIngreso: {
        marginTop: 30,
    },
    inputLogin: {
        marginTop: 2,
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
        marginTop: 10,
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
    },
    tinyLogo: {
        width: 200,
        height: 200,
        // scale: 0.5,
    }
});
