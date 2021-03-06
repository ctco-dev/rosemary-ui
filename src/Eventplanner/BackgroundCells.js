import React from 'react';
import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { segStyle } from './utils/eventLevels';
import { notify } from './utils/helpers';
import { dateCellSelection, slotWidth, getCellAtX, pointInBox } from './utils/selection';
import Selection, { getBoundsForNode } from './Selection';

const PROPERTY_TYPES = {
    selectable: PropTypes.bool,
    draggableSelect: PropTypes.bool,
    onSelect: PropTypes.func,
    slots: PropTypes.number,
    highlight: PropTypes.func,
    isHovered: PropTypes.func,
    isEndDate: PropTypes.func,
    isToday: PropTypes.func,
    isStartDate: PropTypes.func,
    onHover: PropTypes.func
};

class DisplayCells extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selecting: false };
    }

    componentDidMount() {
        this.props.selectable && this._selectable();
        this.props.draggableSelect && this._draggable();
    }

    componentWillUnmount() {
        this._teardownSelectable();
        this._teardownDraggable();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectable && !this.props.selectable) this._selectable();
        if (!nextProps.selectable && this.props.selectable) this._teardownSelectable();

        if (nextProps.draggableSelect && !this.props.draggableSelect) this._draggable();
        if (!nextProps.draggableSelect && this.props.draggableSelect) this._teardownDraggable();
    }

    render() {
        let { slots } = this.props;
        let { selecting, startIdx, endIdx } = this.state;

        let children = [];

        for (let i = 0; i < slots; i++) {
            children.push(
                <div
                    key={'bg_' + i}
                    style={segStyle(1, slots)}
                    className={cn('rbc-day-bg', {
                        'rbc-selected': this.props.isSelected(i),
                        'rbc-day-highlighted': this.props.highlight(i),
                        'rbc-end-date': this.props.isEndDate(i),
                        'rbc-hovered-date': this.props.isHovered(i),
                        'rbc-current-bg-cell': this.props.isToday(i),
                        'rbc-selected-cell': selecting && i >= startIdx && i <= endIdx
                    })}
                />
            );
        }

        return <div className="rbc-row-bg">{children}</div>;
    }

    _draggable() {
        let node = findDOMNode(this);
        let selector = (this._dragableSelector = new Selection(this.props.container));
        selector.on('selecting', box => {
            let { slots } = this.props;

            let startIdx = -1;
            let endIdx = -1;

            if (!this.state.selecting) {
                notify(this.props.onSelectStart, [box]);
                this._initial = { x: box.x, y: box.y };
            }
            if (selector.isSelected(node)) {
                let nodeBox = getBoundsForNode(node);

                ({ startIdx, endIdx } = dateCellSelection(this._initial, nodeBox, box, slots));
            }

            this.setState({
                selecting: true,
                startIdx,
                endIdx
            });
        });
        selector.on('select', event => {
            this._selectSlot(this.state);
            this._initial = {};
            this.setState({ selecting: false });
            notify(this.props.onSelectEnd, [this.state]);
        });
    }

    _selectable() {
        let node = findDOMNode(this);
        let selector = (this._selector = new Selection(this.props.container));
        selector.on('click', (point, event) => {
            if (event.target.closest('.rbc-event') || event.target.closest('.rbc-show-more')) {
                return;
            }
            let rowBox = getBoundsForNode(node);

            if (pointInBox(rowBox, point)) {
                let width = slotWidth(getBoundsForNode(node), this.props.slots);
                let currentCell = getCellAtX(rowBox, point.x, width);

                this._selectSlot(
                    {
                        startIdx: currentCell,
                        endIdx: currentCell,
                        selectedIndex: currentCell
                    },
                    event
                );
            }

            this._initial = {};

            this.setState({
                selecting: false
            });
        });
        selector.on('mouseover', point => {
            let node = findDOMNode(this);
            let rowBox = getBoundsForNode(node);
            if (pointInBox(rowBox, point)) {
                let width = slotWidth(getBoundsForNode(node), this.props.slots);
                let currentCell = getCellAtX(rowBox, point.x, width);
                this.props.onHover(currentCell);
            }
        });
    }

    _teardownSelectable() {
        if (!this._selector) return;
        this._selector.teardown();
        this._selector = null;
    }

    _teardownDraggable() {
        if (!this._dragableSelector) return;
        this._dragableSelector.teardown();
        this._dragableSelector = null;
    }

    _selectSlot({ endIdx, startIdx, selectedIndex }, event) {
        this.props.onSelectSlot &&
            this.props.onSelectSlot(
                {
                    start: startIdx,
                    end: endIdx,
                    selectedIndex
                },
                event
            );
    }
}

DisplayCells.propTypes = PROPERTY_TYPES;

export default DisplayCells;
