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
});
