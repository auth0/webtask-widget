import '../styles/componentStack.less';

import Bluebird from 'bluebird';
import React from 'react';
import ReactDOM from 'react-dom';

import A0Modal from '../components/modal';

class A0Wrapper extends React.Component {
    render() {
        const props = this.props;

        const child = React.Children.only(props.children);
        const clone = React.cloneElement(child, {
            ref: 'child',
        });
        
        return (
            <div>{ clone }</div>
        );
    }
}

export default class ComponentStack {
    constructor(element) {
        this.useModal = false;
        this.wrapComponent = (Component, props) => (
            <A0Wrapper>
                <Component {...props} />
            </A0Wrapper>
        );
        
        if (!element) {
            this.useModal = true;
            
            this.wrapComponent = (Component, props) => (
                <A0Modal title={Component.title} onHide={ props.reject }>
                    <Component {...props} />
                </A0Modal>
            );
            
            document.body.appendChild(element = document.createElement('div'));
        }
    
        this.element = element;
        this.element.classList.add('a0-stack-wrapper');
    }
    
    push(Component, props) {
        const dfd = new Bluebird.defer();
        let wrapperEl = document.createElement('div');
        const childProps = Object.assign({}, props, {
            resolve: dfd.resolve.bind(dfd),
            reject: dfd.reject.bind(dfd),
        });
        
        wrapperEl.classList.add('a0-stack-element');
        
        const wrapper = ReactDOM.render(this.wrapComponent(Component, childProps), wrapperEl);
        const unmount = () => {
            console.log('unmounting');
            
            if (wrapperEl) {
                if (ReactDOM.unmountComponentAtNode(wrapperEl)) {
                
                // setTimeout(() => {
                    wrapperEl.remove();
                
                    wrapperEl = null;
                    if (!dfd.promise.isFulfilled()) dfd.reject(new Error('Widget was unmounted'));
                // });
                }
            }
        };
        
        dfd.promise
            .finally(unmount);
        
        this.element.appendChild(wrapperEl);
        
        return {
            promise: dfd.promise,
            component: wrapper.refs.child,
            unmount,
        };
    }
}
