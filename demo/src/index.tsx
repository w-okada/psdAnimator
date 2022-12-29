import React, { useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { generateConfig, PSDAnimatorParams, PSDAnimatorResult, WorkerManager } from "@dannadori/psdanimator";

import "./index.css"

const App = () => {
    const w = useMemo(() => {
        return new WorkerManager()
    }, [])

    const loadPsd = async () => {
        const psdFile = await (await fetch("./zundamonB.psd")).arrayBuffer()
        const canvas = document.getElementById("test-canvas1") as HTMLCanvasElement
        // const c = generateConfig(psdFile, canvas, 640, 480, true)
        const c = generateConfig(psdFile, canvas, 640, 480, false)
        c.transfer = [c.canvas]
        c.processorURL = `${window.location.origin}/js/index.js`


        await w.init(c)
        console.log("Initialized")
    }
    const setMotion = async () => {
        const p1: PSDAnimatorParams = {
            type: "SET_MOTION",
            motion: [
                { "mode": "normal", "z_index": 0, "number": 10, "layer_path": "ROOT_ポニテ？_2" },
                { "mode": "normal", "z_index": 0, "number": 10, "layer_path": "ROOT_ポニテ？_1" },
                { "mode": "normal", "z_index": 0, "number": 10, "layer_path": "ROOT_ポニテ？_2" },

                { "mode": "normal", "z_index": 1, "number": 1, "layer_path": "ROOT_体_1" },

                { "mode": "normal", "z_index": 2, "number": 30, "layer_path": "ROOT_表情_眉_1" },
                { "mode": "normal", "z_index": 2, "number": 2, "layer_path": "ROOT_表情_眉_2" },

                { "mode": "normal", "z_index": 3, "number": 30, "layer_path": "ROOT_表情_口_7" },
                { "mode": "normal", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_2" },
                { "mode": "normal", "z_index": 3, "number": 30, "layer_path": "ROOT_表情_口_7" },
                { "mode": "normal", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_10" },
                { "mode": "normal", "z_index": 3, "number": 30, "layer_path": "ROOT_表情_口_7" },

                { "mode": "normal", "z_index": 4, "number": 30, "layer_path": "ROOT_表情_目_6" },
                { "mode": "normal", "z_index": 4, "number": 1, "layer_path": "ROOT_表情_目_7" },
                { "mode": "normal", "z_index": 4, "number": 1, "layer_path": "ROOT_表情_目_9" },
                { "mode": "normal", "z_index": 4, "number": 30, "layer_path": "ROOT_表情_目_6" },
                { "mode": "normal", "z_index": 4, "number": 2, "layer_path": "ROOT_表情_目_13" },
                { "mode": "normal", "z_index": 4, "number": 30, "layer_path": "ROOT_表情_目_6" },
                { "mode": "normal", "z_index": 4, "number": 2, "layer_path": "ROOT_表情_目_14" },
                { "mode": "normal", "z_index": 4, "number": 5, "layer_path": "ROOT_表情_目_15" },

                { "mode": "normal", "z_index": 5, "number": 60, "layer_path": "ROOT_耳_3" },
                { "mode": "normal", "z_index": 5, "number": 5, "layer_path": "ROOT_耳_2" },
                { "mode": "normal", "z_index": 5, "number": 60, "layer_path": "ROOT_耳_3" },
                { "mode": "normal", "z_index": 5, "number": 5, "layer_path": "ROOT_耳_1" },



                { "mode": "talking", "z_index": 0, "number": 10, "layer_path": "ROOT_ポニテ？_2" },

                { "mode": "talking", "z_index": 1, "number": 1, "layer_path": "ROOT_体_1" },

                { "mode": "talking", "z_index": 2, "number": 1, "layer_path": "ROOT_表情_眉_1" },
                { "mode": "talking", "z_index": 2, "number": 1, "layer_path": "ROOT_表情_眉_2" },

                { "mode": "talking", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_7" },
                { "mode": "talking", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_2" },
                { "mode": "talking", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_7" },
                { "mode": "talking", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_10" },
                { "mode": "talking", "z_index": 3, "number": 2, "layer_path": "ROOT_表情_口_7" },

                { "mode": "talking", "z_index": 4, "number": 30, "layer_path": "ROOT_表情_目_6" },

                { "mode": "talking", "z_index": 5, "number": 5, "layer_path": "ROOT_耳_1" }
            ],
            transfer: []

        }
        await w.execute(p1)
        console.log("set motion")
    }

    const setMotionMode1 = async () => {
        const p2: PSDAnimatorParams = {
            type: "SWITCH_MOTION_MODE",
            motionMode: "normal",
            transfer: []
        }
        await w.execute(p2)
        console.log("set motion mode")

    }
    const getLayerPaths = async () => {
        const p2: PSDAnimatorParams = {
            type: "GET_LAYER_PATHS",
            transfer: []
        }
        const layers = await w.execute(p2) as PSDAnimatorResult
        console.log("LAYERS", layers)

        const p1: PSDAnimatorParams = {
            type: "SET_MOTION",
            motion: [
                { "mode": "normal", "z_index": 0, "number": 10, "layer_path": layers.layerPaths![0] },
            ],
            transfer: []

        }
        await w.execute(p1)

    }

    const start = async () => {
        const p3: PSDAnimatorParams = {
            type: "START",
            transfer: []
        }
        await w.execute(p3)
        console.log("start motion")
    }
    const stop = async () => {
        const p3: PSDAnimatorParams = {
            type: "STOP",
            transfer: []
        }
        await w.execute(p3)
        console.log("stop motion")
    }

    const speedUp = async () => {
        const p3: PSDAnimatorParams = {
            type: "SET_WAIT_RATE",
            waitRate: 0.001,
            transfer: []
        }
        await w.execute(p3)
        console.log("start wait rate")
    }


    const speedDown = async () => {
        const p3: PSDAnimatorParams = {
            type: "SET_WAIT_RATE",
            waitRate: 4,
            transfer: []
        }
        await w.execute(p3)
        console.log("start wait rate")
    }

    const forceDraw = () => {
        console.log("draw")
        const canvas1 = document.getElementById("test-canvas1") as HTMLCanvasElement
        const canvas2 = document.getElementById("test-canvas2") as HTMLCanvasElement
        const ctx = canvas2.getContext("2d")!
        ctx.clearRect(0, 0, canvas2.width, canvas2.height)
        ctx.drawImage(canvas1, 0, 0, canvas2.width, canvas2.height)
    }
    const clear = () => {
        console.log("clear")
        const canvas2 = document.getElementById("test-canvas2") as HTMLCanvasElement
        canvas2.width = 300
        canvas2.height = 300
        const ctx = canvas2.getContext("2d")!
        ctx.clearRect(0, 0, canvas2.width, canvas2.height)
    }

    useEffect(() => {
        const draw = async () => {
            const canvas1 = document.getElementById("test-canvas1") as HTMLCanvasElement

            ///// **** Stack updating the image, I dont knwo why. ****
            // const canvas2 = document.getElementById("test-canvas2") as HTMLCanvasElement
            // const ctx = canvas2.getContext("2d")!
            // ctx.clearRect(0, 0, canvas2.width, canvas2.height)
            // ctx.drawImage(canvas1, 0, 0, canvas2.width, canvas2.height)
            // // requestAnimationFrame(draw)
            // setTimeout(draw, 100)

            ///// **** Capture stream is OK. ****
            const video = document.getElementById("test-video") as HTMLVideoElement
            video.srcObject = canvas1.captureStream()
            video.play()


        }
        draw()
    }, [])

    return (
        <div className="root-div">
            <div className="header">
                <div className="header-button" onClick={loadPsd}>load</div>
                <div className="header-button" onClick={setMotion}>set motion</div>
                <div className="header-button" onClick={setMotionMode1}>set mode1</div>
                <div className="header-button" onClick={getLayerPaths}>get paths</div>
                <div className="header-button" onClick={start}>start</div>
                <div className="header-button" onClick={stop}>stop</div>
                <div className="header-button" onClick={speedUp}>speed_up</div>
                <div className="header-button" onClick={speedDown}>speed_down</div>
                {/* <div className="header-button" onClick={forceDraw}>draw</div> */}
                {/* <div className="header-button" onClick={clear}>clear</div> */}
            </div>
            <div className="body">
                <canvas id="test-canvas1" className="left-canvas"></canvas>
                {/* <canvas id="test-canvas2" className="right-canvas"></canvas> */}
                <video id="test-video" className="right-canvas"></video>
            </div>
        </div>
    )
}

const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <App></App>
);
