import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Sudoku.css';
import { generateSudoku, solveSudoku } from '../utils/sudokuGenerator';

// 添加 isValidMove 函数
const isValidMove = (board, row, col, num) => {
  // 检查行
  for (let x = 0; x < 9; x++) {
    if (board[row][x] === num) return false;
  }

  // 检查列
  for (let x = 0; x < 9; x++) {
    if (board[x][col] === num) return false;
  }

  // 检查3x3方格
  let startRow = row - (row % 3);
  let startCol = col - (col % 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

// 获取某个位置可以填入的所有数字
const getPossibleNumbers = (board, row, col) => {
  const numbers = [];
  for (let num = 1; num <= 9; num++) {
    if (isValidMove(board, row, col, num)) {
      numbers.push(num);
    }
  }
  return numbers;
};

// 找出自由度最小的空格子
const findBestHint = (board) => {
  let minPossibilities = 10;
  let bestCell = null;
  let possibleNumbers = [];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === 0) {
        const numbers = getPossibleNumbers(board, i, j);
        if (numbers.length < minPossibilities) {
          minPossibilities = numbers.length;
          bestCell = { row: i, col: j };
          possibleNumbers = numbers;
        }
      }
    }
  }

  return { cell: bestCell, numbers: possibleNumbers };
};

const Sudoku = () => {
  const [board, setBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [selectedCell, setSelectedCell] = useState(null);
  const [initialBoard, setInitialBoard] = useState(Array(9).fill().map(() => Array(9).fill(0)));
  const [loading, setLoading] = useState(false);
  const [solving, setSolving] = useState(false);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [hintCell, setHintCell] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 生成新游戏的函数使用 useCallback 包装
  const generateNewPuzzle = useCallback(() => {
    setLoading(true);
    requestAnimationFrame(() => {
      try {
        const newBoard = generateSudoku();
        setBoard(newBoard);
        setInitialBoard(JSON.parse(JSON.stringify(newBoard)));
      } catch (error) {
        console.error('生成数独失败:', error);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // 切换主题时更新 body 的类名
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // 检查是否获胜
  const checkWin = useCallback(() => {
    // 检查是否有空格
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) return false;
      }
    }

    // 检查每个数字是否有效
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const temp = board[i][j];
        board[i][j] = 0;
        if (!isValidMove(board, i, j, temp)) {
          board[i][j] = temp;
          return false;
        }
        board[i][j] = temp;
      }
    }

    return true;
  }, [board]);

  // 在数字输入后检查是否获胜
  useEffect(() => {
    if (checkWin()) {
      setShowWinAnimation(true);
      setTimeout(() => setShowWinAnimation(false), 3000);
    }
  }, [board, checkWin]);

  // 先定义回调函数
  const handleErase = useCallback(() => {
    if (selectedCell && initialBoard[selectedCell.row][selectedCell.col] === 0) {
      const newBoard = [...board];
      newBoard[selectedCell.row][selectedCell.col] = 0;
      setBoard(newBoard);
    }
  }, [selectedCell, initialBoard, board]);

  const handleNumberInput = useCallback((number) => {
    if (selectedCell && initialBoard[selectedCell.row]?.[selectedCell.col] === 0 &&
        isValidMove(board, selectedCell.row, selectedCell.col, number)) {
      const newBoard = [...board];
      newBoard[selectedCell.row][selectedCell.col] = number;
      setBoard(newBoard);
    }
  }, [selectedCell, initialBoard, board]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedCell) {
        if (/^[1-9]$/.test(e.key)) {
          e.preventDefault();
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          handleErase();
        } else if (/^[1-9]$/.test(e.key)) {
          handleNumberInput(parseInt(e.key));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, handleErase, handleNumberInput]);

  // 初始化游戏
  useEffect(() => {
    generateNewPuzzle();
  }, [generateNewPuzzle]);

  const handleCellClick = useCallback((row, col) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  }, [initialBoard]);

  const handleShowSolution = useCallback(() => {
    setSolving(true);
    requestAnimationFrame(() => {
      try {
        const solution = JSON.parse(JSON.stringify(board));
        if (solveSudoku(solution)) {
          setBoard(solution);
        } else {
          alert('当前数独无解！');
        }
      } catch (error) {
        console.error('求解数独失败:', error);
      } finally {
        setSolving(false);
      }
    });
  }, [board]);

  const handleHint = useCallback(() => {
    const { cell, numbers } = findBestHint(board);
    if (cell) {
      setHintCell(cell);
      setSelectedCell(cell);
      setTimeout(() => setHintCell(null), 3000);
    }
  }, [board]);

  return (
    <div className={`sudoku-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <button 
        className="theme-toggle" 
        onClick={() => setIsDarkMode(!isDarkMode)}
        title={isDarkMode ? '切换到普通模式' : '切换到夜间模式'}
      >
        {isDarkMode ? '🌞' : '🌙'}
      </button>
      <div className="number-decoration">9</div>
      <div className="number-decoration">1</div>
      {showWinAnimation && (
        <div className="win-animation">
          <div className="win-text">恭喜获胜！🎉</div>
        </div>
      )}
      {loading ? (
        <div className="loading">生成中...</div>
      ) : (
        <>
          <div className="sudoku-board">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="sudoku-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`sudoku-cell ${
                      selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                        ? 'selected'
                        : ''
                    } ${hintCell?.row === rowIndex && hintCell?.col === colIndex
                        ? 'hint'
                        : ''
                    } ${initialBoard[rowIndex]?.[colIndex] !== 0 ? 'initial' : 'player-input'}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="number-pad">
            <button
              className="eraser-btn"
              onClick={handleErase}
            >
              ⌫
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                onClick={() => handleNumberInput(number)}
              >
                {number}
              </button>
            ))}
          </div>
          <div className="button-group">
            <button 
              className="new-game-btn" 
              onClick={generateNewPuzzle}
              disabled={loading || solving}
            >
              {loading ? '生成中...' : '新游戏'}
            </button>
            <button
              className="hint-btn"
              onClick={handleHint}
              disabled={loading || solving}
            >
              提示
            </button>
            <button
              className="solution-btn"
              onClick={handleShowSolution}
              disabled={loading || solving}
            >
              {solving ? '求解中...' : '显示答案'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Sudoku; 