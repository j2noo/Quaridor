import { Player } from "./Player.js";
import { Board } from "./Board.js";
import { Computer } from "./Computer.js";

export let board = new Board();
export let player1 = new Player("player1", "black", 8, 4);
export let player2;

let _nowTurn = null;
let _nextTurn = null;

let dragObstacleInfo = {
  //드래그 중인 장애물 정보

  row: null, //문자열주의
  col: null,
  dir: null,
  imgId: null,
  adj: [], //장애물이 같이 놓이는 칸의 id정보
  isPossible: null,
};
let dragPlayerInfo = {
  //드래그 중인 플레이어 정보
  before: {
    row: null,
    col: null,
  },
  after: {
    row: null,
    col: null,
  },

  possiblePlayerBoard: [],
  possibleObstacleBoard: [],
};

function setNowTurn(player) {
  _nowTurn = player;
}
function getNowTurn() {
  return _nowTurn;
}

function setNextTurn(player) {
  _nextTurn = player;
}
function getNextTurn() {
  return _nextTurn;
}

export function gameStart(gameMode) {
  //2인용
  console.log(gameMode);
  document.querySelector(".modal").classList.add("hidden"); //모달창 종료

  if (gameMode == "vsComputer") {
    player2 = new Computer("player2", "computer", 0, 4);
    player2.initElem("computer");
    document.querySelector("#player2info>img").src = "./images/computerProfile.png";
    document.querySelector("#player2info>div").innerText = "Computer";
    //document.querySelector("#player2info>img").innerHTML = '<img src=./images/computer.png alt="computer"></img>Computer'; //위에 문구 바꿈
  } else {
    player2 = new Player("player2", "white", 0, 4);
    player2.initElem("white");
  }

  board.setPlayerBoardArr(player1.getPos(), player1.getPos(), player1); //playerBoard에 올려줌
  board.setPlayerBoardArr(player2.getPos(), player2.getPos(), player2); //playerBoard에 올려줌
  player1.initElem("black"); //elem을 토큰이미지요소로

  document.querySelector(player1.getTableId()).append(player1.getElem()); //플레이어의 이미지를 올려줌
  document.querySelector(player2.getTableId()).append(player2.getElem());

  initPlayerEvents(gameMode);
  initObstacleEvents(gameMode);

  setNowTurn(player2);
  setNextTurn(player1);

  changeTurn(getNowTurn(), getNextTurn());
  //changeTurn(player2,player1);
}
export function gameStartComputer() {
  //지우자
  //1인용플레이
  player2 = computer; //플레이어2 컴퓨터로 설정
  document.querySelector("#player2info").innerHTML = '<img src=./images/white.png alt="white"></img>Computer'; //위에 문구 바꿈

  document.querySelector(".modal").classList.add("hidden"); //모달창 종료

  board.setPlayerBoardArr(player1.getPos(), player1.getPos(), player1); //playerBoard에 올려줌
  board.setPlayerBoardArr(player2.getPos(), player2.getPos(), player2); //playerBoard에 올려줌
  player1.initElem("black"); //elem을 토큰이미지요소로
  player2.initElem("white");

  document.querySelector(player1.getTableId()).append(player1.getElem()); //(8,4)에 이미지 추가
  document.querySelector(player2.getTableId()).append(player2.getElem()); //(0,4)에 이미지 추가

  initPlayerEvents("vsComputer");
  initObstacleEvents("vsComputer");

  setNowTurn(player2);
  setNextTurn(player1);

  changeTurn(getNowTurn(), getNextTurn());
  //changeTurn(player2,player1);
}
///더럽다
export function changeTurn(before, after) {
  console.log("└----------" + getNowTurn().getId() + " 턴 종료----------┘");
  board.checkWin(getNowTurn());
  setNowTurn(after);
  setNextTurn(before);

  dragPlayerInfo.before.row = getNowTurn().getPos().row; //이거도 밖으로뺴 매번하는거 비효율
  dragPlayerInfo.before.col = getNowTurn().getPos().col;

  dragPlayerInfo.possiblePlayerBoard = board.getPossiblePlayerPos(getNowTurn().getPos()); //플레이어가 이동할 수 있는 위치를 계산
  dragPlayerInfo.possibleObstacleBoard = board.getPossibleObstaclePos(player1, player2); //플레이어가 놓을 수 있는 장애물의 위치를 계산 왜 표시안되지?

  //console.log(dragPlayerInfo.possibleObstacleBoard);

  document.getElementById(before.getName() + "info").style.backgroundColor = "";
  document.getElementById(after.getName() + "info").style.backgroundColor = "rgb(250 170 170)"; //현재턴표시
  console.log("┌----------" + getNowTurn().getId() + " 턴 시작----------┐");

  let beforeObstacles = document.querySelectorAll("." + before.getName() + "Obstacle");
  setDisabled(before.getElem()); //이전 플레이어의 토큰 이미지 이벤트 비활성화
  for (let elem of beforeObstacles) {
    setDisabled(elem); //이전플레이어 장애물 이벤트 비활성화
  }
  let afterObstacles = document.querySelectorAll("." + after.getName() + "Obstacle");
  for (let elem of afterObstacles) {
    //if(elem.dataset.isPositioned=='true') { continue; } // 이미 놓인 장애물은 건들지마
    setAbled(elem); //현재 플레이어 장애물 활성화
  }
  setAbled(after.getElem()); //현재 플레이어의 토큰 이미지 이벤트 비활성화

  const ComputerLogicDelay = async (computerChoice, time) => {
    await sleep(time); //time ms 후 실행

    document.querySelector("#player2info>img").src = "./images/computerProfile.png";
    if (computerChoice.select == "move") {
      //움직임 존재
      moveTo(getNowTurn().getPos(), computerChoice, getNowTurn());
    } else if (computerChoice.select == "obs") {
      //장애물 설치
      console.log("장애물설치");
      let obsElem = document.querySelector(".player2Obstacle");
      if (obsElem !== null) obsElem.remove();
      setObstaclePos(computerChoice);
      board.coloringAllBoard();
    }

    changeTurn(getNowTurn(), getNextTurn()); //재귀스택?
    return;
    function sleep(t) {
      return new Promise((resolve) => setTimeout(resolve, t));
    }
  };

  if (getNowTurn().getId() == "computer") {
    //컴퓨터 차례
    let computerChoice = player2.getComputerChoice(board, player1, player2);

    if (computerChoice.select == "move") {
      document.querySelector("#player2info>img").src = "./images/computerProfile2.png";
    } else {
      document.querySelector("#player2info>img").src = "./images/computerProfile3.png";
    }

    ComputerLogicDelay(computerChoice, 1000);
  }
}
function moveTo(before, after, who) {
  console.log(who.getColor() + " move " + before.row + before.col + " to " + after.row + after.col);
  board.setPlayerBoardArr(before, after, who);
  who.setPos(after.row, after.col); //순서?
  let imgElem = document.getElementById("img" + who.getColor()); //옮길 이미지 요소

  let playerBoardId = "p" + after.row + after.col;
  document.getElementById(playerBoardId).append(imgElem);
}
function setObstaclePos(pos) {
  //장애물을 옮기는 함수

  document.getElementById("o" + pos.row + pos.col).dataset.dir = pos.dir;

  board.setObstacleBoardArr(pos.row, pos.col, pos.dir); //obstacle
}

function setDisabled(elem) {
  elem.style.pointerEvents = "none";
}
function setAbled(elem) {
  elem.style.cursor = "pointer";
  elem.style.pointerEvents = "auto";
}

function initPlayerEvents(gameMode) {
  // let a = { k : document.getElementById('p74'),};
  // console.log(a);
  player1.getElem().addEventListener("dragstart", dragstartPlayer); //분리?
  player1.getElem().addEventListener("dragend", dragendPlayer); //분리?
  let playerBoardUnits = document.querySelectorAll(".playerBoardUnit");
  for (let elem of playerBoardUnits) {
    elem.addEventListener("dragenter", dragenterPlayerBoard);
    elem.addEventListener("dragleave", dragleavePlayerBoard);
    elem.addEventListener("dragover", dragoverPlayerBoard);
    elem.addEventListener("drop", dropPlayerBoard);
  }
  if (gameMode == "vsPlayer") {
    //console.log('이벤트리스너들어가');
    player2.getElem().addEventListener("dragstart", dragstartPlayer); //분리?
    player2.getElem().addEventListener("dragend", dragendPlayer); //분리?
  }
}
function initObstacleEvents(gameMode) {
  //컴퓨터장애물막자
  let obstacleUnits = document.querySelectorAll(".obstacleUnit"); //컴푸터일때 선택못하게 하던지, 아니면 커서 막든지
  let obstacleBoardUnits = document.querySelectorAll(".obstacleBoardUnit"); //장애물 보드 유닛

  for (let elem of obstacleUnits) {
    elem.addEventListener("dragstart", dragstartObstacle); //분리?
    elem.addEventListener("dragend", dragendObstacle); //분리?
    elem.addEventListener("click", clickObstacle); //분리?
  }
  for (let elem of obstacleBoardUnits) {
    if (elem.dataset.dir != "none") {
      //장애물이 존재하는 셀에는 이벤트추가안함.//구현하자
      continue;
    }
    elem.addEventListener("dragenter", dragenterObstacleBoard);
    elem.addEventListener("dragleave", dragleaveObstacleBoard);
    elem.addEventListener("dragover", dragoverObstacleBoard);
    elem.addEventListener("drop", dropObstacleBoard); //함수하나에다넣어?
  }
}
export function dragenterPlayerBoard(event) {
  dragPlayerInfo.after.row = +this.dataset.row;
  dragPlayerInfo.after.col = +this.dataset.col;
  board.coloringOneBoard("p", dragPlayerInfo.after, "red");
}
export function dragleavePlayerBoard(event) {
  board.coloringOneBoard("p", dragPlayerInfo.after, "");
  dragPlayerInfo.possiblePlayerBoard.forEach((pos) => {
    board.coloringOneBoard("p", pos, "rgb(213 252 252)");
  });
}
export function dragstartPlayer(event) {
  let obstacleBoardUnits = document.querySelectorAll(".obstacleBoardUnit"); //장애물 보드 유닛
  //플레이어 이동중에는 장애물유닛 이벤트 막음
  for (let elem of obstacleBoardUnits) {
    setDisabled(elem);
  }

  let playerBoardUnits = document.querySelectorAll(".playerBoardUnit"); //플레이어 보드 유닛
  // 플레이어보드 이벤트 열기
  for (let elem of playerBoardUnits) {
    setAbled(elem);
  }
  dragPlayerInfo.possiblePlayerBoard.forEach((pos) => {
    board.coloringOneBoard("p", pos, "rgb(213 252 252)");
  });
}
export function dragendPlayer(event) {
  let playerBoardUnits = document.querySelectorAll(".playerBoardUnit"); //플레이어 보드 유닛
  for (let elem of playerBoardUnits) {
    setDisabled(elem); // 플레이어보드 이벤트 닫기
  }
  board.coloringAllBoard();
}
export function dragoverPlayerBoard(event) {
  event.preventDefault(); //없으면 드롭안됨
}
export function dropPlayerBoard(event) {
  event.preventDefault();

  let isExistPos = false;
  dragPlayerInfo.possiblePlayerBoard.forEach((pos) => {
    if (pos.row == dragPlayerInfo.after.row && pos.col == dragPlayerInfo.after.col) isExistPos = true;
  });
  //불가능한 움직임이면 return
  if (isExistPos == false) return;

  moveTo(dragPlayerInfo.before, dragPlayerInfo.after, getNowTurn());

  let leftDest1 = board.isPlayerReachableBFS(player1, board.getObstacleBoardArr(), 0);
  let leftDest2 = board.isPlayerReachableBFS(player2, board.getObstacleBoardArr(), 8);
  console.log(`player1은 ${leftDest1}번 만에 도착 가능합니다`);
  console.log(`${getNextTurn().getColor()}은 ${leftDest2}번 만에 도착 가능합니다`);

  changeTurn(getNowTurn(), getNextTurn());
}
export function dragstartObstacle(event) {
  dragObstacleInfo.dir = event.target.dataset.dir; //현재 드래그객체 방향
  dragObstacleInfo.imgId = event.target.id;

  let playerBoardUnits = document.querySelectorAll(".playerBoardUnit"); //플레이어 보드 유닛
  //장애물 이동중에는 플레이어보드 이벤트 막음
  for (let elem of playerBoardUnits) {
    setDisabled(elem);
  }
  setDisabled(getNowTurn().getElem()); //img요소의 pointer-events도 막지 않으면 자식요소(boardUnit)으로 버블링발생

  let obstacleBoardUnits = document.querySelectorAll(".obstacleBoardUnit"); //장애물 보드 유닛
  //장애물 이동중에는 장애물 보드 유닛 이벤트 열기
  for (let elem of obstacleBoardUnits) {
    //장애물이 설치된 보드는 이벤트 열면 안됨
    if (elem.dataset.dir == "none") setAbled(elem);
  }
}
export function dragenterObstacleBoard(event) {
  //obstacle board unit에 부여
  event.preventDefault();
  dragObstacleInfo.row = +this.dataset.row;
  dragObstacleInfo.col = +this.dataset.col;
  dragObstacleInfo.isPossible = false;

  //장애물의 위치가 가능하다고 알려진 곳에만 놓을 수 있음
  console.log(dragPlayerInfo.possibleObstacleBoard);
  dragPlayerInfo.possibleObstacleBoard.forEach((info) => {
    if (dragObstacleInfo.row == info.row && dragObstacleInfo.col == info.col && dragObstacleInfo.dir == info.dir) {
      dragObstacleInfo.isPossible = true;
    }
  });
  if (dragObstacleInfo.isPossible == false) return;

  board.getAdjObstacleBoardUnitId(dragObstacleInfo.row, dragObstacleInfo.col, dragObstacleInfo.dir).forEach((id) => {
    board.coloringObstacleBoard(id, "red");
  });
}
export function dragleaveObstacleBoard(event) {
  //장애물을 못놓는 경우
  if (dragObstacleInfo.isPossible == false) {
    return;
  }
  board.getAdjObstacleBoardUnitId(dragObstacleInfo.row, dragObstacleInfo.col, dragObstacleInfo.dir).forEach((id) => {
    board.coloringObstacleBoard(id, "");
  });
}
export function dragendObstacle(event) {
  let obstacleBoardUnits = document.querySelectorAll(".obstacleBoardUnit"); //장애물 보드 유닛
  for (let elem of obstacleBoardUnits) {
    //장애물 이동이 끝나면 장애물유닛 이벤트 닫음
    setDisabled(elem);
  }
  setAbled(getNowTurn().getElem()); //img요소의 pointer-events도 막지 않으면 자식요소(boardUnit)으로 버블링발생. 다시 열어줌
  board.coloringAllBoard();
}
export function dragoverObstacleBoard(event) {
  //obstacle board unit에 부여
  event.preventDefault(); //없으면 드롭 안됨
}
export function dropObstacleBoard(event) {
  //obstacle board unit에 부여
  event.preventDefault();

  if (dragObstacleInfo.isPossible == false) {
    return;
  }

  document.getElementById(dragObstacleInfo.imgId).remove(); //애니메이션
  setObstaclePos(dragObstacleInfo);

  changeTurn(getNowTurn(), getNextTurn());
}
export function clickObstacle(event) {
  console.log(event.target);
  if (event.target.dataset.dir == "vertical") {
    //event.target.src = "./images/obstacleHorizontal.png";
    event.target.dataset.dir = "horizontal";
    event.target.classList.add("obsHorizontal");
    event.target.classList.remove("obsVertical");
  } else {
    //event.target.src = "./images/obstacleVertical.png";
    event.target.dataset.dir = "vertical";
    event.target.classList.add("obsVertical");
    event.target.classList.remove("obsHorizontal");
  }
}
