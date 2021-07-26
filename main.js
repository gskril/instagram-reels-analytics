const { app, BrowserWindow, Menu, shell } = require('electron')
const getPort = require('get-port')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    maxWidth: 600,
    minWidth: 600,
    height: 400,
    maxHeight: 400,
    minHeight: 400,
    // backgroundColor: '#121212',
    // titleBarStyle: 'hidden',
    fullscreenable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  // Get free port on localhost
  const getAvailPort = async function () {
    const availPort = await getPort()
    return availPort
  }

  // Set electron app view to randomized port and export to electron server
  getAvailPort().then(function (result) {
    exports.getAvailPort = result
    require('./server')

    mainWindow.loadURL(`http://localhost:${result}/`)
  })

  // If link is clicked, open in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
  
}

app.whenReady().then(() => {
  createWindow()
  setMainMenu()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

function setMainMenu() {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { label: 'Hide ' + app.name, role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' },
        ],
      },
    ])
  )
}
