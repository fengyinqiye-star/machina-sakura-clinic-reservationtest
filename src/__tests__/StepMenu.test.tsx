// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import StepMenu from "@/components/organisms/ReservationForm/StepMenu";
import type { Menu } from "@/db/schema";

// =============================================================================
// StepMenu Component Tests (Regression target: modified component)
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

  it("should show loading state initially", () => {
    mockFetchPending();
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    expect(screen.getByText("メニューを読み込み中...")).toBeInTheDocument();
  });

  it("should display error state and retry button when fetch fails", async () => {
    mockFetchError();
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("メニューの読み込みに失敗しました。")).toBeInTheDocument();
    });
    expect(screen.getByText("再読み込み")).toBeInTheDocument();
  });

  it("should retry fetch when retry button is clicked", async () => {
    let callCount = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ menus: mockMenus }),
        });
      }),
    );

    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );

    await waitFor(() => {
      expect(screen.getByText("再読み込み")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("再読み込み"));

    await waitFor(() => {
      expect(screen.getByText("カテゴリを選択してください")).toBeInTheDocument();
    });
    expect(callCount).toBe(2);
  });

  it("should display empty state when no menus available", async () => {
    mockFetchSuccess([]);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(
        screen.getByText("現在ご予約可能なメニューがありません。お電話にてお問い合わせください。"),
      ).toBeInTheDocument();
    });
  });

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
      expect(
        screen.getByText("現在ご予約可能なメニューがありません。お電話にてお問い合わせください。"),
      ).toBeInTheDocument();
    });
  });

  it("should handle HTTP error status codes", async () => {
    mockFetchHttpError(500);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("メニューの読み込みに失敗しました。")).toBeInTheDocument();
    });
  });

  it("should render category buttons when menus loaded", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸")).toBeInTheDocument();
      expect(screen.getByText("整体")).toBeInTheDocument();
      expect(screen.getByText("マッサージ")).toBeInTheDocument();
    });
  });

  it("should filter menus by category on click", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("鍼灸"));
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    expect(screen.queryByText("整体コース")).not.toBeInTheDocument();
    expect(screen.queryByText("リラクゼーションマッサージ")).not.toBeInTheDocument();
  });

  it("should call onSelect when a menu item is clicked", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("鍼灸"));
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("鍼灸治療コース"));
    expect(onSelect).toHaveBeenCalledWith(mockMenus[0]);
  });

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

  it("should display price and duration for menu items", async () => {
    mockFetchSuccess(mockMenus);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("鍼灸"));
    await waitFor(() => {
      expect(screen.getByText("5,000円")).toBeInTheDocument();
      expect(screen.getByText("60分")).toBeInTheDocument();
    });
  });

  it("should show visual feedback for selected menu", async () => {
    mockFetchSuccess(mockMenus);
    const { container } = render(
      <StepMenu selectedMenuId="menu-1" onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("鍼灸")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("鍼灸"));
    await waitFor(() => {
      expect(screen.getByText("鍼灸治療コース")).toBeInTheDocument();
    });
    // Check mark SVG should be present for selected item
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("should show message when category has no menus", async () => {
    mockFetchSuccess([mockMenus[0]]);
    render(
      <StepMenu selectedMenuId={null} onSelect={onSelect} onNext={onNext} />,
    );
    await waitFor(() => {
      expect(screen.getByText("整体")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("整体"));
    await waitFor(() => {
      expect(screen.getByText("このカテゴリにはメニューがありません。")).toBeInTheDocument();
    });
  });
});
