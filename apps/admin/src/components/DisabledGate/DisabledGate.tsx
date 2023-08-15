import React from 'react'

export const DisableGate: React.FC<{ disabled: boolean; children: React.ReactNode }> = ({
  disabled,
  children
}) => {
  const styles = disabled
    ? { pointerEvents: 'none', opacity: 0.15 }
    : {
        pointerEvents: 'auto',
        opacity: 1
      }
  // @ts-ignore
  return <span style={styles}>{children}</span>
}
