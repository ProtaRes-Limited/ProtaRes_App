import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * Client-side crypto helpers.
 *
 * NOTE on the encryption approach:
 *   React Native does not ship a Web Crypto subtle implementation for
 *   AES-GCM out of the box. For values we truly need to keep on the
 *   device (e.g. credential number hashes, local encryption keys) we
 *   rely on `expo-secure-store`, which is backed by iOS Keychain and
 *   Android Keystore — both use hardware-backed AES when available.
 *
 *   For values that need application-layer encryption on the wire
 *   (e.g. Green Badge payloads) the actual encrypt/decrypt happens in
 *   the Edge Functions using Deno's native Web Crypto API.
 *
 *   This file is the client-side boundary: hashing inputs, generating
 *   random nonces, and reading/writing opaque blobs to SecureStore.
 */

const KEYCHAIN_SERVICE = 'protares.credentials';

export async function sha256Hex(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}

export async function randomHex(bytes = 16): Promise<string> {
  const buf = await Crypto.getRandomBytesAsync(bytes);
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function putSecret(key: string, value: string) {
  await SecureStore.setItemAsync(key, value, {
    keychainService: KEYCHAIN_SERVICE,
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getSecret(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key, {
      keychainService: KEYCHAIN_SERVICE,
    });
  } catch {
    return null;
  }
}

export async function deleteSecret(key: string) {
  try {
    await SecureStore.deleteItemAsync(key, { keychainService: KEYCHAIN_SERVICE });
  } catch {
    /* no-op */
  }
}
