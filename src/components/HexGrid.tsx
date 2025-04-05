import React, { useMemo, useRef } from 'react';
import { Cylinder, Box, useTexture, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Player, Enemy, HexTile, HexCoord } from '../types';
import { getHexPosition, areHexCoordsEqual, findHexByCoord } from '../utils/hexUtils';
import * as THREE from 'three';

interface HexGridProps {
  hexes: HexTile[];
  player: Player;
  enemies: Enemy[];
  onHexClick: (coord: HexCoord) => void;
  highlightedHexes: HexCoord[];
  selectedHex: HexCoord | null;
}

const HexGrid: React.FC<HexGridProps> = ({ 
  hexes, 
  player, 
  enemies, 
  onHexClick, 
  highlightedHexes,
  selectedHex 
}) => {
  // Load textures with error handling
  const textureProps = {
    circuitGreen: '/textures/circuit-green.jpg',
    metalFloor: '/textures/metal-floor.jpg',
    concreteCracked: '/textures/concrete-cracked.jpg',
    concrete: '/textures/concrete.jpg',
  };
  
  // Create fallback textures in case loading fails
  const fallbackTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load('');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);
  
  // Create basic materials without textures as fallbacks
  const fallbackMaterials = useMemo(() => {
    return {
      standard: new THREE.MeshStandardMaterial({ 
        color: "#2a2a3a", 
        roughness: 0.8, 
        metalness: 0.2 
      }),
      metallic: new THREE.MeshStandardMaterial({ 
        color: "#444", 
        roughness: 0.6, 
        metalness: 0.8 
      }),
      concrete: new THREE.MeshStandardMaterial({ 
        color: "#333", 
        roughness: 0.9,
        metalness: 0.1 
      })
    };
  }, []);
  
  // Animation time reference
  const timeRef = useRef(0);
  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  return (
    <group>
      {/* Ground plane */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.2, 0]} 
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#1a1a2e"
          roughness={0.9}
          opacity={0.8}
          transparent={true}
        />
      </mesh>

      {/* Hex tiles */}
      {hexes.map((hex) => {
        const [x, y, z] = getHexPosition(hex.coord);
        const isHighlighted = highlightedHexes.some(coord => 
          coord.q === hex.coord.q && coord.r === hex.coord.r
        );
        const isSelected = selectedHex && areHexCoordsEqual(hex.coord, selectedHex);
        const isPlayerHex = areHexCoordsEqual(hex.coord, player.position);
        const enemyOnHex = enemies.find(e => areHexCoordsEqual(e.position, hex.coord));
        
        let hexColor = "#2a2a3a";
        let intensity = 0;
        let emissiveColor = "#2a2a3a";
        
        if (hex.type === 'blocked') {
          hexColor = "#444";
          emissiveColor = "#333";
        } else if (isHighlighted) {
          hexColor = "#4c9aff";
          emissiveColor = "#4c9aff";
          intensity = 0.5;
        }
        
        if (isSelected) {
          hexColor = "#5ce1e6";
          emissiveColor = "#5ce1e6";
          intensity = 1;
        }
        
        // Determine control color tint
        if (hex.controlledBy === 'corp') {
          hexColor = isHighlighted ? "#ff6b6b" : "#992222";
          emissiveColor = "#ff3860";
          intensity = isHighlighted ? 0.5 : 0.2;
        } else if (hex.controlledBy === 'runner') {
          hexColor = isHighlighted ? "#51cf66" : "#227722";
          emissiveColor = "#36e47c";
          intensity = isHighlighted ? 0.5 : 0.2;
        }
        
        // Pulse effect for highlighted hexes
        const pulseScale = isHighlighted || isSelected ? 
          1 + Math.sin(timeRef.current * 3) * 0.05 : 1;

        return (
          <group key={hex.id} position={[x, hex.elevation, z]}>
            {/* Hex base */}
            <Cylinder 
              args={[1, 1, 0.2, 6, 1, false]} 
              rotation={[0, Math.PI / 6, 0]} 
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                onHexClick(hex.coord);
              }}
              castShadow
              receiveShadow
              scale={[pulseScale, 1, pulseScale]}
            >
              {hex.type === 'blocked' ? (
                <meshStandardMaterial 
                  color={hexColor}
                  roughness={0.6}
                  metalness={0.4}
                  emissive={emissiveColor}
                  emissiveIntensity={intensity * 0.5}
                />
              ) : hex.controlledBy === 'corp' ? (
                <MeshDistortMaterial 
                  color={hexColor}
                  roughness={0.7}
                  metalness={0.3}
                  emissive={emissiveColor}
                  emissiveIntensity={intensity}
                  distort={0.2}
                  speed={1}
                />
              ) : (
                <meshStandardMaterial 
                  color={hexColor}
                  roughness={0.8}
                  metalness={0.2}
                  emissive={emissiveColor}
                  emissiveIntensity={intensity}
                />
              )}
            </Cylinder>
            
            {/* Elevation platform for blocked hexes */}
            {hex.type === 'blocked' && (
              <Box 
                args={[1.5, 1.5, 1.5]} 
                position={[0, 0.85, 0]}
                castShadow
              >
                <meshStandardMaterial 
                  color="#333" 
                  roughness={0.9}
                  metalness={0.1}
                />
              </Box>
            )}
            
            {/* Glow effect for highlighted/selected hexes */}
            {(isHighlighted || isSelected) && (
              <group position={[0, 0.2, 0]}>
                <Cylinder 
                  args={[1.05, 1.05, 0.01, 6, 1, false]} 
                  rotation={[0, Math.PI / 6, 0]}
                  scale={[pulseScale + 0.05, 1, pulseScale + 0.05]}
                >
                  <meshBasicMaterial 
                    color={isSelected ? "#5ce1e6" : "#4c9aff"} 
                    transparent
                    opacity={0.3}
                  />
                </Cylinder>
              </group>
            )}
            
            {/* Player marker */}
            {isPlayerHex && (
              <group position={[0, 0.8, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <MeshWobbleMaterial 
                    color="#5ce1e6" 
                    emissive="#5ce1e6"
                    emissiveIntensity={1}
                    factor={0.2}
                    speed={1}
                  />
                </mesh>
                
                {/* Player light */}
                <pointLight 
                  color="#5ce1e6" 
                  intensity={0.8} 
                  distance={5}
                  decay={2}
                />
              </group>
            )}
            
            {/* Enemy marker */}
            {enemyOnHex && (
              <group position={[0, 0.8, 0]}>
                <mesh castShadow>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <MeshDistortMaterial 
                    color="#ff6b6b" 
                    emissive="#ff6b6b"
                    emissiveIntensity={1}
                    distort={0.3}
                    speed={2}
                  />
                </mesh>
                
                {/* Enemy light */}
                <pointLight 
                  color="#ff6b6b" 
                  intensity={0.8} 
                  distance={5}
                  decay={2}
                />
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

export default HexGrid;
