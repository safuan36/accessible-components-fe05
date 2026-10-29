# Accessible Component Fundamentals (FE-05)

> **Track**: Frontend AI Engineering · Week 4 (Foundations Phase)  
> **Assignment**: `FE-05` · Accessible Component Fundamentals  
> **Tech Stack**: React 18, TypeScript (Strict), Tailwind CSS, Vite

---

## 📖 Overview

AI assistants generate components fast, and they generate inaccessible ones just as fast. You cannot review what you do not understand, so this project builds three foundational components strictly by hand in plain **React + TypeScript** following the **W3C WAI-ARIA Authoring Practices Guide (APG)**, side-by-side with **shadcn/ui** (Radix primitives) for deep architectural auditing.

---

## 🛠️ The Hand-Built Components (`playground/`)

Built strictly from scratch with **zero third-party UI libraries** and strict TypeScript (zero `any` escapes):

1. **Modal Dialog (`playground/Modal.tsx`, `playground/useFocusTrap.ts`)**
   - Conforms to [W3C APG Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).
   - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`.
   - **Focus Trapping**: <kbd>Tab</kbd> and <kbd>Shift+Tab</kbd> loop exclusively within dialog focusable items.
   - **Focus Restoration**: Automatically returns focus to the opening trigger element upon close.
   - **Dismissal**: Closes on <kbd>Escape</kbd> or backdrop click.

2. **Tabs (`playground/Tabs.tsx`)**
   - Conforms to [W3C APG Tabs Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
   - `role="tablist"` (`aria-orientation="horizontal"`), `role="tab"`, `role="tabpanel"`.
   - **Roving Tabindex**: Only active/focused tab has `tabIndex={0}`; inactive tabs have `tabIndex={-1}`.
   - **Keyboard Navigation**: <kbd>←</kbd> and <kbd>→</kbd> navigate with wraparound; <kbd>Home</kbd> / <kbd>End</kbd> jump to boundaries.
   - **Focus Handoff**: <kbd>Tab</kbd> moves directly from the tablist into the active `tabpanel` (`tabIndex={0}`).

3. **Disclosure (`playground/Disclosure.tsx`)**
   - Conforms to [W3C APG Disclosure Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).
   - Native `<button type="button">` trigger with `aria-expanded` and `aria-controls`.
   - Content container with `role="region"` and `aria-labelledby`.
   - Native <kbd>Enter</kbd> / <kbd>Space</kbd> activation; natural <kbd>Tab</kbd> progression into revealed content.

---

## 🔬 Benchmark Comparison (shadcn/ui)

- **Dialog**: `src/components/ui/dialog.tsx` (wrapping `@radix-ui/react-dialog`)
- **Tabs**: `src/components/ui/tabs.tsx` (wrapping `@radix-ui/react-tabs`)
- **Interactive Playground**: `src/App.tsx` featuring side-by-side live comparison and an **Active Focus Inspector** tracking `document.activeElement` in real time.

---

## 📑 In-Depth Gap Analysis (`NOTES.md`)

The [NOTES.md](./NOTES.md) deliverable details **7 concrete architectural and accessibility gaps** between handcrafted implementations and shadcn/Radix:
1. **Stacking Context & Portaling**: Radix renders dialogs via `createPortal` into `document.body` to avoid clipping caused by parent `transform`, `filter`, or `overflow: hidden`.
2. **Scroll Locking & Layout Shift**: Prevents ~15px layout shift by measuring scrollbar width and injecting compensatory padding.
3. **Background Inactivation (`aria-hidden`/`inert`)**: Explicitly hides sibling DOM trees so screen reader virtual cursors cannot escape.
4. **Pointer Event Boundary Handling**: Prevents accidental modal dismissal when selecting text inside an input and releasing mouse over the backdrop.
5. **Nested Modals Dismissal Stack**: LIFO stack ensures <kbd>Escape</kbd> only dismisses the uppermost modal layer.
6. **Polymorphic Triggers (`asChild`)**: Merges props cleanly onto custom triggers without invalid nested `<button>` markup.
7. **RTL Directional Navigation**: Inverts arrow key navigation for Right-to-Left languages.

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Type Checking & Build
```bash
# Type check with strict compilation (0 any escapes)
npm run typecheck

# Production build
npm run build
```

### Run Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser and test the components entirely using the keyboard.
