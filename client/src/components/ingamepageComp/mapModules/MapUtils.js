import { TILE_WIDTH, TILE_HEIGHT, HALF_WIDTH, HALF_HEIGHT } from './MapConstants';

/**
 * Mengubah koordinat Grid (x, y) menjadi koordinat Layar Isometrik (isoX, isoY)
 */
export const getIsoX = (tileX, tileY) => {
    return (tileX - tileY) * HALF_WIDTH;
};

export const getIsoY = (tileX, tileY) => {
    return (tileX + tileY) * HALF_HEIGHT;
};

export const getTileCoordinates = (screenX, screenY) => {
    // Rumus Balik Isometrik
    // x = (isoY / HH + isoX / HW) / 2
    // y = (isoY / HH - isoX / HW) / 2
    const x = Math.floor((screenY / HALF_HEIGHT + screenX / HALF_WIDTH) / 2);
    const y = Math.floor((screenY / HALF_HEIGHT - screenX / HALF_WIDTH) / 2);
    
    return { x, y };
};

/**
 * Helper untuk membatasi kamera (Clamping)
 */
export const clampCameraPosition = (container, mapRadius, screenWidth, screenHeight) => {
    const marginX = screenWidth / 2;
    const marginY = screenHeight / 2;
    const limit = mapRadius + 1000; 

    if (container.x > limit + marginX) container.x = limit + marginX;
    if (container.x < -limit + marginX) container.x = -limit + marginX;
    if (container.y > limit + marginY) container.y = limit + marginY;
    if (container.y < -limit + marginY) container.y = -limit + marginY;
};