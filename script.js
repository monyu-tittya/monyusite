document.addEventListener('DOMContentLoaded', () => {
    const gameLinks = document.querySelectorAll('.games-list a');
    const descriptionBox = document.getElementById('description-box');
    const descriptionText = document.getElementById('description-text');
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
                descriptionText.textContent = description;
                descriptionBox.classList.add('active');
                if (statusText) statusText.textContent = description;
                isHovering = true;
            }
        });

        // Update tooltip position based on mouse movement
        link.addEventListener('mousemove', (e) => {
            if (isTouchDevice || !isHovering) return;
            const offsetX = 15;
            const offsetY = 20;
            descriptionBox.style.left = `${e.pageX + offsetX}px`;
            descriptionBox.style.top = `${e.pageY + offsetY}px`;
        });

        link.addEventListener('mouseleave', () => {
            if (isTouchDevice) return;
            descriptionBox.classList.remove('active');
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

        charImg.addEventListener('click', () => {
            if (!isCrowVisible) {
                isCrowVisible = true;
                crowImg.classList.add('fly-in');

                // Crow leaves after 2.5 seconds
                setTimeout(() => {
                    crowImg.classList.remove('fly-in');
                    isCrowVisible = false;
                }, 2500);
            }
        });
    }
});
