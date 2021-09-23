import * as React from 'react';
import { useState, useEffect } from 'react';
import 'firebase/firestore';
import * as firebase from "firebase";
import { firebaseConfig } from './dbConfig';



//Inicializa SOLO si es necesario. Evita error de duplicado
export const dbapp = (!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app());

//***Estos metodos useFirestoreDoc y useFirestoreQuery
//***conviene usarlos cuando no se van a usar el fetch
export const useFirestoreDoc = (ref) => {
    const [docState, setDocState] = useState({
        isLoading: true,
        data: null
    });

    useEffect(() => {
        return ref.onSnapshot(doc => {
            setDocState({
                isLoading: false,
                data: doc
            });
        });
    }, []);

    return docState;
}


export const useFirestoreQuery = (ref) => {
    const [docState, setDocState] = useState({
        isLoading: true,
        data: null
    });

    useEffect(() => {
        return ref.onSnapshot(docs => {
            setDocState({
                isLoading: false,
                data: docs
            });
        });
    }, []);

    return docState;
}

//
// export function turnosUsuario(usr, pass) {
//     let db = firebase.firestore(dbapp);
//     console.log("TURNOS DEL USUARIO");
//     setTimeout(() => {
//         let docRef = db.collection("usuario").doc("1");
//         docRef.get().then(function (docuref) {
//             if (docuref.exists) {
//                 docuref.get("turnosPaciente").forEach(turno => {
//                     db.doc(turno.path)
//                         .get()
//                         .then(snapshot => {
//                             console.log(`La fecha del turno con id ${turno.id} es ${snapshot.get("fecha")}`);
//                         });
//                 })
//             } else {
//                 // doc.data() will be unsdefined in this case
//                 console.log("No such document!");
//             }
//         }).catch(function (error) {
//             console.log("Error getting document:", error);
//         });
//     }, 3000);
// }

// export function notificaciones(usr, pass) {
//     const [articles, setArticles] = useState([]);
//     let db = firebase.firestore(dbapp);
//     setTimeout(() => {
//         let docRef = db.collection("usuario").doc("1");
//         docRef.onSnapshot(docu => {
//             console.log("PRUEBAS -----------------");
//             docu.data().notificacionesPaciente
//                 .forEach(docum => {
//                     db.doc(docum.path)
//                         .onSnapshot(individual => {
//                             console.log(individual.data().descripcion);
//                         })
//                 })
//         })
//         docRef.get().then(function (docuref) {
//             if (docuref.exists) {
//                 docuref.get("notificacionesPaciente").forEach(notif => {
//                     db.doc(notif.path)
//                         .get()
//                         .then(snapshot => {
//                             console.log(`${snapshot.get("descripcion")} - ${snapshot.get("fecha")}`);
//                         });
//                 })
//             } else {
//                 // doc.data() will be unsdefined in this case
//                 console.log("No such document!");
//             }
//         }).catch(function (error) {
//             console.log("Error getting document:", error);
//         });
//     }, 3000);
// }