(function() {
    const canvas = document.getElementById('pixel-liquid-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Configuration
    const squareSize = 4;
    const gridGap = 6;
    const cellSize = squareSize + gridGap;
    const flickerChance = 0.3;
    const maxOpacity = 0.1; // Reduced opacity for subtle background
    const hoverRadius = 60; // Radius around cursor for the hover effect

    // Use the accent color #6D8196 from style.css
    const rgbColor = { r: 109, g: 129, b: 150 }; 
    const memoizedColor = `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b},`;

    let gridParams = null;
    let animationFrameId = null;
    let isInView = true;

    // Mouse tracking
    let mouseX = -1000;
    let mouseY = -1000;
    let targetX = 0;
    let targetY = 0;
    let parallaxMouseX = 0;
    let parallaxMouseY = 0;

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        targetX = 0.75 - (e.clientX - centerX) / centerX;
        targetY = -(e.clientY - centerY) / centerY;
    });

    window.addEventListener('mouseout', () => {
        mouseX = -1000;
        mouseY = -1000;
    });

    // Icons setup (positions translated from original CSS top/left/right properties)
    const iconsData = [
        { src: 'resources/skills/python.svg', speed: 2, startX: 0.10, startY: 0.15, size: 60 },
        { src: 'resources/skills/javascript.svg', speed: -3, startX: 0.15, startY: 0.70, size: 100 },
        { src: 'resources/skills/cpp.svg', speed: 4, startX: 0.85, startY: 0.20, size: 80 }, 
        { src: 'resources/skills/java.svg', speed: -2, startX: 0.90, startY: 0.65, size: 120 }, 
        { src: 'resources/skills/mysql.svg', speed: 5, startX: 0.30, startY: 0.40, size: 50 },
        { src: 'resources/skills/telegram.svg', speed: -4, startX: 0.60, startY: 0.85, size: 70 }, 
        { src: 'resources/skills/discord.svg', speed: 3, startX: 0.65, startY: 0.30, size: 90 }, 
        { src: 'resources/skills/dotnet.svg', speed: -1, startX: 0.80, startY: 0.50, size: 65 }, 
        { src: 'resources/skills/micropython.svg', speed: 2, startX: 0.40, startY: 0.10, size: 85 },
        { src: 'resources/skills/selenium.svg', speed: -5, startX: 0.35, startY: 0.80, size: 55 },
        { src: 'resources/skills/shopee.svg', speed: 3, startX: 0.05, startY: 0.35, size: 110 },
        { src: 'resources/skills/html.svg', speed: -2, startX: 0.95, startY: 0.60, size: 75 } 
    ];

    const icons = [];
    iconsData.forEach(data => {
        const img = new Image();
        img.src = data.src;
        icons.push({ img, ...data });
    });

    // Offscreen canvas for low-res matrix display
    const offscreenCanvas = document.createElement('canvas');
    const offCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

    function setupCanvas(canvas, width, height) {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const cols = Math.ceil(width / cellSize);
        const rows = Math.ceil(height / cellSize);
        
        offscreenCanvas.width = cols;
        offscreenCanvas.height = rows;

        const squares = new Float32Array(cols * rows);
        for (let i = 0; i < squares.length; i++) {
            squares[i] = Math.random() * maxOpacity;
        }

        return { cols, rows, squares, dpr, width, height };
    }

    function updateSquares(squares, deltaTime) {
        for (let i = 0; i < squares.length; i++) {
            if (Math.random() < flickerChance * deltaTime) {
                squares[i] = Math.random() * maxOpacity;
            }
        }
    }

    function drawGrid(ctx, width, height, cols, rows, squares, dpr, time) {
        // Clear offscreen canvas
        offCtx.clearRect(0, 0, cols, rows);
        
        // Easing mouse for parallax
        parallaxMouseX += (targetX - parallaxMouseX) * 0.05;
        parallaxMouseY += (targetY - parallaxMouseY) * 0.05;
        
        // Draw icons to offscreen canvas
        icons.forEach((icon, index) => {
            if (!icon.img.complete) return;
            
            // Base continuous floating movement (sine/cosine waves)
            const floatY = Math.sin(time * 1.5 + index) * 15;
            const floatX = Math.cos(time * 1.2 + index) * 10;
            
            const xOffset = parallaxMouseX * icon.speed * 30 + floatX;
            const yOffset = parallaxMouseY * icon.speed * 30 + floatY;
            
            // Calculate screen coordinates
            const pxX = width * icon.startX + xOffset - icon.size / 2;
            const pxY = height * icon.startY + yOffset - icon.size / 2;
            
            // Map screen coordinates to grid coordinates (offscreen canvas size)
            const gridX = pxX / cellSize;
            const gridY = pxY / cellSize;
            const gridWidth = icon.size / cellSize;
            const gridHeight = icon.size / cellSize;
            
            offCtx.drawImage(icon.img, gridX, gridY, gridWidth, gridHeight);
        });
        
        const offscreenData = offCtx.getImageData(0, 0, cols, rows).data;

        ctx.clearRect(0, 0, width * dpr, height * dpr);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const pixelIndex = (j * cols + i) * 4;
                const r = offscreenData[pixelIndex];
                const g = offscreenData[pixelIndex + 1];
                const b = offscreenData[pixelIndex + 2];
                const a = offscreenData[pixelIndex + 3];
                
                const squareX = i * cellSize;
                const squareY = j * cellSize;
                let opacity = squares[i * rows + j];
                let isLit = false;
                
                // If there's an icon pixel here (alpha threshold)
                if (a > 10) { // low threshold to capture soft edges of icons
                    isLit = true;
                } else {
                    // Hover effect only applies to background
                    const centerX = squareX + squareSize / 2;
                    const centerY = squareY + squareSize / 2;
                    const dx = mouseX - centerX;
                    const dy = mouseY - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    if (dist < hoverRadius) {
                        const hoverOpacity = 1 - (dist / hoverRadius);
                        opacity = Math.min(1, opacity + hoverOpacity * 0.8);
                    }
                }

                if (isLit) {
                    // Use a lower opacity for lit pixels so they aren't as distracting
                    const iconOpacity = Math.max(0.1, (a / 255) * 0.25);
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${iconOpacity})`;
                } else {
                    ctx.fillStyle = `${memoizedColor}${opacity})`;
                }
                
                ctx.fillRect(
                    squareX * dpr,
                    squareY * dpr,
                    squareSize * dpr,
                    squareSize * dpr
                );
            }
        }
    }

    function updateCanvasSize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        gridParams = setupCanvas(canvas, width, height);
    }

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    let lastTime = 0;
    function animate(time) {
        if (!isInView || !gridParams) return;

        let deltaTime = (time - lastTime) / 1000;
        if (deltaTime > 0.1) deltaTime = 0.1;
        lastTime = time;

        updateSquares(gridParams.squares, deltaTime);
        drawGrid(
            ctx,
            gridParams.width,
            gridParams.height,
            gridParams.cols,
            gridParams.rows,
            gridParams.squares,
            gridParams.dpr,
            time * 0.001
        );
        animationFrameId = requestAnimationFrame(animate);
    }

    requestAnimationFrame((time) => {
        lastTime = time;
        animate(time);
    });

})();
