// client/src/components/ingamePageComp/mapModules/MapControls.js
import { clampCameraPosition, getTileCoordinates } from './MapUtils';
import { TILE_WIDTH } from './MapConstants';

/**
 * SETUP MAP CONTROLS
 * Pan, Zoom (Follow Cursor), Click
 */
export const setupMapControls = (app, container, mapGrid, onTileClick, onCameraMove) => {
    const canvas = app.canvas;
    let isDragging = false;
    let lastPos = null;
    let hasMoved = false;

    // Calculate map bounds untuk Clamping
    const rows = mapGrid.length || 200;
    const getMapRadius = (currentScale) => (rows * TILE_WIDTH * currentScale) * 0.6;

    // --- DRAG CONTROLS (PANNING) ---
    const onPointerDown = (e) => {
        isDragging = true;
        hasMoved = false;
        lastPos = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        
        if (hasMoved && onCameraMove) {
            onCameraMove();
        }
    };

    const onPointerMove = (e) => {
        if (!isDragging || !lastPos) return;

        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;

        // Threshold agar tidak dianggap click jika geser sedikit
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
            container.x += dx;
            container.y += dy;
            lastPos = { x: e.clientX, y: e.clientY };
            hasMoved = true;
            
            // Clamp saat dragging
            const mapRadius = getMapRadius(container.scale.x);
            clampCameraPosition(container, mapRadius, app.screen.width, app.screen.height);
        }
    };

    // --- ZOOM CONTROLS (FOLLOW CURSOR) ---
    const onWheel = (e) => {
        e.preventDefault();

        // 1. Ambil posisi mouse relatif terhadap Canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 2. Hitung posisi mouse di "Dunia Game" (World Coordinates) sebelum zoom
        // Rumus: (MouseScreen - ContainerPos) / OldScale
        const worldPos = {
            x: (mouseX - container.x) / container.scale.x,
            y: (mouseY - container.y) / container.scale.y
        };

        // 3. Hitung Scale Baru
        const scaleFactor = 1.1; // Kecepatan zoom
        const direction = e.deltaY < 0 ? 1 : -1;
        let newScale = container.scale.x * (direction > 0 ? scaleFactor : 1 / scaleFactor);
        
        // Batasi Zoom (Min 0.2x, Max 2.5x)
        newScale = Math.max(0.2, Math.min(2.5, newScale));

        // 4. Terapkan Scale Baru
        container.scale.set(newScale);

        // 5. Geser Container agar "Dunia Game" di bawah mouse tetap di posisi mouse
        // Rumus Baru: MouseScreen - (WorldPos * NewScale)
        container.x = mouseX - (worldPos.x * newScale);
        container.y = mouseY - (worldPos.y * newScale);

        // 6. Clamping (Agar tidak zoom out terlalu jauh keluar map)
        const mapRadius = getMapRadius(newScale);
        clampCameraPosition(container, mapRadius, app.screen.width, app.screen.height);

        // Trigger render ulang (LOD System jika ada)
        if (onCameraMove) {
            onCameraMove();
        }
    };

    // --- CLICK HANDLING ---
    const onClick = (e) => {
        if (hasMoved) return;

        if (onTileClick) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            
            const localPos = container.toLocal({ x: clientX, y: clientY });
            
            const gridPos = getTileCoordinates(localPos.x, localPos.y);

            onTileClick(gridPos.x, gridPos.y);
        }
    };

    // Register events
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    // Cleanup
    return () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('click', onClick);
    };
};