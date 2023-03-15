import React, { useEffect } from "react";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { BindComponentRenderPropOnChange } from "@webiny/form/types";
import { Typography } from "@webiny/ui/Typography";

export const ParamsEditor: React.FC<{value: string, onChange: BindComponentRenderPropOnChange<string>, data: any }> = ({
    value,
    onChange,
    data
}) => {
    if (!value){
        return null
    } 

    const parsed = JSON.parse(value);

    useEffect(() => {
        const regex = /{{(.*?)}}/g;
        const cleanRegex = /{{|}}/g;

        const matches = data?.template.match(regex).map((f:string) => f.replace(cleanRegex, ''));
        const currentKeys = Object.keys(parsed);

        const unmatchedKeys = matches.filter((match: string) => !currentKeys.includes(match))
        const excessKeys = currentKeys.filter((key: string) => !matches.includes(key))

        const temp = {...parsed};
        excessKeys.forEach((key: string) => delete temp[key])
        unmatchedKeys.forEach((key: string) => temp[key] = '')
        onChange(JSON.stringify(temp));

    }, [data?.template])
    
    const handleChange = (value: string, key: string) => {
        parsed[key] = value;
        onChange(JSON.stringify(parsed));
    }

    return (
        <Grid>
            {Object.entries(parsed).map(([key, value]) => (
                <>
                    <Cell tablet={3} desktop={3}>
                        <Typography use="body1" style={{textAlign: "right"}}>
                            {key}
                        </Typography>
                    </Cell>
                    <Cell tablet={9} desktop={9}>
                        <Input value={value as string} placeholder={`${key} default value`} onChange={(value: string) => handleChange(value, key)} />
                    </Cell>
                </>
            ))}
        </Grid>
    )

}