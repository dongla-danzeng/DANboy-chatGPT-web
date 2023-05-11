/* eslint-disable @next/next/no-page-custom-font */
import "@/styles/globals.scss";
import "@/styles/markdown.scss";
import "@/styles/prism.scss";

import { Sidebar } from "@/components/sidebar";

export const metadata = {
  title: "黄甲岩的AI机器人",
  description: "黄甲岩的AI机器人_3.0",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Sidebar>{children}</Sidebar>;
}
