const fs = require('fire-fs');
// const path = require('fire-path');
// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: fs.readFileSync(
    Editor.url('packages://custom-panel/panels/right-content/index.css'),
    'utf-8'
  ),

  // html template for panel
  template: fs.readFileSync(
    Editor.url('packages://custom-panel/panels/right-content/index.html'),
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
        num: 0
      },
      methods: {
        onBtnClick() {
          this.dirs.push(
            this.dirs.length
          );
        }
      }
    });
  },

  // register your ipc messages here
  messages: {
    'custom-panel.right-content:updateRightData' (event, data) {
      this.plugin.num = data;
      setTimeout(() => {
        Editor.Ipc.sendToPanel('custom-panel.main', 'custom-panel.main:resetData', this.plugin.num);
        this.plugin.num = 0;
      }, 1000);
      // const fsExtra = Editor.require('packages://custom-panel/node_modules/fs-extra');
      // fsExtra.mkdir(path.join(Editor.Project.path, 'tmpDir'))
    }
  }
});