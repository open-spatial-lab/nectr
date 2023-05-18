import React from "react";
import { ReactComponent as Icon } from "./assets/round-ballot-24px.svg";
import { MenuPlugin } from "@webiny/app-admin/plugins/MenuPlugin";

/**
 * Registers "Datasets" main menu item.
 */
export default new MenuPlugin({
    render({ Menu, Item }) {
        return (
            <Menu name="menu-datasets" label={"Datasets"} icon={<Icon />}>
                <Item label={"Datasets"} path={"/datasets"} />
            </Menu>
        );
    }
});
