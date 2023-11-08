import React from "react";
import { ClearCacheButtonProps } from "./type";
import {useClearCache} from "../../../../admin/src/plugins/scaffolds/apiDataQueries/views/hooks/useClearCache";
import {ButtonSecondary as Button} from "@webiny/ui/Button"

export const ClearCacheButton: React.FC<ClearCacheButtonProps> = ({
  id
}) => {
 const {
    clearCache,
    lastCleared,
    isClearingCache
  } = useClearCache(id);
  
    return (
      <>
      <Button
        onClick={clearCache}
        disabled={isClearingCache}
        >
        Refresh Data View Now  
      </Button>
      {Boolean(lastCleared) ? <p style={{fontSize: '0.75rem', padding:'0.5rem 0'}}>Last cleared: {lastCleared}</p>: null}
        </>
    )
 }
