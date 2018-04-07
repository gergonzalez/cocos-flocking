// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        _velocity: {default: cc.Vec2(-1,-2) , type: cc.Vec2 },
        _desired: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _steering: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _ahead: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _behind: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _prevInput: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        mass: 1,
        max_velocity: 10,
        max_force: 5,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        let drawing = this.node.getComponent(cc.Graphics);
        drawing.circle(0,0,50);
        drawing.fillColor = cc.Color.BLUE;
        drawing.fill();
    },

    update (dt) {

            
            // position = position.add(velocity);
            
            // x = position.x;
            // y = position.y;
            
            // // Adjust boid rodation to match the velocity vector.
            // rotation = 90 + (180 * getAngle(velocity)) / Math.PI;
            
            // // Check if the boid is outside the screen.
            // if (position.x >= Game.width || position.x < 0 || position.y >= Game.height || position.y < 0) {
            //     position.x = Game.width / 2;
            //     position.y = Game.height / 2;
            // }

        let input = this.node.parent.getComponent("InputManager");

        this._steering.mulSelf(0);

        let force = this._seek( input.mousePosition );

            this._steering.addSelf( force );

            this._truncate( this._steering , this.max_force); 
            this._steering.mulSelf(1 / this.mass);

            this._velocity.addSelf(this._steering);
            this._truncate(this._velocity, this.max_velocity);

            let pos = this.node.position;
            pos.addSelf(this._velocity);
            this.node.setPosition(pos);

            this._prevInput = input.mousePosition;

            this.node.parent.setPosition(pos);


    },

    _truncate( vector , max ){
        let n = 0;

        n = max / vector.mag();
        n = n < 1.0 ? n : 1.0;
            
        vector.mulSelf(n);
    },    

    _seek(target, slowingRadius = 50){
        let force = cc.v2(0,0);
        let distance = 0;
        
        target.sub(this.node.position, this._desired);
        
        distance = this._desired.mag();

        if( !this._desired.equals( cc.v2(0,0) ) ){
            this._desired.normalizeSelf();
        }
        
        if ( distance < slowingRadius) {
            this._desired.mulSelf(this.max_velocity * distance/slowingRadius);
        } else {
            this._desired.mulSelf(this.max_velocity);
        }
        
        this._desired.sub(this._velocity, force);
        
        return force;
    },


});
