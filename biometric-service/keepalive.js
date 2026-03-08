
const { spawn } = require('child_process');

function startServer() {
    console.log('--- Starting Biometric Node Server ---');
    const server = spawn('npm', ['start'], { shell: true, stdio: 'inherit' });
    server.on('exit', () => {
        console.log('Server process exited. Restarting in 5s...');
        setTimeout(startServer, 5000);
    });
}

function startTunnel() {
    const subdomain = 'rakshak-verify-alpha-' + Math.floor(Math.random() * 1000);
    console.log(`--- Starting Localtunnel (Requested: ${subdomain}) ---`);
    const lt = spawn('npx', ['localtunnel', '--port', '8000', '--subdomain', subdomain], {
        shell: true,
        stdio: 'inherit'
    });
    lt.on('exit', () => {
        console.log('Tunnel process exited. Restarting in 3s...');
        setTimeout(startTunnel, 3000);
    });
}

startServer();
// Wait for server to be ready before tunnel
setTimeout(startTunnel, 15000); 
