import React from 'react';
import ReactDOM from 'react-dom';

import 'styles/componentStack.less';


export default class ComponentStack {
    constructor(element) {
        this.element = element;
        this.stack = [];
        
        this.element.classList.add('a0-component-stack');
        
        Object.defineProperty(this, 'length', {
            enumerable: true,
            get: () => this.stack.length,
        });
    }
    
    pop() {
        if (!this.stack.length) return;
        
        const top = this.stack.pop();
        
        top.unmount();
        
        return top;
    }
    
    push(Component, props, onMounted) {
        let wrapperEl = document.createElement('div');
        
        wrapperEl.classList.add('a0-layer');
        
        if (this.element.offsetWidth < 992) {
            props.size = 'small';
        }
        
        const componentRef = ReactDOM.render(<Component {...props} stack={ this } />, wrapperEl, onMounted); 
        
        componentRef.unmount = () => {
            if (!wrapperEl) return;
            
            wrapperEl.remove();
            wrapperEl = null;
        };
        
        this.element.appendChild(wrapperEl);
        
        return componentRef;
    }
}
