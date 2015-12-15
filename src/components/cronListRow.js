import ToggleButton from 'components/toggleButton';
import React from 'react';
import TimeAgo from 'react-timeago';

export default class CronListRow extends React.Component {
    constructor() {
        super();

        this.state = {
            destroyingJob: false 
        };
    }

    render() {
        const resultClasses = {
            success: '-success',
            error: '-danger',
        };
        const stateClasses = {
            active: '-success',
            invalid: '-danger',
            expired: '-warning',
        };

        const onClickRow = e => {
            // Stop inline buttons from triggering row click
            e.stopPropagation();

            if(e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT')
                return this.onClick();
        };

        const onClickDestroy = e => {
            e.preventDefault();
            e.stopPropagation();

            if (this.props.onClickDestroy) this.props.onClickDestroy(this.props.job);
        };

        
        return (
            <tr className="a0-cronlist-job"
                disabled={ this.props.disabled }
                onClick={ onClickRow }
            >
                <td>{ this.props.name }</td>
                <td>
                    <TimeAgo
                        date={ this.props.createdAt }
                    />
                </td>
                <td className="_fit-content">
                    <ToggleButton
                        ref="state"
                        disabled={ this.props.state === 'expired' || this.props.state === 'invalid' }
                        checked={ this.props.state === 'active' }
                        loading={ this.props.stateChangeInProgress }
                        async
                        onChange={ checked => this.onChangeState(checked) }
                    />
                </td>
                <td>
                    { this.props.state === 'expired'
                    ?   'Expired'
                    :   this.props.state === 'active'
                        ?   (
                                <TimeAgo
                                    date={ this.props.scheduledAt || this.props.nextAvailableAt }
                                />
                            )
                        :   '-'
                    }
                </td>
                <td className="_fit-content">
                    { this.props.lastResult
                    ?   (
                            <div>
                                <span className={ `a0-inline-text -sentence ${resultClasses[this.props.lastResult.type]}` }>{ this.props.lastResult.type }</span>
                            </div>
                        )
                    : "-"
                    }
                    <button
                        className="a0-row-delete"
                        type="button"
                        onClick={ onClickDestroy }
                    >
                        &times;
                    </button>
                </td>
            </tr>
        );
    }
    
    onChangeState(state) {
        const newState = state ? 'active' : 'inactive';
        
        this.props.onChangeState(newState);
    }
    
    onClick() {
        this.props.onClick();
    }
}


CronListRow.propTypes = {
    createdAt: React.PropTypes.string.isRequired,
    lastResult: React.PropTypes.shape({
        type: React.PropTypes.oneOf(['success', 'error']),
    }),
    name: React.PropTypes.string.isRequired,
    nextAvailableAt: React.PropTypes.string.isRequired,
    state: React.PropTypes.oneOf(['active', 'expired', 'inactive', 'invalid']).isRequired,
    stateChangeInProgress: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
    onClickDestroy: React.PropTypes.func.isRequired,
    onChangeState: React.PropTypes.func.isRequired,
};