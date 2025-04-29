(() => {
  const terminal = document.querySelector('#terminal');
  const inputField = document.querySelector('#input');
  const prompt = document.querySelector('#prompt');
  const sid = sessionStorage.getItem('sid') || crypto.randomUUID();
  sessionStorage.setItem('sid', sid);

  let awaitingPassword = false;
  let lastCmd = '';

  const appendLine = (text = '', cls = '') => {
    const div = document.createElement('div');
    div.textContent = text;
    if (cls) div.className = cls;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  };

  const appendResponse = (resp) => {
    if (resp.redirect) {
      window.location.href = resp.redirect;
      return;
    }

    if (resp.message) {
      const lines = resp.message.split('\n');
      lines.forEach(line => appendLine(line));

      const msgLower = resp.message.toLowerCase();

      if (msgLower.includes('enter your password')) {
        awaitingPassword = true;
      }

      if (msgLower.includes('access granted')) {
        sessionStorage.setItem('authenticated', 'true');
        awaitingPassword = false;
      }

      if (msgLower.includes('access denied') || msgLower.includes('password rejected')) {
        awaitingPassword = true;
      }
    }
  };

  const handleCommand = async (cmd) => {
    if (awaitingPassword && cmd === lastCmd) return;
    lastCmd = cmd;

    appendLine(`> ${awaitingPassword ? '[PASSWORD]' : cmd}`);

    try {
      const res = await fetch('/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, sessionId: sid })
      });

      const json = await res.json();
      appendResponse(json.response);
    } catch (err) {
      appendLine(`ERROR: ${err.message}`, 'error');
    }
  };

  inputField.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const cmd = inputField.value.trim();
      inputField.value = '';
      if (cmd.length > 0) handleCommand(cmd);
    }
  });

  // Welcome banner
  appendLine('TetraKlein-OS Secure Field Terminal');
  appendLine('-----------------------------------');
  appendLine("Type 'help' to view commands.");
})();
