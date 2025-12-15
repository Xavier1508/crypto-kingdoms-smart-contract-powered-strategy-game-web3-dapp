import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as PIXI from 'pixi.js';

// Import Renderer Baru
import { initializeMapRenderer, updateDynamicLayer, updateSelectionHighlight } from './mapModules/MapRenderer';
import { setupMapControls } from './mapModules/MapControls';
import { getIsoX, getIsoY, clampCameraPosition } from './mapModules/MapUtils';
import { TILE_WIDTH } from './mapModules/MapConstants';

// Global asset management
let ASSETS_INITIALIZED = false;
let CASTLE_TEXTURE_CACHED = null;

const GameMap = forwardRef(({ mapGrid, ownershipMap, playerData, onTileClick, initialCenterX, initialCenterY, selectedTile }, ref) => {    const pixiRef = useRef(null);
    const appRef = useRef(null);
    const containerRef = useRef(null);
    
    const [isReady, setIsReady] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);

    // Camera Control
    useImperativeHandle(ref, () => ({
        centerOnTile: (tileX, tileY) => {
            if (!containerRef.current || !appRef.current) return;
            const app = appRef.current;
            const container = containerRef.current;
            const scale = container.scale.x;

            const isoX = getIsoX(tileX, tileY);
            const isoY = getIsoY(tileX, tileY);

            container.x = (app.screen.width / 2) - (isoX * scale);
            container.y = (app.screen.height / 2) - (isoY * scale);
            
            const rows = mapGrid?.length || 400;
            const mapRadius = (rows * TILE_WIDTH * scale) * 0.6;
            clampCameraPosition(container, mapRadius, app.screen.width, app.screen.height);
        }
    }));

    // 1. Load Assets
    useEffect(() => {
        if (ASSETS_INITIALIZED) {
            setLoadingProgress(100);
            return;
        }
        const loadAssets = async () => {
            try {
                setLoadingProgress(30);
                const textureUrl = '/assets/castle.png';
                if (!PIXI.Assets.cache.has(textureUrl)) {
                    await PIXI.Assets.load(textureUrl);
                }
                CASTLE_TEXTURE_CACHED = PIXI.Assets.get(textureUrl);
                setLoadingProgress(100);
                ASSETS_INITIALIZED = true;
            } catch {
                console.warn("Using fallback castle");
                CASTLE_TEXTURE_CACHED = null;
                setLoadingProgress(100);
                ASSETS_INITIALIZED = true;
            }
        };
        loadAssets();
    }, []);

    // 2. Init PIXI
    useEffect(() => {
        if (appRef.current) return;

        const initPixi = async () => {
            const app = new PIXI.Application();
            await app.init({
                resizeTo: pixiRef.current,
                backgroundColor: 0x0a0e1a,
                antialias: false, 
                resolution: 1,    
                autoDensity: true,
                powerPreference: "high-performance"
            });

            if (!pixiRef.current) { app.destroy(); return; }
            pixiRef.current.appendChild(app.canvas);
            appRef.current = app;

            const mapContainer = new PIXI.Container();
            mapContainer.x = app.screen.width / 2;
            mapContainer.y = app.screen.height / 2;
            
            app.stage.addChild(mapContainer);
            containerRef.current = mapContainer;

            // SETUP CONTROLS
            const cleanupControls = setupMapControls(
                app, 
                mapContainer, 
                mapGrid || [], 
                onTileClick,
                null 
            );
            app._customCleanup = cleanupControls;

            setIsReady(true);
        };

        initPixi();

        return () => {
            if (appRef.current) {
                if (appRef.current._customCleanup) appRef.current._customCleanup();
                appRef.current.destroy({ removeView: true, children: true });
                appRef.current = null;
            }
        };
    }, []);

    // 3. RENDER TERRAIN (HANYA SEKALI SAJA SAAT LOAD MAP)
    useEffect(() => {
        // Kita butuh appRef.current untuk generate texture
        if (isReady && mapGrid && containerRef.current && appRef.current) {
            console.log("Creating Optimized Terrain...");

            initializeMapRenderer(appRef.current, containerRef.current, mapGrid);
            
            if (initialCenterX !== undefined) {
                setTimeout(() => {
                    if(ref.current) ref.current.centerOnTile(initialCenterX, initialCenterY);
                }, 500);
            }
        }
    }, [isReady, mapGrid]); 

    // 4. UPDATE DYNAMIC OBJECTS
    useEffect(() => {
        if (isReady && ownershipMap && playerData) {
            updateDynamicLayer(ownershipMap, playerData, CASTLE_TEXTURE_CACHED);
        }
    }, [isReady, ownershipMap, playerData]);

    useEffect(() => {
        if (isReady && selectedTile) {
            updateSelectionHighlight(selectedTile.x, selectedTile.y);
        } else if (isReady) {
            updateSelectionHighlight(-1, -1);
        }
    }, [isReady, selectedTile]);

    const showLoading = !isReady || loadingProgress < 100;
    return (
        <div ref={pixiRef} className="w-full h-full cursor-grab bg-[#0a0e1a] relative">
            {showLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#0a0e1a]">
                    <div className="text-[#d4af37] text-xl font-bold animate-pulse">
                        Constructing World... {loadingProgress}%
                    </div>
                </div>
            )}
        </div>
    );
});

export default GameMap;