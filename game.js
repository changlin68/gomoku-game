// 棋子类型常量
export const Piece = {
    EMPTY: 0,
    BLACK: 1,
    WHITE: 2,
};

// 方向向量：水平、垂直、两个对角线
const DIRECTIONS = [
    [0, 1],   // 水平方向
    [1, 0],   // 垂直方向
    [1, 1],   // 主对角线（左上到右下）
    [1, -1],  // 副对角线（右上到左下）
];

/**
 * 五子棋游戏核心类
 * 管理棋盘状态、落子逻辑和胜负判定
 */
export class GomokuGame {
    // 棋盘大小（15x15标准棋盘）
    static BOARD_SIZE = 15;
    // 获胜所需连珠数
    static WIN_COUNT = 5;

    constructor() {
        // 初始化空棋盘（二维数组）
        this.board = Array.from(
            { length: GomokuGame.BOARD_SIZE },
            () => Array(GomokuGame.BOARD_SIZE).fill(Piece.EMPTY)
        );
        // 当前玩家，黑棋先行
        this.currentPlayer = Piece.BLACK;
        // 游戏是否结束
        this.gameOver = false;
        // 记录落子历史，用于悔棋
        this.history = [];
        // 最后一步的位置
        this.lastMove = null;
        // 计时器状态
        this.timerStart = null;
        this.timerEnd = null;
        this.isTiming = false;
    }

    /**
     * 在指定位置落子
     * @param {number} row - 行索引（0-14）
     * @param {number} col - 列索引（0-14）
     * @returns {boolean} 落子是否成功
     */
    placePiece(row, col) {
        // 校验位置有效性
        if (!this.isValidPosition(row, col)) {
            return false;
        }
        // 校验位置是否已被占用
        if (this.board[row][col] !== Piece.EMPTY) {
            return false;
        }
        // 校验游戏是否已结束
        if (this.gameOver) {
            return false;
        }

        // 第一次落子时启动计时
        if (this.history.length === 0) {
            this.startTimer();
        }

        // 放置棋子
        this.board[row][col] = this.currentPlayer;
        // 记录落子历史
        this.history.push({ row, col, player: this.currentPlayer });
        this.lastMove = { row, col };

        // 检查是否获胜
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            this.stopTimer();
            return true;
        }

        // 切换玩家
        this.currentPlayer = this.currentPlayer === Piece.BLACK ? Piece.WHITE : Piece.BLACK;
        return true;
    }

    /**
     * 悔棋：撤销上一步落子
     * @returns {boolean} 悔棋是否成功
     */
    undo() {
        if (this.history.length === 0) {
            return false;
        }

        // 弹出最后一步
        const { row, col, player } = this.history.pop();
        // 清空该位置
        this.board[row][col] = Piece.EMPTY;
        // 恢复当前玩家
        this.currentPlayer = player;
        // 重置游戏结束状态
        this.gameOver = false;

        // 更新最后一步标记
        if (this.history.length > 0) {
            const prev = this.history[this.history.length - 1];
            this.lastMove = { row: prev.row, col: prev.col };
        } else {
            this.lastMove = null;
        }

        return true;
    }

    /**
     * 检查指定位置是否形成五子连珠
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean} 是否获胜
     */
    checkWin(row, col) {
        const player = this.board[row][col];
        if (player === Piece.EMPTY) {
            return false;
        }

        // 四个方向分别检查
        for (const [dr, dc] of DIRECTIONS) {
            let count = 1;

            // 正方向计数
            count += this.countInDirection(row, col, dr, dc, player);
            // 反方向计数
            count += this.countInDirection(row, col, -dr, -dc, player);

            if (count >= GomokuGame.WIN_COUNT) {
                return true;
            }
        }
        return false;
    }

    /**
     * 沿指定方向统计连续同色棋子数
     * @param {number} row - 起始行
     * @param {number} col - 起始列
     * @param {number} dr - 行方向增量
     * @param {number} dc - 列方向增量
     * @param {number} player - 玩家棋子类型
     * @returns {number} 连续棋子数（不含起始点）
     */
    countInDirection(row, col, dr, dc, player) {
        let count = 0;
        let r = row + dr;
        let c = col + dc;

        while (this.isValidPosition(r, c) && this.board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }
        return count;
    }

    /**
     * 判断坐标是否在棋盘范围内
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean}
     */
    isValidPosition(row, col) {
        return (
            row >= 0 &&
            row < GomokuGame.BOARD_SIZE &&
            col >= 0 &&
            col < GomokuGame.BOARD_SIZE
        );
    }

    /**
     * 重新开始游戏
     */
    restart() {
        // 清空棋盘
        this.board = Array.from(
            { length: GomokuGame.BOARD_SIZE },
            () => Array(GomokuGame.BOARD_SIZE).fill(Piece.EMPTY)
        );
        // 重置状态
        this.currentPlayer = Piece.BLACK;
        this.gameOver = false;
        this.history = [];
        this.lastMove = null;
        // 重置计时器
        this.resetTimer();
    }

    /**
     * 启动计时器
     */
    startTimer() {
        this.timerStart = Date.now();
        this.isTiming = true;
    }

    /**
     * 停止计时器
     */
    stopTimer() {
        if (this.isTiming) {
            this.timerEnd = Date.now();
            this.isTiming = false;
        }
    }

    /**
     * 重置计时器
     */
    resetTimer() {
        this.timerStart = null;
        this.timerEnd = null;
        this.isTiming = false;
    }

    /**
     * 获取当前耗时（毫秒）
     * @returns {number}
     */
    getElapsedTime() {
        if (!this.timerStart) {
            return 0;
        }
        const end = this.isTiming ? Date.now() : this.timerEnd;
        return end - this.timerStart;
    }

    /**
     * 将毫秒格式化为 mm:ss
     * @param {number} ms - 毫秒数
     * @returns {string}
     */
    static formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * 获取当前玩家名称
     * @returns {string}
     */
    getCurrentPlayerName() {
        return this.currentPlayer === Piece.BLACK ? "黑棋" : "白棋";
    }

    /**
     * 检查指定位置是否为星位（天元、小目等）
     * @param {number} row - 行索引
     * @param {number} col - 列索引
     * @returns {boolean}
     */
    static isStarPoint(row, col) {
        // 标准五子棋星位坐标
        const starPoints = [
            [3, 3], [3, 7], [3, 11],
            [7, 3], [7, 7], [7, 11],
            [11, 3], [11, 7], [11, 11],
        ];
        return starPoints.some(([r, c]) => r === row && c === col);
    }
}
