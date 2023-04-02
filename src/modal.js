export function createModal() {
  let modal = document.createElement("div");
  let bg = document.createElement("div");
  let modalBox = document.createElement("div");
  let btn1 = document.createElement("button");
  let btn2 = document.createElement("button");

  modal.className = "modal";
  bg.className = "bg";
  modalBox.className = "modalBox";
  btn1.innerText = "vs Computer";
  btn1.id = "btn1";
  btn2.innerText = "vs Player";
  btn2.id = "btn2";

  modalBox.append(btn1);
  modalBox.append(btn2);

  modal.append(bg);
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
