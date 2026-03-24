// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import StepMenu from "@/components/organisms/ReservationForm/StepMenu";
import type { Menu } from "@/db/schema";

// =============================================================================
// StepMenu Component Tests — revision-003 regression tests
//
// The component was changed from a 2-step category→menu UI to a single-screen
// grouped layout. On fetch failure / empty response it falls back to static
// FALLBACK_MENUS and shows a warning banner (no error screen).
// =============================================================================

const mockMenus: Menu[] = [
  {
    id: "menu-1",
    category: "acupuncture",
    name: "鍼灸治療コース",
    description: "肩こり腰痛に",
    duration: 60,
    price: 5000,
    targetSymptoms: "肩こり",
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "menu-2",
    category: "chiropractic",
    name: "整体コース",
    description: "骨格矯正",
    duration: 45,
    price: 4000,
    targetSymptoms: "腰痛",
    sortOrder: 2,
    isActive: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "menu-3",
    category: "massage",
    name: "リラクゼーションマッサージ",
    description: "全身リラクゼーション",
    duration: 30,
    price: 3000,
    targetSymptoms: null,
    sortOrder: 3,
    isActive: true,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

function mockFetchSuccess(menus: Menu[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ menus }),
    }),
  );
}

function mockFetchError() {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
}

function mockFetchHttpError(status = 500) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: () => Promise.resolve({ error: "Server error" }),
    }),
  );
}

function mockFetchPending() {
  vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));
}

describe("StepMenu", () => {
  const onSelect = vi.fn();
  const onNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ---------------------------------------------------------------------------
  // 1. Loading state
  // ---------------------------------------------------------------------------
  it("should show loading state initially", () => {
    mockFetchPending();
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    expect(screen.getByText("メニューを読み込み中...")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 2. Fallback behaviour — fetch error triggers fallback + warning banner
  // ---------------------------------------------------------------------------
  it("should fall back to static menus and show warning banner when fetch fails", async () => {
    mockFetchError();
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    // The warning banner should appear (use exact text on the <p> element)
    await waitFor(() => {
      expect(
        screen.getByText(/メニュー情報を取得できませんでした/),
      ).toBeInTheDocument();
    });
    // Fallback menus should be rendered — check a known fallback item
    expect(screen.getByText("はり治療")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 3. Fallback behaviour — HTTP error also triggers fallback
  // ---------------------------------------------------------------------------
  it("should fall back to static menus when HTTP error status is returned", async () => {
    mockFetchHttpError(500);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(
        screen.getByText(/メニュー情報を取得できませんでした/),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("はり治療")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 4. Fallback behaviour — empty menu array triggers fallback
  // ---------------------------------------------------------------------------
  it("should fall back to static menus when API returns empty array", async () => {
    mockFetchSuccess([]);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      // Fallback menus rendered
      expect(screen.getByText("はり治療")).toBeInTheDocument();
    });
    // Warning banner should be shown
    expect(
      screen.getByText(/メニュー情報を取得できませんでした/),
    ).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 5. Fallback behaviour — non-array response
  // ---------------------------------------------------------------------------
  it("should handle API returning non-array menus gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ menus: null }),
      }),
    );
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      // Falls back to static menus
      expect(screen.getByText("はり治療")).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Auto-retry: fetch is called multiple times before falling back
  // ---------------------------------------------------------------------------
  it("should retry fetch before falling back (MAX_RETRIES = 2)", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", fetchMock);

    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );

    await waitFor(() => {
      expect(screen.getByText("はり治療")).toBeInTheDocument();
    });

    // Should have been called twice (MAX_RETRIES = 2)
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  // ---------------------------------------------------------------------------
  // 7. All categories rendered in a single screen (no category buttons)
  // ---------------------------------------------------------------------------
  it("should render all category groups in one screen when menus loaded", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      // Category headings
      expect(screen.getByText("鍼灸")).toBeInTheDocument();
      expect(screen.getByText("整体")).toBeInTheDocument();
      expect(screen.getByText("マッサージ")).toBeInTheDocument();
    });
    // All menus visible without clicking any category
    expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    expect(screen.getByText("整体コース")).toBeInTheDocument();
    expect(screen.getByText("リラクゼーションマッサージ")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 8. Selecting a menu calls onSelect
  // ---------------------------------------------------------------------------
  it("should call onSelect when a menu item is clicked", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("鍼灸治療コース"));
    expect(onSelect).toHaveBeenCalledWith(mockMenus[0]);
  });

  // ---------------------------------------------------------------------------
  // 9. Next button disabled when no menu selected
  // ---------------------------------------------------------------------------
  it("should show next button disabled when no menu selected", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("次へ")).toBeInTheDocument();
    });
    expect(screen.getByText("次へ").closest("button")).toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // 10. Next button enabled when a menu is selected
  // ---------------------------------------------------------------------------
  it("should enable next button when a menu is selected", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId="menu-1" onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("次へ")).toBeInTheDocument();
    });
    expect(screen.getByText("次へ").closest("button")).not.toBeDisabled();
  });

  // ---------------------------------------------------------------------------
  // 11. Price and duration displayed
  // ---------------------------------------------------------------------------
  it("should display price and duration for menu items", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    // Price and duration are visible without clicking a category
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
    expect(screen.getByText(/60/)).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 12. Visual feedback (check mark) for selected menu
  // ---------------------------------------------------------------------------
  it("should show visual feedback for selected menu", async () => {
    mockFetchSuccess(mockMenus);
    const { container } = render(
      <StepMenu selectedMenuId="menu-1" onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    // Check mark SVG should be present for selected item
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // 13. No warning banner when API succeeds
  // ---------------------------------------------------------------------------
  it("should not show fallback warning banner when API succeeds", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    expect(
      screen.queryByText(/メニュー情報を取得できませんでした/),
    ).not.toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // 14. StepMenuProps interface unchanged — selectedMenuId, onSelect, onNext
  // ---------------------------------------------------------------------------
  it("should accept the documented StepMenuProps interface", async () => {
    mockFetchSuccess(mockMenus);
    // This test verifies that the component renders without type errors
    // when called with { selectedMenuId, onSelect, onNext }
    const { unmount } = render(
      <StepMenu selectedMenuId="menu-1" onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    unmount();
  });
});
