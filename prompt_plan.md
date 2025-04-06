Prompt 1 (Rapid): Verify GameState & Core Reducer Actions

Objective: Verify the initial `GameState` in `GameContext` includes necessary fields based on `src/types.ts` and that core reducer actions (`DRAW_CARD`, `END_TURN`) function correctly for basic turn flow. Add tests if needed.

Requirements:

1.  Review `client/src/context/GameContext.tsx`.
2.  Verify `initialState` uses types from `src/types.ts`:
    - Check `player` (position, health, energy).
    - Check `enemies` array (position, health).
    - Check `hexGrid` (using `generateHexGrid`).
    - Check `playerDeck`, `playerHand`, `playerDiscard` (using `generateInitialCards`).
    - Check `clicksRemaining`, `maxClicks`.
    - Check `gamePhase`.
3.  Verify Initial Hand Draw: Confirm the `useEffect` hook in `GameProvider` draws the initial 5 cards correctly.
4.  **TDD:** Write/Review Tests (`GameContext.test.tsx`):
    - Add tests (if missing) to confirm initial state values are as expected.
    - Add tests (if missing) for the `DRAW_CARD` action: Ensure it draws a card, moves it to hand, removes from deck, deducts a click, handles reshuffling (use helper), and only works in `ACTION_PHASE` with clicks > 0.
    - Add tests (if missing) for the `END_TURN` action: Ensure it correctly cycles phases (`UPKEEP` -> `ACTION` -> `RESOLUTION` -> `UPKEEP`), resets `clicksRemaining` and `player.energy` when looping back to `UPKEEP`, and increments `turnCount`.
5.  Run existing tests (`npm test` or `jest`) to ensure baseline functionality. Address any failures in existing tests.
6.  Run the app (`npm run dev`) and manually verify basic turn progression and card drawing via UI controls in `TacticalView`.

Provide verification confirmation or code snippets from `GameContext.tsx` or `GameContext.test.tsx` if significant discrepancies or missing tests are found.
Use code with caution.
Prompt 2 (Rapid): Refine/Implement Tactical Actions in Reducer (TDD)

Objective: Refine existing or implement reducer logic for core tactical actions: Movement and Card Play (with simple, hardcoded effects), following a TDD approach.

Requirements:

1.  Modify `client/src/context/GameContext.tsx` (`gameReducer`).
2.  **TDD - MOVE_PLAYER:**
    - Write failing tests in `GameContext.test.tsx` for the `MOVE_PLAYER` action:
      - Test valid move updates `player.position`.
      - Test valid move deducts a click.
      - Test move only works in `ACTION_PHASE` with clicks > 0.
      - Test move fails if target hex is invalid/blocked.
      - Test move fails if distance > move range (e.g., 1 for basic move, use `getHexDistance`).
    - Refine/Implement `MOVE_PLAYER` handler in `gameReducer` to pass the tests. Add necessary validation (phase, clicks, distance, target validity).
3.  **TDD - PLAY_CARD:**
    - Write failing tests in `GameContext.test.tsx` for the `PLAY_CARD` action:
      - Test valid play moves card from hand to discard.
      - Test valid play deducts energy cost (`player.energy`).
      - Test valid play deducts a click.
      - Test play only works in `ACTION_PHASE` with clicks > 0.
      - Test play fails if insufficient energy.
      - Test _specific card types_ apply their hardcoded effect (e.g., test playing an "attack" card reduces enemy health; test a "resource" card increases credits). Requires adding target info to action payload.
    - Refine/Implement `PLAY_CARD` handler in `gameReducer` to pass the tests. Replace the generic `action.card.effect(state)` call with explicit `if/switch` logic based on `action.card.type` or `id` to apply simple, hardcoded effects directly to the state. Ensure validation is present.
4.  Update `TacticalView.tsx` interaction logic if needed to correctly dispatch `MOVE_PLAYER`. `CardHand.tsx` should already dispatch `SET_ACTIVE_CARD`.

Provide the TDD tests (failing first) and the subsequent refined/implemented `gameReducer` logic for `MOVE_PLAYER` and `PLAY_CARD`. Include any necessary updates to the action type definitions.
Use code with caution.
Prompt 3 (Rapid): Implement Basic Scenario Win/Loss Conditions (TDD)

Objective: Implement simple win/loss conditions within the tactical scenario handled by the reducer, following a TDD approach.

Requirements:

1.  Modify `client/src/context/GameContext.tsx`.
2.  Add state property: `scenarioOutcome: 'SUCCESS' | 'FAILURE' | null`. Initialize as `null`. (Keep `activeMission` as the identifier).
3.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx` for win/loss conditions:
      - Test state transitions to `scenarioOutcome: 'SUCCESS'` when `enemies` array becomes empty.
      - Test state transitions to `scenarioOutcome: 'FAILURE'` when `player.health` drops to 0 or below.
      - Test state transitions to `scenarioOutcome: 'FAILURE'` when `turnCount` exceeds a limit (e.g., 10).
    - Implement a helper function `checkScenarioEndCondition(state: GameState): GameState` within `GameContext.tsx` that checks these conditions and updates `scenarioOutcome`.
    - Call `checkScenarioEndCondition` from the `gameReducer` after actions that affect win/loss state (enemy health changes via `PLAY_CARD`, player health changes, start of `UPKEEP_PHASE` for turn limit).
4.  Modify `TacticalView.tsx`: Read `gameState.scenarioOutcome`. If not null, display a simple "Victory!" or "Defeat!" message overlay.

Provide the TDD tests, the `checkScenarioEndCondition` helper function, its integration points within the `gameReducer`, the state addition, and the UI overlay implementation for `TacticalView.tsx`.
Use code with caution.
Prompt 4 (Rapid): Implement Targeting Visualization & Interaction (TDD)

Objective: Implement simple targeting for cards in the tactical view, moving targeting state management into the GameContext, following a TDD approach.

Requirements:

1.  Modify `client/src/context/GameContext.tsx`.
    - Add state: `targetingMode: 'MOVE' | 'CARD' | null`, `targetableHexes: HexCoord[]`. Initialize as `null` and `[]`.
2.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx`:
      - Test `SET_ACTIVE_CARD` sets `activeCard`, calculates `targetableHexes` based on card range/type (use `getHexesInRange`), and sets `targetingMode = 'CARD'`.
      - Test successful `MOVE_PLAYER` or `PLAY_CARD` resets `targetingMode`, `targetableHexes`, `activeCard`.
      - Test `CANCEL_CARD` resets `targetingMode`, `targetableHexes`, `activeCard`.
    - Implement/Refine the handlers for `SET_ACTIVE_CARD`, `MOVE_PLAYER`, `PLAY_CARD`, `CANCEL_CARD` in `gameReducer` to manage the new targeting state and pass tests.
3.  Modify `TacticalView.tsx`:
    - Remove local `highlightedHexes` state.
    - Read `gameState.targetableHexes` from context and pass it to `HexGrid` as `highlightedHexes`.
    - Refine `handleHexClick`:
      - Check `gameState.targetingMode`.
      - If `'CARD'` and clicked `coord` is in `gameState.targetableHexes`, dispatch `PLAY_CARD` with card from `gameState.activeCard` and target info (coord, enemyId if applicable).
      - Else, dispatch `MOVE_PLAYER`.
4.  Modify `HexGrid.tsx`: Ensure it uses the `highlightedHexes` prop for visual feedback.

Provide the TDD tests, the `GameContext` state additions, the updated `gameReducer` logic for managing targeting state, the refined `handleHexClick` logic in `TacticalView.tsx`, and confirmation of `HexGrid.tsx` usage. Update `PLAY_CARD` action type if needed.
Use code with caution.
Phase 2: Connect Scenario Outcome to Overworld

Prompt 5 (Rapid): Implement Overworld State & View Switching (TDD)

Objective: Integrate basic Overworld state from `initialState`, allow switching between Tactical and Overworld views based on game state, and replace Router with conditional rendering.

Requirements:

1.  Modify `client/src/context/GameContext.tsx`.
    - Add state: `currentView: 'TACTICAL' | 'OVERWORLD' | 'MARKETPLACE' | 'PREP'`. Initialize to `'TACTICAL'` (or `'OVERWORLD'` if preferred starting point).
    - Verify `initialState` includes `territories` (using `generateTerritories`).
2.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx`:
      - Test that when `scenarioOutcome` is set (e.g., after `checkScenarioEndCondition`), the reducer action also sets `currentView = 'OVERWORLD'`.
      - Test that the reducer action resets relevant tactical state (`activeMission = null`, `enemies = []`, `scenarioOutcome = null`, etc.) when switching back to Overworld.
    - Implement the state transition logic within the `gameReducer` where `scenarioOutcome` is handled (likely after calling `checkScenarioEndCondition`). Apply Overworld effect (Prompt 6) _before_ resetting tactical state.
3.  Modify `App.tsx`:
    - Remove `BrowserRouter`, `Routes`, `Route` imports and usage.
    - Use `useGame` hook to get `gameState.currentView`.
    - Implement conditional rendering:
      ```jsx
      const { state } = useGame();
      let currentViewComponent;
      if (state.currentView === "TACTICAL") {
        currentViewComponent = <TacticalView />;
      } else if (state.currentView === "OVERWORLD") {
        currentViewComponent = <OverworldMap />;
      } else if (state.currentView === "MARKETPLACE") {
        currentViewComponent = <Marketplace />; // Needs territoryId prop? Context instead?
      } else if (state.currentView === "PREP") {
        currentViewComponent = <MissionPrep />; // Needs territoryId prop? Context instead?
      } else {
        currentViewComponent = <div>Unknown View</div>;
      }
      return (
        <div className="fixed inset-0 ...">
          <GameProvider>
            {" "}
            {/* GameProvider should likely wrap App content, not be inside App? Review structure */}
            {currentViewComponent}
          </GameProvider>
        </div>
      );
      ```
    - **Note:** Passing `territoryId` to Marketplace/Prep will need context state (`viewingTerritoryId` from Prompt 8) or removal of the URL param usage in those components. Adjust `Marketplace`/`MissionPrep` later.
4.  Ensure `OverworldMap.tsx` correctly uses `useGame` to get and render `gameState.territories`.

Provide the TDD tests, the `GameContext` state/reducer changes for view switching and state reset, and the updated conditional rendering logic for `App.tsx`. Discuss how `Marketplace`/`MissionPrep` will get their territory context without routing.
Use code with caution.
Prompt 6 (Rapid): Apply Scenario Outcome to Overworld State (TDD)

Objective: Modify the Overworld state (Territory influence) based on the outcome of the just-finished scenario within the reducer, following TDD.

Requirements:

1.  Modify `client/src/context/GameContext.tsx` (`gameReducer`).
2.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx` for applying scenario outcomes:
      - Test successful outcome decreases influence of the `activeMissionId` territory and increases `playerCredits`.
      - Test failure outcome increases/doesn't change influence and gives minimal/no credits.
      - Test that `controlledBy` status updates correctly based on the new influence level.
    - Implement the outcome application logic within the `gameReducer` where `scenarioOutcome` is handled (before resetting tactical state/switching view). Use `activeMissionId`, modify `territories` immutably, update `playerCredits`, call `updateTerritoryControl` helper.
3.  Ensure `calculateResourceGain` and `updateTerritoryControl` helper functions exist within `GameContext.tsx` or are correctly imported/used.

Provide the TDD tests and the updated section of the `gameReducer` that handles applying the scenario outcome to territory influence and player credits.
Use code with caution.
Phase 3: Basic Overworld Gameplay & Loop Reset

Prompt 7 (Rapid): Implement Simple Overworld Turn & Resource Gain (TDD)

Objective: Implement a basic Overworld turn concept within the reducer, primarily focused on gaining resources based on territory control, following TDD.

Requirements:

1.  Modify `client/src/context/GameContext.tsx`.
    - Add state: `overworldTurnCount: number`. Initialize to `1`.
2.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx` for the `END_OVERWORLD_TURN` action:
      - Test it correctly calculates credit gain based on controlled territories using `calculateResourceGain`.
      - Test it adds calculated credits to `playerCredits`.
      - Test it increments `overworldTurnCount`.
    - Add `END_OVERWORLD_TURN` action type to `GameAction`.
    - Implement the `END_OVERWORLD_TURN` handler in `gameReducer` to pass the tests.
3.  Modify `OverworldMap.tsx`:
    - Add an "End Overworld Turn" button.
    - Clicking it dispatches `END_OVERWORLD_TURN`.
    - Display `gameState.overworldTurnCount` and `gameState.playerCredits`.

Provide the TDD tests, the `END_OVERWORLD_TURN` reducer logic, the state addition, and the button/display additions for `OverworldMap.tsx`.
Use code with caution.
Prompt 8 (Rapid): Implement Transition from Overworld to Marketplace/Prep (TDD)

Objective: Define a trigger (clicking a mission territory) to transition from Overworld to a simple marketplace/prep state, managed by the reducer, following TDD.

Requirements:

1.  Modify `client/src/context/GameContext.tsx`.
    - Add state: `viewingTerritoryId: string | null`, `currentMarketplaceCards: Card[]`.
    - Update `currentView` type to include `'MARKETPLACE'`, `'PREP'`.
2.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx` for the `VIEW_TERRITORY_MARKETPLACE` action:
      - Test it only works if the territory exists and has `mission: true`.
      - Test it sets `viewingTerritoryId`.
      - Test it sets `currentView = 'MARKETPLACE'`.
      - Test it populates `currentMarketplaceCards` with a small, random selection from the full card pool (use `initialState.marketplaceCards` as the pool).
    - Add `VIEW_TERRITORY_MARKETPLACE` action type (payload `{ territoryId: string }`).
    - Implement the `VIEW_TERRITORY_MARKETPLACE` handler in `gameReducer` to pass tests. Use simple random sampling for marketplace generation.
3.  Modify `OverworldMap.tsx`:
    - Update the `onClick` handler for `TerritoryHex`: If `territory.mission` is true, dispatch `VIEW_TERRITORY_MARKETPLACE` with the `territory.id`. Otherwise, dispatch `SELECT_TERRITORY` as before.
4.  Modify `App.tsx`: Update conditional rendering logic to include `Marketplace` and `MissionPrep` components based on `gameState.currentView`.

Provide the TDD tests, the reducer action logic, state additions, `OverworldMap.tsx` interaction change, and `App.tsx` conditional rendering update.
Use code with caution.
Phase 4: Marketplace Interaction & Loop Closure

Prompt 9 (Rapid): Implement Basic Marketplace UI & Purchase (TDD)

Objective: Adapt the `Marketplace.tsx` component to display generated cards and allow purchasing via reducer actions, following TDD.

Requirements:

1.  Modify `client/src/components/Marketplace.tsx`.
    - Use `useGame` hook to get `gameState` (specifically `currentMarketplaceCards`, `playerCredits`, `viewingTerritoryId`) and `dispatch`.
    - Display cards from `gameState.currentMarketplaceCards`.
    - Display current `gameState.playerCredits`.
    - Implement "Buy Card" button: On click, dispatch `BUY_MARKETPLACE_CARD` with the `card` object.
    - Implement "Proceed to Mission Prep" button: On click, dispatch `GO_TO_MISSION_PREP` (or `INITIATE_MISSION` if skipping prep).
2.  Modify `client/src/context/GameContext.tsx` (`gameReducer`).
    - **TDD - Reducer Logic:**
      - Write failing tests in `GameContext.test.tsx` for `BUY_MARKETPLACE_CARD`:
        - Test it checks affordability (`playerCredits >= card.cost`).
        - Test successful purchase deducts credits.
        - Test successful purchase adds card to `playerDeck`.
        - Test successful purchase removes/disables card in `currentMarketplaceCards`.
        - Test failure due to cost adds notification and doesn't change state.
      - Add `BUY_MARKETPLACE_CARD` action type (payload `{ card: Card }`).
      - Implement the `BUY_MARKETPLACE_CARD` handler in `gameReducer` to pass tests.
    - Add `GO_TO_MISSION_PREP` action type and handler (simple view change: `currentView = 'PREP'`).

Provide the TDD tests, the `BUY_MARKETPLACE_CARD` and `GO_TO_MISSION_PREP` reducer logic, and the necessary adaptations for `Marketplace.tsx`.
Use code with caution.
Prompt 10 (Rapid): Implement Transition to Tactical View & Start Mission (TDD)

Objective: Implement the final loop step: transitioning from Marketplace/Prep back to the Tactical view via reducer action, resetting tactical state, following TDD.

Requirements:

1.  Modify `client/src/context/GameContext.tsx`.
2.  **TDD - Reducer Logic:**
    - Write failing tests in `GameContext.test.tsx` for the `INITIATE_MISSION` action:
      - Test it retrieves the correct territory based on `viewingTerritoryId`.
      - Test it generates appropriate enemies based on territory data.
      - Test it resets `player.position`, `player.health`, `player.energy`.
      - Test it shuffles `playerDeck` and draws the initial 5 cards into `playerHand`, clearing `playerDiscard`.
      - Test it resets `turnCount = 1` and `clicksRemaining`.
      - Test it sets `activeMission` to `viewingTerritoryId`.
      - Test it sets `currentView = 'TACTICAL'`.
      - Test it clears `viewingTerritoryId` and `currentMarketplaceCards`.
    - Add `INITIATE_MISSION` action type.
    - Implement or Refine the `INITIATE_MISSION` handler in `gameReducer` to pass tests. Reuse/adapt existing `START_MISSION` logic if applicable, ensuring all reset steps are covered.
3.  Modify `Marketplace.tsx` (or `MissionPrep.tsx`): Ensure the "Start Mission" or final "Proceed" button dispatches `INITIATE_MISSION`.
4.  **Manual Test:** Verify the full gameplay loop works: Tactical -> Win/Loss -> Overworld (see influence change) -> End Overworld Turn (get resources) -> Click Mission Territory -> Marketplace -> Buy Card -> Start Mission -> Back to Tactical (reset state, new card in deck/hand).

Provide the TDD tests, the `INITIATE_MISSION` reducer logic, and the necessary button dispatch change in the UI component.
