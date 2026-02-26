document.addEventListener('DOMContentLoaded', () => {
    const gameLinks = document.querySelectorAll('.games-list a');
    const descriptionBox = document.getElementById('description-box');
    const descriptionText = document.getElementById('description-text');
    let isHovering = false;

    gameLinks.forEach(link => {
        link.addEventListener('mouseenter', (e) => {
            const description = e.currentTarget.getAttribute('data-description');
            if (description) {
                descriptionText.textContent = description;
                descriptionBox.classList.add('active');
                isHovering = true;
            }
        });

        // Update tooltip position based on mouse movement
        link.addEventListener('mousemove', (e) => {
            if (isHovering) {
                // Offset the tooltip slightly from the cursor (Win95 style, bottom-right)
                const offsetX = 15;
                const offsetY = 20;
                descriptionBox.style.left = `${e.pageX + offsetX}px`;
                descriptionBox.style.top = `${e.pageY + offsetY}px`;
            }
        });

        link.addEventListener('mouseleave', () => {
            descriptionBox.classList.remove('active');
            isHovering = false;
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
