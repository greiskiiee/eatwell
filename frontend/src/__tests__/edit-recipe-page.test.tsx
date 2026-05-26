import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EditRecipePage from "@/app/edit-recipe/[id]/page";
import { recipeApi } from "@/lib/recipes";

const mockReplace = jest.fn();

const loadedRecipe = {
  _id: "recipe-abc",
  title: "Existing Recipe",
  description: "Desc",
  servings: 4,
  prepTimeMinutes: 10,
  cookTimeMinutes: 20,
  tags: ["tag1"],
  ingredients: ["flour", "water"],
  steps: ["Mix", "Bake"],
  isPremium: false,
  price: 0,
  imageUrl: "",
};

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: jest.fn(),
  }),
  useParams: () => ({ id: "recipe-abc" }),
}));

jest.mock("@/lib/recipes", () => ({
  recipeApi: {
    get: jest.fn(),
    update: jest.fn(),
  },
}));

jest.mock("@/components/ImageFileUpload", () => ({
  ImageFileUpload: () => <div data-testid="image-upload" />,
}));

const mockedGet = recipeApi.get as jest.MockedFunction<typeof recipeApi.get>;
const mockedUpdate = recipeApi.update as jest.MockedFunction<
  typeof recipeApi.update
>;

function renderEditPage() {
  return render(<EditRecipePage />);
}

function clickPublish() {
  fireEvent.click(screen.getByRole("button", { name: "Хадгалах" }));
}

function clickSaveDraft() {
  fireEvent.click(screen.getByRole("button", { name: "Драфт" }));
}

describe("EditRecipePage — update recipe", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGet.mockResolvedValue(loadedRecipe);
    mockedUpdate.mockResolvedValue(loadedRecipe);
  });

  it("loads recipe and shows form", async () => {
    renderEditPage();

    expect(await screen.findByDisplayValue("Existing Recipe")).toBeInTheDocument();
    expect(screen.getByLabelText("Орцууд")).toHaveValue("flour\nwater");
    expect(screen.getByLabelText("Алхам")).toHaveValue("Mix\nBake");
  });

  it("shows error when title is cleared on publish", async () => {
    renderEditPage();
    await screen.findByDisplayValue("Existing Recipe");

    const titleInput = screen.getByDisplayValue("Existing Recipe");
    fireEvent.change(titleInput, { target: { value: "" } });
    clickPublish();

    expect(await screen.findByText(/Гарчиг оруулна уу/i)).toBeInTheDocument();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("shows error when ingredients are cleared on publish", async () => {
    renderEditPage();
    await screen.findByDisplayValue("Existing Recipe");

    fireEvent.change(screen.getByLabelText("Орцууд"), {
      target: { value: "" },
    });
    clickPublish();

    expect(
      await screen.findByText(/Хамгийн багадаа нэг орц нэмнэ үү/i),
    ).toBeInTheDocument();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("shows error when steps are cleared on publish", async () => {
    renderEditPage();
    await screen.findByDisplayValue("Existing Recipe");

    fireEvent.change(screen.getByLabelText("Алхам"), {
      target: { value: "" },
    });
    clickPublish();

    expect(
      await screen.findByText(/Хамгийн багадаа нэг алхам бичнэ үү/i),
    ).toBeInTheDocument();
    expect(mockedUpdate).not.toHaveBeenCalled();
  });

  it("allows draft save when ingredients and steps are empty", async () => {
    renderEditPage();
    await screen.findByDisplayValue("Existing Recipe");

    fireEvent.change(screen.getByLabelText("Орцууд"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByLabelText("Алхам"), {
      target: { value: "" },
    });
    clickSaveDraft();

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith(
        "recipe-abc",
        expect.objectContaining({ isDraft: true }),
      );
    });
  });

  it("publishes update when required fields are present (happy path)", async () => {
    renderEditPage();
    await screen.findByDisplayValue("Existing Recipe");

    fireEvent.change(screen.getByDisplayValue("Existing Recipe"), {
      target: { value: "Updated Recipe" },
    });
    clickPublish();

    await waitFor(() => {
      expect(mockedUpdate).toHaveBeenCalledWith(
        "recipe-abc",
        expect.objectContaining({
          title: "Updated Recipe",
          isDraft: false,
          ingredients: ["flour", "water"],
          steps: ["Mix", "Bake"],
        }),
      );
    });

    expect(mockReplace).toHaveBeenCalledWith("/home");
  });

  it("shows error when recipe fails to load", async () => {
    mockedGet.mockRejectedValue(new Error("not found"));
    renderEditPage();

    expect(await screen.findByText(/Жор олдсонгүй/i)).toBeInTheDocument();
  });
});
