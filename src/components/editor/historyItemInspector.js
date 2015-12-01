import React from 'react';
import Inspector from 'react-object-inspector';

import 'styles/historyItemInspector.less';

export default class HistoryItemInspector extends React.Component {
    constructor(props) {
        super(props);
    }
    
    render() {
        return this.props.item
            ?   (
                    <div className="a0-history-inspector">
                        <Inspector
                            data={ this.props.item }
                            name="result"
                            initialExpandedPaths={ [ 'result', 'result.body' ] }
                        />
                    </div>
                )
            :   null;
    }
}


HistoryItemInspector.propTypes = {
    item: React.PropTypes.object,
};
