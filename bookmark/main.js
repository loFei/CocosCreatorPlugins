'use strict';

module.exports = {
  load () {
    // execute when package loaded
  },

  unload () {
    // execute when package unloaded
  },

  // register your ipc messages here
  messages: {
    // 'open' () {
    //   // open entry panel registered in package.json
    //   Editor.Panel.open('custom-panel.main');
    // },
    'bookmark' () {
      Editor.Panel.open('custom-panel.bookmark');
    },
    // 'open-all-panel' () {
    //   // Editor.Window.main.resetLayout('packages://custom-panel/layout/default.json');
    //   Editor.Panel.open('custom-panel.main');
    //   Editor.Panel.open('custom-panel.bookmark');
    //   Editor.Panel.open('custom-panel.right-content');
    // }
  },
};