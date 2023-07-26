import { Queue } from "./FastQueue.js";
export class Computer {
  constructor(name, color, row, col) {
    this._name = name;
    this._color = color;
    this._leftObstacles = 10;
    this._isMyTurn = false; //네명 모두 초기값 false
    this._pos = {
      row: row,
      col: col,
    };
    this._elem = null;
    this._id = "computer";
  }
  getName() {
    return this._name;
  }
  setName() {} //굳이 필요없는대ㅔ?

  getColor() {
    return this._color;
  }
  setColor() {} //굳이 필요없는대ㅔ?

  getLeftObstacles() {
    return this._leftObstacles;
  }
  setLeftObstacles(value_Number) {
    this._leftObstacles = value_Number;
  }

  getIsMyTurn() {
    return this._isMyTurn;
  }
  setIsMyTurn(value_Bool) {
    this._isMyTurn = value_Bool;
  }

  getPos() {
    return this._pos;
  }
  setPos(r, c) {
    (this._pos.row = r), (this._pos.col = c);
  } //rc말고객체

  getElem() {
    return this._elem;
  }
  setElem(elem) {
    this._elem = elem;
  }

  initElem(color) {
    //crateboard로
    let imgElem = document.createElement("img");
    imgElem.src = "./images/" + color + ".png";
    imgElem.id = "img" + color;
    imgElem.className = "imgPlayer";
    this.setElem(imgElem);
  }
  getTableId() {
    return "#p" + this._pos.row + this._pos.col;
  }
  getId() {
    return this._id;
  }
  getComputerChoice(board, player1, player2) {
    let resultBruteforce = bruteforceObstacle(board, player1, player2);

    console.log(resultBruteforce);

    if (this._leftObstacles == 0) {
      //장애물이 없는경우는 무조건 움직이기
      return computerChooseMove();
    } else if (resultBruteforce.originPlayerDistance <= 2) {
      //플레이어가 2칸이하로 남았으면 무조건 장애물
      this._leftObstacles--;
      console.log("남은 obs :" + this.getLeftObstacles());
      return computerChooseObs();
    } else if (resultBruteforce.awayFarthest > 2) {
      //2칸이상 멀어지게 할 수 있으면 장애물설치
      this._leftObstacles--;
      console.log("남은 obs :" + this.getLeftObstacles());
      return computerChooseObs();
    } else return computerChooseMove();
    function computerChooseMove() {
      //움직이는 경우
      //bfs 백트래킹하기
      let computerBefore = player2.getPos();
      let computerAfter = getMoveBFS(board, player1, player2);
      return computerAfter;
    }
    function computerChooseObs() {
      // 장애물을 설치하는 경우
      return {
        row: resultBruteforce.row,
        col: resultBruteforce.col,
        dir: resultBruteforce.dir,
        select: "obs",
      };
    }
    //모든 위치에 장애물을 놓아서 컴퓨터 vs 플레이어의 이동거리 증가 비교
    function bruteforceObstacle(board, player1, player2) {
      let obsBoard = board.getObstacleBoardArr();
      let originDistance = {
        player: board.isPlayerReachableBFS(player1, board, 0),
        computer: board.isPlayerReachableBFS(player2, board, 8),
      };
      let bestChoice = {
        awayFarthest: 0, //플레이어가 최고 멀어지는 거리
        minDistancePlayerObstacle: 987654321, //플레이어와 장애물 사이거리 최소로
        row: null,
        col: null,
        dir: null,
        originPlayerDistance: originDistance.player,
      };
      //console.log('player1 원래 도달거리 '+ originDistance.player);
      //console.log('computer 원래 도달거리 '+ originDistance.computer);

      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (obsBoard[i][j] != -1) {
            //보드에 이미 장애물이 있는 경우
            continue;
          }
          let dirArr = ["vertical", "horizontal"];
          for (let k = 0; k < 2; k++) {
            let obstmp = {
              row: i,
              col: j,
              dir: dirArr[k],
            };
            let obsInfo = board.isPossibleObstacle(obstmp, player1, player2, 0); //이거 중복계산
            if (obsInfo.isPossible == false) {
              //겹침으로 설치 불가능
              continue;
            }
            let increasePlayerDistance = obsInfo.minDepth1 - originDistance.player;
            let increaseComputerDistance = obsInfo.minDepth2 - originDistance.computer;
            let playerFurtherAway = increasePlayerDistance - increaseComputerDistance;

            //플레이어와 장애물 거리//17*17 table에서 계산
            let distacePO = Math.abs(player1.getPos().row * 2 - (i * 2 + 1)) + Math.abs(player1.getPos().col * 2 - (j * 2 + 1));
            //console.log('y거리 : ' + Math.abs(player1.getPos().row*2 - (i*2 +1)));
            //console.log('x거리 : ' + Math.abs(player1.getPos().col*2 - (j*2 +1)));

            //console.log(`(${i},${j})에 ${dirArr[k]} 설치해봄`);
            //console.log(`플레이어 ${increasePlayerDistance}칸, 컴퓨터 ${increaseComputerDistance}칸 늘어남`);
            //console.log('플레이어가 손해본 칸수 : ' +playerFurtherAway + '  거리 : '+ distacePO);

            if (playerFurtherAway > bestChoice.awayFarthest) {
              //플레이어를 가장 멀어지게 하는 경우
              bestChoice.awayFarthest = playerFurtherAway;
              bestChoice.minDistancePlayerObstacle = distacePO;
              bestChoice.row = i;
              bestChoice.col = j;
              bestChoice.dir = dirArr[k];
            } else if (
              playerFurtherAway == bestChoice.awayFarthest && //멀어지는게 같으면 가까운곳으로
              distacePO < bestChoice.minDistancePlayerObstacle
            ) {
              bestChoice.awayFarthest = playerFurtherAway;
              bestChoice.minDistancePlayerObstacle = distacePO;
              bestChoice.row = i;
              bestChoice.col = j;
              bestChoice.dir = dirArr[k];
            }
          }
        }
      }
      return bestChoice;
    }
    //컴퓨터(p2)가 처음 이동할 위치 찾기
    function getMoveBFS(board, player1, player2) {
      const dy = [1, 0, -1, 0]; //아래,좌,위,우
      const dx = [0, -1, 0, 1];
      const p1Pos = player1.getPos();
      const p2Pos = player2.getPos();
      let visitedArr = Array.from(Array(9), () => Array(9).fill(0));
      let depth = 1; //상하좌우부터 시작
      let queue = new Queue();

      visitedArr[p2Pos.row][p2Pos.col] = 1;

      for (let i = 0; i < 4; i++) {
        //depth 1까지는 큐-런타임전처리
        let initPos = {
          row: p2Pos.row + dy[i],
          col: p2Pos.col + dx[i],
          firstRow: p2Pos.row + dy[i], //첫 움직임
          firstCol: p2Pos.col + dx[i], //첫 움직임
        };
        if (!board.isValidIndex(9, initPos.row, initPos.col)) {
          continue;
        }
        //첫 상하좌우가 상대편이 아니거, 이동 가능하면
        if (!(initPos.row == p1Pos.row && initPos.col == p1Pos.col) && board.isPossibleMove(p2Pos, initPos, true)) {
          queue.enqueue(initPos);
          continue;
        }
        //첫 상하좌우가 상대편이라 점프하는 경우
        for (let j = 0; j < 4; j++) {
          let initPos2 = {
            row: initPos.row + dy[j],
            col: initPos.col + dx[j],
            firstRow: initPos.row + dy[j], //첫 움직임
            firstCol: initPos.col + dx[j], //첫 움직임
          };
          //L I점프아니고 나로 돌아온 경우는 아님
          if (initPos2.row == p2Pos.row && initPos2.col == p2Pos.col) {
            continue;
          }
          console.log("" + p2Pos.row + p2Pos.col + "에서" + initPos2.row + initPos2.col + "점프");

          if (board.isPossibleMove(p2Pos, initPos2, 0)) {
            queue.enqueue(initPos2);
          }
        }
      }

      while (!queue.empty()) {
        let qs = queue.size();
        for (let i = 0; i < qs; i++) {
          let deq = queue.dequeue();
          if (deq.row == 8) {
            console.log(deq);
            return {
              row: deq.firstRow,
              col: deq.firstCol,
              select: "move", //컴퓨터의 선택
            };
          }
          for (let j = 0; j < 4; j++) {
            let newPos = {
              row: +deq.row + +dy[j],
              col: +deq.col + +dx[j],
              firstRow: deq.firstRow,
              firstCol: deq.firstCol,
            };

            if (!board.isValidIndex(9, newPos.row, newPos.col)) {
              continue;
            }
            if (visitedArr[newPos.row][newPos.col] == 0 && board.isPossibleMove(deq, newPos, true)) {
              //  미방문이면

              queue.enqueue(newPos);
              visitedArr[newPos.row][newPos.col] = 1;
            }
          }
        }
        depth++;
      }
      return false; //이런경우는 없음 이동못하는 경우가없으므로
    }
  }
}
