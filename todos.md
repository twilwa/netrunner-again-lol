# TODO Checklist: Client-Side Rapid Prototyping

**(Using `mocha-app` codebase as starting point)**

## Phase 1: Solidify Tactical Scenario Core

- [ ] **Prompt 1: Verify GameState & Core Reducer Actions**

  - [ ] Review `client/src/context/GameContext.tsx` and `client/src/types.ts`.
  - [ ] Verify `initialState` uses types from `src/types.ts`:
    - [ ] `player` (check properties: id, name, position, health, maxHealth, energy, maxEnergy).
    - [ ] `enemies` array (check enemy structure: id, name, position, health, maxHealth).
    - [ ] `hexGrid` is initialized (e.g., `generateHexGrid(5)`).
    - [ ] `playerDeck` is initialized (e.g., `generateInitialCards()`).
    - [ ] `playerHand`, `playerDiscard` are initialized (empty arrays).
    - [ ] `playerCredits`, `playerInfluencePoints`.
    - [ ] `activeCard` (initially `null`).
    - [ ] `territories` (using `generateTerritories`).
    - [ ] `turnCount`, `gamePhase`, `activeMission`, `clicksRemaining`, `maxClicks`.
    - [ ] `selectedTerritory`, `selectedTacticalHex`.
    - [ ] `playerFaction`.
    - [ ] `notifications` (empty array).
    - [ ] `pendingActions` (empty array).
    - [ ] `marketplaceCards` (using `generateMarketplaceCards`).
    - [ ] `overworldHand` (using `generateOverworldCards`).
  - [ ] Verify `useEffect` in `GameProvider` correctly draws the initial hand (5 cards) and calls `UPKEEP_PHASE` once.
  - [ ] **Write/Review Tests (`GameContext.test.tsx`)**:
    - [ ] Test: `initializes with default state`. (Verify key values like health, energy, credits, phase, clicks, turn).
    - [ ] Test: `draws initial hand on mount`. (Verify `playerHand.length` is 5 after initial render).
    - [ ] Test: `processes initial upkeep phase`. (Verify `playerCredits` increases based on initial territory control).
    - [ ] Test (DRAW_CARD): `draws a card during ACTION_PHASE`.
    - [ ] Test (DRAW_CARD): `deducts a click when drawing a card`.
    - [ ] Test (DRAW_CARD): `prevents drawing card outside ACTION_PHASE`.
    - [ ] Test (DRAW_CARD): `prevents drawing card with 0 clicks`.
    - [ ] Test (DRAW_CARD): `handles drawing from empty deck (reshuffles discard)`.
    - [ ] Test (DRAW_CARD): `handles drawing when deck and discard are empty`.
    - [ ] Test (END_TURN): `cycles through game phases correctly (UPKEEP -> ACTION -> RESOLUTION -> UPKEEP)`.
    - [ ] Test (END_TURN): `resets clicksRemaining to maxClicks at start of UPKEEP_PHASE`.
    - [ ] Test (END_TURN): `resets player energy to maxEnergy at start of UPKEEP_PHASE`.
    - [ ] Test (END_TURN): `increments turnCount at start of UPKEEP_PHASE`.
  - [ ] Run `npm test` (or `jest`). Fix any failing tests related to initial state or core actions.
  - [ ] Run `npm run dev`. Manually verify turn cycling and drawing cards in `TacticalView`.

- [ ] **Prompt 2: Refine/Implement Tactical Actions in Reducer (TDD)**

  - [ ] **Write Failing Tests (`GameContext.test.tsx`) for `MOVE_PLAYER`**:
    - [ ] `MOVE_PLAYER: updates player position on valid move`.
    - [ ] `MOVE_PLAYER: deducts a click on valid move`.
    - [ ] `MOVE_PLAYER: fails if not in ACTION_PHASE`.
    - [ ] `MOVE_PLAYER: fails if clicksRemaining is 0`.
    - [ ] `MOVE_PLAYER: fails if target hex is blocked`.
    - [ ] `MOVE_PLAYER: fails if target hex is out of basic move range (e.g., > 1)`.
  - [ ] **Implement/Refine `MOVE_PLAYER` in `gameReducer`** to pass all new tests.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`) for `PLAY_CARD`**:
    - [ ] Add test setup helper to easily put specific cards in hand/set resources.
    - [ ] Update `PLAY_CARD` action type definition to include optional `targetCoord` and `targetEnemyId`.
    - [ ] `PLAY_CARD: moves card from hand to discard on valid play`.
    - [ ] `PLAY_CARD: deducts energy cost on valid play`.
    - [ ] `PLAY_CARD: deducts a click on valid play`.
    - [ ] `PLAY_CARD: fails if not in ACTION_PHASE`.
    - [ ] `PLAY_CARD: fails if clicksRemaining is 0`.
    - [ ] `PLAY_CARD: fails if player energy is less than card cost`.
    - [ ] `PLAY_CARD (Effect - Attack): reduces target enemy health` (requires test setup with enemy and target info in action).
    - [ ] `PLAY_CARD (Effect - Move): updates player position` (requires card with move effect).
    - [ ] `PLAY_CARD (Effect - Resource): increases player credits` (requires card with resource effect).
    - [ ] `PLAY_CARD: resets activeCard`.
  - [ ] **Implement/Refine `PLAY_CARD` in `gameReducer`** to pass all new tests. Use `if/else if/switch` based on `action.card.type` or `id` for effects.
  - [ ] Update `TacticalView.tsx` click handler to dispatch `MOVE_PLAYER` correctly.

- [ ] **Prompt 3: Implement Basic Scenario Win/Loss Conditions (TDD)**

  - [ ] Add `scenarioOutcome: 'SUCCESS' | 'FAILURE' | null` to `GameState` interface in `GameContext.tsx`, initialize `null`.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`)**:
    - [ ] `Scenario End: sets outcome to SUCCESS when enemies array is empty`.
    - [ ] `Scenario End: sets outcome to FAILURE when player health is <= 0`.
    - [ ] `Scenario End: sets outcome to FAILURE when turnCount exceeds limit (e.g., 10)`.
  - [ ] **Implement `checkScenarioEndCondition` helper function** within `GameContext.tsx`.
  - [ ] **Integrate `checkScenarioEndCondition` Call**: Modify `gameReducer` to call helper after enemy health changes (`PLAY_CARD` handling attack effects), player health changes (if implemented), and at the start of `UPKEEP_PHASE`.
  - [ ] Modify `TacticalView.tsx`: Read `gameState.scenarioOutcome`, display "Victory!" or "Defeat!" overlay if not null.

- [ ] **Prompt 4: Implement Targeting Visualization & Interaction (TDD)**
  - [ ] Add `targetingMode: 'MOVE' | 'CARD' | null` and `targetableHexes: HexCoord[]` state to `GameState` in `GameContext.tsx`, initialize `null` / `[]`.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`)**:
    - [ ] `SET_ACTIVE_CARD: sets activeCard state`.
    - [ ] `SET_ACTIVE_CARD: calculates and sets targetableHexes based on card range`. (Use `getHexesInRange`).
    - [ ] `SET_ACTIVE_CARD: sets targetingMode to 'CARD'`.
    - [ ] `MOVE_PLAYER: resets targetingMode, targetableHexes, activeCard`.
    - [ ] `PLAY_CARD: resets targetingMode, targetableHexes, activeCard`.
    - [ ] `CANCEL_CARD: resets targetingMode, targetableHexes, activeCard`.
  - [ ] **Implement/Refine Reducer Handlers** (`SET_ACTIVE_CARD`, `MOVE_PLAYER`, `PLAY_CARD`, `CANCEL_CARD`) to manage targeting state and pass tests.
  - [ ] Modify `TacticalView.tsx`:
    - [ ] Remove local `highlightedHexes` state.
    - [ ] Read `gameState.targetableHexes` from context.
    - [ ] Pass `gameState.targetableHexes` to `HexGrid` as `highlightedHexes`.
    - [ ] Update `handleHexClick`: Check `gameState.targetingMode`, dispatch `PLAY_CARD` with target info or `MOVE_PLAYER`.
  - [ ] Modify `HexGrid.tsx`: Verify it uses `highlightedHexes` prop for visual styling.

## Phase 2: Connect Scenario Outcome to Overworld

- [ ] **Prompt 5: Implement Overworld State & View Switching (TDD)**

  - [ ] Add `currentView: 'TACTICAL' | 'OVERWORLD' | ...` state to `GameState` in `GameContext.tsx`. Initialize appropriately.
  - [ ] Verify `initialState.territories` uses `generateTerritories`.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`)**:
    - [ ] `Scenario End: sets currentView to 'OVERWORLD'`.
    - [ ] `Scenario End: resets activeMission to null`.
    - [ ] `Scenario End: clears enemies array`.
    - [ ] `Scenario End: resets scenarioOutcome to null`.
    - [ ] `Scenario End: resets player position` (optional, decide where player appears in Overworld).
  - [ ] **Implement Reducer Logic**: Integrate view switching and tactical state reset into the scenario end handling (after outcome is determined and effects applied).
  - [ ] **Refactor `App.tsx`**:
    - [ ] Remove Router setup.
    - [ ] Use `useGame` hook.
    - [ ] Implement conditional rendering based on `gameState.currentView` to show `TacticalView` or `OverworldMap`.
  - [ ] Verify `OverworldMap.tsx` renders territories from context.

- [ ] **Prompt 6: Apply Scenario Outcome to Overworld State (TDD)**
  - [ ] **Write Failing Tests (`GameContext.test.tsx`)**:
    - [ ] `Scenario Outcome (Success): decreases influence of activeMission territory`.
    - [ ] `Scenario Outcome (Success): increases playerCredits`.
    - [ ] `Scenario Outcome (Failure): increases/maintains influence of activeMission territory`.
    - [ ] `Scenario Outcome (Failure): awards minimal/no credits`.
    - [ ] `Scenario Outcome: updates territory controlledBy status`.
  - [ ] **Implement Reducer Logic**: Within the scenario end handler (before resetting tactical state), get `activeMissionId`, find territory, modify `influenceLevel` / `playerCredits` based on outcome, call `updateTerritoryControl` helper, update `territories` state immutably.
  - [ ] Ensure `calculateResourceGain` and `updateTerritoryControl` helpers are available/correct in `GameContext.tsx`.

## Phase 3: Basic Overworld Gameplay & Loop Reset

- [ ] **Prompt 7: Implement Simple Overworld Turn & Resource Gain (TDD)**

  - [ ] Add `overworldTurnCount: number` state to `GameContext.tsx`, initialize `1`.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`) for `END_OVERWORLD_TURN`**:
    - [ ] `END_OVERWORLD_TURN: calculates and adds correct credit gain`.
    - [ ] `END_OVERWORLD_TURN: increments overworldTurnCount`.
  - [ ] **Implement Reducer Logic**: Add `END_OVERWORLD_TURN` action type and handler. Use `calculateResourceGain`.
  - [ ] Modify `OverworldMap.tsx`: Add "End Overworld Turn" button dispatching the action. Display turn count and credits.

- [ ] **Prompt 8: Implement Transition from Overworld to Marketplace/Prep (TDD)**
  - [ ] Add `viewingTerritoryId: string | null`, `currentMarketplaceCards: Card[]` state to `GameContext.tsx`. Update `currentView` type.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`) for `VIEW_TERRITORY_MARKETPLACE`**:
    - [ ] `VIEW_TERRITORY_MARKETPLACE: fails if territory has no mission`.
    - [ ] `VIEW_TERRITORY_MARKETPLACE: sets viewingTerritoryId`.
    - [ ] `VIEW_TERRITORY_MARKETPLACE: sets currentView to 'MARKETPLACE'`.
    - [ ] `VIEW_TERRITORY_MARKETPLACE: populates currentMarketplaceCards with random cards`.
  - [ ] **Implement Reducer Logic**: Add `VIEW_TERRITORY_MARKETPLACE` action type and handler.
  - [ ] Modify `OverworldMap.tsx`: Update `TerritoryHex` click handler to dispatch `VIEW_TERRITORY_MARKETPLACE` for mission territories.
  - [ ] Modify `App.tsx`: Update conditional rendering for `Marketplace`.

## Phase 4: Marketplace Interaction & Loop Closure

- [ ] **Prompt 9: Implement Basic Marketplace UI & Purchase (TDD)**

  - [ ] Adapt `Marketplace.tsx`: Use `useGame` hook, display `currentMarketplaceCards`/`playerCredits`, get `viewingTerritoryId` from context (remove `useParams`).
  - [ ] Implement "Buy Card" button in `Marketplace.tsx` to dispatch `BUY_MARKETPLACE_CARD`.
  - [ ] Implement "Proceed" button in `Marketplace.tsx` to dispatch `GO_TO_MISSION_PREP`.
  - [ ] **Write Failing Tests (`GameContext.test.tsx`) for `BUY_MARKETPLACE_CARD`**:
    - [ ] `BUY_MARKETPLACE_CARD: fails if player cannot afford`.
    - [ ] `BUY_MARKETPLACE_CARD: deducts credits on success`.
    - [ ] `BUY_MARKETPLACE_CARD: adds card to playerDeck`.
    - [ ] `BUY_MARKETPLACE_CARD: removes/disables card in currentMarketplaceCards`.
  - [ ] **Implement Reducer Logic**: Add `BUY_MARKETPLACE_CARD` action type and handler.
  - [ ] **Implement Reducer Logic**: Add `GO_TO_MISSION_PREP` action type and handler (sets `currentView = 'PREP'`).
  - [ ] Modify `App.tsx`: Update conditional rendering for `MissionPrep`.

- [ ] **Prompt 10: Implement Transition to Tactical View & Start Mission (TDD)**
  - [ ] **Write Failing Tests (`GameContext.test.tsx`) for `INITIATE_MISSION`**:
    - [ ] `INITIATE_MISSION: retrieves correct territory from viewingTerritoryId`.
    - [ ] `INITIATE_MISSION: generates enemies based on territory`.
    - [ ] `INITIATE_MISSION: resets player position, health, energy`.
    - [ ] `INITIATE_MISSION: shuffles deck`.
    - [ ] `INITIATE_MISSION: draws initial hand (5 cards)`.
    - [ ] `INITIATE_MISSION: clears discard pile`.
    - [ ] `INITIATE_MISSION: resets turnCount and clicksRemaining`.
    - [ ] `INITIATE_MISSION: sets activeMission`.
    - [ ] `INITIATE_MISSION: sets currentView = 'TACTICAL'`.
    - [ ] `INITIATE_MISSION: clears viewingTerritoryId and currentMarketplaceCards`.
  - [ ] **Implement Reducer Logic**: Add `INITIATE_MISSION` action type and handler. Ensure all reset/setup steps are included.
  - [ ] Modify `MissionPrep.tsx` (or `Marketplace.tsx` if skipping prep): Add/modify "Start Mission" button to dispatch `INITIATE_MISSION`. Adapt component to get `territoryId` from `gameState.viewingTerritoryId`.
  - [ ] **Manual Test**: Play through the entire loop to verify functionality.
