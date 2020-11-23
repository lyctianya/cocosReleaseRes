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
    "prefab/spine",
    "prefab/dragon",
    "prefab/prefab1",
    "prefab/prefab2",
    "prefab/prefab3",
    "prefab/prefab4",
];

const listInfo = [
    { name: "图片", type: 0 },
    { name: "预制", type: 1 },
    { name: "url", type: 2 },
    { name: "dragon", type: 3 },
    { name: "spine", type: 4 },
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

    @property(cc.Node)
    dragonNode: cc.Node = null;

    @property(cc.Node)
    spineNode: cc.Node = null;

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
                console.log("点到我了", cnode.type);
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
            cc.resources.load(url, cc.SpriteFrame, (e, sp: cc.SpriteFrame) => {
                if (e) {
                    console.log("error?");
                    return;
                }
                let node = new cc.Node();
                node.addComponent(cc.Sprite);
                node.getComponent(cc.Sprite).spriteFrame = sp;
                this.content.addChild(node);
                this.addTouchListener(node);
                node.width = 200;
                node.height = 100;
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
                this.content.addChild(node);
                this.addTouchListener(node);
                node.width = 200;
                node.height = 100;
                node.path = url;
                console.log("add image");
            });
        } else if (this.curMode == 1) {
            const url = prefabLists[this.curIndex++ % prefabLists.length];
            cc.resources.load(url, (e, prefab: cc.Prefab) => {
                if (e) {
                    console.log("错了。。。。。。");
                    return;
                }
                const node = cc.instantiate(prefab);
                this.content.addChild(node);
                this.addTouchListener(node);
                node.path = prefab;
            });
        } else if (this.curMode === 3) {
            cc.resources.load(
                "ani/dragonBones2/texture.png",
                cc.Texture2D,
                (e, texture: cc.Texture2D) => {
                    cc.resources.load(
                        "ani/dragonBones2/NewDragonTest.txt",
                        (e, assetJson) => {
                            if (e) {
                                console.log("error spine");
                                return;
                            }
                            cc.resources.load(
                                "ani/dragonBones2/texture.txt",
                                (e, altJson) => {
                                    if (e) {
                                        console.log("error spine");
                                        return;
                                    }
                                    const node = new cc.Node();
                                    node.width = 200;
                                    node.height = 200;
                                    node.active = true;
                                    this.content.addChild(node);
                                    this.addTouchListener(node);
                                    node.addComponent(dragonBones.ArmatureDisplay);
                                    const dragon = node.getComponent(dragonBones.ArmatureDisplay);

                                    var atlas = new dragonBones.DragonBonesAtlasAsset();
                                    atlas._uuid = "ani/dragonBones2/texture.txt";
                                    atlas.atlasJson = altJson;
                                    atlas.texture = texture;

                                    var dasset = new dragonBones.DragonBonesAsset();

                                    dasset.dragonBonesJson = assetJson;
                                    dasset._uuid = "ani/dragonBones2/NewDragonTest.txt";

                                    dragon.dragonAtlasAsset = atlas;
                                    dragon.dragonAsset = dasset;
                                    dragon.armatureName = "armatureName";

                                    dragon.playAnimation("stand", 0);
                                }
                            );
                        }
                    );
                }
            );
        } else if (this.curMode === 4) {
            cc.resources.load(
                "ani/spineboy/spineboy.json",
                sp.SkeletonData,
                (e, sdata: sp.SkeletonData) => {
                    if (e) {
                        console.log("error spine");
                        return;
                    }
                    const node = cc.instantiate(this.spineNode);
                    const spine = node.getChildByName("ani").getComponent(sp.Skeleton);
                    spine.skeletonData = sdata;
                    node.active = true;
                    this.content.addChild(node);
                    this.addTouchListener(node);
                }
            );
        }
    }

    showInfo() {

        if (this.selectItem) {
            switch (this.curMode) {
                case 0:
                    console.log(this.selectItem.getComponent(cc.Sprite).spriteFrame._uuid)
                default:
                    console.log("nothing");
            }
        }

    }

    removeItem() {
        if (this.selectItem) {
            this.selectItem.destroy();
            if (this.curMode === 0) {
                const tmpsp = this.selectItem.getComponent(cc.Sprite).spriteFrame;

                const ret: Array<string> = cc.assetManager.dependUtil.getDeps(tmpsp._uuid)
                ret.forEach(v => {
                    cc.assetManager.releaseAsset(v);
                })
            } else if (this.curMode === 1) {
                cc.assetManager.releaseAsset(this.selectItem.path)
            } else if (this.curMode === 2) {
                cc.assetManager.releaseAsset(this.selectItem.path)
            } else if (this.curMode === 3) {
                const dragon = this.selectItem.getComponent(
                    dragonBones.ArmatureDisplay
                );
                cc.assetManager.releaseAsset(dragon.dragonAtlasAsset)
                cc.assetManager.releaseAsset(dragon.dragonAsset)
                cc.assetManager.releaseAsset(dragon.getMaterial(0))

            } else if (this.curMode === 4) {
                const spine = this.selectItem
                    .getChildByName("ani")
                    .getComponent(sp.Skeleton);
                cc.assetManager.releaseAsset(spine.skeletonData)
                cc.assetManager.releaseAsset(spine.getMaterial(0))
            }

            this.selectItem = null;
        }
    }
}
