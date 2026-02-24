        // Three.js Implementation
        const initThreeJS = () => {
            const container = document.getElementById('canvas-container');
            
            // Scene Setup
            const scene = new THREE.Scene();
            // Add subtle fog to blend floor into background
            scene.fog = new THREE.FogExp2(0x000000, 0.02);

            const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 0, 0);

            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            container.appendChild(renderer.domElement);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 2);
            scene.add(ambientLight);

            const pointLight = new THREE.PointLight(0xa855f7, 2, 50);
            pointLight.position.set(5, 5, 5);
            scene.add(pointLight);

            const blueLight = new THREE.PointLight(0x3b82f6, 2, 50);
            blueLight.position.set(-5, 2, -5);
            scene.add(blueLight);

            // --- Objects ---

            // 1. The Floor (Circular Track)
            const trackGeometry = new THREE.RingGeometry(4, 12, 64, 1, 0, Math.PI * 1.5); // Partial ring
            const trackMaterial = new THREE.MeshStandardMaterial({ 
                color: 0x111111, 
                roughness: 0.2, 
                metalness: 0.8,
                side: THREE.DoubleSide
            });
            const track = new THREE.Mesh(trackGeometry, trackMaterial);
            track.rotation.x = -Math.PI / 2;
            track.rotation.z = Math.PI / 4; // Rotate to match visual
            scene.add(track);

            // Grid helper on floor for "Tech" look
            const gridHelper = new THREE.PolarGridHelper(20, 16, 8, 64, 0x333333, 0x111111);
            gridHelper.position.y = 0.01;
            scene.add(gridHelper);

            // 2. The Portals (Torus)
            const createPortal = (x, z, color, rotX) => {
                const geometry = new THREE.TorusGeometry(1.5, 0.05, 16, 100);
                const material = new THREE.MeshBasicMaterial({ color: color });
                const portal = new THREE.Mesh(geometry, material);
                
                // Add glow (larger torus with transparency)
                const glowGeo = new THREE.TorusGeometry(1.5, 0.2, 16, 100);
                const glowMat = new THREE.MeshBasicMaterial({ 
                    color: color, 
                    transparent: true, 
                    opacity: 0.3,
                    blending: THREE.AdditiveBlending
                });
                const glow = new THREE.Mesh(glowGeo, glowMat);
                portal.add(glow);

                // Inner light
                const light = new THREE.PointLight(color, 1, 5);
                light.position.z = 0.5;
                portal.add(light);

                portal.position.set(x, 0.1, z);
                portal.rotation.x = -Math.PI / 2 + rotX;
                return portal;
            };

            const portal1 = createPortal(4, -2, 0xa855f7, 0.2); // Purple
            const portal2 = createPortal(-2, 4, 0x3b82f6, -0.2); // Blue
            scene.add(portal1);
            scene.add(portal2);

            // 3. The Coins (Cylinders with textures)
            const createCoin = (textureUrl, x, y, z) => {
                const geometry = new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32);
                
                // Create dynamic texture
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const ctx = canvas.getContext('2d');
                
                // Draw Coin Face
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(64, 64, 60, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 4;
                ctx.stroke();
                
                // Draw Symbol
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 60px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(textureUrl, 64, 64);

                const texture = new THREE.CanvasTexture(canvas);
                
                const materialFace = new THREE.MeshStandardMaterial({ 
                    map: texture,
                    roughness: 0.3,
                    metalness: 0.9
                });
                const materialSide = new THREE.MeshStandardMaterial({ 
                    color: 0x888888,
                    roughness: 0.3,
                    metalness: 0.9
                });

                const coin = new THREE.Mesh(geometry, [materialSide, materialFace, materialFace]);
                coin.position.set(x, y, z);
                coin.rotation.z = Math.PI / 2; // Stand up
                coin.rotation.y = Math.random() * Math.PI;
                return coin;
            };

            const coin1 = createCoin('$', 0, 2, 0);
            const coin2 = createCoin('▲', -3, 3, 2); // Triangle placeholder
            const coin3 = createCoin('₿', 2, 1, -2);
            
            scene.add(coin1);
            scene.add(coin2);
            scene.add(coin3);

            const coins = [coin1, coin2, coin3];

            // Animation Loop
            const clock = new THREE.Clock();

            const animate = () => {
                requestAnimationFrame(animate);
                const time = clock.getElapsedTime();

                // Animate Portals
                portal1.rotation.z = time * 0.5;
                portal2.rotation.z = -time * 0.5;

                // Animate Coins (Float and Spin)
                coins.forEach((coin, index) => {
                    const offset = index * 2;
                    // Bobbing motion
                    coin.position.y = 2 + Math.sin(time * 2 + offset) * 0.5;
                    // Rotation
                    coin.rotation.y += 0.02;
                    coin.rotation.x = Math.sin(time + offset) * 0.2;
                    
                    // Move along track logic (simplified circular motion)
                    const radius = 6;
                    const speed = 0.5;
                    const angle = time * speed + (index * (Math.PI * 2 / 3));
                    
                    // We keep them somewhat in place but drifting slightly to simulate the track movement
                    // Or actually move them along the arc defined earlier
                    // Let's make them orbit the center
                    coin.position.x = Math.cos(angle) * radius;
                    coin.position.z = Math.sin(angle) * radius;
                });

                // Gentle camera movement based on mouse
                // (Simplified for this demo, normally we'd use mouse event listeners)

                renderer.render(scene, camera);
            };

            animate();

            // Resize Handler
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        };

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            try {
                initThreeJS();
            } catch (e) {
                console.error("Three.js initialization failed", e);
            }
        });
          
