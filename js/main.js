// Game constants
const CELL_EMPTY = 0;
const CELL_CROSS = -1;
const CELL_CIRCLE = 1;

const NOT_STARTED = 'NOT_STARTED';
const GAME_STARTED = 'GAME_STARTED';
const GAME_FINISHED = 'GAME_FINISHED';

const CROSS_SIGN = 'CROSS';
const CIRCLE_SIGN = 'CIRCLE';

// User Interface controller
const UIController = (function() {
  const selectors = {
    gameContainer: '.game',
    startBtn: '#start-btn',
    nameInput1: '#player-1',
    nameInput2: '#player-2',
    errorMessage: '.error',
    activePlayer: '#active-player',
    grid: '.grid',
    gridCell: '.grid__cell',
    cancelButton: '#cancel-button'
  };

  function validateNames() {
    const nameInput1 = document.querySelector(selectors.nameInput1),
      nameInput2 = document.querySelector(selectors.nameInput2);

    if (!nameInput1.value.length || !nameInput2.value.length) {
      const el = document.querySelector(selectors.errorMessage);

      if (!el) {
        const errorEl = document.createElement('p');
        errorEl.className = 'error';
        errorEl.textContent = 'Имена не могут быть пустыми';

        document.querySelector(selectors.gameContainer).appendChild(errorEl);
      }

      return false;
    }

    return true;
  }

  function getNames() {
    const nameInput1 = document.querySelector(selectors.nameInput1),
      nameInput2 = document.querySelector(selectors.nameInput2);

    return [nameInput1.value, nameInput2.value];
  }

  function changeStage(stage) {
    const gameContainer = document.querySelector(selectors.gameContainer);

    if (stage === NOT_STARTED) {
      gameContainer.innerHTML = `
        <h1 class="game__title">
          Крестики-нолики
        </h1>
        <div class="form">
          <input
            type="text"
            class="form__input"
            id="player-1"
            placeholder="Имя первого игрока"
          />
          <input
            type="text"
            class="form__input"
            id="player-2"
            placeholder="Имя второго игрока"
          />
        </div>
        <button class="game__btn" id="start-btn">
          Начать игру
        </button>
      `;
    } else if (stage === GAME_STARTED) {
      gameContainer.innerHTML = `
        <p class="game__status">
          Ход игрока: <span class="game__player-name" id="active-player"></span>
        </p>

        <div class="grid">
          <div class="grid__row">
            <div class="grid__cell" data-row="1" data-col="1"></div>
            <div class="grid__cell" data-row="1" data-col="2"></div>
            <div class="grid__cell" data-row="1" data-col="3"></div>
          </div>
          <div class="grid__row">
            <div class="grid__cell" data-row="2" data-col="1"></div>
            <div class="grid__cell" data-row="2" data-col="2"></div>
            <div class="grid__cell" data-row="2" data-col="3"></div>
          </div>
          <div class="grid__row">
            <div class="grid__cell" data-row="3" data-col="1"></div>
            <div class="grid__cell" data-row="3" data-col="2"></div>
            <div class="grid__cell" data-row="3" data-col="3"></div>
          </div>
        </div>

        <button class="game__btn" id="cancel-button">
          Завершить
        </button>
      `;
    } else if (stage === GAME_FINISHED) {
      gameContainer.innerHTML = `
        <!-- <p class="game__result">
          Победил игрок: <span class="game__player-name">Player</span>!
        </p>
        <button class="game__btn">
          Начать заново!
        </button> -->
      `;
    }
  }

  function renderActivePlayer(playerName) {
    document.querySelector(selectors.activePlayer).textContent = playerName;
  }

  function renderSign(el, sign) {
    const className =
      sign === CROSS_SIGN ? 'grid__cell--cross' : 'grid__cell--circle';

    el.classList.add(className);
  }

  return {
    getSelectors: () => selectors,
    getElement: selector => document.querySelector(selector),
    changeStage,
    validateNames,
    getNames,
    renderActivePlayer,
    renderSign
  };
})();

// Game controller
const GameController = (function() {
  let state = {
    gameStage: NOT_STARTED,
    board: [
      [CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
      [CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
      [CELL_EMPTY, CELL_EMPTY, CELL_EMPTY]
    ],
    players: [],
    activePlayer: null,
    activeSign: null
  };

  function setCell(row, col) {
    sign = state.activeSign === CROSS_SIGN ? CELL_CROSS : CELL_CIRCLE;

    state.board[row][col] = sign;
  }

  function checkCellIfEmpty(row, col) {
    if (state.board[row][col] === CELL_EMPTY) return true;
    return false;
  }

  function resetGame() {
    state = {
      gameStage: NOT_STARTED,
      board: [
        [CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
        [CELL_EMPTY, CELL_EMPTY, CELL_EMPTY],
        [CELL_EMPTY, CELL_EMPTY, CELL_EMPTY]
      ],
      players: [],
      activePlayer: null,
      activeSign: null
    };
  }

  function checkWinCondition() {
    const winCondition = state.activeSign === CROSS_SIGN ? -3 : 3;

    return (
      checkRows(winCondition) ||
      checkCols(winCondition) ||
      checkDiags(winCondition)
    );
  }

  function checkRows(winCondition) {
    for (let row = 0; row < 3; row++) {
      let sum = 0;

      for (let col = 0; col < 3; col++) {
        sum += state.board[row][col];
      }

      if (sum === winCondition) return true;
    }

    return false;
  }

  function checkCols(winCondition) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;

      for (let row = 0; row < 3; row++) {
        sum += state.board[row][col];
      }

      if (sum === winCondition) return true;
    }

    return false;
  }

  function checkDiags(winCondition) {
    return (
      state.board[0][0] + state.board[1][1] + state.board[2][2] ===
        winCondition ||
      state.board[0][2] + state.board[1][1] + state.board[2][0] === winCondition
    );
  }

  return {
    getState: () => ({ ...state }),
    setStage: stage => (state.gameStage = stage),
    setPlayers: players => (state.players = players),
    setActivePlayer: playerIdx => (state.activePlayer = playerIdx),
    getActivePlayer: () => state.activePlayer,
    getActivePlayerName: () => state.players[state.activePlayer],
    setActiveSign: sign => (state.activeSign = sign),
    getActiveSign: () => state.activeSign,
    chooseWhosFirst: () => Math.round(Math.random()),
    setCell,
    checkCellIfEmpty,
    resetGame,
    checkWinCondition
  };
})();

// Main application controller
const App = (function(UIController, GameController) {
  function setListenerOnStartButton() {
    const btn = UIController.getElement(UIController.getSelectors().startBtn);

    btn.addEventListener('click', handleStartButtonClick);
  }

  function clearListenerOnStartButton() {
    const btn = UIController.getElement(UIController.getSelectors().startBtn);

    btn.removeEventListener('click');
  }

  function handleStartButtonClick() {
    const check = UIController.validateNames();

    if (check) {
      console.log('Game started');

      const playerNames = UIController.getNames();
      GameController.setPlayers(playerNames);
      GameController.setActivePlayer(GameController.chooseWhosFirst());
      GameController.setActiveSign(CIRCLE_SIGN);

      clearListenerOnStartButton();

      GameController.setStage(GAME_STARTED);
      UIController.changeStage(GAME_STARTED);

      UIController.renderActivePlayer(GameController.getActivePlayerName());

      // Event listener on grid cell click
      UIController.getElement(
        UIController.getSelectors().grid
      ).addEventListener('click', handleGridClick);

      // Event listener on cancel button click
      UIController.getElement(
        UIController.getSelectors().cancelButton
      ).addEventListener('click', handleCancelButtonClick);
    }
  }

  function handleGridClick(e) {
    const cell = e.target.closest(UIController.getSelectors().gridCell);
    const row = cell.dataset.row - 1,
      col = cell.dataset.col - 1;

    if (GameController.checkCellIfEmpty(row, col)) {
      const sign = GameController.getActiveSign();

      // Set sign in board array
      GameController.setCell(row, col);

      // Change sign in the UI
      UIController.renderSign(cell, sign);

      // Check if player has won
      const check = GameController.checkWinCondition();

      if (check) console.log(GameController.getActivePlayerName(), ' has won!');

      // Change active player & active sign
      GameController.setActivePlayer(+!GameController.getActivePlayer());
      UIController.renderActivePlayer(GameController.getActivePlayerName());

      GameController.setActiveSign(
        sign === CROSS_SIGN ? CIRCLE_SIGN : CROSS_SIGN
      );
    }
  }

  function handleCancelButtonClick() {
    console.log('Reseting game..');

    GameController.resetGame();
    clearListenerOnGridClick();

    GameController.setStage(NOT_STARTED);
    UIController.changeStage(NOT_STARTED);

    setListenerOnStartButton();
  }

  function clearListenerOnStartButton() {
    const btn = UIController.getElement(UIController.getSelectors().startBtn);

    btn.removeEventListener('click', handleStartButtonClick);
  }

  function clearListenerOnGridClick() {
    const grid = UIController.getElement(UIController.getSelectors().grid);

    grid.removeEventListener('click', handleGridClick);
  }

  return {
    init() {
      console.log('App initialized..');

      setListenerOnStartButton();
    }
  };
})(UIController, GameController);

App.init();
