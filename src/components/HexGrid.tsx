import React, { useMemo, useRef } from 'react';
import { Cylinder, Box, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { Player, Enemy, HexTile, HexCoord, ActionType } from '../types';
import { getHexPosition, areHexCoordsEqual, findHexByCoord, getHexDistance } from '../utils/hexUtils';
import * as THREE from 'three';

interface HexGridProps {
  hexes: HexTile[];
  player: Player;
  enemies: Enemy[];
  onHexClick: (coord: HexCoord) => void;
  onHexHover: (coord: HexCoord | null) => void;
  highlightedHexes: HexCoord[];
  selectedHex: HexCoord | null;
  hoveredHex: HexCoord | null;
  activeAction: ActionType | null;
  activeCardRange?: number;
}

const HexGrid: React.FC<HexGridProps> = ({ 
  hexes, 
  player, 
  enemies, 
  onHexClick, 
  onHexHover,
  highlightedHexes,
  selectedHex,
  hoveredHex,
  activeAction,
  activeCardRange
}) => {
  // Animation time reference
  const timeRef = useRef(0);
  useFrame((_, delta) => {
    timeRef.current += delta;
  });

  // Determine hovered hex interactions
  const isHexInteractable = (coord: HexCoord) => {
    if (!activeAction) return false;

    const hex = findHexByCoord(hexes, coord);
    if (!hex || hex.type === 'blocked') return false;
    
    const distance = getHexDistance(player.position, coord);
    
    switch (activeAction) {
      case ActionType.BASIC_MOVE:
        // Basic move can only go 1 hex
        return distance === 1 && !enemies.some(e => areHexCoordsEqual(e.position, coord));
        
      case ActionType.BASIC_ATTACK:
        // Basic attack can only target enemies in adjacent hexes
        return distance === 1 && enemies.some(e => areHexCoordsEqual(e.position, coord));
        
      case ActionType.INTERACT:
        // For now, assume any adjacent hex could be interactable
        return distance === 1;
        
      default:
        return false;
    }
  };

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
        const isHovered = hoveredHex && areHexCoordsEqual(hex.coord, hoveredHex);
        const isPlayerHex = areHexCoordsEqual(hex.coord, player.position);
        const enemyOnHex = enemies.find(e => areHexCoordsEqual(e.position, hex.coord));
        
        // Calculate if hex is interactable based on active action
        const isActionTarget = isHexInteractable(hex.coord);

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
        
        // Add hover effect for action targets
        if (isHovered && isActionTarget) {
          hexColor = "#ffcc00";
          emissiveColor = "#ffcc00";
          intensity = 1.2;
        } else if (isHovered) {
          intensity += 0.3;
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
        
        // Pulse effect for highlighted/interactable hexes
        const pulseScale = (isHighlighted || isSelected || (isHovered && isActionTarget)) ? 
          1 + Math.sin(timeRef.current * 3) * 0.05 : 1;

        // Visual indicator for action targets
        const showActionIndicator = isActionTarget || 
          (activeCardRange && getHexDistance(player.position, hex.coord) <= activeCardRange && hex.type !== 'blocked');

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
              onPointerEnter={() => onHexHover(hex.coord)}
              onPointerLeave={() => onHexHover(null)}
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
            
            {/* Action target indicator */}
            {showActionIndicator && (
              <group position={[0, 0.15, 0]}>
                <Cylinder 
                  args={[1.1, 1.1, 0.01, 6, 1, false]} 
                  rotation={[0, Math.PI / 6, 0]}
                >
                  <meshBasicMaterial 
                    color={
                      activeAction === ActionType.BASIC_ATTACK ? "#ff3860" : 
                      activeAction === ActionType.BASIC_MOVE ? "#4c9aff" : 
                      activeAction === ActionType.INTERACT ? "#ffdd57" : 
                      "#5ce1e6"
                    } 
                    transparent
                    opacity={0.3 + Math.sin(timeRef.current * 5) * 0.1}
                  />
                </Cylinder>
              </group>
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
