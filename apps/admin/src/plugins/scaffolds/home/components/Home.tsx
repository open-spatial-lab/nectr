import React from "react";
import { css } from "emotion";
import styled from "@emotion/styled";
// import { Link } from "@webiny/react-router";
import {
    SimpleForm,
    SimpleFormHeader,
    SimpleFormContent,
    SimpleFormFooter
} from "@webiny/app-admin/components/SimpleForm";
import { useSecurity } from "@webiny/app-security/hooks/useSecurity";
import { plugins } from "@webiny/plugins";
import { Typography } from "@webiny/ui/Typography";
import { Cell, Grid } from "@webiny/ui/Grid";
import { Elevation } from "@webiny/ui/Elevation";
import { AdminWelcomeScreenWidgetPlugin } from "@webiny/app-plugin-admin-welcome-screen/types";

// const linkStyle = css({
//     textDecoration: "none",
//     "&:hover": {
//         textDecoration: "none"
//     },
//     color: "var(--mdc-theme-text-primary-on-background)"
// });

// const imageStyle = css({
//     width: "30px",
//     height: "30px",
//     marginBottom: "5px"
// });

// const communityStyle = css({
//     textAlign: "left"
// });

const widgetTitleStyle = css({
    fontWeight: 600,
    paddingTop: "1rem",
    paddingBottom: "1rem",
    textAlign: "center"
});

const widgetDescriptionStyle = css({
    textAlign: "center",
    paddingLeft: "20px",
    paddingRight: "20px"
});

// const iconTextStyle = css({
//     textAlign: "center"
// });

// const pFormContentStyle = css({
//     fontWeight: 600
// });

const pGetStartedStyle = css({
    paddingLeft: "1.5rem",
    paddingTop: "1.5rem"
});

// const footerContainerStyle = css({
//     display: "flex",
//     padding: "1rem"
// });

const widgetButtonStyle = css`
  text-align: center;
  margin-top: auto;
`;

// const footerTextStyle = css({
//     backgroundColor: "var(--mdc-theme-on-background)",
//     margin: "1rem"
// });

// const footerLinkTextStyle = css({
//     fontWeight: 600,
//     paddingLeft: "1rem"
// });

const ContentTheme = styled("div")({
    color: "var(--mdc-theme-text-primary-on-background)"
});

const Widget = styled.div`
    margin-left: 1.5rem;
    margin-right: 1.5rem;
    margin-bottom: 2rem;
    flex: 1 1 21%;
    max-width: 25%;
    min-height: 250px;
`;

const WelcomeScreenWidgetsWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    @media (max-width: 479px) {
        flex-direction: column;
    }
`;

const elevation = css`
    padding: 10px;
    height: calc(100% - 20px);
    display: flex;
    flex-direction: column;
`;

const Welcome: React.FC = () => {
    const { identity, getPermission } = useSecurity();

    if (!identity) {
        return null;
    }

    const widgets = plugins
        .byType<AdminWelcomeScreenWidgetPlugin>("admin-welcome-screen-widget")
        .filter(pl => {
            if (pl.permission) {
                return getPermission(pl.permission);
            }
            return true;
        });

    const canSeeAnyWidget = widgets.length > 0;

    return (
        <SimpleForm>
            <SimpleFormHeader title={`Hi ${identity.displayName}!`} />
            <SimpleFormContent>
                <ContentTheme>
                    <Cell span={12}>
                        <Typography use={"headline6"}>
                            {canSeeAnyWidget && (
                                <p className={pGetStartedStyle}>
                                    To get started - pick one of the actions below:
                                </p>
                            )}
                            {!canSeeAnyWidget && (
                                <p className={pGetStartedStyle}>
                                    Please contact the administrator for permissions to access
                                    Webiny apps.
                                </p>
                            )}
                            <br />
                        </Typography>
                    </Cell>
                    <WelcomeScreenWidgetsWrapper>
                        {widgets.map(pl => {
                            return (
                                <Widget key={pl.name} data-testid={pl.name}>
                                    <Elevation z={2} className={elevation}>
                                        <Typography use={"headline6"}>
                                            <p className={widgetTitleStyle}>{pl.widget.title}</p>
                                        </Typography>
                                        <Typography use={"body1"}>
                                            <p className={widgetDescriptionStyle}>
                                                {pl.widget.description}
                                            </p>
                                        </Typography>
                                        <div className={widgetButtonStyle}>{pl.widget.cta}</div>
                                    </Elevation>
                                </Widget>
                            );
                        })}
                    </WelcomeScreenWidgetsWrapper>
                </ContentTheme>
            </SimpleFormContent>
            <SimpleFormFooter>
                <Grid>
                </Grid>
            </SimpleFormFooter>
        </SimpleForm>
    );
};

export default Welcome;