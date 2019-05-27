// Game constants
const CELL_EMPTY = 0;
const CELL_CROSS = -1;
const CELL_CIRCLE = 1;

const NOT_STARTED = 'NOT_STARTED';
const GAME_STARTED = 'GAME_STARTED';

const CROSS_SIGN = 'CROSS';
const CIRCLE_SIGN = 'CIRCLE';

const DIR_ROW = 'DIR_ROW';
const DIR_COL = 'DIR_COL';
const DIR_DIAG = 'DIR_DIAG';

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
    cancelButton: '#cancel-button',
    gameStatus: '.game__status'
  };

  /**
   * Validate user inputs
   */
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

  /**
   * Get user inputs
   */
  function getNames() {
    const nameInput1 = document.querySelector(selectors.nameInput1),
      nameInput2 = document.querySelector(selectors.nameInput2);

    return [nameInput1.value, nameInput2.value];
  }

  /**
   * Change user interface depending on stage
   * @param {String} stage
   */
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
    }
  }

  /**
   * Display active user name
   * @param {String} playerName
   */
  function renderActivePlayerName(playerName) {
    document.querySelector(selectors.activePlayer).textContent = playerName;
  }

  /**
   * Change cell's class which corresponds to a sign
   * @param {Node} el
   * @param {String} sign
   */
  function renderSign(el, sign) {
    const className =
      sign === CROSS_SIGN ? 'grid__cell--cross' : 'grid__cell--circle';

    el.classList.add(className);
  }

  /**
   * Highlight winning cells and display winner name
   * @param {Object} res
   * @param {String} playerName
   */
  function renderGameOver(res, playerName) {
    const cells = document.querySelectorAll(selectors.gridCell);

    if (res.direction === DIR_ROW) {
      for (let col = 0; col < 3; col++) {
        cells[res.index + col + 2 * res.index].classList.add(
          'grid__cell--success'
        );
      }
    } else if (res.direction === DIR_COL) {
      for (let row = 0; row < 3; row++) {
        cells[row + res.index + 2 * row].classList.add('grid__cell--success');
      }
    } else {
      res.index.forEach(([row, col]) =>
        cells[row + col + 2 * row].classList.add('grid__cell--success')
      );
    }

    document.querySelector(selectors.gameStatus).innerHTML = `
      Победил игрок:
      <span class="game__player-name" id="active-player">${playerName}</span>
    `;
  }

  /**
   * Display draw
   */
  function renderDraw() {
    document.querySelector(selectors.gameStatus).innerHTML = `
      Ничья!
    `;
  }

  return {
    getSelectors: () => selectors,
    getElement: selector => document.querySelector(selector),
    changeStage,
    validateNames,
    getNames,
    renderActivePlayerName,
    renderSign,
    renderGameOver,
    renderDraw
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

  /**
   * Set corresponding sign to cell at [row][col]
   * @param {Integer} row
   * @param {Integer} col
   */
  function setCell(row, col) {
    sign = state.activeSign === CROSS_SIGN ? CELL_CROSS : CELL_CIRCLE;

    state.board[row][col] = sign;
  }

  /**
   * Check if cell at [row][col] is empty
   * @param {Integer} row
   * @param {Integer} col
   */
  function isCellEmpty(row, col) {
    if (state.board[row][col] === CELL_EMPTY) return true;
    return false;
  }

  /**
   * Reset game and state
   */
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

  /**
   * Check if active player has won
   */
  function checkWinCondition() {
    const winCondition = state.activeSign === CROSS_SIGN ? -3 : 3;

    const rows = checkRows(winCondition),
      cols = checkCols(winCondition),
      diags = checkDiags(winCondition);

    if (rows.won) return rows;
    if (cols.won) return cols;
    if (diags.won) return diags;

    return { won: false };
  }

  /**
   * Check rows for correct sum
   * @param {Integer} winCondition
   */
  function checkRows(winCondition) {
    for (let row = 0; row < 3; row++) {
      let sum = 0;

      for (let col = 0; col < 3; col++) {
        sum += state.board[row][col];
      }

      if (sum === winCondition)
        return {
          won: true,
          direction: DIR_ROW,
          index: row
        };
    }

    return { won: false };
  }

  /**
   * Check columns for correct sum
   * @param {Integer} winCondition
   */
  function checkCols(winCondition) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;

      for (let row = 0; row < 3; row++) {
        sum += state.board[row][col];
      }

      if (sum === winCondition)
        return {
          won: true,
          direction: DIR_COL,
          index: col
        };
    }

    return { won: false };
  }

  /**
   * Check diagonals for correct sum
   * @param {Integer} winCondition
   */
  function checkDiags(winCondition) {
    const res = {
      won: false,
      direction: DIR_DIAG,
      index: null
    };

    if (
      state.board[0][0] + state.board[1][1] + state.board[2][2] ===
      winCondition
    )
      return {
        ...res,
        won: true,
        index: [[0, 0], [1, 1], [2, 2]]
      };

    if (
      state.board[0][2] + state.board[1][1] + state.board[2][0] ===
      winCondition
    )
      return {
        ...res,
        won: true,
        index: [[0, 2], [1, 1], [2, 0]]
      };

    return { won: false };
  }

  /**
   * Check if game ended with draw
   */
  function checkDraw() {
    let draw = true;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (state.board[i][j] === CELL_EMPTY) draw = false;
      }
    }

    return draw;
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
    isCellEmpty,
    resetGame,
    checkWinCondition,
    checkDraw
  };
})();

// Main application controller
const App = (function(UIController, GameController) {
  /**
   * Set event listener on start button click
   */
  function setListenerOnStartButton() {
    UIController.getElement(
      UIController.getSelectors().startBtn
    ).addEventListener('click', handleStartButtonClick);
  }

  /**
   * Set event listener on grid click
   */
  function setListenerOnGrid() {
    UIController.getElement(UIController.getSelectors().grid).addEventListener(
      'click',
      handleGridClick
    );
  }

  /**
   * Set event listener on cancel button click
   */
  function setListenerOnCancelButton() {
    UIController.getElement(
      UIController.getSelectors().cancelButton
    ).addEventListener('click', handleCancelButtonClick);
  }

  function handleStartButtonClick() {
    const checkNames = UIController.validateNames();

    if (checkNames) {
      console.log('Game started');

      const playerNames = UIController.getNames();
      GameController.setPlayers(playerNames);
      GameController.setActivePlayer(GameController.chooseWhosFirst());
      GameController.setActiveSign(CIRCLE_SIGN);

      clearListenerOnStartButton();

      GameController.setStage(GAME_STARTED);
      UIController.changeStage(GAME_STARTED);

      UIController.renderActivePlayerName(GameController.getActivePlayerName());

      // Event listener on grid cell click
      setListenerOnGrid();

      // Event listener on cancel button click
      setListenerOnCancelButton();
    }
  }

  function handleGridClick(e) {
    const cell = e.target.closest(UIController.getSelectors().gridCell);
    const row = cell.dataset.row - 1,
      col = cell.dataset.col - 1;

    if (GameController.isCellEmpty(row, col)) {
      const sign = GameController.getActiveSign();

      // Set sign in board array
      GameController.setCell(row, col);

      // Change sign in the UI
      UIController.renderSign(cell, sign);

      // Check if player has won
      const res = GameController.checkWinCondition();

      if (res.won) {
        // Player has won
        handleGameOver(res);
      } else if (GameController.checkDraw()) {
        // Noone has won
        handleDraw();
      } else {
        // Game continues
        // Change active player & active sign
        GameController.setActivePlayer(+!GameController.getActivePlayer());
        UIController.renderActivePlayerName(
          GameController.getActivePlayerName()
        );

        GameController.setActiveSign(
          sign === CROSS_SIGN ? CIRCLE_SIGN : CROSS_SIGN
        );
      }
    }
  }

  function handleCancelButtonClick() {
    console.log('Reseting game..');

    GameController.resetGame();
    clearListenerOnGridClick();

    GameController.setStage(NOT_STARTED);
    UIController.changeStage(NOT_STARTED);

    setListenerOnStartButton();
    clearListenerOnCancelButton();
  }

  /**
   * Handle game over stage
   * @param {Object} res
   */
  function handleGameOver(res) {
    const playerName = GameController.getActivePlayerName();

    UIController.renderGameOver(res, playerName);

    clearListenerOnGridClick();
  }

  /**
   * Handle draw stage
   */
  function handleDraw() {
    UIController.renderDraw();

    clearListenerOnGridClick();
  }

  /**
   * Remove event listener from start button
   */
  function clearListenerOnStartButton() {
    UIController.getElement(
      UIController.getSelectors().startBtn
    ).removeEventListener('click', handleStartButtonClick);
  }

  /**
   * Remove event listener from grid
   */
  function clearListenerOnGridClick() {
    UIController.getElement(
      UIController.getSelectors().grid
    ).removeEventListener('click', handleGridClick);
  }

  /**
   * Remove event listener from cancel button
   */
  function clearListenerOnCancelButton() {
    UIController.getElement(
      UIController.getSelectors().cancelButton
    ).removeEventListener('click', handleCancelButtonClick);
  }

  return {
    /**
     * Main initialization function
     */
    init() {
      console.log('App initialized..');

      setListenerOnStartButton();
    }
  };
})(UIController, GameController);

App.init();
