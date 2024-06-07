class ActionHistory{
    constructor(){
        this.action = [];
    }

    setAction(isFlipped, oldColumn, newColumn, newRow){
        this.action.push([isFlipped, oldColumn, newColumn, newRow]);
    }

    getAction(){
        return this.action.pop();
    }

    hasData(){
        return this.action.length;
    }
};