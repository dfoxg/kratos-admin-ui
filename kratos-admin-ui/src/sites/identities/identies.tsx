import { Selection } from "@fluentui/react";
import { Title1 } from "@fluentui/react-components";
import { V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../config";
import { DetailListModel, SchemaField, SchemaService } from "../../service/schema-service";
import { Toolbar, ToolbarButton, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, TableSelectionCell, useTable_unstable, TableState } from '@fluentui/react-components/unstable';
import { ArrowClockwiseRegular, ClipboardEditRegular, ContentViewRegular, DeleteRegular, MailRegular, NewRegular } from "@fluentui/react-icons";

interface ToolbarItem {
    text: string;
    key: string;
    onClick: () => void;
    icon: any;
}

interface TableHeaderItem {
    key: string;
    name: string;
    fieldName: string;
}

interface IdentitiesState {
    commandBarItems: ToolbarItem[]
    listItems: DetailListModel[]
    listColumns: TableHeaderItem[]
    selectedRows: { [key: string]: boolean };
}

const ID_COLUMN = { key: 'id_column', name: 'ID', fieldName: 'key' }

class IdentitiesSite extends React.Component<any, IdentitiesState> {
    state: IdentitiesState = {
        commandBarItems: this.getCommandbarItems(),
        listItems: [],
        listColumns: [ID_COLUMN],
        selectedRows: {}
    }

    private api: V0alpha2Api | undefined;

    _selection: Selection = new Selection({
        onSelectionChanged: () => {
            this.setState({
                commandBarItems: this.getCommandbarItems()
            })
        },
    });

    componentDidMount() {
        getKratosConfig().then(config => {
            this.api = new V0alpha2Api(config.adminConfig)
            this.refreshData(false);
        })
    }

    private mapListColumns(fields: SchemaField[]): TableHeaderItem[] {
        if (fields.length === 0) {
            return [ID_COLUMN];
        } else {
            const array: TableHeaderItem[] = [];
            fields.forEach(field => {
                array.push({
                    key: "column_" + field.name,
                    fieldName: field.name,
                    name: field.title
                });
            })
            array.push(ID_COLUMN)
            return array;
        }
    }

    private getCommandbarItems(): ToolbarItem[] {
        const array: ToolbarItem[] = []
        const localCount = this._selection ? this._selection.count : 0;

        array.push({
            key: 'new',
            text: 'New',
            icon: NewRegular,
            onClick: () => {
                this.props.history.push("/identities/create");
            }
        })
        if (localCount === 1) {
            array.push({
                key: 'view',
                text: 'View',
                icon: ContentViewRegular,
                onClick: () => {
                    this.props.history.push("/identities/" + this._selection.getSelection()[0].key + "/view")
                }
            })
            array.push({
                key: 'edit',
                text: 'Edit',
                icon: ClipboardEditRegular,
                onClick: () => {
                    this.props.history.push("/identities/" + this._selection.getSelection()[0].key + "/edit")
                }
            })
        }
        if (localCount > 0) {
            array.push({
                key: 'delete',
                text: 'Delete',
                icon: DeleteRegular,
                onClick: () => this.deleteSelected()
            })
            array.push({
                key: 'recoveryLink',
                text: 'Recovery',
                icon: MailRegular,
                onClick: () => this.recoverySelected()
            })
        }
        array.push({
            key: 'refresh',
            text: 'Refresh',
            icon: ArrowClockwiseRegular,
            onClick: () => this.refreshData(true)
        })

        return array;
    }

    private refreshData(showBanner: boolean) {
        this.refreshDataInternal(showBanner).then(() => { })
    }

    private async refreshDataInternal(showBanner: boolean) {
        const adminIdentitesReturn = await this.api!.adminListIdentities();
        if (adminIdentitesReturn) {
            const ids = await SchemaService.getSchemaIDs()
            const schemaJson = await SchemaService.getSchemaJSON(ids[0])
            const fields = SchemaService.getSchemaFields(schemaJson)

            this.setState({
                listItems: SchemaService.mapKratosIdentites(adminIdentitesReturn.data, fields),
                listColumns: this.mapListColumns(fields)
            })
        }
    }

    private deleteSelected() {
        const values: DetailListModel[] = this._selection.getSelection() as DetailListModel[];
        const promises: Promise<any>[] = [];
        values.forEach(val => {
            promises.push(this.api!.adminDeleteIdentity(val.key))
        });
        Promise.all(promises).then(() => {
            this.refreshData(false);
        })
    }

    private recoverySelected() {
        const values: DetailListModel[] = this._selection.getSelection() as DetailListModel[];
        const promises: Promise<any>[] = [];
        values.forEach(val => {
            promises.push(this.api!.adminCreateSelfServiceRecoveryLink({
                identity_id: val.key
            }))
        });
        Promise.all(promises).then(() => {
        })
    }

    render() {
        return (
            <div className="container">
                <Title1 as={"h1"}>Identities</Title1>
                <Toolbar>
                    {
                        this.state.commandBarItems.map(item => {
                            var CustomIcon = item.icon
                            return (
                                <ToolbarButton key={item.key} onClick={() => item.onClick()}>
                                    <CustomIcon />
                                    <span style={{ paddingLeft: 4 }}>{item.text}</span>
                                </ToolbarButton>
                            )
                        })
                    }
                </Toolbar>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableSelectionCell></TableSelectionCell>
                            {this.state.listColumns.map(item => {
                                return (
                                    <TableHeaderCell key={item.key}>
                                        {item.name}
                                    </TableHeaderCell>
                                )
                            })}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {this.state.listItems.map(item => {
                            return (
                                <TableRow key={item.key}
                                    onClick={(e) => {
                                        if (this.state.selectedRows[item.key]) {
                                            this.state.selectedRows[item.key] = false
                                        } else {
                                            this.state.selectedRows[item.key] = true
                                        }
                                        console.log(this.state.selectedRows)
                                    }}
                                >
                                    <TableSelectionCell checked={(this.state.selectedRows.length)}></TableSelectionCell>
                                    {this.state.listColumns.map(column => {
                                        return (
                                            <TableCell key={column.fieldName}>
                                                {item[column.fieldName]}
                                            </TableCell>
                                        )
                                    })}

                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                <p>{this._selection.count} Item(s) selected</p>
            </div>
        )
    }
}


export default withRouter(IdentitiesSite);