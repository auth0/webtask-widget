import React from 'react';


import 'styles/secretsEditor.less';


export default class A0KeyValueListEditor extends React.Component {
    constructor(props) {
        super(props);

        this.keyRefs = [];
        this.valueRefs = [];

        this.state = {
            secrets: []
        };
    }

    componentWillReceiveProps(props) {
        this._loadSecrets(props);
    }

    _loadSecrets (props) {
        const secrets = Object.keys(props.secrets)
            .reduce((secrets, key) => secrets.concat([{
                key: key,
                value: props.secrets[key],
                editing: false,
            }]), []);

        this.state = {
            secrets,
        };
    }

    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        return (
            <div className="a0-kvlist-editor">
                { state.secrets.map((secret, i) => (
                    secret.editing
                        ?   <A0KeyValueEditor secret={ secret } key={ i }
                                onAccept={ (accepted) => this.updateSecret(i, accepted) }
                                valueType={ props.valueType }
                            />
                        :   <A0KeyValueViewer secret={ secret } key={ i }
                                onEdit={ () => this.editSecret(i) }
                                onRemove={ () => this.removeSecret(i) }
                                valueType={ props.valueType }
                            />
                ))}
                <A0KeyValueCreator
                    ref="creator"
                    onAccept={ (accepted) => this.addSecret(accepted) }
                    valueType={ props.valueType }
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

        this.setState({ secrets }, () => {
            // if (this.props.onChange) this.props.onChange(this.getValue());
        });

    }

    addSecret(secret) {
        const secrets = this.state.secrets.slice();

        secrets.push(secret);

        this.refs.creator.clear();
        this.setState({ secrets }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }

    removeSecret(i) {
        const secrets = this.state.secrets.slice();

        secrets.splice(i, 1);

        this.setState({ secrets }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }

    updateSecret(i, accepted) {
        const secrets = this.state.secrets.slice();

        secrets[i] = {
            key: accepted.key,
            value: accepted.value,
            editing: false,
        };

        this.setState({ secrets }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
}


A0KeyValueListEditor.propTypes = {
    secrets: React.PropTypes.object.isRequired,
    valueType: React.PropTypes.oneOf(['password', 'text']),
};

A0KeyValueListEditor.defaultProps = {
    valueType: 'password',
};


class A0KeyValueCreator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: '',
            value: '',
        };

        this.validKeyRx = /^[\$_a-zA-Z][\$_a-zA-Z0-9]*$/;
    }

    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        const isInvalid = !this.isValid();

        return (
            <form className="a0-secret-editor" onSubmit={ e => this.onSubmit(e) }>
                <div className="a0-secret-inputs">
                    <input className="a0-text-input -dark" placeholder="Key"
                        type="text"
                        onChange={ (e) => this.setState({ key: e.target.value }) }
                        value={ state.key }
                    />
                    <input className="a0-text-input -dark" placeholder="Value"
                        type={ props.valueType }
                        onChange={ (e) => this.setState({ value: e.target.value }) }
                        value={ state.value }
                    />
                </div>
                <div className="a0-actions">
                    <button className={ 'a0-icon-button -inverted -add ' + (isInvalid ? '-muted' : '-success') }
                        disabled={ isInvalid }
                        type="submit"
                    ></button>
                </div>
            </form>
        );
    }

    isValid() {
        return this.validKeyRx.test(this.state.key);
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.isValid() && this.props.onAccept) {
            this.props.onAccept(this.getValue());
        }
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

A0KeyValueCreator.propTypes = {
    valueType: React.PropTypes.oneOf(['password', 'text']),
};

A0KeyValueCreator.defaultProps = {
    valueType: 'password',
};


class A0KeyValueEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: props.secret ? props.secret.key : '',
            value: props.secret ? props.secret.value : '',
        };

        this.validKeyRx = /^[\$_a-zA-Z][\$_a-zA-Z0-9]*$/;
    }

    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        const isInvalid = !this.isValid();

        return (
            <form className="a0-secret-editor" onSubmit={ e => this.onSubmit(e) }>
                <div className="a0-secret-inputs">
                    <input className="a0-text-input -darker" placeholder="Key"
                        type="text"
                        onChange={ (e) => this.setState({ key: e.target.value }) }
                        value={ state.key }
                    />
                    <input className="a0-text-input -darker" placeholder="Value"
                        type={ props.valueType }
                        onChange={ (e) => this.setState({ value: e.target.value }) }
                        value={ state.value }
                    />
                </div>
                <div className="a0-actions">
                    <button className={ 'a0-icon-button -inverted -confirm ' + (isInvalid ? '-muted' : '-bright') }
                        disabled={ isInvalid }
                        type="submit"
                    ></button>
                </div>
            </form>
        );
    }

    isValid() {
        return this.validKeyRx.test(this.state.key);
    }

    onSubmit(e) {
        e.preventDefault();
        e.stopPropagation();

        if (this.isValid() && this.props.onAccept) {
            this.props.onAccept(this.getValue());
        }
    }

    getValue() {
        return {
            key: this.state.key,
            value: this.state.value,
        };
    }
}

A0KeyValueEditor.propTypes = {
    valueType: React.PropTypes.oneOf(['password', 'text']),
};

A0KeyValueEditor.defaultProps = {
    valueType: 'password',
};


class A0KeyValueViewer extends React.Component {
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
                        <span className="a0-inline-text -bright">{ props.valueType === 'password' ? '********' : props.secret.value }</span>
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

A0KeyValueViewer.propTypes = {
    valueType: React.PropTypes.oneOf(['password', 'text']),
};

A0KeyValueViewer.defaultProps = {
    valueType: 'password',
};
