"use client";

import { useRouter } from "next/navigation";

import styles from "@/app/login/login.module.scss";
import Locales from "@/locales";

export default function Index() {
  const router = useRouter();

  return (
    <div className={styles["content"]}>
      <h2 className={styles["text"]}>黄甲岩的AI机器人_3.0</h2>
      <div className={styles["buttons"]}>
        <button
          className={styles["button"]}
          onClick={() => router.push("/login")}
        >
          {Locales.Index.Login}
        </button>
        <button
          className={styles["button"]}
          onClick={() => router.push("/register")}
        >
          {Locales.Index.Register}
        </button>
      </div>
    </div>
  );
}
