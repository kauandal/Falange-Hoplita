const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let win;
let currentUser = null;

// Carregar dados do JSON
let userData = {};
try {
    const userDataPath = path.join(__dirname, 'acessos.json');
    const rawData = fs.readFileSync(userDataPath, 'utf8');
    userData = JSON.parse(rawData);
} catch (error) {
    console.error('Erro ao carregar acessos.json:', error);
}

// Impedir múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
        }
    });

    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);

    app.whenReady().then(() => {
        win = new BrowserWindow({
            fullscreen: true,
            kiosk: true,
            autoHideMenuBar: true,
            //   alwaysOnTop: true,
            skipTaskbar: true,
            autoHideMenuBar: true,
            menuBarVisible: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                devTools: false
            }
        });

        // Dentro de app.whenReady() ou nas configurações da janela
        win.webContents.on('context-menu', (e) => e.preventDefault());

        win.loadFile('login.html');

        // Desabilita atalhos padrão
        globalShortcut.register('CommandOrControl+Q', () => { });
        globalShortcut.register('CommandOrControl+W', () => { });
        globalShortcut.register('Alt+F4', () => { });
        globalShortcut.register('Ctrl+Alt+Delete', () => { });
        globalShortcut.register('F11', () => { });

        win.webContents.on('before-input-event', (event, input) => {

            // bloquear devtools
            if (input.key === 'F12' || (input.control && input.shift && input.key === 'I')) {
                event.preventDefault();
            }

            // bloquear refresh
            if (input.key === 'F5') {
                event.preventDefault();
            }

            // ESC só TI
            if (input.type === 'keyDown' && input.code === 'Escape') {
                if (currentUser === 'ti') {
                    app.quit();
                } else {
                    event.preventDefault();
                }
            }

        });
    });
}

ipcMain.on('login', (event, username, password) => {
    // Validação de login usando JSON
    let userFound = false;
    let userType = null;

    for (const [key, user] of Object.entries(userData)) {
        if (user.username === username && user.password === password) {
            userFound = true;
            userType = key;
            currentUser = key;
            break;
        }
    }

    if (userFound) {
        const user = userData[userType];

        if (userType === 'ti') {
            // Sair do modo kiosk e tela cheia para TI
            win.setKiosk(false);
            win.setFullScreen(false);
            win.center();
            win.setSize(1200, 800);
            win.resizable = true;
        }

        win.loadFile('index.html');

        // Enviar informações do usuário e apps para a interface
        win.webContents.on('did-finish-load', () => {
            win.webContents.send('user-data', {
                displayName: user.displayName,
                role: user.role,
                apps: user.apps,
                userType: userType
            });
        });
    } else {
        win.webContents.send('login-error');
    }
});

ipcMain.on('launch-app', (event, appPath) => {
    const { execFile } = require('child_process');
    // Verificar se o arquivo existe
    if (fs.existsSync(appPath)) {


        execFile(appPath, (error) => {
            if (error) {
                win.webContents.send('app-error', error.message);
            }
        });
    } else {
        console.error(`Aplicativo nao encontrado: ${appPath}`);
        // Enviar mensagem de erro para a interface
        win.webContents.send('app-error', `Aplicativo nao encontrado: ${appPath}`);
    }
});

ipcMain.on('logout-request', () => {
    // volta para tela de login
    currentUser = null;
    win.setKiosk(true);
    win.setFullScreen(true);
    win.loadFile('login.html');
});

app.on('window-all-closed', () => {
    app.relaunch();
    app.exit();
});