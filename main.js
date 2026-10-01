import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// ============================================================
// SCENE
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// ============================================================
// CAMERA
// ============================================================

const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.05,
        500
    );


// ============================================================
// RENDERER
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: false
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);


// 影
renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;


document.body.appendChild(
    renderer.domElement
);


// ============================================================
// LIGHT
// ============================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.65
    );

scene.add(ambientLight);


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
sun.shadow.mapSize.width = 2048;
sun.shadow.mapSize.height = 2048;


// 影の範囲
sun.shadow.camera.left = -50;
sun.shadow.camera.right = 50;
sun.shadow.camera.top = 50;
sun.shadow.camera.bottom = -50;

sun.shadow.camera.near = 1;
sun.shadow.camera.far = 150;

scene.add(sun);


// ============================================================
// 64×64 PIXEL TEXTURE
// ============================================================

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


    // 基本色
    ctx.fillStyle = baseColor;

    ctx.fillRect(
        0,
        0,
        64,
        64
    );


    // ピクセル模様
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


    // ピクセルをぼかさない
    texture.magFilter =
        THREE.NearestFilter;

    texture.minFilter =
        THREE.NearestFilter;


    texture.colorSpace =
        THREE.SRGBColorSpace;


    return texture;
}


// ============================================================
// GRASS TOP
// ============================================================

const grassTopTexture =
    createPixelTexture(
        "#5caf35",
        "#3f8f29",
        "#78c64a",
        180
    );


// ============================================================
// GRASS SIDE
// ============================================================

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


// ============================================================
// DIRT
// ============================================================

const dirtTexture =
    createPixelTexture(
        "#8b5a2b",
        "#70451f",
        "#a56b35",
        180
    );


// ============================================================
// STONE
// ============================================================

const stoneTexture =
    createPixelTexture(
        "#858585",
        "#686868",
        "#a0a0a0",
        220
    );


// ============================================================
// MATERIAL
// ============================================================

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


// ============================================================
// BLOCK
// ============================================================

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


// ============================================================
// CREATE BLOCK
// ============================================================

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


    // すでに存在するなら作らない
    if (
        blocks.has(key)
    ) {

        return;
    }


    let materials;


    // 草
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


    // 土
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


    // 石
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


    // 影
    block.castShadow = true;
    block.receiveShadow = true;


    // ブロック情報
    block.userData = {

        blockX: x,
        blockY: y,
        blockZ: z,

        type: type

    };


    scene.add(block);

    blocks.set(
        key,
        block
    );
}


// ============================================================
// REMOVE BLOCK
// ============================================================

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


    scene.remove(block);

    blocks.delete(key);
}


// ============================================================
// WORLD
// ============================================================

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


        // 地下
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


        // 草
        createBlock(
            x,
            height,
            z,
            "grass"
        );
    }
}


// ============================================================
// STONE STRUCTURE
// ============================================================

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


// ============================================================
// PLAYER
// ============================================================

const player =
    new THREE.Group();


// プレイヤーの位置
player.position.set(
    0,
    1,
    5
);

scene.add(player);


// ============================================================
// PLAYER MODEL
// ============================================================
//
// プレイヤーは存在するが画面には表示しない。
// ============================================================

const playerMaterial =
    new THREE.MeshLambertMaterial({
        color: 0x3366cc
    });


const body =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.55,
            0.9,
            0.35
        ),
        playerMaterial
    );

body.position.y = 0.45;

// 非表示
body.visible = false;

player.add(body);


const head =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.55,
            0.55,
            0.55
        ),
        playerMaterial
    );

head.position.y = 1.175;

// 非表示
head.visible = false;

player.add(head);


// ============================================================
// PLAYER SIZE
// ============================================================

const playerRadius = 0.30;

const playerHeight = 1.8;


// ============================================================
// KEYBOARD
// ============================================================

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


        // 草
        if (
            key === "1"
        ) {

            selectedBlock =
                "grass";

            updateBlockUI();
        }


        // 土
        if (
            key === "2"
        ) {

            selectedBlock =
                "dirt";

            updateBlockUI();
        }


        // 石
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


// ============================================================
// BLOCK SELECT
// ============================================================

let selectedBlock =
    "grass";


// ============================================================
// CROSSHAIR
// ============================================================

const crosshair =
    document.createElement(
        "div"
    );

crosshair.textContent = "＋";

crosshair.style.position = "fixed";

crosshair.style.left = "50%";

crosshair.style.top = "50%";

crosshair.style.transform =
    "translate(-50%, -50%)";

crosshair.style.color = "white";

crosshair.style.fontSize = "20px";

crosshair.style.fontFamily = "Arial";

crosshair.style.fontWeight = "bold";

crosshair.style.textShadow =
    "0 0 2px black";

crosshair.style.pointerEvents =
    "none";

crosshair.style.zIndex = "100";


document.body.appendChild(
    crosshair
);


// ============================================================
// BLOCK UI
// ============================================================

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


// ============================================================
// CAMERA
// ============================================================

let cameraYaw = 0;

let cameraPitch = 0;


// 目線
const cameraHeight = 1.62;


// ============================================================
// MOUSE LOOK
// ============================================================

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


// ============================================================
// RAYCAST
// ============================================================

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


// ============================================================
// BLOCK BREAKING
// ============================================================

const BREAK_TIME =
    3000;


let breakingBlock = null;

let breakingStartTime = 0;


// ============================================================
// CRACK EFFECT
// ============================================================

const crackMaterial =
    new THREE.LineBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.8
    });


const crackGroup =
    new THREE.Group();


scene.add(crackGroup);


const crackLines = [];


function createCrackLines() {

    while (
        crackGroup.children.length > 0
    ) {

        crackGroup.remove(
            crackGroup.children[0]
        );
    }


    crackLines.length = 0;


    // ひびパターン
    const patterns = [

        [
            [-0.35, 0.15],
            [-0.05, 0.02],
            [0.15, 0.25],
            [0.38, 0.05]
        ],

        [
            [-0.25, -0.25],
            [-0.05, 0.02],
            [0.05, -0.30],
            [0.30, -0.10]
        ],

        [
            [-0.40, 0.30],
            [-0.15, 0.05],
            [-0.30, -0.20]
        ],

        [
            [0.05, 0.05],
            [0.30, 0.30],
            [0.38, 0.15]
        ]
    ];


    for (
        const pattern of patterns
    ) {

        const points = [];


        for (
            const p of pattern
        ) {

            points.push(
                new THREE.Vector3(
                    p[0],
                    p[1],
                    0
                )
            );
        }


        const geometry =
            new THREE.BufferGeometry()
                .setFromPoints(
                    points
                );


        const line =
            new THREE.Line(
                geometry,
                crackMaterial
            );


        crackGroup.add(line);

        crackLines.push(line);
    }
}


createCrackLines();


// ============================================================
// CRACK UPDATE
// ============================================================

function updateCrack(
    progress,
    block,
    face
) {

    crackGroup.position.copy(
        block.position
    );


    // --------------------------------------------------------
    // ブロックの面に合わせる
    // --------------------------------------------------------

    crackGroup.quaternion.set(
        0,
        0,
        0,
        1
    );


    // 上
    if (
        face &&
        Math.abs(face.y) > 0.5
    ) {

        crackGroup.rotation.x =
            face.y > 0
                ? -Math.PI / 2
                : Math.PI / 2;
    }


    // 左右
    else if (
        face &&
        Math.abs(face.x) > 0.5
    ) {

        crackGroup.rotation.y =
            face.x > 0
                ? Math.PI / 2
                : -Math.PI / 2;
    }


    // 前後
    else {

        crackGroup.rotation.set(
            0,
            0,
            0
        );
    }


    // 表面から少しだけ離す
    crackGroup.translateZ(
        0.506
    );


    // ひびの濃さ
    crackMaterial.opacity =
        0.15 +
        progress * 0.75;


    // ひびの本数
    const visibleCount =
        Math.ceil(
            crackLines.length *
            progress
        );


    for (
        let i = 0;
        i < crackLines.length;
        i++
    ) {

        crackLines[i].visible =
            i < visibleCount;
    }
}


// ============================================================
// START BREAKING
// ============================================================

function startBreaking() {

    const hit =
        getTargetBlock();


    if (
        !hit
    ) {

        return;
    }


    const block =
        hit.object;


    // 最下層
    if (
        block.userData.blockY <= -3
    ) {

        return;
    }


    // 新しいブロック
    if (
        breakingBlock !== block
    ) {

        breakingBlock =
            block;

        breakingStartTime =
            performance.now();
    }
}


// ============================================================
// STOP BREAKING
// ============================================================

function stopBreaking() {

    breakingBlock =
        null;

    breakingStartTime =
        0;

    crackGroup.visible =
        false;
}


// ============================================================
// UPDATE BREAKING
// ============================================================

function updateBreaking() {

    if (
        !breakingBlock
    ) {

        return;
    }


    // ブロックが消えている
    if (
        !breakingBlock.parent
    ) {

        stopBreaking();

        return;
    }


    // 現在狙っているブロック
    const hit =
        getTargetBlock();


    // 狙いを外した
    if (
        !hit ||
        hit.object !== breakingBlock
    ) {

        stopBreaking();

        return;
    }


    const elapsed =
        performance.now() -
        breakingStartTime;


    const progress =
        Math.min(
            elapsed / BREAK_TIME,
            1
        );


    // ひび表示
    crackGroup.visible =
        true;


    updateCrack(
        progress,
        breakingBlock,
        hit.face.normal
    );


    // 3秒
    if (
        progress >= 1
    ) {

        const x =
            breakingBlock
                .userData
                .blockX;


        const y =
            breakingBlock
                .userData
                .blockY;


        const z =
            breakingBlock
                .userData
                .blockZ;


        removeBlock(
            x,
            y,
            z
        );


        stopBreaking();
    }
}


// ============================================================
// PLACE BLOCK
// ============================================================

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


    // プレイヤーと重なるか
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


// ============================================================
// MOUSE
// ============================================================

renderer.domElement.addEventListener(
    "mousedown",
    event => {

        // 左クリック
        if (
            event.button === 0
        ) {

            startBreaking();
        }


        // 右クリック
        if (
            event.button === 2
        ) {

            placeBlock();
        }
    }
);


// 左クリックを離す
renderer.domElement.addEventListener(
    "mouseup",
    event => {

        if (
            event.button === 0
        ) {

            stopBreaking();
        }
    }
);


// 右クリックメニュー禁止
renderer.domElement.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


// ============================================================
// GROUND HEIGHT
// ============================================================

function getBlockHeight(
    x,
    z
) {

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

            highest =
                Math.max(
                    highest,
                    y + 0.5
                );
        }
    }


    return highest;
}


// ============================================================
// COLLISION
// ============================================================

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


// ============================================================
// PLAYER MOVEMENT
// ============================================================
//
// 重要：
// 「何かにぶつかった」だけではジャンプしない。
// 前方の地面が現在の地面より
// 0〜1ブロック高い場合だけ自動ジャンプ。
// ============================================================

const stepHeight =
    1.0;


function movePlayer(
    direction,
    distance
) {

    const horizontal =
        direction
            .clone()
            .normalize()
            .multiplyScalar(
                distance
            );


    // ========================================================
    // 普通に進めるか
    // ========================================================

    const normalPosition =
        player.position.clone();


    normalPosition.x +=
        horizontal.x;

    normalPosition.z +=
        horizontal.z;


    // 普通に歩ける
    if (
        !collidesAt(
            normalPosition
        )
    ) {

        player.position.x =
            normalPosition.x;

        player.position.z =
            normalPosition.z;

        return;
    }


    // ========================================================
    // 空中では自動ジャンプしない
    // ========================================================

    if (
        !grounded
    ) {

        return;
    }


    // ========================================================
    // 現在の地面
    // ========================================================

    const currentGround =
        getBlockHeight(
            player.position.x,
            player.position.z
        );


    // ========================================================
    // 移動先の地面
    // ========================================================

    const nextGround =
        getBlockHeight(
            normalPosition.x,
            normalPosition.z
        );


    const heightDifference =
        nextGround -
        currentGround;


    // ========================================================
    // 本当に1ブロック以内の段差か
    // ========================================================

    if (
        heightDifference > 0.01 &&
        heightDifference <= stepHeight + 0.01
    ) {

        // 1マス上の位置
        const stepPosition =
            normalPosition.clone();


        stepPosition.y =
            nextGround;


        // 上がった場所に壁がない
        if (
            !collidesAt(
                stepPosition
            )
        ) {

            // ★ 自動ジャンプ
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


    // 段差ではない
    // → 壁として停止
}


// ============================================================
// PHYSICS
// ============================================================

// 上下速度
let velocityY = 0;


// 重力
const gravity =
    -0.018;


// 通常ジャンプ
const jumpPower =
    0.34;


// 地面にいるか
let grounded = false;


// ============================================================
// GAME LOOP
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // ========================================================
    // 採掘
    // ========================================================

    updateBreaking();


    // ========================================================
    // 移動速度
    // ========================================================

    let speed =
        0.16;


    // Shiftで走る
    if (
        keys["shift"]
    ) {

        speed =
            0.28;
    }


    // ========================================================
    // カメラの前方向
    // ========================================================

    const forward =
        new THREE.Vector3(

            Math.sin(cameraYaw),

            0,

            Math.cos(cameraYaw)

        );


    // ========================================================
    // カメラの右方向
    // ========================================================

    const right =
        new THREE.Vector3(

            -forward.z,

            0,

            forward.x

        );


    // ========================================================
    // W
    // ========================================================

    if (
        keys["w"]
    ) {

        movePlayer(
            forward,
            speed
        );
    }


    // ========================================================
    // S
    // ========================================================

    if (
        keys["s"]
    ) {

        movePlayer(
            forward,
            -speed
        );
    }


    // ========================================================
    // A
    // ========================================================

    if (
        keys["a"]
    ) {

        movePlayer(
            right,
            -speed
        );
    }


    // ========================================================
    // D
    // ========================================================

    if (
        keys["d"]
    ) {

        movePlayer(
            right,
            speed
        );
    }


    // ========================================================
    // 通常ジャンプ
    // ========================================================

    if (
        keys[" "] &&
        grounded
    ) {

        velocityY =
            jumpPower;

        grounded =
            false;
    }


    // ========================================================
    // 重力
    // ========================================================

    velocityY +=
        gravity;


    // 落下速度の上限
    if (
        velocityY < -0.45
    ) {

        velocityY =
            -0.45;
    }


    const nextY =
        player.position.y +
        velocityY;


    // ========================================================
    // 地面
    // ========================================================

    const groundHeight =
        getBlockHeight(
            player.position.x,
            player.position.z
        );


    if (
        nextY <= groundHeight
    ) {

        player.position.y =
            groundHeight;


        velocityY =
            0;


        grounded =
            true;

    }

    else {

        player.position.y =
            nextY;


        grounded =
            false;
    }


    // ========================================================
    // CAMERA
    // ========================================================

    camera.position.set(

        player.position.x,

        player.position.y +
            cameraHeight,

        player.position.z

    );


    const lookDirection =
        new THREE.Vector3(

            Math.sin(cameraYaw) *
                Math.cos(cameraPitch),

            Math.sin(cameraPitch),

            Math.cos(cameraYaw) *
                Math.cos(cameraPitch)

        );


    camera.lookAt(

        camera.position
            .clone()
            .add(
                lookDirection
                    .multiplyScalar(10)
            )

    );


    // ========================================================
    // RENDER
    // ========================================================

    renderer.render(
        scene,
        camera
    );
}


// ============================================================
// START
// ============================================================

animate();


// ============================================================
// RESIZE
// ============================================================

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
