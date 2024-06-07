//Google search removal

document.addEventListener('DOMContentLoaded', async () => {

  let cards = [[]];
  let container = document.querySelector('.Container');
  let foundation = document.querySelectorAll('.Foundation');
  await loadGame(cards, container, foundation);


  let isDragging = false, isPaused = false;
  let offsetX, offsetY;
  let originX, originY, originZ;
  let endX, endY, endZ;
  let draggedColumn, draggedRow;
  let draggedElement;
  let droppedElementX, droppedElementY;
  let transferedSection;
  let index = 1;
  let undoBtn = document.querySelector('.Undo');
  let stock = container.querySelector('.StockOutline');
  let piles = container.querySelectorAll('.PileOutline');
  let actHist = new ActionHistory();




  click = async (e) => {
    if (e.target.classList.contains('StockCards') && !isPaused) {
      cards[8] = cards[8].concat(cards[7][cards[7].length - 1]);
      cards[7].splice(cards[7].length - 1, 1);

      cards[8][cards[8].length - 1].src = `img/${cards[8][cards[8].length - 1].id}.png`;

      isPaused = true;
      endX = foundation[0].offsetLeft;
      endZ = cards[8].length;

      await animate(cards[8][cards[8].length - 1], endX, null, endZ, 150, undoBtn, true);
      isPaused = false

      cards[8][cards[8].length - 1].classList.remove('StockCards');
      cards[8][cards[8].length - 1].classList.add('Cards');

      actHist.setAction(false, 7, 8, cards[8].length - 1);

    } else if (e.target.classList.contains('StockOutline') && !isPaused) {
      isPaused = true;
      index = 1;
      for (let i = cards[8].length - 1; i >= 0; i--) {
        cards[7] = cards[7].concat(cards[8][i]);
        cards[8].splice(cards[8].length - 1, 1);

        cards[7][cards[7].length - 1].src = `img/Back.png`;

        endX = stock.offsetLeft;
        endZ = index++;
        await animate(cards[7][cards[7].length - 1], endX, null, endZ, 50, undoBtn, true);

        cards[7][cards[7].length - 1].classList.add('StockCards');
        cards[7][cards[7].length - 1].classList.remove('Cards');
      }
      actHist.setAction(true, 8, 7, null);
      index = 1;
      isPaused = false;
    } else if (e.target.classList.contains('Undo') && actHist.hasData() && !isPaused) {
      isPaused = true;
      await actionUndo(cards, piles, foundation, stock, actHist, undoBtn);
      isPaused = false;
    }
  }

  actionUp = async () => {
    if (isDragging) {
      isPaused = true;
      for (let i = cards.length; i >= -1; i--) {
        if (i === -1) {
          endX = originX;
          endY = originY;
          endZ = Number(originZ);
          animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

          break;
        }
        if (originX > draggedElement.offsetLeft - draggedElement.clientWidth / 8 && originX < draggedElement.offsetLeft + draggedElement.clientWidth / 8 && originY > draggedElement.offsetTop - draggedElement.clientHeight / 10 && originY < draggedElement.offsetTop + draggedElement.clientHeight / 10) {
          if (i != draggedColumn) {
            if (isStackableStock(cards, i, foundation[i - 8], draggedCardId, draggedColumn, draggedRow)) {
              endX = foundation[i - 8].offsetLeft;
              endY = foundation[i - 8].offsetTop;
              endZ = Number(cards[i].length) + 1;
              animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

              transferedSection = cards[draggedColumn].slice(draggedRow, cards[draggedColumn].length);
              cards[i] = cards[i].concat(transferedSection);
              cards[draggedColumn].splice(draggedRow, cards[draggedColumn].length - draggedRow);

              if (cards[draggedColumn].length && cards[draggedColumn][cards[draggedColumn].length - 1].classList.contains("InactiveCards")) {
                cards[draggedColumn][cards[draggedColumn].length - 1].classList.remove("InactiveCards")
                cards[draggedColumn][cards[draggedColumn].length - 1].classList.add("Cards")
                cards[draggedColumn][cards[draggedColumn].length - 1].src = `img/${cards[draggedColumn][cards[draggedColumn].length - 1].id}.png`
                actHist.setAction(true, draggedColumn, i, cards[i].length - 1);
              } else {
                actHist.setAction(false, draggedColumn, i, cards[i].length - 1);
              }
              break;
            } else if (i <= 6 && isStackableTableau(true, cards[i][cards[i].length - 1], draggedCardId, droppedElementX, piles[i])) {
              let tempRow = draggedRow;
              let tempColumn = draggedColumn;
              draggedColumn = i;
              draggedRow = cards[i].length;

              if (!cards[i][cards[i].length - 1] && draggedCardId[0] == 'K') {
                endX = piles[i].offsetLeft;
                endY = piles[i].offsetTop;
                endZ = 1;
                animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

                transferedSection = cards[tempColumn].slice(tempRow, cards[tempColumn].length);
                cards[i] = cards[i].concat(transferedSection);
                cards[tempColumn].splice(tempRow, cards[tempColumn].length - tempRow);
              } else {
                endX = cards[i][cards[i].length - 1].offsetLeft;
                endY = cards[i][cards[i].length - 1].offsetTop + (piles[0].clientHeight / 7);
                endZ = Number(cards[i][cards[i].length - 1].style.zIndex) + 1;
                animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

                transferedSection = cards[tempColumn].slice(tempRow, cards[tempColumn].length);
                cards[i] = cards[i].concat(transferedSection);
                cards[tempColumn].splice(tempRow, cards[tempColumn].length - tempRow);
              }

              if (cards[tempColumn].length && cards[tempColumn][cards[tempColumn].length - 1].classList.contains("InactiveCards")) {
                cards[tempColumn][cards[tempColumn].length - 1].classList.remove("InactiveCards")
                cards[tempColumn][cards[tempColumn].length - 1].classList.add("Cards")
                cards[tempColumn][cards[tempColumn].length - 1].src = `img/${cards[tempColumn][cards[tempColumn].length - 1].id}.png`
                actHist.setAction(true, tempColumn, draggedColumn, draggedRow);
                break;
              } else {
                actHist.setAction(false, tempColumn, draggedColumn, draggedRow);
                break;
              }
            }
          }
        } else if (droppedElementY <= stock.offsetTop + (stock.clientHeight / 2)) {

          if (isStackableStock(cards, i, foundation[i - 8], draggedCardId, draggedColumn, draggedRow)) {
            endX = foundation[i - 8].offsetLeft;
            endY = foundation[i - 8].offsetTop;
            endZ = Number(cards[i].length) + 1;
            animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

            transferedSection = cards[draggedColumn].slice(draggedRow, cards[draggedColumn].length);
            cards[i] = cards[i].concat(transferedSection);
            cards[draggedColumn].splice(draggedRow, cards[draggedColumn].length - draggedRow);

            if (cards[draggedColumn].length && cards[draggedColumn][cards[draggedColumn].length - 1].classList.contains("InactiveCards")) {
              cards[draggedColumn][cards[draggedColumn].length - 1].classList.remove("InactiveCards")
              cards[draggedColumn][cards[draggedColumn].length - 1].classList.add("Cards")
              cards[draggedColumn][cards[draggedColumn].length - 1].src = `img/${cards[draggedColumn][cards[draggedColumn].length - 1].id}.png`
              actHist.setAction(true, draggedColumn, i, cards[i].length - 1);
            } else {
              actHist.setAction(false, draggedColumn, i, cards[i].length - 1);
            }
            break;
          }
        } else if (i <= 6 && isStackableTableau(false, cards[i][cards[i].length - 1], draggedCardId, droppedElementX, piles[i])) {
          let tempRow = draggedRow;
          let tempColumn = draggedColumn;
          draggedColumn = i;
          draggedRow = cards[i].length;

          if (!cards[i][cards[i].length - 1] && draggedCardId[0] == 'K') {
            endX = piles[i].offsetLeft;
            endY = piles[i].offsetTop;
            endZ = 1;
            animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

            transferedSection = cards[tempColumn].slice(tempRow, cards[tempColumn].length);
            cards[i] = cards[i].concat(transferedSection);
            cards[tempColumn].splice(tempRow, cards[tempColumn].length - tempRow);
          } else {
            endX = cards[i][cards[i].length - 1].offsetLeft;
            endY = cards[i][cards[i].length - 1].offsetTop + (piles[0].clientHeight / 7);
            endZ = Number(cards[i][cards[i].length - 1].style.zIndex) + 1;
            animate(draggedElement, endX, endY, endZ, 150, undoBtn, true);

            transferedSection = cards[tempColumn].slice(tempRow, cards[tempColumn].length);
            cards[i] = cards[i].concat(transferedSection);
            cards[tempColumn].splice(tempRow, cards[tempColumn].length - tempRow);
          }

          if (cards[tempColumn].length && cards[tempColumn][cards[tempColumn].length - 1].classList.contains("InactiveCards")) {
            cards[tempColumn][cards[tempColumn].length - 1].classList.remove("InactiveCards")
            cards[tempColumn][cards[tempColumn].length - 1].classList.add("Cards")
            cards[tempColumn][cards[tempColumn].length - 1].src = `img/${cards[tempColumn][cards[tempColumn].length - 1].id}.png`
            actHist.setAction(true, tempColumn, draggedColumn, draggedRow);
            break;
          } else {
            actHist.setAction(false, tempColumn, draggedColumn, draggedRow);
            break;
          }
        }
      }


      for (let i = draggedRow + 1, j = 1; i < cards[draggedColumn].length; i++, j++) {
        animate(cards[draggedColumn][i], endX, endY + ((piles[0].clientHeight / 7) * j), endZ + j, 150, undoBtn, true);
        cards[draggedColumn][i].classList.remove("Sticky");
      }

      draggedElement.classList.remove("DraggedCard");
      isDragging = false;
      draggedElement.style.cursor = 'grab';

      if (checkWin(cards)) {
        isPaused = true;
        winAnimation(cards, foundation, undoBtn);
        return;
      } else {
        isPaused = false;
        return;
      }
    }
  }

  actionDown = (e) => {
    if (e.target.classList.contains('Cards') && !isPaused) {
      e.preventDefault();
      isDragging = true;
      draggedCardId = e.target.id;
      draggedElement = e.target;
      draggedElement.classList.add('DraggedCard');

      if (e.touches && e.touches.length > 0) {
        posX = e.touches[0].clientX;
        posY = e.touches[0].clientY;
      } else {
        posX = e.clientX;
        posY = e.clientY;
      }

      offsetX = posX - draggedElement.offsetLeft;
      offsetY = posY - draggedElement.offsetTop;
      originX = draggedElement.offsetLeft;
      originY = draggedElement.offsetTop;
      originZ = draggedElement.style.zIndex;
      draggedElement.style.zIndex = 50;


      for (let i = 0; i < cards.length; i++) {
        for (let j = 0; j < cards[i].length; j++) {

          if (e.target === cards[i][j]) {
            draggedColumn = i;
            draggedRow = j;
            for (let k = j + 1; k < cards[i].length; k++) {
              cards[i][k].classList.add("Sticky");
              cards[i][k].style.zIndex = Number(draggedElement.style.zIndex) + k;
            }
          }
        }
      }
      draggedElement.style.cursor = 'grabbing';
    }
  }

  actionMove = (e) => {
    if (isDragging) {
      e.preventDefault();

      let posX, posY;
      if (e.touches && e.touches.length > 0) {
        posX = e.touches[0].clientX;
        posY = e.touches[0].clientY;
      } else {
        posX = e.clientX;
        posY = e.clientY;
      }

      droppedElementX = posX - offsetX;
      droppedElementY = posY - offsetY;
      draggedElement.style.left = droppedElementX + 'px';
      draggedElement.style.top = droppedElementY + 'px';


      for (let i = draggedRow + 1, j = 0; i < cards[draggedColumn].length; i++, j++) {
        cards[draggedColumn][i].style.top = draggedElement.offsetTop + (piles[0].clientHeight / 7) * (j + 1) + 'px';
        cards[draggedColumn][i].style.left = draggedElement.offsetLeft + 'px';
      }
    }
  }


  resize = () => {
    if (!isPaused) {
      for (let i = 0; i < cards.length; i++) {
        if (cards[i]) {
          if (i < 7) {
            for (let j = 0; j < cards[i].length; j++) {
              cards[i][j].style.top = (piles[i].offsetTop + piles[i].offsetTop / 7 * j) + "px";
              cards[i][j].style.left = piles[i].offsetLeft + "px";
            }
          } else if (i == 7) {
            for (let j = 0; j < cards[i].length; j++) {
              cards[i][j].style.top = stock.offsetTop + "px";
              cards[i][j].style.left = stock.offsetLeft + "px";
            }
          } else if (i > 7) {
            for (let j = 0; j < cards[i].length; j++) {
              cards[i][j].style.top = foundation[i - 8].offsetTop + "px";
              cards[i][j].style.left = foundation[i - 8].offsetLeft + "px";
            }
          }
        }
      }
    }
  }


  document.addEventListener('mousedown', actionDown);
  document.addEventListener('mouseup', actionUp);
  document.addEventListener('click', click);
  document.addEventListener('mousemove', actionMove);

  document.addEventListener('touchstart', actionDown);
  document.addEventListener('touchend', actionUp);
  document.addEventListener('touchmove', actionMove);

  window.addEventListener('resize', resize);


  await resize();
});



loadGame = (cards, container, foundation) => {
  deck = ["AH", "AC", "AD", "AS", "2H", "2C", "2D", "2S", "3H", "3C", "3D", "3S", "4H",
    "4C", "4D", "4S", "5H", "5C", "5D", "5S", "6H", "6C", "6D", "6S", "7H", "7C",
    "7D", "7S", "8H", "8C", "8D", "8S", "9H", "9C", "9D", "9S", "0H", "0C", "0D",
    "0S", "JH", "JC", "JD", "JS", "QH", "QC", "QD", "QS", "KH", "KC", "KD", "KS"]

  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }


  let index = 0;
  let pileElements = container.querySelectorAll('.PileOutline');
  let stock = container.querySelector('.StockOutline');
  pileElements.forEach((pile, count) => {
    for (let i = 0; i <= count; i++) {
      if (!cards[count]) {
        cards[count] = [];
      }
      cards[count][i] = document.createElement('img');
      cards[count][i].id = `${deck[index++]}`
      cards[count][i].style.left = pile.offsetLeft + 'px';
      cards[count][i].style.top = pile.offsetTop + ((pile.clientHeight / 7) * i) + 'px';
      cards[count][i].style.zIndex = 1 + i;
      container.appendChild(cards[count][i]);
      if (i != count) {
        cards[count][i].src = 'img/Back.png';
        cards[count][i].classList.add('InactiveCards');
      } else {
        cards[count][i].src = `img/${cards[count][i].id}.png`;
        cards[count][i].classList.add('Cards');
      }
    }
  });

  for (i = 7; i <= 12; i++) { cards[i] = []; }

  for (let i = 0; index < deck.length; i++, index++) {
    cards[7][i] = document.createElement('img');
    cards[7][i].id = `${deck[index]}`
    cards[7][i].style.left = stock.offsetLeft + 'px';
    cards[7][i].style.top = stock.offsetTop + 'px';
    cards[7][i].style.zIndex = 1 + i;
    container.appendChild(cards[7][i]);
    cards[7][i].src = 'img/Back.png';
    cards[7][i].classList.add('StockCards');
  }
  foundation[1].id = 'S';
  foundation[2].id = 'C';
  foundation[3].id = 'H';
  foundation[4].id = 'D';
}


isStackableTableau = (isClicked, card, draggedCardId, droppedElementX, pile) => {
  let map = {
    "AR": "2B",
    "AB": "2R",
    "2R": "3B",
    "2B": "3R",
    "3R": "4B",
    "3B": "4R",
    "4R": "5B",
    "4B": "5R",
    "5R": "6B",
    "5B": "6R",
    "6R": "7B",
    "6B": "7R",
    "7R": "8B",
    "7B": "8R",
    "8R": "9B",
    "8B": "9R",
    "9R": "0B",
    "9B": "0R",
    "0R": "JB",
    "0B": "JR",
    "JR": "QB",
    "JB": "QR",
    "QR": "KB",
    "QB": "KR",
    "KR": undefined,
    "KB": undefined
  };

  if (card) {
    let scannedCardId = card.id

    if (draggedCardId[1] === 'S' || draggedCardId[1] === 'C') { draggedCardId = draggedCardId.slice(0, 1) + "B" }
    else { draggedCardId = draggedCardId.slice(0, 1) + "R" }

    if (scannedCardId[1] === 'S' || scannedCardId[1] === 'C') { scannedCardId = scannedCardId.slice(0, 1) + "B" }
    else { scannedCardId = scannedCardId.slice(0, 1) + "R" }

    if (isClicked || droppedElementX > card.offsetLeft - card.clientWidth / 2 && droppedElementX < card.offsetLeft + card.clientWidth / 2) {
      if (map[draggedCardId] == scannedCardId && card.classList.contains("Cards") && !card.classList.contains("DraggedCard") && !card.classList.contains("Sticky")) {
        return true;
      } else {
        return false;
      }
    }

  } else if (draggedCardId[0] == 'K' && droppedElementX > pile.offsetLeft - pile.clientWidth / 2 && droppedElementX < pile.offsetLeft + pile.clientWidth / 2) {
    return true;
  } else if (draggedCardId[0] == 'K' && isClicked) {
    return true;
  }
}

isStackableStock = (cards, i, foundation, draggedCardId, draggedColumn, draggedRow) => {
  map = {
    "2C": "AC", "2H": "AH", "2D": "AD", "2S": "AS",
    "3C": "2C", "3H": "2H", "3D": "2D", "3S": "2S",
    "4C": "3C", "4H": "3H", "4D": "3D", "4S": "3S",
    "5C": "4C", "5H": "4H", "5D": "4D", "5S": "4S",
    "6C": "5C", "6H": "5H", "6D": "5D", "6S": "5S",
    "7C": "6C", "7H": "6H", "7D": "6D", "7S": "6S",
    "8C": "7C", "8H": "7H", "8D": "7D", "8S": "7S",
    "9C": "8C", "9H": "8H", "9D": "8D", "9S": "8S",
    "0C": "9C", "0H": "9H", "0D": "9D", "0S": "9S",
    "JC": "0C", "JH": "0H", "JD": "0D", "JS": "0S",
    "QC": "JC", "QH": "JH", "QD": "JD", "QS": "JS",
    "KC": "QC", "KH": "QH", "KD": "QD", "KS": "QS",
    "AC": "", "AH": "", "AD": "", "AS": ""
  };
  if (i >= 9 && i <= 12 && draggedCardId[0] == 'A' && draggedCardId[1] == foundation.id && draggedRow == cards[draggedColumn].length - 1) {
    return true;
  }

  if (i >= 9 && i <= 12 && cards[i].length && map[draggedCardId] == cards[i][cards[i].length - 1].id && draggedRow == cards[draggedColumn].length - 1) {
    return true;
  }


};

checkWin = (cards) => {

  let counter = 0;
  for (let i = 0; i <= 6; i++) {
    if (cards[i]) {
      for (let j = 0; j < cards[i].length; j++) {
        if (!cards[i][j].src.includes('img/Back.png')) {
          counter++;
        }
      }
    }
  }
  for (let i = 9; i <= 12; i++) {
    if (cards[i]) {
      for (let j = 0; j < cards[i].length; j++) {
        counter++;
      }
    }
  }

  if (counter == 52) {
    return true;
  } else {
    return false;
  }
};

winAnimation = async (cards, foundation, undoBtn) => {
  let ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "0", "J", "Q", "K"];
  let suits = ["S", "C", "H", "D"];

  undoBtn.classList.add('InactiveUndo');
  undoBtn.classList.remove('Undo');

  cards.forEach((column) => {
    column.forEach((card) => {
      card.classList.add("InactiveCards")
      card.classList.remove("Cards")
    });
  });


  for (let i = 0; i < ranks.length; i++) {
    for (let j = 0; j < suits.length; j++) {
      const element = document.getElementById(`${ranks[i]}${suits[j]}`)

      for (let m = 1; m < foundation.length; m++) {
        if (foundation[m].id == suits[j] && foundation[m].offsetTop != element.offsetTop) {
          await animate(element, foundation[m].offsetLeft, foundation[m].offsetTop, null, 250, null, false)
          element.style.zIndex = 30 + i;
        }
      }
    }
  }
};

actionUndo = async (cards, piles, foundation, stock, actHist, undoBtn) => {
  let action = actHist.getAction();
  let oldRow = cards[action[1]].length - 1;
  let element = cards[action[2]][action[3]];
  let endX, endY;

  if (action[1] < 7) {
    if (!cards[action[1]].length) {
      endX = piles[action[1]].offsetLeft;
      endY = piles[action[1]].offsetTop;
      endZ = 1;
      animate(element, endX, endY, endZ, 150, undoBtn, true);
    } else {
      endX = cards[action[1]][oldRow].offsetLeft;
      endY = cards[action[1]][oldRow].offsetTop + (cards[action[2]][action[3]].clientHeight / 7);
      endZ = (Number(cards[action[1]][oldRow].style.zIndex) + 1);
      animate(element, endX, endY, endZ, 150, undoBtn, true);
    }

    for (let i = action[3] + 1, j = 1; i < cards[action[2]].length; i++, j++) {
      animate(cards[action[2]][i], endX, endY + ((piles[0].clientHeight / 7) * j), endZ + j, 150, undoBtn, true);
    }

  } else if (action[1] == 7) {
    if (cards[7].length) {
      endZ = Number(cards[7][oldRow].style.zIndex) + 1;
    } else {
      endZ = 1;
    }
    element.src = 'img/Back.png';

    await animate(element, stock.offsetLeft, stock.offsetTop, endZ, 150, undoBtn, true);

    element.classList.add('StockCards');
    element.classList.remove('Cards');
  } else if (action[1] >= 8) {
    if (action[0]) {
      for (let i = cards[7].length - 1, j = 1; i >= 0; i--, j++) {
        cards[8] = cards[8].concat(cards[7][i]);
        cards[7].splice(cards[7].length - 1, 1);

        cards[8][cards[8].length - 1].src = `img/${cards[8][cards[8].length - 1].id}.png`;

        endZ = j;
        await animate(cards[8][cards[8].length - 1], foundation[0].offsetLeft, null, endZ, 50, undoBtn, true);

        cards[8][cards[8].length - 1].classList.add('Cards');
        cards[8][cards[8].length - 1].classList.remove('StockCards');
      }
    } else {
      if (!cards[action[1]][cards[action[1]].length - 1]) {
        endZ = 1;
      } else {
        endZ = (Number(cards[action[1]][cards[action[1]].length - 1].style.zIndex) + 1);
      }

      endX = foundation[action[1] - 8].offsetLeft;
      endY = foundation[action[1] - 8].offsetTop;
      animate(element, endX, endY, endZ, 150, undoBtn, true);
    }
  }

  transferedSection = cards[action[2]].slice(action[3], cards[action[2]].length);
  cards[action[1]] = cards[action[1]].concat(transferedSection);
  cards[action[2]].splice(action[3], cards[action[2]].length - action[3]);


  if (action[0] && action[1] != 8) {
    cards[action[1]][oldRow].src = 'img/Back.png';
    cards[action[1]][oldRow].classList.add('InactiveCards');
    cards[action[1]][oldRow].classList.remove('Cards');
  }
};



const animate = (element, endX, endY, endZ, duration, undoBt, notWinAnim) => {

  return new Promise((resolve) => {
    let startX = element.offsetLeft;
    let startY = element.offsetTop;

    if (notWinAnim) {
      element.classList.add("InactiveCards");
      element.classList.remove("Cards");
    }

    if (undoBt) {
      undoBt.classList.add("InactiveUndo");
      undoBt.classList.remove("Undo");
    }

    element.style.zIndex = 50 + endZ;

    let startTime = performance.now();


    const move = (currentTime) => {
      let elapsedTime = currentTime - startTime;
      let progress = Math.min(elapsedTime / duration, 1);

      let x = startX + (endX - startX) * progress;
      let y = startY + (endY - startY) * progress;

      element.style.left = x + 'px';
      element.style.top = y + 'px';

      if (progress < 1) {
        requestAnimationFrame(move);
      } else {
        if (notWinAnim) {
          element.classList.add("Cards");
          element.classList.remove("InactiveCards");
        }

        if (undoBt) {
          undoBt.classList.add("Undo");
          undoBt.classList.remove("InactiveUndo");
        }

        element.style.zIndex = endZ;

        resolve();
      }
    };

    requestAnimationFrame(move);
  });
};