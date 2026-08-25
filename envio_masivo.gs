//Cuidado con ejecutar este script, pues manda un correo masivo cada vez que se ejecuta a toda la lista de destinatarios. 

function enviarCorreoMasivo() {
  //esta lista representa todos los correos a los que les llegará el mensaje.
  const destinatarios = [
    example1@gmail.com,
    example2@gmail.com,
    example3@gmail.com
  ];
//Esta versión del código no tiene los correos reales, pero se aprecia la estructura

  const asunto = "Actualización importante";
  
  const cuerpoTexto = "Cuerpo explicativo del texto a enviar";

for (const destinatario of destinatarios) {

  try {

    MailApp.sendEmail({
      to: destinatario,
      subject: asunto,
      body: cuerpoTexto
    });

    Logger.log("Enviado a: " + destinatario);

    Utilities.sleep(200);

  } catch (e) {

    Logger.log("Error con " + destinatario + ": " + e);

  }

}
}