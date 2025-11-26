# Pfinal
Descripción del Juego

El juego es una versión del clásico Snake que se ejecuta en un lienzo (<canvas>) con una cuadrícula de 20x20. Está ambientado en un diseño de colores oscuros con toques neón. La aplicación requiere que los usuarios se registren e inicien sesión para poder acceder al juego y guardar sus puntajes.

Mecánica Principal

Movimiento y Crecimiento: La serpiente se mueve continuamente a una velocidad constante (definida por GAME_SPEED = 100 milisegundos).
Comida y Puntuación: El objetivo es que la serpiente coma la comida (un círculo rojo). Cada vez que come, la serpiente se alarga un segmento y se añaden 10 puntos al marcador.
Fin del Juego: La partida termina en dos situaciones de colisión:Choque contra los límites del tablero (colisión de pared).Choque contra su propio cuerpo (autocolisión).
Historial: Al finalizar la partida, la puntuación obtenida se guarda automáticamente en el historial local del navegador, junto con el nombre del usuario logueado y la fecha/hora. Se mantienen solo las últimas 10 puntuaciones.

Cómo Jugar

El juego tiene una fase de autenticación y una fase de juego interactivo:
1. Autenticación (Página principal: index.html) con Inicio de Sesión: El jugador debe ingresar un nombre de usuario y contraseña para acceder. Si el inicio de sesión es exitoso, se guarda el usuario en localStorage y se redirige a la página del juego.
2. Registro: Si no tiene cuenta, puede registrar un nuevo usuario con nombre, correo electrónico y contraseña.
3. Verificación de Sesión: El juego verifica que exista una sesión activa; de lo contrario, alerta y redirige al usuario a la página de inicio de sesión.

Controles del Juego
(Página de Juego: paginas/iniciosesion.html)El juego espera la interacción del usuario para comenzar y para controlar la dirección de la serpiente.

Acción,Control
Mover Arriba,Flecha Arriba o W
Mover Abajo,Flecha Abajo o S
Mover Izquierda,Flecha Izquierda o A
Mover Derecha,Flecha Derecha o D
Iniciar/Reiniciar,"ESPACIO o el botón ""Reiniciar Juego"""

4. Funciones de Usuario
Perfil: El botón de perfil abre un modal que muestra el nombre de usuario y el correo electrónico del jugador activo. Incluye un botón para Cerrar Sesión, que borra el usuario activo y redirige al inicio de sesión.
Historial: El botón de historial abre un modal que muestra las últimas 10 puntuaciones guardadas, incluyendo el puntaje, el nombre de usuario y la fecha/hora de la partida.

Tecnologías Usadas

El proyecto está desarrollado completamente utilizando tecnologías web del lado del cliente:

HTML5,"Proporciona la estructura del juego, los formularios de autenticación y el lienzo de juego (<canvas>)."

CSS3,"Aplica los estilos y el diseño, incluyendo la temática oscura y los estilos de los modales (perfil e historial)."

JavaScript (JS),"Contiene toda la lógica del juego (game.js) y el control de la interfaz, el manejo de eventos del teclado y los botones."

HTML5 Canvas API,"Se usa dentro de game.js para dibujar dinámicamente la serpiente, la comida y el fondo del tablero."

localStorage,"Se emplea para la persistencia de datos, almacenando la lista de usuarios, la sesión actual y el historial de puntuaciones del juego."
