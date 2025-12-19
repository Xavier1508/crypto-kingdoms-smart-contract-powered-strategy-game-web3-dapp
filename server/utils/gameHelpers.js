// server/utils/gameHelpers.js

const generatePlayerColor = () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

const createEmptyGrid = (size) => Array(size).fill().map(() => Array(size).fill(null));

module.exports = {
    generatePlayerColor,
    createEmptyGrid
};