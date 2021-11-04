import { CommandBar, DetailsList, DetailsListLayoutMode, Fabric, ICommandBarItemProps, IObjectWithKey, Selection } from "@fluentui/react";
import { V0alpha2Api, Identity } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { SchemaService } from "../../service/schema-service";
import { CONFIG, KRATOS_ADMIN_CONFIG } from "../../config";

interface IdentitiesState {
    commandBarItems: ICommandBarItemProps[]
    listItems: DetailListModel[]
}

interface DetailListModel extends IObjectWithKey {
    firstname: string
    lastname: string
    email: string
    id: string
}

class IdentitiesSite extends React.Component<any, IdentitiesState> {
    state: IdentitiesState = {
        commandBarItems: this.getCommandbarItems(),
        listItems: []
    }
    listColumns = [
        { key: 'column1', name: 'Firstname', fieldName: 'firstname', minWidth: 50, maxWidth: 200, isResizable: true },
        { key: 'column2', name: 'Lastname', fieldName: 'lastname', minWidth: 50, maxWidth: 200, isResizable: true },
        { key: 'column3', name: 'E-Mail', fieldName: 'email', minWidth: 100, maxWidth: 200, isResizable: true },
        { key: 'column4', name: 'ID', fieldName: 'id', minWidth: 200, maxWidth: 200, isResizable: true },
    ]

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

    private mapKratosIdentites(data: Identity[]): DetailListModel[] {
        return data.map(element => {
            const traits: any = element.traits;
            return {
                email: traits.email,
                firstname: traits.first_name,
                lastname: traits.last_name,
                id: element.id,
                key: element.id
            }
        })
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
        this.api.adminListIdentities().then(data => {
            if (data) {
                SchemaService.extractSchemas(data.data);
                this.setState({ listItems: this.mapKratosIdentites(data.data) })
                // TODO: if showBanner then show Info
            }
        });
    }

    private deleteSelected() {
        const values: DetailListModel[] = this._selection.getSelection() as DetailListModel[];
        const promises: Promise<any>[] = [];
        values.forEach(val=> {
            promises.push(this.api.adminDeleteIdentity(val.id))
        });
        Promise.all(promises).then(()=> {
            this.refreshData(false);
        })
    }

    private recoverySelected() {
        const values: DetailListModel[] = this._selection.getSelection() as DetailListModel[];
        const promises: Promise<any>[] = [];
        values.forEach(val=> {
            promises.push(this.api.adminCreateSelfServiceRecoveryLink({
                identity_id: val.id
            }))
        });
        Promise.all(promises).then(()=> {
            console.log("recovery requested")
        })
    }

    render() {
        return (
            <Fabric>
                <div className="container">
                    <h1>Identites</h1>
                    <CommandBar
                        items={this.state.commandBarItems}
                        ariaLabel="Use left and right arrow keys to navigate between commands"
                    />
                    <p>{this._selection.count} Item(s) selected</p>
                    <DetailsList
                        items={this.state.listItems}
                        columns={this.listColumns}
                        setKey="id"
                        selectionPreservedOnEmptyClick={true}
                        layoutMode={DetailsListLayoutMode.justified}
                        selection={this._selection}
                    />
                </div>
            </Fabric>
        )
    }
}


export default withRouter(IdentitiesSite);