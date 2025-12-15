// client/src/components/ingamePageComp/mapModules/MapControls.js
import { clampCameraPosition, getTileCoordinates } from './MapUtils';
import { TILE_WIDTH } from './MapConstants';

/**
 * SETUP MAP CONTROLS
 * Pan, Zoom, Click dengan render trigger
 */
export const setupMapControls = (app, container, mapGrid, onTileClick, onCameraMove) => {
    const canvas = app.canvas;
    let isDragging = false;
    let lastPos = null;
    let hasMoved = false;

    // Calculate map bounds
    const rows = mapGrid.length || 200;
    const getMapRadius = () => (rows * TILE_WIDTH * container.scale.x) * 0.6;

    // DRAG CONTROLS
    const onPointerDown = (e) => {
        isDragging = true;
        hasMoved = false;
        lastPos = { x: e.clientX, y: e.clientY };
        canvas.style.cursor = 'grabbing';
    };

    const onPointerUp = () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        
        // Trigger render if camera moved significantly
        if (hasMoved && onCameraMove) {
            onCameraMove();
        }
    };

    const onPointerMove = (e) => {
        if (!isDragging || !lastPos) return;

        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            container.x += dx;
            container.y += dy;
            lastPos = { x: e.clientX, y: e.clientY };
            hasMoved = true;
            clampCameraPosition(container, getMapRadius(), app.screen.width, app.screen.height);
        }
    };

    // ZOOM CONTROLS
    const onWheel = (e) => {
        e.preventDefault();

        const scaleFactor = 1.08;
        const direction = e.deltaY < 0 ? 1 : -1;
        let newScale = container.scale.x * (direction > 0 ? scaleFactor : 1 / scaleFactor);
        
        // Clamp scale
        newScale = Math.max(0.2, Math.min(2.2, newScale));
        container.scale.set(newScale);

        const mapRadius = getMapRadius();
        clampCameraPosition(container, mapRadius, app.screen.width, app.screen.height);

        // Trigger render after zoom
        if (onCameraMove) {
            onCameraMove();
        }
    };

    const onClick = (e) => {
        if (hasMoved) return; // Jika habis drag, jangan dianggap klik

        if (onTileClick) {
            // 1. Ambil posisi mouse di layar
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX - rect.left;
            const clientY = e.clientY - rect.top;
            const localPos = container.toLocal({ x: clientX, y: clientY });
            const gridPos = getTileCoordinates(localPos.x, localPos.y);

            // 4. Kirim hasil yang benar!
            onTileClick(gridPos.x, gridPos.y);
        }
    };

    // Register events
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);

    // Return cleanup function
    return () => {
        canvas.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('wheel', onWheel);
        canvas.removeEventListener('click', onClick);
    };
};