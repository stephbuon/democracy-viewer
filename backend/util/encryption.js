require("dotenv").config();
const crypto = require('crypto');

// Based on: https://www.geeksforgeeks.org/node-js-crypto-createcipheriv-method/
class encryptor {
    // Private function to return environment variables for encryption
    #loadVariables() {
        return {
            key: process.env.ENCRYPT_KEY,
            iv: process.env.ENCRYPT_IV,
            algo: process.env.ENCRYPT_ALGO
        }
    }

    encrypt(text) {
        // Creating Cipheriv with its parameter
        const vars = this.#loadVariables();
        const cipher = crypto.createCipheriv(vars.algo, vars.key, vars.iv);

        // Updating text
        let encrypted = cipher.update(text);

        // Using concatenation
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        // Returning iv and encrypted data
        return encrypted.toString('hex');
    }

    decrypt(text) {
        // Convert encrypted data to bytes
        const encryptedText = Buffer.from(text, 'hex');
    
        // Creating Decipher
        const vars = this.#loadVariables();
        const decipher = crypto.createDecipheriv(vars.algo, vars.key, vars.iv);
        
        // Updating encrypted text
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        // returns data after decryption
        return decrypted.toString();
    }
}

module.exports = encryptor;