// client/src/components/ingamePageComp/mapModules/MapRenderer.js
import * as PIXI from 'pixi.js';
import { 
    TILE_WIDTH, TILE_HEIGHT, HALF_WIDTH, HALF_HEIGHT, 
    PALETTE, HEIGHTS, TILE_SIZES, TILE_TYPES 
} from './MapConstants';
import { getIsoX, getIsoY } from './MapUtils';
let terrainLayer, structureLayer, objectLayer, uiLayer;
let selectionCursor = null;
const CHUNK_SIZE = 50; 

const drawFlatTile = (g, x, y, color) => {
    g.moveTo(x, y);
    g.lineTo(x + HALF_WIDTH, y + HALF_HEIGHT);
    g.lineTo(x, y + TILE_HEIGHT);
    g.lineTo(x - HALF_WIDTH, y + HALF_HEIGHT);
    g.closePath();
    g.fill({ color });
    g.stroke({ width: 1, color: 0x000000, alpha: 0.05 }); 
};

// Membuat container 3D untuk struktur agar bisa di-sort depth-nya
const createStructureSprite = (type, size) => {
    const container = new PIXI.Container();
    const g = new PIXI.Graphics();
    const color = PALETTE[type] || 0xffffff;
    const h = HEIGHTS[type] || 20;

    // Gambar Prisma 3D Isometric
    // Top Face
    g.moveTo(0, -h); 
    g.lineTo(HALF_WIDTH * size, (HALF_HEIGHT * size) - h); 
    g.lineTo(0, (TILE_HEIGHT * size) - h); 
    g.lineTo(-(HALF_WIDTH * size), (HALF_HEIGHT * size) - h); 
    g.closePath();
    g.fill({ color });
    g.stroke({ width: 1, color: 0xffffff, alpha: 0.1 });

    // Left Face (Darker)
    g.moveTo(-(HALF_WIDTH * size), (HALF_HEIGHT * size) - h);
    g.lineTo(0, (TILE_HEIGHT * size) - h);
    g.lineTo(0, (TILE_HEIGHT * size)); 
    g.lineTo(-(HALF_WIDTH * size), (HALF_HEIGHT * size));
    g.closePath();
    g.fill({ color: 0x000000, alpha: 0.3 });

    // Right Face (Medium)
    g.moveTo(HALF_WIDTH * size, (HALF_HEIGHT * size) - h);
    g.lineTo(0, (TILE_HEIGHT * size) - h);
    g.lineTo(0, (TILE_HEIGHT * size));
    g.lineTo(HALF_WIDTH * size, (HALF_HEIGHT * size));
    g.closePath();
    g.fill({ color: 0x000000, alpha: 0.5 });

    // Dekorasi Simpel untuk Resource/Holy Site
    if (type >= 10 && type < 20) g.circle(0, (HALF_HEIGHT * size) - h - 5, 5).fill(0xffffff);
    if (type === TILE_TYPES.ZIGGURAT) g.rect(-10, -h-20, 20, 20).fill(0xffd700);

    container.addChild(g);
    return container;
};

// --- MAIN RENDERER ---

export const initializeMapRenderer = (app, mainContainer, mapGrid) => {
    mainContainer.removeChildren();
    
    terrainLayer = new PIXI.Container();
    structureLayer = new PIXI.Container(); structureLayer.sortableChildren = true;
    objectLayer = new PIXI.Container(); objectLayer.sortableChildren = true;
    
    // [BARU] UI Layer paling atas (untuk highlight)
    uiLayer = new PIXI.Container(); 
    uiLayer.zIndex = 99999; 

    mainContainer.addChild(terrainLayer);
    mainContainer.addChild(structureLayer);
    mainContainer.addChild(objectLayer);
    mainContainer.addChild(uiLayer); // Add UI Layer

    // [BARU] Buat Selection Cursor (Disembunyikan dulu)
    selectionCursor = new PIXI.Graphics();
    selectionCursor.moveTo(0, 0);
    selectionCursor.lineTo(HALF_WIDTH, HALF_HEIGHT);
    selectionCursor.lineTo(0, TILE_HEIGHT);
    selectionCursor.lineTo(-HALF_WIDTH, HALF_HEIGHT);
    selectionCursor.closePath();
    selectionCursor.stroke({ width: 3, color: 0xffffff, alpha: 1 }); // Outline Putih Tebal
    selectionCursor.fill({ color: 0xffffff, alpha: 0.2 }); // Isi putih transparan
    selectionCursor.visible = false;
    uiLayer.addChild(selectionCursor);

    const rows = mapGrid.length;
    const cols = mapGrid[0]?.length || 0;

    // PHASE 1: GROUND (Snapshot Chunking) - Hanya tanah datar (1, 2, 3)
    for (let startX = 0; startX < rows; startX += CHUNK_SIZE) {
        for (let startY = 0; startY < cols; startY += CHUNK_SIZE) {
            const tempChunk = new PIXI.Container();
            const g = new PIXI.Graphics();
            tempChunk.addChild(g);

            const endX = Math.min(startX + CHUNK_SIZE, rows);
            const endY = Math.min(startY + CHUNK_SIZE, cols);

            for (let x = startX; x < endX; x++) {
                for (let y = startY; y < endY; y++) {
                    const type = mapGrid[x][y];
                    if (type === 0) continue; 
                    
                    const isoX = getIsoX(x, y);
                    const isoY = getIsoY(x, y);
                    const color = PALETTE[type] || PALETTE[TILE_TYPES.ZONE_1];
                    
                    // Render ground plate
                    drawFlatTile(g, isoX, isoY, color);
                }
            }

            const texture = app.renderer.generateTexture({ target: tempChunk, scaleMode: 'nearest' });
            const sprite = new PIXI.Sprite(texture);
            sprite.x = tempChunk.getLocalBounds().x;
            sprite.y = tempChunk.getLocalBounds().y;
            terrainLayer.addChild(sprite);

            g.destroy();
            tempChunk.destroy();
        }
    }

    // PHASE 2: STRUCTURES (Dynamic Objects) - Gunung, Gate, Resource
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            const type = mapGrid[x][y];
            if (type <= 3) continue; // Skip terrain

            const size = TILE_SIZES[type] || 1;
            
            // HEAD CHECK: Hanya render jika ini adalah tile pojok kiri atas struktur
            let isHead = true;
            if (size > 1) {
                if (x > 0 && mapGrid[x-1][y] === type) isHead = false;
                if (y > 0 && mapGrid[x][y-1] === type) isHead = false;
            }

            if (isHead) {
                const isoX = getIsoX(x, y);
                const isoY = getIsoY(x, y);
                
                const struct = createStructureSprite(type, size);
                struct.x = isoX;
                struct.y = isoY;
                struct.zIndex = isoY; // KUNCI VISUAL 3D: Sorting berdasarkan Y
                
                structureLayer.addChild(struct);
            }
        }
    }
};

export const updateSelectionHighlight = (x, y) => {
    if (!selectionCursor) return;

    // Jika x,y valid
    if (x >= 0 && y >= 0) {
        const isoX = getIsoX(x, y);
        const isoY = getIsoY(x, y);
        
        selectionCursor.x = isoX;
        selectionCursor.y = isoY;
        selectionCursor.visible = true;
        
        selectionCursor.alpha = 1;
    } else {
        selectionCursor.visible = false;
    }
};

export const updateDynamicLayer = (ownershipMap, playerData, castleTexture) => {
    if (!objectLayer) return;

    // Bersihkan layer object sebelum gambar ulang
    objectLayer.removeChildren();

    // 1. Territory Overlay (Wilayah berwarna)
    if (ownershipMap && playerData) {
        const g = new PIXI.Graphics();
        const rows = ownershipMap.length;
        const cols = ownershipMap[0]?.length;

        for (let x = 0; x < rows; x++) {
            for (let y = 0; y < cols; y++) {
                const ownerId = ownershipMap[x][y];
                
                // 🔥 PERBAIKAN WARNA DISINI 🔥
                if (ownerId && playerData[ownerId]) {
                    const isoX = getIsoX(x, y);
                    const isoY = getIsoY(x, y);
                    
                    // Ambil warna dari Database (format "hsl(...)")
                    // Jika error/hilang, baru fallback ke biru (0x3366ff)
                    const playerColor = playerData[ownerId].color || 0x3366ff;

                    // Gambar area kepemilikan
                    g.moveTo(isoX, isoY);
                    g.lineTo(isoX + HALF_WIDTH, isoY + HALF_HEIGHT);
                    g.lineTo(isoX, isoY + TILE_HEIGHT);
                    g.lineTo(isoX - HALF_WIDTH, isoY + HALF_HEIGHT);
                    g.closePath();
                    
                    // Gunakan warna dinamis player!
                    g.fill({ color: playerColor, alpha: 0.45 }); // Alpha dinaikkan dikit biar lebih jelas
                }
            }
        }
        g.zIndex = -9999; // Overlay selalu di bawah castle
        objectLayer.addChild(g);
    }

    // 2. CASTLES (BENTENG PLAYER)
    if (playerData) {
        Object.values(playerData).forEach(p => {
            if (p.castleX !== undefined) {
                const isoX = getIsoX(p.castleX, p.castleY);
                const isoY = getIsoY(p.castleX, p.castleY);
                
                let castle;
                if (castleTexture) {
                    // --- OPSI A: GAMBAR ASLI ---
                    castle = new PIXI.Sprite(castleTexture);
                    castle.anchor.set(0.5, 0.8); 
                    
                    castle.width = 155; 
                    castle.height = 155;
                } else {
                    castle = new PIXI.Graphics();
                    castle.moveTo(0, -30);
                    castle.lineTo(15, 0);
                    castle.lineTo(-15, 0);
                    castle.fill(0xff0000);
                }
                
                castle.x = isoX - 5;
                castle.y = isoY + 23;
                
                // Sorting Order
                castle.zIndex = isoY + 1000; 
                
                objectLayer.addChild(castle);
            }
        });
    }
};