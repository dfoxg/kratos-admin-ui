import { Button } from "@fluentui/react-components";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, TableSelectionCell, Toolbar, ToolbarButton } from "@fluentui/react-components/unstable";
import { ArrowClockwiseRegular, ContentViewRegular } from "@fluentui/react-icons";
import { IdentityApi, Session, SessionAuthenticationMethod, SessionDevice } from "@ory/kratos-client";
import React from "react";
import { getKratosConfig } from "../../config";
import { ToolbarItem } from "../../sites/identities/identies";

interface ListSessionsProps {
    identity_id: string;
}

interface ListSessionsState {
    sessions: Session[];
    commandBarItems: ToolbarItem[];
    selectedRows: any[];
}

export class ListSessions extends React.Component<ListSessionsProps, ListSessionsState> {

    state: Readonly<ListSessionsState> = {
        sessions: [],
        commandBarItems: this.getCommandbarItems(0, 0),
        selectedRows: []
    }

    identityApi?: IdentityApi;


    async componentDidMount() {
        await this.refreshData(false)
    }

    private async refreshData(showBanner: boolean) {
        const kratosConfig = await getKratosConfig();
        this.identityApi = new IdentityApi(kratosConfig.adminConfig);
        const sessionsAPIresponse = await this.identityApi.listIdentitySessions({ id: this.props.identity_id });
        this.setState({
            sessions: sessionsAPIresponse.data,
            selectedRows: [],
            commandBarItems: this.getCommandbarItems(0, sessionsAPIresponse.data.length)
        });
    }

    getCommandbarItems(countSelectedElements: number, countSessions: number): ToolbarItem[] {
        const array: ToolbarItem[] = []

        if (countSelectedElements > 0) {
            array.push({
                icon: ContentViewRegular,
                text: "Deactivate",
                key: "deactivate",
                onClick: () => {
                    this.deactiveSelected()
                }
            })
        }

        if (countSessions > 0) {
            array.push({
                icon: ContentViewRegular,
                text: "Delete & Invalidate all",
                key: "delete_invalidate",
                onClick: () => {
                    this.identityApi?.deleteIdentitySessions({
                        id: this.props.identity_id
                    }).then(d => {
                        this.refreshData(false)
                    })
                }
            })
        }

        array.push({
            key: 'refresh',
            text: 'Refresh',
            icon: ArrowClockwiseRegular,
            onClick: () => this.refreshData(true)
        })

        return array
    }

    private deactiveSelected() {
        const values = this.state.selectedRows;
        const promises: Promise<any>[] = [];
        values.forEach(val => {
            promises.push(this.identityApi!.disableSession({
                id: val
            }))
        });
        Promise.all(promises).then(() => {
            this.refreshData(false);
        })
    }

    private getTableSelectionCellCheckedValue(): 'mixed' | boolean {
        if (this.state.selectedRows.length === 0) {
            return false;
        }
        if (this.state.selectedRows.length === this.state.sessions.length) {
            return true;
        }
        return "mixed";
    }

    mapBoolean(state?: boolean): string {
        if (state) {
            return "true"
        }
        return "false"
    }

    mapAuthenticationMethod(list?: SessionAuthenticationMethod[]): string {
        if (list) {
            return list.map(el => el.method).join(", ")
        }
        return "none"
    }

    mapDevices(devices?: SessionDevice[]): string {
        if (devices) {
            return devices.map(d => {
                if (d.location) {
                    return d.ip_address + " (" + d.location + ")"
                }
                return d.ip_address
            }).join(", ");
        }
        return "none"
    }

    mapDate(dateString?: string): string {
        if (dateString) {
            return new Date(dateString).toLocaleString()
        }
        return "none"
    }


    render(): React.ReactNode {
        return (
            <div>
                {!this.state.sessions ||
                    <div>
                        {this.state.sessions.length !== 0 ||
                            <div>
                                <p>There are no sessions referenced with this identity</p>
                                <Button onClick={(e) => this.refreshData(true)}>Refresh</Button>
                            </div>
                        }
                        {this.state.sessions.length === 0 ||
                            <div>
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
                                                            const array = this.state.sessions.map(i => i.id);
                                                            this.setState({
                                                                selectedRows: array,
                                                                commandBarItems: this.getCommandbarItems(array.length, this.state.sessions.length)
                                                            })
                                                        } else {
                                                            this.setState({
                                                                selectedRows: [],
                                                                commandBarItems: this.getCommandbarItems(0, this.state.sessions.length)
                                                            })
                                                        }
                                                    }
                                                }}
                                                checked={this.getTableSelectionCellCheckedValue()}
                                            ></TableSelectionCell>
                                            <TableHeaderCell>Active</TableHeaderCell>
                                            <TableHeaderCell>Authentication Method</TableHeaderCell>
                                            <TableHeaderCell>Assurance Level</TableHeaderCell>
                                            <TableHeaderCell>Devices</TableHeaderCell>
                                            <TableHeaderCell>Authenticated at</TableHeaderCell>
                                            <TableHeaderCell>Expires at</TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {this.state.sessions.map(session => {
                                            return (<TableRow key={session.id}>
                                                <TableSelectionCell
                                                    onClick={(e) => {
                                                        if (e.target instanceof HTMLInputElement) {
                                                            if (e.target.checked) {
                                                                const array = [...this.state.selectedRows, session.id]
                                                                this.setState({
                                                                    selectedRows: array,
                                                                    commandBarItems: this.getCommandbarItems(array.length, this.state.sessions.length)
                                                                })
                                                            } else {
                                                                const array = this.state.selectedRows.filter(it => it !== session.id)
                                                                this.setState({
                                                                    selectedRows: array,
                                                                    commandBarItems: this.getCommandbarItems(array.length, this.state.sessions.length)
                                                                })
                                                            }
                                                        }
                                                    }}
                                                    checked={this.state.selectedRows.indexOf(session.id) > -1}
                                                ></TableSelectionCell>
                                                <TableCell className="codeStyle">{this.mapBoolean(session.active)}</TableCell>
                                                <TableCell className="codeStyle">{this.mapAuthenticationMethod(session.authentication_methods)}</TableCell>
                                                <TableCell className="codeStyle">{session.authenticator_assurance_level}</TableCell>
                                                <TableCell className="codeStyle">{this.mapDevices(session.devices)}</TableCell>
                                                <TableCell>{this.mapDate(session.authenticated_at)}</TableCell>
                                                <TableCell>{this.mapDate(session.expires_at)}</TableCell>
                                            </TableRow>)
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}