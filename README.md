# Xert
一个基于Three.js的轻量级ECS框架，仅有5个API。
A lightweight ECS(Entity Component System) framework based on three.js, there are only 5 APIs.


![暴龙](https://github.com/imlzg/image/blob/75dfc9446da0c24e1348f096e212c34d3525c631/trex.jpg)


Xert 提倡组合优于继承、外观行为分离、不重复造轮子。


Xert 对 ECS 的理解：  
Entity：游戏中的所有对象，需要自定义，包含外观和行为；  
Component：构成游戏对象的组件，不需要自定义、由 Three.js 提供，可借助 ES6 语言特性实现，如getter/setter；  
System：游戏需要借助的外部功能，如渲染、UI、声音、控制等，可自定义或由浏览器、HTML、三方类库等提供；


使用 Xert 只需要关注 3 类对象：
1. Plugin: 包含钩子代码，负责将外部系统功能注入游戏，使用function函数；
2. Entity: 包含只运行一次的代码，负责定义游戏对象的加载、层级结构等，使用对象字面量；
3. Script: 包含每帧都运行的代码，负责控制游戏逻辑和对象行为，使用箭头函数；



### API

#### 1. const game = new Xert()
创建 Xert 实例。

#### 2. game.reg(manager)
向 game 实例中注册插件，插件是系统的钩子，系统包括HTML UI、Audio、Input、Loading等。
使用 function 声明插件函数。

#### 3. game.add(light)
向 game 实例中添加 3D 实体，对应 ECS 中的 E。
使用对象字面量声明实体。

#### 4. game.use(control)
调用游戏逻辑控制实体行为。
使用箭头函数声明行为。

#### 5. game.start()
开始游戏。



### 安装 Install
```shell
npm install xert 
```


### 示例 Examples

```javascript
import * as THREE from 'three'
import {GLTFLoader} from 'gltfloader'
import {Xert, Minimap, NavMeshGenerator} from 'xert'

const game = new Xert()
game.reg(manager)
game.reg(input)

game.add(light)
game.add(world)
game.add(car)

game.use(control)

game.start()
```




### License
[MIT](LICENSE) © Li zhigang