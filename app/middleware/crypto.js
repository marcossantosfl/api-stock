const crypto = require("crypto");

class Encrypter {
  // Define encryption key and algorithm
  encryptionKey = "vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3";
  algorithm = "aes-192-cbc";

  constructor() {
    // Generate a cryptographic key from the encryption key and salt
    this.key = crypto.scryptSync(this.encryptionKey, "salt", 24);
  }

  // Encrypt a given plaintext
  encrypt(clearText) {
    // Generate a random initialization vector (IV) for AES encryption
    const iv = crypto.randomBytes(16);
    // Create a cipher object using the AES algorithm, key, and IV
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    // Encrypt the plaintext and convert it to a hexadecimal string
    const encrypted = cipher.update(clearText, "utf8", "hex");
    // Concatenate the encrypted text and IV as a single string
    return [encrypted + cipher.final("hex"), Buffer.from(iv).toString("hex")].join("|");
  }

  // Decrypt a given encrypted text
  dencrypt(encryptedText) {
    // Split the encrypted text and IV from the input string
    const [encrypted, iv] = encryptedText.split("|");
    if (!iv) throw new Error("IV not found");
    // Create a decipher object using the AES algorithm, key, and IV
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, Buffer.from(iv, "hex"));
    // Decrypt the encrypted text and convert it back to a utf8 string
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  }

  // Generate a random string of hexadecimal characters
  randomString() {
    return crypto.randomBytes(20).toString("hex");
  }
}

module.exports = {
    Encrypter
};