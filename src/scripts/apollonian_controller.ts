import {CircleId, ParentCirclesData, Vector2d} from "./shape_data";
import CircleData from "./shape_data";
import {PausableRecursiveRunner} from "./pausable_recursive_runner";
import * as math from "mathjs";

type ApollonianArgs = {
    depth: number;
    parentCircles: Readonly<ParentCirclesData>;
    childCircle?: Readonly<CircleData>;
};

export default class ApollonianController extends PausableRecursiveRunner<ApollonianArgs> {
    private circleIdHead: CircleId;
    private circles: Map<CircleId, CircleData>;
    private newcircles: Array<CircleId>;
    private adjacencyList: Map<CircleId, Set<CircleId>>;
    private radiusMin: number;

    private completed: boolean;

    constructor(args: Readonly<ApollonianArgs>) {
        super(args);
        this.adjacencyList = new Map();
        this.depth = 0;
        this.circleIdHead = 0;
        this.circles = new Map();
        this.newcircles = new Array();
        this.radiusMin = 0.001;
        this.completed = false;

        this.registerInitCircles(args.parentCircles);
    }

    private getNextId(): CircleId {
        return this.circleIdHead++;
    }

    private registerInitCircles(parents: Readonly<ParentCirclesData>) {
        // sort by curvature
        let sortedParents: ParentCirclesData = [...parents];
        sortedParents.sort((a, b) => {
            if (a.curvature < b.curvature) return -1;
            if (a.curvature > b.curvature) return 1;
            return 0;
        });

        parents = <ParentCirclesData>parents.map((e) => {
            e.id = this.getNextId();
            e.depth = 1;
            return e;
        });

        parents.forEach((e) => {
            this.circles.set(e.id!, e);
            this.adjacencyList.set(e.id!, new Set())
        });

        for (const a of parents) {
            for (const b of parents) {
                if (a === b) {
                    continue;
                }
                this.adjacencyList.get(a.id!)!.add(b.id!);
            }
        }
    }

    private registerCircle(circle: CircleData) {
        if (circle.id !== undefined) {
            this.circles.set(circle.id, circle);
        } else {
            console.error("circle id is undefined");
        }
    }

    private CircleIdsToDataArray(ids: Readonly<Array<CircleId>>): Array<CircleData> {
        return <Array<CircleData>>ids.map((e) => this.circles.get(e));
    }

    getAllCircles(): Array<CircleData> {
        return Array.from(this.circles.values());
    }

    getNewCircles(): Array<CircleData> {
        return Array.from(this.CircleIdsToDataArray(this.newcircles));
    }

    isCompleted() {
        return this.completed;
    }

    protected proc(args: Readonly<ApollonianArgs>, pauseDepth: Readonly<number>, holder: Array<ApollonianArgs>): boolean {
        if (!super.proc(args, pauseDepth, holder)) {
            return false;
        }

        const [c1, c2, c3] = args.parentCircles;
        if (args.depth === 0) {
            const c4 = this.calcAdjacentCircle([c1, c2, c3]);
            const c5 = this.calcOtherCircle([c2, c3, c4], c1);
            this.registerCircle(c4);
            this.registerCircle(c5);

            Array.prototype.push.apply(this.newcircles, Array.from(this.circles.keys()));
            this.proc({depth: args.depth + 1, parentCircles: [c2, c3, c4], childCircle: c1}, pauseDepth, holder);
            this.proc({depth: args.depth + 1, parentCircles: [c2, c3, c4], childCircle: c5}, pauseDepth, holder);
        } else {
            // ここから
            if (args.childCircle === undefined) {
                console.error(args.childCircle);
            } else {
                const c4 = args.childCircle;
                const regi = (c: CircleData) => {
                    this.registerCircle(c);
                    this.newcircles.push(c.id!);
                }
                const c5 = this.calcOtherCircle([c1, c2, c4], c3);
                regi(c5);
                const c6 = this.calcOtherCircle([c1, c3, c4], c2);
                regi(c6);
                const c7 = this.calcOtherCircle([c3, c2, c4], c1);
                regi(c7);

                if (c5.getRadius() >= this.radiusMin) {
                    this.proc({depth: args.depth + 1, parentCircles: [c1, c2, c4], childCircle: c5}, pauseDepth, holder);
                }
                if (c6.getRadius() >= this.radiusMin) {
                    this.proc({depth: args.depth + 1, parentCircles: [c1, c3, c4], childCircle: c6}, pauseDepth, holder);
                }
                if (c7.getRadius() >= this.radiusMin) {
                    this.proc({depth: args.depth + 1, parentCircles: [c3, c2, c4], childCircle: c7}, pauseDepth, holder);
                }
            }
        }
        return true;
    }

    calcOtherCircle(parents: Readonly<ParentCirclesData>, child1: CircleData): CircleData {
        const c = 2 * (parents[0].curvature + parents[1].curvature + parents[2].curvature) - child1.curvature;
        const f = parents.map((e) => e.coord.map((f) => e.curvature * f));
        const p = <Vector2d>math.divide(math.subtract(math.multiply(2, math.add(math.add(f[0], f[1]), f[2])), [child1.coord[0] * child1.curvature, child1.coord[1] * child1.curvature]), c);
        return new CircleData(p, c, this.getNextId());
    }

    calcAdjacentCircle(parents: Readonly<ParentCirclesData>): CircleData {
        const ks = parents.map((e) => e.curvature);
        const k4 = this.solve(ks[0], ks[1], ks[2]);

        const f1 = parents.map((e) => e.coord.map((f) => e.curvature * f));
        const f2 = f1.map((e) => math.complex(e[0], e[1]));
        const pos = <math.Complex>math.divide(this.solve(f2[0], f2[1], f2[2]), k4);

        return new CircleData([pos.re, pos.im], k4, this.getNextId());
    }

    private solve<T extends math.Complex | number>(k1: T, k2: T, k3: T): T {
        const s = math.chain(k1).add(k2).add(k3).done();
        const k1k2 = math.chain(k1).multiply(k2).done();
        const k2k3 = math.chain(k2).multiply(k3).done();
        const k3k1 = math.chain(k3).multiply(k1).done();

        const inner = <T>math.chain(k1k2).add(k2k3).add(k3k1).done();
        const f = typeof inner === "number" ? math.sqrt(<number>inner) : math.sqrt(<math.Complex>inner);
        return <T>math.add(s, math.multiply(f, 2));
    }

    run(pauseDepth: Readonly<number>) {
        this.newcircles = [];
        super.run(pauseDepth);
    }
};
