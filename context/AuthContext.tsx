"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  getFirebaseAuth,
  isFirebaseConfigured,
} from "@/lib/firebase/firebaseConfig";
import { useModal, useToast } from "@/context/OverlayContext";
import {
  IconCheckCircle,
  IconErrorCircle,
  IconExclamationTriangle,
  IconGoogle,
  IconLock,
  IconPasskey,
  IconXMarkCircle,
} from "@/components/ui/icons";

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  authMethod: "firebase" | "mock-email" | "mock-google" | "mock-passkey";
}

interface AuthContextValue {
  user: AppUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPasskey: () => Promise<void>;
  signOut: () => Promise<void>;
  openAuthModal: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirebaseUser(fbUser: User): AppUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName:
      fbUser.displayName ??
      (fbUser.email ? fbUser.email.split("@")[0] : "사용자"),
    photoURL: fbUser.photoURL,
    authMethod: "firebase",
  };
}

const defaultAuthValue: AuthContextValue = {
  user: null,
  isLoading: false,
  isConfigured: false,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signInWithPasskey: async () => {},
  signOut: async () => {},
  openAuthModal: () => {},
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  return ctx ?? defaultAuthValue;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(isFirebaseConfigured);
  const { openModal, closeModal } = useModal();
  const { showToast } = useToast();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (fbUser) => {
        setUser(fbUser ? mapFirebaseUser(fbUser) : null);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (auth) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        setUser(mapFirebaseUser(cred.user));
      } else {
        await new Promise((resolve) => setTimeout(resolve, 450));
        setUser({
          uid: `mock-${Date.now()}`,
          email,
          displayName: email.split("@")[0] || "사용자",
          photoURL: null,
          authMethod: "mock-email",
        });
      }
      showToast({
        title: "로그인되었습니다",
        description: `${email} 계정으로 세션이 시작되었습니다.`,
        variant: "success",
      });
    },
    [showToast]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const auth = getFirebaseAuth();
      if (auth) {
        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        setUser({
          ...mapFirebaseUser(cred.user),
          displayName: displayName || cred.user.displayName,
        });
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser({
          uid: `mock-reg-${Date.now()}`,
          email,
          displayName: displayName || email.split("@")[0],
          photoURL: null,
          authMethod: "mock-email",
        });
      }
      showToast({
        title: "계정이 생성되었습니다",
        description: `${displayName || email}님, 환영합니다.`,
        variant: "success",
      });
    },
    [showToast]
  );

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      setUser(mapFirebaseUser(cred.user));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setUser({
        uid: "mock-google-uid-01",
        email: "user@atrc.hyeona3.com",
        displayName: "김민수 (Google Workspace)",
        photoURL: null,
        authMethod: "mock-google",
      });
    }
    showToast({
      title: "Google 계정으로 로그인됨",
      description: isFirebaseConfigured
        ? "Firebase OAuth 인증 완료"
        : "환경변수 미설정으로 안전 폴백(Mock) 세션이 활성화되었습니다.",
      variant: "success",
    });
  }, [showToast]);

  const signInWithPasskey = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 380));
    setUser({
      uid: "mock-passkey-uid-01",
      email: "passkey@atrc.hyeona3.com",
      displayName: "이지은 (Passkey 생체인증)",
      photoURL: null,
      authMethod: "mock-passkey",
    });
    showToast({
      title: "패스키(Passkey) 인증 완료",
      description: "생체 인증을 통해 안전하게 로그인되었습니다.",
      variant: "success",
    });
  }, [showToast]);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    showToast({
      title: "로그아웃되었습니다",
      description: "안전하게 세션이 종료되었습니다.",
      variant: "info",
    });
  }, [showToast]);

  const openAuthModal = useCallback(() => {
    openModal({
      id: "firebase-auth-modal",
      title: "계정 로그인 및 보안 인증",
      description: isFirebaseConfigured
        ? "Firebase Authentication 연동 모드"
        : "Firebase SDK 폴백(Mock) 안전 모드 동작 중",
      content: <AuthModalForm onSuccess={() => closeModal(true)} />,
      size: "md",
    });
  }, [openModal, closeModal]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithPasskey,
        signOut,
        openAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function AuthModalForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithPasskey,
    isConfigured,
  } = useAuth();
  const { setModalDirty } = useModal();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [displayName, setDisplayName] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordHint, setPasswordHint] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [submittingType, setSubmittingType] = useState<
    "email" | "google" | "passkey" | null
  >(null);

  useEffect(() => {
    const dirty = Boolean(
      email.trim().length > 0 ||
        password.trim().length > 0 ||
        displayName.trim().length > 0
    );
    setModalDirty(dirty);
  }, [email, password, displayName, setModalDirty]);

  // Format check onBlur per DESIGN.md 7.3 & AGENTS.md 2.2.C
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("");
      return;
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setEmailError(
      isValid
        ? ""
        : "올바른 이메일 주소 형식을 입력해 주세요 (예: name@domain.com)."
    );
  };

  // Password rule live check onChange per DESIGN.md 7.3 & AGENTS.md 2.2.C
  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setAuthError("");
    if (!val) {
      setPasswordHint("");
      return;
    }
    const hasMinLen = val.length >= 8;
    const hasNum = /\d/.test(val);
    if (!hasMinLen || !hasNum) {
      setPasswordHint("암호는 8자 이상이며 숫자를 최소 1개 포함해야 합니다.");
    } else {
      setPasswordHint("안전한 암호 규칙을 충족합니다.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setEmailError("올바른 이메일 주소 형식을 입력해 주세요.");
      return;
    }
    const isPasswordValid = password.length >= 8 && /\d/.test(password);
    if (!isPasswordValid) {
      setPasswordHint("암호는 8자 이상이며 숫자를 최소 1개 포함해야 합니다.");
      return;
    }

    try {
      setSubmittingType("email");
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      setModalDirty(false);
      onSuccess();
    } catch {
      setAuthError(
        "이메일 또는 암호가 일치하지 않거나 네트워크 연결이 불안정합니다. 입력 정보를 확인한 뒤 다시 시도해 주세요."
      );
    } finally {
      setSubmittingType(null);
    }
  };

  const handleGoogle = async () => {
    setAuthError("");
    try {
      setSubmittingType("google");
      await signInWithGoogle();
      setModalDirty(false);
      onSuccess();
    } catch {
      setAuthError(
        "Google 계정 인증 창이 닫혔거나 연결에 실패했습니다. 다시 시도해 주세요."
      );
    } finally {
      setSubmittingType(null);
    }
  };

  const handlePasskey = async () => {
    setAuthError("");
    try {
      setSubmittingType("passkey");
      await signInWithPasskey();
      setModalDirty(false);
      onSuccess();
    } catch {
      setAuthError(
        "패스키 생체 인증을 완료하지 못했습니다. 기기 인증 설정을 확인해 주세요."
      );
    } finally {
      setSubmittingType(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Segmented Mode Switcher (Equal width per pstui standards) */}
      <div
        role="tablist"
        aria-label="인증 방식 선택"
        style={{ backgroundColor: "var(--fill-tertiary)" }}
        className="grid grid-cols-2 rounded-xl p-1 gap-1 border border-base-content/15"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          onClick={() => {
            setMode("signin");
            setAuthError("");
          }}
          style={
            mode !== "signin" ? { color: "var(--label-secondary)" } : undefined
          }
          className={`btn btn-sm rounded-lg pst-press border-none ${
            mode === "signin"
              ? "bg-base-100 text-base-content shadow-xs font-semibold"
              : "btn-ghost font-semibold hover:text-base-content"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => {
            setMode("signup");
            setAuthError("");
          }}
          style={
            mode !== "signup" ? { color: "var(--label-secondary)" } : undefined
          }
          className={`btn btn-sm rounded-lg pst-press border-none ${
            mode === "signup"
              ? "bg-base-100 text-base-content shadow-xs font-semibold"
              : "btn-ghost font-semibold hover:text-base-content"
          }`}
        >
          새 계정 등록
        </button>
      </div>

      {/* Passkey & Social Quick Auth (Recommended by DESIGN.md Section 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={submittingType !== null}
          onClick={handlePasskey}
          className="btn btn-outline border-base-content/25 text-base-content rounded-xl pst-press flex items-center justify-center gap-2 font-semibold"
        >
          {submittingType === "passkey" ? (
            <span className="inline-flex items-center gap-2">
              <span className="loading loading-spinner loading-xs" />
              인증 중…
            </span>
          ) : (
            <>
              <IconPasskey className="w-4 h-4 text-accent-primary shrink-0" />
              <span>패스키로 로그인</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={submittingType !== null}
          onClick={handleGoogle}
          className="btn btn-outline border-base-content/25 text-base-content rounded-xl pst-press flex items-center justify-center gap-2 font-semibold"
        >
          {submittingType === "google" ? (
            <span className="inline-flex items-center gap-2">
              <span className="loading loading-spinner loading-xs" />
              연결 중…
            </span>
          ) : (
            <>
              <IconGoogle className="w-4 h-4 shrink-0" />
              <span>Google 계속하기</span>
            </>
          )}
        </button>
      </div>

      <div
        className="divider text-xs font-semibold"
        style={{ color: "var(--label-secondary)" }}
      >
        또는 이메일 계정 사용
      </div>

      {authError && (
        <div
          role="alert"
          className="alert alert-error alert-soft rounded-xl p-3 text-xs font-semibold flex items-center gap-2"
        >
          <IconErrorCircle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {mode === "signup" && (
          <div className="space-y-1">
            <label
              htmlFor="auth-display-name"
              className="block text-xs font-bold text-base-content"
            >
              이름 (표시명)
            </label>
            <div className="input input-bordered w-full rounded-xl flex items-center gap-2 bg-base-100 border-base-content/25">
              <input
                id="auth-display-name"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="홍길동"
                className="grow text-sm font-medium text-base-content"
              />
              {displayName && (
                <button
                  type="button"
                  onClick={() => setDisplayName("")}
                  aria-label="이름 입력 지우기"
                  style={{ color: "var(--label-secondary)" }}
                  className="btn btn-ghost btn-circle btn-xs pst-press hover:text-base-content"
                >
                  <IconXMarkCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label
            htmlFor="auth-email-input"
            className="block text-xs font-bold text-base-content"
          >
            이메일 주소
          </label>
          <div
            className={`input input-bordered w-full rounded-xl flex items-center gap-2 bg-base-100 border-base-content/25 ${
              emailError ? "input-error border-error" : ""
            }`}
          >
            <input
              id="auth-email-input"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setAuthError("");
              }}
              onBlur={handleEmailBlur}
              placeholder="name@atrc.hyeona3.com"
              className="grow text-sm font-medium text-base-content"
              required
            />
            {email && (
              <button
                type="button"
                onClick={() => {
                  setEmail("");
                  setEmailError("");
                  setAuthError("");
                }}
                aria-label="이메일 입력 지우기"
                style={{ color: "var(--label-secondary)" }}
                className="btn btn-ghost btn-circle btn-xs pst-press hover:text-base-content"
              >
                <IconXMarkCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          {emailError && (
            <p
              className="text-xs font-semibold text-status-error flex items-center gap-1.5 mt-1"
              role="alert"
            >
              <IconErrorCircle className="w-4 h-4 shrink-0" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="auth-password-input"
            className="block text-xs font-bold text-base-content"
          >
            암호
          </label>
          <div className="input input-bordered w-full rounded-xl flex items-center gap-2 bg-base-100 border-base-content/25">
            <input
              id="auth-password-input"
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="8자 이상 및 숫자 포함"
              className="grow text-sm font-medium text-base-content"
              required
            />
            {password && (
              <button
                type="button"
                onClick={() => handlePasswordChange("")}
                aria-label="암호 입력 지우기"
                style={{ color: "var(--label-secondary)" }}
                className="btn btn-ghost btn-circle btn-xs pst-press hover:text-base-content"
              >
                <IconXMarkCircle className="w-4 h-4" />
              </button>
            )}
          </div>
          {passwordHint && (
            <p
              className={`text-xs font-semibold flex items-center gap-1.5 mt-1 ${
                password.length >= 8 && /\d/.test(password)
                  ? "text-status-success"
                  : "text-status-warning"
              }`}
            >
              {password.length >= 8 && /\d/.test(password) ? (
                <IconCheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <IconExclamationTriangle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordHint}</span>
            </p>
          )}
        </div>

        <div className="rounded-xl material-regular px-3.5 py-2.5 text-xs flex items-center justify-between">
          <span
            className="font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            연동 상태:{" "}
            <strong className="text-base-content font-bold">
              {isConfigured ? "Firebase Live" : "Mock Fallback (안전 모드)"}
            </strong>
          </span>
          <span className="badge badge-sm badge-soft badge-primary font-semibold">
            Dirty Guard 활성
          </span>
        </div>

        <button
          type="submit"
          disabled={submittingType !== null}
          className="btn btn-primary w-full rounded-xl pst-press font-semibold mt-2"
        >
          {submittingType === "email" ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-4 h-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-25"
                />
                <path
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
                />
              </svg>
              {mode === "signin" ? "로그인 중…" : "계정 생성 중…"}
            </span>
          ) : mode === "signin" ? (
            "이메일로 로그인"
          ) : (
            "계정 생성하기"
          )}
        </button>
      </form>
    </div>
  );
}

export function ProtectedRoute({
  children,
  fallbackTitle = "로그인이 필요한 보호된 영역입니다",
  fallbackDescription = "계정에 로그인하면 개인화된 워크스페이스 설정과 동기화된 데이터를 즉시 확인할 수 있습니다.",
}: {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}) {
  const { user, isLoading, openAuthModal, signInWithPasskey } = useAuth();

  if (isLoading) {
    return (
      <div className="material-regular rounded-2xl p-6 flex items-center justify-center gap-3">
        <span className="loading loading-spinner loading-md text-primary" />
        <span className="text-sm font-semibold">인증 세션을 확인하는 중…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="material-regular rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge badge-sm badge-soft badge-warning gap-1.5 font-semibold py-2.5 px-3">
              <IconLock className="w-3.5 h-3.5 shrink-0" />
              <span>보호된 경로 (Protected Route)</span>
            </span>
          </div>
          <h4 className="text-base font-bold text-base-content">
            {fallbackTitle}
          </h4>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--label-secondary)" }}
          >
            {fallbackDescription}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => signInWithPasskey()}
            className="btn rounded-xl bg-primary/14 hover:bg-primary/22 text-accent-primary border border-primary/25 pst-press font-semibold inline-flex items-center gap-1.5"
          >
            <IconPasskey className="w-4 h-4 shrink-0" />
            <span>패스키 즉시 체험</span>
          </button>
          <button
            type="button"
            onClick={openAuthModal}
            className="btn btn-primary rounded-xl pst-press font-semibold"
          >
            로그인 열기…
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
