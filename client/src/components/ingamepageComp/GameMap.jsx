import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as PIXI from 'pixi.js';

// --- KONFIGURASI VISUAL ---
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const PALETTE = {
    0: 0x0a0e1a, // Void
    1: 0x86efac, // Zone 1
    2: 0x22c55e, // Zone 2
    3: 0x15803d, // Zone 3
    4: 0x94a3b8, // Mountain
    5: 0xf97316, // Pass 1
    6: 0xea580c, // Pass 2
    7: 0xfca5a5, // Border Pass
    8: 0xa855f7, // Sanctuary
    9: 0xfacc15, // Temple
};

const HEIGHTS = {
    0: 0, 1: 10, 2: 12, 3: 15,
    4: 45, 5: 25, 6: 25, 7: 20, 8: 30, 9: 60,
};

// Global flag untuk prevent double asset loading
let ASSETS_LOADING_STARTED = false;
let CASTLE_TEXTURE_LOADED = null; // Cache texture reference

const GameMap = forwardRef(({ mapGrid, ownershipMap, playerData, onTileClick }, ref) => {
    const pixiRef = useRef(null);
    const appRef = useRef(null);
    const containerRef = useRef(null);
    const isInitializedRef = useRef(false); // Prevent double init
    
    const [renderTrigger, setRenderTrigger] = useState(0); // Force re-render

    // --- 1. EXPOSE FUNCTION (CAMERA) ---
    useImperativeHandle(ref, () => ({
        centerOnTile: (tileX, tileY) => {
            if (!containerRef.current || !appRef.current) return;
            
            const app = appRef.current;
            const container = containerRef.current;
            const scale = container.scale.x;

            const isoX = (tileX - tileY) * (TILE_WIDTH / 2);
            const isoY = (tileX + tileY) * (TILE_HEIGHT / 2);

            container.x = (app.screen.width / 2) - (isoX * scale);
            container.y = (app.screen.height / 2) - (isoY * scale);
            
            clampCamera(container, app);
        }
    }));

    // --- 2. LOAD ASSETS (GLOBAL, ONCE) ---
    useEffect(() => {
        if (ASSETS_LOADING_STARTED) return; // Already started
        
        ASSETS_LOADING_STARTED = true;
        
        const loadAssets = async () => {
            const assetUrl = '/assets/castle.png';
            
            try {
                // Check if already in cache
                if (PIXI.Assets.cache.has('castle')) {
                    console.log("Castle asset already in cache");
                    CASTLE_TEXTURE_LOADED = PIXI.Assets.get('castle');
                } else {
                    // Add and load
                    PIXI.Assets.add({ alias: 'castle', src: assetUrl });
                    CASTLE_TEXTURE_LOADED = await PIXI.Assets.load('castle');
                    console.log("Castle asset loaded successfully");
                }
                
                // Trigger re-render after asset loaded
                setRenderTrigger(prev => prev + 1);
                
            } catch (err) {
                console.warn("⚠️ Castle asset failed to load. Using fallback graphics.");
                console.warn("Error:", err.message);
                CASTLE_TEXTURE_LOADED = null;
                
                // Still trigger render (will use fallback)
                setRenderTrigger(prev => prev + 1);
            }
        };
        
        loadAssets();
    }, []); // Run ONCE only

    // --- 3. INITIALIZE PIXI (ONCE) ---
    useEffect(() => {
        if (isInitializedRef.current) return;
        if (!pixiRef.current) return;
        
        isInitializedRef.current = true;

        const initPixi = async () => {
            try {
                const app = new PIXI.Application();
                await app.init({
                    resizeTo: pixiRef.current,
                    backgroundColor: 0x0a0e1a,
                    antialias: true,
                    resolution: window.devicePixelRatio || 1,
                });

                if (!pixiRef.current) {
                    app.destroy();
                    return;
                }

                pixiRef.current.appendChild(app.canvas);
                appRef.current = app;

                const mapContainer = new PIXI.Container();
                mapContainer.sortableChildren = true;
                mapContainer.x = app.screen.width / 2;
                mapContainer.y = app.screen.height / 2;

                app.stage.addChild(mapContainer);
                containerRef.current = mapContainer;

                setupControls(app, mapContainer);
                
                console.log("✅ PIXI initialized");
                
                // Trigger initial render
                setRenderTrigger(prev => prev + 1);
                
            } catch (err) {
                console.error("❌ PIXI initialization failed:", err);
            }
        };

        initPixi();

        return () => {
            if (appRef.current) {
                try {
                    appRef.current.destroy({ removeView: true, children: true });
                } catch (e) {
                    console.warn("Cleanup warning:", e);
                }
                appRef.current = null;
            }
            isInitializedRef.current = false;
        };
    }, []); // Run ONCE only

    // --- 4. RENDER MAP ---
    useEffect(() => {
        // Wait for everything to be ready
        if (!mapGrid || !appRef.current || !containerRef.current) {
            console.log("⏳ Waiting for initialization...");
            return;
        }

        console.log("🎨 Rendering map...");
        renderMap();
        
    }, [mapGrid, ownershipMap, playerData, renderTrigger]); // Re-render when data changes

    const renderMap = () => {
        const container = containerRef.current;
        if (!container) return;
        
        // Clear previous render
        container.removeChildren();

        const rows = mapGrid.length;
        const cols = mapGrid[0]?.length || 0;
        
        if (rows === 0 || cols === 0) {
            console.warn("⚠️ Map grid is empty");
            return;
        }

        console.log(`📐 Rendering ${rows}x${cols} map`);

        // --- DRAWING LOOP ---
        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                const type = mapGrid[x][y];
                if (type === 0) continue; // Skip void

                const isoX = (x - y) * (TILE_WIDTH / 2);
                const isoY = (x + y) * (TILE_HEIGHT / 2);
                const h = HEIGHTS[type] || 10;
                const tileColor = PALETTE[type] || 0xffffff;
                const ownerId = ownershipMap?.[x]?.[y];

                // 1. DRAW TILE BASE (GEOMETRY)
                const g = new PIXI.Graphics();
                
                // Top Face
                g.moveTo(0, -h);
                g.lineTo(TILE_WIDTH / 2, TILE_HEIGHT / 2 - h);
                g.lineTo(0, TILE_HEIGHT - h);
                g.lineTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2 - h);
                g.closePath();
                g.fill({ color: tileColor });
                g.stroke({ width: 1, color: 0x000000, alpha: 0.15 });

                // Left Side (Shadow)
                g.moveTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2 - h);
                g.lineTo(0, TILE_HEIGHT - h);
                g.lineTo(0, TILE_HEIGHT);
                g.lineTo(-TILE_WIDTH / 2, TILE_HEIGHT / 2);
                g.closePath();
                g.fill({ color: 0x000000, alpha: 0.4 });

                // Right Side (Darker Shadow)
                g.moveTo(TILE_WIDTH / 2, TILE_HEIGHT / 2 - h);
                g.lineTo(0, TILE_HEIGHT - h);
                g.lineTo(0, TILE_HEIGHT);
                g.lineTo(TILE_WIDTH / 2, TILE_HEIGHT / 2);
                g.closePath();
                g.fill({ color: 0x000000, alpha: 0.6 });
                
                g.x = isoX;
                g.y = isoY;
                g.zIndex = 0;
                container.addChild(g);

                // 2. DRAW OWNERSHIP OVERLAY
                if (ownerId && playerData) {
                    const pInfo = playerData[ownerId];
                    if (pInfo) {
                        // Territory overlay
                        const overlay = new PIXI.Graphics();
                        overlay.moveTo(0, -h);
                        overlay.lineTo(TILE_WIDTH/2, TILE_HEIGHT/2 - h);
                        overlay.lineTo(0, TILE_HEIGHT - h);
                        overlay.lineTo(-TILE_WIDTH/2, TILE_HEIGHT/2 - h);
                        overlay.closePath();
                        
                        const playerColor = typeof pInfo.color === 'number' ? pInfo.color : 0x3366ff;
                        overlay.fill({ color: playerColor, alpha: 0.35 });
                        
                        overlay.x = isoX;
                        overlay.y = isoY;
                        overlay.zIndex = 1;
                        container.addChild(overlay);

                        // 3. DRAW CASTLE (if this is castle location)
                        if (pInfo.castleX === x && pInfo.castleY === y) {
                            if (CASTLE_TEXTURE_LOADED) {
                                // Use sprite
                                try {
                                    const sprite = new PIXI.Sprite(CASTLE_TEXTURE_LOADED);
                                    sprite.anchor.set(0.5, 1);
                                    sprite.width = 150;
                                    sprite.height = 150;
                                    sprite.x = isoX;
                                    sprite.y = isoY - h + 55;
                                    sprite.zIndex = 10;
                                    container.addChild(sprite);
                                } catch (spriteErr) {
                                    console.warn("Sprite creation failed, using fallback");
                                    drawCastleFallback(container, isoX, isoY, h);
                                }
                            } else {
                                // Use fallback graphics
                                drawCastleFallback(container, isoX, isoY, h);
                            }
                        }
                    }
                }
            }
        }
    };

    // Fallback castle rendering
    const drawCastleFallback = (container, isoX, isoY, h) => {
        const castle = new PIXI.Graphics();
        
        // Draw a simple tower shape
        // Base
        castle.rect(-8, -20, 16, 20);
        castle.fill(0x8b4513); // Brown
        
        // Top
        castle.moveTo(-10, -20);
        castle.lineTo(0, -28);
        castle.lineTo(10, -20);
        castle.closePath();
        castle.fill(0xdc143c); // Red roof
        
        // Flag
        castle.circle(0, -28, 3);
        castle.fill(0xffd700); // Gold
        
        castle.x = isoX;
        castle.y = isoY - h;
        castle.zIndex = 10;
        container.addChild(castle);
    };

    // --- 5. CAMERA CONTROLS ---
    const clampCamera = (container, app) => {
        if (!mapGrid) return;
        const rows = mapGrid.length;
        const scale = container.scale.x;
        const mapRadius = (rows * TILE_WIDTH * scale) * 0.6;
        const margin = app.screen.width / 2;

        container.x = Math.max(Math.min(container.x, mapRadius + margin), -mapRadius + margin);
        container.y = Math.max(Math.min(container.y, mapRadius + margin), -mapRadius + margin);
    };

    const setupControls = (app, container) => {
        const canvas = app.canvas;
        let isDragging = false;
        let lastPos = null;

        const onDown = (e) => {
            isDragging = true;
            lastPos = { x: e.clientX, y: e.clientY };
            canvas.style.cursor = 'grabbing';
        };

        const onUp = () => {
            isDragging = false;
            canvas.style.cursor = 'grab';
        };

        const onMove = (e) => {
            if (!isDragging || !lastPos) return;
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            container.x += dx;
            container.y += dy;
            lastPos = { x: e.clientX, y: e.clientY };
            clampCamera(container, app);
        };

        const onWheel = (e) => {
            e.preventDefault();
            const scaleFactor = 1.1;
            const direction = e.deltaY < 0 ? 1 : -1;
            let newScale = container.scale.x * (direction > 0 ? scaleFactor : 1/scaleFactor);
            newScale = Math.max(0.2, Math.min(3, newScale));
            container.scale.set(newScale);
            clampCamera(container, app);
        };

        const onClick = (e) => {
            if (isDragging) return;
            if (onTileClick) {
                // Calculate clicked tile coordinates
                // (This is a simplified version, you may need more precise calculation)
                onTileClick(0, 0);
            }
        };

        canvas.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointermove', onMove);
        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('click', onClick);
    };

    return (
        <div ref={pixiRef} className="w-full h-full cursor-grab bg-[#0a0e1a] relative">
            {!appRef.current && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#facc15] mx-auto mb-4"></div>
                        <div>Loading Kingdom Map...</div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default GameMap;