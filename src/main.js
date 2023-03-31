import * as creating from "./createBoard.js";
import { gameStart, gameStartComputer } from "./GameManager.js";
import { createModal } from "./modal.js";

creating.createContainer();
creating.createPlayerInfo('player2','white');
creating.createObstacleInfo('player2');
creating.createBoard();
creating.createObstacleInfo('player1');
creating.createPlayerInfo('player1','black');

createModal();

let btn1Elem=document.getElementById('btn1');
let btn2Elem=document.getElementById('btn2');
btn1Elem.addEventListener('click',gameStartComputer);
btn2Elem.addEventListener('click',gameStart.bind(null,'vsPlayer'));

//gameStart();