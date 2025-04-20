document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal-content');
    const input = document.getElementById('input');
    const prompt = document.getElementById('prompt');
    
    let commandHistory = [];
    let historyIndex = -1;
    let currentDirectory = '~';
    let accessLevel = 'guest';
    
    // File system simulation
    const fileSystem = {
        '~': {
            type: 'directory',
            content: {
                'readme.txt': {
                    type: 'file',
                    content: 'Welcome to TetraKlein-OS Terminal.\nType "help" to see available commands.'
                },
                'projects': {
                    type: 'directory',
                    content: {
                        'notes.txt': {
                            type: 'file',
                            content: 'Project ideas:\n- Quantum interference patterns\n- Antimatter containment\n- Klein bottle 4D visualization'
                        }
                    }
                },
                'system': {
                    type: 'directory',
                    content: {
                        'access.dat': {
                            type: 'file',
                            content: 'RESTRICTED: Administrative access required.'
                        }
                    }
                }
            }
        }
    };
    
    // Available commands
    const commands = {
        help: () => {
            return [
                'Available commands:',
                '  help          - Display this help message',
                '  clear         - Clear the terminal',
                '  echo [text]   - Display text',
                '  ls            - List directory contents',
                '  cd [dir]      - Change directory',
                '  cat [file]    - Display file contents',
                '  pwd           - Print working directory',
                '  whoami        - Display current user',
                '  login [user]  - Attempt to login as another user'
            ].join('<br>');
        },
        
        clear: () => {
            terminal.innerHTML = '';
            return '';
        },
        
        echo: (args) => {
            return args.join(' ');
        },
        
        ls: (args) => {
            let path = currentDirectory;
            if (args.length > 0) {
                path = resolvePath(args[0]);
            }
            
            const dir = getPathObject(path);
            if (!dir || dir.type !== 'directory') {
                return createErrorLine('ls: cannot access \'' + path + '\': No such directory');
            }
            
            const contents = Object.keys(dir.content).map(name => {
                const item = dir.content[name];
                if (item.type === 'directory') {
                    return `<span class="directory">${name}/</span>`;
                } else {
                    return `<span class="file">${name}</span>`;
                }
            });
            
            return contents.join('&nbsp;&nbsp;&nbsp;');
        },
        
        cd: (args) => {
            if (args.length === 0) {
                currentDirectory = '~';
                updatePrompt();
                return '';
            }
            
            const path = resolvePath(args[0]);
            const dir = getPathObject(path);
            
            if (!dir) {
                return createErrorLine(`cd: no such directory: ${args[0]}`);
            }
            
            if (dir.type !== 'directory') {
                return createErrorLine(`cd: not a directory: ${args[0]}`);
            }
            
            currentDirectory = path;
            updatePrompt();
            return '';
        },
        
        cat: (args) => {
            if (args.length === 0) {
                return createErrorLine('cat: missing file operand');
            }
            
            const path = resolvePath(args[0]);
            const file = getPathObject(path);
            
            if (!file) {
                return createErrorLine(`cat: ${args[0]}: No such file or directory`);
            }
            
            if (file.type !== 'file') {
                return createErrorLine(`cat: ${args[0]}: Is a directory`);
            }
            
            return file.content.replace(/\n/g, '<br>');
        },
        
        pwd: () => {
            return currentDirectory;
        },
        
        whoami: () => {
            return accessLevel;
        },
        
        login: (args) => {
            if (args.length === 0) {
                return createErrorLine('login: missing username');
            }
            
            const username = args[0].toLowerCase();
            if (username === 'admin') {
                return createErrorLine('login: access denied for user admin');
            } else if (username === 'guest') {
                accessLevel = 'guest';
                updatePrompt();
                return createSuccessLine('Logged in as guest');
            } else {
                return createErrorLine(`login: user ${username} does not exist`);
            }
        }
    };
    
    // Helper functions
    function getPathObject(path) {
        if (path === '~' || path === '/') {
            return fileSystem['~'];
        }
        
        const parts = path.replace(/^~\//, '').split('/').filter(p => p !== '');
        let current = fileSystem['~'];
        
        for (const part of parts) {
            if (part === '..') {
                // Not implemented for simplicity
                continue;
            }
            
            if (!current.content[part]) {
                return null;
            }
            
            current = current.content[part];
        }
        
        return current;
    }
    
    function resolvePath(path) {
        if (path.startsWith('/') || path.startsWith('~')) {
            return path;
        }
        
        if (path === '..') {
            const parts = currentDirectory.split('/');
            parts.pop();
            return parts.join('/') || '~';
        }
        
        if (currentDirectory === '~') {
            return `~/${path}`;
        }
        
        return `${currentDirectory}/${path}`;
    }
    
    function updatePrompt() {
        prompt.textContent = `${accessLevel}@tetraklein-os:${currentDirectory}$`;
    }
    
    function createSystemLine(text) {
        return `<div class="line system-line">${text}</div>`;
    }
    
    function createCommandLine(cmd) {
        return `<div class="line command-line">${prompt.textContent} ${cmd}</div>`;
    }
    
    function createOutputLine(output) {
        return `<div class="line output-line">${output}</div>`;
    }
    
    function createErrorLine(output) {
        return `<span class="error">${output}</span>`;
    }
    
    function createSuccessLine(output) {
        return `<span class="success">${output}</span>`;
    }
    
    // Initialize terminal
    terminal.innerHTML += createSystemLine('TetraKlein-OS Terminal v1.0');
    terminal.innerHTML += createSystemLine('Type "help" for available commands.');
    
    // Handle input
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            
            if (command) {
                // Add command to terminal
                terminal.innerHTML += createCommandLine(command);
                
                // Execute command
                const parts = command.split(' ');
                const cmd = parts[0].toLowerCase();
                const args = parts.slice(1);
                
                if (commands[cmd]) {
                    const output = commands[cmd](args);
                    if (output) {
                        terminal.innerHTML += createOutputLine(output);
                    }
                } else {
                    terminal.innerHTML += createOutputLine(createErrorLine(`Command not found: ${cmd}`));
                }
                
                // Add to history
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                
                // Scroll to bottom
                terminal.scrollTop = terminal.scrollHeight;
                
                // Clear input
                input.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                input.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                input.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                input.value = '';
            }
        }
    });
    
    // Focus input on terminal click
    document.querySelector('.terminal-container').addEventListener('click', () => {
        input.focus();
    });
    
    // Keep input focused
    input.focus();
}); 