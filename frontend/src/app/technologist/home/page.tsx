import { redirect } from "next/navigation";

/** Technologists use the same home feed as readers; kept for old links. */
export default function TechnologistHomePage() {
  redirect("/home");
}
