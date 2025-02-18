import { AuthenticatorDevice } from "@simplewebauthn/typescript-types";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { Device, User } from "@prisma/client";

// The original types are "Buffer" which is not supported by KV
export type UserDevice = Omit<
  AuthenticatorDevice,
  "credentialPublicKey" | "credentialID"
> & {
  credentialID: string;
  credentialPublicKey: string;
};

export const findUser = async (
  email: string
): Promise<(User & { devices: Device[] }) | null> => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
    include: {
      devices: true,
    },
  });
  return user;
};

export const createUser = async (
  email: string,
  devices: UserDevice[]
): Promise<User> => {
  const user = await findUser(email);

  if (user) {
    throw new Error("User already exists");
  }
  const newUser = await prisma.user.create({
    data: {
      email,
      devices: {
        create: devices.map((device) => ({
          ...device,
          credentialID: device.credentialID,
          credentialPublicKey: device.credentialPublicKey,
        })),
      },
    },
  });
  return newUser;
};

type SessionData = {
  currentChallenge?: string | null;
  email?: string | null;
};

const getSession = async (id: string) => {
  const session = await prisma.session.findFirst({
    where: {
      id,
    },
  });
  return session;
};

const createSession = async (sessionId: string, data: SessionData) => {
  const session = await prisma.session.upsert({
    where: {
      id: sessionId,
    },
    update: {
      email: data.email,
      currentChallenge: data.currentChallenge,
    },
    create: {
      id: sessionId,
      email: data.email,
      currentChallenge: data.currentChallenge,
    },
  });
  return session;
};

export const getCurrentSession = async (): Promise<{
  sessionId: string;
  data: SessionData;
}> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id");

  if (sessionId?.value) {
    const session = await getSession(sessionId.value);

    if (session) {
      return { sessionId: sessionId.value, data: session };
    }
  }

  const newSessionId = Math.random().toString(36).slice(2);
  const newSession = { currentChallenge: undefined };
  cookieStore.set("session-id", newSessionId);
  await createSession(newSessionId, newSession);
  return { sessionId: newSessionId, data: newSession };
};

export const updateCurrentSession = async (
  data: SessionData
): Promise<void> => {
  const { sessionId, data: oldData } = await getCurrentSession();

  await createSession(sessionId, { ...oldData, ...data });
};
