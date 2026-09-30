# ColdGuard Option Transition Plan

## Goal
Add one consistent, smooth transition treatment when users switch between the four options in both interactive areas:

1. **“Strict limits. Clear escalation.”** operating-threshold tabs.
2. **“Put the monitoring logic to the test.”** simulator controls.

The effect should make the content change feel polished without delaying interaction or distracting from urgent status information.

## Current implementation findings

- The threshold selector uses the local Shadcn-style wrappers around Radix Tabs in `src/components/ui/tabs.tsx`.
- Each threshold option renders a `TabsContent` panel in `src/App.tsx`.
- The simulator uses React state in `src/App.tsx`; its four buttons update `activeScenario`, which updates the telemetry card and status card.
- Button and tab triggers already have color/shadow transitions, but the changing content itself currently swaps immediately.
- `src/index.css` already contains a reduced-motion media query and is the correct location for a shared motion primitive.
- No additional animation dependency is needed.

## Implementation approach

### 1. Add a shared content-switch animation

Update `src/index.css` with a reusable motion class and keyframes:

- Duration: approximately 280ms.
- Easing: a smooth ease-out curve.
- Start state: slightly lowered, subtly softened, and transparent.
- End state: natural position, fully sharp, and fully opaque.
- Animate only `opacity`, `transform`, and a very light `filter` transition to keep rendering smooth.
- Use the same class in both requested sections so the interaction language is consistent.

Extend the existing `prefers-reduced-motion: reduce` block so the content-switch animation is disabled for users who request reduced motion. The active option will still change instantly and remain fully usable.

### 2. Animate threshold tab content

In the `Thresholds` component in `src/App.tsx`:

- Apply the shared content-switch class to each `TabsContent` panel.
- Radix Tabs mounts the selected panel when its tab becomes active, which will naturally replay the entry animation on each option change.
- Preserve Radix keyboard navigation, focus handling, selected state, and all current threshold content.
- Keep the existing trigger color/shadow transition so the selected control and its associated panel move together visually.

If preview validation shows Radix preserving a panel without replaying the animation, convert the tabs to controlled state and key the displayed panel by the selected threshold ID. This is the fallback only; the simpler Radix-native behavior is preferred.

### 3. Animate simulator content

In the `Simulator` component in `src/App.tsx`:

- Key the simulator result area by the active scenario ID so React creates a fresh animated panel whenever the user chooses a different mode.
- Apply the exact same shared content-switch class used by the threshold panel.
- Animate the complete result composition—the telemetry card and its companion status card—as one coordinated region to avoid mismatched timing.
- Keep the four selector buttons stationary; only their existing active-state styling transitions while the result region fades/slides into its new state.
- Preserve `aria-pressed` and the existing `aria-live` status announcement.
- Preserve the shared state that also updates the hero telemetry preview. The hero can continue updating immediately; the requested transition is scoped to the simulator interaction region.

### 4. Avoid layout instability

- Do not add absolute positioning or fixed panel heights.
- Keep the current responsive grid and natural content height.
- Use a small vertical movement so mobile and desktop layouts do not appear to jump.
- Do not animate emergency colors slowly; critical red, offline gray, and safe green states should become semantically apparent immediately while the panel completes its short entrance.

## Files to change

- `src/index.css`
  - Add shared content-switch keyframes and utility class.
  - Add reduced-motion override.
- `src/App.tsx`
  - Apply the shared class to threshold tab panels.
  - Key and animate the simulator result region on scenario changes.

No dependency, component API, routing, content, or data-model changes are required.

## Verification

1. In the running preview, switch repeatedly among Air Temp, Food Temp, Humidity, and Gas/VOC.
   - Confirm each selected panel enters with the same smooth fade/slide treatment.
   - Confirm keyboard arrow navigation and focus rings still work.
2. Switch repeatedly among Normal, Temp Spike, Gas Leak, and Disconnect.
   - Confirm the telemetry and status panels animate together.
   - Confirm values, state colors, icons, alerts, and the hero telemetry state remain correct.
3. Test mobile and desktop widths for clipping, overflow, or layout jumps.
4. Enable reduced-motion emulation and confirm both regions update without animation.
5. Run `pnpm build` and require a successful production build.
