document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('grid-container');
    const gridSize = 17;
    const numDots = gridSize * gridSize;
    const containerSize = 400;
    const centerX = containerSize / 2;
    const centerY = containerSize / 2;
    const maxRadius = (containerSize / 2) * 0.9;
    const dotSize = 12;
    const numRings = Math.floor(gridSize / 2) + 1;

    const dots = [];
    let cycleCount = 0;

    function createDot(x, y) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.style.left = `${x - dotSize / 2}px`;
        dot.style.top = `${y - dotSize / 2}px`;
        gridContainer.appendChild(dot);

        const dx = x - centerX;
        const dy = y - centerY;
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);

        dots.push({ element: dot, distance: distanceFromCenter });
    }

    function createCircularDotLayout() {
        let currentDotCount = 0;

        // Center dot
        if (numRings > 0) {
            createDot(centerX, centerY);
            dots[dots.length - 1].distance = 0;
            currentDotCount++;
        }

        // Rings
        for (let ring = 1; ring < numRings; ring++) {
            const ringRadius = (ring / (numRings - 1)) * maxRadius;
            let dotsInRing = Math.floor((2 * Math.PI * ringRadius) / (dotSize * 1.5));
            dotsInRing = Math.max(dotsInRing, 8);
            if (dotsInRing % 2 !== 0) dotsInRing++;

            for (let i = 0; i < dotsInRing && currentDotCount < numDots; i++) {
                const angle = (i / dotsInRing) * (2 * Math.PI);
                const x = centerX + ringRadius * Math.cos(angle);
                const y = centerY + ringRadius * Math.sin(angle);
                createDot(x, y);
                currentDotCount++;
            }

            if (currentDotCount >= numDots) break;
        }
    }

    function animateDotsWithRipple() {
        const dotsByDistance = [...dots];
        const outward = dotsByDistance.slice().sort((a, b) => a.distance - b.distance);
        const inward = dotsByDistance.slice().sort((a, b) => b.distance - a.distance);
        const redRipple = outward;

        const delayMultiplier = 0.005;
        const dotAnimDuration = 0.2;

        const outwardDuration = outward[outward.length - 1].distance * delayMultiplier + dotAnimDuration;
        const inwardDuration = inward[0].distance * delayMultiplier + dotAnimDuration;
        const redDuration = redRipple[redRipple.length - 1].distance * delayMultiplier + dotAnimDuration;

        const cycleDuration = outwardDuration + inwardDuration + redDuration;
        const yellowBlinkDuration = 1.5;

        function runCycle() {
            const tl = gsap.timeline();

            // Reset
            tl.set(dots.map(d => d.element), {
                opacity: 0,
                scale: 0,
                backgroundColor: '#4fe142'
            });

            // Outward ripple (green)
            outward.forEach(({ element, distance }) => {
                const delay = distance * delayMultiplier;
                tl.to(element, {
                    opacity: 1,
                    scale: gsap.utils.wrap([1.1, 0.75]),
                    ease: 'power2.out',
                    duration: dotAnimDuration,
                    delay: delay
                }, 0);
            });

            // Inward ripple (to blue)
            inward.forEach(({ element, distance }) => {
                const delay = distance * delayMultiplier;
                tl.to(element, {
                    scale: 1,
                    backgroundColor: '#3182ce',
                    ease: 'power2.inOut',
                    duration: dotAnimDuration,
                    delay: delay
                }, outwardDuration);
            });

            // Red ripple
            redRipple.forEach(({ element, distance }) => {
                const delay = distance * delayMultiplier;
                tl.to(element, {
                    backgroundColor: '#e53e3e',
                    ease: 'power2.inOut',
                    duration: dotAnimDuration,
                    delay: delay
                }, outwardDuration + inwardDuration);
            });

            // After red ends
            tl.call(() => {
                cycleCount++;
                if (cycleCount >= 3) {
                    blinkYellow();
                    cycleCount = 0; // reset count
                } else {
                    runCycle(); // continue to next ripple cycle
                }
            }, null, outwardDuration + inwardDuration + redDuration + 0.5);
        }

        function blinkYellow() {
            const blinkTL = gsap.timeline({
                onComplete: runCycle
            });

            const elements = dots.map(d => d.element);

            for (let i = 0; i < 3; i++) {
                blinkTL.to(elements, {
                    backgroundColor: '#f6e05e', // Yellow
                    duration: 0.4,
                    ease: 'power1.inOut'
                });
                blinkTL.to(elements, {
                    backgroundColor: '#1a202c', // dark background blink off
                    duration: 0.3,
                    ease: 'power1.inOut'
                });
            }

            // Final yellow state before continuing
            blinkTL.to(elements, {
                backgroundColor: '#4fe142',
                duration: 0.4,
                ease: 'power1.out'
            });
        }

        runCycle();
    }

    createCircularDotLayout();
    animateDotsWithRipple();
});
