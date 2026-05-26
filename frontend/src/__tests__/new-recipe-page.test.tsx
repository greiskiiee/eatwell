import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewRecipePage from "@/app/new-recipe/page";
import { AUTH_TOKEN_KEY } from "@/lib/auth";
import type { IngredientEntry } from "@/lib/ingredients";

const mockReplace = jest.fn();
const mockUseUser = jest.fn();

const mockIngredient: IngredientEntry = {
  food: {
    fdcId: 1,
    description: "Chicken breast",
    nutrients: { calories: 165, proteinG: 31, carbsG: 0, fatG: 3.6 },
  },
  amount: 200,
  unit: "g",
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
}));

jest.mock("@/context/UserContext", () => ({
  useUser: () => mockUseUser(),
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock("@/components/IngredientPicker", () => ({
  IngredientPicker: ({
    onChange,
  }: {
    value: IngredientEntry[];
    onChange: (v: IngredientEntry[]) => void;
  }) => (
    <button
      type="button"
      data-testid="mock-add-ingredient"
      onClick={() => onChange([mockIngredient])}
    >
      Add test ingredient
    </button>
  ),
}));

jest.mock("@/components/MultiImageUpload", () => ({
  MultiImageUpload: () => <div data-testid="image-upload" />,
}));

const technologist = {
  id: "tech-1",
  email: "tech@test.com",
  name: "Test Technologist",
  role: "technologist" as const,
};

function renderNewRecipePage() {
  return render(<NewRecipePage />);
}

function fillTitle(value: string) {
  fireEvent.change(screen.getByPlaceholderText("Жорын нэрийг оруулна уу"), {
    target: { value },
  });
}

function fillFirstStep(value: string) {
  fireEvent.change(screen.getByPlaceholderText("Алхам бичнэ үү..."), {
    target: { value },
  });
}

function addIngredient() {
  fireEvent.click(screen.getByTestId("mock-add-ingredient"));
}

function clickPublish() {
  fireEvent.click(screen.getAllByRole("button", { name: "Нийтлэх" })[0]!);
}

function clickSaveDraft() {
  fireEvent.click(screen.getByRole("button", { name: "Драфт хадгалах" }));
}

function fillPublishForm() {
  fillTitle("Test Recipe");
  addIngredient();
  fillFirstStep("Cook and serve");
}

describe("NewRecipePage — create recipe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(AUTH_TOKEN_KEY, "test-jwt");
    mockUseUser.mockReturnValue(technologist);
    global.fetch = jest.fn();
  });

  it("renders the new recipe form for technologist", () => {
    renderNewRecipePage();

    expect(screen.getByText("Шинэ жор")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Жорын нэрийг оруулна уу"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-add-ingredient")).toBeInTheDocument();
  });

  it("shows error when title is missing on publish", async () => {
    renderNewRecipePage();
    clickPublish();

    expect(await screen.findByText(/Гарчиг оруулна уу/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("shows error when title is missing on draft save", async () => {
    renderNewRecipePage();
    clickSaveDraft();

    expect(await screen.findByText(/Гарчиг оруулна уу/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows error when ingredients are missing on publish", async () => {
    renderNewRecipePage();
    fillTitle("Test Recipe");
    fillFirstStep("Only step");
    clickPublish();

    expect(
      await screen.findByText(/Хамгийн багадаа нэг орц нэмнэ үү/i),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("shows error when steps are missing on publish", async () => {
    renderNewRecipePage();
    fillTitle("Test Recipe");
    addIngredient();
    clickPublish();

    expect(
      await screen.findByText(/Хамгийн багадаа нэг алхам бичнэ үү/i),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("allows draft save with only title (incomplete draft)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ _id: "recipe-2", title: "Draft Recipe" }),
    });

    renderNewRecipePage();
    fillTitle("Draft Recipe");
    clickSaveDraft();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    );
    expect(body.isDraft).toBe(true);
    expect(body.title).toBe("Draft Recipe");
  });

  it("shows API error when server rejects create", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "FORBIDDEN" }),
    });

    renderNewRecipePage();
    fillPublishForm();
    clickPublish();

    expect(await screen.findByText(/FORBIDDEN/i)).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("publishes recipe when required fields are provided (happy path)", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ _id: "recipe-1", title: "Test Recipe" }),
    });

    renderNewRecipePage();
    fillPublishForm();
    clickPublish();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/recipes"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer test-jwt",
          }),
        }),
      );
    });

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body as string,
    );
    expect(body.title).toBe("Test Recipe");
    expect(body.isDraft).toBe(false);
    expect(body.ingredients.length).toBeGreaterThan(0);
    expect(body.steps).toContain("Cook and serve");

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects non-technologist away from create page", async () => {
    mockUseUser.mockReturnValue({
      id: "u1",
      email: "user@test.com",
      name: "User",
      role: "user",
    });

    renderNewRecipePage();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/home");
    });
  });

  it("redirects guest to technologist login", async () => {
    mockUseUser.mockReturnValue(null);

    renderNewRecipePage();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/technologist/login");
    });
  });
});
