import * as math from "mathjs";

export type CircleId = number;

export default class CircleData {
    id: CircleId | null;
    coord: math.Complex;
    curvature: number;

    constructor(x: number, y: number, curvature: number) {
        this.id = null;
        this.coord = math.complex(x, y);
        this.curvature = curvature;
    }

    getRadius() {
        return Math.abs(1 / this.curvature);
    }

    static fromCurvature(x: number, y: number, curvature: number): CircleData {
        return new CircleData(x, y, curvature);
    }
};
