import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimationFrameInfo, generateConfig, PSDAnimatorParams, PSDAnimatorResult, WorkerManager } from "@dannadori/psdanimator";

import "./index.css"
import { fileSelector } from "./utils";
import { reverse } from "dns";

const MotionType = {
    "normal": "normal",
    "talking": "talking",
} as const
type MotionType = typeof MotionType[keyof typeof MotionType]

type Motions = {
    normal: { [key: string]: { part: string, duration: number }[] }
    talking: { [key: string]: { part: string, duration: number }[] }
}
const InitialMotions: Motions = {
    normal: {},
    talking: {}
}

const App = () => {
    const w = useMemo(() => {
        return new WorkerManager()
    }, [])
    const [psdData, setPsdData] = useState<ArrayBuffer>()
    const [dirs, setDirs] = useState<string[]>([])
    const [catalog, setCatalog] = useState<{ [key: string]: string[] }>({})
    // const [usingParts, setUsingParts] = useState<{ [key: "normal" | "aa"]:  }>({})
    const [motions, setMotions] = useState<Motions>(InitialMotions)
    const [targetMotion, setTargetMotion] = useState<MotionType>(MotionType.normal)

    useEffect(() => {
        if (!psdData) {
            return
        }
        const setConfig = async () => {
            const canvas = document.getElementById("test-canvas1") as HTMLCanvasElement
            const c = generateConfig(psdData, canvas, 800, 1200, false)
            // c.processorURL = "https://172.28.71.147:8080/process.js"
            c.transfer = [c.canvas]
            await w.init(c)
            console.log("Initialized")

            const p2: PSDAnimatorParams = {
                type: "GET_LAYER_PATHS",
                transfer: []
            }

            const layers = await w.execute(p2) as PSDAnimatorResult
            if (!layers.layerPaths) {
                return
            }
            const pairs: [string, string][] = layers.layerPaths.map(path => {
                const nodes = path.split("_")
                const leaf = nodes.pop() as string
                const dirname = nodes.reduce((prev, cur) => {
                    if (prev.length == 0) {
                        return cur
                    } else {
                        return prev + "_" + cur
                    }
                }, "")
                return [dirname, leaf]
            })

            // for z-index
            const dirs = pairs.reduce((prev, cur) => {
                const dir = cur[0]
                if (!prev.includes(dir)) {
                    prev.push(dir)
                }
                return prev
            }, [] as string[]).reverse()

            const catalog = pairs.reduce((prev, cur) => {
                const dir = cur[0]
                if (!prev[dir]) {
                    prev[dir] = []
                }
                prev[dir].push(cur[1])
                return prev
            }, {} as { [key: string]: string[] })

            // const selected = dirs.reduce((prev, cur) => {
            //     const dir = cur
            //     if (!prev[dir]) {
            //         prev[dir] = []
            //     }
            //     return prev
            // }, {} as { [key: string]: { part: string, duration: number }[] })

            setDirs(dirs)
            setCatalog(catalog)
            // setUsingParts(selected)
            // console.log("LAYERS", layers, selected)

            const p3: PSDAnimatorParams = {
                type: "SET_WAIT_RATE",
                waitRate: 4,
                transfer: []
            }
            await w.execute(p3)
            console.log("start wait rate")
        }
        setConfig()
    }, [psdData])



    const fileLoader = useMemo(() => {
        const onFileLoadClicked = async () => {
            const file = await fileSelector("")
            if (file.name.endsWith(".psd") == false) {
                alert("ファイルの拡張子はpsdである必要があります。")
                return
            }
            const data = await file.arrayBuffer();
            setPsdData(data)

        }
        return (
            <div className="split-3-4-3">
                <div className="body-item-title">Load PSD</div>
                <div className="body-item-text">
                    <div></div>
                </div>
                <div className="body-button-container">
                    <div className="body-button" onClick={onFileLoadClicked}>Select</div>
                </div>
            </div>
        )
    }, [])

    const targetMotionRow = useMemo(() => {
        const options = Object.values(MotionType).map(motion => {
            return <option key={motion} value={motion}>{motion}</option>
        })

        return (
            <div className="split-3-4-3">
                <div className="body-item-title">Motion Type</div>
                <div className="body-item-text">
                    <div>
                        <select value={targetMotion} onChange={(e) => { setTargetMotion(e.target.value as MotionType) }}>
                            {options}
                        </select>
                    </div>
                </div>
                <div className="body-button-container">
                </div>
            </div>
        )

    }, [targetMotion])

    const catalogArea = useMemo(() => {
        const motion = motions[targetMotion]
        const rows = dirs.map((x, index) => {
            const parts = catalog[x]
            const options = parts.map(part => {
                return <option key={part} value={part}>{part}</option>
            })


            const onPartsSelected = (index: number, v: string) => {
                motion[x][index].part = v;
                motions[targetMotion] = motion
                setMotions({ ...motions })
            }
            const onDurationChange = (index: number, duration: number) => {
                motion[x][index].duration = duration;
                motions[targetMotion] = motion
                setMotions({ ...motions })
            }
            const onDeleteClicked = (index: number) => {
                motion[x].splice(index, 1)
                setMotions({ ...motions })
            }
            const dirUsingParts = motion[x]


            const partRow = dirUsingParts?.map((part, index) => {
                return (
                    <div key={part.part + "_" + index} className="body-item-title split-4-3-3 left-padding-2">
                        <div>
                            <select value={part.part} onChange={(e) => { onPartsSelected(index, e.target.value) }}>
                                {options}
                            </select>
                        </div>
                        <div>
                            <input type="number" value={part.duration} min="10" max="1000" step="10" onChange={(e) => { onDurationChange(index, Number(e.target.value)) }}></input>
                        </div>
                        <div>
                            <div className="body-button" onClick={() => { onDeleteClicked(index) }}>del</div>
                        </div>
                    </div >
                )
            }) || <></>

            const onAddClick = (dirname: string) => {
                if (!motion[dirname]) {
                    motion[dirname] = []
                }
                motion[dirname].push({
                    part: catalog[dirname][0],
                    duration: 10
                })
                motions[targetMotion] = motion
                setMotions({ ...motions })
            }
            return (
                <div key={x}>
                    <div className="body-item-title split-4-3-3 left-padding-1">
                        <div>{x}</div>
                        <div>(z:{index})</div>
                        <div className="body-button-container">
                            <div className="body-button" onClick={() => { onAddClick(x) }}>add</div>
                        </div>

                    </div>
                    {partRow}
                </div>
            )
        })
        return rows
    }, [dirs, catalog, targetMotion, motions])

    const downloadRow = useMemo(() => {
        const onDownloadClicked = () => {
            const motionTypes = Object.keys(motions)
            const motionSettings = motionTypes.map(motionType => {
                let motion: typeof motions.normal
                if (motionType == "normal") {
                    motion = motions.normal
                } else if (motionType == "talking") {
                    motion = motions.talking
                }
                // //@ts-ignore
                // const motion = motions[motionType]

                const frames = dirs.map((dir, index) => {
                    const frames: AnimationFrameInfo[] = motion[dir]?.map(part => {
                        const path = dir + "_" + part.part
                        return {
                            "mode": targetMotion,
                            "z_index": index,
                            "number": part.duration,
                            "layer_path": path
                        }
                    }) || []
                    return frames
                }).reduce((prev, cur) => {
                    prev.push(...cur)
                    return prev
                }, [])
                return frames
            }).reduce((prev, cur) => {
                prev.push(...cur)
                return prev
            }, [])

            const json = JSON.stringify(motionSettings)
            const blob = new Blob([json], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "motion.json"
            link.click()


        }

        return (
            <div className="split-3-4-3">
                <div className="body-item-title">download</div>
                <div className="body-item-text">
                    <div></div>
                </div>
                <div className="body-button-container">
                    <div className="body-button" onClick={onDownloadClicked}>get</div>
                </div>
            </div>
        )


        // const motion = motions[targetMotion]
        // const rows = dirs.map((x, index) => {
        //     const parts = catalog[x]
        //     const options = parts.map(part => {
        //         return <option key={part} value={part}>{part}</option>
        //     })


        //     const onPartsSelected = (index: number, v: string) => {
        //         motion[x][index].part = v;
        //         motions[targetMotion] = motion
        //         setMotions({ ...motions })
        //     }
        //     const onDurationChange = (index: number, duration: number) => {
        //         motion[x][index].duration = duration;
        //         motions[targetMotion] = motion
        //         setMotions({ ...motions })
        //     }
        //     const onDeleteClicked = (index: number) => {
        //         motion[x].splice(index, 1)
        //         setMotions({ ...motions })
        //     }
        //     const dirUsingParts = motion[x]


        //     const partRow = dirUsingParts?.map((part, index) => {
        //         return (
        //             <div key={part.part + "_" + index} className="body-item-title split-4-3-3 left-padding-2">
        //                 <div>
        //                     <select value={part.part} onChange={(e) => { onPartsSelected(index, e.target.value) }}>
        //                         {options}
        //                     </select>
        //                 </div>
        //                 <div>
        //                     <input type="number" value={part.duration} min="10" max="1000" step="10" onChange={(e) => { onDurationChange(index, Number(e.target.value)) }}></input>
        //                 </div>
        //                 <div>
        //                     <div className="body-button" onClick={() => { onDeleteClicked(index) }}>del</div>
        //                 </div>
        //             </div >
        //         )
        //     }) || <></>

        //     const onAddClick = (dirname: string) => {
        //         if (!motion[dirname]) {
        //             motion[dirname] = []
        //         }
        //         motion[dirname].push({
        //             part: catalog[dirname][0],
        //             duration: 10
        //         })
        //         motions[targetMotion] = motion
        //         setMotions({ ...motions })
        //     }
        //     return (
        //         <div key={x}>
        //             <div className="body-item-title split-4-3-3 left-padding-1">
        //                 <div>{x}</div>
        //                 <div>(z:{index})</div>
        //                 <div className="body-button-container">
        //                     <div className="body-button" onClick={() => { onAddClick(x) }}>add</div>
        //                 </div>

        //             </div>
        //             {partRow}
        //         </div>
        //     )
        // })
        // return rows

    }, [dirs, catalog, targetMotion, motions])

    useEffect(() => {
        const motion = motions[targetMotion]
        if (Object.keys(motion).length == 0) {
            return
        }

        const setMotion = async () => {
            const frames = dirs.map((dir, index) => {
                console.log("MOTION::::", motion, dir)
                const frames: AnimationFrameInfo[] = motion[dir]?.map(part => {
                    const path = dir + "_" + part.part
                    return {
                        "mode": targetMotion,
                        "z_index": index,
                        "number": part.duration,
                        "layer_path": path
                    }
                }) || []
                return frames
            }).reduce((prev, cur) => {
                prev.push(...cur)
                return prev
            }, [])


            console.log("motions", frames)

            const message: PSDAnimatorParams = {
                type: "SET_MOTION",
                motion: frames,
                transfer: []
            }
            await w.execute(message)
            console.log("set motion")

            await stop()
            await start()
        }
        setMotion()
    }, [dirs, catalog, targetMotion, motions])





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
        // @ts-ignore

        const p3: PSDAnimatorParams = {
            type: "SET_WAIT_RATE",
            waitRate: 0.001,
            transfer: []
        }
        await w.execute(p3)
        console.log("start wait rate")
    }


    const speedDown = async () => {
        // @ts-ignore

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


    return (
        <div className="root-div">
            <div className="control-area">
                <div className="control-container">
                    {fileLoader}
                    {targetMotionRow}
                    {catalogArea}
                    {downloadRow}
                </div>
            </div>
            <div className="psd-canvas">
                <canvas id="test-canvas1" className="left-canvas"></canvas>
            </div>

        </div>
    )

}

const container = document.getElementById("app")!;
const root = createRoot(container);
root.render(
    <App></App>
);
