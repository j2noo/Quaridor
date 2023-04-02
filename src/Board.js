import { Queue } from "./FastQueue.js";
const OBS_COLOR = "#c9a85c";
export class Board {
  constructor() {
    this._playerBoardArr = Array.from(Array(9), () => Array(9).fill(0));
    this._obstacleBoardArr = Array.from(Array(8), () => Array(8).fill(-1));
    //table ->보드 참ㄴ조
    let playerBoardUnits = document.querySelectorAll(".playerBoardUnit");
    let obstacleBoardUnits = document.querySelectorAll(".obstacleBoardUnit");
  }
  getplayerBoardArr() {
    return this._boardArr;
  }
  getObstacleBoardArr() {
    return this._obstacleBoardArr;
  }
  setPlayerBoardArr(before, after, who) {
    //console.log('before??'+before.row+before.col);
    this._playerBoardArr[before.row][before.col] = 0;
    this._playerBoardArr[after.row][after.col] = who;
  }
  setObstacleBoardArr(row, col, dir) {
    this._obstacleBoardArr[row][col] = dir;
  }
  printPlayerBoardArr() {
    console.table(this._playerBoardArr);
  }
  printObstacleBoardArr() {
    console.table(this._obstacleBoardArr);
  }
  //장애물을 놓았을때 영향을 받는 요소의 id
  getAdjObstacleBoardUnitId(row, col, dir) {
    let ret = [];
    if (dir == "vertical") {
      ret[0] = "e" + row * 2 + "e" + (col * 2 + 1);
      ret[1] = "e" + (row * 2 + 2) + "e" + (col * 2 + 1);
    } else {
      ret[0] = "e" + (row * 2 + 1) + "e" + col * 2;
      ret[1] = "e" + (row * 2 + 1) + "e" + (col * 2 + 2);
    }
    ret[2] = "o" + row + col;
    return ret;
  }
  coloringAllBoard() {
    let boardUnits = document.querySelectorAll("td");
    //모든 보드 색칠 해제
    boardUnits.forEach((element) => {
      element.style.background = "";
    });

    //장애물 색칠
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this._obstacleBoardArr[i][j] == -1) continue;

        let adj = this.getAdjObstacleBoardUnitId(i, j, this._obstacleBoardArr[i][j]);
        adj.forEach((element) => {
          document.getElementById(element).style.backgroundColor = OBS_COLOR;
        });
        if (this._obstacleBoardArr[i][j] == "vertical") {
          document.getElementById(adj[2]).style.borderTopColor = OBS_COLOR;
          document.getElementById(adj[2]).style.borderBottomColor = OBS_COLOR;
        } else {
          document.getElementById(adj[2]).style.borderLeftColor = OBS_COLOR;
          document.getElementById(adj[2]).style.borderRightColor = OBS_COLOR;
        }
      }
    }
  }
  coloringOneBoard(type, pos, color) {
    document.getElementById("" + type + pos.row + pos.col).style.backgroundColor = color;
  }
  coloringObstacleBoard(id, color) {
    document.getElementById(id).style.backgroundColor = color;
  }
  isPossibleObstacle(obsInfo, p1, p2, isPrint) {
    // 놓는곳, 좌우/위아래 같은장애물 조사
    let returnInfo = {
      isPossible: true,
      minDepth1: -1,
      minDepth2: -1,
    };
    let direction = {
      vertical: [
        [1, 0],
        [-1, 0],
        [0, 0],
      ],
      horizontal: [
        [0, 1],
        [0, -1],
        [0, 0],
      ],
    };
    if (isPrint) {
      console.log(`(${obsInfo.row}, ${obsInfo.col})에 ${obsInfo.dir} 장애물 설치`);
    }
    for (let i = 0; i < 3; i++) {
      let newRow = +obsInfo.row + direction[obsInfo.dir][i][0];
      let newCol = +obsInfo.col + direction[obsInfo.dir][i][1];

      if (!this.isValidIndex(8, newRow, newCol)) {
        //범위 밖은 조사안함
        continue;
      }
      if (this._obstacleBoardArr[newRow][newCol] == obsInfo.dir) {
        if (isPrint) {
          console.log("겹쳐서 설치할수 없습니다");
        }
        returnInfo.isPossible = false;
        return returnInfo;
      }
    }

    this.setObstacleBoardArr(obsInfo.row, obsInfo.col, obsInfo.dir); //임시로 설정

    let flag = 1;
    returnInfo.minDepth1 = this.isPlayerReachableBFS(p1, this.getObstacleBoardArr(), 0);
    returnInfo.minDepth2 = this.isPlayerReachableBFS(p2, this.getObstacleBoardArr(), 8);
    if (returnInfo.minDepth1 == false) {
      if (isPrint) {
        console.log("player1이 승리지점에 도달할수없습니다");
      }
      returnInfo.isPossible = false;
    } else {
      if (isPrint) {
        console.log(`player1이 승리지점에 ${returnInfo.minDepth1}번 만에 도달합니다`);
      }
    }
    if (returnInfo.minDepth2 == false) {
      if (isPrint) {
        console.log("player2이 승리지점에 도달할수없습니다");
      }
      returnInfo.isPossible = false;
    } else {
      if (isPrint) {
        console.log(`player2이 승리지점에 ${returnInfo.minDepth2}번 만에 도달합니다`);
      }
    }

    this.setObstacleBoardArr(obsInfo.row, obsInfo.col, -1); //임시설정 해제
    return returnInfo;
  }

  isPlayerReachableBFS(player, board, goalRow) {
    const dy = [-1, 0, 1, 0];
    const dx = [0, 1, 0, -1];
    let visitedArr = Array.from(Array(9), () => Array(9).fill(0));
    let depth = 0; //depth가 0인경우는 없다
    let queue = new Queue();
    queue.enqueue(player.getPos());
    visitedArr[player.getPos().row][player.getPos().col] = 1;

    while (!queue.empty()) {
      let qs = queue.size();
      for (let i = 0; i < qs; i++) {
        let deq = queue.dequeue();
        if (deq.row == goalRow) {
          return depth;
        }
        for (let j = 0; j < 4; j++) {
          let newPos = {
            row: +deq.row + +dy[j],
            col: +deq.col + +dx[j],
          };
          if (!this.isValidIndex(9, newPos.row, newPos.col)) {
            continue;
          }
          if (visitedArr[newPos.row][newPos.col] == 0 && this.isPossibleMove(deq, newPos, true, 0)) {
            //  미방문이면

            queue.enqueue(newPos);
            visitedArr[newPos.row][newPos.col] = 1;
          }
        }
      }
      depth++;
    }
    return false;
  }

  isPossibleMove(before, after, ignorePlayer, isPrint) {
    //점프 코드를 돌리기 위해 플레이어 무시하고 장애물만 검사
    if (!this.isValidIndex(9, before.row, before.col) || !this.isValidIndex(9, after.row, after.col)) {
      if (isPrint == 1) {
        console.log("before또는 after의 좌표가 유효하지 않습니다.");
      }
      return false;
    }
    //console.log(`(${before.row}, ${before.col})에서 (${after.row}, ${after.col}) `);
    let distance2 = (after.row - before.row) ** 2 + (after.col - before.col) ** 2;
    if (distance2 != 1) {
      //한칸떨어진게 아닌 경우
      if (distance2 == 2 && isPossibleJumpL.call(this, before, after)) {
        //L자로 이동하는경우
        if (isPrint == 1) {
          console.log('플레이어를 "L"자로 뛰어넘습니다');
        }
        return true;
      } else if (distance2 == 4 && isPossibleJumpI.call(this, before, after)) {
        if (isPrint == 1) {
          console.log('플레이어를 "I"자로 뛰어넘습니다');
        }
        return true;
      }
      if (isPrint == 1) {
        console.log("한칸만 움직이세요");
      }
      return false;
    }

    function isPossibleJumpL(before, after) {
      let mid = {};
      let progress = {};
      if (this._playerBoardArr[after.row][before.col] != 0) {
        //before에서 세로-가로로 꺾인 모양
        mid.row = after.row;
        mid.col = before.col;
        progress.row = +before.row + +2 * (after.row - before.row); //세로로 진행방향 너머, 즉 막혀있는지 확인해야 하는 칸
        progress.col = before.col;
      } else if (this._playerBoardArr[before.row][after.col] != 0) {
        //before에서 가로-세로로 꺾인 모양
        mid.row = before.row;
        mid.col = after.col;
        progress.row = before.row;
        progress.col = +before.col + +2 * (after.col - before.col);
      } else {
        if (isPrint == 1) {
          console.log("플레이어도없는데 왜 L점프하세요?");
        }
        return false;
      }
      //console.log(mid);
      //console.log(progress);

      if (!this.isValidIndex(9, progress.row, progress.col) || this.isPossibleMove(mid, progress, true, 0)) {
        // 진행방향 너머가 인덱스오버가 아니면서 막혀있을떄
        if (isPrint == 1) {
          console.log("플레이어 너머가 맵 밖이거나, I자 점프가 가능하네요");
        }
        return false;
      }
      return this.isPossibleMove(before, mid, true, 0) && this.isPossibleMove(mid, after, true, 0); //두개가 가능한 움직임이고,
    }
    function isPossibleJumpI(before, after) {
      //console.table(this._playerBoardArr);
      let mid = {};
      if (before.col == after.col) {
        //위아래점프
        mid.row = (+before.row + +after.row) / 2;
        mid.col = +after.col;
      } else if (before.row == after.row) {
        //좌우로점프
        mid.row = +after.row;
        mid.col = (+before.col + +after.col) / 2;
      }
      if (this._playerBoardArr[mid.row][mid.col] == 0) {
        if (isPrint == 1) {
          console.log("플레이어도없는데 왜 I 점프하세요?");
        }
        return false;
      }
      //console.log(mid.row,mid.col);
      return this.isPossibleMove(before, mid, true, 0) && this.isPossibleMove(mid, after, true, 0);
      //얘는 ㅜ조건 이거아니면 저거 중에 하나네
    }

    if (this._playerBoardArr[after.row][after.col] != 0 && ignorePlayer == false) {
      if (isPrint == 1) {
        console.log("플레이어가 존재합니다");
      }
      return false;
    }
    let obsLT = this.isValidIndex(8, before.row - 1, before.col - 1) ? this._obstacleBoardArr[before.row - 1][before.col - 1] : "out"; //left,top에 장애물 존재여부(dir)
    let obsRT = this.isValidIndex(8, before.row - 1, before.col) ? this._obstacleBoardArr[before.row - 1][before.col] : "out"; //left,bottom에 장애물 존재여부(dir)
    let obsLB = this.isValidIndex(8, before.row, before.col - 1) ? this._obstacleBoardArr[before.row][before.col - 1] : "out"; //right,top에 장애물 존재여부(dir)
    let obsRB = this.isValidIndex(8, before.row, before.col) ? this._obstacleBoardArr[before.row][before.col] : "out"; //right,bottom에 장애물 존재여부(dir)
    //console.log(obsLT, obsRT, obsLB, obsRB);

    //아래는 전부 1칸 이동하는 경우
    if (after.row < before.row) {
      //위로 이동하는경우 이동 가능한지
      //console.log( (obsLT!='horizontal' && obsRT!= 'horizontal') + '위');
      return obsLT != "horizontal" && obsRT != "horizontal";
    } else if (after.row > before.row) {
      //아래로 이동하는경우 이동 가능한지
      //console.log((obsLB!='horizontal' && obsRB!= 'horizontal') + '아래');
      return obsLB != "horizontal" && obsRB != "horizontal";
    } else if (after.col < before.col) {
      //좌로 이동하는경우 이동 가능한지
      //console.log((obsLT!='vertical' && obsLB!= 'vertical') + '좌');
      return obsLT != "vertical" && obsLB != "vertical";
    } else if (after.col > before.col) {
      //우로 이동하는경우 이동 가능한지
      //console.log((obsRT!='vertical' && obsRB!= 'vertical')+'우');
      return obsRT != "vertical" && obsRB != "vertical";
    } else {
      console.log("이런경우는없다");
    }

    return true;
  }
  getPossiblePlayerPos(beforePos) {
    const dy = [-1, -1, -1, 0, 1, 1, 1, 0, -2, 0, 2, 0]; //대각선1칸 + 상하좌우2칸씩
    const dx = [-1, 0, 1, 1, 1, 0, -1, -1, 0, 2, 0, -2]; //대각선1칸 + 상하좌우2칸씩
    let ret = [];

    for (let i = 0; i < 12; i++) {
      const newPos = {
        row: beforePos.row + dy[i],
        col: beforePos.col + dx[i],
      };
      //가능한 움직임 확인, 출력없이
      if (this.isPossibleMove(beforePos, newPos, 0)) {
        ret.push(newPos);
      }
    }
    return ret;
  }
  isValidIndex(size, row, col) {
    return !(row < 0 || row >= size || col < 0 || col >= size);
  }
  checkWin(player) {
    //console.log(player);
    if ((player.getName() == "player1" && player.getPos().row == 0) || (player.getName() == "player2" && player.getPos().row == 8)) {
      document.querySelector(".winner").style.display = "flex";
      document.querySelector(".winner").innerText = `승자는 ${player.getId()}입니다!`;
    }
  }
}
