
cc.Class({
    extends: cc.Component,

    properties: {
        mousePosition: {default: cc.v2(1,1) , type: cc.Vec2 },
    },

    onLoad () {
        this._isClicked = false;
        this.initMouseInputs();
    },

    initMouseInputs: function() {

        this.node.on(cc.Node.EventType.MOUSE_DOWN, function (event) {
            this._isClicked = true;
            this.mousePosition = this.getPosition(event.getLocation());
        }, this);
        
        this.node.on(cc.Node.EventType.MOUSE_MOVE, function(event) {
            if(this._isClicked)
            {
                this.mousePosition = this.getPosition(event.getLocation());//
            }
        }, this);
        
        this.node.on(cc.Node.EventType.MOUSE_UP, function (event) {
            this._isClicked = false;
        }, this);

    },

    getPosition: function(eventPos) {
        var canvasPos = cc.find("Canvas");
        canvasPos = canvasPos.getPosition();

        return new cc.v2(eventPos.x - canvasPos.x, eventPos.y - canvasPos.y);
    },

    // start () {},

    // update (dt) {},
});
