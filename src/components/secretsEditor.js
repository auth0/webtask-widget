import React from 'react';

import Button from '../components/button';
import Input from '../components/input';


import '../styles/secretsEditor.less';


export default class A0SecretsEditor extends React.Component {
    constructor(props) {
        super(props);

        const secrets = Object.keys(props.secrets)
            .reduce((secrets, key) => secrets.concat([{
                key: key,
                value: props.secrets[key],
                editing: false,
            }]), []);
        
        this.state = {
            secrets,
        };

        this.keyRefs = [];
        this.valueRefs = [];
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        return (
            <div className="a0-secrets-editor">
                <div className="a0-sidebar-intro">
                    <h2 className="a0-title">Adding secrets</h2>
                    <p className="a0-explanation">You can create webtasks that depend on a set of secrets (ie: a mongodb connection string, API keys, etc...)</p>
                </div>
                { state.secrets.map((secret, i) => (
                    secret.editing
                        ?   <A0SecretEditor secret={ secret } key={ i }
                                onAccept={ (accepted) => this.updateSecret(i, accepted) }
                            />
                        :   <A0SecretView secret={ secret } key={ i } 
                                onEdit={ () => this.editSecret(i) }
                                onRemove={ () => this.removeSecret(i) }
                            />
                ))}
                <A0SecretCreator
                    ref="creator"
                    onAccept={ (accepted) => this.addSecret(accepted) }
                />
            </div>
        );
    }

    getValue() {
        return this.state.secrets.reduce((secrets, {key, value}) => {
            if (key) secrets[key.trim()] = value;

            return secrets;
        }, {});
    }
    
    editSecret(i) {
        const secrets = this.state.secrets.slice();
        
        secrets[i].editing = true;
        
        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange(this.getValue());
    }

    addSecret(secret) {
        const secrets = this.state.secrets.slice();
        
        secrets.push(secret);
        
        this.refs.creator.clear();
        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange(this.getValue());
    }

    removeSecret(i) {
        const secrets = this.state.secrets.slice();

        secrets.splice(i, 1);

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange(this.getValue());
    }

    updateSecret(i, accepted) {
        const secrets = this.state.secrets.slice();

        secrets[i] = {
            key: accepted.key,
            value: accepted.value,
            editing: false,
        };

        this.setState({ secrets });
        
        if (this.props.onChange) this.props.onChange(this.getValue());
    }
}


A0SecretsEditor.propTypes = {
    secrets: React.PropTypes.object.isRequired,
};

class A0SecretCreator extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            key: props.secret ? props.secret.key : '',
            value: props.secret ? props.secret.value : '',
        };
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;
        
        return (
            <div className="a0-secret-editor">
                <div className="a0-secret-inputs">
                    <input className="a0-text-input -dark" placeholder="Key"
                        onChange={ (e) => this.setState({ key: e.target.value }) }
                        value={ state.key }
                    />
                    <input className="a0-text-input -dark" placeholder="Value"
                        onChange={ (e) => this.setState({ value: e.target.value }) }
                        value={ state.value }
                    />
                </div>
                <div className="a0-actions">
                    <button className="a0-icon-button -add -success"
                        onClick={ (e) => this.onClickAccept() }
                    ></button>
                </div>
            </div>
        );
    }
        
    captureEdit(field, value) {
        const editing = this.state.editing;
        
        editing[field] = value;
        
        this.setState({ editing });
    }
    
    onClickAccept() {
        if (this.props.onAccept) this.props.onAccept(this.getValue());
    }
    
    clear() {
        this.setState({
            key: '',
            value: '',
        });
    }

    getValue() {
        return {
            key: this.state.key,
            value: this.state.value,
        };
    }
}


class A0SecretEditor extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            key: props.secret ? props.secret.key : '',
            value: props.secret ? props.secret.value : '',
        };
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;
        
        return (
            <div className="a0-secret-editor">
                <div className="a0-secret-inputs">
                    <input className="a0-text-input -darker" placeholder="Key"
                        onChange={ (e) => this.setState({ key: e.target.value }) }
                        value={ state.key }
                    />
                    <input className="a0-text-input -darker" placeholder="Value"
                        onChange={ (e) => this.setState({ value: e.target.value }) }
                        value={ state.value }
                    />
                </div>
                <div className="a0-actions">
                    <button className="a0-icon-button -confirm -bright"
                        onClick={ (e) => this.onClickAccept() }
                    ></button>
                </div>
            </div>
        );
    }
        
    captureEdit(field, value) {
        const editing = this.state.editing;
        
        editing[field] = value;
        
        this.setState({ editing });
    }
    
    onClickAccept() {
        if (this.props.onAccept) this.props.onAccept(this.getValue());
    }

    getValue() {
        return {
            key: this.state.key,
            value: this.state.value,
        };
    }
}

class A0SecretView extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        return (
            <div className="a0-secret-row">
                <div className="a0-secret-display">
                    <div className="a0-key">
                        <span className="a0-inline-text -strong -bright">Key:</span>
                        { " " }
                        <span className="a0-inline-text -bright">{ props.secret.key }</span>
                    </div>
                    <div className="a0-value">
                        <span className="a0-inline-text -strong -bright">Value:</span>
                        { " " }
                        <span className="a0-inline-text -bright">{ props.secret.value }</span>
                    </div>
                </div>
                <div className="a0-actions">
                    <button className="a0-icon-button -edit -inverted -muted"
                        onClick={ (e) => this.onClickEdit() }
                    ></button>
                    <button className="a0-icon-button -remove -inverted -muted"
                        onClick={ (e) => this.onClickRemove() }
                    ></button>
                </div>
            </div>
        );
    }
    
    onClickEdit() {
        if (this.props.onEdit) this.props.onEdit();
    }
    
    onClickRemove() {
        if (this.props.onRemove) this.props.onRemove();
    }

    getValue() {
        return {
            key: this.state.key,
            value: this.state.value,
        };
    }
}