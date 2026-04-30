import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe("auth pages google buttons", () => {
  it("renders Google login button on login page", () => {
    render(<LoginPage />);
    expect(
      screen.getByRole("button", { name: /Google-ээр нэвтрэх/i }),
    ).toBeInTheDocument();
  });

  it("renders Google signup button on signup page", () => {
    render(<SignupPage />);
    expect(
      screen.getByRole("button", { name: /Google-ээр бүртгүүлэх/i }),
    ).toBeInTheDocument();
  });
});
