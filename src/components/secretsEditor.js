import React from 'react';

import Button from '../components/button';
import Input from '../components/input';


import Style from '../styles/secretsEditor.less';


export default class A0SecretsEditor extends React.Component {
    constructor(props) {
        super(props);

        const secrets = Object.keys(props.secrets)
            .reduce((secrets, key) => secrets.concat([{
                key: key,
                value: props.secrets[key]
            }]), []);

        // Add an empty one for good measure
        if (!secrets.length) secrets.push({
            key: '',
            value: '',
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
            <div className="a0-secreteditor">
                <label className="control-label">Edit secrets:</label>
                <table className="a0-secreteditor-table">
                    <tbody>
                        { state.secrets.map(({key, value}, i) => (
                            <tr className="a0-secreteditor-row" key={ i }>
                                <td>
                                    <Input
                                        type="text"
                                        bsSize="small"
                                        placeholder="Key"
                                        name="key"
                                        ref={ (c) => self.keyRefs[i] = c }
                                        value={ key }
                                        onChange={ () => self.updateSecret(i, 'key', self.keyRefs[i].getValue()) }
                                    />
                                </td>
                                <td>
                                    <Input
                                        type="text"
                                        bsSize="small"
                                        placeholder="Value"
                                        name="value"
                                        ref={ (c) => self.valueRefs[i] = c }
                                        value={ value }
                                        onChange={ () => self.updateSecret(i, 'value', self.valueRefs[i].getValue()) }
                                    />
                                </td>
                                <td>
                                    <Button
                                        bsStyle="danger"
                                        bsSize="sm"
                                        disabled={ self.state.secrets.length === 1 && !self.state.secrets[0].key && !self.state.secrets[0].value }
                                        onClick={ () => self.removeSecret(i) }
                                    >
                                        Remove
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan="3">
                                <Button
                                    bsStyle="link"
                                    bsSize="sm"
                                    disabled={ self.state.secrets.length === 1 && !self.state.secrets[0].key && !self.state.secrets[0].value }
                                    onClick={ self.addSecret.bind(self) }
                                >
                                    Add...
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    getValue() {
        return this.state.secrets.reduce((secrets, {key, value}) => {
            if (key) secrets[key.trim()] = value;

            return secrets;
        }, {});
    }

    addSecret() {
        const secrets = this.state.secrets.slice();

        secrets.push({
            key: '',
            value: '',
        });

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange();
    }

    removeSecret(i) {
        const secrets = this.state.secrets.slice();

        secrets.splice(i, 1);

        // Keep at least one secret row visible
        if (!secrets.length) {
            secrets.push({
                key: '',
                value: '',
            });
        }

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange();
    }

    updateSecret(i, field, value) {
        const secrets = this.state.secrets.slice();

        secrets[i][field] = value;

        this.setState({ secrets });

        if (this.props.onChange) this.props.onChange();
    }
}


A0SecretsEditor.propTypes = {
    secrets: React.PropTypes.object.isRequired,
};