import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";
import { UserProvider } from "@/context/UserContext";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

function renderWithUser(ui: React.ReactElement) {
  return render(<UserProvider>{ui}</UserProvider>);
}

describe("auth pages google buttons", () => {
  it("renders Google login button on login page", () => {
    renderWithUser(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /Google-ээр нэвтрэх/i }),
    ).toBeInTheDocument();
  });

  it("renders Google signup button on signup page", () => {
    renderWithUser(<SignupPage />);
    expect(
      screen.getByRole("button", { name: /Google-ээр бүртгүүлэх/i }),
    ).toBeInTheDocument();
  });
});
