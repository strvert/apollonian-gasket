export type CircleId = number;
export type ParentCirclesId = [CircleId, CircleId, CircleId];
export type ParentCirclesData = [CircleData, CircleData, CircleData];
export type Vector2d = [number, number];

export default class CircleData {
    id: CircleId | undefined;
    coord: Vector2d;
    curvature: number;
    depth: number;

    constructor(coord: Vector2d, curvature: number, id?: number) {
        this.id = id;
        this.coord = coord;
        this.curvature = curvature;
        this.depth = 0;
    }

    getRadius(): number {
        return Math.abs(1 / this.curvature);
    }

    static fromCurvature(coord: Vector2d, curvature: number): CircleData {
        return new CircleData(coord, curvature);
    }
};
