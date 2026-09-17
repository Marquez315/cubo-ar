# Cubo AR Educativo — versión ampliada

> Creado por [@codeclubnanduti](https://www.instagram.com/codeclubnanduti/) ·
> [@didactica_aumentada3.0](https://www.instagram.com/didactica_aumentada3.0/) — **para la educación**

Misma idea que el prototipo original (un cubo físico con un marcador por cara que dispara
contenido 3D en AR), pero ampliado para usarse en varias materias de primaria y secundaria.

## Qué es nuevo respecto a la versión anterior

1. **25 escenas educativas** organizadas por nivel y materia en un menú desplegable:
   - Primaria: Matemática, Ciencias Naturales, Arte, Lengua, Educación Vial.
   - Secundaria: Astronomía, Biología, Química, Física, Matemática, Geografía, Historia,
     Informática, Tecnología.
2. **Cargar tu propia foto o modelo 3D** con el botón "📎 Cargar foto / objeto 3D":
   - Imágenes: `.jpg`, `.png`, `.webp`, `.gif`.
   - Modelos 3D: `.glb` / `.gltf` (recomendado) y `.stl` (típico de impresión 3D).
   - El tamaño se ajusta automáticamente para que el objeto entre en el cubo.
3. **Botón "📸 Compartir"**: toma una foto de lo que se está viendo (cámara + objeto 3D) y
   abre el selector nativo del celular para compartir a Instagram, Facebook, WhatsApp, etc.
   En una computadora sin ese selector, la imagen se descarga para subirla a mano.
4. **Botón "❓ Guía"**: abre una guía paso a paso dentro de la misma app (armado del cubo,
   publicación, uso en clase, carga de archivos y cómo compartir).

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa (A-Frame 1.6 + AR.js 3.4.8). Un solo archivo, sin build. |
| `plantilla-cubo.pdf` | Plantilla imprimible del cubo, 5 cm de arista. |
| `marcadores/0..5.png` | Los seis marcadores sueltos, por si armás otra plantilla. |

## Puesta en marcha (10 minutos)

1. **Imprimí `plantilla-cubo.pdf` al 100 %**, sin "ajustar a página". Verificá con una regla que la
   barra de control mida 5 cm. Papel mate; el papel brillante genera reflejos y arruina la detección.
2. Cortá, doblá por las líneas punteadas y armá el cubo con cinta.
3. **Publicá `index.html` en un servidor HTTPS.** La cámara no funciona por `file://` ni por HTTP.
   Lo más rápido y gratis: subir la carpeta a un repo de GitHub y activar GitHub Pages, o arrastrarla
   a Netlify Drop. Para probar en tu compu: `npx serve` + túnel, o `python3 -m http.server` en localhost.
4. Abrí la URL en el celular, dale permiso a la cámara y apuntá al cubo.

## Agregar tus propias escenas

Las escenas están en el objeto `ESCENAS` dentro de `index.html`, cada una devuelve HTML de
A-Frame. Para sumar una nueva:

```js
mimateria: () => `<a-sphere radius="0.3" color="tomato"></a-sphere>`
```

y agregá su `<option value="mimateria">Mi materia</option>` dentro del `<select id="escenaSelect">`,
dentro del `<optgroup>` de nivel/materia que corresponda.

Radio útil ≈ **0.6 unidades**. Más grande que eso y el modelo se sale del cubo.

## Cargar imágenes y modelos 3D desde la app (sin tocar código)

Los y las docentes no necesitan editar el archivo para mostrar contenido propio: alcanza con
tocar "📎 Cargar foto / objeto 3D" durante la clase y elegir el archivo desde el celular o la
compu. Si el modelo 3D está en otro formato (`.obj`, `.fbx`, `.blend`, etc.), conviene convertirlo
antes a `.glb` con una herramienta gratuita (por ejemplo, Blender o un conversor online) para la
mejor compatibilidad. `.stl` también funciona, pero al no traer color, se muestra con un tono
celeste por defecto.

## Compartir en redes sociales

El botón "📸 Compartir" usa la Web Share API del navegador: genera una imagen combinando la
cámara y el objeto 3D, y abre el mismo menú de "Compartir" que usa cualquier app del celular
(Instagram, Facebook, WhatsApp, Classroom, etc.). No hay integración directa con las APIs de
Instagram/Facebook porque ambas exigen credenciales de desarrollador y un backend propio; el
selector nativo del sistema operativo cumple el mismo objetivo sin necesidad de servidor.

## Si la detección falla

| Síntoma | Causa habitual |
|---|---|
| No detecta nada | Página servida por HTTP, no HTTPS. |
| Detecta a veces | Poca luz, reflejo del papel, o impresión a escala incorrecta. |
| Confunde dos caras | Los ids 0–5 son los del set estándar; si se confunden, cambiá a ids con mayor distancia de Hamming del repo `nicolocarpignoli/artoolkit-barcode-markers-collection`. |
| El modelo salta al girar | Correcciones por cara mal calculadas para tu plantilla. |
| No carga mi imagen/modelo | Formato no compatible; probá `.jpg`/`.png` para fotos o `.glb` para modelos 3D. |
| El botón Compartir no abre el menú | Pasa en algunas compus/navegadores de escritorio: la imagen se descarga sola para subirla a mano. |

## Nota legal

El patrón impreso del Merge Cube es diseño propietario de Merge Labs y está protegido. Esta
plantilla usa marcadores ARToolKit generados y de libre uso, así que es un cubo propio, no una
copia.

## Licencias de las dependencias

AR.js es MIT; artoolkit5-js es LGPLv3 con permiso adicional; A-Frame es MIT. Uso comercial
permitido, pero conservá los avisos de copyright.
