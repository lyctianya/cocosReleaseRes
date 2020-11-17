// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

const imgLists: Array<string> = [
  "textures/img1",
  "textures/img2",
  "textures/img3",
  "textures/img4",
  "textures/img5",
  "textures/img6",
];

const urlLists: Array<string> = [
  "//cdn.51talk.com/apollo/images/369851e8d136792ff517cc1bb3632c1e.jpg",
  "//cdn.51talk.com/apollo/images/4bebbc2b88cfc4c8e040b2eb9d9fb27b.jpg",
  "//cdn.51talk.com/apollo/images/1fedf73076abee678bc32d606e213fd4.jpg",
  "//cdn.51talk.com/apollo/images/afa768033434d3ae4c5af7c64f15d63b.jpg",
];

const prefabLists: Array<string> = [
  "prefab/prefab1",
  "prefab/prefab2",
  "prefab/prefab3",
  "prefab/prefab4",
];

const listInfo = [
  { name: "图片", type: 0 },
  { name: "预制", type: 1 },
  { name: "url", type: 2 },
];

@ccclass
export default class NewClass extends cc.Component {
  @property(cc.Node)
  containter: cc.Node = null;

  @property(cc.Layout)
  list: cc.Layout = null;

  @property(cc.Prefab)
  listItem: cc.Prefab = null;

  @property(cc.Node)
  content: cc.Node = null;

  private selectItem: cc.Node = null;
  private curMode: number = 0;
  private curIndex = 0;

  onLoad() {
    listInfo.forEach((info) => {
      const cnode = cc.instantiate(this.listItem);
      cnode.type = info.type;
      cnode.getChildByName("lb").getComponent(cc.Label).string = info.name;
      this.list.node.addChild(cnode);
      cnode.on(cc.Node.EventType.TOUCH_END, () => {
        console.log("点到我了",cnode.type);
        this.curMode = cnode.type;
      });
    });
  }

  addTouchListener(node: cc.Node) {
    node.on(cc.Node.EventType.TOUCH_END, () => {
      if (this.selectItem) {
        this.selectItem.scale = 1;
      }
      this.selectItem = node;
      this.selectItem.scale = 1.1;
    });
  }

  addItem() {
    if (this.curMode === 0) {
      const url = imgLists[this.curIndex++ % imgLists.length];
      cc.loader.loadRes(url, cc.SpriteFrame, (e, sp) => {
        if (e) {
          console.log("error?");
          return;
        }
        let node = new cc.Node();
        node.addComponent(cc.Sprite);
        node.getComponent(cc.Sprite).spriteFrame = sp;
        node.width = 200;
        node.height = 100;
        this.content.addChild(node);
        this.addTouchListener(node);
        node.path = url;
        console.log("add image");
      });
    } else if (this.curMode == 2) {
      const url = urlLists[this.curIndex++ % urlLists.length];
      cc.loader.load({ url, type: "jpg" }, (e, tex) => {
        if (e) {
          console.log("error?");
          return;
        }
        let node = new cc.Node();
        node.addComponent(cc.Sprite);
        node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
        node.width = 200;
        node.height = 100;
        this.content.addChild(node);
        this.addTouchListener(node);
        node.path = url;
        console.log("add image");
      });
    } else if (this.curMode == 1) {
      console.log("预制。。。");
      const url = prefabLists[this.curIndex++ % prefabLists.length];
      cc.loader.loadRes(url, (e, prefab) => {
        if (e) {
          console.log("错了。。。。。。");
          return;
        }
        const node = cc.instantiate(prefab);
        console.log("秒？？");
        this.content.addChild(node);
        this.addTouchListener(node);
        node.path = url;
      });
    }
  }

  removeItem() {
    if (this.selectItem) {
      this.selectItem.destroy();
      if (this.curMode === 0) {
        const dep = cc.loader.getDependsRecursively(
          this.selectItem.getComponent(cc.Sprite).spriteFrame
        );
        console.log("dep", dep);
        cc.loader.release(dep);
      } else if (this.curMode === 1) {
        const dep = cc.loader.getDependsRecursively(this.selectItem.path);
        console.log("dep", dep);
        cc.loader.release(dep);
      } else if (this.curMode === 2) {
        const dep = cc.loader.getDependsRecursively(
          this.selectItem.path
        );
        console.log("dep", dep);
        cc.loader.release(dep);
      }
      this.selectItem = null;
    }
  }

  // update (dt) {}
}
