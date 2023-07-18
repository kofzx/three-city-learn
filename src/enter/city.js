import {loadFBX} from "../utils/index.js";
import * as THREE from 'three';
import { SurroundLine } from '../effect/surroundLine.js';
import {Background} from "../effect/background.js";
import * as TWEEN from "@tweenjs/tween.js";

export class City {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.tweenPosition = null
        this.tweenRotation = null

        this.height = {
            value: 5
        }

        this.time = {
            value: 0
        }

        this.loadCity();
    }

    loadCity() {
        loadFBX('/src/model/beijing.fbx').then((object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    new SurroundLine(this.scene, child, this.height, this.time);
                }
            })

            this.initEffect()
        })
    }

    initEffect() {
        new Background(this.scene);

        this.addClick()
    }

    addClick() {
        function onMousemove() {
            flag = false
        }

        let flag = true
        document.addEventListener('mousedown', (event) => {
            flag = true
            document.addEventListener('mousemove', onMousemove)
        })

        document.addEventListener('mouseup', (event) => {
            if (flag) {
                this.clickEvent(event)
            }
            document.removeEventListener('mousemove',  onMousemove)
        })
    }

    clickEvent(event) {
        // 获取到设备坐标
        const x = (event.x / window.innerWidth) * 2 - 1;
        const y = -(event.y / window.innerHeight) * 2 + 1;

        // 三维设备坐标
        const standardVector = new THREE.Vector3(x, y, 0.5);
        // 转换到世界坐标
        const worldVector = standardVector.unproject(this.camera);

        // 序列化
        const ray = worldVector.sub(this.camera.position).normalize();

        const raycaster = new THREE.Raycaster(this.camera.position, ray);

        const intersects = raycaster.intersectObjects(this.scene.children);

        let point3d = null;
        if (intersects.length > 0) {
            point3d = intersects[0];
        }
        if (point3d) {
            const proportion = 3
            // 使用动画改变观察点
            const time = 1000
            this.tweenPosition = new TWEEN.Tween(this.camera.position).to({
                x: point3d.point.x * proportion,
                y: point3d.point.y * proportion,
                z: point3d.point.z * proportion
            }, time).start()
            this.tweenRotation = new TWEEN.Tween(this.camera.rotation).to({
                x: this.camera.rotation.x,
                y: this.camera.rotation.y,
                z: this.camera.rotation.z
            }, time).start()
        }
    }

    start(delta) {
        if (this.tweenPosition && this.tweenRotation) {
            this.tweenPosition.update()
            this.tweenRotation.update()
        }

        this.time.value += delta

        this.height.value += 0.4
        if (this.height.value > 160) {
            this.height.value = 5;
        }
    }
}