import Bluebird from 'bluebird';
import EventEmitter from 'eventemitter3';
import LocalForage from 'localforage';
import Sandbox from 'sandboxjs';

import mapValues from 'lodash.mapvalues';

import ComponentStack from '../lib/componentStack';

import RequestVerificationComponent from '../components/requestVerification';


export default class A0Widget extends EventEmitter {
    constructor(Component, props, options = {}) {
        super();
        
        this._queue = [];
        this.mounted = null;
        this.componentStack = props.componentStack;
        
        if (!(this.componentStack instanceof ComponentStack)) {
            this.componentStack = new ComponentStack(props.mount);
        }
        
        const wrappedHandlers = mapValues(options.events, (eventName, handlerName) => {
            const handler = props[handlerName];
            
            return (...args) => {
                this.emit(eventName, ...args);
                
                return handler
                    ?   handler(...args)
                    :   undefined;
            };
        });
        
        const childProps = Object.assign({}, props, { componentStack: this.componentStack }, wrappedHandlers);
        
        const promise = options.requireLogin
            ?   this._requireLogin(Component, childProps)
            :   this._mount(Component, childProps);
        
        promise
            .finally(() => {
                this._rejectQueue();
            });
    }
    
    _mount(Component, props) {
        this.mounted = this.componentStack.push(Component, props);
        
        this._flushIfReady();
    }
    
    _requireLogin(Component, {
        mount = null,
        url = 'https://webtask.it.auth0.com',
        token = null,
        container = null,
        readProfile = null,
        writeProfile = null,
        storeProfile = false,
        storageKey = 'webtask.profile',
    } = {}) {
        const props = arguments[1];
        const showLogin = () => this.componentStack.push(RequestVerificationComponent, props).promise;

        // If we bootstrap the widget with a token, we need to be sure that we have
        // all the necessary information to constitute a valid Profile.
        if (token) {
            if (!container) throw new Error(`When passing a 'token' to
                webtaskWidget.open, you must also pass in a 'container' option.`);
    
            if (readProfile) throw new Error(`The 'readProfile' option
                cannot be present when specifying a 'token'.`);
    
            readProfile = () => Bluebird.resolve({
                container: container,
                token: token,
                url: url,
            });
        } else if (storeProfile) {
            readProfile = (options) => LocalForage.getItem(storageKey)
                .then((profile) => {
                    return profile
                        ?   profile
                        :   showLogin();
                });
    
            // When the 'storeProfile' options is provided, we set a default
            // 'writeProfile' handler to save the profile to the indicated (or default)
            // 'storageKey'.
            if (!writeProfile) {
                writeProfile = (profile) => LocalForage.setItem(storageKey, {
                    url: profile.url,
                    container: profile.container,
                    token: profile.token,
                });
            }
        } else {
            readProfile = showLogin;
        }
    
        // By default, a noop.
        if (!writeProfile) writeProfile = (profile) => Bluebird.resolve(profile);
        
        const options = {
            mount,
            url,
            token,
            container,
            readProfile,
            writeProfile,
            storeProfile,
            storageKey,
        };
        
        return Bluebird.resolve(readProfile(options))
            .then(validateProfile)
            .tap(writeProfile)
            .then((profile) => {
                return this._mount(Component, Object.assign({}, props, { profile }));
            });
    
        function validateProfile (profile) {
            if (!profile.container) throw new Error('Invalid profile: missing container');
            if (!profile.token) throw new Error('Invalid profile: missing token');
            if (!profile.url) throw new Error('Invalid profile: missing url');
    
            return Sandbox.init(profile);
        }    }
    
    destroy() {
        if (!this.mounted) throw new Error('Impossible to destroy a widget that has already been destroyed.');
        
        this.mounted.unmount();
    }
    
    _enqueue(method, args = [], cb = null) {
        if (typeof args === 'function') {
            cb = args;
            args = [];
        }
        
        const dfd = Bluebird.defer();
        
        this._queue.push({
            dfd,
            action: 'call',
            method: method,
            args,
        });
        
        this._flushIfReady();
        
        return typeof cb === 'function'
            ?   dfd.promise.nodeify(cb)
            :   dfd.promise;
    }
    
    _flushIfReady() {
        if (this.mounted) this._flush();
    }
    
    _flush() {
        const component = this.mounted.component;
        let queue = Bluebird.resolve();
        
        while (this._queue.length) {
            const op = this._queue.pop();
            
            switch (op.action) {
                case 'call':
                    queue = queue
                        .then(() => {
                            const method = component[op.method].bind(component);
                            const result = method(...op.args);
                            
                            return op.dfd.resolve(result);
                        });
                    break;
                default:
                    throw new Error(`Action of type '${op.action}' not supported.`);
            }
        }
        
        return queue;
    }
    
    _rejectQueue(msg = 'Widget has been destroyed') {
        while (this._queue.length) {
            const op = this._queue.pop();
            
            op.dfd.reject(new Error(msg));
        }
    }
}
