import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3d, Sparkles, CheckCircle2, Shield, Eye } from 'lucide-react';

export type EquipmentModelId = 'bumper-plate' | 'barbell' | 'dumbbells' | 'kettlebell';

interface Equipment3DViewerProps {
  activeId: EquipmentModelId;
  className?: string;
  onHotspotClick?: (title: string, detail: string) => void;
}

interface Hotspot {
  title: string;
  description: string;
  position: { x: number; y: number; z: number };
}

export const Equipment3DViewer: React.FC<Equipment3DViewerProps> = ({
  activeId,
  className = '',
  onHotspotClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  // Hotspots definitions per model
  const hotspotsMap: Record<EquipmentModelId, Hotspot[]> = {
    'bumper-plate': [
      {
        title: '50.4mm Solid Brass Center Bushing',
        description: 'Precision-machined brass core prevents sleeve friction, plate wobble, and bar damage.',
        position: { x: 0, y: 0, z: 12 },
      },
      {
        title: '88A Durometer Virgin Rubber',
        description: 'High-density formulation absorbs shock with near-zero dead-bounce and low acoustic noise.',
        position: { x: 38, y: 38, z: 8 },
      },
      {
        title: '±10g Tournament Calibration',
        description: 'Individually weight-checked to meet international competition tolerances.',
        position: { x: -38, y: -38, z: 8 },
      },
    ],
    barbell: [
      {
        title: '215,000 PSI High-Tensile Alloy',
        description: 'Engineered for optimal dynamic whip during explosive lifts with zero permanent bending.',
        position: { x: 0, y: 0, z: 0 },
      },
      {
        title: '4 Needle Bearings + Oil-Lite Bushing',
        description: 'Ultra-smooth sleeve spin isolates dynamic torque from wrists and shoulders.',
        position: { x: 75, y: 8, z: 0 },
      },
      {
        title: '1.2mm Volcano Diamond Knurling',
        description: 'Aggressive yet comfortable tactile grip without tearing palms under heavy deadlifts.',
        position: { x: -35, y: 0, z: 0 },
      },
    ],
    dumbbells: [
      {
        title: 'Ergonomic Contoured Chrome Grip',
        description: 'Thicker center contour matches anatomical palm arch for superior grip endurance.',
        position: { x: 0, y: 0, z: 0 },
      },
      {
        title: 'Anti-Roll Hexagonal Geometry',
        description: '6-sided faceted heads prevent floor rolling and allow safe dumbbell push-up floor work.',
        position: { x: 42, y: 15, z: 0 },
      },
      {
        title: 'Friction-Welded Core Bond',
        description: 'Solid steel handle is mechanically friction-welded into cast iron heads before vulcanization.',
        position: { x: -42, y: -15, z: 0 },
      },
    ],
    kettlebell: [
      {
        title: 'Seamless Gravity Cast Iron',
        description: 'Single-piece cast construction eliminates seam welds for smooth transition during cleans.',
        position: { x: 0, y: -10, z: 15 },
      },
      {
        title: 'Competition 35mm Handle',
        description: 'Uniform handle diameter allows consistent chalk retention and prevents premature forearm pump.',
        position: { x: 0, y: 38, z: 0 },
      },
      {
        title: 'Machined Flat Base',
        description: 'Engineered flat bottom provides absolute stability for kettlebell renegade rows and push-ups.',
        position: { x: 0, y: -45, z: 0 },
      },
    ],
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 180);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);
    } catch {
      return;
    }

    // 2. Studio 3-Point Lighting
    const ambientLight = new THREE.AmbientLight(0x2d2d35, 1.2);
    scene.add(ambientLight);

    // Warm Gold Key Light
    const keyLight = new THREE.DirectionalLight(0xfff0d0, 2.4);
    keyLight.position.set(90, 120, 100);
    scene.add(keyLight);

    // Cool Rim Light (Emphasizes silhouette & knurling)
    const rimLight = new THREE.DirectionalLight(0x818cf8, 1.8);
    rimLight.position.set(-110, -60, -80);
    scene.add(rimLight);

    // Warm Aurum Accent Light
    const accentLight = new THREE.PointLight(0xffc21a, 2.0, 300);
    accentLight.position.set(0, -50, 80);
    scene.add(accentLight);

    // 3. Model Parent Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Helper: Texture Generator for Bumper Plate Face
    const createPlateFaceTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      // Dark Vulcanized Rubber Base
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, 1024, 1024);

      // Radial Grooves
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(512, 512, 450, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#212124';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(512, 512, 380, 0, Math.PI * 2);
      ctx.stroke();

      // Embossed Circular Text
      ctx.save();
      ctx.translate(512, 512);

      // Top Text: RV FITNESS • OLYMPIC
      ctx.font = 'bold 44px "Inter", sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '12px';
      ctx.fillText('RV FITNESS  •  OLYMPIC', 0, -380);

      // Bottom Text: CALIBRATED • 20 KG
      ctx.font = '900 54px "Inter", sans-serif';
      ctx.fillStyle = '#FFC21A';
      ctx.fillText('CALIBRATED  •  20 KG', 0, 410);

      ctx.restore();

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 8;
      return texture;
    };

    // Helper: Texture Generator for Barbell Knurling
    const createKnurlTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#888888';
      ctx.fillRect(0, 0, 128, 128);

      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      for (let i = -128; i < 256; i += 8) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 128, 128);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + 128, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 24);
      return texture;
    };

    // 4. Build Specific Procedural 3D Models
    const plateFaceTex = createPlateFaceTexture();
    const knurlTex = createKnurlTexture();

    const buildModel = () => {
      // Clear previous children
      while (modelGroup.children.length > 0) {
        const obj = modelGroup.children[0] as THREE.Mesh;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
        modelGroup.remove(obj);
      }

      if (activeId === 'bumper-plate') {
        // A. CALIBRATED 20 KG BUMPER PLATE
        const rubberMaterial = new THREE.MeshStandardMaterial({
          color: 0x1a1a1d,
          roughness: 0.65,
          metalness: 0.15,
        });

        const faceMaterial = new THREE.MeshStandardMaterial({
          map: plateFaceTex,
          roughness: 0.55,
          metalness: 0.2,
        });

        const brassMaterial = new THREE.MeshStandardMaterial({
          color: 0xd4af37,
          roughness: 0.25,
          metalness: 0.95,
        });

        const steelHubMaterial = new THREE.MeshStandardMaterial({
          color: 0x222226,
          roughness: 0.35,
          metalness: 0.85,
        });

        // Outer Tire Cylinder
        const outerPlateGeom = new THREE.CylinderGeometry(56, 56, 12, 64);
        const outerMesh = new THREE.Mesh(outerPlateGeom, [
          rubberMaterial, // side rim
          faceMaterial,   // top face
          faceMaterial,   // bottom face
        ]);
        outerMesh.rotation.x = Math.PI / 2;
        modelGroup.add(outerMesh);

        // Raised outer bevel ring
        const outerRingGeom = new THREE.TorusGeometry(55, 2.5, 16, 64);
        const outerRing = new THREE.Mesh(outerRingGeom, rubberMaterial);
        modelGroup.add(outerRing);

        // Center Cast Iron Hub
        const hubGeom = new THREE.CylinderGeometry(20, 20, 13.5, 48);
        const hubMesh = new THREE.Mesh(hubGeom, steelHubMaterial);
        hubMesh.rotation.x = Math.PI / 2;
        modelGroup.add(hubMesh);

        // Solid Brass 50.4mm Bushing Insert
        const brassGeom = new THREE.CylinderGeometry(11, 11, 14.5, 48);
        const brassMesh = new THREE.Mesh(brassGeom, brassMaterial);
        brassMesh.rotation.x = Math.PI / 2;
        modelGroup.add(brassMesh);

        // Olympic Sleeve Bore Hole (Dark interior cylinder)
        const boreGeom = new THREE.CylinderGeometry(7, 7, 15, 32);
        const boreMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
        const boreMesh = new THREE.Mesh(boreGeom, boreMat);
        boreMesh.rotation.x = Math.PI / 2;
        modelGroup.add(boreMesh);

        modelGroup.scale.set(1.15, 1.15, 1.15);
      } else if (activeId === 'barbell') {
        // B. COMPETITION OLYMPIC BARBELL
        const chromeMaterial = new THREE.MeshStandardMaterial({
          color: 0xd1d5db,
          roughness: 0.2,
          metalness: 0.95,
        });

        const knurlMaterial = new THREE.MeshStandardMaterial({
          color: 0x9ca3af,
          bumpMap: knurlTex,
          bumpScale: 0.08,
          roughness: 0.45,
          metalness: 0.85,
        });

        const goldRingMaterial = new THREE.MeshStandardMaterial({
          color: 0xffc21a,
          roughness: 0.3,
          metalness: 0.9,
        });

        // Central Steel Shaft (28.5mm, 130 units long)
        const shaftGeom = new THREE.CylinderGeometry(3, 3, 130, 32);
        const shaft = new THREE.Mesh(shaftGeom, knurlMaterial);
        shaft.rotation.z = Math.PI / 2;
        modelGroup.add(shaft);

        // Center knurl smooth center spacer
        const centerSmoothGeom = new THREE.CylinderGeometry(3.05, 3.05, 20, 32);
        const centerSmooth = new THREE.Mesh(centerSmoothGeom, chromeMaterial);
        centerSmooth.rotation.z = Math.PI / 2;
        modelGroup.add(centerSmooth);

        // Dual Rotating Sleeves (Left & Right)
        [-76, 76].forEach((xPos) => {
          // Inner Gold Collar Ring
          const collarGeom = new THREE.CylinderGeometry(7.5, 7.5, 4.5, 32);
          const collar = new THREE.Mesh(collarGeom, goldRingMaterial);
          collar.rotation.z = Math.PI / 2;
          collar.position.x = xPos > 0 ? 66 : -66;
          modelGroup.add(collar);

          // 50mm Olympic Loading Sleeve
          const sleeveGeom = new THREE.CylinderGeometry(5.8, 5.8, 48, 32);
          const sleeve = new THREE.Mesh(sleeveGeom, chromeMaterial);
          sleeve.rotation.z = Math.PI / 2;
          sleeve.position.x = xPos > 0 ? 91 : -91;
          modelGroup.add(sleeve);

          // End cap with gold logo
          const capGeom = new THREE.CylinderGeometry(5.8, 5.8, 1, 32);
          const cap = new THREE.Mesh(capGeom, goldRingMaterial);
          cap.rotation.z = Math.PI / 2;
          cap.position.x = xPos > 0 ? 115.5 : -115.5;
          modelGroup.add(cap);
        });

        modelGroup.scale.set(0.9, 0.9, 0.9);
      } else if (activeId === 'dumbbells') {
        // C. COMMERCIAL HEX DUMBBELL (PAIR / HERO ANGLE)
        const rubberHexMaterial = new THREE.MeshStandardMaterial({
          color: 0x17171a,
          roughness: 0.7,
          metalness: 0.15,
        });

        const handleChrome = new THREE.MeshStandardMaterial({
          color: 0xe5e7eb,
          bumpMap: knurlTex,
          bumpScale: 0.05,
          roughness: 0.25,
          metalness: 0.95,
        });

        const goldNumberMat = new THREE.MeshStandardMaterial({
          color: 0xffc21a,
          roughness: 0.35,
          metalness: 0.8,
        });

        // Contoured Grip Handle (curved barrel cylinder)
        const handleGeom = new THREE.CylinderGeometry(3.6, 4.2, 42, 32);
        const handle = new THREE.Mesh(handleGeom, handleChrome);
        handle.rotation.z = Math.PI / 2;
        modelGroup.add(handle);

        // Dual 6-Sided Hex Heads
        [-28, 28].forEach((xPos) => {
          // Hexagon prism geometry: 6 segments
          const hexGeom = new THREE.CylinderGeometry(20, 20, 16, 6);
          const hexHead = new THREE.Mesh(hexGeom, rubberHexMaterial);
          hexHead.rotation.z = Math.PI / 2;
          hexHead.rotation.y = Math.PI / 6; // align flat side
          hexHead.position.x = xPos;
          modelGroup.add(hexHead);

          // Embossed Gold Weight Plate Badge on outer facet
          const badgeGeom = new THREE.CylinderGeometry(7, 7, 0.8, 24);
          const badge = new THREE.Mesh(badgeGeom, goldNumberMat);
          badge.rotation.z = Math.PI / 2;
          badge.position.x = xPos > 0 ? xPos + 8.4 : xPos - 8.4;
          modelGroup.add(badge);
        });

        modelGroup.scale.set(1.1, 1.1, 1.1);
      } else if (activeId === 'kettlebell') {
        // D. COMPETITION CAST IRON KETTLEBELL
        const castIronMat = new THREE.MeshStandardMaterial({
          color: 0x1c1c1f,
          roughness: 0.8,
          metalness: 0.25,
        });

        const colorStripeMat = new THREE.MeshStandardMaterial({
          color: 0xffc21a,
          roughness: 0.4,
          metalness: 0.5,
        });

        // Spherical Cast Body
        const bodyGeom = new THREE.SphereGeometry(32, 48, 36);
        const body = new THREE.Mesh(bodyGeom, castIronMat);
        body.position.y = -8;
        modelGroup.add(body);

        // Machined Flat Stability Base (cylinder at bottom)
        const baseGeom = new THREE.CylinderGeometry(18, 18, 5, 32);
        const baseMesh = new THREE.Mesh(baseGeom, castIronMat);
        baseMesh.position.y = -38;
        modelGroup.add(baseMesh);

        // Ergonomic Horn Handle (Torus top arch)
        const handleArchGeom = new THREE.TorusGeometry(18, 4.2, 24, 48, Math.PI);
        const handleArch = new THREE.Mesh(handleArchGeom, castIronMat);
        handleArch.position.y = 23;
        modelGroup.add(handleArch);

        // Left Vertical Handle Stems
        [-18, 18].forEach((xPos) => {
          const stemGeom = new THREE.CylinderGeometry(4.2, 4.2, 16, 24);
          const stem = new THREE.Mesh(stemGeom, castIronMat);
          stem.position.set(xPos, 15, 0);
          modelGroup.add(stem);

          // Competition Color ID Stripe
          const stripeGeom = new THREE.CylinderGeometry(4.35, 4.35, 4, 24);
          const stripe = new THREE.Mesh(stripeGeom, colorStripeMat);
          stripe.position.set(xPos, 12, 0);
          modelGroup.add(stripe);
        });

        modelGroup.scale.set(1.05, 1.05, 1.05);
      }
    };

    buildModel();

    // 5. Interactive Orbit & Drag Tracking
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotVelocityX = 0;
    let rotVelocityY = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      setIsInteracting(true);
      prevMouseX = clientX;
      prevMouseY = clientY;
      clearTimeout(idleTimer);
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;

      rotVelocityY = deltaX * 0.007;
      rotVelocityX = deltaY * 0.005;

      modelGroup.rotation.y += rotVelocityY;
      modelGroup.rotation.x = Math.max(-0.6, Math.min(0.6, modelGroup.rotation.x + rotVelocityX));

      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
      idleTimer = setTimeout(() => {
        setIsInteracting(false);
      }, 1600);
    };

    // Mouse event bindings
    const handleMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const handleMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const handleMouseUp = () => onPointerUp();

    // Touch event bindings
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => onPointerUp();

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // 6. Viewport Visibility Tracking
    let isVisible = true;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(container);

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // 8. Render Loop with Inertia Damping
    let animId: number;

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      if (!isVisible || !renderer) return;

      if (!prefersReducedMotion) {
        if (!isDragging) {
          // Damping inertia
          rotVelocityY *= 0.94;
          rotVelocityX *= 0.94;
          modelGroup.rotation.y += rotVelocityY;
          modelGroup.rotation.x = Math.max(-0.6, Math.min(0.6, modelGroup.rotation.x + rotVelocityX));

          // Subtle ambient hero rotation when not interacting
          if (!isInteracting) {
            modelGroup.rotation.y += 0.007;
            // Gentle breathing float
            modelGroup.position.y = Math.sin(Date.now() * 0.0018) * 2.5;
          }
        }
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(idleTimer);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();

      if (renderer) {
        plateFaceTex.dispose();
        knurlTex.dispose();
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [activeId]);

  const currentHotspots = hotspotsMap[activeId] || [];

  return (
    <div className={`relative flex flex-col items-center justify-center w-full min-h-[460px] ${className}`}>
      {/* Interactive 3D Canvas Mount */}
      <div
        ref={containerRef}
        className="w-full h-[400px] sm:h-[460px] cursor-grab active:cursor-grabbing touch-none select-none relative z-10"
        title="Click and drag to rotate in 360°"
      />

      {/* Floating 360° Interaction Hint */}
      <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#18181b]/80 border border-white/10 backdrop-blur-md shadow-lg pointer-events-none">
        <Rotate3d className="w-3.5 h-3.5 text-[#FFC21A] animate-pulse" />
        <span className="text-[11px] font-mono font-medium text-neutral-300 uppercase tracking-wider">
          {isInteracting ? '360° Drag Active' : 'Drag to Orbit 360°'}
        </span>
      </div>

      {/* Floor Spotlight Reflection */}
      <div className="absolute bottom-6 w-3/4 h-8 bg-[#FFC21A]/10 blur-[35px] rounded-full pointer-events-none" />

      {/* Interactive Hotspot Feature Badges */}
      <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 z-20">
        {currentHotspots.map((hotspot, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveHotspot(hotspot);
              if (onHotspotClick) onHotspotClick(hotspot.title, hotspot.description);
            }}
            className={`text-left p-3 rounded-xl border transition group ${
              activeHotspot?.title === hotspot.title
                ? 'bg-[#FFC21A]/15 border-[#FFC21A] text-white shadow-md'
                : 'bg-[#141417]/80 hover:bg-[#1a1a20] border-white/[0.08] text-neutral-300'
            }`}
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-4 h-4 rounded-full bg-[#FFC21A] text-black text-[9px] font-mono font-black flex items-center justify-center">
                0{idx + 1}
              </span>
              <p className="text-xs font-bold text-white tracking-tight line-clamp-1 group-hover:text-[#FFC21A] transition-colors">
                {hotspot.title}
              </p>
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
              {hotspot.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};
