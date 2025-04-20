# TetraKlein-OS Terminal Interface

A stylized interactive terminal interface with a retro computer look and feel. This project provides a simulated terminal environment with basic command functionality.

## Features

- Modern CSS styling with retro terminal aesthetics
- Interactive command input and response
- Simulated file system navigation
- Command history navigation (up/down arrows)
- Responsive design for different screen sizes

## Usage

Simply open the `index.html` file in any modern web browser to start using the terminal interface. 

### Available Commands

- `help` - Display available commands
- `clear` - Clear the terminal screen
- `echo [text]` - Display text
- `ls` - List files and directories in the current location
- `cd [directory]` - Change directory
- `cat [file]` - Display file contents
- `pwd` - Print working directory

## Project Structure

```
TetraKlein-OS/
├── index.html         # Main HTML file
├── public/
│   ├── css/
│   │   └── terminal.css  # Terminal styling
│   └── js/
│       └── terminal.js   # Terminal functionality
└── README.md          # This file
```

## Customization

You can customize the terminal by modifying:
- `terminal.css` - Adjust colors, dimensions, and styling
- `terminal.js` - Add new commands or modify existing functionality

## License

MIT 