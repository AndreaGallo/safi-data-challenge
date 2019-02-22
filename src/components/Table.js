import React from 'react';

const TableComponent = props => {
    const {columns, rows} = props.data;

    const tableHeaders = (<thead>
        <tr>
          {columns.map((column)  => <th>{column}</th>)}
        </tr>
    </thead>);

    const tableBody = rows.map((row) => <tr>
        {columns.map((column)  => <td>{row[column]}</td>)}
    </tr>);

    return (<table className="table table-striped table-sm" width="100%">
            {tableHeaders}
            {tableBody}
        </table>);
};

export default TableComponent;