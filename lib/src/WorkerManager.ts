import { Config, OperationParams, WorkerCommand, WorkerResponse } from "./const";
import { getBrowserType } from "./utils/BrowserUtil";


// @ts-ignore
import workerJs from "worker-loader?inline=no-fallback!./Worker.js";
import { BlockingQueue } from "./utils/BlockingQueue";
import { PSDAnimator } from "./PSDAnimator";


export const generateConfig = (psdFile: ArrayBuffer, canvas: HTMLCanvasElement, maxWidth: number, maxHeight: number, onLocal = false) => {
    const config: Config = {
        browserType: getBrowserType(),
        onLocal: onLocal,
        psdFile: psdFile,
        canvas: canvas,
        maxWidth: maxWidth,
        maxHeight: maxHeight
    }
    return config
}

export class WorkerManager {
    private worker: Worker | null = null;
    private animator: PSDAnimator | null = null

    private config: Config | null = null;
    private sem = new BlockingQueue<number>();

    constructor() {
        this.sem.enqueue(0);
    }
    private lock = async () => {
        const num = await this.sem.dequeue();
        return num;
    };
    private unlock = (num: number) => {
        this.sem.enqueue(num + 1);
    };

    init = async (config: Config) => {
        const lockNum = await this.lock()
        this.config = config
        if (this.worker) {
            this.worker.terminate();
        }
        this.worker = null;

        if (config.browserType == "SAFARI" || config.onLocal == true) {
            console.log("[PSD Animator] WORK ON Local")
            this.animator = new PSDAnimator(config.psdFile, config.canvas, config.maxWidth, config.maxHeight)
        } else {
            const newWorker: Worker = workerJs();
            const p = new Promise<void>((resolve, reject) => {
                newWorker.onmessage = (event) => {
                    if (event.data.message === WorkerResponse.INITIALIZED) {
                        this.worker = newWorker;
                        resolve();
                    } else {
                        console.log("Initialization something wrong..");
                        reject();
                    }
                };

                const canvas = config.canvas as HTMLCanvasElement
                const offScreenCanvas = canvas.transferControlToOffscreen();
                config.canvas = offScreenCanvas
                newWorker.postMessage({
                    message: WorkerCommand.INITIALIZE,
                    config: config,
                }, [config.psdFile, config.canvas]);
            });
            await p
            console.log("[PSD Animator] WORK ON Worker")
        }
        await this.unlock(lockNum)
        return;
    };

    execute = async (params: OperationParams) => {
        if (this.sem.length > 100) {
            throw new Error(`queue is fulled: ${this.sem.length}`);
        }

        if (!this.config) {
            throw new Error("worker is not activated.");
        }


        const lockNum = await this.lock();
        try {
            if (this.config.browserType == "SAFARI" || this.config.onLocal == true) {
                console.log("[PSD Animator] WORK ON Local EXECUTION!")
                if (!this.animator) {
                    throw new Error(`Local Animator is not initialized.`);
                }
                switch (params.type) {
                    case "SET_MOTION":
                        if (!params.motion) {
                            throw new Error(`No Motion Data.`);
                        }
                        this.animator.setMotion(params.motion)
                        break
                    case "SET_WAIT_RATE":
                        if (!params.waitRate) {
                            throw new Error(`No Wait Rate.`);
                        }
                        this.animator.setWaitRate(params.waitRate)
                        break
                    case "START":
                        this.animator.start()
                        break
                    case "STOP":
                        this.animator.stop()
                        break
                    case "SWITCH_MOTION_MODE":
                        if (!params.motionMode) {
                            throw new Error(`No Motion Mode.`);
                        }
                        this.animator.switchMotionMode(params.motionMode)
                        break
                    default:
                        throw new Error(`UNKNOWN FUNCTION: ${params.type}`);
                }
            } else {
                console.log("[PSD Animator] WORK ON Worker EXECUTION!")
                const p = new Promise((resolve, reject) => {
                    if (!this.worker) {
                        reject("worker is not activated. 2");
                        return
                    }
                    this.worker.onmessage = (event) => {
                        if (event.data.message === WorkerResponse.EXECUTED) {
                            resolve(event.data.data);
                        } else {
                            console.error("Execute is panic: unknwon message", event.data.message);
                            reject(event);
                        }
                    };

                    this.worker.postMessage(
                        {
                            message: WorkerCommand.EXECUTE,
                            params: params,
                        },
                        []
                    );
                })
                const c = await p
                console.log("worker response:", c)
            }
        } catch (exception) {
            throw (exception)
        } finally {
            this.unlock(lockNum);
        }
    }
}