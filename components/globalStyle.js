import * as React from 'react';
import {StyleSheet} from "react-native";

export const globalStyle = StyleSheet.create({
    container: {
        flex: 1,
    },
    grad: {
        flex: 1,
        alignItems: 'center',
    },
    subContainerCenter: {
        marginTop: 200
    },
    textoBlanco: {
        fontSize: 17,
        color: "#FFFFFF",
        textAlign: 'center',
    },
    calendarioContainer:{
        flex: 2,
        // marginTop: 0,
        padding: 10,
        // height: 10,
    },
    botoneraDebajo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: "stretch", //ancho completo
        marginHorizontal: 10,

    },
    botonAtras: {
        backgroundColor: 'blue',
        marginBottom: 30,
        height: 40,
        width: 40,
        borderRadius: 20,
    },
    botonAgregar: {
        backgroundColor: 'green',
        marginBottom: 30,
        height: 40,
        width: 40,
        borderRadius: 20,
    },
    botonAvanzar: {
        backgroundColor: 'blue',
        marginBottom: 30,
        height: 40,
        width: 40,
        borderRadius: 20,
    },
    botoneraTextoBtn: {
        fontSize: 30,
        color: "#FFFFFF",
        borderRadius: 10,
        textAlign: 'center',
    },

});
