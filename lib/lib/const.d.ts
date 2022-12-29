import { BrowserTypes } from "./utils/BrowserUtil";
export declare const WorkerCommand: {
    readonly INITIALIZE: "initialize";
    readonly EXECUTE: "execute";
};
export type WorkerCommand = typeof WorkerCommand[keyof typeof WorkerCommand];
export declare const WorkerResponse: {
    readonly INITIALIZED: "initialized";
    readonly EXECUTED: "EXECUTED";
};
export type WorkerResponse = typeof WorkerResponse[keyof typeof WorkerResponse];
export type ProcessorConfig = {
    browserType: BrowserTypes;
    onLocal: boolean;
    processorURL: string;
    processorName: string;
    transfer: (Transferable | HTMLCanvasElement)[];
};
export type ProcessorParams = {
    transfer: (Transferable | HTMLCanvasElement)[];
};
export declare const FunctionTypes: {
    readonly SET_MOTION: "SET_MOTION";
    readonly SWITCH_MOTION_MODE: "SWITCH_MOTION_MODE";
    readonly SET_WAIT_RATE: "SET_WAIT_RATE";
    readonly START: "START";
    readonly STOP: "STOP";
};
export type FunctionTypes = typeof FunctionTypes[keyof typeof FunctionTypes];
export type AnimationFrameInfo = {
    "mode": string;
    "z_index": number;
    "number": number;
    "layer_path": string;
};
export type PSDAnimatorConfig = ProcessorConfig & {
    psdFile: ArrayBuffer;
    canvas: OffscreenCanvas | HTMLCanvasElement;
    maxWidth: number;
    maxHeight: number;
};
export type PSDAnimatorParams = ProcessorParams & {
    type: FunctionTypes;
    motion?: AnimationFrameInfo[];
    waitRate?: number;
    motionMode?: string;
};
