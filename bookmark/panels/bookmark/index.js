const Fs = require('fire-fs');
const os = require('os');
const exec = require('child_process').exec;
// const path = require('fire-path');
const electron = require('electron');
const {dialog,shell} = electron.remote;
const top = electron.remote.getCurrentWindow();

// const mainWindow = electron.remote.

// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  // css style for panel
  style: Fs.readFileSync(
    Editor.url('packages://custom-panel/panels/bookmark/index.css'),
    'utf-8'
  ),

  // html template for panel
  template: Fs.readFileSync(
    Editor.url('packages://custom-panel/panels/bookmark/index.html'),
    'utf-8'
  ),

  // element and variable binding
  $: {
  },

  // method executed when template and styles are successfully loaded and initialized
  ready () {
    // 读取配置文件
    let bookmarkData = {};
    const configPath = Editor.url('packages://custom-panel/panels/bookmark/config.json');
    if (Fs.existsSync(configPath)) {
      const file = Fs.readFileSync(
        configPath,
        'utf-8'
      );
      bookmarkData = JSON.parse(file);
    }
    let inputNewCategory = null;
    let inputNewDirname = null;

    this.plugin = new window.Vue({
      el: this.shadowRoot,
      data: {
        newCategory: '',
        newDirName: '',
        bookmarkData: bookmarkData,
      },
      methods: {
        inputCategory(e) {
          inputNewCategory = e.currentTarget;
          this.newCategory = e.currentTarget.value;
        },
        inputDirName(e) {
          inputNewDirname = e.currentTarget;
          this.newDirName = e.currentTarget.value;
        },
        addCategory() {
          if (!this.newCategory) {
            dialog.showMessageBox(top, {
              type: 'info',
              title: '错误',
              message: '分类名不能为空'
            });
            return;
          }
          if (this.newCategory) {
            if (!this.bookmarkData) {
              this.bookmarkData = {};
            }
            if (this.bookmarkData[this.newCategory]) {
              dialog.showMessageBox(top, {
                type: 'info',
                title: '错误',
                message: '分类已存在'
              });
              return;
            }
            this.bookmarkData[this.newCategory] = [];
            this.bookmarkData = JSON.parse(JSON.stringify(this.bookmarkData));
            if (!Fs.existsSync(configPath)) {
              const fsExtra = Editor.require('fs-extra');
              fsExtra.createFileSync(configPath);
            }
            Fs.writeFileSync(configPath, JSON.stringify(this.bookmarkData));
            this.newCategory = '';
            inputNewCategory.value = this.newCategory;
          }
        },
        addDir(event) {
          if (!this.newDirName) {
            dialog.showMessageBox(top, {
              type: 'info',
              title: '错误',
              message: '添加目录不能为空'
            });
            return;
          }
          const category = event.currentTarget.dataset.category;
          let found = false;
          this.bookmarkData[category].some(bookmark=>{
            if (bookmark.name == this.newDirName) {
              found = true;
              return true;
            }
          });
          if (found) {
            dialog.showMessageBox(top, {
              type: 'info',
              title: '错误',
              message: '书签名已存在'
            });
            return;
          }
          const result =dialog.showOpenDialog(top,{properties: ['openDirectory']});
          if (result && category) {
            this.bookmarkData[category].push({
              name: this.newDirName,
              path: result
            });
            Fs.writeFileSync(configPath, JSON.stringify(this.bookmarkData));
            this.newDirName = '';
            inputNewDirname.value = this.newDirName;
          }
        },
        openDir(event) {
          const openPath = event.currentTarget.dataset.openpath;
          // console.log(os.type());
          if (os.type() == 'Windows_NT') {
            exec(`explorer.exe ${openPath}`);
          } else if (os.type() == 'Darwin') {
            exec(`open ${openPath}`);
          }
          shell.openExternal(openPath);
        },
        delDir(event) {
          const delname = event.currentTarget.dataset.delname;
          const category = event.currentTarget.dataset.category;
          if (delname && category) {
            this.bookmarkData[category].some((dirs, index)=>{
              if (dirs.name == delname) {
                this.bookmarkData[category].splice(index, 1);
                return true;
              }
            });

            Fs.writeFileSync(configPath, JSON.stringify(this.bookmarkData));
          }
        },
        delCategory(event) {
          const category = event.currentTarget.dataset.category;
          const msg = this.bookmarkData[category].length > 0 ?'该分类下书签不为空,是否删除?' :`是否删除书签[${category}]?`;
          dialog.showMessageBox(top, {
            type: 'info',
            title: '提示',
            message: msg,
            buttons: ['确认','取消']
          }, index=>{
            // console.log(`【你点击了${index ? '取消' : '确定'}！！】`)
            if (index == 0) {
              delete this.bookmarkData[category];
              this.bookmarkData = JSON.parse(JSON.stringify(this.bookmarkData));
              Fs.writeFileSync(configPath, JSON.stringify(this.bookmarkData));
            }
          });
        }
      }
    });
  },

  // register your ipc messages here  
  messages: {
    'custom-panel.bookmark:updateLeftData' (event, data) {
      setTimeout(() => {
        Editor.Ipc.sendToPanel('custom-panel.right-content', 'custom-panel.right-content:updateRightData', data);
      }, 1000);
      // const fsExtra = Editor.require('packages://custom-panel/node_modules/fs-extra');
      // fsExtra.mkdir(path.join(Editor.Project.path, 'tmpDir'))
    }
  }
});