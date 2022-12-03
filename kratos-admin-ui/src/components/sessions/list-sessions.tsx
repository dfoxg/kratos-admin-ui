import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow, TableSelectionCell } from "@fluentui/react-components/unstable";
import { IdentityApi, Session, SessionAuthenticationMethod, SessionDevice } from "@ory/kratos-client";
import React from "react";
import { getKratosConfig } from "../../config";

interface ListSessionsProps {
    identity_id: string;
}

interface ListSessionsState {
    sessions: Session[];
}

export class ListSessions extends React.Component<ListSessionsProps, ListSessionsState> {

    state: Readonly<ListSessionsState> = {
        sessions: []
    }

    async componentDidMount() {
        const kratosConfig = await getKratosConfig();
        const api = new IdentityApi(kratosConfig.adminConfig);
        const sessionsAPIresponse = await api.listIdentitySessions({ id: this.props.identity_id });
        this.setState({
            sessions: sessionsAPIresponse.data
        });
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
                            </div>
                        }
                        {this.state.sessions.length === 0 ||
                            <div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableSelectionCell></TableSelectionCell>
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
                                                <TableSelectionCell></TableSelectionCell>
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