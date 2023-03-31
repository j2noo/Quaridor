

export class Board{
    constructor(){
			this._playerBoardArr = Array.from(Array(9), () => Array(9).fill(0));
			this._obstacleBoardArr = Array.from(Array(8), () => Array(8).fill(-1));
			//table ->보드 참ㄴ조
			let playerBoardUnits = document.querySelectorAll('.playerBoardUnit');
			let obstacleBoardUnits = document.querySelectorAll('.obstacleBoardUnit');
    }
		getplayerBoardArr(){ 
			return this._boardArr;
		}
		getObstacleBoardArr(){ 
			return this._obstacleBoardArr;
		}
		setPlayerBoardArr(before, after, who){ 
			//console.log('before??'+before.row+before.col);
			this._playerBoardArr[before.row][before.col]=0;
			this._playerBoardArr[after.row][after.col]=who;

		}
		setObstacleBoardArr(row,col,dir){
			this._obstacleBoardArr[row][col]=dir;
		}
		printPlayerBoardArr(){
			console.table(this._playerBoardArr);
		}
		printObstacleBoardArr(){
			console.table(this._obstacleBoardArr);
		}
	
		isPossibleObstacle(obsInfo,p1,p2,isPrint){ // 놓는곳, 좌우/위아래 같은장애물 조사
			let returnInfo = {
				isPossible : true,
				minDepth1 : -1,
				minDepth2 : -1,
			}
			let direction = {
				'vertical' : [[1,0], [-1,0],[0,0]],
				'horizontal' : [[0,1], [0,-1],[0,0]],
			}
			if(isPrint){
				console.log(`(${obsInfo.row}, ${obsInfo.col})에 ${obsInfo.dir} 장애물 설치`);
			}
			for(let i=0;i<3;i++){
				let newRow= +obsInfo.row + direction[obsInfo.dir][i][0];
				let newCol= +obsInfo.col + direction[obsInfo.dir][i][1];
			
				if(!this.isValidIndex(8,newRow,newCol)){ //범위 밖은 조사안함
					continue;
				}
				if(this._obstacleBoardArr[newRow][newCol]==obsInfo.dir){
					if(isPrint){
						console.log('겹쳐서 설치할수 없습니다');
					}
					returnInfo.isPossible = false;
					return returnInfo;
				} 
			}


			this.setObstacleBoardArr(obsInfo.row,obsInfo.col,obsInfo.dir); //임시로 설정

			let flag=1;
			returnInfo.minDepth1 = this.isPlayerReachableBFS(p1,this.getObstacleBoardArr(),0);
			returnInfo.minDepth2 = this.isPlayerReachableBFS(p2,this.getObstacleBoardArr(),8);
			if(returnInfo.minDepth1==false){
				if(isPrint){
					console.log('player1이 승리지점에 도달할수없습니다');
				}
				returnInfo.isPossible=false;
			} 
			else{
				if(isPrint){
					console.log(`player1이 승리지점에 ${returnInfo.minDepth1}번 만에 도달합니다`);
				}
			}
			if(returnInfo.minDepth2==false){
				if(isPrint){
					console.log('player2이 승리지점에 도달할수없습니다');
				}
				returnInfo.isPossible=false;
			} 
			else{
				if(isPrint){
					console.log(`player2이 승리지점에 ${returnInfo.minDepth2}번 만에 도달합니다`);	
				}
			}

			this.setObstacleBoardArr(obsInfo.row,obsInfo.col,-1);  //임시설정 해제
			return returnInfo;
		}

		isPlayerReachableBFS(player, board, goalRow){

			const dy = [-1,0,1,0];
			const dx = [0,1,0,-1];
			let visitedArr = Array.from(Array(9), () => Array(9).fill(0));
			let depth=0; //depth가 0인경우는 없다
			let queue= new Queue();
			queue.enqueue(player.getPos());
			visitedArr[player.getPos().row][player.getPos().col]=1;

			while(!queue.empty()){
				let qs=queue.size();
				for(let i=0;i<qs;i++){
					let deq=queue.dequeue();
					if(deq.row==goalRow){
						return depth;
					}
					for(let j=0;j<4;j++){
						let newPos={
							row : +deq.row+ +dy[j],
							col : +deq.col+ +dx[j],
						}
						if(!this.isValidIndex(9,newPos.row,newPos.col)){
							continue;
						}
						if(visitedArr[newPos.row][newPos.col]==0 && this.isPossibleMove(deq,newPos,true,0)){ //  미방문이면
							
							queue.enqueue(newPos);
							visitedArr[newPos.row][newPos.col]=1;
						}
					}
				}
				depth++;
				
			}
			return false;
		}

		isPossibleMove(before,after,ignorePlayer,isPrint){ //점프 코드를 돌리기 위해 플레이어 무시하고 장애물만 검사
			if(!this.isValidIndex(9,before.row,before.col) || !this.isValidIndex(9,after.row,after.col)){
				if(isPrint==1){
					console.log("before또는 after의 좌표가 유효하지 않습니다.");
				}
				return false;
			}
			//console.log(`(${before.row}, ${before.col})에서 (${after.row}, ${after.col}) `);
			let distance2=(after.row - before.row)**2 + (after.col - before.col)**2;
			if( distance2!= 1) { //한칸떨어진게 아닌 경우
				if(distance2==2 && isPossibleJumpL.call(this,before,after)){ //L자로 이동하는경우 
					if(isPrint==1){
						console.log('플레이어를 "L"자로 뛰어넘습니다');
					}
					return true;
				}
				else if(distance2==4 && isPossibleJumpI.call(this,before,after)){
					if(isPrint==1){
						console.log('플레이어를 "I"자로 뛰어넘습니다');
					}
					return true;
				}
				if(isPrint==1){
					console.log('한칸만 움직이세요');
				}
				return false;
			}

			function isPossibleJumpL(before,after){ 
				let mid={};
				let progress={};
				if(this._playerBoardArr[after.row][before.col]!=0){ //before에서 세로-가로로 꺾인 모양
					mid.row=after.row;
					mid.col=before.col;
					progress.row= +before.row + +2*(after.row-before.row); //세로로 진행방향 너머, 즉 막혀있는지 확인해야 하는 칸
					progress.col=before.col;
				}
				else if(this._playerBoardArr[before.row][after.col]!=0){ //before에서 가로-세로로 꺾인 모양
					mid.row=before.row;
					mid.col=after.col;
					progress.row=before.row;
					progress.col= +before.col + +2*(after.col-before.col);
				}
				else {
					if(isPrint==1){
						console.log('플레이어도없는데 왜 L점프하세요?');
					}
					return false;
				}
				//console.log(mid);
				//console.log(progress);
				
				if( !this.isValidIndex(9,progress.row,progress.col) || this.isPossibleMove(mid,progress,true,0) ){// 진행방향 너머가 인덱스오버가 아니면서 막혀있을떄
					if(isPrint==1){
						console.log('플레이어 너머가 맵 밖이거나, I자 점프가 가능하네요');
					}
					return false;
				}
				return ( this.isPossibleMove(before,mid,true,0) && this.isPossibleMove(mid,after,true,0));  //두개가 가능한 움직임이고,
				
			} 
			function isPossibleJumpI(before,after){ 
				//console.table(this._playerBoardArr);
				let mid={};
				if(before.col==after.col){ //위아래점프
					mid.row = (+before.row+ +after.row)/2;
					mid.col = +after.col;
				}
				else if(before.row==after.row){ //좌우로점프
					mid.row = +after.row;
					mid.col = (+before.col+ +after.col)/2;
				}
				if(this._playerBoardArr[mid.row][mid.col]==0){
					if(isPrint==1){
						console.log('플레이어도없는데 왜 I 점프하세요?');
		
					}
					return false;
				}
				//console.log(mid.row,mid.col);
				return (this.isPossibleMove(before,mid,true,0) && this.isPossibleMove(mid,after,true,0));
				//얘는 ㅜ조건 이거아니면 저거 중에 하나네
			}

			if(this._playerBoardArr[after.row][after.col]!=0 && ignorePlayer==false){
				if(isPrint==1){
					console.log('플레이어가 존재합니다');
					
				}
				return false;
			}
			let obsLT=this.isValidIndex(8,before.row-1,before.col-1) ? this._obstacleBoardArr[before.row-1][before.col-1] : 'out'; //left,top에 장애물 존재여부(dir)
			let obsRT=this.isValidIndex(8,before.row-1,before.col) ? this._obstacleBoardArr[before.row-1][before.col] : 'out'; //left,bottom에 장애물 존재여부(dir)
			let obsLB=this.isValidIndex(8,before.row,before.col-1) ? this._obstacleBoardArr[before.row][before.col-1] : 'out'; //right,top에 장애물 존재여부(dir)
			let obsRB=this.isValidIndex(8,before.row,before.col) ? this._obstacleBoardArr[before.row][before.col] : 'out'; //right,bottom에 장애물 존재여부(dir)
			//console.log(obsLT, obsRT, obsLB, obsRB);
			
			//아래는 전부 1칸 이동하는 경우
			if(after.row < before.row){ //위로 이동하는경우 이동 가능한지
				//console.log( (obsLT!='horizontal' && obsRT!= 'horizontal') + '위');
				return (obsLT!='horizontal' && obsRT!= 'horizontal');
			}
			else if(after.row > before.row){ //아래로 이동하는경우 이동 가능한지
				//console.log((obsLB!='horizontal' && obsRB!= 'horizontal') + '아래');
				return (obsLB!='horizontal' && obsRB!= 'horizontal');
			}
			else if(after.col < before.col){ //좌로 이동하는경우 이동 가능한지
				//console.log((obsLT!='vertical' && obsLB!= 'vertical') + '좌');
				return (obsLT!='vertical' && obsLB!= 'vertical');
			}
			else if(after.col > before.col){ //우로 이동하는경우 이동 가능한지
				//console.log((obsRT!='vertical' && obsRB!= 'vertical')+'우');
				return (obsRT!='vertical' && obsRB!= 'vertical');
			}
			else {  
				console.log('이런경우는없다'); 
			}

			return true;
			
		}
		isValidIndex(size,row,col){
			return !(row<0 || row>=size || col<0 || col>=size);
		}
		checkWin(player){
			//console.log(player);
			if(player.getName()=='player1'){
				if(player.getPos().row==0){
					alert('player1 win!');
				}
			}
			else if(player.getName()=='player2'){
				if(player.getPos().row==8){
					alert('player2 win!');
				}
			}
			else {
				console.log('이거아니다나오면안돼ㅐㅔ');
			}
		}
}

export function initBoardEvents(){ //nono
	let tds = document.querySelectorAll('td');
	for(let elem of tds){
		elem.onclick = function(event){
			let target = event.target;
			console.log(`${target.dataset.row}, ${target.dataset.col} ${target.className} ${target.id}`);
		}
	}
}

export function positionObstacleOnBoard(elem, row, col){
	//console.log(elem);
	if(elem.dataset.dir=='vertical'){
  	elem.style.top=row * 70 + 'px';
		elem.style.left=col * 70 + 50 + 'px';
	}
	else {
		elem.style.top=row * 70 + 50 + 'px';
		elem.style.left=col * 70 + 'px';
	}
}
export function positionObstacleCenter(elem, pageX, pageY){
	elem.style.position = 'absolute';
  //elem.style.border = '2px solid red';
	elem.style.left = pageX - elem.offsetWidth / 2 + 'px';
  elem.style.top = pageY - elem.offsetHeight / 2 + 'px';
}

class QueueSlow {
  constructor() {
    this._arr = [];
  }
  enqueue(item) {
    this._arr.push(item);
  }
  dequeue() {
    return this._arr.shift();  // 시간복잡도가 너무느림
  }
	empty(){
		return this._arr.length==0;
	}
	size(){
		return this._arr.length;
	}
}
export class Queue { //rear에 추가, front에서 뺌
  constructor() {
    this.storage = {};
    this.front = 0;
    this.rear = -1;
  }
	enqueue(value) {
    if (this.size() === 0) {
      this.storage['0'] = value;
			this.front=0;
			this.rear=0;
    } else {
      this.rear += 1;
      this.storage[this.rear] = value;
    }
  }
  dequeue() {
    let temp;
    if (this.front === this.rear) { //원소 1개
      temp = this.storage[this.front];
      delete this.storage[this.front];
      this.front = 0;
      this.rear = -1;
    } else {
      temp = this.storage[this.front];
      delete this.storage[this.front];
      this.front += 1;
    }
    return temp;
  }
  empty(){
		return this.size()==0;
	}
  size() {
    
    return this.rear - this.front + 1;
    
  }
  
  
}