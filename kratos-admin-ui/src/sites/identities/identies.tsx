import { Title1, Toolbar, ToolbarButton, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, TableSelectionCell } from "@fluentui/react-components";
import { Identity, IdentityApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../config";
import { TableDetailListModel, SchemaField, SchemaService } from "../../service/schema-service";
import { ArrowClockwiseRegular, ClipboardEditRegular, ContentViewRegular, DeleteRegular, MailRegular, NewRegular } from "@fluentui/react-icons";

export interface ToolbarItem {
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
    selectedRows: any[]
    listItems: TableDetailListModel[]
    listColumns: TableHeaderItem[]
}

const ID_COLUMN = { key: 'id_column', name: 'ID', fieldName: 'key' }
const STATE_COLUMN = { key: 'state_column', name: 'State', fieldName: 'state' }
const SCHEMA_COLUMN = { key: 'schema_column', name: 'Schema', fieldName: 'schema' }
const VERIFYABLE_ADRESSES_COLUMN = { key: 'verifiable_addresses_column', name: 'Verifiable Address', fieldName: 'verifiable_addresses' }

class IdentitiesSite extends React.Component<any, IdentitiesState> {
    state: IdentitiesState = {
        commandBarItems: this.getCommandbarItems(0),
        listItems: [],
        listColumns: [ID_COLUMN],
        selectedRows: []
    }

    private api: IdentityApi | undefined;

    componentDidMount() {
        getKratosConfig().then(config => {
            this.api = new IdentityApi(config.adminConfig)
            this.refreshData(false);
        })
    }

    private getCommandbarItems(localCount: number): ToolbarItem[] {
        const array: ToolbarItem[] = []

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
                    this.props.history.push("/identities/" + this.state.selectedRows[0] + "/view")
                }
            })
            array.push({
                key: 'edit',
                text: 'Edit',
                icon: ClipboardEditRegular,
                onClick: () => {
                    this.props.history.push("/identities/" + this.state.selectedRows[0] + "/edit")
                }
            })
        }
        if (localCount >= 1) {
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
        const adminIdentitesReturn = await this.api!.listIdentities();
        if (adminIdentitesReturn) {
            this.setState({
                listItems: await SchemaService.getTableDetailListModelFromKratosIdentities(adminIdentitesReturn.data),
                listColumns: [VERIFYABLE_ADRESSES_COLUMN, STATE_COLUMN, SCHEMA_COLUMN, ID_COLUMN],
                commandBarItems: this.getCommandbarItems(0),
                selectedRows: []
            })
        }
    }

    private deleteSelected() {
        const values = this.state.selectedRows;
        const promises: Promise<any>[] = [];
        values.forEach(val => {
            promises.push(this.api!.deleteIdentity({
                id: val
            }))
        });
        Promise.all(promises).then(() => {
            this.refreshData(false);
        })
    }

    private recoverySelected() {
        const values = this.state.selectedRows;
        const promises: Promise<any>[] = [];
        values.forEach(val => {
            promises.push(this.api!.createRecoveryLinkForIdentity({
                createRecoveryLinkForIdentityBody: {
                    identity_id: val
                }
            }))
        });
        Promise.all(promises).then(() => {
        })
    }

    private getTableSelectionCellCheckedValue(): 'mixed' | boolean {
        if (this.state.selectedRows.length === 0) {
            return false;
        }
        if (this.state.selectedRows.length === this.state.listItems.length) {
            return true;
        }
        return "mixed";
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
                            <TableSelectionCell
                                onClick={(e) => {
                                    if (e.target instanceof HTMLInputElement) {
                                        if (e.target.checked) {
                                            const array = this.state.listItems.map(i => i["key"]);
                                            this.setState({
                                                selectedRows: array,
                                                commandBarItems: this.getCommandbarItems(array.length)
                                            })
                                        } else {
                                            this.setState({
                                                selectedRows: [],
                                                commandBarItems: this.getCommandbarItems(0)
                                            })
                                        }
                                    }
                                }}
                                checked={this.getTableSelectionCellCheckedValue()}
                            ></TableSelectionCell>
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
                                <TableRow key={item.key} onDoubleClick={(e) => this.props.history.push("/identities/" + item.key + "/view")}>
                                    <TableSelectionCell
                                        onClick={(e) => {
                                            if (e.target instanceof HTMLInputElement) {
                                                if (e.target.checked) {
                                                    const array = [...this.state.selectedRows, item.key]
                                                    this.setState({
                                                        selectedRows: array,
                                                        commandBarItems: this.getCommandbarItems(array.length)
                                                    })
                                                } else {
                                                    const array = this.state.selectedRows.filter(it => it !== item.key)
                                                    this.setState({
                                                        selectedRows: array,
                                                        commandBarItems: this.getCommandbarItems(array.length)
                                                    })
                                                }
                                            }
                                        }}
                                        checked={this.state.selectedRows.indexOf(item.key) > -1}
                                    />
                                    {this.state.listColumns.map(column => {
                                        return (
                                            <TableCell key={column.fieldName}
                                                className={column.fieldName === "key" ? "codeStyle" : ""}>
                                                {item[column.fieldName]}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
                <p>{this.state.selectedRows.length} Item(s) selected</p>
            </div >
        )
    }
}

export default withRouter(IdentitiesSite);