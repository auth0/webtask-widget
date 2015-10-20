import EventEmitter from 'eventemitter3';

export default class Widget extends EventEmitter {
    constructor(component, options) {
        super();

        this.component = component;
        this.ready = false;
        this.eventQueue = [];

        this.on('ready', () => {
            this.ready = true;

            this.eventQueue
                .forEach((e) => this.emit(e.name, e.data));
        });
    }

    emit(name, data) {
        if(this.ready || name === 'ready') {
            return super.emit(name, data);
        }

        this.eventQueue.push({ name, data });

        return this;
    }
}
