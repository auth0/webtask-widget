import Bluebird from 'bluebird';
import { EventEmitter } from 'events';
import ComponentStack from 'lib/componentStack';


export default class Widget extends EventEmitter {
    constructor(Component, options) {
        super();
        
        if (!options.mount) {
            throw new Error('Modal mounting is not currently supported.');
        }
        
        this._queue = [];
        this.component = null;
        this.stack = options.stack instanceof ComponentStack
            ?   options.stack
            :   new ComponentStack(options.mount);
        
        this.widgetWillMount(Component, options);
    }
    
    widgetWillMount(Component, options) {
        const component = this.stack.push(Component, options);
        
        this.widgetDidMount(component);
    }
    
    widgetDidMount(component) {
        this.component = component;
        
        this._flushQueue();
    }
    
    destroy() {
        while (this.stack.length) {
            this.stack.pop();
        }
        
        while (this._queue.length) {
            const { dfd } = this._queue.shift();
            
            dfd.reject(new Error('Component unmounted before invocation.'));
        }
        
        
        this.component = null;
    }
    
    _enqueue(method, args) {
        const dfd = defer();
        
        this._queue.push({ method, args, dfd });
        this._maybeFlushQueue();
        
        return dfd.promise;
    }
    
    _flushQueue() {
        if (!this.component) {
            throw new Error('Widget method queue is being flushed before mount. Did you set `this.component` in your custom `componentDidMount` handler?');
        }
        
        const flushNext = (ret) => {
            if (!this._queue.length) return Bluebird.resolve(ret);
            
            const { method, args, dfd } = this._queue.shift();
            const invocation = Bluebird.method(this.component[method]);
            const promise = invocation.apply(this.component, args);
            
            dfd.resolve(promise);
            
            return promise
                .then(flushNext);
        };
        
        return flushNext();
    }
    
    _maybeFlushQueue() {
        if (this.component) this._flushQueue();
    }
}


function defer() {
    let resolve;
    let reject;
    const promise = new Bluebird((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    
    return { resolve, reject, promise };
}
