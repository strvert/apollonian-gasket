import { CircleId } from "./shape_data";
import CircleData from "./shape_data";
import * as math from "mathjs";

export default class ApollonianController {
    adjacencyList: Map<CircleId, Set<CircleId>>;
    step: number;
    circleIdHead: CircleId;
    circles: Map<number, CircleData>;

    constructor(initialCircles: Array<CircleData>) {
        this.adjacencyList = new Map();
        this.step = 0;
        this.circleIdHead = 0;
        this.circles = new Map();

        this.registerAdjacentCircles(initialCircles);
    }

    getNextId(): CircleId {
        return this.circleIdHead++;
    }

    printAdjacencyList() {
        let str = "adjacencyList: \n";
        for (let k of this.adjacencyList.keys()) {
            str += `\t${k.toString()} => ( `;
            for (let v of this.adjacencyList.get(k)!) {
                str += `${v.toString()} `;
            }
            str += ")\n";
        }
        console.log(str);
    }

    registerAdjacentCircles(data: Array<CircleData>) {
        for (let ck of data) {
            if (ck.id === null) {
                ck.id = this.getNextId();
            }
            for (let cv of data) {
                if (ck === cv) {
                    continue;
                }
                if (cv.id === null) {
                    cv.id = this.getNextId();
                }

                // register circle list
                if (!this.circles.has(cv.id)) {
                    this.circles.set(cv.id, cv);
                }

                // register adjacency list
                if (!this.adjacencyList.has(ck.id)) {
                    this.adjacencyList.set(ck.id, new Set())
                }
                this.adjacencyList.get(ck.id)!.add(cv.id);
            }
        }
        console.log("list: ", this.circles);
        this.printAdjacencyList();
    }

    getAllCircles(): Array<CircleData> {
        return Array.from(this.circles.values());
    }

    next(): Array<CircleData> {
        let newCircles = new Array<CircleData>();
        console.debug(`start: step ${this.step}`);
        if (this.step == 0) {
            newCircles = Array.from(this.circles.values());
        } else {
            const c1 = this.circles.get(0)!;
            const c2 = this.circles.get(1)!;
            const c3 = this.circles.get(2)!;

            // calc circle
            const nc = ApollonianController.calcCircleOfApollinius(c1, c2, c3);
            if (this.step == 1) {
                newCircles = newCircles.concat(nc);
                this.registerAdjacentCircles(new Array(c1, c2, c3, nc[0]));
                this.registerAdjacentCircles(new Array(c1, c2, c3, nc[1]));
            } else {
                newCircles.push(nc[0]);
                this.registerAdjacentCircles(new Array(c1, c2, c3, nc[0]));
            }
            console.log("new circles: ", newCircles);
        }
        console.log(`step ${this.step}: Added ${newCircles.length} circles`);
        this.step += 1;
        return newCircles;
    }

    static calcCircleOfApollinius(c1: CircleData, c2: CircleData, c3: CircleData): Array<CircleData> {
        const k1 = c1.curvature;
        const k2 = c2.curvature;
        const k3 = c3.curvature;
        const z1 = c1.coord;
        const z2 = c2.coord;
        const z3 = c3.coord;

        const k4 = k1 + k2 + k3 + 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);
        const z4NumP1 = math.add(math.add(math.multiply(z1, k1), math.multiply(z2, k2)), math.multiply(z3, k3));
        const z4NumP2 = math.multiply(2,
            math.sqrt(<math.Complex>(math.add(math.add(math.multiply(k1 * k2, math.multiply(z1, z2)),
                math.multiply(k2 * k3, math.multiply(z2, z3))),
                math.multiply(k1 * k3, math.multiply(z1, z3))))));

        const z4Plus = math.divide(math.add(z4NumP1, z4NumP2), k4);
        const z4Minus = math.divide(math.subtract(z4NumP1, z4NumP2), k4);
        return new Array(new CircleData((<math.Complex>z4Plus).re, (<math.Complex>z4Plus).im, k4),
            new CircleData((<math.Complex>z4Minus).re, (<math.Complex>z4Minus).im, k4));
    }
};
