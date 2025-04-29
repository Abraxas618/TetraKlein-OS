(() => {
  const terminal = document.querySelector('#terminal');
  const inputField = document.querySelector('#input');
  const prompt = document.querySelector('#prompt');
  const sid = sessionStorage.getItem('sid') || crypto.randomUUID();
  sessionStorage.setItem('sid', sid);

  let awaitingPassword = false;

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
    } else if (resp.message) {
      const lines = resp.message.split('\n');
      lines.forEach(line => appendLine(line));

      // Automatically detect login prompts
      if (resp.message.toLowerCase().includes('enter new password') ||
          resp.message.toLowerCase().includes('enter your password')) {
        awaitingPassword = true;
      }

      if (resp.message.toLowerCase().includes('access granted')) {
        sessionStorage.setItem('authenticated', 'true');
        awaitingPassword = false;
      }
    }
  };

  const handleCommand = async (cmd) => {
    if (!awaitingPassword) {
      appendLine(`> ${cmd}`);
    } else {
      appendLine('> [PASSWORD]');
    }

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

  // Boot Message
  appendLine('TetraKlein-OS Secure Field Terminal');
  appendLine('-----------------------------------');
  appendLine("Type 'help' to view commands.");
})();
