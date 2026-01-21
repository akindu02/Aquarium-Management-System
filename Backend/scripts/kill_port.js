/**
 * Script to kill any process running on port 5001
 * Used before starting the server to prevent EADDRINUSE errors
 */
const { exec } = require('child_process');

const PORT = 5001;

if (process.platform === 'win32') {
    // Windows command to find PID by port
    const cmd = `netstat -ano | findstr :${PORT}`;

    exec(cmd, (error, stdout, stderr) => {
        if (error || !stdout) {
            // No process found on this port, which is good
            return;
        }

        const lines = stdout.trim().split('\n');
        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1]; // PID is the last element

            if (pid && pid !== '0') {
                console.log(`Killing process ${pid} on port ${PORT}...`);
                exec(`taskkill /F /PID ${pid}`, (err) => {
                    if (!err) console.log(`Process ${pid} terminated.`);
                });
            }
        });
    });
} else {
    // Linux/Mac command (lsof)
    exec(`lsof -i :${PORT} | grep LISTEN | awk '{print $2}' | xargs kill -9`, (error) => {
        // Ignore errors if no process found
    });
}
