import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import Sandbox from 'sandboxjs';

export default class A0WebtaskUrl extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
        };
    }
    
    render() {
        const baseUrl = this.props.prefix;
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
        
        const copyButton = this.props.copyButton
            ?   (
                    <CopyToClipboard text={ fullUrl }>
                        <button className="a0-icon-button -copy"></button>
                    </CopyToClipboard>
                )
            :   null;
        
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
    copyButton: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    name: React.PropTypes.string.isRequired,
    onChangeName: React.PropTypes.func.isRequired,
    readonly: React.PropTypes.bool,
    prefix: React.PropTypes.string.isRequired,
};

A0WebtaskUrl.defaultProps = {
    disabled: false,
    readonly: true,
};