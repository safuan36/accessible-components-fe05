import { useState, useEffect, useRef } from "react";
import { Modal } from "@playground/Modal";
import { Tabs, TabList, Tab, TabPanel } from "@playground/Tabs";
import { Disclosure } from "@playground/Disclosure";

// shadcn reference components
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogDescription as ShadcnDialogDescription,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogTrigger as ShadcnDialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from "@/components/ui/tabs";

export function App() {
  // Hand-built Modal state
  const [isHandbuiltModalOpen, setIsHandbuiltModalOpen] = useState(false);
  const [modalFeedback, setModalFeedback] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Active element focus inspector for a11y testing
  const [activeElementInfo, setActiveElementInfo] = useState<string>("None");

  useEffect(() => {
    const updateActiveElement = () => {
      const el = document.activeElement;
      if (!el) {
        setActiveElementInfo("None");
        return;
      }
      const tag = el.tagName.toLowerCase();
      const id = el.id ? `#${el.id}` : "";
      const role = el.getAttribute("role") ? `[role="${el.getAttribute("role")}"]` : "";
      const text = (el.textContent || "").trim().slice(0, 20);
      setActiveElementInfo(`${tag}${id}${role} ("${text}")`);
    };

    document.addEventListener("focusin", updateActiveElement);
    document.addEventListener("keyup", updateActiveElement);
    return () => {
      document.removeEventListener("focusin", updateActiveElement);
      document.removeEventListener("keyup", updateActiveElement);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-12">
      {/* Header */}
      <header className="border-b border-slate-200 pb-6">
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold tracking-wide uppercase mb-2">
          FE-05 · Foundations
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Accessible Component Fundamentals Playground
        </h1>
        <p className="mt-2 text-slate-600 max-w-3xl">
          Three interactive W3C WAI-ARIA APG compliant components constructed strictly from scratch
          using plain React + TypeScript, side-by-side with shadcn/ui (Radix Primitives) for structural gap analysis.
        </p>

        {/* Live A11y Focus Inspector */}
        <div className="mt-4 p-3 bg-slate-900 text-slate-200 rounded-lg flex items-center justify-between text-xs font-mono shadow-inner">
          <span className="text-emerald-400 font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Focus:
          </span>
          <span className="truncate max-w-md">{activeElementInfo}</span>
        </div>
      </header>

      {/* SECTION 1: MODAL DIALOG */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              1. Modal Dialog (W3C APG Pattern)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Features focus trapping (<kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Tab</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Shift+Tab</kbd>), focus restoration to opening trigger, and <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Escape</kbd> key dismissal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2.5 py-1 bg-green-100 text-green-800 rounded-full">
              Zero External Libraries
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hand-built version */}
          <div className="p-5 rounded-lg border-2 border-blue-200 bg-blue-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 text-sm">
                Hand-Built Implementation
              </span>
              <span className="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono">
                playground/Modal.tsx
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Click open or focus with keyboard and press <kbd className="font-mono bg-white px-1 border rounded">Space</kbd> or <kbd className="font-mono bg-white px-1 border rounded">Enter</kbd>. Notice focus returns here when closed.
            </p>

            <button
              type="button"
              id="handbuilt-modal-trigger-btn"
              onClick={() => setIsHandbuiltModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors shadow-sm"
            >
              Open Hand-Built Modal
            </button>

            {modalFeedback && (
              <p className="text-xs text-emerald-700 font-medium">
                Last submitted: {modalFeedback}
              </p>
            )}

            <Modal
              isOpen={isHandbuiltModalOpen}
              onClose={() => setIsHandbuiltModalOpen(false)}
              title="Accessible Preferences Modal"
              description="This dialog implements the W3C APG Modal pattern with strict focus trapping."
              initialFocusRef={inputRef}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setModalFeedback("Preferences saved!");
                  setIsHandbuiltModalOpen(false);
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="username-input"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Display Name (Initial Focus)
                  </label>
                  <input
                    ref={inputRef}
                    id="username-input"
                    type="text"
                    defaultValue="Jane Doe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notify-select"
                    className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
                  >
                    Notification Frequency
                  </label>
                  <select
                    id="notify-select"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option>Daily Digest</option>
                    <option>Weekly Summary</option>
                    <option>Real-Time</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsHandbuiltModalOpen(false)}
                    className="px-3.5 py-1.5 text-sm text-slate-700 hover:bg-slate-100 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-sm bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </Modal>
          </div>

          {/* shadcn version */}
          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">
                shadcn / Radix Benchmark
              </span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                components/ui/dialog.tsx
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Benchmark implementation using Radix Dialog Primitive. Uses document.body portal, scroll locking padding injection, and inert sibling hiding.
            </p>

            <ShadcnDialog>
              <ShadcnDialogTrigger asChild>
                <button
                  type="button"
                  id="shadcn-dialog-trigger-btn"
                  className="px-4 py-2 bg-slate-900 text-white font-medium text-sm rounded-lg hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-colors shadow-sm"
                >
                  Open shadcn Dialog
                </button>
              </ShadcnDialogTrigger>
              <ShadcnDialogContent>
                <ShadcnDialogHeader>
                  <ShadcnDialogTitle>shadcn / Radix Dialog</ShadcnDialogTitle>
                  <ShadcnDialogDescription>
                    Inspected source uses @radix-ui/react-dialog with portal rendering and automatic inert application on root siblings.
                  </ShadcnDialogDescription>
                </ShadcnDialogHeader>
                <div className="space-y-3 py-2 text-sm text-slate-700">
                  <p>
                    Notice how this modal is injected into a Portal at <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">&lt;body&gt;</code> rather than residing within the local React component subtree.
                  </p>
                  <input
                    type="text"
                    placeholder="Focusable test input inside Radix..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </ShadcnDialogContent>
            </ShadcnDialog>
          </div>
        </div>
      </section>

      {/* SECTION 2: TABS */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            2. Accessible Tabs (W3C APG Pattern)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Features roving tabindex (<code className="text-xs font-mono">tabIndex=0</code> on active tab, <code className="text-xs font-mono">-1</code> on inactive tabs). Navigate between tabs using <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">ArrowLeft</kbd> and <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">ArrowRight</kbd> (or <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Home</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">End</kbd>). Pressing <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Tab</kbd> moves directly into the tabpanel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hand-built Tabs */}
          <div className="p-5 rounded-lg border-2 border-blue-200 bg-blue-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-blue-900 text-sm">
                Hand-Built Tabs (Roving Tabindex)
              </span>
              <span className="text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono">
                playground/Tabs.tsx
              </span>
            </div>

            <Tabs defaultValue="overview">
              <TabList aria-label="Project Sections">
                <Tab value="overview">Overview</Tab>
                <Tab value="specs">ARIA Spec</Tab>
                <Tab value="keyboard">Keyboard Map</Tab>
              </TabList>

              <TabPanel value="overview">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">
                  Accessible Fundamentals Overview
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Screen readers announce the active tab and its position (e.g. "Tab 1 of 3"). Only the active tab is in the natural tab order.
                </p>
              </TabPanel>

              <TabPanel value="specs">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">
                  ARIA Contract Verified
                </h4>
                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                  <li><code>role="tablist"</code> with <code>aria-orientation="horizontal"</code></li>
                  <li><code>role="tab"</code> with dynamic <code>aria-selected</code></li>
                  <li><code>role="tabpanel"</code> with <code>tabIndex={0}</code> for keyboard scrolling</li>
                </ul>
              </TabPanel>

              <TabPanel value="keyboard">
                <h4 className="font-semibold text-sm text-slate-900 mb-1">
                  Supported Key Sequences
                </h4>
                <p className="text-xs text-slate-600">
                  Left/Right arrow cycles between tabs with boundary wraparound. Home jumps to first tab; End jumps to last tab.
                </p>
              </TabPanel>
            </Tabs>
          </div>

          {/* shadcn Tabs */}
          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">
                shadcn / Radix Benchmark
              </span>
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                components/ui/tabs.tsx
              </span>
            </div>

            <ShadcnTabs defaultValue="account">
              <ShadcnTabsList>
                <ShadcnTabsTrigger value="account">Account</ShadcnTabsTrigger>
                <ShadcnTabsTrigger value="security">Security</ShadcnTabsTrigger>
                <ShadcnTabsTrigger value="billing">Billing</ShadcnTabsTrigger>
              </ShadcnTabsList>
              <ShadcnTabsContent value="account" className="text-xs text-slate-600 p-2">
                Manage your account profile settings and contact details.
              </ShadcnTabsContent>
              <ShadcnTabsContent value="security" className="text-xs text-slate-600 p-2">
                Configure two-factor authentication and active sessions.
              </ShadcnTabsContent>
              <ShadcnTabsContent value="billing" className="text-xs text-slate-600 p-2">
                Review subscription invoices and payment methods.
              </ShadcnTabsContent>
            </ShadcnTabs>
          </div>
        </div>
      </section>

      {/* SECTION 3: DISCLOSURE */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            3. Disclosure (W3C APG Pattern)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Built using a native <code className="text-xs font-mono">&lt;button&gt;</code> trigger with <code className="text-xs font-mono">aria-expanded</code> and <code className="text-xs font-mono">aria-controls</code> linking to the controlled region. Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-xs">Space</kbd> to toggle.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl">
          <Disclosure
            title="What is the difference between a Disclosure and an Accordion?"
            defaultExpanded={true}
          >
            A disclosure controls the visibility of a single section of content. An accordion is typically a composite grouping of multiple disclosures where opening one may optionally collapse others. Both rely on the same fundamental <code>aria-expanded</code> and <code>aria-controls</code> attributes.
          </Disclosure>

          <Disclosure
            title="Why must the trigger be a native <button> element?"
          >
            Native buttons have built-in keyboard operability (responding to both <kbd className="font-mono bg-slate-100 px-1 border rounded text-xs">Enter</kbd> and <kbd className="font-mono bg-slate-100 px-1 border rounded text-xs">Space</kbd>), are inherently focusable without custom <code>tabindex</code> hacks, and report their role correctly to assistive technologies without needing manual ARIA overrides.
          </Disclosure>

          <Disclosure
            title="How does focus flow when the disclosure is expanded?"
          >
            When a disclosure is expanded, pressing <kbd className="font-mono bg-slate-100 px-1 border rounded text-xs">Tab</kbd> naturally advances focus to the next focusable item inside the disclosed region (or the next item in document order if the region has no focusable elements). Focus should never be forcefully hijacked on disclosure open.
          </Disclosure>
        </div>
      </section>

      {/* SECTION 4: KEYBOARD VERIFICATION CHECKLIST */}
      <section className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span>⌨️</span> Keyboard Navigation Verification Matrix
        </h3>
        <p className="text-xs text-slate-300">
          You can test this entire page without touching your mouse. Confirm every requirement passes:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
            <h4 className="font-semibold text-blue-400">Modal Dialog</h4>
            <ul className="space-y-1 text-slate-300">
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">Tab</kbd> traps inside modal loop</li>
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">Shift+Tab</kbd> reverse traps</li>
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">Escape</kbd> dismisses modal</li>
              <li>✓ Focus returns to opening trigger</li>
            </ul>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
            <h4 className="font-semibold text-emerald-400">Tabs</h4>
            <ul className="space-y-1 text-slate-300">
              <li>✓ Only selected tab has <code className="text-emerald-300">tabIndex=0</code></li>
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">←</kbd> / <kbd className="bg-slate-700 px-1 rounded">→</kbd> navigate with wraparound</li>
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">Home</kbd> / <kbd className="bg-slate-700 px-1 rounded">End</kbd> go to boundaries</li>
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">Tab</kbd> moves directly into panel</li>
            </ul>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 space-y-2">
            <h4 className="font-semibold text-amber-400">Disclosure</h4>
            <ul className="space-y-1 text-slate-300">
              <li>✓ <kbd className="bg-slate-700 px-1 rounded">Space</kbd> / <kbd className="bg-slate-700 px-1 rounded">Enter</kbd> toggles open/close</li>
              <li>✓ <code className="text-amber-300">aria-expanded</code> updates accurately</li>
              <li>✓ Panel linked with <code className="text-amber-300">aria-controls</code></li>
              <li>✓ Hidden attribute prevents virtual cursor reading</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
