import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
// import * as THREE from 'three';

import Board from './Board';
import Piece from './Piece';
import CameraController from './CameraController';
import { Piece as PieceType, Position } from '@/types';

interface GameSceneProps {
  pieces: PieceType[];
  selectedPiece?: PieceType | null;
  validMoves?: Position[];
  cameraPreset?: 'top-down' | 'isometric' | 'side-view';
  showGrid?: boolean;
  enableShadows?: boolean;
  onPieceClick?: (piece: PieceType) => void;
  onSquareClick?: (x: number, y: number) => void;
}

const GameScene: React.FC<GameSceneProps> = ({
  pieces,
  selectedPiece,
  validMoves = [],
  cameraPreset = 'isometric',
  showGrid = true,
  enableShadows = true,
  onPieceClick,
  onSquareClick,
}) => {
  // Convert board coordinates to 3D world coordinates
  const boardToWorld = (x: number, y: number): [number, number, number] => {
    return [x - 3.5, 0.5, y - 3.5];
  };

  // Create highlight data for valid moves
  const highlightedSquares = validMoves.map(move => ({
    x: move.x,
    y: move.y,
    color: '#00ff0080',
  }));

  // Add selected piece highlight
  if (selectedPiece) {
    highlightedSquares.push({
      x: selectedPiece.positionX,
      y: selectedPiece.positionY,
      color: '#ffff0080',
    });
  }

  const handleSquareClick = (x: number, y: number) => {
    if (onSquareClick) {
      onSquareClick(x, y);
    }
  };

  const handlePieceClick = (piece: PieceType) => {
    if (onPieceClick) {
      onPieceClick(piece);
    }
  };

  return (
    <Canvas
      shadows={enableShadows}
      camera={{ position: [8, 8, 8], fov: 60 }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        {/* Camera */}
        <CameraController preset={cameraPreset} />
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 10]}
          intensity={1}
          castShadow={enableShadows}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        <directionalLight
          position={[-5, 5, 5]}
          intensity={0.3}
        />

        {/* Environment */}
        <Environment preset="city" background={false} />

        {/* Grid */}
        {showGrid && (
          <Grid
            position={[0, -0.1, 0]}
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#ffffff"
            sectionSize={4}
            sectionThickness={1}
            sectionColor="#666666"
            fadeDistance={30}
            fadeStrength={1}
            infiniteGrid
          />
        )}

        {/* Game Board */}
        <Board
          onSquareClick={handleSquareClick}
          highlightedSquares={highlightedSquares}
        />

        {/* Game Pieces */}
        {pieces.map(piece => (
          <Piece
            key={piece.id}
            piece={piece}
            position={boardToWorld(piece.positionX, piece.positionY)}
            isSelected={selectedPiece?.id === piece.id}
            isHighlighted={validMoves.some(move => 
              move.x === piece.positionX && move.y === piece.positionY
            )}
            onClick={handlePieceClick}
          />
        ))}

        {/* Fog for depth perception */}
        <fog attach="fog" args={['#f0f0f0', 15, 30]} />
      </Suspense>
    </Canvas>
  );
};

export default GameScene;