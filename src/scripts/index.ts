import "./../style/main.scss";

import Konva from 'konva';
import CircleData from "./shape_data";
import {ParentCirclesData} from "./shape_data";

import ApollonianController from "./apollonian_controller";

const circleConfig: Konva.CircleConfig = {strokeWidth: 2, stroke: "gray"};
const drawScale = 450;

const firstCirclePatterns = new Map<string, ParentCirclesData>([
    ["pattern1", [
        CircleData.fromCurvature([0, 0], -1),
        CircleData.fromCurvature([0.5, 0], 2),
        CircleData.fromCurvature([-0.5, 0], 2),
    ]],
    ["pattern2", [
        CircleData.fromCurvature([0, 0], -3),
        CircleData.fromCurvature([-0.083, 0], 4),
        CircleData.fromCurvature([0.25, 0], 12),
    ]]
]);

function init() {
    const circlePattern = document.querySelector("#circle-pattern")!;
    for (const pat of firstCirclePatterns) {
        const opt = document.createElement("option");
        const text = document.createTextNode(pat[0]);
        opt.appendChild(text);
        opt.setAttribute("value", pat[0]);
        circlePattern.appendChild(opt);
    }
}

function ConstructKonvaCircleFromData(data: Readonly<CircleData>, config: Konva.CircleConfig, scale: Readonly<number>): Konva.Circle {
    config.x = data.coord[0] * scale;
    config.y = data.coord[1] * scale;
    config.radius = data.getRadius() * scale;
    return new Konva.Circle(config);
}

function ConstructKonvaCirclesFromData(data: Readonly<Array<CircleData>>, config: Konva.CircleConfig, scale: Readonly<number>): Konva.Group {
    const circles = new Konva.Group();
    for (const d of data) {
        circles.add(ConstructKonvaCircleFromData(d, config, scale));
    }
    return circles;
}

function getVw(): number {
    return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
}

function getVh(): number {
    return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
}

function getMinV(): number {
    const vw = getVw();
    const vh = getVh();
    return Math.min(vw, vh);
}

function getMaxCircle(circles: Readonly<Array<CircleData>>): CircleData {
    return circles.reduce((accm, curr) => accm.getRadius() > curr.getRadius() ? accm: curr);
}

function calcDrawScale(circles: Readonly<Array<CircleData>>): number {
    const maxC = getMaxCircle(circles);
    const minV = getMinV();
    console.log(minV, maxC.getRadius());

    return (minV - (minV > 100 ? 100 : 0)) / (maxC.getRadius() * 2);
}

function drawGrid(layer: Readonly<Konva.Layer>) {
    const vw = getVw();
    const vh = getVh();
    const color = "black";
    layer.add(new Konva.Line({
        points: new Array(-vw / 2, 0, vw / 2, 0),
        stroke: color,
        opacity: 0.2
    }));

    layer.add(new Konva.Line({
        points: new Array(0, -vh / 2, 0, vh / 2),
        stroke: color,
        opacity: 0.2
    }));
}

function getSelectedPatternName(): string {
    const circlePattern = <HTMLSelectElement>document.querySelector("#circle-pattern")!;
    return circlePattern.value;
}

function getSelectedPatternCircles(): ParentCirclesData {
    return firstCirclePatterns.get(getSelectedPatternName())!;
}

function reflesh(stage: Konva.Stage, layer: Konva.Layer, controller: ApollonianController) {
    const vw = getVw();
    const vh = getVh();

    stage.size({
        width: vw,
        height: vh
    });
    layer.destroyChildren();

    drawGrid(layer);
    layer.add(ConstructKonvaCirclesFromData(controller.getAllCircles(), circleConfig, calcDrawScale(getSelectedPatternCircles())));

    layer.offsetX(-vw / 2);
    layer.offsetY(-vh / 2);
}

window.addEventListener("DOMContentLoaded", () => {
    const oneStepBtn = <HTMLButtonElement>document.querySelector("#one-step-button")!;
    const tenStepBtn = <HTMLButtonElement>document.querySelector("#ten-step-button")!;
    const hundredStepBtn = <HTMLButtonElement>document.querySelector("#hundred-step-button")!;
    const circlePattern = <HTMLSelectElement>document.querySelector("#circle-pattern")!;

    const vw = getVw();
    const vh = getVh();

    const stage = new Konva.Stage({
        container: "konva-container",
        width: vw,
        height: vh
    });

    const layer = new Konva.Layer({
        name: "gasket"
    });
    stage.add(layer);

    init();
    let controller: ApollonianController;

    const reset = () => {
        const newController = new ApollonianController({
            depth: 0,
            parentCircles: getSelectedPatternCircles()
        });
        reflesh(stage, layer, newController);
        return newController;
    };

    controller = reset();

    const exec = (step: number) => {
        controller.run(controller.depth + step);
        layer.add(ConstructKonvaCirclesFromData(controller.getNewCircles(), circleConfig, calcDrawScale(getSelectedPatternCircles())));
    };

    oneStepBtn.addEventListener("click", () => {
        exec(1);
    });

    tenStepBtn.addEventListener("click", () => {
        exec(10);
    });

    hundredStepBtn.addEventListener("click", () => {
        exec(100);
    });

    circlePattern.addEventListener("change", () => {
        controller = reset();
    });

    drawGrid(layer);
    layer.offsetX(-vw / 2);
    layer.offsetY(-vh / 2);


    let timer: NodeJS.Timeout;
    window.addEventListener("resize", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            reflesh(stage, layer, controller);
        }, 200);
    });
});
