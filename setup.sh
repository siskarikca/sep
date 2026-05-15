#!/bin/bash
echo "=== Setup ==="

sudo apt update -y
sudo apt install -y wget gnupg ca-certificates fonts-liberation libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 \
    libgtk-3-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 \
    libxrandr2 xdg-utils libxss1 libxtst6

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

npm install

echo ""
echo "=== Setup selesai! ==="
echo ""
echo "Cara pakai:"
echo "  PROXY=http://user:pass@host:port node faucet.js"
echo "  PROXY=http://host:port DURATION=120 node faucet.js"
echo ""
