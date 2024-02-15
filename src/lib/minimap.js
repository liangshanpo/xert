import * as THREE from 'three'

export default class Minimap {
    /**
     * @id string, the minimap element id, can be used to specify css style
     * @parent htmlElement, the parent element of minimap
     * @scene Scene, the three.js scene
     * @target string, the name of the 3D object on which minimap camera focuses
     * @layers number array, which layers can the minimap camera see
     * @frustum number, the camera's frustum, default 10
     * @size number, the minimap element size, default 120
     * @syncRotateZ boolean, does the minimap rotate with the target, default false
     */
    constructor({id, parent, scene, target, layers, frustum, size, syncRotateZ}) {
        this.id = id || 'map-canvas'
        this.parent = parent
        this.scene = scene
        this.target = target
        this.layers = layers || [0, 2]
        this.frustum = frustum || 10
        this.size = size || 120
        this.syncRotateZ = syncRotateZ || false

        if (!parent || !this.scene || !this.target) {
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

        this.renderer = new THREE.WebGLRenderer({ alpha: true })
        this.renderer.setSize(this.size, this.size)
        this.renderer.setClearColor(0x7d684f)
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 0.6
        this.renderer.domElement.id = `${this.id}`
        this.parent.appendChild(this.renderer.domElement)
    }

    updateCamera() {
        const target = this.scene.getObjectByName(this.target)
        if(! target) return
        if (this.syncRotateZ) {
            let targetRotateY = THREE.MathUtils.radToDeg(target.rotation.y)
            this.renderer.domElement.style.transform = `rotateZ(${targetRotateY}deg)`
        }

        // TODO: check boundary
        this.camera.position.set(
            target.position.x,
            target.position.y + 10,
            target.position.z
        )
        this.camera.lookAt(target.position.x, 0, target.position.z)
    }

    update() {
        this.updateCamera()
        this.renderer.render(this.scene, this.camera)
    }
}