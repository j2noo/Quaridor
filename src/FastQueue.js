export class Queue {
  //rear에 추가, front에서 뺌
  constructor() {
    this.storage = {};
    this.front = 0;
    this.rear = -1;
  }
  enqueue(value) {
    if (this.size() === 0) {
      this.storage["0"] = value;
      this.front = 0;
      this.rear = 0;
    } else {
      this.rear += 1;
      this.storage[this.rear] = value;
    }
  }
  dequeue() {
    let temp;
    if (this.front === this.rear) {
      //원소 1개
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
  empty() {
    return this.size() == 0;
  }
  size() {
    return this.rear - this.front + 1;
  }
}
