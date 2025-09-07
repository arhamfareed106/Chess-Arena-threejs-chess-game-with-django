import * as THREE from 'three';
import { PieceType } from '@/types';

// Basic geometric shapes for pieces
export const createTalentGeometry = (): THREE.BufferGeometry => {
  return new THREE.ConeGeometry(0.3, 0.8, 8);
};

export const createLeaderGeometry = (): THREE.BufferGeometry => {
  return new THREE.CylinderGeometry(0.25, 0.35, 0.7, 8);
};

export const createStrategistGeometry = (): THREE.BufferGeometry => {
  return new THREE.OctahedronGeometry(0.4);
};

export const createInvestorGeometry = (): THREE.BufferGeometry => {
  const geometry = new THREE.SphereGeometry(0.35, 16, 12);
  return geometry;
};

export const getPieceGeometry = (pieceType: PieceType): THREE.BufferGeometry => {
  switch (pieceType) {
    case PieceType.TALENT:
      return createTalentGeometry();
    case PieceType.LEADER:
      return createLeaderGeometry();
    case PieceType.STRATEGIST:
      return createStrategistGeometry();
    case PieceType.INVESTOR:
      return createInvestorGeometry();
    default:
      return createTalentGeometry();
  }
};

export const createPieceMaterial = (color: string, level: number): THREE.Material => {
  const baseColor = new THREE.Color(color);
  
  // Adjust material properties based on level
  const metalness = Math.min(0.2 + (level * 0.2), 0.8);
  const roughness = Math.max(0.8 - (level * 0.15), 0.2);
  
  return new THREE.MeshStandardMaterial({
    color: baseColor,
    metalness,
    roughness,
    emissive: new THREE.Color(baseColor).multiplyScalar(0.1),
  });
};

export const createBoardGeometry = (): THREE.BufferGeometry => {
  return new THREE.PlaneGeometry(8, 8);
};

export const createSquareGeometry = (): THREE.BufferGeometry => {
  return new THREE.PlaneGeometry(0.98, 0.98);
};

export const createHighlightGeometry = (): THREE.BufferGeometry => {
  return new THREE.RingGeometry(0.3, 0.45, 16);
};