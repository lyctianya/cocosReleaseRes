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

const prefabLists: Array<string> = [
  "prefab/prefab1",
  "prefab/prefab2",
  "prefab/prefab3",
  "prefab/prefab4",
];

const listInfo = [
  { name: "图片", type: 0 },
  { name: "预制", type: 1 },
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
    } else {
      const url = prefabLists[this.curIndex++ % prefabLists.length];
      cc.loader.loadRes(url, (e, prefab) => {
        if (e) {
          return;
        }
        const node = cc.instantiate(prefab);
        this.content.addChild(node);
        this.addTouchListener(node);
        node.path = url;
      });
    }
  }

  removeItem() {
    if (this.selectItem) {
      this.selectItem.destroy();
      if(this.curMode===0){
        const dep = cc.loader.getDependsRecursively(this.selectItem.getComponent(cc.Sprite).spriteFrame);
        console.log("dep",dep);
        cc.loader.release(dep);
      }else{
        const dep = cc.loader.getDependsRecursively(this.selectItem.path);
        console.log("dep",dep);
        cc.loader.release(dep);
      }
      this.selectItem = null;
    }
  }

  // update (dt) {}
}
