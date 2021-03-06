import './TableDemo.scss';
import React from 'react';
import filter from 'lodash/remove';
import isEmpty from 'lodash/isEmpty';
import classNames from 'classnames';
import LoaderDemo from './LoaderDemo';

import DemoWithSnippet from '../../../demo/layout/DemoWithSnippet';
import Table from '../../../src/Table/Table';
import TableSectionDemo from './TableSectionDemo';


export default class TableDemo extends React.Component {
    constructor(props) {
        super(props);
        this.counter = 0;
        this.state = {
            data: this.getData(),
            rowDetails: [],
            sorted: {
                key: 'name',
                direction: Table.order.DESC
            }
        };
        this._headers = [];
    }

    getData() {
        let data = [];
        for (let i = 1; i <= 20; i++) {
            data.push({
                number: i,
                name: `John ${i * 0.4}`,
                surname: `Cat${i}`,
                average: Math.random() * i + 4
            });
        }

        return data;
    }

    _toggleSelection(array, rowId, item) {
        //remove from array element if exists

        let removedValue = filter(array, (o) => {
            return o.id === rowId;
        });

        //checking if remove was OK if removed element is empty [] then we add new value to array
        if (isEmpty(removedValue)) {
            array.push({
                id: rowId
            });

            setTimeout(() => {
                let removedValue = filter(array, (o) => {
                    return o.id === rowId;
                });

                array.push({
                    id: rowId,
                    data: {
                        hello: 'Hello From server'
                    }
                });

                this.setState({
                    rowDetails: array
                });
            }, 2000);
        }

        this.setState({
            rowDetails: array
        });

    }

    _getHeader() {
        return [
            null,
            {el: <span>Number</span>, key: 'number'},
            {el: <span>Name</span>, key: 'name'},
            {el: <span>Surname</span>, key: 'surname'},
            {el: <span>Average</span>, key: 'average', sortable: false},
            null
        ];
    }

    _changeDirection(key) {
        this.setState({
            sorted: {
                key,
                direction: Table.order.DESC
            }
        });
    }

    render() {
        return (
            <DemoWithSnippet>
                <div>
                    <Table
                        data={this.state.data}
                        sorted={{
                            key: this.state.sorted.key,
                            direction: this.state.sorted.direction
                        }}
                        colgroup={['16%', '16%', '16%', '16%', '16%', '16%']}
                        loadingIndicator={() => {
                            return <LoaderDemo />;
                        }}
                        headerCells={() => this._getHeader()}
                        onHeaderClick={(key, index, cell) => this._changeDirection(key)}
                        rowIndex={(item, index) => item.number}
                        rowStyle={(item) => {
                            return classNames({
                                'positive': item.average > 50,
                                'divided-by-10': item.average % 10 === 0
                            });
                        }}
                        row={{
                            onClick: (item, rowId, rowIndex) => this._toggleSelection(this.state.rowDetails, rowId, item)
                        }}
                        rowDetails={this.state.rowDetails}
                        bottomSection={<TableSectionDemo />}
                        cells={(item, index) => {
                            return [
                                <span>
                                    {item.number % 2 === 0 ?
                                        <div className="btn btn--sm btn--icon btn--icon-success">
                                            <i className="im icon-ok"/>
                                        </div>
                                        :
                                        <div className="btn btn--sm btn--icon">
                                            <i className="im icon-flame"/>
                                        </div>
                                    }
                                </span>,
                                {
                                    el: <div>{item.number}</div>
                                },
                                <span>{item.name}</span>,
                                <span>{item.surname}</span>,
                                <span>average score: {Math.round(item.average)}</span>,
                                <span><div className="row-indicator"/></span>
                            ];
                        }
                        }

                    />
                </div>

            </DemoWithSnippet>
        );
    }
}