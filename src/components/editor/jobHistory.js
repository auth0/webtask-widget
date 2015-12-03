import React from 'react';
import Sandbox from 'sandboxjs';

import 'styles/jobHistory.less';

export default class JobHistory extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            history: [],
            loadInProgress: false,
            refreshInProgress: false,
            hasMore: false,
        };
    }
    
    componentWillMount() {
        this.setState({ loadInProgress: true });
        this.loadHistory()
            .tap(items => { if (items.length) this.onClickItem(items[0]) })
            .finally(() => this.setState({ loadInProgress: false }));
    }
    
    render() {
        const body = (
            <div className="a0-table-body" onScroll={ e => this.onScroll(e) }>
                { this.state.loadInProgress
                ?   (
                        <div className="a0-table-row -loading">
                            "Loading history..."
                        </div>
                    )
                :   (
                        this.state.history.map(item => (
                            <div
                                className={ 'a0-table-row' + (this.props.selected === item ? ' -active' : '') }
                                key={ item.started_at }
                                onClick={ e => this.onClickItem(item) }
                            >
                                <div className="a0-cell">
                                    { new Date(item.started_at).toLocaleString().replace(/:\d\d /, ' ') }
                                </div>
                                <div className="a0-cell">
                                    { new Date(item.completed_at).toLocaleString().replace(/:\d\d /, ' ') }
                                </div>
                                <div className={ 'a0-cell -type' + (item.type === 'success' ? ' -success' : '-danger') }>
                                    { item.type }
                                </div>
                            </div>
                        ))
                    )
                }
                { this.state.refreshInProgress && !this.state.loadInProgress
                ?   (
                        <div
                            className="a0-table-row -more"
                            onClick={ e => this.onClickLoadMore() }
                        >
                            Loading...
                        </div>
                    )
                :   null
                }
            </div>
        );
        
        return (
            <div className="a0-cron-history">
                <div className="a0-table-header">
                    <div className="a0-header">Started</div>
                    <div className="a0-header">Completed</div>
                    <div className="a0-header">Last Result</div>
                </div>
                <div className="a0-table-body">
                    { body }
                </div>
            </div>
        );
    }
    
    addHistoryItems(items) {
        const history = this.state.history
            .slice()
            .concat(items)
            // Descending sort (b - a)
            .sort((a, b) => b.started_at - a.started_at)
            .reduce((unique, item) => {
                if (!unique.length || unique[unique.length - 1].started_at.valueOf() !== item.started_at.valueOf()) {
                    unique.push(item);
                }
                
                return unique;
            }, []);
        
        this.setState({ history });
    }
    
    onClickItem(item) {
        this.props.onSelect(item);
    }
    
    onClickLoadMore() {
        this.loadMore();
    }
    
    onScroll(e) {
        const shouldLoad = Math.abs(e.target.scrollHeight - e.target.scrollTop - e.target.offsetHeight) < 50;
        
        if (shouldLoad && !this.refreshInProgress) {
            this.loadMore();
        }
    }
    
    loadHistory({ offset = 0, limit = 10} = {}) {
        this.setState({ refreshInProgress: true });
        
        return this.props.job.getHistory({ offset, limit })
            .tap(history => this.addHistoryItems(history))
            .tap(history => this.setState({ hasMore: history.length > 0 }))
            .catch(error => this.setState({ error }))
            .finally(() => this.setState({ refreshInProgress: false }));
    }
    
    loadMore() {
        this.loadHistory({
            offset: this.state.history.length,
        });
    }
}


JobHistory.propTypes = {
    job: React.PropTypes.instanceOf(Sandbox.CronJob).isRequired,
    onSelect: React.PropTypes.func.isRequired,
    selected: React.PropTypes.object,
};
