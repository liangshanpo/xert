import * as THREE from 'three'

export default class Minimap {
    /**
     * @id string, the minimap element id, can be used to specify css style
     * @parent htmlElement, the parent element of minimap
     * @scene Scene, the three.js scene
     * @target string, the name of the 3D object on which minimap camera focuses
     * @layers number array, which layers can the minimap camera see
     * @height number, the distance between the camera and target
     * @frustum number, the camera's frustum, default 10
     * @size number, the minimap element size, default 120
     * @bgColor hex or string, the WebGLRenderer's clear color
     * @bgAlpha 0-1, the opacity number
     * @syncRotateZ boolean, does the minimap rotate with the target, default false
     * @mode string, 'follow' || 'scope' || 'static', used to define camera's position
     * @scope number, only for scope mode
     * @position object, only for static mode, like: {x: 26, y: 36}
     */
    constructor(options={}) {
        this.id = options.id || 'map-canvas'
        this.parent = options.parent
        this.scene = options.scene
        this.target = options.target
        this.layers = options.layers || [0, 2]
        this.height = options.height || 10
        this.frustum = options.frustum || 10
        this.size = options.size || 120
        this.bgColor = options.bgColor || 0x7d684f
        this.bgAlpha = options.bgAlpha || 1.0
        this.syncRotateZ = options.syncRotateZ || false
        this.mode = options.mode || 'follow'
        this.scope = options.scope || this.frustum/3
        this.position = options.position || null

        if (!this.parent || !this.scene || !this.target) {
            throw new Error('parent, scene and target can not be null')
        }

        this.init()
    }

    init() {
        this.camera = new THREE.OrthographicCamera(
            -this.frustum / 2,
            this.frustum / 2,
            this.frustum / 2,
            -this.frustum / 2,
            1, 1000
        )
        for(const layer of this.layers) this.camera.layers.enable(layer)
        if(this.mode === 'static') {
            this.camera.position.set(
                this.position.x,
                this.height,
                this.position.z
            )
            this.camera.lookAt(this.position.x, 0, this.position.z)
        }

        this.renderer = new THREE.WebGLRenderer({ alpha: true })
        this.renderer.setSize(this.size, this.size)
        this.renderer.setClearColor(this.bgColor, this.bgAlpha)
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 0.6
        this.renderer.domElement.id = `${this.id}`
        this.parent.appendChild(this.renderer.domElement)
    }

    updateCamera() {
        const target = this.scene.getObjectByName(this.target)
        if(! target) return

        const pos = target.position.clone()
        if(this.mode == 'scope') {
            const front = new THREE.Vector3()
            target.getWorldDirection(front)
            pos.add(front.normalize().multiplyScalar(this.scope))
        }

        if(this.mode !== 'static') {
            this.camera.position.set(
                pos.x,
                this.height,
                pos.z
            )
            this.camera.lookAt(pos.x, 0, pos.z)
        }

        if(this.syncRotateZ) {
            const targetRotateY = THREE.MathUtils.radToDeg(target.rotation.y)
            this.renderer.domElement.style.transform = `rotateZ(${180-targetRotateY}deg)`
        }
    }

    update() {
        this.updateCamera()
        this.renderer.render(this.scene, this.camera)
    }
}