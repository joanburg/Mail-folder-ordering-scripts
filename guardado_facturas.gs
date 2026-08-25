//=============================================================================================
//MAPA INFORMACIÓN ASOCIADA A CORREOS (CARPETAS, NOMBRES) (se pueden añadir más con el tiempo)
//=============================================================================================
const INFO_EMPRESAS = {
  "ejemplo1@gmail.com": {
    dominio: "ejemplo1.es",
    proveedor: "ejemplo1",
    cuenta: "",
    ctrl: "",
    folderId: "FOLDER_ID_DE_LA_CARPETA_DE_DRIVE_CORRESPONDIENTE"
  },
  "ejemplo2@gmail.com": {
    dominio: "ejemplo2.es",
    proveedor: "ejemplo2",
    cuenta: "",
    ctrl: "",
    folderId: "FOLDER_ID_DE_LA_CARPETA_DE_DRIVE_CORRESPONDIENTE"
  },
    "ejemplo3@gmail.com": {
    dominio: "ejemplo3.es",
    proveedor: "ejemplo3",
    cuenta: "",
    ctrl: "",
    folderId: "FOLDER_ID_DE_LA_CARPETA_DE_DRIVE_CORRESPONDIENTE"
    }
};
//Esta versión del código no tiene correos reales, pero se aprecia la estructura

//=============================================================================================
//LISTA DE EMPRESAS QUE SE GUARDAN EN LA CARPETA DE PENDIENTES. SI UNA EMPRESA NO SE INCLUYE AQUÍ, VA A LA CARPETA DE PENDIENTES POR DEFECTO (ADEMÁS DE LA CLASIFICADA)
//=============================================================================================
const EMPRESAS_ALBARAN = [
  "ejemplo1@gmail.com",
  "ejemplo2@gmail.com",
  "ejemplo3@gmail.com"
];
//Esta versión del código no tiene correos reales, pero se aprecia la estructura

//=============================================================================================
//CARPETA DONDE VAN LAS FACTURAS PENDIENTES DE CONTABILIZAR (TODAS LAS QUE LLEGAN AL CORREO, DIVIDIDO ENTRE LAS QUE HAY QUE COMPROBAR ALBARAN Y NO)
//=============================================================================================
const CARPETA_PENDIENTES = "FOLDER_ID_DE_LA_CARPETA_DE_DRIVE_CORRESPONDIENTE";

const CARPETA_PENDIENTES_ALBARAN = "FOLDER_ID_DE_LA_CARPETA_DE_DRIVE_CORRESPONDIENTE";

//=============================================================================================
//CARPETA DONDE VAN LAS FACTURAS DE PROVEEDORES NO RECONOCIDOS POR EL PROGRAMA EN LA CARPETA ORGANIZADA DE FACTURAS "CONTABILIZADAS"
//=============================================================================================
const CARPETA_DESCONOCIDOS = "FOLDER_ID_DE_LA_CARPETA_DE_DRIVE_CORRESPONDIENTE";

//=============================================================================================
//FUNCIÓN PARA PROCESAR CORREOS NO LEÍDOS (ESTO ES LO QUE SE EJECUTA)
//=============================================================================================
function procesarCorreosNoLeidos() {

  const threads = GmailApp.search("is:unread");

  for (const thread of threads) {

    const mensajes = thread.getMessages();

    for (const mensaje of mensajes) {

      if (!mensaje.isUnread()) {
        continue;
      }

      procesarMensaje(mensaje);

      mensaje.markRead();
    }
  }
}

//=============================================================================================
//FUNCIÓN PARA PROCESAR MENSAJES DE CORREOS NO LEÍDOS
//=============================================================================================
function procesarMensaje(mensaje) {

  let remitente = mensaje.getFrom();

  const match = remitente.match(/<(.+?)>/);

  if (match) {
    remitente = match[1].toLowerCase();
  } else {
    remitente = remitente.toLowerCase();
  }

  const empresa = INFO_EMPRESAS[remitente];

  const adjuntos = mensaje.getAttachments();

  if (adjuntos.length == 0) {
    return;
  }

  for (const archivo of adjuntos) {

    if (!esFactura(archivo)) {
      continue;
    }

    if (empresa) {
      ponerNombreSiNecesario(archivo, empresa.proveedor);
      guardarEnCarpeta(empresa.folderId, archivo);

      if(EMPRESAS_ALBARAN.includes(remitente)) {
      guardarEnCarpeta(CARPETA_PENDIENTES_ALBARAN, archivo);
      } else {
      guardarEnCarpeta(CARPETA_PENDIENTES, archivo);
      }

    } else {
      guardarEnCarpeta(CARPETA_DESCONOCIDOS, archivo);
      guardarEnCarpeta(CARPETA_PENDIENTES, archivo);
    }
  }

}

//=============================================================================================
//FUNCIÓN PARA COMPROBAR QUE ES UNA FACTURA (SEGURIDAD)
//=============================================================================================
function esFactura(archivo) {

  const nombre = archivo.getName().toLowerCase();

  const nombresNoFactura = [
    "firma",
    "signature",
    "image",
    "logo",
    "mail",
    "outlook",
    "footer",
    "banner",
    "apa" //caso específico apaspain manda su firma con nombre "apa.jpg"
  ];

  const esImagen = nombre.endsWith(".jpeg")|| nombre.endsWith(".jpg") || nombre.endsWith(".png");

  if (esImagen && nombresNoFactura.some(texto => nombre.includes(texto))) {
    return false;
  }

  return (
      nombre.endsWith(".pdf") ||
      nombre.endsWith(".xls") ||
      nombre.endsWith(".xlsx") ||
      esImagen
  );

}

//=============================================================================================
//FUNCIÓN PARA AÑADIR EL NOMBRE DE LA EMPRESA SI NO LO CONTIENE YA EN EL ARCHIVO
//=============================================================================================
function ponerNombreSiNecesario(archivo, nombreEmpr) {

  const nombreEmprMinusculas = nombreEmpr.toLowerCase();
  const nombreArchivoMinusculas = archivo.getName().toLowerCase();

  if(nombreArchivoMinusculas.includes(nombreEmprMinusculas)) {
    return;
  } else {
    const nombreAnterior = archivo.getName();
    archivo.setName( nombreEmpr.toUpperCase() + " " + nombreAnterior);
  }
}


//=============================================================================================
//FUNCIÓN PARA GUARDAR ARCHIVO EN CARPETA CORRESPONDIENTE
//=============================================================================================
function guardarEnCarpeta(folderId, archivo) {

  if (!folderId) {
    return;
  }

  const carpeta = DriveApp.getFolderById(folderId);

  carpeta.createFile(archivo);
}