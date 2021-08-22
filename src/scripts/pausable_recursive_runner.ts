export type RecrArgsType = {
    depth: number;
};

export class PausableRecursiveRunner<ArgsType extends RecrArgsType> {
    holder: Array<ArgsType>;
    depth: number;

    constructor(args: Readonly<ArgsType>) {
        this.holder = new Array();
        this.holder.push(args);
        this.depth = 0;
    }

    protected proc(args: Readonly<ArgsType>, pauseDepth: Readonly<number>, holder: Array<ArgsType>): boolean {
        if (args.depth >= pauseDepth) {
            holder.push(args);
            this.depth = args.depth;
            return false;
        }
        return true;
    }

    run(pauseDepth: Readonly<number>) {
        const newHolder = new Array<ArgsType>();
        for (const arg of this.holder) {
            this.proc(arg, pauseDepth, newHolder);
        }
        this.holder = newHolder;
    }
};

