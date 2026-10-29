import React, {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";

export type TabsOrientation = "horizontal" | "vertical";
export type TabsActivationMode = "automatic" | "manual";

interface TabsContextValue {
  selectedTab: string;
  focusedTab: string | null;
  selectTab: (tabId: string) => void;
  setFocusedTab: (tabId: string | null) => void;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
  baseId: string;
  registerTab: (tabId: string, node: HTMLElement | null) => void;
  tabOrder: string[];
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(componentName: string): TabsContextValue {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`<${componentName} /> must be used within a <Tabs /> container.`);
  }
  return context;
}

export interface TabsProps {
  /**
   * The value of the initially selected tab for uncontrolled mode.
   */
  defaultValue?: string;
  /**
   * The controlled value of the selected tab.
   */
  value?: string;
  /**
   * Callback fired when the active tab changes.
   */
  onValueChange?: (value: string) => void;
  /**
   * Orientation of the tablist: horizontal or vertical. Default: 'horizontal'.
   */
  orientation?: TabsOrientation;
  /**
   * 'automatic' activates on arrow navigation; 'manual' requires Enter or Space.
   * Default: 'automatic'.
   */
  activationMode?: TabsActivationMode;
  /**
   * Custom CSS classes.
   */
  className?: string;
  children: React.ReactNode;
}

/**
 * Root Tabs component managing active tab state and roving tabindex coordination.
 */
export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  className = "",
  children,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(
    defaultValue ?? ""
  );
  const [focusedTab, setFocusedTab] = useState<string | null>(null);
  const baseId = useId();
  const tabsMapRef = useRef<Map<string, HTMLElement>>(new Map());
  const [tabOrder, setTabOrder] = useState<string[]>([]);

  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const selectTab = useCallback(
    (newTab: string) => {
      if (!isControlled) {
        setUncontrolledValue(newTab);
      }
      onValueChange?.(newTab);
    },
    [isControlled, onValueChange]
  );

  const registerTab = useCallback((tabId: string, node: HTMLElement | null) => {
    if (node) {
      tabsMapRef.current.set(tabId, node);
    } else {
      tabsMapRef.current.delete(tabId);
    }
    setTabOrder(Array.from(tabsMapRef.current.keys()));
  }, []);

  // Default to first tab once registered if no tab is selected
  useEffect(() => {
    if (!activeTab && tabOrder.length > 0) {
      selectTab(tabOrder[0]);
    }
  }, [activeTab, tabOrder, selectTab]);

  return (
    <TabsContext.Provider
      value={{
        selectedTab: activeTab,
        focusedTab,
        selectTab,
        setFocusedTab,
        orientation,
        activationMode,
        baseId,
        registerTab,
        tabOrder,
      }}
    >
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  /**
   * Accessible label describing the purpose of the tab set.
   */
  "aria-label"?: string;
  /**
   * ID of an element labeling the tab set.
   */
  "aria-labelledby"?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * TabList component conforming to role="tablist".
 * Manages keyboard navigation with Arrow keys, Home, and End via roving tabindex.
 */
export function TabList({
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  className = "",
  children,
}: TabListProps) {
  const { orientation, activationMode, selectTab, setFocusedTab, tabOrder } =
    useTabsContext("TabList");
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // When focus leaves the tablist entirely, reset focusedTab so selectedTab regains tabIndex=0
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setFocusedTab(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (tabOrder.length === 0) return;

    const currentFocusedElement = document.activeElement as HTMLElement | null;
    const currentTabId = currentFocusedElement?.getAttribute("data-tab-id");
    let currentIndex = currentTabId ? tabOrder.indexOf(currentTabId) : 0;
    if (currentIndex === -1) currentIndex = 0;

    let targetIndex: number | null = null;

    if (orientation === "horizontal") {
      if (e.key === "ArrowRight") {
        targetIndex = (currentIndex + 1) % tabOrder.length;
      } else if (e.key === "ArrowLeft") {
        targetIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
      }
    } else {
      // vertical orientation
      if (e.key === "ArrowDown") {
        targetIndex = (currentIndex + 1) % tabOrder.length;
      } else if (e.key === "ArrowUp") {
        targetIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
      }
    }

    if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = tabOrder.length - 1;
    }

    if (targetIndex !== null) {
      e.preventDefault();
      const targetTabId = tabOrder[targetIndex];
      const targetNode = listRef.current?.querySelector<HTMLElement>(
        `[data-tab-id="${targetTabId}"]`
      );

      if (targetNode) {
        targetNode.focus();
        setFocusedTab(targetTabId);
        if (activationMode === "automatic") {
          selectTab(targetTabId);
        }
      }
    }
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-orientation={orientation}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-slate-600 ${
        orientation === "vertical" ? "flex-col items-stretch" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export interface TabProps {
  /**
   * Unique identifier for this tab matching a corresponding TabPanel value.
   */
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Tab button conforming to role="tab".
 * Implements roving tabindex: tabIndex={0} when selected or focused, -1 otherwise.
 */
export function Tab({
  value,
  disabled = false,
  className = "",
  children,
}: TabProps) {
  const {
    selectedTab,
    focusedTab,
    selectTab,
    setFocusedTab,
    baseId,
    registerTab,
    activationMode,
  } = useTabsContext("Tab");

  const isSelected = selectedTab === value;
  const isFocused = focusedTab === value;
  // In roving tabindex, the active tab stop is either the currently focused tab or the selected tab
  const isTabStop = focusedTab !== null ? isFocused : isSelected;

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    registerTab(value, buttonRef.current);
    return () => registerTab(value, null);
  }, [value, registerTab]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (activationMode === "manual" && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      selectTab(value);
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      role="tab"
      id={tabId}
      aria-selected={isSelected}
      aria-controls={panelId}
      data-tab-id={value}
      tabIndex={isTabStop ? 0 : -1}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          selectTab(value);
          setFocusedTab(value);
        }
      }}
      onFocus={() => {
        if (!disabled) {
          setFocusedTab(value);
        }
      }}
      onKeyDown={handleKeyDown}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${
        isSelected
          ? "bg-white text-slate-900 shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export interface TabPanelProps {
  /**
   * Matches the Tab value this panel belongs to.
   */
  value: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * TabPanel conforming to role="tabpanel".
 * Sets tabIndex={0} per W3C APG so users can focus and scroll the panel
 * when navigating by keyboard, and references aria-labelledby of its tab.
 */
export function TabPanel({
  value,
  className = "",
  children,
}: TabPanelProps) {
  const { selectedTab, baseId } = useTabsContext("TabPanel");
  const isSelected = selectedTab === value;

  const tabId = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      className={`mt-3 p-4 rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${className}`}
    >
      {children}
    </div>
  );
}
