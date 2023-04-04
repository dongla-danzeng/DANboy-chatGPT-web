import { FormEvent, useEffect, useMemo, useState } from "react";
import { ALL_MODELS, useAccessStore, useUserStore } from "@/store";
import styles from "@/styles/module/login.module.scss";
import ChatGptIcon from "@/assets/icons/chatgpt.svg";
import { showToast } from "@/components/ui-lib";
import { RegisterResponse, ResponseStatus } from "@/app/api/typing.d";

export function Login(props: { setIsLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  // 防止表单重复 提交
  const [submitting, setSubmitting] = useState(false);
  const [updateSessionToken, updateEmail] = useUserStore((state) => [
    state.updateSessionToken,
    state.updateEmail,
  ]);

  useEffect(() => {
    showToast("新用户直接登录即可注册", 1000);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("请输入邮箱密码");
      setSubmitting(false);
      return;
    }

    const res = await (
      await fetch("/api/user/login", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
    ).json();

    handleLoginResponse(res);
  };

  const handleLoginResponse = (res: any) => {
    switch (res.status) {
      case ResponseStatus.Success: {
        updateSessionToken(res.sessionToken);
        updateEmail(email);
        showToast("成功登录!", 3000);
        props.setIsLogin();
        break;
      }
      case ResponseStatus.notExist: {
        showToast("新用户, 请注册");
        break;
      }
      case ResponseStatus.wrongPassword: {
        showToast("密码错误");
        break;
      }
      default: {
        showToast("未知错误");
        break;
      }
    }
    setSubmitting(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !verificationCode) {
      showToast("请输入邮箱密码和验证码");
      setSubmitting(false);
      return;
    }

    const res = (await (
      await fetch("/api/user/register", {
        cache: "no-store",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          code: verificationCode,
          code_type: "email",
        }),
      })
    ).json()) as RegisterResponse;

    handleRegisterResponse(res);
  };

  const handleRegisterResponse = (res: RegisterResponse) => {
    switch (res.status) {
      case ResponseStatus.Success: {
        updateSessionToken(res.sessionToken);
        updateEmail(email);
        props.setIsLogin();
        showToast("注册成功!", 3000);
        break;
      }
      case ResponseStatus.alreadyExisted: {
        showToast("该邮箱已经注册，请尝试更换邮箱!");
        break;
      }
      case ResponseStatus.invalidCode: {
        showToast("验证码错误");
        break;
      }
      default: {
        showToast("未知错误");
        break;
      }
    }
    setSubmitting(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    if (isRegister) {
      await handleRegister();
    } else {
      await handleLogin();
    }
    setSubmitting(false);
  };

  const handleSendVerification = async (codeType: string) => {
    setSubmitting(true);
    if (!email) {
      showToast("请输入邮箱");
      setSubmitting(false);
      return;
    }
    const res = await (
      await fetch("/api/user/register?email=" + encodeURIComponent(email), {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
    ).json();

    switch (res.status) {
      case ResponseStatus.Success: {
        switch (res.code_data.status) {
          case 0:
            showToast("验证码成功发送!");
            setIsSending(true);
            break;
          case 1:
            showToast("该邮箱已经注册，请尝试更换邮箱!");
            break;
          case 2:
            showToast("请求验证码过快，请稍后再试!");
            break;
          case 4:
          default:
            showToast("未知错误，请联系管理员!");
            break;
        }
        break;
      }
      case ResponseStatus.notExist: {
        showToast("邮箱不存在，请重新输入");
        break;
      }
      default: {
        showToast("未知错误");
        break;
      }
    }
    setSubmitting(false);
  };

  return (
    <>
      <div className={styles["login-form-container"]}>
        <form className={styles["login-form"]} onSubmit={handleSubmit}>
          <h2 className={styles["login-form-title"]}>
            {isRegister ? "Register" : "Login"}
          </h2>
          <div className={styles["login-form-input-group"]}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isRegister}
            />
          </div>
          <div className={styles["login-form-input-group"]}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isRegister}
            />
          </div>
          {isRegister && (
            <div className={styles["login-form-input-group"]}>
              <label htmlFor="email">Verification Code</label>
              <div className={styles["verification-code-container"]}>
                <input
                  type="text"
                  id="verification-code"
                  maxLength={6}
                  pattern="\d{6}"
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  className={styles["send-verification-button"]}
                  onClick={() => handleSendVerification("email")}
                  disabled={submitting}
                >
                  {isSending ? "Already Send to Email" : "Get Code"}
                </button>
              </div>
            </div>
          )}
          <div className={styles["button-container"]}>
            {!isRegister && (
              <button
                className={styles["login-form-submit"]}
                type="submit"
                disabled={submitting}
              >
                Login
              </button>
            )}
            <button
              className={styles["login-form-submit"]}
              type="submit"
              onClick={() => setIsRegister(true)}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </>
  );
}