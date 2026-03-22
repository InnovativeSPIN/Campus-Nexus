import { exec } from 'child_process';
const port = 3005;

exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
    if (!stdout) {
        process.exit(0);
    }

    const lines = stdout.trim().split('\n');
    const pids = new Set();

    lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== process.pid.toString()) {
            pids.add(pid);
        }
    });

    if (pids.size === 0) {
        process.exit(0);
    }

    console.log(`Killing processes on port ${port}: ${Array.from(pids).join(', ')}`);
    const killCommands = Array.from(pids).map(pid => `taskkill /F /PID ${pid}`).join(' & ');

    exec(killCommands, () => {
        process.exit(0);
    });
});
