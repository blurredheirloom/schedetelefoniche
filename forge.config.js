module.exports = {
  packagerConfig: {
      executableName: "schede",
      icon: './icon',
      asar: true
  },
  rebuildConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'blurredheirloom',
          name: 'schedetelefoniche'
        },
        prerelease: true
      },
      draft: true
    }
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Matteo Stracquadanio',
        description: 'Catalogo Schede Telefoniche'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      executableName: "schede",
      config: {
        options: {
          icon: './icon.ico',
          name: 'com.emme.schede',
          productName: 'Schede Telefoniche'
        }
      }
    },
    {
      name: '@electron-forge/maker-deb',
      executableName: "schede",
      config: {
        options: {
          icon: './icon.png',
          name: 'com.emme.schede',
          productName: 'Schede Telefoniche'
        }
      }
    }
  ],
};
