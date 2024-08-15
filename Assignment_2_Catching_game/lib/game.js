import { Player } from "./player.js"

export class Game{
    constructor(players, corners, playground){
        /*players = array of Player objects,
        corners = number of corners,
        playground = Polygon object*/
        this.players = players;
        this.positions = playground.getPositions();
        this.boardState = Array(corners);
        this.catcher = null;
        this.target;
        this.steps = 10;
        this.currentStep = 0;
        this.catcherArrow = null;
        this.initializeBoard();
    }

    initializeBoard(){
        //initialize boardState with 0s, then random positions -----example----> [0, 0, 3, 0, 1, 0, 0, 2] for 3 players
        this.boardState.fill(0);
        for(let i = 1; i <= this.players.length; i++){
            while(true){
                var index = Math.floor(Math.random()*this.boardState.length);
                if(this.boardState[index] == 0){
                    this.boardState[index] = i;
                    break;
                }
            }
            // console.log(i-1, index)
            this.players[i-1].set(this.positions[index]);
        }
        return;
    }

    startGame(){
        this.currentStep = 0;
        //pick a random player and assign it to catcher, if no player is assigned to catcher
        if(this.catcher == undefined){
            this.catcher = this.players[Math.floor(Math.random()*this.players.length)];
            this.catcherArrow.set(this.catcher.initial);
            this.catcherArrow.additionalArgs['show'] = true;

        }
        this.catcher.set(this.catcher.initial);
        this.catcher.setColor([200, 200, 0]);
        this.catcherArrow.set(this.catcher.initial);
        this.catcherArrow.additionalArgs['show'] = true;

        //pick a random player from the remaining players and assign it to target
        this.target = this.players[Math.floor(Math.random()*this.players.length)];
        while(this.target == this.catcher){
            this.target = this.players[Math.floor(Math.random()*this.players.length)];
        }

        //set the final position of the catcher to the target's initial position
        this.catcher.setFinal(this.target.initial);
        this.catcherArrow.setFinal(this.target.initial);

        //change target's final position to a random unoccupied corner
        var index = Math.floor(Math.random()*this.boardState.length);
        while(this.boardState[index] != 0){
            index = Math.floor(Math.random()*this.boardState.length);
        }
        this.target.set(this.target.initial);
        this.target.setFinal(this.positions[index]);
    }

    setResetCatcher(index){

        if(index > this.players.length){
            return new Error('player index out of range');
        }
        if(this.catcher != undefined && this.players[index].pcolor !== this.catcher.pcolor){
            alert('please refresh page to reset catcher');
            return;
        }

        this.catcher = this.players[index];
        this.catcherArrow.set(this.catcher.initial);
        this.catcherArrow.additionalArgs['show'] = true;
        console.log(this.catcherArrow)
        this.startGame();        
    }

    setArrow(arrow){
        this.catcherArrow = arrow;
        // this.catcherArrow.transform.applyXYZDeg2Rad(0, -90, 0,false);
    }

    update(){
        //moves the catcher and the target by one step
        if(!this.catcher) return
        this.catcher.move(this.currentStep);
        this.catcherArrow.move(this.currentStep);
        this.target.move(this.currentStep);

        //if the current step was the last one, reset the current step and update the initial and final positions
        //also update the boardState
        if(this.currentStep == this.steps){
            this.boardState[this.boardState.indexOf(this.catcher.id)] = 0;
            this.boardState[this.boardState.indexOf(this.target.id)] = 0;
            this.boardState[this.positions.indexOf(this.target.final)] = this.target.id;
            this.boardState[this.positions.indexOf(this.catcher.final)] = this.catcher.id;
            this.catcher.initial = this.catcher.final;
            this.target.initial = this.target.final;
            this.catcherArrow.initial = this.catcherArrow.final;
            this.startGame();
            return;
        }
        
        //else increment the current step
        this.currentStep++;
    }

    snapCatcher(){
        this.currentStep = this.catcher.snap();
        console.log(this.currentStep);
        this.update();

        return;
    }

    scaleCatcher(scale){
        if(!this.catcher) return
        console.log(this.catcher);
        this.catcher.incrementDynamicScaling(scale,scale,scale);
        this.catcherArrow.incrementDynamicScaling(scale,scale,scale);
    }
}