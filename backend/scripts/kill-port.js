import { exec } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3030;

const isWin = process.platform === 'win32';

function killPort(port) {
  if (isWin) {
    const cmd = `netstat -ano | findstr :${port}`;
    exec(cmd, (err, stdout) => {
      if (err || !stdout) {
        console.log(`No process found on port ${port}`);
        process.exit(0);
      }
      const lines = stdout.trim().split(/\r?\n/);
      const pids = new Set();
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      });
      if (pids.size === 0) {
        console.log(`No process id found on port ${port}`);
        process.exit(0);
      }
      let killed = 0;
      pids.forEach(pid => {
        exec(`taskkill /PID ${pid} /F`, (killErr) => {
          if (!killErr) {
            console.log(`Killed process ${pid} on port ${port}`);
            killed++;
          }
          if (killed === pids.size) process.exit(0);
        });
      });
    });
  } else {
    const cmd = `lsof -t -i :${port} | xargs kill -9`;
    exec(cmd, (err) => {
      if (err) {
        console.log(`No process found on port ${port} (or unable to kill)`);
      } else {
        console.log(`killed process listening on port ${port}`);
      }
      process.exit(0);
    });
  }
}

killPort(PORT);
