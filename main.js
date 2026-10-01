import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ==================================================
// SCENE
// ==================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// ==================================================
// CAMERA
// ==================================================

const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth /
        window.innerHeight,
        0.05,
        500
    );


// ==================================================
// RENDERER
// ==================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: false
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


// ★ 影を有効化
renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


document.body.appendChild(
    renderer.domElement
);


// ==================================================
// LIGHT
// ==================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.65
    );

scene.add(
    ambientLight
);


// --------------------------------------------------
// 太陽
// --------------------------------------------------

const sun =
    new THREE.DirectionalLight(
        0xffffff,
        2.0
    );


sun.position.set(
    -30,
    50,
    -25
);


sun.castShadow = true;


// 影の解像度
sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;


// 影が届く範囲
sun.shadow.camera.left =
    -50;

sun.shadow.camera.right =
    50;

sun.shadow.camera.top =
    50;

sun.shadow.camera.bottom =
    -50;

sun.shadow.camera.near =
    1;

sun.shadow.camera.far =
    150;


scene.add(
    sun
);


// ==================================================
// TEXTURE
// ==================================================

function createPixelTexture(
    baseColor,
    darkColor,
    lightColor,
    noiseAmount = 150
) {

    const canvas =
        document.createElement("canvas");

    canvas.width = 64;
    canvas.height = 64;

    const ctx =
        canvas.getContext("2d");


    ctx.fillStyle =
        baseColor;

    ctx.fillRect(
        0,
        0,
        64,
        64
    );


    for (
        let i = 0;
        i < noiseAmount;
        i++
    ) {

        const x =
            Math.floor(
                Math.random() * 64
            );

        const y =
            Math.floor(
                Math.random() * 64
            );


        const size =
            Math.random() < 0.85
                ? 1
                : 2;


        ctx.fillStyle =
            Math.random() < 0.55
                ? darkColor
                : lightColor;


        ctx.fillRect(
            x,
            y,
            size,
            size
        );

    }


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.magFilter =
        THREE.NearestFilter;

    texture.minFilter =
        THREE.NearestFilter;

    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

}


// ==================================================
// GRASS TOP
// ==================================================

const grassTopTexture =
    createPixelTexture(
        "#5caf35",
        "#3f8f29",
        "#78c64a",
        180
    );


// ==================================================
// GRASS SIDE
// ==================================================

function createGrassSideTexture() {

    const canvas =
        document.createElement("canvas");

    canvas.width = 64;
    canvas.height = 64;

    const ctx =
        canvas.getContext("2d");


    // 土
    ctx.fillStyle =
        "#8b5a2b";

    ctx.fillRect(
        0,
        0,
        64,
        64
    );


    // 土の模様
    for (
        let i = 0;
        i < 180;
        i++
    ) {

        const x =
            Math.floor(
                Math.random() * 64
            );

        const y =
            Math.floor(
                Math.random() * 64
            );


        ctx.fillStyle =
            Math.random() < 0.5
                ? "#70451f"
                : "#a56b35";


        ctx.fillRect(
            x,
            y,
            1,
            1
        );

    }


    // 草
    ctx.fillStyle =
        "#58b238";

    ctx.fillRect(
        0,
        0,
        64,
        11
    );


    // 草のギザギザ
    for (
        let x = 0;
        x < 64;
        x += 2
    ) {

        const h =
            Math.floor(
                Math.random() * 5
            );


        ctx.fillRect(
            x,
            10,
            2,
            h
        );

    }


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.magFilter =
        THREE.NearestFilter;

    texture.minFilter =
        THREE.NearestFilter;

    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;

}


const grassSideTexture =
    createGrassSideTexture();


// ==================================================
// DIRT
// ==================================================

const dirtTexture =
    createPixelTexture(
        "#8b5a2b",
        "#70451f",
        "#a56b35",
        180
    );


// ==================================================
// STONE
// ==================================================

const stoneTexture =
    createPixelTexture(
        "#858585",
        "#686868",
        "#a0a0a0",
        220
    );


// ==================================================
// MATERIAL
// ==================================================

const grassTopMaterial =
    new THREE.MeshLambertMaterial({
        map: grassTopTexture
    });


const grassSideMaterial =
    new THREE.MeshLambertMaterial({
        map: grassSideTexture
    });


const dirtMaterial =
    new THREE.MeshLambertMaterial({
        map: dirtTexture
    });


const stoneMaterial =
    new THREE.MeshLambertMaterial({
        map: stoneTexture
    });


// ==================================================
// BLOCK
// ==================================================

const blockGeometry =
    new THREE.BoxGeometry(
        1,
        1,
        1
    );


const blocks =
    new Map();


function blockKey(
    x,
    y,
    z
) {

    return `${x},${y},${z}`;

}


// ==================================================
// CREATE BLOCK
// ==================================================

function createBlock(
    x,
    y,
    z,
    type
) {

    const key =
        blockKey(
            x,
            y,
            z
        );


    if (
        blocks.has(key)
    ) {

        return;

    }


    let materials;


    if (
        type === "grass"
    ) {

        materials = [

            grassSideMaterial,
            grassSideMaterial,
            grassTopMaterial,
            dirtMaterial,
            grassSideMaterial,
            grassSideMaterial

        ];

    }

    else if (
        type === "dirt"
    ) {

        materials = [
            dirtMaterial,
            dirtMaterial,
            dirtMaterial,
            dirtMaterial,
            dirtMaterial,
            dirtMaterial
        ];

    }

    else {

        materials = [
            stoneMaterial,
            stoneMaterial,
            stoneMaterial,
            stoneMaterial,
            stoneMaterial,
            stoneMaterial
        ];

    }


    const block =
        new THREE.Mesh(
            blockGeometry,
            materials
        );


    block.position.set(
        x,
        y,
        z
    );


    // ★ ブロック自身が影を作る
    block.castShadow = true;

    // ★ ブロック自身が影を受ける
    block.receiveShadow = true;


    block.userData = {

        blockX: x,
        blockY: y,
        blockZ: z,

        type: type

    };


    scene.add(
        block
    );


    blocks.set(
        key,
        block
    );

}


// ==================================================
// REMOVE BLOCK
// ==================================================

function removeBlock(
    x,
    y,
    z
) {

    const key =
        blockKey(
            x,
            y,
            z
        );


    const block =
        blocks.get(key);


    if (
        !block
    ) {

        return;

    }


    scene.remove(
        block
    );


    blocks.delete(
        key
    );

}


// ==================================================
// WORLD
// ==================================================

const worldSize = 24;


for (
    let x = -worldSize;
    x <= worldSize;
    x++
) {

    for (
        let z = -worldSize;
        z <= worldSize;
        z++
    ) {

        const height =
            Math.floor(
                Math.sin(x * 0.25) * 0.5 +
                Math.cos(z * 0.22) * 0.5
            );


        for (
            let y = -3;
            y < height;
            y++
        ) {

            createBlock(
                x,
                y,
                z,
                "dirt"
            );

        }


        createBlock(
            x,
            height,
            z,
            "grass"
        );

    }

}


// ==================================================
// STONE
// ==================================================

createBlock(
    5,
    1,
    -5,
    "stone"
);

createBlock(
    5,
    2,
    -5,
    "stone"
);

createBlock(
    6,
    1,
    -5,
    "stone"
);

createBlock(
    6,
    1,
    -4,
    "stone"
);


// ==================================================
// PLAYER
// ==================================================

const player =
    new THREE.Group();


// 足元
player.position.set(
    0,
    1,
    5
);

scene.add(
    player
);


// ==================================================
// PLAYER MODEL
// ==================================================
//
// ★ プレイヤーは存在するが完全に非表示
//
// 当たり判定・位置・カメラの基準としては存在する。
// 画面には一切表示しない。
// ==================================================

const bodyGeometry =
    new THREE.BoxGeometry(
        0.55,
        0.9,
        0.35
    );


const playerMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x3366cc
    });


const body =
    new THREE.Mesh(
        bodyGeometry,
        playerMaterial
    );


body.position.y =
    0.45;


// ★ 非表示
body.visible = false;


player.add(
    body
);


const headGeometry =
    new THREE.BoxGeometry(
        0.55,
        0.55,
        0.55
    );


const head =
    new THREE.Mesh(
        headGeometry,
        playerMaterial
    );


head.position.y =
    1.175;


// ★ 非表示
head.visible = false;


player.add(
    head
);


// ==================================================
// PLAYER SIZE
// ==================================================

const playerRadius =
    0.30;

const playerHeight =
    1.8;


// ==================================================
// KEYBOARD
// ==================================================

const keys = {};


document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            [
                "w",
                "a",
                "s",
                "d",
                " ",
                "shift",
                "1",
                "2",
                "3"
            ].includes(key)
        ) {

            event.preventDefault();

        }


        keys[key] = true;


        if (
            key === "1"
        ) {

            selectedBlock =
                "grass";

            updateBlockUI();

        }


        if (
            key === "2"
        ) {

            selectedBlock =
                "dirt";

            updateBlockUI();

        }


        if (
            key === "3"
        ) {

            selectedBlock =
                "stone";

            updateBlockUI();

        }

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


// ==================================================
// BLOCK SELECT
// ==================================================

let selectedBlock =
    "grass";


// ==================================================
// CROSSHAIR
// ==================================================

const crosshair =
    document.createElement(
        "div"
    );


crosshair.textContent =
    "＋";


crosshair.style.position =
    "fixed";

crosshair.style.left =
    "50%";

crosshair.style.top =
    "50%";

crosshair.style.transform =
    "translate(-50%, -50%)";

crosshair.style.color =
    "white";

crosshair.style.fontSize =
    "20px";

crosshair.style.fontFamily =
    "Arial";

crosshair.style.fontWeight =
    "bold";

crosshair.style.textShadow =
    "0 0 2px black";

crosshair.style.pointerEvents =
    "none";

crosshair.style.zIndex =
    "100";


document.body.appendChild(
    crosshair
);


// ==================================================
// BLOCK UI
// ==================================================

const blockUI =
    document.createElement(
        "div"
    );


blockUI.style.position =
    "fixed";

blockUI.style.left =
    "20px";

blockUI.style.bottom =
    "20px";

blockUI.style.color =
    "white";

blockUI.style.background =
    "rgba(0,0,0,0.55)";

blockUI.style.padding =
    "8px 12px";

blockUI.style.fontFamily =
    "Arial";

blockUI.style.fontSize =
    "16px";

blockUI.style.zIndex =
    "100";


document.body.appendChild(
    blockUI
);


function updateBlockUI() {

    blockUI.textContent =
        `1 草　2 土　3 石　｜　選択: ${selectedBlock}`;

}


updateBlockUI();


// ==================================================
// CAMERA
// ==================================================

let cameraYaw =
    0;


let cameraPitch =
    0;


const cameraHeight =
    1.62;


// ==================================================
// MOUSE LOOK
// ==================================================

renderer.domElement.addEventListener(
    "click",
    () => {

        renderer.domElement
            .requestPointerLock();

    }
);


document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement !==
            renderer.domElement
        ) {

            return;

        }


        const sensitivity =
            0.0025;


        cameraYaw -=
            event.movementX *
            sensitivity;


        cameraPitch -=
            event.movementY *
            sensitivity;


        const limit =
            Math.PI / 2 -
            0.05;


        cameraPitch =
            Math.max(
                -limit,
                Math.min(
                    limit,
                    cameraPitch
                )
            );

    }
);


// ==================================================
// RAYCAST
// ==================================================

const raycaster =
    new THREE.Raycaster();


const screenCenter =
    new THREE.Vector2(
        0,
        0
    );


function getTargetBlock() {

    raycaster.setFromCamera(
        screenCenter,
        camera
    );


    const meshes =
        Array.from(
            blocks.values()
        );


    const hits =
        raycaster.intersectObjects(
            meshes
        );


    if (
        hits.length === 0
    ) {

        return null;

    }


    return hits[0];

}


// ==================================================
// BREAK
// ==================================================

function breakBlock() {

    const hit =
        getTargetBlock();


    if (
        !hit
    ) {

        return;

    }


    const block =
        hit.object;


    const x =
        block.userData.blockX;


    const y =
        block.userData.blockY;


    const z =
        block.userData.blockZ;


    if (
        y <= -3
    ) {

        return;

    }


    removeBlock(
        x,
        y,
        z
    );

}


// ==================================================
// PLACE
// ==================================================

function placeBlock() {

    const hit =
        getTargetBlock();


    if (
        !hit
    ) {

        return;

    }


    const block =
        hit.object;


    const normal =
        hit.face.normal;


    const x =
        block.userData.blockX +
        Math.round(normal.x);


    const y =
        block.userData.blockY +
        Math.round(normal.y);


    const z =
        block.userData.blockZ +
        Math.round(normal.z);


    const playerBox =
        new THREE.Box3();


    playerBox.setFromCenterAndSize(
        new THREE.Vector3(
            player.position.x,
            player.position.y +
            playerHeight / 2,
            player.position.z
        ),
        new THREE.Vector3(
            0.6,
            playerHeight,
            0.6
        )
    );


    const blockBox =
        new THREE.Box3(
            new THREE.Vector3(
                x - 0.5,
                y - 0.5,
                z - 0.5
            ),
            new THREE.Vector3(
                x + 0.5,
                y + 0.5,
                z + 0.5
            )
        );


    if (
        playerBox.intersectsBox(
            blockBox
        )
    ) {

        return;

    }


    createBlock(
        x,
        y,
        z,
        selectedBlock
    );

}


// ==================================================
// MOUSE
// ==================================================

renderer.domElement.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0
        ) {

            breakBlock();

        }


        if (
            event.button === 2
        ) {

            placeBlock();

        }

    }
);


renderer.domElement.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ==================================================
// COLLISION
// ==================================================

function getBlockHeight(
    x,
    z
) {

    // プレイヤーの足元から見て
    // 下にある一番高いブロックを探す

    const bx =
        Math.floor(x);

    const bz =
        Math.floor(z);


    let highest =
        -100;


    for (
        let y = -3;
        y < 20;
        y++
    ) {

        if (
            blocks.has(
                blockKey(
                    bx,
                    y,
                    bz
                )
            )
        ) {

            // ブロック上面
            highest =
                Math.max(
                    highest,
                    y + 0.5
                );

        }

    }


    return highest;

}


// ==================================================
// SOLID COLLISION
// ==================================================

function collidesAt(
    position
) {

    const minX =
        Math.floor(
            position.x -
            playerRadius
        );


    const maxX =
        Math.floor(
            position.x +
            playerRadius
        );


    const minY =
        Math.floor(
            position.y
        );


    const maxY =
        Math.floor(
            position.y +
            playerHeight
        );


    const minZ =
        Math.floor(
            position.z -
            playerRadius
        );


    const maxZ =
        Math.floor(
            position.z +
            playerRadius
        );


    for (
        let x = minX;
        x <= maxX;
        x++
    ) {

        for (
            let y = minY;
            y <= maxY;
            y++
        ) {

            for (
                let z = minZ;
                z <= maxZ;
                z++
            ) {

                if (
                    blocks.has(
                        blockKey(
                            x,
                            y,
                            z
                        )
                    )
                ) {

                    return true;

                }

            }

        }

    }


    return false;

}


// ==================================================
// STEP UP
// ==================================================
//
// Minecraft風の「自動ジャンプ」。
// 前に1ブロック程度の段差があれば
// 自動的に上へ乗る。
// ==================================================

const stepHeight =
    1.05;


function movePlayer(direction, distance) {

    const horizontal =
        direction
            .clone()
            .normalize()
            .multiplyScalar(distance);

    // ==============================================
    // 普通に移動できるか確認
    // ==============================================

    const normalPosition =
        player.position.clone();

    normalPosition.x += horizontal.x;
    normalPosition.z += horizontal.z;

    // 普通に進めるならそのまま進む
    if (!collidesAt(normalPosition)) {

        player.position.x =
            normalPosition.x;

        player.position.z =
            normalPosition.z;

        return;
    }


    // ==============================================
    // 段差にぶつかった
    // ==============================================

    // 空中では自動ジャンプしない
    if (!grounded) {
        return;
    }


    // ==============================================
    // 1マス上にジャンプできるか確認
    // ==============================================

    const jumpPosition =
        player.position.clone();

    jumpPosition.x += horizontal.x;
    jumpPosition.z += horizontal.z;

    // 1ブロック分だけ上げる
    jumpPosition.y += 1.0;


    // 上に上がった場所に障害物がない
    // → 1マスの段差と判断
    if (!collidesAt(jumpPosition)) {

        // ★ 自動ジャンプ開始
        velocityY = jumpPower;

        grounded = false;

        // 少しだけ前へ進む
        player.position.x =
            jumpPosition.x;

        player.position.z =
            jumpPosition.z;

        return;
    }
}

// ==================================================
// PHYSICS
// ==================================================

// Minecraftに近い感覚にするため
// 前より落下をゆっくりにする。

let velocityY =
    0;


// 以前 -0.025
// 今回 -0.018
const gravity =
    -0.018;


// 以前 0.42
// 今回 0.34
const jumpPower =
    0.34;


let grounded =
    false;


// ==================================================
// GAME LOOP
// ==================================================

function movePlayer(direction, distance) {

    const horizontal =
        direction
            .clone()
            .normalize()
            .multiplyScalar(distance);


    // ==========================================
    // ① 普通に前へ進めるか
    // ==========================================

    const normalPosition =
        player.position.clone();

    normalPosition.x += horizontal.x;
    normalPosition.z += horizontal.z;


    if (!collidesAt(normalPosition)) {

        player.position.x =
            normalPosition.x;

        player.position.z =
            normalPosition.z;

        return;
    }


    // ==========================================
    // ② 空中では自動ジャンプしない
    // ==========================================

    if (!grounded) {
        return;
    }


    // ==========================================
    // ③ 前方の地面の高さを調べる
    // ==========================================

    const currentGround =
        getBlockHeight(
            player.position.x,
            player.position.z
        );


    const nextGround =
        getBlockHeight(
            normalPosition.x,
            normalPosition.z
        );


    // ==========================================
    // ④ 本当に段差があるか確認
    // ==========================================

    const heightDifference =
        nextGround - currentGround;


    // 1ブロック程度の上り坂・段差だけ
    if (
        heightDifference > 0.01 &&
        heightDifference <= 1.01
    ) {

        // ======================================
        // ⑤ 1マス上に移動できるか確認
        // ======================================

        const stepPosition =
            normalPosition.clone();

        stepPosition.y =
            nextGround;


        if (
            !collidesAt(stepPosition)
        ) {

            // ★ ここで初めて自動ジャンプ
            velocityY =
                jumpPower;

            grounded =
                false;


            player.position.x =
                normalPosition.x;

            player.position.z =
                normalPosition.z;

            return;
        }
    }


    // ==========================================
    // ⑥ 段差ではない
    // → ただの壁として止まる
    // ==========================================

    return;
}


// ==================================================
// START
// ==================================================

animate();


// ==================================================
// RESIZE
// ==================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);