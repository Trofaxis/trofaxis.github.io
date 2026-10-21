# Microsoft Store con PWABuilder

Trofaxis seguirá publicada como aplicación web en GitHub Pages. Para Microsoft Store, PWABuilder empaqueta esa PWA para Windows; no se modifica el motor ni se crea un proceso de publicación distinto para la web.

## Pasos que haces tú

1. **Crea tu cuenta de desarrollador en Partner Center.** Empieza en [storedeveloper.microsoft.com](https://storedeveloper.microsoft.com/) y completa la verificación y el perfil. Microsoft ofrece cuentas Individual y Company: elige Individual si publicarás a tu nombre y Company si publicarás mediante una entidad legal. Microsoft indica que una cuenta Individual no se puede convertir después en Company. La documentación consultada dice que el flujo nuevo no cobra registro; vuelve a confirmar el costo que te muestra la pantalla al registrarte, porque el flujo puede cambiar. [Guía oficial de cuentas](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account)

2. **Reserva el nombre «Trofaxis».** En el panel, abre **Apps and games**, elige **New product > MSIX or PWA app**, escribe `Trofaxis`, revisa la disponibilidad y selecciona **Reserve product name**. Microsoft indica que la reserva dura tres meses si aún no envías el producto; por eso conviene empezar el envío antes de que venza. [Publicar una PWA en Microsoft Store](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store) · [Reservar el nombre](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/reserve-your-apps-name)

3. **Copia la identidad del paquete.** Dentro del producto, abre **Product management > Product Identity** y copia exactamente:
   - Package ID
   - Publisher ID
   - Publisher display name

   Guarda esos valores fuera del repositorio, por ejemplo en un gestor privado. No los agregues a GitHub. [Dónde encontrar esos datos](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store#copy-your-publisher-information-from-microsoft-partner-center)

4. **Genera el paquete en PWABuilder.** Abre [pwabuilder.com](https://www.pwabuilder.com/), introduce `https://trofaxis.github.io/` y selecciona **Start**. Revisa el informe de la PWA y resuelve cualquier acción que afecte el empaquetado. Después elige **Package For Stores > Windows > Generate Package**, pega el Package ID, Publisher ID y Publisher display name, y descarga el paquete. Microsoft documenta que PWABuilder entrega un ZIP con un `.msixbundle` y un `.classic.appxbundle`. Guarda el ZIP y esos paquetes en una carpeta privada fuera del repositorio; no los subas a GitHub. Genera el paquete después de dejar listo el manifiesto: Microsoft indica que un cambio posterior al manifiesto requiere generar y enviar un paquete nuevo. [Pasos oficiales de empaquetado](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store#package-your-pwa-for-the-store)

5. **Completa el envío en Partner Center.** Abre el producto reservado y selecciona **Start your submission**. Llena las secciones solicitadas, incluyendo disponibilidad y categoría; en **Packages**, carga los dos paquetes generados por PWABuilder (`.msixbundle` y `.classic.appxbundle`). [Crear un envío MSIX](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/create-app-submission)

6. **Prepara la ficha de la tienda.** Para el idioma español, revisa el nombre Trofaxis y escribe una descripción clara de lo que hace: revisar el riesgo ambiental de una finca y ayudar a organizar acciones. Sube capturas reales de la app, con la finca demostrativa y sin datos de usuarios. La [captura ancha](capturas/tienda-trofaxis-ancho.png) incluida aquí mide 1440 × 960 px; supera el mínimo documentado para escritorio de 1366 × 768 px. La [captura angosta](capturas/tienda-trofaxis-angosto.png) es para el manifiesto PWA; no la uses como captura de escritorio. Microsoft pide al menos una captura por familia de dispositivos que declares compatible y recomienda varias para mostrar la app. [Requisitos de capturas](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/screenshots-and-images)

7. **Completa privacidad y soporte.** Como Trofaxis permite iniciar sesión y enviar datos a sus servicios, introduce la política pública: `https://trofaxis.github.io/privacidad/`. Microsoft pide la política cuando la app accede, recopila o transmite información personal. Para soporte, escribe `support.trofaxis@gmail.com`. [Privacidad y soporte](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/support-info) · [Políticas de Microsoft Store](https://learn.microsoft.com/en-us/windows/apps/publish/store-policies)

8. **Responde la clasificación por edad.** Contesta con precisión el cuestionario de IARC que aparece en Partner Center según el contenido y las funciones reales de Trofaxis; no selecciones una edad por suposición. Microsoft usa las respuestas para asignar la clasificación correspondiente. [Clasificación por edad](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/age-ratings)

9. **Revisa y envía a certificación.** Antes de pulsar **Submit for certification**, comprueba la descripción, capturas, privacidad, correo de soporte, mercado, paquetes y clasificación. Partner Center valida el envío y señala los campos que falten.

## Qué queda por verificar al momento de enviar

- El costo actual que muestra el flujo de alta de Partner Center y cualquier cargo de servicios opcionales. La guía oficial consultada indica que el flujo nuevo no tiene cuota de registro; confirma que ese sea el flujo que te ofrece Microsoft al iniciar.
- Cualquier requisito adicional de identidad, impuestos, dirección, mercado o certificación que Partner Center solicite para tu tipo de cuenta y país.
- Que los nombres de botones y formatos ofrecidos por PWABuilder y Partner Center sigan coincidiendo con estos pasos. Si el paquete o la pantalla difieren, considera ese requisito **por verificar al momento de enviar** y sigue la ayuda oficial que aparezca en Partner Center.
- Que la reserva de nombre y el envío continúen dentro del plazo que muestre Partner Center. La documentación actual indica tres meses para una reserva sin envío.

## Referencias oficiales consultadas

- [Publicar una PWA en Microsoft Store con PWABuilder](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store)
- [Crear una cuenta de desarrollador en Partner Center](https://learn.microsoft.com/en-us/windows/apps/publish/partner-center/open-a-developer-account)
- [Crear un envío de una app MSIX](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/create-app-submission)
- [Capturas e imágenes para la ficha](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/screenshots-and-images)
- [Política de privacidad y soporte](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/support-info)
- [Clasificaciones de edad](https://learn.microsoft.com/en-us/windows/apps/publish/publish-your-app/msix/age-ratings)
- [Políticas de Microsoft Store](https://learn.microsoft.com/en-us/windows/apps/publish/store-policies)
