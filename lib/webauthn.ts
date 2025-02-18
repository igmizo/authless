"use server";

import {
  GenerateAuthenticationOptionsOpts,
  GenerateRegistrationOptionsOpts,
  VerifyAuthenticationResponseOpts,
  VerifyRegistrationResponseOpts,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";

import {
  UserDevice,
  createUser,
  findUser,
  getCurrentSession,
  updateCurrentSession,
} from "@/lib/user";

import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/typescript-types";

import { isoBase64URL } from "@simplewebauthn/server/helpers";

const rpId = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const origin = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

export const generateWebAuthnRegistrationOptions = async (email: string) => {
  const user = await findUser(email);

  if (user) {
    return {
      success: false,
      message: "User already exists",
    };
  }

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "SimpleWebAuthn Example",
    rpID: rpId,
    userID: isoBase64URL.toBuffer(email),
    userName: email,
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: "discouraged",
    },
  };

  const options = await generateRegistrationOptions(opts);

  await updateCurrentSession({ currentChallenge: options.challenge, email });

  return {
    success: true,
    data: options,
  };
};

export const verifyWebAuthnRegistration = async (
  data: RegistrationResponseJSON
) => {
  const {
    data: { email, currentChallenge },
  } = await getCurrentSession();

  if (!email || !currentChallenge) {
    return {
      success: false,
      message: "Session expired (registration)",
    };
  }

  const expectedChallenge = currentChallenge;

  const opts: VerifyRegistrationResponseOpts = {
    response: data,
    expectedChallenge: `${expectedChallenge}`,
    expectedOrigin: origin,
    expectedRPID: rpId,
    requireUserVerification: false,
  };
  const verification = await verifyRegistrationResponse(opts);

  const { verified, registrationInfo } = verification;

  if (!verified || !registrationInfo) {
    return {
      success: false,
      message: "Registration failed",
    };
  }

  const {
    credential: { publicKey: credentialPublicKey, id: credentialID },
  } = registrationInfo;

  const counter = 0;
  /**
   * Add the returned device to the user's list of devices
   */
  const newDevice: UserDevice = {
    credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey),
    credentialID: credentialID,
    counter,
    transports: data.response.transports,
  };

  await updateCurrentSession({});

  try {
    await createUser(email, [newDevice]);
  } catch {
    return {
      success: false,
      message: "User already exists",
    };
  }

  return {
    success: true,
  };
};

export const generateWebAuthnLoginOptions = async (email: string) => {
  const user = await findUser(email);

  if (!user) {
    return {
      success: false,
      message: "User does not exist",
    };
  }

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user.devices.map((dev) => ({
      id: dev.credentialID,
      type: "public-key",
      transports: dev.transports as AuthenticatorTransport[],
    })),
    userVerification: "required",
    rpID: rpId,
  };
  const options = await generateAuthenticationOptions(opts);

  await updateCurrentSession({ currentChallenge: options.challenge, email });

  return {
    success: true,
    data: options,
  };
};

export const verifyWebAuthnLogin = async (data: AuthenticationResponseJSON) => {
  const {
    data: { email, currentChallenge },
  } = await getCurrentSession();

  if (!email || !currentChallenge) {
    return {
      success: false,
      message: "Session expired (login)",
    };
  }

  const user = await findUser(email);

  if (!user) {
    return {
      success: false,
      message: "User does not exist",
    };
  }

  const dbAuthenticator = user.devices.find(
    (dev) => dev.credentialID === data.rawId
  );

  if (!dbAuthenticator) {
    return {
      success: false,
      message: "Authenticator is not registered with this site",
    };
  }

  const opts: VerifyAuthenticationResponseOpts = {
    response: data,
    expectedChallenge: `${currentChallenge}`,
    expectedOrigin: origin,
    expectedRPID: rpId,
    credential: {
      id: dbAuthenticator.credentialID,
      publicKey: isoBase64URL.toBuffer(dbAuthenticator.credentialPublicKey),
      counter: 0,
      transports: dbAuthenticator.transports as AuthenticatorTransport[],
    },
    requireUserVerification: true,
  };
  const verification = await verifyAuthenticationResponse(opts);

  await updateCurrentSession({});

  return {
    success: verification.verified,
  };
};
