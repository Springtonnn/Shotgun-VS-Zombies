/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { GameEngine } from './game/engine';
import { Win95Window } from './components/Win95Window';

export default function App() {
  const engine = useMemo(() => new GameEngine(), []);

  return <Win95Window engine={engine} />;
}
