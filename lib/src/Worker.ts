import { WorkerCommand, WorkerResponse, OperationParams, Config, AnimationFrameInfo } from "./const";
import { PSDAnimator } from "./PSDAnimator";

const ctx: Worker = self as any; // eslint-disable-line no-restricted-globals
let config: Config | null = null;
let animator: PSDAnimator | null = null

const responseError = (errorMessage: string) => {
    ctx.postMessage({
        message: WorkerResponse.EXECUTED,
        data: ["error", errorMessage],
    });
}

onmessage = async (event) => {
    if (event.data.message === WorkerCommand.INITIALIZE) {
        config = event.data.config as Config;
        animator = new PSDAnimator(config.psdFile, config.canvas, config.maxWidth, config.maxHeight)
        ctx.postMessage({ message: WorkerResponse.INITIALIZED });
    } else if (event.data.message === WorkerCommand.EXECUTE) {
        const params: OperationParams = event.data.params;
        const data: Uint8ClampedArray = event.data.data;

        if (!animator) {
            console.error(`Animator is not initialized.`)
            responseError("Animator is not initialized.")
            return
        }

        switch (params.type) {
            case "SET_MOTION":
                if (!params.motion) {
                    console.error(`No Motion Data.`)
                    responseError("No Motion Data.")
                    return
                }
                animator.setMotion(params.motion)
                break
            case "SET_WAIT_RATE":
                if (!params.waitRate) {
                    console.error(`No Wait Rate.`)
                    responseError("No Wait Rate.")
                    return
                }
                animator.setWaitRate(params.waitRate)
                break
            case "START":
                animator.start()
                break
            case "STOP":
                animator.stop()
                break
            case "SWITCH_MOTION_MODE":
                if (!params.motionMode) {
                    console.error(`No Motion Mode.`)
                    responseError("No Motion Mode.")
                    return
                }
                animator.switchMotionMode(params.motionMode)
                break
            default:
                console.error(`UNKNOWN FUNCTION: ${params.type}`)
        }
        ctx.postMessage({
            message: WorkerResponse.EXECUTED,
            data: ["done"],
        });
    } else {
        console.log("not implemented");
    }
};

