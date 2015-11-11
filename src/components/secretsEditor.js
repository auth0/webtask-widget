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

        // Add an empty one for good measure
        secrets.push({
            key: '',
            value: '',
            editing: true,
        });
        
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

    addSecret() {
        const secrets = this.state.secrets.slice();

        secrets.push({
            key: '',
            value: '',
            editing: true,
        });

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange(this.getValue());
    }

    removeSecret(i) {
        const secrets = this.state.secrets.slice();

        secrets.splice(i, 1);

        // Keep at least one secret row visible
        if (!secrets.length) {
            secrets.push({
                key: '',
                value: '',
                editing: true,
            });
        }

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

        this.setState({ secrets }, function () {
            if (!secrets[secrets.length - 1].editing) this.addSecret();
        });
        
        if (this.props.onChange) this.props.onChange(this.getValue());
    }
}


A0SecretsEditor.propTypes = {
    secrets: React.PropTypes.object.isRequired,
};

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
                <div className="a0-secret-inputs">
                    <input className="a0-text-input -dark" disabled placeholder="Key"
                        value={ props.secret.key }
                    />
                    <input className="a0-text-input -dark" disabled placeholder="Value"
                        value={ props.secret.value }
                    />
                </div>
                <div className="a0-actions">
                    <button className="a0-icon-button -edit -inverted -success"
                        onClick={ (e) => this.onClickEdit() }
                    ></button>
                    <button className="a0-icon-button -remove -inverted -muted "
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