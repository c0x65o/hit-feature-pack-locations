// Type declarations for CSS imports and peer dependencies

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'leaflet/dist/leaflet.css' {
  const content: string;
  export default content;
}

declare module 'react-leaflet' {
  import { ComponentType, ReactNode } from 'react';
  import { LatLngExpression, MapOptions } from 'leaflet';

  export interface MapContainerProps extends MapOptions {
    children?: ReactNode;
    center: LatLngExpression;
    zoom?: number;
    bounds?: LatLngExpression[];
    style?: React.CSSProperties;
    scrollWheelZoom?: boolean;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
  }

  export interface MarkerProps {
    position: LatLngExpression;
    icon?: any;
    eventHandlers?: {
      click?: () => void;
    };
    children?: ReactNode;
  }

  export interface PopupProps {
    children?: ReactNode;
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Popup: ComponentType<PopupProps>;
}

