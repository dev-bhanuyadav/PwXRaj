/**
 * Verified PiMaxer Resolver (v9.0)
 * Exact inverse logic derived from exhaustive binary analysis.
 */

export async function resolveVideoData(shieldedData) {
    try {
        const MASTER_KEY = "pi-maxer-ultra-secure-key-2026";
        const PREFIX = "PMXR_v2_";

        if (!shieldedData) {
            console.error("[Security] No data received for resolution");
            return null;
        }

        if (typeof shieldedData !== 'string' || !shieldedData.startsWith(PREFIX)) {
            console.error("[Security] Invalid shield format. Data:", typeof shieldedData === 'string' ? shieldedData.substring(0, 20) : typeof shieldedData);
            return null;
        }

        console.log('[Security] Engaging PiMaxer Shield v2 Decryptor...');

        // 1. Remove Prefix
        const cleanData = shieldedData.replace(PREFIX, "").trim();
        console.log('[Security] Step 1: Prefix removed. Data length:', cleanData.length);

        // 2. Base64 Decode + String Reversal
        let reversed;
        try {
            reversed = atob(cleanData);
            console.log('[Security] Step 2a: First atob success. Length:', reversed.length);
        } catch (e) {
            console.error('[Security] Step 2a: First atob FAILED. Logic mismatch or malformed base64.');
            throw e;
        }

        const encryptedStr = reversed.split("").reverse().join("");
        console.log('[Security] Step 2b: String reversed.');

        // 3. Extract IV and Ciphertext
        let combined;
        try {
            combined = Uint8Array.from(atob(encryptedStr), c => c.charCodeAt(0));
            console.log('[Security] Step 3: Second atob success. Combined length:', combined.length);
        } catch (e) {
            console.error('[Security] Step 3: Second atob FAILED. Input was not base64 after reversal.');
            throw e;
        }
        
        const iv = combined.slice(0, 12);
        const ciphertext = combined.slice(12);

        // 4. Generate AES-GCM Key
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            "raw", enc.encode(MASTER_KEY), "PBKDF2", false, ["deriveKey"]
        );
        const key = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: enc.encode("pimaxer-salt-2026"), iterations: 1000, hash: "SHA-256" },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["decrypt"]
        );
        console.log('[Security] Step 4: Key generation successful.');

        // 5. AES-GCM Decrypt
        let decryptedBuffer;
        try {
            decryptedBuffer = await crypto.subtle.decrypt(
                { name: "AES-GCM", iv: iv },
                key,
                ciphertext
            );
            console.log('[Security] Step 5: AES decryption successful.');
        } catch (e) {
            console.error('[Security] Step 5: AES decryption FAILED. Likely wrong key, IV, or corrupted data.');
            throw e;
        }

        // 6. XOR Obfuscation Reverse
        const xorData = new Uint8Array(decryptedBuffer);
        const xorKey = "PMXR";
        const result = xorData.map((byte, i) => byte ^ xorKey.charCodeAt(i % xorKey.length));
        console.log('[Security] Step 6: XOR reverse successful.');

        // 7. Parse JSON
        const decodedString = new TextDecoder().decode(result);
        console.log('[Security] UNLOCK SUCCESSFUL!');
        return JSON.parse(decodedString);

    } catch (error) {
        console.error("[Security] Shield Decryption Failed:", error.message);
        return null;
    }
}
