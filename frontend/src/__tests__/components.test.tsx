import { render, screen, fireEvent } from "@testing-library/react";
import { Users } from "lucide-react";
import { AllergenWarningBadge } from "@/components/AllergenWarningBadge";
import { AllergenAlertBanner } from "@/components/AllergenAlertBanner";
import { UserAvatar } from "@/components/UserAvatar";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import { StatCard } from "@/components/admin/StatCard";

describe("AllergenWarningBadge", () => {
  it("renders nothing when no allergens matched", () => {
    const { container } = render(<AllergenWarningBadge matched={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders compact variant", () => {
    render(<AllergenWarningBadge matched={["dairy"]} variant="compact" />);
    expect(screen.getByText("Харшил")).toBeInTheDocument();
  });

  it("renders full variant with allergen list", () => {
    render(
      <AllergenWarningBadge matched={["dairy", "nuts"]} variant="full" />,
    );
    expect(screen.getByText(/Харшил — dairy, nuts/i)).toBeInTheDocument();
  });
});

describe("AllergenAlertBanner", () => {
  it("renders nothing when no matches", () => {
    const { container } = render(<AllergenAlertBanner matched={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders alert with raw allergen names", () => {
    render(<AllergenAlertBanner matched={["egg"]} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/egg/i)).toBeInTheDocument();
  });

  it("uses labelFor when provided", () => {
    render(
      <AllergenAlertBanner
        matched={["Chicken"]}
        labelFor={(name) => `MN:${name}`}
      />,
    );
    expect(screen.getByText(/MN:Chicken/i)).toBeInTheDocument();
  });
});

describe("UserAvatar", () => {
  it("shows initial from name", () => {
    render(<UserAvatar name="Болор" size={32} />);
    expect(screen.getByText("Б")).toBeInTheDocument();
  });

  it("shows user icon when name is empty", () => {
    const { container } = render(<UserAvatar />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders image when avatarUrl is set", () => {
    render(
      <UserAvatar name="Test User" avatarUrl="https://example.com/a.jpg" />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/a.jpg",
    );
  });
});

describe("LoginRequiredModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <LoginRequiredModal open={false} onClose={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog with login and signup links when open", () => {
    render(<LoginRequiredModal open onClose={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Нэвтэрнэ үү")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Нэвтрэх" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.getByRole("link", { name: "Бүртгүүлэх" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("calls onClose from backdrop and close button", () => {
    const onClose = jest.fn();
    render(
      <LoginRequiredModal
        open
        onClose={onClose}
        title="Custom title"
        message="Custom message"
      />,
    );

    const closeButtons = screen.getAllByLabelText("Хаах");
    fireEvent.click(closeButtons[closeButtons.length - 1]!);
    expect(onClose).toHaveBeenCalled();
  });
});

describe("StatCard", () => {
  it("renders default tone with hint", () => {
    render(
      <StatCard label="Users" value={42} hint="All roles" icon={Users} />,
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("All roles")).toBeInTheDocument();
  });

  it("renders warning tone without hint", () => {
    render(
      <StatCard label="Pending" value={3} icon={Users} tone="warning" />,
    );
    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("All roles")).not.toBeInTheDocument();
  });

  it("renders success and brand tones", () => {
    const { rerender } = render(
      <StatCard label="A" value="1" icon={Users} tone="success" />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();

    rerender(<StatCard label="B" value="2" icon={Users} tone="brand" />);
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
