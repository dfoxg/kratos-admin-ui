import { CommandBar, DetailsList, DetailsListLayoutMode, IColumn, ICommandBarItemProps, Selection } from "@fluentui/react";
import { V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { DetailListModel, SchemaField, SchemaService } from "../../service/schema-service";
import { KRATOS_ADMIN_CONFIG, KRATOS_PUBLIC_CONFIG } from "../../config";

interface IdentitiesState {
    commandBarItems: ICommandBarItemProps[]
    listItems: DetailListModel[]
    listColumns: IColumn[]
}



const ID_COLUMN = { key: 'id_column', name: 'ID', fieldName: 'key', minWidth: 200, maxWidth: 200, isResizable: true }

class IdentitiesSite extends React.Component<any, IdentitiesState> {
    state: IdentitiesState = {
        commandBarItems: this.getCommandbarItems(),
        listItems: [],
        listColumns: [ID_COLUMN]
    }

    private api = new V0alpha2Api(KRATOS_ADMIN_CONFIG);

    _selection: Selection = new Selection({
        onSelectionChanged: () => {
            this.setState({
                commandBarItems: this.getCommandbarItems()
            })
        },
    });

    componentDidMount() {
        this.refreshData(false);
    }

    private mapListColumns(fields: SchemaField[]): IColumn[] {
        if (fields.length === 0) {
            return [ID_COLUMN];
        } else {
            const array: IColumn[] = [];
            fields.forEach(field => {
                array.push({
                    isResizable: true,
                    minWidth: 50,
                    maxWidth: 200,
                    key: "column_" + field.name,
                    fieldName: field.name,
                    name: field.title
                });
            })
            array.push(ID_COLUMN)
            return array;
        }
    }

    private getCommandbarItems(): ICommandBarItemProps[] {
        const array: ICommandBarItemProps[] = []
        const localCount = this._selection ? this._selection.count : 0;

        array.push({
            key: 'new',
            text: 'New',
            iconProps: { iconName: 'EditCreate' },
            onClick: () => {
                this.props.history.push("/identities/create");
            }
        })
        if (localCount === 1) {
            array.push({
                key: 'view',
                text: 'View',
                iconProps: { iconName: 'EntryView' },
                onClick: () => {
                    this.props.history.push("/identities/" + this._selection.getSelection()[0].key + "/view")
                }
            })
            array.push({
                key: 'edit',
                text: 'Edit',
                iconProps: { iconName: 'Edit' },
                onClick: () => {
                    this.props.history.push("/identities/" + this._selection.getSelection()[0].key + "/edit")
                }
            })
        }
        if (localCount > 0) {
            array.push({
                key: 'delete',
                text: 'Delete',
                iconProps: { iconName: 'Delete' },
                onClick: () => this.deleteSelected()
            })
            array.push({
                key: 'recoveryLink',
                text: 'Recovery',
                iconProps: { iconName: 'MailReply' },
                onClick: () => this.recoverySelected()
            })
        }
        array.push({
            key: 'refresh',
            text: 'Refresh',
            iconProps: { iconName: 'Refresh' },
            onClick: () => this.refreshData(true)
        })

        return array;
    }

    private refreshData(showBanner: boolean) {
        this.refreshDataInternal(showBanner).then(() => { })
    }

    private async refreshDataInternal(showBanner: boolean) {
        const adminIdentitesReturn = await this.api.adminListIdentities();
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
            promises.push(this.api.adminDeleteIdentity(val.key))
        });
        Promise.all(promises).then(() => {
            this.refreshData(false);
        })
    }

    private recoverySelected() {
        const values: DetailListModel[] = this._selection.getSelection() as DetailListModel[];
        const promises: Promise<any>[] = [];
        values.forEach(val => {
            promises.push(this.api.adminCreateSelfServiceRecoveryLink({
                identity_id: val.key
            }))
        });
        Promise.all(promises).then(() => {
        })
    }

    render() {
        return (
            <div className="container">
                <h1>Identites</h1>
                <CommandBar
                    items={this.state.commandBarItems}
                    ariaLabel="Use left and right arrow keys to navigate between commands"
                />
                <p>{this._selection.count} Item(s) selected</p>
                <DetailsList
                    items={this.state.listItems}
                    columns={this.state.listColumns}
                    setKey="id"
                    selectionPreservedOnEmptyClick={true}
                    layoutMode={DetailsListLayoutMode.justified}
                    selection={this._selection}
                />
            </div>
        )
    }
}


export default withRouter(IdentitiesSite);