declare module "react-doc-viewer" {
  import { FC } from "react";

  export interface IDocument {
    uri: string;
    fileName?: string;
    fileType?: string;
  }

  export interface IConfig {
    header?: {
      disableHeader?: boolean;
      disableFileName?: boolean;
      retainURLParams?: boolean;
    };
    csvDelimiter?: string;
    pdfZoom?: {
      defaultZoom?: number;
      zoomJump?: number;
    };
    pdfVerticalScrollByDefault?: boolean;
  }

  export interface DocViewerProps {
    documents: IDocument[];
    config?: IConfig;
    pluginRenderers?: unknown[];
    style?: React.CSSProperties;
    className?: string;
    onDocumentChange?: (document: IDocument) => void;
    onError?: (error: unknown) => void;
  }

  const DocViewer: FC<DocViewerProps>;
  export default DocViewer;

  export const DocViewerRenderers: unknown[];
}
