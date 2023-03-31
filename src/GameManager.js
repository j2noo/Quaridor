import {Player} from "./Player.js";
import {Board, positionObstacleOnBoard, positionObstacleCenter} from "./Board.js";
import {Computer} from "./Computer.js";
//import wait from "waait"; //비동기 지연 라이브러리


export let board = new Board();
export let player1 = new Player("player1", "black",8,4);
export let player2 = new Player("player2", "white",0,4);
export let computer = new Computer("player2", "white",0,4);

const OBS_COLOR = '#c9a85c';
let _nowTurn = null;
let _nextTurn = null;

let dropObstacleInfo= { //드래그 중인 장애물 정보
  row : null, //문자열주의
  col : null,
  dir : null,
  adj : [], //장애물이 같이 놓이는 칸의 id정보
  imgId : null,
  possibleInfo : null,
  coloringBoard(color) {
    document.getElementById('o'+this.row+this.col).style.backgroundColor=color; //색 설정
    document.getElementById(this.adj[0]).style.backgroundColor=color; //색 설정
    document.getElementById(this.adj[1]).style.backgroundColor=color; //색 설정
  },
}
let dragPlayerInfo= { //드래그 중인 플레이어 정보
  before : {
    row : null,
    col : null,
  },
  after : {
    row : null,
    col : null,
  },
  imgId : null,
  possiblePlayerBoard : [],
  coloringEnterBoard(color) {
    document.getElementById('p'+this.after.row+this.after.col).style.backgroundColor=color; //색 설정
  },
  coloringPossibleBoard(color) {
    for(let pos of this.possiblePlayerBoard)
    document.getElementById('p'+pos.row+pos.col).style.backgroundColor=color; //색 설정
  },
}


function setNowTurn(player){ _nowTurn=player;}
function getNowTurn(){ return _nowTurn;}

function setNextTurn(player) { _nextTurn=player;}
function getNextTurn() { return _nextTurn;}

export function gameStart(gameMode){ //2인용
  console.log(gameMode);

  document.querySelector('.modal').classList.add('hidden'); //모달창 종료
  board.setPlayerBoardArr(player1.getPos(),player1.getPos(),player1); //playerBoard에 올려줌
  board.setPlayerBoardArr(player2.getPos(),player2.getPos(),player2); //playerBoard에 올려줌
  player1.initElem('black'); //elem을 토큰이미지요소로
  player2.initElem('white');

  document.querySelector(player1.getTableId()).append(player1.getElem());
  document.querySelector(player2.getTableId()).append(player2.getElem());
  
  initPlayerEvents(gameMode);
  initObstacleEvents();

  setNowTurn(player2);
  setNextTurn(player1);

  changeTurn(getNowTurn(),getNextTurn());
  //changeTurn(player2,player1);
}
export function gameStartComputer(){ //1인용플레이
  player2=computer; //플레이어2 컴퓨터로 설정
  document.querySelector('#player2info').innerHTML='<img src=./images/white.png alt="white"></img>Computer'; //위에 문구 바꿈

  document.querySelector('.modal').classList.add('hidden'); //모달창 종료
  board.setPlayerBoardArr(player1.getPos(),player1.getPos(),player1); //playerBoard에 올려줌
  board.setPlayerBoardArr(player2.getPos(),player2.getPos(),player2); //playerBoard에 올려줌
  player1.initElem('black'); //elem을 토큰이미지요소로
  player2.initElem('white');

  document.querySelector(player1.getTableId()).append(player1.getElem()); //(8,4)에 이미지 추가
  document.querySelector(player2.getTableId()).append(player2.getElem()); //(0,4)에 이미지 추가

  initPlayerEvents('vsComputer');
  initObstacleEvents('vsComputer');

  setNowTurn(player2);
  setNextTurn(player1);

  changeTurn(getNowTurn(),getNextTurn());
  //changeTurn(player2,player1);
}

export function changeTurn(before,after){
  console.log('└----------'+getNowTurn().getId()+' 턴 종료----------┘');
  setNowTurn(after);
  setNextTurn(before);

  document.getElementById(before.getName()+'info').style.backgroundColor='';
  document.getElementById(after.getName()+'info').style.backgroundColor='red'; //현재턴표시
  console.log('┌----------'+getNowTurn().getId()+' 턴 시작----------┐');

  let beforeObstacles=document.querySelectorAll('.'+before.getName()+'Obstacle');
  setDisabled(before.getElem());  //이전 플레이어의 토큰 이미지 이벤트 비활성화
  for(let elem of beforeObstacles){
    setDisabled(elem); //이전플레이어 장애물 이벤트 비활성화
  }
  let afterObstacles=document.querySelectorAll('.'+after.getName()+'Obstacle');
  for(let elem of afterObstacles){
    //if(elem.dataset.isPositioned=='true') { continue; } // 이미 놓인 장애물은 건들지마
    setAbled(elem); //현재 플레이어 장애물 활성화
  }
  setAbled(after.getElem());      //현재 플레이어의 토큰 이미지 이벤트 비활성화

  
  const funcComputerLogicDelay = async (time) => {
    await sleep(time); //time ms 후 실행
    console.log('Do something...')
    let computerChoice = player2.getComputerChoice(board,player1,player2);
    if(computerChoice.select == 'move'){ //움직임 존재
      moveTo(getNowTurn().getPos(), computerChoice, getNowTurn()); 
    }
    else if(computerChoice.select == 'obs') { //장애물 설치
      console.log('장애물설치');
      document.querySelector('.player2Obstacle').remove(); //앞에서 하나 지움
      setObstacleTo(computerChoice);
    }
    changeTurn(getNowTurn(),getNextTurn()); //재귀스택?
    return;
    function sleep(t){
      return new Promise(resolve=>setTimeout(resolve,t));
    }
  }
  
  if(getNowTurn().getId()=='computer'){ //컴퓨터 차례
    funcComputerLogicDelay(500);
  }
}
function moveTo(before, after, who){
  console.log(who.getColor()+' move '+before.row+before.col+' to ' + after.row+after.col);
  board.setPlayerBoardArr(before,after,who);
  who.setPos(after.row,after.col); //순서?
  let imgElem=document.getElementById('img'+who.getColor());  //옮길 이미지 요소

  let playerBoardId='p'+after.row+after.col;
  document.getElementById(playerBoardId).append(imgElem);
}
function setObstacleTo(pos){ //장애물을 옮기는 함수
  
  let obstacleBoardId='o'+pos.row+pos.col;
  let boardElem = document.getElementById(obstacleBoardId);

  if(pos.dir=='vertical'){
    dropObstacleInfo.adj[0] = 'e'+(+pos.row*2) +'e' + (+pos.col*2+1);
    dropObstacleInfo.adj[1] = 'e'+(+pos.row*2+2) +'e' + (+pos.col*2+1);
    boardElem.style.borderTopColor=OBS_COLOR;
    boardElem.style.borderBottomColor=OBS_COLOR;
  }
  else {
    dropObstacleInfo.adj[0] = 'e'+(+pos.row*2+1) +'e' + (+pos.col*2);
    dropObstacleInfo.adj[1] = 'e'+(+pos.row*2+1) +'e' + (+pos.col*2+2);
    boardElem.style.borderLeftColor=OBS_COLOR;
    boardElem.style.borderRightColor=OBS_COLOR;
  }

  boardElem.style.backgroundColor=OBS_COLOR; //색 설정
  document.getElementById(dropObstacleInfo.adj[0]).style.backgroundColor=OBS_COLOR; //색 설정
  document.getElementById(dropObstacleInfo.adj[1]).style.backgroundColor=OBS_COLOR; //색 설정
  
  boardElem.dataset.dir=pos.dir;
  
  board.setObstacleBoardArr(pos.row,pos.col,pos.dir); //obstacle

  
}

function setDisabled(elem){
  elem.style.pointerEvents = 'none';
}
function setAbled(elem){
  elem.style.cursor ='pointer';
  elem.style.pointerEvents = 'auto';
}



function initPlayerEvents(gameMode){
  // let a = { k : document.getElementById('p74'),};
  // console.log(a);
  player1.getElem().addEventListener('dragstart',dragstartPlayer); //분리?
  player1.getElem().addEventListener('dragend',dragendPlayer); //분리?
  let playerBoardUnits = document.querySelectorAll('.playerBoardUnit');
  for(let elem of playerBoardUnits){
    elem.addEventListener('dragenter',dragenterPlayer);
    elem.addEventListener('dragleave',dragleavePlayer);
    elem.addEventListener('dragover',dragoverPlayer);
    elem.addEventListener('drop',dropPlayer);
  }
  if(gameMode=='vsPlayer'){
    //console.log('이벤트리스너들어가');
    player2.getElem().addEventListener('dragstart',dragstartPlayer); //분리?
    player2.getElem().addEventListener('dragend',dragendPlayer); //분리?
  }
  
}
function initObstacleEvents(gameMode){
  let obstacleUnits = document.querySelectorAll('.obstacleUnit'); //컴푸터일때 선택못하게 하던지, 아니면 커서 막든지
  let obstacleBoardUnits = document.querySelectorAll('.obstacleBoardUnit'); //장애물 보드 유닛

  for(let elem of obstacleUnits){
    elem.addEventListener('dragstart',dragstartObstacle); //분리?
    elem.addEventListener('dragend',dragendObstacle); //분리?
    elem.addEventListener('click',clickObstacle); //분리?
  }
  for(let elem of obstacleBoardUnits){
    if(elem.dataset.dir!='none'){ //장애물이 존재하는 셀에는 이벤트추가안함.//구현하자
      continue;
    }
    elem.addEventListener('dragenter',dragenterObstacle);
    elem.addEventListener('dragleave',dragleaveObstacle);
    elem.addEventListener('dragover',dragoverObstacle);
    elem.addEventListener('drop',dropObstacle); //함수하나에다넣어?
  }
}
export function dragenterPlayer(event){
  dragPlayerInfo.after.row = +this.dataset.row;
  dragPlayerInfo.after.col = +this.dataset.col;
  dragPlayerInfo.coloringEnterBoard('red');
}
export function dragleavePlayer(event){
  dragPlayerInfo.coloringEnterBoard('');
  dragPlayerInfo.coloringPossibleBoard("yellow"); //가능한 위치 표시
}
export function dragstartPlayer(event){  //플레이어를 드래그 시작하면, 플레이어 칸에 이벤트 추가
  dragPlayerInfo.before.row = getNowTurn().getPos().row;
  dragPlayerInfo.before.col = getNowTurn().getPos().col;
  
  let obstacleBoardUnits = document.querySelectorAll('.obstacleBoardUnit'); //장애물 보드 유닛
  for(let elem of obstacleBoardUnits){ //플레이어이동중에는 장애물유닛 이벤트 막음
    setDisabled(elem);
  }
  let playerBoardUnits = document.querySelectorAll('.playerBoardUnit'); //플레이어 보드 유닛
  for(let elem of playerBoardUnits){ // 플레이어보드 이벤트 열기
    setAbled(elem);
  }

  showPossiblePlayerPos(); //플레이어가 이동할 수 있는 위치를 알려줌

  function showPossiblePlayerPos() {
    const dy=[-1,-1,-1,0,1,1,1,0,-2,0,2,0]; //대각선1칸 + 상하좌우2칸씩
    const dx=[-1,0,1,1,1,0,-1,-1,0,2,0,-2]; //대각선1칸 + 상하좌우2칸씩
    dragPlayerInfo.possiblePlayerBoard=[];

    for(let i=0; i<12;i++){
      const newPos = {
        row : dragPlayerInfo.before.row+dy[i],
        col : dragPlayerInfo.before.col+dx[i],
      }
      if(board.isPossibleMove(dragPlayerInfo.before,newPos,0)){ //가능한 움직임 확인, 출력없이
        dragPlayerInfo.possiblePlayerBoard.push(newPos);
      }
    }
    
    dragPlayerInfo.coloringPossibleBoard("yellow");
  }
}
export function dragendPlayer(event){
  let playerBoardUnits = document.querySelectorAll('.playerBoardUnit'); //플레이어 보드 유닛
  for(let elem of playerBoardUnits){ // 플레이어보드 이벤트 열기
    setDisabled(elem);
  }
  dragPlayerInfo.coloringPossibleBoard(""); //가능한 위치 표시 원복

}
export function dragoverPlayer(event){
  event.preventDefault(); //없으면 드롭안됨
}
export function dropPlayer(event){
  event.preventDefault();

  dragPlayerInfo.coloringEnterBoard('');
  if(!board.isPossibleMove(dragPlayerInfo.before,dragPlayerInfo.after,0)){ //불가능한 움직임
    return;
  }
  
  moveTo(dragPlayerInfo.before,dragPlayerInfo.after, getNowTurn());


  let leftDest1 = board.isPlayerReachableBFS(player1,board.getObstacleBoardArr(),0);
  let leftDest2 = board.isPlayerReachableBFS(player2,board.getObstacleBoardArr(),8);
  console.log(`player1은 ${leftDest1}번 만에 도착 가능합니다`);
  console.log(`player2은 ${leftDest2}번 만에 도착 가능합니다`);
  
  board.checkWin(getNowTurn());
  //console.log('---------'+getNowTurn().getName()+' 턴 종료---------');
  changeTurn(getNowTurn(),getNextTurn());
 
}
export function dragstartObstacle(event){ //obstacle unit에 부여
  dropObstacleInfo.imgId=event.target.id;//드래그중인 요소의 id
  dropObstacleInfo.dir=event.target.dataset.dir; //현재 드래그객체 방향

  let playerBoardUnits = document.querySelectorAll('.playerBoardUnit'); //플레이어 보드 유닛
  for(let elem of playerBoardUnits){ //장애물 이동중에는 플레이어보드 이벤트 막음
    setDisabled(elem);
  }
  setDisabled(getNowTurn().getElem()); //img요소의 pointer-events도 막지 않으면 자식요소(boardUnit)으로 버블링발생
  
  let obstacleBoardUnits = document.querySelectorAll('.obstacleBoardUnit'); //장애물 보드 유닛
  for(let elem of obstacleBoardUnits){ //장애물 이동중에는 장애물 보드 유닛 이벤트 열기
    if(elem.dataset.dir=='none') //장애물이 설치된 보드는 이벤트 열면 안됨
      setAbled(elem);
  }
}
export function dragenterObstacle(event){ //obstacle board unit에 부여
  event.preventDefault();
  dropObstacleInfo.row = +this.dataset.row;
  dropObstacleInfo.col = +this.dataset.col;

  if(dropObstacleInfo.dir=='vertical'){ //장애물 방향에 맞게 인접한 boardUnit의 아이디 설정
    dropObstacleInfo.adj[0] = 'e'+(+dropObstacleInfo.row*2) +'e' + (+dropObstacleInfo.col*2+1);
    dropObstacleInfo.adj[1] = 'e'+(+dropObstacleInfo.row*2+2) +'e' + (+dropObstacleInfo.col*2+1);
  }
  else {
    dropObstacleInfo.adj[0] = 'e'+(+dropObstacleInfo.row*2+1) +'e' + (+dropObstacleInfo.col*2);
    dropObstacleInfo.adj[1] = 'e'+(+dropObstacleInfo.row*2+1) +'e' + (+dropObstacleInfo.col*2+2);
  }

  dropObstacleInfo.possibleInfo = board.isPossibleObstacle(dropObstacleInfo,player1,player2,0);
  if(dropObstacleInfo.possibleInfo.isPossible==false){ //장애물을 못놓는 경우
    return;
  }
  dropObstacleInfo.coloringBoard('red'); //보드 칠해줌
  
}
export function dragleaveObstacle(event){ //obstacle board unit에 부여
  if(dropObstacleInfo.possibleInfo.isPossible==false){ //장애물을 못놓는 경우
    return;
  }
  dropObstacleInfo.coloringBoard(''); //보드 칠해줌
}
export function dragendObstacle(event){ //obstacle unit에 부여 //미사용?
  let obstacleBoardUnits = document.querySelectorAll('.obstacleBoardUnit'); //장애물 보드 유닛
  for(let elem of obstacleBoardUnits){ //장애물 이동이 끝나면 장애물유닛 이벤트 닫음
      setDisabled(elem);
  }
  setAbled(getNowTurn().getElem()); //img요소의 pointer-events도 막지 않으면 자식요소(boardUnit)으로 버블링발생. 다시 열어줌
}
export function dragoverObstacle(event){ //obstacle board unit에 부여
  event.preventDefault(); 
}
export function dropObstacle(event){ //obstacle board unit에 부여
  event.preventDefault();
  //console.log(dropObstacleInfo.possibleInfo); //보고 지우자
  dropObstacleInfo.possibleInfo = board.isPossibleObstacle(dropObstacleInfo,player1,player2,1);
  if(dropObstacleInfo.possibleInfo.isPossible==false){ //장애물을 못놓는 경우
    return;
  }
  document.getElementById(dropObstacleInfo.imgId).remove(); //drop한 이미지 요소 제거
  
  setObstacleTo(dropObstacleInfo);
  
  //console.log('---------'+getNowTurn().getName()+' 턴 종료---------');
  changeTurn(getNowTurn(),getNextTurn());
}
export function clickObstacle(event){ //obstacle unit에 부여
 
  if(event.target.dataset.dir=='vertical'){
    event.target.src="./images/obstacleHorizontal.png";
    event.target.dataset.dir='horizontal';
  }
  else {
    event.target.src="./images/obstacleVertical.png";
    event.target.dataset.dir='vertical';
  }

}
