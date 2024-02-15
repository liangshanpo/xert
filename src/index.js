import AStar from './lib/astar'
import Minimap from './lib/minimap'
import NavMeshGenerator from './lib/navmesh'

class Xert {
    scripts = []
    entitys = new Map()

    constructor({id, scene, camera, renderer, container}={}) {
        this.id = id || 'xert-canvas'
        this.scene = scene
        this.camera = camera
        this.renderer = renderer
        this.container = container || document.body
    }

    reg(system) {
        system.bind(this)()
    }
    use(script) {
        this.scripts.push(script)
    }
    add(entity) {
        const parent = entity.hasOwnProperty('parent') ? this.entitys.get(entity.parent)?.model : this.scene
        const add_to_scene = (model)=>{
            if(model instanceof Array) {
                for(const m of model) add_to_scene(m)
            } else {
                model && parent && parent.add(model)
            }
        }
        if(Reflect.get(entity.load, Symbol.toStringTag) == 'AsyncFunction') {
            entity.load(this).then(res=>{
                add_to_scene(entity.model)
                this.entitys.set(entity.name, entity)
            })
        } else {
            entity.load(this)
            add_to_scene(entity.model)
            this.entitys.set(entity.name, entity)
        }
    }
    get(name) {
        return this.entitys.get(name)
    }

    render() {
        this.renderer.render(this.scene, this.camera)

        if(! this.active) return
        for(const script of this.scripts) {
            script(this)
        }
    }
    start() {
        this.active = true
        this.renderer.domElement.id = `${this.id}`
        this.container.appendChild(this.renderer.domElement)

        this.renderer.setAnimationLoop(this.render.bind(this))
    }
}

export {Xert, AStar, Minimap, NavMeshGenerator}