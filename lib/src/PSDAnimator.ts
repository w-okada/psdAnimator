
import Psd, { Layer } from "@webtoon/psd";
import { NodeBase } from "@webtoon/psd/dist/classes/NodeBase";
import { AnimationFrameInfo } from "./const";

export class PSDAnimator {
    canvas: OffscreenCanvas | HTMLCanvasElement
    psdFile: ArrayBuffer
    parts: { [key: string]: Layer }
    width: number
    height: number

    psdAnimation: { [mode: string]: string[][] } = {}
    motionMode: string = "normal"
    animationCounter = 0
    wait = 30
    waitRate = 1.0
    started = false

    constructor(psdFile: ArrayBuffer, canvas: OffscreenCanvas | HTMLCanvasElement) {
        this.canvas = canvas
        this.psdFile = psdFile
        const psd = Psd.parse(this.psdFile);
        this.parts = this._parsePsdFile(psd)
        this.width = psd.width
        this.height = psd.height
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
                    const buf = await drawingLayer.composite()

                    const imageData = new ImageData(
                        buf,
                        drawingLayer.width,
                        drawingLayer.height
                    );

                    let tmpCanvas: OffscreenCanvas | HTMLCanvasElement | null = null
                    if (this.canvas instanceof OffscreenCanvas) {
                        tmpCanvas = new OffscreenCanvas(drawingLayer.width, drawingLayer.height)

                    } else {
                        tmpCanvas = document.createElement("canvas")
                        tmpCanvas.width = drawingLayer.width
                        tmpCanvas.height = drawingLayer.height
                    }

                    // @ts-ignore
                    tmpCanvas.getContext("2d")!.putImageData(imageData, 0, 0)

                    // @ts-ignore
                    ctx.drawImage(tmpCanvas, drawingLayer.left, drawingLayer.top, drawingLayer.width, drawingLayer.height)
                }
            }
            if (this.started) {
                setTimeout(draw, this.wait * this.waitRate)
            }
        }
        requestAnimationFrame(draw)
    }
}

