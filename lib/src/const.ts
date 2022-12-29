import { getBrowserType, ProcessorConfig, ProcessorParams } from "@dannadori/worker-manager"

export const FunctionTypes = {
    SET_MOTION: "SET_MOTION",
    SWITCH_MOTION_MODE: "SWITCH_MOTION_MODE",
    SET_WAIT_RATE: "SET_WAIT_RATE",
    START: "START",
    STOP: "STOP"

} as const;
export type FunctionTypes = typeof FunctionTypes[keyof typeof FunctionTypes];


export type AnimationFrameInfo = {
    "mode": string,
    "z_index": number,
    "number": number,
    "layer_path": string
}


export type PSDAnimatorConfig = ProcessorConfig & {
    psdFile: ArrayBuffer
    canvas: OffscreenCanvas | HTMLCanvasElement
    maxWidth: number
    maxHeight: number
}

export type PSDAnimatorParams = ProcessorParams & {
    type: FunctionTypes;
    motion?: AnimationFrameInfo[]
    waitRate?: number
    motionMode?: string
}


export const generateConfig = (psdFile: ArrayBuffer, canvas: HTMLCanvasElement, maxWidth: number, maxHeight: number, onLocal = false) => {
    const config: PSDAnimatorConfig = {
        browserType: getBrowserType(),
        onLocal: onLocal,
        processorURL: "https://cdn.jsdelivr.net/npm/@dannadori/psdanimator/dist/index.js",
        processorName: "PSDAnimator",
        transfer: [],
        psdFile: psdFile,
        canvas: canvas,
        maxWidth: maxWidth,
        maxHeight: maxHeight
    }
    return config
}