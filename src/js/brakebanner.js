const BRAKE_BIKE = "brake_bike.png"
const BRAKE_HANDLERBAR = "brake_handlerbar.png"
const BRAKE_LEVER = "brake_lever.png"
const BTN_CIRCLE = "btn_circle.png"
const BTN = "btn.png"
const SOURCES = [BTN, BTN_CIRCLE, BRAKE_BIKE, BRAKE_HANDLERBAR, BRAKE_LEVER]
class BrakeBanner {
	constructor(selector) {
		this.speed = 0
		this.btns = {}
		this.particles = []
		this.app = this.initPixi()
		document.querySelector(selector).appendChild(this.app.view)
		this.loader = new PIXI.Loader()
		this.loaderResources()
		this.loader.load()
		this.loader.onComplete.add(() => {
			this.show()
		})
	}

	initPixi() {
		return new PIXI.Application({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0xffffff,
			resizeTo: window
		})
	}

	loaderResources() {
		SOURCES.forEach(key => {
			this.loader.add(key, `images/${key}`)
		})
	}

	show() {
		// 创建按钮容器
		const actionContainer = this.createdBtnContainer()
		
		actionContainer.interactive = true
		actionContainer.buttonMode = true
		// 创建车架容器
		const brakeContainer = this.createBrakeContainer()
		actionContainer.x = window.innerWidth - brakeContainer.width + 200
		actionContainer.y = window.innerHeight - brakeContainer.height + 200
		this.app.stage.addChild(brakeContainer)
		this.app.stage.addChild(actionContainer)
		// 创建粒子数据
		this.createParticles()
		const loop = this.getParticleLoop()
		this.startLoop(loop)
		// 设置事件和交互
		this.setEvent(brakeContainer, actionContainer, loop)
	}

	setEvent(brakeContainer, actionContainer, loop) {
		const x = window.innerWidth - brakeContainer.width
		const y = window.innerHeight - brakeContainer.height
		const resize = () => {
			brakeContainer.x = x
			brakeContainer.y = y
		}
		window.addEventListener('resize', resize)
		resize()
		actionContainer.on('mousedown', () => {
			const rotation = this.btns[BRAKE_LEVER].rotation = Math.PI / 180 * -30
			gsap.to(this.btns[BRAKE_LEVER], { duration: .6, rotation }) //刹车动效
			this.pauseLoop(loop) //停止粒子滑动和样式、位置还原
			gsap.to(brakeContainer, { duration: .6, x: x - 3, y: y + 10, ease: 'elastic.out' }) //刹车减震动效
			gsap.to(actionContainer, { duration: .6, alpha: 0 })
		})

		actionContainer.on('mouseup', () => {
			gsap.to(this.btns[BRAKE_LEVER], { duration: .6, rotation: 0 })
			this.startLoop(loop)
			gsap.to(brakeContainer, { duration: .6, x, y, ease: 'elastic.out' })
			gsap.to(actionContainer, { duration: .6, alpha: 1 })
		})
	}

	createParticles() {
		const particleContainer = new PIXI.Container()
		this.app.stage.addChild(particleContainer)
		particleContainer.x = particleContainer.pivot.x = window.innerWidth / 2
		particleContainer.y = particleContainer.pivot.y = window.innerHeight / 2
		particleContainer.rotation = 35 * Math.PI / 180
		const colors = [0x235dc8, 0xf05c5c, 0xf1b375, 0x137cbd4d]
		for (let i = 0; i < 10; i++) {
			const gr = new PIXI.Graphics()
			gr.beginFill(colors[Math.floor(Math.random() * colors.length)])
			gr.drawCircle(0, 0, 6)
			gr.endFill()
			const grItem = {
				sx: Math.random() * window.innerWidth,
				sy: Math.random() * window.innerHeight,
				gr
			}
			gr.x = grItem.sx
			gr.y = grItem.sy
			particleContainer.addChild(gr)
			this.particles.push(grItem)
		}

	}
	startLoop(loop) {
		this.speed = 0
		gsap.ticker.add(loop)
	}

	pauseLoop(loop) {
		gsap.ticker.remove(loop)
		for (let i = 0; i < this.particles.length; i++) {
			let item = this.particles[i]
			item.gr.scale.y = 1
			item.gr.scale.x = 1
			gsap.to(item.gr, { duration: .6, x: item.sx, y: item.sy, ease: 'elastic.out' })
		}
	}

	getParticleLoop() {

		return () => {
			this.speed += .5
			this.speed = Math.min(this.speed, 20)
			for (let i = 0; i < this.particles.length; i++) {
				const item = this.particles[i]
				item.gr.y += this.speed
				if (this.speed >= 20) {
					item.gr.scale.y = 40
					item.gr.scale.x = 0.03
				}
				if (item.gr.y >= window.innerHeight) item.gr.y = 0
			}
		}
	}

	createBrakeContainer() {
		const brakes = [BRAKE_BIKE, BRAKE_LEVER, BRAKE_HANDLERBAR,]
		const brakeContainer = new PIXI.Container();
		brakes.forEach(key => {
			this.btns[key] = this.getSprite(key)
			brakeContainer.addChild(this.btns[key])
		})
		brakeContainer.scale.x = brakeContainer.scale.y = 0.3
		this.btns[BRAKE_LEVER].pivot.x = 455
		this.btns[BRAKE_LEVER].pivot.y = 455
		this.btns[BRAKE_LEVER].x = 722
		this.btns[BRAKE_LEVER].y = 900
		return brakeContainer
	}

	createdBtnContainer() {
		const actions = [BTN, BTN_CIRCLE]
		const actionContainer = new PIXI.Container()

		actions.forEach(key => {
			this.btns[key] = this.getSprite(key)
			actionContainer.addChild(this.btns[key])
		})
		this.btns['statict'] = this.getSprite(BTN_CIRCLE)
		this.setOrigin([...actions, 'statict'])

		const btnCircle = this.btns[BTN_CIRCLE]
		actionContainer.addChild(this.btns['statict'])
		btnCircle.scale.x = btnCircle.scale.y = 0.8
		gsap.to(btnCircle.scale, { duration: 1, x: 1.3, y: 1.3, repeat: -1 })
		gsap.to(btnCircle, { duration: 1, alpha: 0, repeat: -1 })
		return actionContainer
	}

	getSprite(key) {
		return new PIXI.Sprite(this.loader.resources[key].texture)
	}

	setOrigin(keys) {
		keys.forEach(key => {
			const sprite = this.btns[key]
			sprite.pivot.x = sprite.pivot.y = sprite.width / 2
		})
	}
}