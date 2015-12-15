import { EventEmitter } from 'events';
import ComponentStack from 'lib/componentStack';


export default class Widget extends EventEmitter {
    constructor(Component, options) {
        super();
        
        if (!options.mount) {
            throw new Error('Modal mounting is not currently supported.');
        }
        
        this._queue = [];
        this.mounted = null;
        this.stack = options.stack instanceof ComponentStack
            ?   options.stack
            :   new ComponentStack(options.mount);
        
        this.widgetWillMount(Component, options);
    }
    
    widgetWillMount(Component, options) {
        this.stack.push(Component, options);
    }
    
    destroy() {
        while (this.stack.length) {
            this.stack.pop();
        }
    }
}



