import { ProcessorParams } from "./const";
export declare abstract class Processor {
    abstract process: (params: ProcessorParams) => void;
}
