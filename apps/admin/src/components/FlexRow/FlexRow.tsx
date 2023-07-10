import styled from "@emotion/styled";

interface FlexRowProps {
  border?: boolean;
  color?: string;
}

export const FlexRow = styled("div")<FlexRowProps>`
    display: flex;
    align-items: center;
    border: props => (props.border ? "1px solid var(--mdc-theme-on-background)" : null),
    background: props => (props.color ? props.color : null),
    /* any child */
    & > * {
        margin-right: 15px;
    }
    // "> *": {
    //     marginRight: 15,
    //     ":last-child": {
    //         marginRight: 0
    //     }
    // }
`;