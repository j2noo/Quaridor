
export class Player {
    constructor(name, color, row, col){
        this._name = name;
        this._color = color;
        this._leftObstacles = 10;
        this._isMyTurn = false; //네명 모두 초기값 false
        this._pos = {
            row : row,
            col : col,
        }
        this._elem=null;
        this._id=name;
    }   
    getName() { return this._name; } //player1 or player2
    setName() {} //굳이 필요없는대ㅔ?

    getColor() { return this._color; }  //player1 or player2 or computer
    setColor() {} //굳이 필요없는대ㅔ?

    getLeftObstacles() { return this._leftObstacles ;}
    setLeftObstacles(value_Number){ this._leftObstacles = value_Number;}

    getIsMyTurn() { return this._isMyTurn ;}
    setIsMyTurn(value_Bool){ this._isMyTurn = value_Bool;}

    getPos() { return this._pos; }
    setPos(r,c) { this._pos.row = r, this._pos.col = c; }  //rc말고객체

    getElem() { return this._elem; }
    setElem(elem) { this._elem=elem; }

    initElem(color){ //crateboard로
        let imgElem=document.createElement('img');
        imgElem.src="./images/"+color+".png";
        imgElem.id='img'+color;
        imgElem.className='imgPlayer';
        this.setElem(imgElem);
    }
    getTableId(){ return '#p'+this._pos.row + this._pos.col;}
    /* setElem(pos){
        this._elem = document.querySelector(`#p${pos.row}${pos.col}`); //이거 p84??
    } */
    getId(){
        return this._id;
    }
}

