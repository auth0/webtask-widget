import React from 'react';


import 'styles/secretsEditor.less';


export default class A0ParamsEditor extends React.Component {
    constructor(props) {
        super(props);

        this.keyRefs = [];
        this.valueRefs = [];

        this.state = {
            params: []
        };
    }

    componentWillReceiveProps(props) {
        this._loadparams(props);
    }

    _loadparams (props) {
        const params = Object.keys(props.params)
            .reduce((params, key) => params.concat([{
                key: key,
                value: props.params[key],
                editing: false,
            }]), []);

        this.state = {
            params,
        };
    }

    render() {
        const self = this;
        const props = this.props;
        const state = this.state;

        return (
            <div className="a0-secrets-editor">
                <div className="a0-sidebar-intro">
                    <h2 className="a0-title">Params</h2>
                    <p className="a0-explanation">You can create webtasks that depend on a set of params. To access the param use: <code>context.params.KEY</code>.</p>
                </div>
                { state.params.map((param, i) => (
                    param.editing
                        ?   <A0ParamEditor param={ param } key={ i }
                                onAccept={ (accepted) => this.updateParam(i, accepted) }
                            />
                        :   <A0ParamView param={ param } key={ i }
                                onEdit={ () => this.editParam(i) }
                                onRemove={ () => this.removeParam(i) }
                            />
                ))}
                <A0ParamCreator
                    ref="creator"
                    onAccept={ (accepted) => this.addParam(accepted) }
                />
            </div>
        );
    }

    getValue() {
        return this.state.params.reduce((params, {key, value}) => {
            if (key) params[key.trim()] = value;

            return params;
        }, {});
    }

    editParam(i) {
        const params = this.state.params.slice();

        params[i].editing = true;

        this.setState({ params }, () => {
            // if (this.props.onChange) this.props.onChange(this.getValue());
        });

    }

    addParam(param) {
        const params = this.state.params.slice();

        params.push(param);

        this.refs.creator.clear();
        this.setState({ params }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }

    removeParam(i) {
        const params = this.state.params.slice();

        params.splice(i, 1);

        this.setState({ params }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }

    updateParam(i, accepted) {
        const params = this.state.params.slice();

        params[i] = {
            key: accepted.key,
            value: accepted.value,
            editing: false,
        };

        this.setState({ params }, () => {
            if (this.props.onChange) this.props.onChange(this.getValue());
        });
    }
}


A0ParamsEditor.propTypes = {
    params: React.PropTypes.object.isRequired,
};

class A0ParamCreator extends React.Component {
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
                        type="text"
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


class A0ParamEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            key: props.param ? props.param.key : '',
            value: props.param ? props.param.value : '',
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
                        type="text"
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

class A0ParamView extends React.Component {
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
                        <span className="a0-inline-text -bright">{ props.param.key }</span>
                    </div>
                    <div className="a0-value">
                        <span className="a0-inline-text -strong -bright">Value:</span>
                        { " " }
                        <span className="a0-inline-text -bright">{ props.param.value }</span>
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
