import { DefaultButton, Dialog, DialogFooter, IDialogContentProps, PrimaryButton } from "@fluentui/react";
import React from "react";

interface DialogComponentProps {
    title: string;
    subText: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    dialogHidden: boolean
    primaryButtonAction: () => {}
    secondaryButtonAction?: () => {}
}

interface DialogComponentState {
    dialogHidden: boolean
}

export class DialogComponent extends React.Component<DialogComponentProps, DialogComponentState> {

    state: DialogComponentState = {
        dialogHidden: true
    }

    toggleHideDialog(): any {
        this.setState({
            dialogHidden: !this.state.dialogHidden
        })
    }

    getDialogContentProps(): IDialogContentProps {
        return {
            title: this.props.title,
            subText: this.props.subText
        }
    }

    primary() {
        this.toggleHideDialog()
        this.props.primaryButtonAction()
    }

    secondary() {
        this.toggleHideDialog();
        if (this.props.secondaryButtonAction) {
            this.props.secondaryButtonAction()
        }
    }

    render() {
        return <div>
            <Dialog
                hidden={this.props.dialogHidden}
                onDismiss={this.toggleHideDialog()}
                dialogContentProps={this.getDialogContentProps()}
            >
                <DialogFooter>
                    <PrimaryButton onClick={this.primary} text={this.props.primaryButtonText} />
                    <DefaultButton onClick={this.secondary} text={this.props.secondaryButtonText} />
                </DialogFooter>
            </Dialog>
        </div>
    }
}