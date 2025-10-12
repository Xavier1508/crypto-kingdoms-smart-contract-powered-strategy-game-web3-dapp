// src/components/GameMap.jsx
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

// Data peta sederhana untuk awal
const mapData = [
  [0, 0, 1, 0, 0, 0, 0],
  [0, 0, 1, 0, 0, 1, 0],
  [0, 0, 0, 0, 0, 1, 0], // Jalan/gerbang
  [0, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

const TILE_SIZE = 50;
const MAP_WIDTH = mapData[0].length * TILE_SIZE;
const MAP_HEIGHT = mapData.length * TILE_SIZE;

const GameMap = () => {
    // Ref untuk menampung elemen div
    const pixiContainer = useRef(null);
    // PERBAIKAN #1: Ref untuk menampung instance aplikasi Pixi
    const appRef = useRef(null); 
    useEffect(() => {
        // Flag untuk melacak status mount komponen
        let isMounted = true; 
        
        const initPixi = async () => {
        if (appRef.current || !pixiContainer.current) return;

        const app = new PIXI.Application();
        await app.init({
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            backgroundColor: 0x1a202c,
        });

        // ----> PERBAIKAN UTAMA <----
        // Hentikan proses jika komponen sudah di-unmount selagi menunggu await
        if (!isMounted) {
            app.destroy(true, true); // Hancurkan aplikasi yang tidak jadi dipakai
            return;
        }

        // Baru set ref dan tambahkan ke DOM jika komponen masih terpasang
        appRef.current = app;
        pixiContainer.current.appendChild(appRef.current.canvas);

        // (Kode untuk menggambar tile tetap sama)
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
            const tileType = mapData[y][x];
            const tile = new PIXI.Graphics();
            const color = tileType === 0 ? 0x2f855a : 0x4a5568;
            
            tile.rect(0, 0, TILE_SIZE, TILE_SIZE)
                .fill(color)
                .stroke({ width: 1, color: 0x1a202c });

            tile.x = x * TILE_SIZE;
            tile.y = y * TILE_SIZE;

            appRef.current.stage.addChild(tile);
            }
        }
        };

        initPixi();

        // Cleanup function
        return () => {
        // Set flag menjadi false saat unmount
        isMounted = false; 
        
        if (appRef.current) {
            appRef.current.destroy(true, true);
            appRef.current = null;
        }
        };
    }, []); // Array dependensi kosong sudah benar

  return <div ref={pixiContainer} />;
};

export default GameMap;