import EventEmitter from 'eventemitter3';

export default class A0Widget extends EventEmitter {
    constructor(Component, options) {
        super();

        // this.promise = this.componentStack.push()
        this.ready = false;
        this.eventQueue = [];
        
        options.componentStack.push(Component, options);

        this.on('ready', () => {
            this.ready = true;

            this.eventQueue
                .forEach((e) => this.emit(e.name, e.data));
        });
    }

    emit(name, data) {
        if(this.ready || name === 'ready')
            return super.emit(name, data);

        this.eventQueue.push({ name, data });

        return this;
    }
}
