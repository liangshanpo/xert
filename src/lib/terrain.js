import * as THREE from 'three'
import {ImprovedNoise} from 'three/addons/math/ImprovedNoise.js'

export default class Terrain {
    constructor(w, h) {
        this.width = w
        this.height = h
        this.size = this.width * this.height
        this.geometry = new THREE.PlaneGeometry(
            this.width, this.height, this.width-1, this.height-1
        )
        this.geometry.rotateX(-Math.PI / 2)
        this.vertices = this.geometry.getAttribute('position').array
        this.mesh = null
    }

    static fromNoise(seed, w, h) {
        const terrain = new Terrain(w, h)

        const random = ()=>{
            const x = Math.sin(seed++) * 10000
            return x - Math.floor(x)
        }
        const z = random()*100

        const perlin = new ImprovedNoise()
        const pixels = new Uint8Array(terrain.size)
        for(let j=0; j<4; j++) {
            for(let i=0; i<terrain.size; i++) {
                const x = i%w, y = ~~(i/w), q = Math.pow(5, j)
                pixels[i] += Math.abs(perlin.noise(x/q, y/q, z) * q * 1.75)
            }
        }

        for(let i=0; i<terrain.size; i++) {
            terrain.vertices[i * 3 + 1] = pixels[i] / 256
        }

        return terrain
    }

    build(material, scale) {
        this.geometry.computeBoundingSphere()
        this.geometry.computeVertexNormals()

        this.mesh = new THREE.Mesh(this.geometry, material)
        this.mesh.position.x = this.width/2
        this.mesh.position.z = this.height/2
        this.mesh.scale.y = scale
        return this.mesh
    }

    getRandomVertex(interval, from=0) {
        const len = this.vertices.length / 3
        if(interval>len) interval = len
        if(from>=len) from = 0
        const offset = from + Math.floor(Math.random() * interval)

        const vertex = new THREE.Vector3()
        vertex.fromArray(this.vertices, offset*3)

        return this.mesh.localToWorld(vertex)
    }

    getHeightAt(x, z) {
        /*
        Get height (y value) of terrain at x, z

        Find which "cell" x, z is in by rounding them both down since each
        height sample is evenly spaced at integer locations.

        Once we have a cell (a location between four neighboring height samples)
        we can figure out the offset by subtracting the rounded values from the
        real values. This effectively gives us the amount "into" the cell we are
        for both x and z. 

        rx = x - floor(z)
        rz = z - floor(z)

        a----b
        |    |
        |p   |
        d----c

        Using these fractional values, if our position is marked by the p, the
        height can be found by first interpolating between (a->b) using rx, then
        interpolating between (c->d) using rx, and then between the result of
        both of those using rz.

        y = (a * (1 - rx) + b * rx) * (1 - rz) + (c * rx + d * (1 - rx)) * rz
        */
        const width = this.width
        const height = this.height
        if(x < 0 || x >= width || z < 0 || z >= height) {
            throw new Error('point outside of terrain boundary')
        }
        // Get integer floor of x, z
        const ix = Math.floor(x)
        const iz = Math.floor(z)
        // Get real (fractional) component of x, z
        // This is the amount of each into the cell
        const rx = x - ix
        const rz = z - iz
        // Edges of cell
        const a = this.vertices[(iz * width + ix) * 3 + 1]
        const b = this.vertices[(iz * width + (ix + 1)) * 3 + 1]
        const c = this.vertices[((iz + 1) * width + (ix + 1)) * 3 + 1]
        const d = this.vertices[((iz + 1) * width + ix) * 3 + 1]

        // Interpolate top edge (left and right)
        const e = (a * (1 - rx) + b * rx)
        // Interpolate bottom edge (left and right)
        const f = (c * rx + d * (1 - rx))
        // Interpolate between top and bottom
        const y = (e * (1 - rz) + f * rz)
        return y
    }
}