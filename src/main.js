import * as creating from "./createBoard.js";
import { gameStart, gameStartComputer } from "./GameManager.js";
import { createModal, createModalBuffering, createModalWinner} from "./modal.js";

creating.createContainer();
creating.createPlayerInfo('player2','white');
creating.createObstacleInfo('player2');
creating.createBoard();
creating.createObstacleInfo('player1');
creating.createPlayerInfo('player1','black');

createModal();
createModalBuffering();
createModalWinner();
document.querySelector('.buffering').style.display="none"; //버퍼링모달창 숨김
document.querySelector('.winner').style.display="none"; //버퍼링모달창 숨김
//document.querySelector('.buffering').style.display="flex";

let btn1Elem=document.getElementById('btn1');
let btn2Elem=document.getElementById('btn2');
btn1Elem.addEventListener('click',gameStartComputer);
btn2Elem.addEventListener('click',gameStart.bind(null,'vsPlayer'));

//gameStart();