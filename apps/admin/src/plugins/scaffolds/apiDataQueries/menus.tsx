import React from "react";
import { ReactComponent as Icon } from "./assets/round-ballot-24px.svg";
import { MenuPlugin } from "@webiny/app-admin/plugins/MenuPlugin";

/**
 * Registers "Api Data Queries" main menu item.
 */
export default new MenuPlugin({
    render({ Menu, Item }) {
        return (
            <Menu name="menu-api-data-queries" label={"Api Data Queries"} icon={<Icon />}>
                <Item label={"Api Data Queries"} path={"/api-data-queries"} />
            </Menu>
        );
    }
});
