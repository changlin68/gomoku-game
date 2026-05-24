import { GomokuGame, Piece } from "./game.js";

// DOM 元素引用
const boardEl = document.getElementById("board");
const currentPlayerEl = document.getElementById("current-player");
const winnerEl = document.getElementById("winner");
const restartBtn = document.getElementById("restart-btn");
const undoBtn = document.getElementById("undo-btn");
const timerEl = document.getElementById("timer");

// 游戏实例
let game = new GomokuGame();
// 计时器轮询 ID
let timerInterval = null;

/**
 * 初始化棋盘 UI
 */
function initBoard() {
    boardEl.innerHTML = "";

    for (let row = 0; row < GomokuGame.BOARD_SIZE; row++) {
        for (let col = 0; col < GomokuGame.BOARD_SIZE; col++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            cell.dataset.row = row;
            cell.dataset.col = col;

            // 标记星位点
            if (GomokuGame.isStarPoint(row, col)) {
                cell.classList.add("star-point");
            }

            // 绑定点击事件
            cell.addEventListener("click", () => handleCellClick(row, col));
            boardEl.appendChild(cell);
        }
    }
}

/**
 * 处理格子点击事件
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 */
function handleCellClick(row, col) {
    if (!game.placePiece(row, col)) {
        return;
    }

    // 渲染新放置的棋子
    renderPiece(row, col, game.history[game.history.length - 1].player);

    // 更新最后一步标记
    updateLastMoveMarker();

    // 检查是否获胜
    if (game.gameOver) {
        const winner = game.getCurrentPlayerName();
        const elapsed = GomokuGame.formatTime(game.getElapsedTime());
        winnerEl.textContent = `${winner} 获胜！`;
        currentPlayerEl.textContent = "";
        timerEl.textContent = `用时：${elapsed}`;
        stopTimerUpdate();
        undoBtn.disabled = true;
        boardEl.classList.add("game-over");
        return;
    }

    // 更新当前玩家显示
    currentPlayerEl.textContent = `当前玩家：${game.getCurrentPlayerName()}`;

    // 第一次落子后启动计时器 UI 更新
    if (game.history.length === 1) {
        startTimerUpdate();
    }
}

/**
 * 在指定位置渲染棋子
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @param {number} player - 棋子类型
 */
function renderPiece(row, col, player) {
    const cell = getCell(row, col);
    if (!cell) return;

    cell.classList.add("occupied");

    const piece = document.createElement("div");
    piece.className = `piece ${player === Piece.BLACK ? "black" : "white"}`;
    cell.appendChild(piece);
}

/**
 * 更新最后一步的标记显示
 */
function updateLastMoveMarker() {
    // 清除所有已有标记
    document.querySelectorAll(".piece.last-move").forEach((el) => {
        el.classList.remove("last-move");
    });

    // 标记新的最后一步
    if (game.lastMove) {
        const { row, col } = game.lastMove;
        const cell = getCell(row, col);
        const piece = cell?.querySelector(".piece");
        if (piece) {
            piece.classList.add("last-move");
        }
    }
}

/**
 * 根据坐标获取对应格子 DOM 元素
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @returns {HTMLElement|null}
 */
function getCell(row, col) {
    return boardEl.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

/**
 * 重新开始游戏
 */
function handleRestart() {
    game.restart();
    winnerEl.textContent = "";
    currentPlayerEl.textContent = "当前玩家：黑棋";
    timerEl.textContent = "时间：00:00";
    stopTimerUpdate();
    undoBtn.disabled = false;
    boardEl.classList.remove("game-over");
    initBoard();
}

/**
 * 悔棋处理
 */
function handleUndo() {
    if (!game.undo()) {
        return;
    }

    // 移除最后一颗棋子
    if (game.history.length >= 0) {
        const last = game.history.length > 0
            ? game.history[game.history.length - 1]
            : null;

        // 如果有悔棋前的最后一步，重新渲染
        if (last) {
            // 不需要重新创建，只需更新标记
        }
    }

    // 找到被撤销的那一步对应的格子，移除棋子
    const { row, col } = game.lastMove
        ? { row: game.lastMove.row, col: game.lastMove.col }
        : { row: -1, col: -1 };

    // 找到之前被撤销的棋子位置（历史记录弹出前的最后一步）
    // 由于 undo() 已经弹出了最后一步，我们需要找被弹出的那个
    // 这里简单处理：重新根据 board 状态渲染
    refreshBoard();

    winnerEl.textContent = "";
    currentPlayerEl.textContent = `当前玩家：${game.getCurrentPlayerName()}`;
    undoBtn.disabled = false;
    boardEl.classList.remove("game-over");
    updateLastMoveMarker();
}

/**
 * 根据当前 board 状态刷新整个棋盘 UI
 */
function refreshBoard() {
    for (let row = 0; row < GomokuGame.BOARD_SIZE; row++) {
        for (let col = 0; col < GomokuGame.BOARD_SIZE; col++) {
            const cell = getCell(row, col);
            const existingPiece = cell.querySelector(".piece");

            if (game.board[row][col] === Piece.EMPTY) {
                // 空位：移除棋子和占用标记
                if (existingPiece) {
                    existingPiece.remove();
                }
                cell.classList.remove("occupied");
            } else if (!existingPiece) {
                // 有棋子但无 DOM：创建棋子
                renderPiece(row, col, game.board[row][col]);
            }
        }
    }
}

/**
 * 启动计时器 UI 轮询更新
 */
function startTimerUpdate() {
    stopTimerUpdate();
    timerInterval = setInterval(() => {
        timerEl.textContent = `时间：${GomokuGame.formatTime(game.getElapsedTime())}`;
    }, 500);
}

/**
 * 停止计时器 UI 轮询更新
 */
function stopTimerUpdate() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 绑定按钮事件
restartBtn.addEventListener("click", handleRestart);
undoBtn.addEventListener("click", handleUndo);

// 初始化游戏
initBoard();
