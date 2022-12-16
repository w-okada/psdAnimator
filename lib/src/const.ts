import { BrowserTypes } from "./utils/BrowserUtil";

export const WorkerCommand = {
    INITIALIZE: "initialize",
    EXECUTE: "execute",
} as const;
export type WorkerCommand = typeof WorkerCommand[keyof typeof WorkerCommand];

export const WorkerResponse = {
    INITIALIZED: "initialized",
    EXECUTED: "EXECUTED",
} as const;
export type WorkerResponse = typeof WorkerResponse[keyof typeof WorkerResponse];



export const FunctionTypes = {
    SET_MOTION: "SET_MOTION",
    SWITCH_MOTION_MODE: "SWITCH_MOTION_MODE",
    SET_WAIT_RATE: "SET_WAIT_RATE",
    START: "START",
    STOP: "STOP"

} as const;
export type FunctionTypes = typeof FunctionTypes[keyof typeof FunctionTypes];



export interface Config {
    browserType: BrowserTypes;
    onLocal: boolean
    psdFile: ArrayBuffer
    canvas: OffscreenCanvas | HTMLCanvasElement
}

export interface OperationParams {
    type: FunctionTypes;
    motion?: AnimationFrameInfo[]
    waitRate?: number
    motionMode?: string

}



export type AnimationFrameInfo = {
    "mode": string,
    "z_index": number,
    "number": number,
    "layer_path": string
}
