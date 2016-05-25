import Ace from 'brace';
import Bluebird from 'bluebird';
import { EventEmitter } from 'events';
import ComponentStack from 'lib/componentStack';
import ReactDOM from 'react-dom';

const HashHandler = Ace.acequire('ace/keyboard/hash_handler').HashHandler;
const Event = Ace.acequire('ace/lib/event');
const KeyUtil = Ace.acequire('ace/lib/keys');
const UserAgent = Ace.acequire('ace/lib/useragent');


export default class Widget extends EventEmitter {
    constructor(Component, options = {}) {
        super();
        
        if (!options.mount) {
            throw new Error('Modal mounting is not currently supported.');
        }
        
        this._queue = [];
        this.component = null;
        this.stack = options.stack instanceof ComponentStack
            ?   options.stack
            :   new ComponentStack(options.mount);
        this.hashHandler = new HashHandler();
        
        if (options.events) {
            for (let eventName of Object.keys(options.events)) {
                const handlerName = options.events[eventName];
                const handler = options[handlerName];
                
                options[handlerName] = (...args) => {
                    if (handler) {
                        handler.apply(this.component, args);
                    }
                    
                    this.emit(eventName, ...args);
                };
            }
        }
        
        if (options.hotkeys) {
            const modKey = UserAgent.isMac ? 'Cmd' : 'Ctrl';
            
            for (let spec in options.hotkeys) {
                let handler = options.hotkeys[spec];
                let hotkey = spec.replace('Mod', modKey);
                
                this.hashHandler.bindKey(hotkey, (event, hotkey) => {
                    event.preventDefault();
                    
                    handler.call(this, event);
                    
                    return true;
                })
            }
        }
        
        this.widgetWillMount(Component, options);
    }
    
    widgetWillMount(Component, options) {
        const component = this.stack.push(Component, options, () => this.widgetDidMount(component));
    }
    
    widgetDidMount(component) {
        const node = ReactDOM.findDOMNode(component);
        
        this.component = component;

        this._flushQueue();
        
        Event.addCommandKeyListener(node, (e, hashId, keyCode) => {
            const keyString = KeyUtil.keyCodeToString(keyCode);
            const command = this.hashHandler.findKeyCommand(hashId, keyString);
    
            if (command && command.exec) {
                command.exec(e);
                Event.stopEvent(e);
            }
        });
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
    
    _enqueue(method, ...args) {
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
