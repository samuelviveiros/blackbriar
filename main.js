const { app, BrowserWindow, Menu } = require('electron')

let mainWin

function createWindow() {
  mainWin = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWin.loadFile('src/index.html')

  mainWin.on('closed', () => {
    mainWin = null
  })

  let mainMenu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'DevTools',
          click() {
            mainWin.webContents.openDevTools()
          }
        },
        {type: 'separator'},
        {
          label: 'Exit',
          click() {
            app.quit()
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(mainMenu)
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit()
})

app.on('activate', () => {
  if (mainWin === null)
    createWindow()
})
