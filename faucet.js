const puppeteer = require('puppeteer');

const FAUCET_URL = 'https://sepolia-faucet.pk910.de/';
const PROXY = process.env.PROXY || '';
const DURATION_MINUTES = parseInt(process.env.DURATION || '60');

async function main() {
    console.log('=== Sepolia Faucet - Keep Open ===');
    console.log(`URL: ${FAUCET_URL}`);
    console.log(`Proxy: ${PROXY || '(tanpa proxy)'}`);
    console.log(`Durasi: ${DURATION_MINUTES} menit`);
    console.log('==================================\n');

    const launchOptions = {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
        ],
    };

    if (PROXY) {
        let proxyUrl = PROXY;
        try {
            const url = new URL(PROXY);
            proxyUrl = `${url.protocol}//${url.hostname}:${url.port}`;
        } catch (e) {}
        launchOptions.args.push(`--proxy-server=${proxyUrl}`);
        console.log(`[*] Proxy: ${proxyUrl}`);
    }

    console.log('[*] Membuka browser...');
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Auth proxy jika ada user:pass
    if (PROXY) {
        try {
            const url = new URL(PROXY);
            if (url.username && url.password) {
                await page.authenticate({
                    username: decodeURIComponent(url.username),
                    password: decodeURIComponent(url.password),
                });
            }
        } catch (e) {}
    }

    await page.setUserAgent(
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    console.log(`[*] Membuka ${FAUCET_URL}...`);
    try {
        await page.goto(FAUCET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('[+] Halaman berhasil dibuka!');
    } catch (err) {
        console.error(`[!] Gagal: ${err.message}`);
        await browser.close();
        process.exit(1);
    }

    const title = await page.title();
    console.log(`[*] Title: ${title}`);
    console.log(`\n[*] Website terbuka. Tekan Ctrl+C untuk menutup.\n`);

    const startTime = Date.now();
    const endTime = startTime + (DURATION_MINUTES * 60 * 1000);

    const statusInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const m = Math.floor(elapsed / 60);
        const s = elapsed % 60;
        process.stdout.write(`\r[*] Berjalan: ${m}m ${s}s`);

        if (Date.now() >= endTime) {
            console.log('\n[*] Durasi selesai. Menutup...');
            clearInterval(statusInterval);
            browser.close().then(() => process.exit(0));
        }
    }, 1000);

    process.on('SIGINT', async () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        console.log(`\n[*] Ditutup. Total: ${Math.floor(elapsed/60)}m ${elapsed%60}s`);
        clearInterval(statusInterval);
        await browser.close();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        clearInterval(statusInterval);
        await browser.close();
        process.exit(0);
    });
}

main().catch(err => {
    console.error(`[!] Error: ${err.message}`);
    process.exit(1);
});
