import React from "react";
import { Link, withRouter } from "react-router-dom";
import "./footer.scss"

class FooterComponent extends React.Component<any, any> {

    render(): React.ReactNode {
        return (
            <footer>
                <div className="text-center">
                    <p>
                        Powered by Open Source.&nbsp;
                        <a href="https://github.com/dfoxg/kratos-admin-ui" target="_blank" rel="noreferrer">Support the Project on Github</a>.&nbsp;
                        <Link to={"/overview"}>Environment overview</Link>.
                    </p>
                </div>
            </footer>
        )
    }

}

export default withRouter(FooterComponent);