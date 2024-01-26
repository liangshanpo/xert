import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js'
import Recast from './recast'
import wasm from './recast.wasm'

export default class NavMeshGenerator {
    constructor(recastWasm=wasm, manager) {
        this.defaultParams = {
            cellSize: 0.166,
            cellHeight: 0.1,
            agentHeight: 1.7,
            agentRadius: 0.5,
            agentMaxClimb: 0.3,
            agentMaxSlope: 45,
            regionMinSize: 1,
            regionMergeSize: 20,
            edgeMaxLen: 12,
            edgeMaxError: 1,
            vertsPerPoly: 3,
            detailSampleDist: 16,
            detailSampleMaxError: 1
        }

        this.recast = Recast({
            locateFile(path) {
                if (path.endsWith('.wasm')) {
                    return recastWasm
                }
            }
        })

        this.manager = manager || THREE.DefaultLoadingManager
    }

    async generate(obj, params, name='navMesh') {
        name = this.manager.resolveURL(name)

        this.manager.itemStart(name)
        const cached = THREE.Cache.get(name)
        if (cached) {
            this.manager.itemEnd(name)
            return cached
        }

        try {
            await this.recast.ready

            const meshArray = []
            obj.traverse(object => {
                if (object.isMesh) {
                    meshArray.push(object)
                }
            })

            const mergedGeometry = this.mergeMeshGeometries(meshArray)
            const verts = mergedGeometry.attributes.position.array
            const faces = new Int32Array(verts.length)

            for (let i = 0; i < faces.length; i++) {
                faces[i] = i
            }
            if (! this.recast.loadArray(verts, faces)) {
                this.manager.itemError(name)
                console.error('error loading navmesh data' )
                return null
            }

            const {
                cellSize,
                cellHeight,
                agentHeight,
                agentRadius,
                agentMaxClimb,
                agentMaxSlope,
                regionMinSize,
                regionMergeSize,
                edgeMaxLen,
                edgeMaxError,
                vertsPerPoly,
                detailSampleDist,
                detailSampleMaxError
            } = Object.assign({}, this.defaultParams, params || {})

            const status = this.recast.build(
                cellSize,
                cellHeight,
                agentHeight,
                agentRadius,
                agentMaxClimb,
                agentMaxSlope,
                regionMinSize,
                regionMergeSize,
                edgeMaxLen,
                edgeMaxError,
                vertsPerPoly,
                detailSampleDist,
                detailSampleMaxError
            )

            if (status !== 0) {
                this.manager.itemError(name)
                console.error('unknown error building nav mesh', status )
                return null
            }

            const meshes = this.recast.getMeshes()
            const wasmVerts = this.recast.getVerts()
            const vertsDst = new Float32Array(wasmVerts.length)
            vertsDst.set(wasmVerts)
            const tris = this.recast.getTris()

            const indices = new Uint16Array((tris.length / 4) * 3)
            let index = 0

            const numMeshes = meshes.length / 4

            for (let i = 0; i < numMeshes; i++) {
                const meshOffset = i * 4
                const meshVertsOffset = meshes[meshOffset]
                const meshTrisOffset = meshes[meshOffset + 2]
                const meshNumTris = meshes[meshOffset + 3]

                for (let j = 0; j < meshNumTris; j++) {
                    const triangleOffset = (meshTrisOffset + j) * 4

                    const a = meshVertsOffset + tris[triangleOffset]
                    const b = meshVertsOffset + tris[triangleOffset + 1]
                    const c = meshVertsOffset + tris[triangleOffset + 2]

                    indices[index++] = a
                    indices[index++] = b
                    indices[index++] = c
                }
            }

            const geometry = new THREE.BufferGeometry()
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertsDst, 3))
            geometry.setIndex(new THREE.Uint16BufferAttribute(indices, 1))

            const material = new THREE.MeshBasicMaterial({transparent: true, opacity: 0})

            const mesh = new THREE.Mesh(geometry, material)
            mesh.position.y -= cellHeight

            this.recast.freeNavMesh()

            this.manager.itemEnd(name)
            return mesh
        } catch (err) {
            this.manager.itemError(name)
            console.error(err)
            return null
        }
    }

    mergeMeshGeometries(meshes, cullBackFace=true) {
        const geometries = []

        for (const mesh of meshes) {
            let geometry = mesh.geometry
            let attributes = geometry.attributes

            if (! geometry.isBufferGeometry) {
                geometry = new THREE.BufferGeometry().fromGeometry(geometry)
                attributes = geometry.attributes
            }

            if (! attributes.position || attributes.position.itemSize !== 3) return

            if (geometry.index) geometry = geometry.toNonIndexed()

            const cloneGeometry = new THREE.BufferGeometry()
            cloneGeometry.setAttribute('position', geometry.attributes.position.clone())
            mesh.updateMatrixWorld()
            cloneGeometry.applyMatrix4(mesh.matrixWorld)
            geometry = cloneGeometry

            geometries.push(geometry)
        }

        if (geometries.length === 0) {
            return new THREE.BufferGeometry()
        }

        const geometry = BufferGeometryUtils.mergeGeometries(geometries)

        if (cullBackFace) return geometry

        //If double sided geometry is required
        const flippedGeometry = geometry.clone()

        const positions = flippedGeometry.attributes.position.array
        for (let i = 0; i < positions.length; i += 9) {
            const x0 = positions[i]
            const y0 = positions[i + 1]
            const z0 = positions[i + 2]
            const offset = 6
            positions[i] = positions[i + offset]
            positions[i + 1] = positions[i + offset + 1]
            positions[i + 2] = positions[i + offset + 2]
            positions[i + offset] = x0
            positions[i + offset + 1] = y0
            positions[i + offset + 2] = z0
        }

        return BufferGeometryUtils.mergeGeometries([geometry, flippedGeometry])
    }
}