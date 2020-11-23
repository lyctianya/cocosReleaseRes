"use strict";

const Fs = require("fs");
const cp = require("child_process");
const { ipcRenderer } = require("electron");
const { getuid } = require("process");
const { callbackify } = require("util");

var PATH = {
    html: Editor.url("packages://export-assets/panel/index.html"),
    style: Editor.url("packages://export-assets/panel/index.css"),
};

var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: {
            files: [],
        },
        methods: {
            selecteFiles(event) {
                this.files = [];
                for (let v of event.target.files) {
                    this.files.push(v.path);
                }
            },
            fspathToUrl(fspath) {
                if (fspath.indexOf(Editor.Project.path) !== 0) {
                    Editor.error(`Error path:${fspath}`);
                    return null;
                }
                const tmp = fspath.slice(Editor.Project.path.length + 1);
                if (tmp.indexOf("assets") == 0) {
                    return `db://${tmp}`.replace(/\\/g, "/");
                }
            },

            urlToFspath(url) {
                return url
                    .replace("db://", Editor.Project.path + "/")
                    .replace(/\\/g, "/");
            },

            query(func, params) {
                return new Promise((resolve, reject) => {
                    func(params, (e, ret) => {
                        if (e) {
                            reject(null);
                        } else {
                            resolve(ret);
                        }
                    });
                });
            },
            getFileConent(fspath) {
                return Fs.readFileSync(fspath, "utf-8");
            },
            async getDependAssets(url) {
                const fspath = this.urlToFspath(url);
                const content = this.getFileConent(fspath);
                let ret = [];
                function getUuid(info) {
                    if (info && typeof info === "object") {
                        if (info instanceof Array) {
                            info.forEach((v) => {
                                getUuid(v);
                            });
                        } else {
                            if (info.hasOwnProperty("__uuid__")) {
                                ret.push(info.__uuid__);
                            } else {
                                for (let k in info) {
                                    getUuid(info[k]);
                                }
                            }
                        }
                    }
                }
                getUuid(JSON.parse(content));
                let urls = [];
                for (let i = 0; i < ret.length; i++) {
                    urls.push(
                        await this.query(Editor.assetdb.queryUrlByUuid.bind(this), ret[i])
                    );
                }
                return new Promise(resolve => {
                    resolve(urls)
                })
            },
            async showDepences() {
                let ret = [];
                for (let i = 0; i < this.files.length; i++) {
                    ret = ret.concat(await this.getDependAssets(this.fspathToUrl(this.files[i])))
                }
                Editor.log("ret", ret);
            },
        },
    });
};

// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
    template: Fs.readFileSync(PATH.html, "utf-8"),
    style: Fs.readFileSync(PATH.style, "utf-8"),
    $: {
        app: "#app",
    },
    ready() {
        this.vm = createVM(this.$app);

        // for (let k in Editor.assetdb) {
        //   Editor.log(k);
        // }

        ipcRenderer.on("init", (event, arg) => {
            this.vm.flag = true;
            this.vm.send();
        });
        ipcRenderer.on("close", (event, arg) => {
            this.vm.flag = false;
        });
    },
});
