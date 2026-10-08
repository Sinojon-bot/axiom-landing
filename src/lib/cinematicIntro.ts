import * as THREE from 'three'

export const INTRO_MS = 3000

type Spark = {
  phase: number
  radius: number
  rise: number
  speed: number
  warmth: number
  delay: number
}

export type CinematicIntro = {
  resize: (w: number, h: number) => void
  paint: (elapsedMs: number) => number
  dispose: () => void
}

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

function span(t: number, a: number, b: number) {
  return clamp01((t - a) / (b - a))
}

function smooth(u: number) {
  return u * u * (3 - 2 * u)
}

function easeInOut(u: number) {
  return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function makeGlowTexture(size = 64, r = 255, g = 220, b = 120) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grd.addColorStop(0, `rgba(${r},${g},${b},1)`)
  grd.addColorStop(0.25, `rgba(${r},${g},${b},0.75)`)
  grd.addColorStop(0.55, `rgba(${r},${g},${b},0.22)`)
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.fillStyle = grd
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/** Procedural cinematic fly-through: desk ignition → spiral portal → city. 3000 ms. */
export function createCinematicIntro(canvas: HTMLCanvasElement): CinematicIntro {
  const mobile = Math.min(window.innerWidth, window.innerHeight) < 720
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !mobile,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setClearColor(0x02040a, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x06101c, 0.028)

  const camera = new THREE.PerspectiveCamera(46, 1, 0.05, 280)
  const goldTex = makeGlowTexture(64, 255, 196, 90)
  const cyanTex = makeGlowTexture(64, 120, 220, 255)

  // Lights
  scene.add(new THREE.AmbientLight(0x142033, 0.45))
  const key = new THREE.DirectionalLight(0x9ad0ff, 0.55)
  key.position.set(-4, 18, 6)
  scene.add(key)
  const fill = new THREE.PointLight(0x6a90c0, 1.2, 12, 2)
  fill.position.set(1.4, 2.2, 3.4)
  scene.add(fill)

  const igniteLight = new THREE.PointLight(0x4ad4ff, 0, 10, 2)
  igniteLight.position.set(0, 0.55, 2.1)
  scene.add(igniteLight)

  const portalLight = new THREE.PointLight(0x5ad8ff, 0, 50, 1.5)
  portalLight.position.set(0, 2.2, -8)
  scene.add(portalLight)

  const cityKey = new THREE.DirectionalLight(0x4eb0ff, 0)
  cityKey.position.set(10, 40, -30)
  scene.add(cityKey)

  // ——— Desk stage (close, dimensional) ———
  const desk = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 12),
    new THREE.MeshStandardMaterial({
      color: 0x0b1018,
      metalness: 0.92,
      roughness: 0.28,
    }),
  )
  desk.rotation.x = -Math.PI / 2
  desk.position.set(0, 0, 1.8)
  scene.add(desk)

  // Subtle desk panel / “laptop body” block for scale
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.12, 2.4),
    new THREE.MeshStandardMaterial({
      color: 0x121820,
      metalness: 0.95,
      roughness: 0.22,
    }),
  )
  chassis.position.set(0, 0.06, 2.05)
  scene.add(chassis)

  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 1.85, 0.08),
    new THREE.MeshStandardMaterial({
      color: 0x0a1018,
      metalness: 0.7,
      roughness: 0.35,
      emissive: 0x062030,
      emissiveIntensity: 0.2,
    }),
  )
  screen.position.set(0, 1.05, 0.95)
  screen.rotation.x = -0.18
  scene.add(screen)

  const screenGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.85, 1.55),
    new THREE.MeshBasicMaterial({
      color: 0x3ec8ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  screenGlow.position.set(0, 1.05, 1.0)
  screenGlow.rotation.x = -0.18
  scene.add(screenGlow)

  // Ignition disc on keyboard / desk surface
  const core = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: cyanTex,
      color: 0x9ce9ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  core.position.set(0, 0.2, 2.05)
  core.scale.set(0.8, 0.8, 1)
  scene.add(core)

  const coreRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.42, 0.018, 12, 64),
    new THREE.MeshBasicMaterial({
      color: 0x6ad8ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  coreRing.rotation.x = Math.PI / 2
  coreRing.position.set(0, 0.16, 2.05)
  scene.add(coreRing)

  // ——— Portal ———
  const portalGroup = new THREE.Group()
  portalGroup.position.set(0, 2.15, -7.5)
  scene.add(portalGroup)

  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x0a1824,
    emissive: 0x2ec4ff,
    emissiveIntensity: 0,
    metalness: 0.95,
    roughness: 0.18,
  })
  const torus = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.07, 20, 96), torusMat)
  portalGroup.add(torus)

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.012, 12, 96),
    new THREE.MeshBasicMaterial({
      color: 0x8ae0ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  portalGroup.add(outerRing)

  const portalDisc = new THREE.Mesh(
    new THREE.CircleGeometry(1.78, 64),
    new THREE.MeshBasicMaterial({
      color: 0x6fdfff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  )
  portalGroup.add(portalDisc)

  const portalSprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: cyanTex,
      color: 0x7fe9ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  portalSprite.scale.set(5.5, 5.5, 1)
  portalGroup.add(portalSprite)

  // Perspective floor grid beyond portal
  const grid = new THREE.GridHelper(70, 28, 0x3ec8ff, 0x123850)
  grid.position.set(0, 0.01, -36)
  const gridMats = Array.isArray(grid.material) ? grid.material : [grid.material]
  for (const m of gridMats) {
    const mat = m as THREE.LineBasicMaterial
    mat.transparent = true
    mat.opacity = 0
  }
  scene.add(grid)

  // ——— City ———
  const city = new THREE.Group()
  city.position.set(0, 0, -30)
  scene.add(city)

  const buildingCount = mobile ? 52 : 96
  const bGeo = new THREE.BoxGeometry(1, 1, 1)
  bGeo.translate(0, 0.5, 0)
  const bMat = new THREE.MeshStandardMaterial({
    color: 0x1a2430,
    metalness: 0.9,
    roughness: 0.24,
    emissive: 0x0a1828,
    emissiveIntensity: 0.85,
  })
  const buildings = new THREE.InstancedMesh(bGeo, bMat, buildingCount)
  const dummy = new THREE.Object3D()
  const facadeStrips: THREE.Mesh[] = []

  // Window light points (sparse, refined)
  const winCount = mobile ? 120 : 220
  const winPos = new Float32Array(winCount * 3)
  let wi = 0

  for (let i = 0; i < buildingCount; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const row = Math.floor(i / 2)
    const lane = 3.2 + seeded(i * 2.1) * 7.5
    const z = -row * 1.85 - seeded(i * 3.3) * 2.8
    const w = 1.15 + seeded(i * 1.7) * 2.4
    const d = 1.15 + seeded(i * 2.9) * 2.2
    const h = 7 + seeded(i * 4.2) * (mobile ? 22 : 34)
    dummy.position.set(side * lane + (seeded(i) - 0.5) * 0.6, 0, z)
    dummy.scale.set(w, h, d)
    dummy.rotation.y = (seeded(i * 8) - 0.5) * 0.06
    dummy.updateMatrix()
    buildings.setMatrixAt(i, dummy.matrix)

    // Vertical façade accent — architectural cyan light
    if (i % 2 === 0) {
      const strip = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.08, h * 0.92),
        new THREE.MeshBasicMaterial({
          color: 0x4ec8ff,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
      )
      strip.position.set(dummy.position.x - side * (w * 0.505), h * 0.48, dummy.position.z)
      // Face the avenue (toward world origin on X)
      strip.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2
      facadeStrips.push(strip)
      city.add(strip)
    }

    if (wi < winCount - 6) {
      for (let k = 0; k < 5; k++) {
        // Sit just outside the avenue-facing façade
        winPos[wi * 3] = dummy.position.x - side * (w * 0.52 + 0.04)
        winPos[wi * 3 + 1] = 1.4 + seeded(i + k * 3) * (h - 2.2)
        winPos[wi * 3 + 2] = dummy.position.z + (seeded(i * 9 + k) - 0.5) * d * 0.75
        wi++
      }
    }
  }
  buildings.instanceMatrix.needsUpdate = true
  city.add(buildings)

  const winGeo = new THREE.BufferGeometry()
  winGeo.setAttribute('position', new THREE.BufferAttribute(winPos.slice(0, wi * 3), 3))
  const windows = new THREE.Points(
    winGeo,
    new THREE.PointsMaterial({
      map: cyanTex,
      color: 0xb4f0ff,
      size: mobile ? 0.55 : 0.72,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  city.add(windows)

  const avenue = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 100),
    new THREE.MeshBasicMaterial({
      color: 0x1f78b8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  )
  avenue.rotation.x = -Math.PI / 2
  avenue.position.set(0, 0.03, -40)
  city.add(avenue)

  // Distant cyan horizon bloom — scale cue
  const horizonGlow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: cyanTex,
      color: 0x5ec8ff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  horizonGlow.position.set(0, 8, -88)
  horizonGlow.scale.set(90, 28, 1)
  city.add(horizonGlow)

  // Soft atmospheric sheets
  for (let i = 0; i < (mobile ? 3 : 4); i++) {
    const cloud = new THREE.Mesh(
      new THREE.PlaneGeometry(50 + i * 10, 14),
      new THREE.MeshBasicMaterial({
        color: 0x1a3558,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    )
    cloud.position.set((seeded(i + 3) - 0.5) * 16, 16 + i * 4, -55 - i * 14)
    cloud.rotation.x = -0.2
    cloud.userData.baseOpacity = 0.07 + i * 0.02
    city.add(cloud)
  }

  // Stars
  const starCount = mobile ? 160 : 280
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3] = (seeded(i * 1.3) - 0.5) * 140
    starPos[i * 3 + 1] = 10 + seeded(i * 2.1) * 60
    starPos[i * 3 + 2] = -25 - seeded(i * 3.9) * 110
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      map: cyanTex,
      color: 0xd8f0ff,
      size: 0.35,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  scene.add(stars)

  // ——— Golden spark helix ———
  const sparkCount = mobile ? 160 : 280
  const sparks: Spark[] = []
  const sparkPos = new Float32Array(sparkCount * 3)
  const sparkCol = new Float32Array(sparkCount * 3)
  const sparkGeo = new THREE.BufferGeometry()
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
  sparkGeo.setAttribute('color', new THREE.BufferAttribute(sparkCol, 3))
  const sparkMat = new THREE.PointsMaterial({
    map: goldTex,
    size: mobile ? 0.22 : 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const sparkPoints = new THREE.Points(sparkGeo, sparkMat)
  scene.add(sparkPoints)

  for (let i = 0; i < sparkCount; i++) {
    sparks.push({
      phase: seeded(i * 0.71) * Math.PI * 2,
      radius: 0.12 + seeded(i * 1.8) * 0.85,
      rise: seeded(i * 2.4),
      speed: 0.75 + seeded(i * 3.1) * 0.9,
      warmth: 0.5 + seeded(i * 4.4) * 0.5,
      delay: seeded(i * 5.5) * 0.35,
    })
  }

  const camPos = new THREE.Vector3()
  const look = new THREE.Vector3()

  const resize = (w: number, h: number) => {
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
    camera.aspect = w / Math.max(1, h)
    camera.updateProjectionMatrix()
  }

  const paint = (elapsedMs: number) => {
    const t = Math.min(INTRO_MS, Math.max(0, elapsedMs))

    const ignite = smooth(span(t, 20, 560))
    const spiral = smooth(span(t, 280, 1380))
    const portalOpen = smooth(span(t, 620, 1450))
    const plunge = easeInOut(span(t, 1380, 2520))
    const settle = smooth(span(t, 2480, INTRO_MS))
    const fadeOut = smooth(span(t, 2580, INTRO_MS))

    // Camera: close desk → lift to portal → dive city → ease
    let camX = 0
    let camY: number
    let camZ: number
    let lookY: number
    let lookZ: number
    let fov = 46

    if (t < 600) {
      const u = easeInOut(span(t, 0, 600))
      camY = lerp(1.55, 1.45, u)
      camZ = lerp(4.1, 3.2, u)
      lookY = lerp(0.55, 1.05, u)
      lookZ = lerp(1.7, 0.2, u)
      fov = lerp(40, 46, u)
      camX = Math.sin(u * Math.PI) * 0.1
    } else if (t < 1400) {
      const u = easeInOut(span(t, 600, 1400))
      camY = lerp(1.45, 2.15, u)
      camZ = lerp(3.2, -4.6, u)
      lookY = lerp(1.05, 2.15, u)
      lookZ = lerp(0.2, -7.5, u)
      fov = lerp(46, 50, u)
      camX = Math.sin(u * Math.PI) * 0.12
    } else if (t < 2500) {
      const u = easeInOut(span(t, 1400, 2500))
      camY = lerp(2.15, 3.4, u)
      camZ = lerp(-4.6, -44, u)
      lookY = lerp(2.15, 4.2, u)
      lookZ = lerp(-7.5, -70, u)
      fov = lerp(50, 58, u)
      camX = Math.sin(u * Math.PI * 0.5) * 0.28 * (1 - u)
    } else {
      const u = easeInOut(span(t, 2500, INTRO_MS))
      camY = lerp(3.4, 3.55, u)
      camZ = lerp(-44, -47, u)
      lookY = lerp(4.2, 4.35, u)
      lookZ = lerp(-70, -74, u)
      fov = lerp(58, 55, u)
      camX = 0
    }

    camPos.set(camX, camY, camZ)
    look.set(camX * 0.3, lookY, lookZ)
    camera.position.copy(camPos)
    camera.lookAt(look)
    camera.fov = fov
    camera.updateProjectionMatrix()

    // Ignition
    igniteLight.intensity = 12 * ignite * (1 - plunge * 0.9)
    ;(core.material as THREE.SpriteMaterial).opacity = 0.95 * ignite * (1 - portalOpen * 0.75)
    core.scale.setScalar(lerp(0.35, 1.6, ignite))
    ;(coreRing.material as THREE.MeshBasicMaterial).opacity = 0.85 * ignite * (1 - portalOpen * 0.8)
    coreRing.scale.setScalar(lerp(0.5, 1.4, ignite))
    ;(screenGlow.material as THREE.MeshBasicMaterial).opacity = 0.35 * ignite * (1 - plunge)

    // Portal
    torusMat.emissiveIntensity = 3.2 * portalOpen
    ;(outerRing.material as THREE.MeshBasicMaterial).opacity = 0.75 * portalOpen
    ;(portalDisc.material as THREE.MeshBasicMaterial).opacity =
      0.42 * portalOpen * (1 - plunge * 0.55)
    ;(portalSprite.material as THREE.SpriteMaterial).opacity = 0.55 * portalOpen * (1 - plunge * 0.4)
    portalGroup.scale.setScalar(lerp(0.2, 1, portalOpen))
    portalLight.intensity = 22 * portalOpen * (1 - settle * 0.35)
    portalGroup.rotation.z = 0.25 * portalOpen

    for (const m of gridMats) {
      ;(m as THREE.LineBasicMaterial).opacity = 0.4 * portalOpen * (0.35 + plunge * 0.65)
    }

    // City atmosphere
    const fog = scene.fog as THREE.FogExp2
    fog.density = lerp(0.038, 0.009, plunge)
    cityKey.intensity = 1.15 * plunge
    bMat.emissiveIntensity = 0.55 + 0.9 * plunge
    ;(windows.material as THREE.PointsMaterial).opacity = 0.95 * plunge
    ;(avenue.material as THREE.MeshBasicMaterial).opacity = 0.28 * plunge
    ;(stars.material as THREE.PointsMaterial).opacity = 0.8 * plunge
    ;(horizonGlow.material as THREE.SpriteMaterial).opacity = 0.45 * plunge
    for (const strip of facadeStrips) {
      ;(strip.material as THREE.MeshBasicMaterial).opacity = 0.14 + 0.36 * plunge
    }
    city.traverse((obj) => {
      if (obj.userData.baseOpacity != null) {
        ;((obj as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity =
          obj.userData.baseOpacity * plunge
      }
    })

    // Sparks: gather on desk → helix toward portal → stream into city
    sparkMat.opacity = Math.min(1, ignite * 1.2) * (1 - settle * 0.85)
    sparkMat.size = (mobile ? 0.2 : 0.26) * (0.85 + ignite * 0.4)

    for (let i = 0; i < sparkCount; i++) {
      const s = sparks[i]
      // progress along helix path 0→1
      const local = clamp01((spiral - s.delay) / Math.max(0.001, 1 - s.delay * 0.5))
      const gather = clamp01(ignite * (0.4 + s.rise * 0.6) - s.delay * 0.5)
      const prog = Math.max(gather * 0.15, local) * (0.55 + 0.45 * spiral)

      const twists = 2.4
      const ang = s.phase + prog * Math.PI * 2 * twists * s.speed
      const rad = lerp(0.05, s.radius, clamp01(prog * 1.4)) * lerp(1, 1.35, spiral)

      // Path from desk (0,0.2,2.05) → portal (0,2.15,-7.5) → city avenue
      const path = clamp01(prog * (0.55 + spiral * 0.55) + plunge * (0.35 + s.rise * 0.4))
      const baseY = lerp(0.2, 2.15, easeInOut(clamp01(path / 0.55)))
      const baseZ = lerp(2.05, -7.5, easeInOut(clamp01(path / 0.55)))
      const cityY = lerp(2.15, 1.5 + s.rise * 8, clamp01((path - 0.55) / 0.45))
      const cityZ = lerp(-7.5, -20 - s.rise * 40, clamp01((path - 0.55) / 0.45))
      const inCity = path > 0.55

      const y = inCity ? cityY : baseY + Math.sin(prog * Math.PI) * 0.15
      const z = inCity ? cityZ : baseZ
      const x = Math.cos(ang) * rad * (inCity ? 1.6 : 1) + (inCity ? (seeded(i) - 0.5) * 1.2 : 0)

      sparkPos[i * 3] = x
      sparkPos[i * 3 + 1] = y
      sparkPos[i * 3 + 2] = z

      const cool = plunge * 0.25
      sparkCol[i * 3] = lerp(1.0, 0.65, cool)
      sparkCol[i * 3 + 1] = lerp(0.55 + s.warmth * 0.28, 0.85, cool)
      sparkCol[i * 3 + 2] = lerp(0.14, 0.95, cool)
    }
    sparkGeo.attributes.position.needsUpdate = true
    sparkGeo.attributes.color.needsUpdate = true

    renderer.toneMappingExposure = lerp(0.9, 1.2, ignite) * lerp(1, 0.7, fadeOut)
    renderer.render(scene, camera)
    return 1 - fadeOut
  }

  const dispose = () => {
    goldTex.dispose()
    cyanTex.dispose()
    renderer.dispose()
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (mesh.geometry) mesh.geometry.dispose()
      const mat = mesh.material
      if (!mat) return
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose())
      else mat.dispose()
    })
  }

  return { resize, paint, dispose }
}
