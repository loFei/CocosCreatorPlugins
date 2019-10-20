const fs = require('fire-fs');
// const path = require('fire-path');
// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: fs.readFileSync(
    Editor.url('packages://custom-panel/panels/main-panel/index.css'),
    'utf-8'
  ),

  // html template for panel
  template: fs.readFileSync(
    Editor.url('packages://custom-panel/panels/main-panel/index.html'),
    'utf-8'
  ),

  // element and variable binding
  $: {
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    this.plugin = new window.Vue({
      el: this.shadowRoot,
      data: {
        num: 0,
      },
      methods: {
        onResetLayout() {
          if (Editor.Window.isMainProcess) {
            Editor.Window.main.resetLayout('packages://custom-panel/layout/default.json');
          } else {
            Editor.remote.Window.main.resetLayout('packages://custom-panel/layout/default.json');
          }
        },
        onUpdateNum(event) {
          this.num = event.currentTarget.value;
        },
        onSendToLeftPanel() {
          Editor.Ipc.sendToPanel('custom-panel.bookmark', 'custom-panel.bookmark:updateLeftData', this.num);
        }
      },
    });
  },

  // register your ipc messages here
  messages: {
    'custom-panel.main:resetData' (event, data) {
      this.plugin.num = data;
      setTimeout(() => {
        this.plugin.num = 0;
      }, 1000);
      // const fsExtra = Editor.require('packages://custom-panel/node_modules/fs-extra');
      // fsExtra.mkdir(path.join(Editor.Project.path, 'tmpDir'))
    },
    // 'custom-panel:hello' (event) {
    //   this.plugin.num = 'Hello!';
    //   const fsExtra = Editor.require('packages://custom-panel/node_modules/fs-extra');
    //   fsExtra.mkdir(path.join(Editor.Project.path, 'tmpDir'))
    // }
  }
});