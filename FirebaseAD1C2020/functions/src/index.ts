// import * as functions from 'firebase-functions';
// tslint:disable-next-line:no-implicit-dependencies
// import * as express from 'express';
// import * as admin from 'firebase-admin';

const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const FieldValue = require('firebase-admin').firestore.FieldValue;

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp(functions.config().firebase);

const app = express();

const db = admin.firestore();

//Turnos

app.put('/modificarturno/:id', async (req, res) => {
  const turno = req.body;

  const resp = await db.collection('turno').doc(req.params.id).update(turno);

  if (resp.writeTime) {
    res.status(200).send('El turno se modifico correctamente');
  } else {
    res.status(500).send('Ocurrio un error al modificar el turno');
  }
});

app.get('/listarturnos', async (req, res) => {
  const turnos = await db.collection('turno').get();

  const listaTurnos = new Array();

  turnos.forEach((turno) => {
    const id = turno.id;
    const datos = turno.data();

    listaTurnos.push({id, ...datos});
  });

  if (listaTurnos.length > 0) {
    res.status(200).send(JSON.stringify(listaTurnos));
  } else {
    res.status(500).send('No hay turnos cargados');
  }
});

app.get('/listarturnosmedicomes/:idmedico/:mes', async (req, res) => {
  const turnos = await db
      .collection('turno')
      .where('medico', '==', req.params.idmedico)
      .where('mes', '==', req.params.mes)
      .get();

  const listaTurnos = new Array();

  turnos.forEach((turno) => {
    const id = turno.id;
    const datos = turno.data();

    listaTurnos.push({id, ...datos});
  });

  if (listaTurnos.length > 0) {
    res.status(200).send(JSON.stringify(listaTurnos));
  } else {
    res.status(500).send('No hay turnos cargados');
  }
});

app.get('/listarturnospacientemes/:idpaciente/:mes', async (req, res) => {
  const turnos = await db
      .collection('turno')
      .where('medico', '==', req.params.idpaciente)
      .where('mes', '==', req.params.mes)
      .get();

  const listaTurnos = new Array();

  turnos.forEach((turno) => {
    const id = turno.id;
    const datos = turno.data();

    listaTurnos.push({id, ...datos});
  });

  if (listaTurnos.length > 0) {
    res.status(200).send(JSON.stringify(listaTurnos));
  } else {
    res.status(500).send('No hay turnos cargados');
  }
});

//Notificaciones

app.post('/crearnotificacion', async (req, res) => {
  const notificacion = req.body;

  const resp = await db.collection('notificacion').add(notificacion);

  if (resp.id) {
    res.status(201).send('La notificacion se dio de alta');
  } else {
    res.status(500).send('Ocurrio un error al dar de alta la notificacion');
  }
});

function crearNotificacion(objeto) {

  return db.collection('notificacion').add(objeto).then(ref => {
    return true;
  }).catch(er => {
    return false;
  });

}

//Usuarios

app.get('/listarusuarios', async (req, res) => {
  const usuarios = await db.collection('usuario').get();

  const listaUsuarios = new Array();

  usuarios.forEach((usuario) => {
    const id = usuario.id;
    const datos = usuario.data();

    listaUsuarios.push({id, ...datos});
  });

  if (listaUsuarios.length > 0) {
    res.status(200).send(JSON.stringify(listaUsuarios));
  } else {
    res.status(500).send('No hay usuarios cargados');
  }
});

app.get('/listarusuarios/:tipo', async (req, res) => {
  if (
      req.params.tipo.toLowerCase() !== 'medico' &&
      req.params.tipo.toLowerCase() !== 'paciente'
  ) {
    res.status(500).send('Tipo de usuario no permitido');
  } else {
    let usuarios;

    const listaUsuarios = new Array();
    if (req.params.tipo.toLowerCase() === 'medico') {
      usuarios = await db
          .collection('usuario')
          .where('esmedico', '==', true)
          .get();
    } else {
      usuarios = await db
          .collection('usuario')
          .where('esmedico', '==', false)
          .get();
    }

    usuarios.forEach((usuario) => {
      const id = usuario.id;
      const datos = usuario.data();

      listaUsuarios.push({id, ...datos});
    });

    if (listaUsuarios.length > 0) {
      res.status(200).send(JSON.stringify(listaUsuarios));
    } else {
      res.status(500).send('No hay usuarios cargados');
    }
  }
});

app.get('/logueo', async (req, res) => {
  const usuarios = await db.collection('usuario')
      .where('email', '==', req.query.email.toLowerCase())
      .where('password', '==', req.query.pass)
      .get();

  const usrLogin = new Array();

  usuarios.forEach((usr) => {
    const id = usr.id;
    const datos = usr.data();

    usrLogin.push({id, ...datos});
  });

  if (usrLogin.length > 0)
    res.status(200).send(usrLogin[0]);
  else {
    res.status(500).send('Usuario/contraseña incorectos');
  }

});

//Helper para obtener documentos a partir de un array de IDs
const getDocs = (nombreCol, arr) => {
  return Promise.all(
      arr.map(elem => {
        const docref = db.collection(nombreCol).doc(elem);

        return docref.get().then(doc => {
          const id = doc.id;
          const datos = doc.data();
          return {id, ...datos};
        });
      })
  )
      .then(data => {
        return data;
      });
};

//Helper para obtener 1 documento singular a partir del ID
const sing = (nombreCol, docId) => {
  return Promise.resolve(
      db.collection(nombreCol).doc(docId).get()
  ).then(doc => {
    const id = doc.id;
    const datos = doc.data();
    return {id, ...datos};
  });
}

// GET Notificaciones

app.get('/notificaciones', async (req, res) => {

  const arr = new Array();

  const notif = await db.collection('notificacion')
      .where(req.query.tipoUsuario, '==', req.query.idUsuario)
      .get();


  notif.forEach((turno) => {
    const id = turno.id;
    const datos = turno.data();

    arr.push({id, ...datos});
  });


  if (arr.length > 0) {
    res.status(200).send(JSON.stringify(arr));
  } else {
    res.status(500).send('No hay notificaciones cargadas');
  }

});

// Obtener lista de Especialidades
app.get('/listaespecialidades', async (req, res) => {
  const especialidades = await db.collection('especialidad').get();

  const listaEspecialidades = new Array();

  especialidades.forEach((especialidad) => {
    const id = especialidad.id;
    const datos = especialidad.data();

    listaEspecialidades.push({id, ...datos});
  });

  if (listaEspecialidades.length > 0) {
    res.status(200).send(JSON.stringify(listaEspecialidades));
  } else {
    res.status(500).send('No hay especialidades cargadas');
  }
});

// Obtener medicos con determinada especialidad

app.get('/listaespecialidadmedicos', async (req, res) => {
  const usuarios = await db.collection('usuario')
      .where('esMedico', '==', true)
      .where('especialidades', 'array-contains-any', [req.query.especialidad])
      .get();

  const listaUsuarios = new Array();

  usuarios.forEach((usuario) => {
    const id = usuario.id;
    const datos = usuario.data();

    listaUsuarios.push({id, ...datos});
  });

  if (listaUsuarios.length > 0) {
    res.status(200).send(JSON.stringify(listaUsuarios));
  } else {
    res.status(500).send('No hay medicos con esa especialidad');
  }
});

// Obtener turnos con determinado medico y especialidad

app.get('/reservaMedico', async (req, res) => {

  const reservaMedico = await db.collection('reservaMedico')
      .where('medico', '==', req.query.medico)
      .where('especialidad', '==', req.query.especialidad)
      .get();

  const listaReservas = new Array();

  reservaMedico.forEach((reserva) => {
    const id = reserva.id;
    const datos = reserva.data();


    listaReservas.push({id, ...datos});
  });

  if (listaReservas.length > 0) {
    res.status(200).send(JSON.stringify(listaReservas));
  } else {
    res.status(500).send('No hay medicos disponibles con esa especialidad');
  }
});

// Obtener reservas para un medico, especialidad y fecha especifica

app.get('/reservaMedicoEspecifica', async (req, res) => {
  const reservaMedico = await db.collection('reservaMedico')
      .where('medico', '==', req.query.medico)
      .where('dia', '==', parseInt(req.query.dia))
      .where('mes', '==', parseInt(req.query.mes))
      .where('anio', '==', parseInt(req.query.anio))
      .get();

  const listaReservas = new Array();

  reservaMedico.forEach((reserva) => {
    const id = reserva.id;
    const datos = reserva.data();


    listaReservas.push({id, ...datos});
  });

  if (listaReservas.length > 0) {
    res.status(200).send(JSON.stringify(listaReservas));
  } else {
    res.status(500).send('No hay medicos disponibles con esa especialidad y fecha');
  }
});

// Crear turno para paciente

function makeid(length) { // Metodo para generar IDs
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.post('/crearTurno', async (req, res) => {

  const turnoReservado = new Array();

  // Busco si existe el turno
  const turno = await
      db.collection('turno')
          .where('anio', '==', Number(req.query.anio))
          .where('dia', '==', Number(req.query.dia))
          .where('especialidad', '==', req.query.especialidad)
          .where('hora', '==', req.query.hora)
          .where('medico', '==', req.query.medico)
          .where('mes', '==', Number(req.query.mes))
          .get();


  if (turno !== null) { // No me devolvio NULL

    turno.forEach(value => {
      const id = value.id;
      const datos = value.data();

      turnoReservado.push({id, ...datos});

    });

    if (turnoReservado.length === 0) { // no existe el turno puedo crearlo
      let id = makeid(10); // GUARDO ID RANDOM

      // AGREGO TURNO
      db.collection('turno').doc(id).set({
        anio: Number(req.query.anio),
        dia: Number(req.query.dia),
        especialidad: req.query.especialidad,
        estado: 'INICIADO',
        hora: req.query.hora,
        medico: req.query.medico,
        mes: Number(req.query.mes),
        paciente: req.query.paciente

      }).then(function () {

        // NOTIFICACIONES
        let idMedico = makeid(10); // GUARDO ID NOTIFICACION MEDICO
        let idPaciente = makeid(10); // GUARDO ID NOTIFICACION PACIENTE

        const fechaActual = new Date();
        let fecha = req.query.dia + "-" + req.query.mes + "-" + req.query.anio; // OBTENGO FECHA PARA NOTIFICACION

        // NOTIFICACION MEDICO
        db.collection('notificacion').doc(idMedico).set({
          anio: fechaActual.getFullYear(),
          descripcion: `Se te asocio un turno para la fecha: ${fecha.toString()}`,
          dia: fechaActual.getDay(),
          medico: req.query.medico,
          mes: fechaActual.getMonth()
        })

        // NOTIFICACION PACIENTE
        db.collection('notificacion').doc(idPaciente).set({
          anio: fechaActual.getFullYear(),
          descripcion: `Tenes un turno para la fecha: ${fecha.toString()}`,
          dia: fechaActual.getDay(),
          mes: fechaActual.getMonth(),
          paciente: req.query.paciente
        })

        // ACTUALIZAR ARRAY USER PACIENTE - MEDICO

        db.collection('usuario').doc(req.query.paciente).update({
          turnosPaciente: FieldValue.arrayUnion(id),
          notificacionesPaciente: FieldValue.arrayUnion(idPaciente)
        }, {merge: true})

        db.collection('usuario').doc(req.query.medico).update({
          turnosMedico: FieldValue.arrayUnion(id),
          notificacionesMedico: FieldValue.arrayUnion(idMedico)
        }, {merge: true})

        res.status(200).send('El turno fue creado correctamente'); // TODO OK
      })
          .catch(function (error) {
            console.error("Error writing document: ", error); // ERROR DOC
          });

    } else { // Si existe, no puedo crearlo
      res.status(500).send('El turno ya existe actualmente');
    }
  } else { // Error server
    res.status(500).send('El turno no se pudo crear');
  }


});

// Cancelar turno por paciente

app.post('/deleteTurno', async (req, res) => {
  const d = new Date();

  const turnoPaciente = await db.collection('turno').doc(req.query.turno).get();

  if(turnoPaciente.data().estado.toUpperCase() === 'INICIADO' || turnoPaciente.data().estado.toUpperCase() === 'CONFIRMADO'){
  
    var date1 = new Date();
    date1.setFullYear(turnoPaciente.data().anio, turnoPaciente.data().mes-1, turnoPaciente.data().dia);
    date1.setHours(turnoPaciente.data().hora.substring(0, 2), turnoPaciente.data().hora.substring(3),0);

    var hours = Math.abs(req.query.fecha - date1.getTime()) / 36e5;

    if(hours >= 12){
      const turno = await db.collection('turno').doc(req.query.turno);
  await turno.set({
        estado: 'cancelado',
      },
      {merge: true});

  /*ahora creamos notificacion para el paciente y luego el medico*/
  await db.collection('turno').doc(req.query.turno).get().then(resultado => {

    const value = resultado.data();

    crearNotificacion({
      anio: Number(d.getFullYear()),
      mes: Number(d.getMonth() + 1),
      dia: Number(d.getDate()),
      descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido cancelado.`,
      paciente: value.paciente
    });

    crearNotificacion({
      anio: Number(d.getFullYear()),
      mes: Number(d.getMonth() + 1),
      dia: Number(d.getDate()),
      descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido cancelado.`,
      medico: value.medico
    });

    res.status(200).send('OK');

  }).catch(er => {
    res.status(500).send('se produjo un error al obtener nuevamente el turno');
  })  
  }
  else
  {
    const turno = await db.collection('turno').doc(req.query.turno);
    await turno.set({
          estado: 'cancelado',
        },
        {merge: true});
  
    /*ahora creamos notificacion para el paciente y luego el medico*/
    await db.collection('turno').doc(req.query.turno).get().then(resultado => {
  
      const value = resultado.data();
  
      crearNotificacion({
        anio: Number(d.getFullYear()),
        mes: Number(d.getMonth() + 1),
        dia: Number(d.getDate()),
        descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido cancelado. Se le cobrara un cargo adicional por cancelar con menos de doce horas.`,
        paciente: value.paciente
      });
  
      crearNotificacion({
        anio: Number(d.getFullYear()),
        mes: Number(d.getMonth() + 1),
        dia: Number(d.getDate()),
        descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido cancelado.`,
        medico: value.medico
      });
  
      res.status(200).send('OK');
  
    }).catch(er => {
      res.status(500).send('se produjo un error al obtener nuevamente el turno');
    })
  }
}else{
  res.status(500).send('El turno no esta iniciado');
}
});

// Confirmar turno por paciente


app.post('/confirmarTurno', async (req, res) => {
  const d = new Date();

  const turnoPaciente = await db.collection('turno').doc(req.query.turno).get();

  if(turnoPaciente.data().estado.toUpperCase() === 'INICIADO'){

    var date1 = new Date();
    date1.setFullYear(turnoPaciente.data().anio, turnoPaciente.data().mes-1, turnoPaciente.data().dia);
    date1.setHours(turnoPaciente.data().hora.substring(0, 2), turnoPaciente.data().hora.substring(3),0);

    var hours = Math.abs(req.query.fecha - date1.getTime()) / 36e5;

    if(hours <= 12 && hours >= 1){
      const turno = await db.collection('turno').doc(req.query.turno);

  await turno.set({
        estado: 'confirmado',
      },
      {merge: true});

  /*ahora creamos notificacion para el paciente y luego el medico*/
  await db.collection('turno').doc(req.query.turno).get().then(resultado => {

    const value = resultado.data();

    crearNotificacion({
      anio: Number(d.getFullYear()),
      mes: Number(d.getMonth() + 1),
      dia: Number(d.getDate()),
      descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido confirmado.`,
      paciente: value.paciente
    });

    crearNotificacion({
      anio: Number(d.getFullYear()),
      mes: Number(d.getMonth() + 1),
      dia: Number(d.getDate()),
      descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido confirmado.`,
      medico: value.medico
    });

    res.status(200).send('OK');

  }).catch(er => {
    res.status(500).send('se produjo un error al obtener nuevamente el turno');
  })
    }
    else{
      res.status(500).send('No puede confirmar faltando mas de doce horas y menos de una.');
    }
    
}else{
  res.status(500).send('El turno no esta iniciado');
}
});


/*Por el momento, este get se va a usar cuando el medico quiera agregar una reserva
* a su agenda. Segun el TPO, solo puede agregar desde el dia actual hasta 2 meses siguientes. */
app.get('/reservas', async (req, res) => {

  const vector = new Array();
  const fechaActual = new Date();

  const reservasA = await db.collection('reservaMedico')
      .where('medico', '==', req.query.idmedico)
      .where('anio', '==', fechaActual.getFullYear())
      .where('mes', '==', (fechaActual.getMonth() + 1))
      .get();

  reservasA.forEach((value) => {
    if (value.data().dia >= fechaActual.getDate()) {
      const id = value.id;
      const datos = value.data();

      vector.push({id, ...datos});
    }
  });

  const reservasB = await db
      .collection('reservaMedico')
      .where('medico', '==', req.query.idmedico)
      .where('anio', '==', fechaActual.getFullYear())
      .where('mes', '>', (fechaActual.getMonth() + 1))
      .get();


  reservasB.forEach((value) => {
    const id = value.id;
    const datos = value.data();
    vector.push({id, ...datos});
  });


  if (vector.length > 0) {
    res.status(200).send(JSON.stringify(vector));
  } else {
    res.status(500).send('No hay turnos cargados');
  }


});


app.get('/misTurnos', async (req, res) => {

  const listaTurnos = new Array();

  const fechaActual = new Date();

  const turnosA = await db.collection('turno')
      .where(req.query.tipoUsuario, '==', req.query.idUsuario)
      .where('anio', '==', fechaActual.getFullYear())
      .where('mes', '==', (fechaActual.getMonth() + 1))
      .get();

  turnosA.forEach((turno) => {
    if (turno.data().dia >= fechaActual.getDate()) {
      const id = turno.id;
      const datos = turno.data();

      listaTurnos.push({id, ...datos});
    }
  });

  const turnosB = await db.collection('turno')
      .where(req.query.tipoUsuario, '==', req.query.idUsuario)
      .where('anio', '==', fechaActual.getFullYear())
      .where('mes', '>', (fechaActual.getMonth() + 1))
      .get();


  turnosB.forEach((turno) => {
    const id = turno.id;
    const datos = turno.data();

    listaTurnos.push({id, ...datos});
  });


  if (listaTurnos.length > 0) {
    res.status(200).send(JSON.stringify(listaTurnos));
  } else {
    res.status(500).send('No hay turnos cargados');
  }
});

/*Se considerará el horario de 9 a 18. con reservas de media hora
* En total son 18 items fijos.
* Cuando un horario no tiene especialidad, significa que ese rango esta libre*/
app.post('/crearReserva', async (req, res) => {

  const reserva = new Array();

  /*No puede haber mas de 1 documento con este criterio*/
  const reservaDoc = await
      db.collection('reservaMedico')
          .where('medico', '==', req.query.idmedico)
          .where('anio', '==', Number(req.query.anio))
          .where('mes', '==', Number(req.query.mes))
          .where('dia', '==', Number(req.query.dia))
          .get();


  if (reservaDoc !== null)
    reservaDoc.forEach(value => {
      const id = value.id;
      const datos = value.data();

      reserva.push({id, ...datos});

    });


  if (reserva.length > 0)
    await db.collection('reservaMedico').doc(reserva[0].id)
        .set(
            //     {
            //     hayEspacio: (req.query.hayEspacio == "true"), //conversion a booleano
            //     horarios: req.query.horario //vector
            // }, {merge: true}

            req.body
        )
        .then(value => {
          res.status(200).send('La reserva se dio de alta');
        })
        .catch(err => {
          res.status(500).send(`error al grabar para el valor ${JSON.stringify(reserva[0])}`);
        })

  else {
    /*Como no se encontró el documento, se trata de una fecha nueva*/
    await db.collection('reservaMedico')
        .add(
            req.body
            // medico: req.query.idmedico,
            // anio: req.query.anio,
            // mes: req.query.mes,
            // dia: req.query.dia,
            // hayEspacio: (req.query.hayEspacio == "true"), //conversion a booleano
            // horarios: req.query.horario
        ).then(value => {
          res.status(200).send('La reserva se dio de alta');
        }).catch(er => {
          res.status(500).send(`No se pudo crear la reserva`)
        })

  }

});


app.put('/agregarColaEspera', async (req, res) => {

  // const cola = new Array();

  /*No puede haber mas de 1 documento con este criterio*/
  const docref = await db.collection('colaEspera').doc(req.query.especialidad);


  docref.get().then(doc => {
    const arr = doc.data().paciente;
    arr.push(req.query.paciente);
    return arr;
  }).then(value => {
    return db.collection('colaEspera').doc(req.query.especialidad).set({
      paciente: value
    }).then(result => {
      res.status(200).send('Usted ha sido agregado a la cola de espera')
    }).catch(val => {
      res.status(500).send(`No se pudo agtregar a la cola de espera`)
    });
  }).catch(er => {
    res.status(500).send(`No se pudo agtregar a la cola de espera`)
  })
});

/*Cancelacion de turno: solo se le pasa el id de turno como "idTurno" */
app.put('/cancelarTurno/', async (req, res) => {

  const d = new Date();

  const turno = await db.collection('turno').doc(req.query.idTurno);

  await turno.set({
        estado: 'cancelado',
      },
      {merge: true});

  /*ahora creamos notificacion para el paciente y luego el medico*/
  await db.collection('turno').doc(req.query.idTurno).get().then(resultado => {

    const value = resultado.data();

    crearNotificacion({
      anio: Number(d.getFullYear()),
      mes: Number(d.getMonth() + 1),
      dia: Number(d.getDate()),
      descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido cancelado.`,
      paciente: value.paciente
    });

    crearNotificacion({
      anio: Number(d.getFullYear()),
      mes: Number(d.getMonth() + 1),
      dia: Number(d.getDate()),
      descripcion: `Su turno para el ${value.dia}/${value.mes}/${value.anio} a las ${value.hora} ha sido cancelado.`,
      medico: value.medico
    });

    res.status(200).send('OK');

  }).catch(er => {
    res.status(500).send('se produjo un error al obtener nuevamente el turno');
  })

});

exports.AD1C2020 = functions.https.onRequest(app);
