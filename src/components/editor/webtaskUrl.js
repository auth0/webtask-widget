import React from 'react';
import ReactZeroClipboard from 'react-zeroclipboard';
import Sandbox from 'sandboxjs';

export default class A0WebtaskUrl extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
        };
    }
    
    render() {
        const baseUrl = this.props.sandbox.url + '/api/run/' + this.props.sandbox.container + '/';
        const fullUrl = baseUrl + this.props.name;
        
        const url = (
            <span className="a0-container-url">
                { this.props.readonly ? fullUrl : baseUrl }
            </span>
        );
        
        const nameInput = this.props.readonly
            ?   null
            :   (
                    <input className="a0-name-input -inline"
                        onChange={ (e) => this.onChangeName(e.target.value) }
                        disabled={ this.props.disabled }
                        value={ this.props.name }
                    />
                );
        
        const copyButton = (
            <ReactZeroClipboard text={ fullUrl }>
                <button className="a0-icon-button -copy"></button>
            </ReactZeroClipboard>
        );
        
        return (
            <div className="a0-webtask-url">
                { url }
                { nameInput }
                { copyButton }
            </div>
        );
    }
    
    getValue() {
        return this.state.name;
    }
    
    onChangeName(name) {
        this.props.onChangeName(name);
    }
}

A0WebtaskUrl.propTypes = {
    name: React.PropTypes.string.isRequired,
    onChangeName: React.PropTypes.func.isRequired,
    readonly: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    sandbox: React.PropTypes.instanceOf(Sandbox).isRequired,
};

A0WebtaskUrl.defaultProps = {
    readonly: true,
    disabled: false,
};