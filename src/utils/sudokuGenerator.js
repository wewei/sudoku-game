// 检查数字在当前位置是否有效
function isValid(board, row, col, num) {
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
}

// 使用回溯法填充数独
function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        // 随机排序1-9的数字
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
          .sort(() => Math.random() - 0.5);
        
        for (let num of numbers) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

// 计算解的数量
function countSolutions(board, limit = 2) {
  let solutions = 0;
  
  function solve(board) {
    if (solutions >= limit) return;
    
    let row = -1;
    let col = -1;
    let isEmpty = false;
    
    // 找到第一个空格
    for (let i = 0; i < 9 && !isEmpty; i++) {
      for (let j = 0; j < 9 && !isEmpty; j++) {
        if (board[i][j] === 0) {
          row = i;
          col = j;
          isEmpty = true;
        }
      }
    }
    
    if (!isEmpty) {
      solutions++;
      return;
    }
    
    for (let num = 1; num <= 9 && solutions < limit; num++) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        solve(board);
        board[row][col] = 0;
      }
    }
  }
  
  solve(JSON.parse(JSON.stringify(board)));
  return solutions;
}

// 生成数独谜题
export function generateSudoku() {
  // 创建空板
  const board = Array(9).fill().map(() => Array(9).fill(0));
  
  // 随机填入一些初始数字（对角线上的3x3方格）
  for (let i = 0; i < 9; i += 3) {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
    let index = 0;
    for (let row = i; row < i + 3; row++) {
      for (let col = i; col < i + 3; col++) {
        board[row][col] = numbers[index++];
      }
    }
  }

  // 填充剩余的格子
  fillBoard(board);
  
  // 复制完整的解
  const puzzle = JSON.parse(JSON.stringify(board));
  const positions = Array.from({ length: 81 }, (_, i) => ({
    row: Math.floor(i / 9),
    col: i % 9
  })).sort(() => Math.random() - 0.5);
  
  // 逐个尝试移除数字，确保保持唯一解
  for (const pos of positions) {
    const { row, col } = pos;
    const temp = puzzle[row][col];
    puzzle[row][col] = 0;
    
    // 如果移除后解不唯一，恢复该数字
    if (countSolutions(puzzle) !== 1) {
      puzzle[row][col] = temp;
    }
  }

  return puzzle;
}

// 生成完整的数独解决方案
export function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
} 