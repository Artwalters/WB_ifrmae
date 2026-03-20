// THREE.js layer module for 3D models and image planes

import type { Map } from 'mapbox-gl';

import { resourceManager } from './resourceManager.js';
import { state } from './state.js';

// Global declarations for THREE.js
declare global {
  interface Window {
    THREE: typeof import('three');
    mapboxgl: typeof import('mapbox-gl');
  }
}

// Use THREE from global window
const { THREE } = window;
const { mapboxgl } = window;

interface ModelConfig {
  id: string;
  origin: [number, number]; // [lat, lng]
  altitude: number;
  rotate: [number, number, number];
  url: string;
  scale: number;
  materials?: {
    [materialName: string]: string; // material name -> hex color
  };
  textures?: {
    [materialName: string]: string; // material name -> texture URL
  };
}

interface ImagePlaneConfig {
  id: string;
  origin: [number, number];
  altitude: number;
  rotate: [number, number, number];
  imageUrl: string;
  width: number;
  height: number;
}

interface Transform {
  translateX: number;
  translateY: number;
  translateZ: number;
  rotate: [number, number, number];
  scale: number;
}

// 3D model configurations - Woonboulevard modellen
const modelConfigs: ModelConfig[] = [
  {
    id: 'woonboulevard',
    origin: [50.898577, 5.948917],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/plein3_logomap.glb',
    scale: 0.235,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      parking: '#dddfe0',
      WB_Blue: '#0066CC',
      fiber: '#8B4513',
      weg: '#abb6ca',
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'ikea',
    origin: [50.90036, 5.944277],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf_V3@main/Ikea.glb',
    scale: 0.35,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      ikea_blue: '#0058AB',
      ikea_yellow: '#FBD914',
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'pilaar_wb',
    origin: [50.89897839003615, 5.942878450522976],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/Paal.glb',
    scale: 0.8,
    materials: {
      ikea_blue: '#0058AB',
      ikea_yellow: '#FBD914',
      'Material.009': '#8C8C8C',
      'Material.008': '#961e15', // Feller rood
      'Material.002': '#FFFFFF',
    },
  },
  {
    id: 'wbbuilding2',
    origin: [50.900156, 5.942504],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/Keuken_logomapv4.glb',
    scale: 0.35,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'carpet_WB',
    origin: [50.900573, 5.941485],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/haco_logomapv3.glb',
    scale: 0.35,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'goosens_WB',
    origin: [50.901362, 5.941023],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/goossens_logomapv3.glb',
    scale: 0.33,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'sanders_WB',
    origin: [50.901511, 5.94041],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/sanders_logomapv2.glb',
    scale: 0.34,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'bijstox',
    origin: [50.898831, 5.947769],
    altitude: 0,
    rotate: [Math.PI / 2, 6.25, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/Bijstox_logomapv2.glb',
    scale: 0.2,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'subway',
    origin: [50.900655, 5.940551],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://heerlen-doen.b-cdn.net/models_draco_logomap/subway_logomap.glb',
    scale: 0.33,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
    },
    textures: {
      branding:
        'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf@main/logoWBV5.png',
    },
  },
  {
    id: 'kfc',
    origin: [50.89855, 5.942557],
    altitude: 0,
    rotate: [Math.PI / 2, 5.76, 0],
    url: 'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf_V3@main/KFC.glb',
    scale: 0.18,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      grey: '#8C8C8C',
      ijzerpanels: '#A8A8A8', // Licht grijs (iets donkerder)
      ijzer: '#606060', // Donker grijs (iets lichter)
      wb_rood: '#DC2626', // Feller rood
    },
  },
  {
    id: 'gtb',
    origin: [50.898755, 5.942108],
    altitude: 0,
    rotate: [Math.PI / 2, 5.65, 0],
    url: 'https://cdn.jsdelivr.net/gh/Artwalters/woonboulevard_buildings_gltf_V3@main/gtb.glb',
    scale: 0.2625,
    materials: {
      base: '#ece6d7',
      ramen: '#dae9f7',
      opening: '#ffffff',
      ijzer: '#b1b1b1',
    },
  },
];

// Image plane configuration
const imagePlaneConfig: ImagePlaneConfig = {
  id: 'image1',
  origin: [50.88801513786042, 5.980644311376565],
  altitude: 6.5,
  rotate: [Math.PI / 2, 0.35, 0],
  imageUrl:
    'https://daks2k3a4ib2z.cloudfront.net/671769e099775386585f574d/67adf2bff5be8a200ec2fa55_osgameos_mural-p-130x130q80.png',
  width: 13,
  height: 13,
};

// Pending sign meshes waiting for CMS data
const pendingSigns: Array<{ mesh: any; bordId: string }> = [];

/**
 * Look up a store's logo_wb URL from CMS data by sign_bord ID
 */
function getLogoByBordId(bordId: string): { logoUrl: string | null; storeName: string | null } {
  const feature = state.mapLocations.features.find(
    (f: any) => {
      const bords = (f.properties.sign_bord || '').split(',').map((s: string) => s.trim());
      return bords.includes(bordId);
    }
  );
  if (!feature) return { logoUrl: null, storeName: null };
  return {
    logoUrl: feature.properties?.logo_wb || null,
    storeName: feature.properties?.name || null,
  };
}

/**
 * Load a logo onto a white canvas background and apply as material
 */
function applyLogoWithWhiteBackground(mesh: any, logoUrl: string): void {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 256);

    // Draw logo centered and fitted
    const scale = Math.min(512 / img.width, 256 / img.height) * 1.15;
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (512 - w) / 2, (256 - h) / 2, w, h);

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    mesh.material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
  };
  img.src = logoUrl;
}

/**
 * Apply sign textures to all pending sign meshes
 * Called after CMS data is loaded
 */
function applySignTextures(): void {
  pendingSigns.forEach(({ mesh, bordId }) => {
    const { logoUrl, storeName } = getLogoByBordId(bordId);

    if (logoUrl) {
      applyLogoWithWhiteBackground(mesh, logoUrl);
    } else {
      mesh.material = createPlaceholderMaterial(bordId);
    }
  });
}

/**
 * Create a placeholder material with a label for unmapped signs
 */
function createPlaceholderMaterial(label: string): THREE.MeshBasicMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#e0e0e0';
  ctx.fillRect(0, 0, 512, 256);

  // Border
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 504, 248);

  // Text
  ctx.fillStyle = '#333';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false;
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Create image plane for THREE.js
 * @param config - Image plane configuration
 * @return Promise that resolves to the image plane mesh
 */
function createImagePlane(config: ImagePlaneConfig): Promise<THREE.Mesh> {
  // Convert coordinates
  const mercatorCoord = mapboxgl.MercatorCoordinate.fromLngLat(
    [config.origin[1], config.origin[0]],
    config.altitude
  );

  // Calculate scale
  const meterScale = mercatorCoord.meterInMercatorCoordinateUnits();
  const geoWidth = config.width * meterScale;
  const geoHeight = config.height * meterScale;

  return resourceManager.loadOptimizedImage(config.imageUrl, { maxSize: 1024 }).then((image) => {
    // Create texture from optimized image
    const texture = new THREE.Texture(image);
    texture.needsUpdate = true;
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    // Create material
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
    });

    // Create geometry
    const geometry = new THREE.PlaneGeometry(geoWidth, geoHeight);
    const plane = new THREE.Mesh(geometry, material);

    // Store transform data
    plane.userData.transform = {
      translateX: mercatorCoord.x,
      translateY: mercatorCoord.y,
      translateZ: mercatorCoord.z,
      rotate: config.rotate,
      scale: 1,
    } as Transform;

    return plane;
  });
}

interface CustomLayer {
  id: string;
  type: 'custom';
  renderingMode: '3d';
  map?: Map;
  scene?: THREE.Scene;
  camera?: THREE.Camera;
  renderer?: THREE.WebGLRenderer;
  onAdd: (map: Map, gl: WebGLRenderingContext) => void;
  render: (gl: WebGLRenderingContext, matrix: number[]) => void;
}

/**
 * Create custom THREE.js layer
 * @return Custom layer object for Mapbox
 */
export function createThreeJSLayer(): CustomLayer {
  return {
    id: '3d-models',
    type: 'custom',
    renderingMode: '3d',

    onAdd: function (map: Map, gl: WebGLRenderingContext) {
      this.map = map;
      this.scene = new THREE.Scene();
      this.camera = new THREE.Camera();

      // Setup lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.57);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.55);
      directionalLight.color.setHex(0xfcfcfc);

      // Position light
      const azimuth = 210 * (Math.PI / 180);
      const polar = 50 * (Math.PI / 180);
      directionalLight.position
        .set(
          Math.sin(azimuth) * Math.sin(polar),
          Math.cos(azimuth) * Math.sin(polar),
          Math.cos(polar)
        )
        .normalize();
      this.scene.add(directionalLight);

      // Setup renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: map.getCanvas(),
        context: gl,
        antialias: true,
      });
      this.renderer.autoClear = false;

      // Load 3D models
      const loader = new (THREE as any).GLTFLoader();

      // Setup Draco loader for compressed models (if available)
      if ((THREE as any).DRACOLoader) {
        const dracoLoader = new (THREE as any).DRACOLoader();
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.126.0/examples/js/libs/draco/');
        loader.setDRACOLoader(dracoLoader);
      }

      modelConfigs.forEach((config) => {
        // Convert coordinates
        const mercCoord = mapboxgl.MercatorCoordinate.fromLngLat(
          [config.origin[1], config.origin[0]],
          config.altitude
        );

        // Load model using resource manager
        resourceManager
          .loadModel(config.url, loader)
          .then((gltf: any) => {
            const scene3D = gltf.scene;

            // Apply flat shading and custom colors to all meshes
            scene3D.traverse((child: any) => {
              if (child.isMesh) {
                // Detect sign materials (prefix "sign_")
                const matName = child.material?.name || '';
                const baseMatName = matName.split('.')[0];
                if (baseMatName.startsWith('sign_')) {
                  const bordId = baseMatName.replace('sign_', '');
                  const { logoUrl, storeName } = getLogoByBordId(bordId);

                  if (logoUrl) {
                    applyLogoWithWhiteBackground(child, logoUrl);
                  } else {
                    // Store for retry and show placeholder
                    pendingSigns.push({ mesh: child, bordId });
                    const label = storeName
                      ? `${storeName} (no logo)`
                      : `${bordId}`;
                    child.material = createPlaceholderMaterial(label);
                  }
                  return;
                }

                // Apply custom material colors if defined (but preserve textures)
                if (config.materials && child.material.name) {
                  // Try exact match first, then try basename
                  let materialColor = config.materials[child.material.name];
                  let matchType = 'exact';
                  const baseMaterialName = child.material.name.split('.')[0];

                  if (!materialColor) {
                    // Strip Blender suffix (e.g., "ramen.004" -> "ramen")
                    materialColor = config.materials[baseMaterialName];
                    matchType = 'basename';
                  }

                  // Check for custom texture
                  let textureUrl = config.textures?.[child.material.name];
                  if (!textureUrl && config.textures) {
                    textureUrl = config.textures[baseMaterialName];
                  }

                  // Convert windows to glossy material with blue tint
                  // Check for 'ramen' material name OR 'WINDOW' marker in materials config
                  const isWindowMaterial =
                    baseMaterialName === 'ramen' || materialColor === 'WINDOW';
                  if (isWindowMaterial) {
                    // Create new MeshPhysicalMaterial for frosted glass effect
                    const glassMaterial = new THREE.MeshPhysicalMaterial({
                      color: '#9eb8c9', // Meer grijsblauw
                      emissive: '#6b8fa3', // Grijsblauw gloei effect
                      emissiveIntensity: 0.7, // Tussen sterkte
                      transparent: false, // Transparantie aan
                      opacity: 0.9, // Minder transparant
                      metalness: 0.4, // Minimale metalness
                      roughness: 0.9, // Hoge roughness voor frosted effect
                      transmission: 0.5, // Licht transmissie voor glas effect
                      // thickness: 0.5, // Removed - not supported in this THREE version
                      side: THREE.DoubleSide, // Render both sides to fix normal issues
                    });
                    child.material = glassMaterial;
                  } else if (textureUrl) {
                    // Load and apply custom texture
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load(
                      textureUrl,
                      (texture) => {
                        // Flip texture on Y-axis (common fix for GLB models)
                        texture.flipY = false;
                        // Set texture wrapping
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        // Set base color to white so texture is visible
                        child.material.color.set(0xffffff);
                        // Apply texture
                        child.material.map = texture;
                        // Remove emissive if present
                        if (child.material.emissive) {
                          child.material.emissive.set(0x000000);
                        }
                        child.material.needsUpdate = true;
                      },
                      undefined,
                      (error) => {
                        console.error(
                          `Error loading texture ${textureUrl} for ${child.material.name}:`,
                          error
                        );
                      }
                    );
                    child.material.flatShading = true;
                  } else if (materialColor) {
                    // Apply flat shading only to non-window materials
                    child.material.flatShading = true;
                    // Only apply color if there's no texture map (preserve PNG images)
                    if (!child.material.map) {
                      child.material.color.setStyle(materialColor);
                    }
                  }
                } else {
                  // Apply flat shading to materials without custom colors
                  child.material.flatShading = true;
                }

                child.material.needsUpdate = true;
              }
            });

            // Store transform data
            scene3D.userData.transform = {
              translateX: mercCoord.x,
              translateY: mercCoord.y,
              translateZ: mercCoord.z,
              rotate: config.rotate,
              scale: mercCoord.meterInMercatorCoordinateUnits() * config.scale,
            } as Transform;

            this.scene!.add(scene3D);
          })
          .catch(() => {});
      });

      // Load image plane
      createImagePlane(imagePlaneConfig)
        .then((plane) => {
          this.scene!.add(plane);
        })
        .catch(() => {});
    },

    render: function (gl: WebGLRenderingContext, matrix: number[]) {
      // Get Mapbox matrix
      const mapMatrix = new THREE.Matrix4().fromArray(matrix);

      // Apply transforms to each object (skip lights)
      this.scene!.traverse((child) => {
        // Skip lights - they should stay in world space
        if (child instanceof THREE.Light) {
          return;
        }

        if (child.userData.transform) {
          const t = child.userData.transform as Transform;

          // Create transform matrices
          const translation = new THREE.Matrix4().makeTranslation(
            t.translateX,
            t.translateY,
            t.translateZ
          );
          const scaling = new THREE.Matrix4().makeScale(t.scale, -t.scale, t.scale);
          const rotX = new THREE.Matrix4().makeRotationX(t.rotate[0]);
          const rotY = new THREE.Matrix4().makeRotationY(t.rotate[1]);
          const rotZ = new THREE.Matrix4().makeRotationZ(t.rotate[2]);

          // Combine transforms
          const modelMatrix = new THREE.Matrix4()
            .multiply(translation)
            .multiply(scaling)
            .multiply(rotX)
            .multiply(rotY)
            .multiply(rotZ);

          // Apply transformation
          child.matrix = new THREE.Matrix4().copy(mapMatrix).multiply(modelMatrix);
          child.matrixAutoUpdate = false;
        }
      });

      // Render scene
      this.renderer!.resetState();
      this.renderer!.render(this.scene!, this.camera!);
    },
  };
}

/**
 * Setup THREE.js layer on map
 * @param map - The mapbox map instance
 */
export { applySignTextures };

export function setupThreeJSLayer(map: Map): void {
  // Add THREE.js layer when map style is loaded
  map.on('style.load', () => {
    const customLayer = createThreeJSLayer();
    map.addLayer(customLayer);

    // Apply sign textures once map is idle (models + CMS data loaded)
    map.once('idle', () => {
      applySignTextures();
    });
  });
}

/**
 * Add coordinate helper to map
 * Click anywhere on the map to see lat/lng coordinates in bottom-right corner
 * @param map - The mapbox map instance
 */
export function addCoordinateHelper(map: Map): void {
  // Create display element
  const coordDisplay = document.createElement('div');
  coordDisplay.id = 'coord-helper';
  coordDisplay.style.cssText = `
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px 15px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    z-index: 1000;
    pointer-events: none;
    display: none;
  `;
  document.body.appendChild(coordDisplay);

  // Store the current marker
  let currentMarker: mapboxgl.Marker | null = null;

  // Add click handler
  map.on('click', (e) => {
    const { lng, lat } = e.lngLat;
    const coordText = `[${lat.toFixed(6)}, ${lng.toFixed(6)}]`;

    // Remove previous marker if it exists
    if (currentMarker) {
      currentMarker.remove();
    }

    // Create red dot marker
    const markerElement = document.createElement('div');
    markerElement.style.cssText = `
      width: 12px;
      height: 12px;
      background-color: #ff0000;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;

    // Add marker to map
    currentMarker = new mapboxgl.Marker({ element: markerElement })
      .setLngLat([lng, lat])
      .addTo(map);

    // Copy to clipboard
    navigator.clipboard
      .writeText(coordText)
      .then(() => {
        coordDisplay.innerHTML = `
        <div style="margin-bottom: 5px;"><strong>Coordinates:</strong></div>
        <div>Lat: ${lat.toFixed(6)}</div>
        <div>Lng: ${lng.toFixed(6)}</div>
        <div style="margin-top: 5px; color: #4CAF50;">${coordText}</div>
        <div style="margin-top: 5px; color: #FFD700; font-size: 11px;">✓ Copied to clipboard!</div>
      `;
      })
      .catch(() => {
        coordDisplay.innerHTML = `
        <div style="margin-bottom: 5px;"><strong>Coordinates:</strong></div>
        <div>Lat: ${lat.toFixed(6)}</div>
        <div>Lng: ${lng.toFixed(6)}</div>
        <div style="margin-top: 5px; color: #4CAF50;">${coordText}</div>
      `;
      });

    coordDisplay.style.display = 'block';
  });
}
