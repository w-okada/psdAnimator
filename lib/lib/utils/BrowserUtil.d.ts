export declare const BrowserTypes: {
    readonly MSIE: "MSIE";
    readonly EDGE: "EDGE";
    readonly CHROME: "CHROME";
    readonly SAFARI: "SAFARI";
    readonly FIREFOX: "FIREFOX";
    readonly OPERA: "OPERA";
    readonly OTHER: "OTHER";
};
export type BrowserTypes = typeof BrowserTypes[keyof typeof BrowserTypes];
export declare const getBrowserType: () => "MSIE" | "EDGE" | "CHROME" | "SAFARI" | "FIREFOX" | "OPERA" | "OTHER";
