# **Resumen del Juego: Variación de Cubilete (Dudo/Perudo)**

Aquí hay una descripción general de alto nivel de las reglas del juego implementadas en esta base de código, la cual es una variación de Dudo/Perudo (Liar's Dice) jugada con dados de Cubilete. Todas las reglas centrales de la jugabilidad están implementadas en el componente de la página principal page.jsx.

## **1\. Configuración del Juego y Dados**

* **Jugadores y Cantidad de Dados:** El juego se juega con un número configurable de jugadores y dados iniciales por jugador (típicamente 5 dados), inicializados a través de createGame.js.  
* **Símbolos de Cubilete:** En lugar de los dados numéricos estándar, el juego utiliza los seis símbolos clásicos del Cubilete, clasificados de menor a mayor:  
  9 \< 10 \< J (Jota) \< Q (Reina) \< K (Rey) \< A (As)

## **2\. Flujo del Turno y Lanzamiento**

* **Inicio de Ronda:** Cada ronda comienza con todos los jugadores activos lanzando sus dados. Los resultados de los lanzamientos están ocultos para los demás jugadores.  
* **Inversión de Dirección:** El jugador que inicia la ronda puede invertir la dirección del juego (sentido horario vs. antihorario) antes de enviar la primera puja de la ronda mediante la función handleDirectionChange.  
* **Acciones:** En el turno de un jugador, este debe:  
  * Hacer una puja/predicción más alta.  
  * Iniciar un desafío declarando **No creo** (Disbelieve).

## **3\. Reglas de Puja (Bidding)**

Una puja consiste en una cantidad y un símbolo (por ejemplo, Cuatro Reinas).  
Para garantizar que cada puja subsecuente sea más alta que la anterior, el juego asigna un valor numérico a la puja usando getDiceValue:  
`Valor de la Puja = valorBase + (cantidad - 1) × 6`  
Donde el valorBase del símbolo es: 9=1, 10=2, J=3, Q=4, K=5, A=6.  
Para realizar una puja válida, el nuevo valor de la puja debe ser estrictamente mayor que el valor de la puja anterior. Esto significa que un jugador puede:

* Aumentar la cantidad de cualquier símbolo.  
* Mantener la cantidad pero pujar por un símbolo de mayor rango.  
* Aumentar ambos.

## **4\. Fase de Desafío**

A diferencia del Dudo estándar donde solo intervienen el desafiante y el desafiado, esta implementación utiliza un mecanismo de votación colectiva gestionado en handleChallenge:

* Cuando un jugador dice *No creo*, la ronda se pausa.  
* Todos los jugadores activos deben votar si **Creen** o **No creen** que la cantidad total combinada del símbolo pujado entre todos los jugadores sea al menos la cantidad pujada.

## **5\. El Dado Maldito (The Devil's Dice)**

Una mecánica única implementada en devilDice:

* Si el conteo real combinado del símbolo pujado es exactamente 1 menos que la cantidad pujada (por ejemplo, la puja fue 5 Reyes y hay exactamente 4 Reyes), se activa el **Dado Maldito**.  
* El jugador que hizo la puja desafiada (el penúltimo postor) lanza un solo dado extra (el Dado Maldito).  
* Si este dado extra resulta en el símbolo pujado, el conteo aumenta en 1, "salvando" al jugador que hizo la puja.

## **6\. Resolución de la Ronda y Puntuación**

Una vez emitidos los votos y resuelto el Dado Maldito (si lo hubo), los dados reales se revelan y evalúan en endRound:

* **Los que No creyeron:**  
  * Pierden un dado si el conteo real es mayor o igual a la puja.  
  * Mantienen sus dados si el conteo real es menor que la puja.  
  * *Nota:* Si el conteo real es exactamente igual a la puja, también pierden un dado.  
* **Los que Creyeron:**  
  * Pierden un dado si el conteo real es menor que la puja.  
  * Mantienen sus dados si el conteo real es mayor o igual a la puja.

## **7\. Regla Especial de Quintilla (Five of a Kind)**

Durante el lanzamiento, si un jugador lanza sus dados y todos muestran exactamente el mismo símbolo (con al menos 5 dados), obtiene una Quintilla:

* Se le otorga un dado extra (+1 en la interfaz de usuario), aumentando su conteo de dados.  
* Este dado extra no se lanza, sino que actúa como un amortiguador (buffer). Si pierde una ronda, el estado de quintilla se elimina y el dado extra es el primero en perderse.

## **8\. Ganar el Juego**

* Cualquier jugador cuyo conteo de dados llegue a 0 queda eliminado del juego.  
* El juego continúa ronda por ronda hasta que solo quede un jugador activo con dados, quien es declarado ganador.