import * as THREE from 'three'

export default class SFX {
    constructor(camera, loadingManager) {
        this.sounds = {}
        this.listener = new THREE.AudioListener()
        this.loader = new THREE.AudioLoader(loadingManager)
        camera.add(this.listener)
    }
    async load(name, file, loop=false, vol=0.5, model=null) {
        const sound = !model? new THREE.Audio(this.listener) : new THREE.PositionalAudio(this.listener)
        const buffer = await this.loader.loadAsync(file)
        sound.setBuffer(buffer)
        sound.setLoop(loop)
        sound.setVolume(vol)

        this.sounds[name] = sound
        if(model) model.add(sound)
    }
    play(name) {
        const sound = this.sounds[name]
        if(sound && !sound.isPlaying) sound.play()
    }
    pause(name){
        const sound = this.sounds[name]
        if(sound) sound.pause()
    }
    stop(name){
        const sound = this.sounds[name]
        if(sound && sound.isPlaying) sound.stop()
    }
    stopAll(){
        for(let name in this.sounds) this.stop(name)
    }

    setVolume(name, volume){
        const sound = this.sounds[name]
        if(sound) sound.setVolume(volume)
    }
    setLoop(name, loop){
        const sound = this.sounds[name]
        if(sound) sound.setLoop(loop)
    }
}