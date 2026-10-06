"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/api/api-error";

import {
  getPlatformSession,
  loginPlatformAdmin,
  logoutPlatformAdmin,
} from "./auth.api";

import type {
  LoginInput,
  PlatformSession,
} from "./auth.types";

//************************************************************** */

type SessionStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "forbidden"
  | "error";

type SessionState = {
  status: SessionStatus;
  session: PlatformSession | null;
  message: string | null;
};

type PlatformSessionContextValue = SessionState & {
  signIn: (input: LoginInput) => Promise<void>;
  signOut: () => Promise<void>;
  reloadSession: () => Promise<void>;
};

//************************************************************** */

const PlatformSessionContext =
  createContext<PlatformSessionContextValue | null>(null);

//************************************************************** */

function failureState(error: unknown): SessionState {
  if (error instanceof ApiError && error.status === 401) {
    return {
      status: "unauthenticated",
      session: null,
      message: "Sign in to access MotoDesk Administration.",
    };
  }

  if (error instanceof ApiError && error.status === 403) {
    return {
      status: "forbidden",
      session: null,
      message: error.message,
    };
  }

  return {
    status: "error",
    session: null,
    message: getApiErrorMessage(
      error,
      "MotoDesk could not verify your platform session.",
    ),
  };
}

//************************************************************** */

export function PlatformSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    session: null,
    message: null,
  });

  const operationVersion = useRef(0);

  //************************************************************** */

  useEffect(() => {
    const controller = new AbortController();
    const version = ++operationVersion.current;

    getPlatformSession(controller.signal).then(
      (session) => {
        if (
          controller.signal.aborted ||
          operationVersion.current !== version
        ) {
          return;
        }

        setState({
          status: "authenticated",
          session,
          message: null,
        });
      },
      (error: unknown) => {
        if (
          controller.signal.aborted ||
          operationVersion.current !== version
        ) {
          return;
        }

        setState(failureState(error));
      },
    );

    return () => {
      controller.abort();
      operationVersion.current += 1;
    };
  }, []);

  //************************************************************** */

  const reloadSession = useCallback(async () => {
    const version = ++operationVersion.current;

    try {
      const session = await getPlatformSession();

      if (operationVersion.current !== version) {
        return;
      }

      setState({
        status: "authenticated",
        session,
        message: null,
      });
    } catch (error) {
      if (operationVersion.current !== version) {
        return;
      }

      setState(failureState(error));
    }
  }, []);

  //************************************************************** */

  useEffect(() => {
    if (state.status !== "authenticated") {
      return;
    }

    function handleFocus() {
      void reloadSession();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        void reloadSession();
      }
    }

    window.addEventListener("focus", handleFocus);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [state.status, reloadSession]);

  //************************************************************** */

  const signIn = useCallback(async (input: LoginInput) => {
    const version = ++operationVersion.current;

    setState({
      status: "loading",
      session: null,
      message: null,
    });

    try {
      const session = await loginPlatformAdmin(input);

      if (operationVersion.current !== version) {
        return;
      }

      setState({
        status: "authenticated",
        session,
        message: null,
      });
    } catch (error) {
      if (operationVersion.current === version) {
        setState(failureState(error));
      }

      throw error;
    }
  }, []);

  //************************************************************** */

  const signOut = useCallback(async () => {
    const version = ++operationVersion.current;

    setState({
      status: "loading",
      session: null,
      message: null,
    });

    try {
      await logoutPlatformAdmin();

      if (operationVersion.current !== version) {
        return;
      }

      setState({
        status: "unauthenticated",
        session: null,
        message: null,
      });
    } catch (error) {
      if (operationVersion.current === version) {
        setState({
          status: "error",
          session: null,
          message: getApiErrorMessage(
            error,
            "Sign-out could not be completed. Try again.",
          ),
        });
      }

      throw error;
    }
  }, []);

  //************************************************************** */

  return (
    <PlatformSessionContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        reloadSession,
      }}
    >
      {children}
    </PlatformSessionContext.Provider>
  );
}

//************************************************************** */

export function usePlatformSession(): PlatformSessionContextValue {
  const context = useContext(PlatformSessionContext);

  if (!context) {
    throw new Error(
      "usePlatformSession must be used inside PlatformSessionProvider.",
    );
  }

  return context;
}

//************************************************************** */