import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  CubicBezierCurve3,
  CurvePath,
  CylinderGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  LatheGeometry,
  LineCurve3,
  Mesh,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three'

export function createLampScene(viewport: HTMLElement, initialColor: string, onUnavailable: () => void) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true })
  if (!context) throw new Error('WebGL 2 indisponible')

  const renderer = new WebGLRenderer({ canvas, context, alpha: true })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.08
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  canvas.setAttribute('aria-hidden', 'true')
  viewport.append(canvas)
  canvas.addEventListener('webglcontextlost', onUnavailable)

  const scene = new Scene()
  const camera = new PerspectiveCamera(33, 1, 0.1, 40)
  const cameraTarget = new Vector3(0.02, 1.44, 0)
  const cameraOffset = new Vector3(2.45, 1.45, 6.5)

  scene.add(new HemisphereLight(0xfff6eb, 0xb5acb1, 1.65))
  const key = new DirectionalLight(0xffe6cf, 2.9)
  key.position.set(-3.6, 7, 4.5)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.left = -4
  key.shadow.camera.right = 4
  key.shadow.camera.top = 4
  key.shadow.camera.bottom = -4
  key.shadow.normalBias = 0.023
  key.shadow.radius = 3
  scene.add(key)
  const rim = new DirectionalLight(0xe5e6ff, 1.15)
  rim.position.set(3, 3.8, -3)
  scene.add(rim)

  const floor = new Mesh(new PlaneGeometry(60, 60), new ShadowMaterial({ opacity: 0.18 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const lamp = new Group()
  lamp.rotation.y = -0.2
  scene.add(lamp)
  const enamel = new MeshStandardMaterial({ color: initialColor, metalness: 0.12, roughness: 0.43 })
  const diffuser = new MeshStandardMaterial({
    color: 0xffe9c4, emissive: 0xffcf91, emissiveIntensity: 0.36, roughness: 0.48,
  })
  const rubber = new MeshStandardMaterial({ color: 0x5e564e, roughness: 0.92 })

  const base = new Mesh(new LatheGeometry([
    new Vector2(0, 0.025), new Vector2(0.74, 0.025), new Vector2(0.82, 0.035),
    new Vector2(0.85, 0.058), new Vector2(0.86, 0.09), new Vector2(0.86, 0.19),
    new Vector2(0.85, 0.217), new Vector2(0.825, 0.235), new Vector2(0, 0.235),
  ], 64), enamel)
  const arm = new CurvePath<Vector3>()
  const elbowStart = new Vector3(-0.34, 2.38, 0)
  const elbowEnd = new Vector3(-0.05, 2.67, 0)
  arm.add(new LineCurve3(new Vector3(-0.34, 0.2, 0), elbowStart))
  arm.add(new CubicBezierCurve3(elbowStart, new Vector3(-0.34, 2.54, 0), new Vector3(-0.22, 2.67, 0), elbowEnd))
  arm.add(new LineCurve3(elbowEnd, new Vector3(0.51, 2.67, 0)))
  const stem = new Mesh(new TubeGeometry(arm, 42, 0.105, 20), enamel)

  const cablePath = new CatmullRomCurve3([
    new Vector3(-0.63, 0.084, -0.39), new Vector3(-0.87, 0.055, -0.53),
    new Vector3(-1.19, 0.038, -0.82), new Vector3(-1.49, 0.038, -0.76),
    new Vector3(-1.79, 0.038, -0.6),
  ])
  const cable = new Mesh(new TubeGeometry(cablePath, 32, 0.028, 10), rubber)
  lamp.add(base, stem, cable)

  const head = new Group()
  head.position.set(0.64, 2.47, 0)
  head.rotation.set(-0.27, 0, 0.42)
  const shade = new Mesh(new LatheGeometry([
    new Vector2(0.51, -0.42), new Vector2(0.55, -0.42), new Vector2(0.567, -0.407),
    new Vector2(0.568, -0.38), new Vector2(0.398, 0.36), new Vector2(0.381, 0.4),
    new Vector2(0.353, 0.422), new Vector2(0, 0.422),
  ], 64), enamel)
  const lens = new Mesh(new CylinderGeometry(0.535, 0.535, 0.02, 64), diffuser)
  lens.position.y = -0.397
  head.add(shade, lens)
  lamp.add(head)

  for (const part of [base, stem, shade, lens, cable]) {
    part.castShadow = true
    part.receiveShadow = true
  }

  const render = () => renderer.render(scene, camera)
  const resize = () => {
    const { clientWidth, clientHeight } = viewport
    if (!clientWidth || !clientHeight) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
    renderer.setSize(clientWidth, clientHeight, false)
    camera.aspect = clientWidth / clientHeight
    camera.position.copy(cameraOffset).multiplyScalar(Math.max(1, 0.85 / camera.aspect)).add(cameraTarget)
    camera.lookAt(cameraTarget)
    camera.updateProjectionMatrix()
    render()
  }
  const observer = new ResizeObserver(resize)
  observer.observe(viewport)
  resize()

  return {
    rotate(radians: number) {
      lamp.rotation.y = (lamp.rotation.y + radians) % (Math.PI * 2)
      render()
    },
    setColor(color: string) {
      enamel.color.set(color)
      render()
    },
    reset() {
      lamp.rotation.y = -0.2
      enamel.color.set(initialColor)
      render()
    },
    dispose() {
      observer.disconnect()
      canvas.removeEventListener('webglcontextlost', onUnavailable)
      for (const part of [base, stem, shade, lens, cable, floor]) part.geometry.dispose()
      for (const material of [enamel, diffuser, rubber, floor.material]) material.dispose()
      key.shadow.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
