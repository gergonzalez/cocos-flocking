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

        _velocity: {default: cc.Vec2(-2,-4) , type: cc.Vec2 },
        _desired: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _steering: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _ahead: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        _behind: {default: cc.Vec2(0,0) , type: cc.Vec2 },
        mass: 1,
        wanderAngle: 0,
        max_velocity: 6,
        max_force: 3,
        max_separation: 2.0,
        separation_radius: 75,
        leader_behind_dist: 50,
        leader_sight_radius: 50,
        _i:0,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        let drawing = this.node.getComponent(cc.Graphics);
        drawing.circle(0,0,25);
        drawing.fillColor = cc.Color.RED;
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

        this._steering.mulSelf(0);

        let leader = cc.find("Canvas/leader").getComponent("Leader");

        let leaderForce = this._followLeader(leader);

        this._i++;

        if(this._i > 500){
            console.log(leaderForce);
            this._i = 0;
        }

        this._steering.addSelf(leaderForce);

        this._truncate( this._steering , this.max_force); 
        this._steering.mulSelf(1 / this.mass);

        this._velocity.addSelf(this._steering);
        this._truncate(this._velocity, this.max_velocity * (0.3 + Math.random() * 0.5));

        // let pos = this.node.position.addSelf(this._velocity);

        let pos = this.node.position;
        pos.addSelf(this._velocity);
        this.node.position = pos;

        // Adjust boid rodation to match the velocity vector.
        this.node.rotation = 90 + (180 * this._getAngle(this._velocity)) / Math.PI;

    },

    _seek(target, slowingRadius = 0){
        let force = cc.v2(0,0);
        let distance = 0;
        
        target.sub(this.node.position, this._desired);
        
        distance = this._desired.mag();

        if( !this._desired.equals( cc.v2(0,0) ) ){
            this._desired.normalizeSelf();
        }
        
        if (distance <= slowingRadius && slowingRadius != 0) {
            this._desired.mulSelf(this.max_velocity * distance/slowingRadius);
        } else {
            this._desired.mulSelf(this.max_velocity);
        }
        
        this._desired.sub(this._velocity, force);
        
        return force;
    },

    _arrive(target, slowingRadius = 200) {
        return this._seek(target, slowingRadius);
    },

    _separation() {
        let force = cc.v2(0,0);
        let neighborCount = 0;
        
        for (let i = 0; i < this.node.parent.getChildrenCount() ; i++) {
            let b = this.node.parent.getChildren()[i];
            
            if (b != this.node && this._distance(b.position, this.node.position) <= this.separation_radius) {
                force.x += b.position.x - this.node.position.x;
                force.y += b.position.y - this.node.position.y;
                neighborCount++;
            }
        }
        
        if (neighborCount != 0) {
            force.divSelf(neighborCount)
            force.mulSelf( -1);
        }
        
        if( !force.equals( cc.v2(0,0) ) ){
            force.normalizeSelf();
        }
        
        force.mulSelf(this.max_separation);
        
        return force;
    },


    _followLeader (leader) {
        let tv = leader._velocity.clone();
        let force = cc.v2(0,0);
        
        tv.normalizeSelf();
        tv.mulSelf(this.leader_behind_dist);

        tv.add( leader.node.position.clone() ,this._ahead);  

        tv.mulSelf(-1);
        tv.add( leader.node.position.clone() ,this._behind);  

        if (this._isOnLeaderSight(leader.node, this._ahead)) {
            force.addSelf(this._evade(leader));
        } 

        force.addSelf(this._arrive(this._behind, 200));
        force.addSelf(this._separation());

        return force;
    },

    _evade(target) {
        let distance = cc.v2(0,0);
        target.node.position.sub(this.node.position, distance);
        
        let updatesNeeded = distance.mag() / this.max_velocity;

        let tv = target._velocity.clone();
        tv.mulSelf(updatesNeeded);
        
        let targetFuturePosition = cc.v2(0,0);
        tv.add( target.node.position.clone(), targetFuturePosition );
        
        return this._flee(targetFuturePosition);
    },

    _flee(target) {
        let force = cc.v2(0,0);
        
        this.node.position.sub(target, this._desired);
        this._desired.normalizeSelf();
        this._desired.mulSelf(this.max_velocity);
        
        this._desired.sub(this._velocity, force);
        
        return force;
    },

    _isOnLeaderSight(leader, leaderAhead){
        return this._distance(leaderAhead, this.node.position ) <= this.leader_sight_radius || this._distance(leader.position, this.node.position) <= this.leader_sight_radius;
    },

    _distance(a, b){
        return Math.sqrt((a.x - b.x) * (a.x - b.x)  + (a.y - b.y) * (a.y - b.y));
    },

    _truncate( vector , max ){
        let n = 0;

        n = max / vector.mag();
        n = n < 1.0 ? n : 1.0;
            
        vector.mulSelf(n);
    },    

    _getAngle(vector){
        return Math.atan2(vector.y, vector.x);
    },


});
