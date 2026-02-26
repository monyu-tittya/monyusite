document.addEventListener('DOMContentLoaded', () => {
    const gameLinks = document.querySelectorAll('.games-list a');
    const statusText = document.getElementById('status-text');
    let isHovering = false;
    let lastTappedLink = null;
    let tapTimeout = null;

    // basic touch detection
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    gameLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            if (isTouchDevice) return; // スマホではホバーのツールチップ処理を無視
            const description = e.currentTarget.getAttribute('data-description');
            if (description) {
                if (statusText) statusText.textContent = description;
                isHovering = true;
            }
        });

        link.addEventListener('mouseleave', () => {
            if (isTouchDevice) return;
            if (statusText) statusText.textContent = 'Ready';
            isHovering = false;
        });

        // モバイル向けタップ制御（1回目で説明、2回目で飛ぶ）
        link.addEventListener('click', (e) => {
            if (isTouchDevice) {
                if (lastTappedLink !== link) {
                    // 1回目のタップ
                    e.preventDefault();

                    // リセット
                    gameLinks.forEach(l => {
                        l.style.backgroundColor = '';
                        l.style.color = '';
                    });

                    // 選択状態
                    link.style.backgroundColor = '#000080';
                    link.style.color = '#fff';

                    const description = link.getAttribute('data-description');
                    if (statusText) statusText.textContent = description;

                    lastTappedLink = link;

                    clearTimeout(tapTimeout);
                    tapTimeout = setTimeout(() => {
                        lastTappedLink = null;
                        link.style.backgroundColor = '';
                        link.style.color = '';
                        if (statusText) statusText.textContent = 'Ready';
                    }, 5000);
                } else {
                    // 2回目タップで通常遷移
                    clearTimeout(tapTimeout);
                    lastTappedLink = null;
                    if (statusText) statusText.textContent = 'Opening link...';
                }
            } else {
                if (statusText) statusText.textContent = 'Opening link...';
            }
        });
    });

    // Dummy Close button interaction for visual effect
    const closeBtn = document.querySelector('.title-bar-controls button');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            alert("※このウィンドウは閉じられません");
        });
    }

    // Hit Counter implementation using Vercel Serverless Function & KV
    const counterContainer = document.getElementById('hit-counter');
    if (counterContainer) {
        // A base "starting" number for the retro feel
        const baseVisits = 0;

        // Fetch from our Vercel Serverless API function
        fetch('/api/counter')
            .then(res => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then(data => {
                if (data.visits !== undefined) {
                    const totalVisits = baseVisits + data.visits;

                    // Pad the number to 6 digits (e.g. 013843)
                    const countString = String(totalVisits).padStart(6, '0');

                    // Clear existing digits
                    counterContainer.innerHTML = '';

                    // Create span elements for each digit to match the retro CSS structure
                    for (let digit of countString) {
                        const span = document.createElement('span');
                        span.textContent = digit;
                        counterContainer.appendChild(span);
                    }
                }
            })
            .catch(err => {
                console.warn('Vercel KV counter failed to load:', err);
                // Fallback display if API fails
                counterContainer.innerHTML = '<span>E</span><span>R</span><span>R</span><span>O</span><span>R</span>';
            });
    }

    // Crow interference feature
    const charImg = document.getElementById('character-img');
    const crowImg = document.getElementById('crow-img');

    if (charImg && crowImg) {
        let isCrowVisible = false;

        document.addEventListener('mousemove', (e) => {
            if (isCrowVisible) {
                // Adjust position so the crow centers on the cursor
                crowImg.style.top = (e.clientY - 75) + 'px';
                crowImg.style.left = (e.clientX - 75) + 'px';
            }
        });

        charImg.addEventListener('click', (e) => {
            if (!isCrowVisible) {
                isCrowVisible = true;

                crowImg.style.top = (e.clientY - 75) + 'px';
                crowImg.style.left = (e.clientX - 75) + 'px';

                crowImg.classList.add('fly-in');

                // Crow leaves after 3.5 seconds
                setTimeout(() => {
                    crowImg.classList.remove('fly-in');
                    // Remove the inline styling so it goes back off-screen or fades out
                    crowImg.style.top = '';
                    crowImg.style.left = '';
                    isCrowVisible = false;
                }, 3500);
            }
        });
    }

    // Speech Bubble feature (Every 1 minute)
    const speechBubble = document.getElementById('speech-bubble');
    if (speechBubble && charImg) {
        const lines = [
            "おなかすいたな～",
            "ひま～",
            "なにしてあそぼうかな～",
            "さとし～さ～",
            "ブラックはどこかな～"
        ];

        setInterval(() => {
            // Pick a random line
            const randomLine = lines[Math.floor(Math.random() * lines.length)];
            speechBubble.innerHTML = randomLine.replace(/\n/g, '<br>');

            // Show the bubble
            speechBubble.classList.add('active');

            // Hide after 2 seconds
            setTimeout(() => {
                speechBubble.classList.remove('active');
            }, 2000);
        }, 60000); // 60000ms = 1 minute
    }

    // =====================================
    // Minesweeper Logic (Win95 Style)
    // =====================================
    const msBtn = document.getElementById('minesweeper-btn');
    const msModal = document.getElementById('minesweeper-modal');
    const msCloseBtn = document.getElementById('ms-close-btn');
    const msGrid = document.getElementById('ms-grid');
    const msMineCount = document.getElementById('ms-mine-count');
    const msTimerDisplay = document.getElementById('ms-timer');
    const msResetBtn = document.getElementById('ms-reset-btn');
    const msFaceEmoji = document.getElementById('ms-face-emoji');

    if (msBtn && msModal) {
        let rows = 9, cols = 9, totalMines = 10;
        let board = [];
        let gameOver = false;
        let firstClick = true;
        let flagsPlaced = 0;
        let timer = 0;
        let timerInterval = null;

        // スマホ用長押し判定変数
        let longPressTimer = null;
        let isLongPress = false;

        function updateCounterDisplay(element, value) {
            element.textContent = String(Math.max(0, value)).padStart(3, '0');
        }

        function initMinesweeper() {
            board = [];
            gameOver = false;
            firstClick = true;
            flagsPlaced = 0;
            timer = 0;
            clearInterval(timerInterval);
            msFaceEmoji.textContent = '😊';
            updateCounterDisplay(msMineCount, totalMines);
            updateCounterDisplay(msTimerDisplay, 0);
            msGrid.innerHTML = '';

            // Create empty board
            for (let r = 0; r < rows; r++) {
                let row = [];
                for (let c = 0; c < cols; c++) {
                    row.push({
                        r, c,
                        isMine: false,
                        isRevealed: false,
                        isFlagged: false,
                        neighborMines: 0
                    });

                    const cellHtml = document.createElement('div');
                    cellHtml.className = 'ms-cell';
                    cellHtml.dataset.r = r;
                    cellHtml.dataset.c = c;

                    // Events for PC
                    cellHtml.addEventListener('mousedown', handleCellMouseDown);
                    cellHtml.addEventListener('mouseup', handleCellMouseUp);
                    cellHtml.addEventListener('contextmenu', (e) => e.preventDefault());

                    // Events for Mobile (Long press for flag)
                    cellHtml.addEventListener('touchstart', handleTouchStart, { passive: false });
                    cellHtml.addEventListener('touchend', handleTouchEnd);
                    cellHtml.addEventListener('touchmove', handleTouchMove);

                    msGrid.appendChild(cellHtml);
                }
                board.push(row);
            }
        }

        function placeMines(firstR, firstC) {
            let minesToPlace = totalMines;
            while (minesToPlace > 0) {
                let r = Math.floor(Math.random() * rows);
                let c = Math.floor(Math.random() * cols);
                // Don't place mine on first click or already placed mine
                if (!board[r][c].isMine && !(Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1)) {
                    board[r][c].isMine = true;
                    minesToPlace--;
                }
            }
            // Calculate neighbors
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (!board[r][c].isMine) {
                        board[r][c].neighborMines = countNeighborMines(r, c);
                    }
                }
            }
        }

        function countNeighborMines(r, c) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    let nr = r + dr;
                    let nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isMine) {
                        count++;
                    }
                }
            }
            return count;
        }

        function getCellHtml(r, c) {
            return msGrid.children[r * cols + c];
        }

        function handleCellMouseDown(e) {
            if (gameOver || isLongPress) return;
            // Left click = 0, Right click = 2
            if (e.button === 0) {
                msFaceEmoji.textContent = '😮';
            }
        }

        function handleCellMouseUp(e) {
            // isLongPress flag protection for mobile
            if (isLongPress) {
                setTimeout(() => isLongPress = false, 50);
                return;
            }
            if (gameOver) return;
            msFaceEmoji.textContent = '😊';

            const r = parseInt(e.target.dataset.r);
            const c = parseInt(e.target.dataset.c);

            // Right click
            if (e.button === 2) {
                toggleFlag(r, c);
                return;
            }

            // Left click
            if (e.button === 0) {
                if (!board[r][c].isFlagged) {
                    revealCell(r, c);
                }
            }
        }

        // スマホ用タッチイベントハンドラ
        function handleTouchStart(e) {
            if (gameOver) return;
            e.preventDefault(); // マウスイベントの二重発火防止
            msFaceEmoji.textContent = '😮';
            isLongPress = false;

            const r = parseInt(e.target.dataset.r);
            const c = parseInt(e.target.dataset.c);

            // 長押しタイマー開始 (400ms)
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                toggleFlag(r, c);
                if (navigator.vibrate) navigator.vibrate(50); // ブルッと震える
                msFaceEmoji.textContent = '😊';
            }, 400);
        }

        function handleTouchEnd(e) {
            if (gameOver) return;
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
            msFaceEmoji.textContent = '😊';

            // 長押し判定されていなければ通常の左クリック扱い
            if (!isLongPress) {
                const r = parseInt(e.target.dataset.r);
                const c = parseInt(e.target.dataset.c);
                if (!board[r][c].isFlagged) {
                    revealCell(r, c);
                }
            }
        }

        function handleTouchMove(e) {
            // スワイプ等の動きがあったら長押しキャンセル
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
        }

        function toggleFlag(r, c) {
            const cell = board[r][c];
            if (cell.isRevealed) return;

            const cellHtml = getCellHtml(r, c);
            if (cell.isFlagged) {
                cell.isFlagged = false;
                cellHtml.textContent = '';
                flagsPlaced--;
            } else {
                if (flagsPlaced < totalMines) {
                    cell.isFlagged = true;
                    cellHtml.textContent = '🚩';
                    flagsPlaced++;
                }
            }
            updateCounterDisplay(msMineCount, totalMines - flagsPlaced);
        }

        function revealCell(r, c) {
            const cell = board[r][c];
            if (cell.isRevealed || cell.isFlagged || gameOver) return;

            if (firstClick) {
                firstClick = false;
                placeMines(r, c);
                timerInterval = setInterval(() => {
                    timer++;
                    if (timer > 999) timer = 999;
                    updateCounterDisplay(msTimerDisplay, timer);
                }, 1000);
            }

            cell.isRevealed = true;
            const cellHtml = getCellHtml(r, c);
            cellHtml.classList.add('revealed');

            if (cell.isMine) {
                // Game Over
                gameOver = true;
                clearInterval(timerInterval);
                msFaceEmoji.textContent = '💥'; // Dead face equivalent
                cellHtml.classList.add('mine');
                cellHtml.textContent = '💣';
                revealAllMines();
                return;
            }

            if (cell.neighborMines > 0) {
                cellHtml.textContent = cell.neighborMines;
                cellHtml.classList.add(`num-${cell.neighborMines}`);
            } else {
                // Flood fill
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        let nr = r + dr;
                        let nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            revealCell(nr, nc);
                        }
                    }
                }
            }

            checkWinCondition();
        }

        function revealAllMines() {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (board[r][c].isMine && !board[r][c].isFlagged) {
                        const cellHtml = getCellHtml(r, c);
                        cellHtml.classList.add('revealed');
                        cellHtml.textContent = '💣';
                    } else if (!board[r][c].isMine && board[r][c].isFlagged) {
                        const cellHtml = getCellHtml(r, c);
                        cellHtml.textContent = '❌'; // False flag
                    }
                }
            }
        }

        function checkWinCondition() {
            let revealedCount = 0;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (board[r][c].isRevealed) revealedCount++;
                }
            }
            if (revealedCount === rows * cols - totalMines) {
                gameOver = true;
                clearInterval(timerInterval);
                msFaceEmoji.textContent = '😎'; // Cool face for win
                // Flag remaining mines automatically
                flagsPlaced = totalMines;
                updateCounterDisplay(msMineCount, 0);
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (board[r][c].isMine && !board[r][c].isFlagged) {
                            const cellHtml = getCellHtml(r, c);
                            cellHtml.textContent = '🚩';
                        }
                    }
                }
            }
        }

        msBtn.addEventListener('click', () => {
            msModal.style.display = 'flex';
            if (timerInterval) clearInterval(timerInterval);
            initMinesweeper();
        });

        msCloseBtn.addEventListener('click', () => {
            msModal.style.display = 'none';
            if (timerInterval) clearInterval(timerInterval);
        });

        msResetBtn.addEventListener('click', () => {
            initMinesweeper();
        });

        // Initialize empty board in background to prevent jumping
        initMinesweeper();
    }
});
