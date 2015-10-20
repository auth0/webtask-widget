import '../styles/componentStack.less';

import Bluebird from 'bluebird';
import React from 'react';

import A0Modal from '../components/modal';

export default class ComponentStack {
    constructor(element) {
        this.stack = [];
        this.wrapComponent = (Component, props) => <Component stack={this} {...props} />;
        
        if (!element) {
            element = document.createElement('div');
            
            this.wrapComponent = (Component, props) => (
                <A0Modal title={Component.title}>
                    <Component stack={this} {...props} />
                </A0Modal>
            );
            
            document.body.appendChild(element);
        }
    
        this.element = element;
        this.element.classList.add('a0-stack-wrapper');
    }
    
    push(component, props) {
        const self = this;
        const state = {};
        
        state.promise = new Bluebird((resolve, reject)  => {
            const childProps = Object.assign({resolve, reject}, props);
            
            state.wrapper = document.createElement('div');
            state.wrapper.className = 'a0-stack-element';
            
            React.render(this.wrapComponent(component, childProps), state.wrapper);
            
            self.stack.push(state);
            self.element.appendChild(state.wrapper);
        })
        .finally(function () {
            React.unmountComponentAtNode(state.wrapper);
            setTimeout(() => state.wrapper.remove());
        });

        return state.promise;
    }
}
