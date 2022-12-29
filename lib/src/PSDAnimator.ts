
import Psd, { Layer } from "@webtoon/psd";
import { NodeBase } from "@webtoon/psd/dist/classes/NodeBase";
import { AnimationFrameInfo, PSDAnimatorConfig, PSDAnimatorParams, PSDAnimatorResult } from "./const";
import { Processor, ProcessorConfig, ProcessorParams, ProcessorResult } from "@dannadori/worker-manager"

export class PSDAnimator extends Processor {
    canvas: OffscreenCanvas | HTMLCanvasElement
    psdFile: ArrayBuffer
    parts: { [key: string]: Layer }
    ratio: number
    width: number
    height: number

    psdAnimation: { [mode: string]: string[][] } = {}
    motionMode: string = "normal"
    animationCounter = 0
    wait = 30
    waitRate = 1.0
    started = false

    imageCache: { [path: string]: OffscreenCanvas | HTMLCanvasElement } = {}

    constructor(_config: ProcessorConfig) {
        super()
        const config = _config as PSDAnimatorConfig
        this.canvas = config.canvas
        this.psdFile = config.psdFile
        const psd = Psd.parse(this.psdFile);
        this.parts = this._parsePsdFile(psd)

        const ratioW = config.maxWidth / psd.width
        const ratioH = config.maxHeight / psd.height
        this.ratio = Math.min(ratioW, ratioH)

        this.width = psd.width * this.ratio
        this.height = psd.height * this.ratio
        this.canvas.width = this.width
        this.canvas.height = this.height

    }


    _generateLayerPath = (node: NodeBase, ancestors: string[]) => {
        ancestors.push(node.name)
        if (node.parent) {
            this._generateLayerPath(node.parent, ancestors)
        }
        return ancestors
    }

    _parsePsdFile = (psd: Psd) => {
        const parts: { [key: string]: Layer } = {}
        for (let i = 0; i < psd.layers.length; i++) {
            const layer = psd.layers[i]
            const ancestors = this._generateLayerPath(layer, []).reverse()
            const layerPath = ancestors.reduce((prev, cur) => {
                if (prev.length == 0) {
                    return cur
                } else {
                    return `${prev}_${cur}`
                }
            }, "")
            parts[layerPath] = layer
        }
        return parts
    }

    setMotion = (frameInfo: AnimationFrameInfo[]) => {
        const psdAnimation: { [mode: string]: string[][] } = {}
        frameInfo.forEach(x => {
            if (!psdAnimation[x.mode]) {
                psdAnimation[x.mode] = []
            }
            while (psdAnimation[x.mode].length < x.z_index + 1) {
                psdAnimation[x.mode].push([])
            }
            for (let i = 0; i < x.number; i++) {
                psdAnimation[x.mode][x.z_index].push(x.layer_path)
            }
        })
        this.psdAnimation = psdAnimation
    }

    switchMotionMode = (mode: string) => {
        this.motionMode = mode
    }

    setWaitRate = (rate: number) => {
        this.waitRate = rate
    }

    stop = () => {
        this.started = false
    }

    start = () => {
        if (this.started) {
            return
        }
        this.started = true
        const draw = async () => {
            this.animationCounter = (this.animationCounter + 1) % (1000 * 1000)
            const motion = this.psdAnimation[this.motionMode]
            if (!motion) {
                // noop
            } else {
                const ctx = this.canvas.getContext("2d")!
                // @ts-ignore
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                for (let z_index = 0; z_index < motion.length; z_index++) {
                    const layerList = motion[z_index]
                    const index = this.animationCounter % layerList.length
                    const drawingLayerPath = layerList[index]
                    const drawingLayer = this.parts[drawingLayerPath]

                    if (!this.imageCache[drawingLayerPath]) {
                        const buf = await drawingLayer.composite()

                        const imageData = new ImageData(
                            buf,
                            drawingLayer.width,
                            drawingLayer.height
                        );

                        let tmpCanvas: OffscreenCanvas | HTMLCanvasElement | null = null
                        let resizedTmpCanvas: OffscreenCanvas | HTMLCanvasElement | null = null
                        if (this.canvas instanceof OffscreenCanvas) {
                            tmpCanvas = new OffscreenCanvas(drawingLayer.width, drawingLayer.height)
                            resizedTmpCanvas = new OffscreenCanvas(drawingLayer.width * this.ratio, drawingLayer.height * this.ratio)
                        } else {
                            tmpCanvas = document.createElement("canvas")
                            tmpCanvas.width = drawingLayer.width
                            tmpCanvas.height = drawingLayer.height
                            resizedTmpCanvas = document.createElement("canvas")
                            resizedTmpCanvas.width = drawingLayer.width * this.ratio
                            resizedTmpCanvas.height = drawingLayer.height * this.ratio
                        }
                        // @ts-ignore
                        tmpCanvas.getContext("2d")!.putImageData(imageData, 0, 0);

                        // @ts-ignore
                        resizedTmpCanvas.getContext("2d")!.drawImage(tmpCanvas, 0, 0, resizedTmpCanvas.width, resizedTmpCanvas.height)
                        this.imageCache[drawingLayerPath] = resizedTmpCanvas
                    }

                    const tmpCanvas = this.imageCache[drawingLayerPath]
                    // @ts-ignore
                    ctx.drawImage(tmpCanvas, drawingLayer.left * this.ratio, drawingLayer.top * this.ratio, tmpCanvas.width, tmpCanvas.height)
                }
            }
            if (this.started) {
                setTimeout(draw, this.wait * this.waitRate)
            }
        }
        requestAnimationFrame(draw)
    }

    getLayerPaths = () => {
        return Object.keys(this.parts)
    }


    _errorResult = (detail: string): PSDAnimatorResult => {
        return {
            status: "failed",
            detail: detail,
            transfer: []
        }
    }

    process = (_params: ProcessorParams): PSDAnimatorResult => {
        const params = _params as PSDAnimatorParams
        // console.log(`PSDAnimatorParams:`, params)

        switch (params.type) {
            case "SET_MOTION":
                if (!params.motion) {
                    return this._errorResult(`No Motion Data.`)
                }
                this.setMotion(params.motion)
                break
            case "SET_WAIT_RATE":
                if (!params.waitRate) {
                    return this._errorResult(`No Wait Rate.`)
                }
                this.setWaitRate(params.waitRate)
                break
            case "START":
                this.start()
                break
            case "STOP":
                this.stop()
                break
            case "SWITCH_MOTION_MODE":
                if (!params.motionMode) {
                    return this._errorResult(`No Motion Mode.`)
                }
                this.switchMotionMode(params.motionMode)
                break
            case "GET_LAYER_PATHS":
                return {
                    status: "succeeded",
                    layerPaths: this.getLayerPaths(),
                    transfer: []
                }
            default:
                return this._errorResult(`UNKNOWN FUNCTION: ${params.type}`)
        }

        return {
            status: "succeeded",
            transfer: []
        }
    };

}

