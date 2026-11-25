import type { Metadata } from "next";
import LearnApp from "@/components/learn/LearnApp";

export const metadata: Metadata = {
  title: "Learn Berry Farming · Berry farm",
  description:
    "An interactive course on growing strawberries with sensors: temperature, humidity, soil moisture and watering, simulated with the SenseCAP K1100 kit.",
};

export default function LearnPage() {
  return <LearnApp />;
}
