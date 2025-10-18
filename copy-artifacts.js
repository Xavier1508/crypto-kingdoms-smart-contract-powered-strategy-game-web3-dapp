const fs = require('fs-extra');
const path = require('path');

async function main() {
    const sourceDir = path.resolve(__dirname, 'blockchain', 'artifacts', 'contracts');
    const destDir = path.resolve(__dirname, 'client', 'src', 'contracts');
    await fs.ensureDir(destDir);

    try {
        await fs.copy(sourceDir, destDir);
        console.log('✅ Artefak kontrak berhasil disalin ke client/src/contracts');
    } catch (error) {
        console.error('❌ Gagal menyalin artefak kontrak:', error);
    }
}

main();