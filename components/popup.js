import {Alert} from "react-native";

export const PopupUnBoton = (titulo, texto) => {
    return Alert.alert(
        `${titulo}`,
        `${texto}`,
        [
            {text: "OK", onPress: () => console.log("OK presionado")}
        ],
        {cancelable: false}
    );
}


export const PopupDosBotones = (titulo, texto) =>
    Alert.alert(
        `${titulo}`,
        `${texto}`,
        [
            {
                text: "Cancel",
                onPress: () => console.log("Cancel presionado"),
                style: "cancel"
            },
            {text: "OK", onPress: () => console.log("OK presionado")}
        ],
        {cancelable: false}
    );
