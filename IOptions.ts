import { IConsoleOutputOptions } from "./ConsoleOutput";
import { IFileOutputOptions } from "./FileOutput";

export interface IOptions {
    project: string;
    env: string;
    console: IConsoleOutputOptions;
    file: IFileOutputOptions;
}
