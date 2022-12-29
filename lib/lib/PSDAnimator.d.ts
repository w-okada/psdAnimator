import Psd, { Layer } from "@webtoon/psd";
import { NodeBase } from "@webtoon/psd/dist/classes/NodeBase";
import { AnimationFrameInfo, ProcessorConfig, ProcessorParams } from "./const";
import { Processor } from "./Processor";
export declare class PSDAnimator extends Processor {
    canvas: OffscreenCanvas | HTMLCanvasElement;
    psdFile: ArrayBuffer;
    parts: {
        [key: string]: Layer;
    };
    ratio: number;
    width: number;
    height: number;
    psdAnimation: {
        [mode: string]: string[][];
    };
    motionMode: string;
    animationCounter: number;
    wait: number;
    waitRate: number;
    started: boolean;
    imageCache: {
        [path: string]: OffscreenCanvas | HTMLCanvasElement;
    };
    constructor(_config: ProcessorConfig);
    _generateLayerPath: (node: NodeBase, ancestors: string[]) => string[];
    _parsePsdFile: (psd: Psd) => {
        [key: string]: Layer;
    };
    setMotion: (frameInfo: AnimationFrameInfo[]) => void;
    switchMotionMode: (mode: string) => void;
    setWaitRate: (rate: number) => void;
    stop: () => void;
    start: () => void;
    process: (_params: ProcessorParams) => void;
}
