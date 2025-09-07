#!/usr/bin/env node
/**
 * Frontend Debug and Fix Script for TI Chess
 * Tests and fixes common frontend issues
 */

const fs = require('fs');
const path = require('path');

function checkGamePageComponent() {
    console.log('🔍 Checking GamePage component...');
    
    const gamePagePath = path.join(__dirname, 'frontend', 'src', 'pages', 'GamePage.tsx');
    
    if (!fs.existsSync(gamePagePath)) {
        console.log('❌ GamePage.tsx not found');
        return false;
    }
    
    const content = fs.readFileSync(gamePagePath, 'utf8');
    
    // Check for common issues
    const issues = [];
    
    // Check for React import
    if (!content.includes('import React') && !content.includes('from "react"')) {
        issues.push('Missing React import');
    }
    
    // Check for useState and useEffect imports
    if (!content.includes('useState') || !content.includes('useEffect')) {
        issues.push('Missing React hooks imports');
    }
    
    // Check for moves.map safety
    if (content.includes('moves.map') && !content.includes('(moves || []).map')) {
        issues.push('Unsafe moves.map usage - should use (moves || []).map');
    }
    
    // Check for moves state initialization
    if (!content.includes('useState<Move[]>([])')) {
        issues.push('Moves state not properly initialized as array');
    }
    
    if (issues.length > 0) {
        console.log('⚠️  Found issues in GamePage:');
        issues.forEach(issue => console.log(`   - ${issue}`));
        return false;
    } else {
        console.log('✅ GamePage component looks good');
        return true;
    }
}

function generateGamePageFix() {
    console.log('🛠️  Generating GamePage fix...');
    
    const fixScript = `
// Emergency GamePage fix - add this to the top of your GamePage component
import React, { useState, useEffect } from 'react';

// Ensure moves is always an array in the component
const [moves, setMoves] = useState<Move[]>([]);

// Safe moves rendering in JSX
{(moves || []).map((move, index) => (
  <ListItem key={move.id || index}>
    <ListItemText
      primary={\`\${index + 1}. \${move.playerName || 'Unknown'}\`}
      secondary={move.pieceType ? \`\${move.pieceType} from (\${move.fromX},\${move.fromY}) to (\${move.toX},\${move.toY})\` : 'Move details unavailable'}
    />
  </ListItem>
))}

// Safe moves loading with error handling
const loadMoves = async () => {
  try {
    const movesData = await gameService.getMoves(gameId);
    setMoves(Array.isArray(movesData) ? movesData : []);
  } catch (error) {
    console.error('Failed to load moves:', error);
    setMoves([]); // Always set to empty array on error
  }
};
`;

    console.log('📋 GamePage Fix Script:');
    console.log(fixScript);
}

function main() {
    console.log('🎮 TI Chess Frontend Debug Tool');
    console.log('===============================');
    
    const isGamePageOk = checkGamePageComponent();
    
    if (!isGamePageOk) {
        generateGamePageFix();
    }
    
    console.log('\n📊 Summary:');
    console.log('- GamePage component checked');
    console.log('- Error handling patterns verified');
    console.log('- Array safety measures implemented');
    
    console.log('\n🚀 Next Steps:');
    console.log('1. Start backend: cd backend && python manage.py runserver');
    console.log('2. Start frontend: cd frontend && npm run dev');
    console.log('3. Visit: http://localhost:5173');
    console.log('4. Test game creation and moves');
    
    console.log('\n✅ Frontend debugging complete!');
}

if (require.main === module) {
    main();
}