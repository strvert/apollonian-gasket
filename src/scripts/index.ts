import "./../style/main.scss";

import Konva from 'konva';
import CircleData from "./shape_data";

import ApollonianController from "./apollonian_controller";

function ConstructKonvaCircleFromData(data: CircleData, config: Konva.CircleConfig, scale: number): Konva.Circle {
    config.x = data.coord.re * scale;
    config.y = data.coord.im * scale;
    config.radius = data.getRadius() * scale;
    return new Konva.Circle(config);
}

function ConstructKonvaCirclesFromData(data: Array<CircleData>, config: Konva.CircleConfig, scale: number): Konva.Group {
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

function drawGrid(layer: Konva.Layer): Konva.Layer {
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
    return layer;
}

window.addEventListener("DOMContentLoaded", () => {
    const vw = getVw();
    const vh = getVh();

    const controller = new ApollonianController(new Array(
        CircleData.fromCurvature(0, 0, -1),
        CircleData.fromCurvature(0.5, 0, 2),
        CircleData.fromCurvature(-0.5, 0, 2),
    ));

    const stage = new Konva.Stage({
        container: "konva-container",
        width: vw,
        height: vh
    });

    const layer = new Konva.Layer();
    layer.add(ConstructKonvaCirclesFromData(controller.next(), {
        strokeWidth: 2,
        stroke: "black"
    }, 400));
    layer.add(ConstructKonvaCirclesFromData(controller.next(), {
        strokeWidth: 2,
        stroke: "black"
    }, 400));

    layer.offsetX(-vw / 2);
    layer.offsetY(-vh / 2);

    stage.add(layer);
});
