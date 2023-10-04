import React from "react";

export default function useFullBundle() {
  React.useEffect(() => {
    let alreadyHasScript = false;
    if (typeof document === 'undefined') {
      return;
    }
    for (let i = 0; i < document.scripts.length; i++) {
      if (document.scripts[i].src === 'https://unpkg.com/@open-spatial-lab/full-bundle') {
        alreadyHasScript = true;
        break;
      }
    }
    if (alreadyHasScript) {
      return;
    }
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@open-spatial-lab/full-bundle'
    script.async = true
    script.type = 'module'
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])
}
export const fullBundleScriptText = `<script type="module" src="https://unpkg.com/@open-spatial-lab/full-bundle" async></script>`
