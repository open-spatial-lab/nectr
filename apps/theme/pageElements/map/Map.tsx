import React, { useEffect, useState } from "react";
import { request } from "graphql-request";
import { createRenderer, useRenderer } from "@webiny/app-page-builder-elements";
import { getApiUrl } from "../utils/dataApiUrl";

export interface MapProps {
    variables: {
        source: string;
        center: Array<number>;
        zoom: number;
        layerType: 'polygon' | 'scatter'
        geometryColumn: string;
        choroplethColumn: string;
    };
}

export const Map = createRenderer(() => {
    const { getElement } = useRenderer();
    const element = getElement<MapProps>();
    const { source,center, zoom, layerType, geometryColumn, choroplethColumn } = element.data.variables;

    useEffect(() => {
        const script = document.createElement("script");

        script.src = "https://www.unpkg.com/@open-spatial-lab/glmap@0.0.5/dist/glmap.es.js";
        script.async = true;
        script.type = "module"

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);
    return <osl-glmap
      center={JSON.stringify(center)}
      zoom={zoom}
      mapStyle="https://demotiles.maplibre.org/style.json"
    >
      <osl-map-layer
        layer={layerType}
        data={getApiUrl(source)}
        getPolygon={`(d) => d["${geometryColumn}"]`}
        choroplethColumn={choroplethColumn}
      >
      </osl-map-layer>
    </osl-glmap>
});

// define global html element table
declare global {
    namespace JSX {
        interface IntrinsicElements {
            "osl-glmap": any;
            "osl-map-layer": any;
        }
    }
}