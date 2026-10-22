# Trofaxis para Android

Esta carpeta prepara una app Android con Capacitor que empaqueta la misma web de Trofaxis. La web publicada en GitHub Pages sale de `npm run build` ([build.md](build.md)); este flujo no usa ese build: copia `src/` tal cual y no cambia el proceso web. La app Android todavía no está publicada en Google Play.

## Requisitos

- Node.js 22 o posterior y npm. Capacitor 8 requiere Node 22 o posterior.
- Android Studio Otter 2025.2.1 o posterior y el Android SDK. Instala desde SDK Manager la plataforma Android API 36 para compilar y probar el proyecto actual.
- No hace falta instalar un JDK aparte: Android Studio instala el JDK compatible.
- Un teléfono Android y un cable USB para probar en equipo físico. Un emulador también sirve.

Fuentes: [requisitos oficiales de Capacitor 8](https://capacitorjs.com/docs/getting-started/environment-setup), [ejecutar una app en un dispositivo Android](https://developer.android.com/studio/run/device).

## Preparar y abrir el proyecto

Desde la carpeta del repositorio, abre PowerShell y ejecuta:

```powershell
cd android-app
npm ci
node scripts/copiar-web.mjs
npx cap sync android
npx cap open android
```

El script vuelve a copiar `index.html`, `src/`, `icons/`, `privacidad/`, el manifiesto PWA y sus archivos auxiliares. En la copia Android desactiva únicamente la carga de `pwa.js`: la app ya contiene sus archivos y no necesita registrar `sw.js`. En la web publicada, `index.html`, `pwa.js` y `sw.js` mantienen su funcionamiento habitual.

En Android Studio, espera la sincronización de Gradle, conecta el teléfono, habilita Opciones para desarrolladores y Depuración USB, acepta el aviso de confianza del teléfono y selecciónalo en la barra superior. Pulsa **Run** para instalar y abrir Trofaxis. También puedes crear un emulador desde Device Manager.

## Configurar el inicio de sesión

En Supabase, agrega esta dirección exacta en **Authentication → URL Configuration → Redirect URLs**:

```text
io.github.trofaxis.app://login
```

No cambies `SITE_URL` para hacer esto. Supabase debe aceptar el enlace profundo antes de redirigir Google o el enlace de acceso por correo. Si el enlace por correo vuelve al sitio web en vez de abrir Trofaxis, revisa la plantilla de correo: cuando se usa `redirectTo`, Supabase indica que puede ser necesario construir el enlace con `{{ .RedirectTo }}` en vez de `{{ .SiteURL }}`. No se cambió la configuración de Supabase en esta fase.

Al volver del navegador del sistema, Capacitor entrega `appUrlOpen`; Trofaxis también revisa `getLaunchUrl()` para los retornos que abren la app desde cero. Los tokens se leen con el mismo lector que procesa el retorno web. Los plugins `App` y `Browser` solo se registran cuando Capacitor identifica la plataforma nativa. La versión web continúa regresando a `location.origin + location.pathname`.

Fuentes: [redirect URLs y esquemas móviles de Supabase](https://supabase.com/docs/guides/auth/redirect-urls), [deep links de Capacitor 8](https://capacitorjs.com/docs/guides/deep-links), [API App](https://capacitorjs.com/docs/apis/app), [API Browser](https://capacitorjs.com/docs/apis/browser).

## Borrar cuenta desde Android

El WebView de esta configuración tiene el origen `https://localhost`. La función `borrar-cuenta` permite ese origen para CORS; los cambios están en el repositorio, pero la función no se desplegó. Después de integrar este cambio, vuelve a desplegar la función desde tu proyecto Supabase:

```powershell
supabase functions deploy borrar-cuenta
```

Ejecuta el comando desde la carpeta del proyecto Supabase ya vinculada al proyecto correcto. [Guía oficial para desplegar Edge Functions](https://supabase.com/docs/guides/functions/deploy). No hacen falta secretos nuevos ni cambios de base de datos para esta configuración. La función sigue leyendo sus secretos desde las variables de entorno de Supabase.

## Datos guardados en el dispositivo

El almacenamiento local de la app Android vive dentro del WebView de `https://localhost`, separado del almacenamiento que el navegador usa para `https://trofaxis.github.io`. Por eso una finca guardada únicamente en el navegador no aparece automáticamente en Android. Para llevarla a la app, exporta e importa el respaldo o inicia sesión y usa la finca que ya está guardada en la nube.

## Pasos pendientes para Google Play

1. Crear la cuenta de desarrollador Play Console y completar la verificación de identidad. La tarifa oficial consultada es de **US$25, una sola vez**; los medios de pago dependen del país. Las cuentas personales nuevas pueden tener requisitos de pruebas y verificación del dispositivo: revisa lo que Play Console aplique a tu cuenta al enviar.
2. Crear la app con el identificador `io.github.trofaxis.app` y confirmar el nombre público **Trofaxis**.
3. Generar el **Android App Bundle** de publicación en Android Studio. Configurar Play App Signing y conservar el archivo de carga y sus contraseñas fuera del repositorio. No subas llaves ni paquetes `.aab` al GitHub.
4. Completar la ficha: descripción, capturas reales de la app, clasificación de contenido y datos de contacto.
5. Publicar el enlace de privacidad [https://trofaxis.github.io/privacidad/](https://trofaxis.github.io/privacidad/) en Play Console. En la ficha de Seguridad de los datos, declarar de forma coherente el login, la finca en la nube, los casos compartidos y los proveedores que usa Trofaxis. Contestar también las preguntas de eliminación de cuenta y conservar el acceso dentro de la app y la página pública para solicitar el borrado.
6. Revisar en Play Console los requisitos vigentes de API, pruebas, clasificación y ficha justo antes del envío. Son requisitos que pueden cambiar; el proyecto actual usa target API 36, que coincide con Capacitor 8.5.3.

Fuentes oficiales consultadas el 21 de octubre de 2026: [registro y tarifa de Play Console](https://support.google.com/googleplay/android-developer/answer/6112435), [requisito de API objetivo](https://developer.android.com/google/play/requirements/target-sdk), [firmar y proteger la clave de carga](https://developer.android.com/studio/publish/app-signing), [Seguridad de los datos y privacidad](https://support.google.com/googleplay/android-developer/answer/10144311), [eliminación de cuentas](https://support.google.com/googleplay/android-developer/answer/13327111).

## Alcance de esta fase

Esta fase deja el proyecto preparado para abrirlo, sincronizarlo, ejecutarlo en un dispositivo y continuar la configuración de Play. No se compiló un APK en el entorno de trabajo porque aquí no están instalados Android Studio, Android SDK ni Java; tampoco se ejecutó ni desplegó nada en producción.
