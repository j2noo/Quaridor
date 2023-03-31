export function createModal(){
  let modal=document.createElement('div');
  let bg=document.createElement('div');
  let modalBox=document.createElement('div');
  let btn1 = document.createElement('button');
  let btn2 = document.createElement('button');

  modal.className='modal';
  bg.className='bg';
  modalBox.className='modalBox';
  btn1.innerText='vs Computer';
  btn1.id='btn1';
  btn2.innerText='vs Player';
  btn2.id='btn2';

  modalBox.append(btn1);
  modalBox.append(btn2);
  
  modal.append(bg);
  modal.append(modalBox);

  document.body.append(modal);

}
