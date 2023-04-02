export function createModal() {
  let modal = document.createElement("div");
  let textBox = document.createElement("span");
  let modalBox = document.createElement("div");
  let btn1 = document.createElement("button");
  let btn2 = document.createElement("button");

  modal.className = "modal";

  textBox.className = "textBox";
  let idx = 0;
  for (let ch of "quoridor") {
    let elem = document.createElement("span");
    elem.innerHTML = ch;
    elem.id = "id" + idx++;
    textBox.append(elem);
  }

  modalBox.className = "modalBox";

  let elem = document.createElement("span");
  elem.innerHTML = "vs<br>Computer";
  btn1.append(elem);

  let elem2 = document.createElement("span");
  elem2.innerHTML = "vs<br>Player";
  btn2.append(elem2);

  btn1.id = "btn1";
  btn2.id = "btn2";

  btn1.addEventListener("mouseenter", () => {
    document.querySelector("#btn1 span").innerHTML = "<br>GO!";
  });
  btn1.addEventListener("mouseleave", () => {
    document.querySelector("#btn1 span").innerHTML = "vs<br>Computer";
  });
  btn2.addEventListener("mouseenter", () => {
    document.querySelector("#btn2 span").innerHTML = "<br>GO!";
  });
  btn2.addEventListener("mouseleave", () => {
    document.querySelector("#btn2 span").innerHTML = "vs<br>Player";
  });

  modal.append(textBox);
  modalBox.append(btn1);
  modalBox.append(btn2);

  modal.append(modalBox);

  document.body.append(modal);
}
export function createModalBuffering() {
  let modal = document.createElement("div");
  let imgBox = document.createElement("img");
  imgBox.src = "./images/buffering.jpg";

  let i = document.createElement("i");

  modal.className = "buffering";
  //+modal.className='hidden';
  i.className = "fa-solid fa-magnifying-glass fa-bounce";
  i.className = "fa-regular fa-face-rolling-eyes fa-beat-fade";

  //modal.append(i);
  modal.append(imgBox);
  document.body.append(modal);
  //modal.classList.add('hidden');
}
export function createModalWinner() {
  let modal = document.createElement("div");
  let winnerBox = document.createElement("div");

  modal.className = "winner";
  winnerBox.className = "winnerXox";

  modal.append(winnerBox);
  document.body.append(modal);
}
