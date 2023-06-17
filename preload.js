const { Titlebar, TitlebarColor } = require("custom-electron-titlebar");

window.addEventListener('DOMContentLoaded', () => {
  const options = {
    backgroundColor: TitlebarColor.fromHex('#1A1B1E'),
    tooltips: {
      minimize: 'Riduci',
      maximize: 'Massimizza',
      restoreDown: 'Ripristina',
      close: 'Chiudi'
    }
  };

  new Titlebar(options);
});




