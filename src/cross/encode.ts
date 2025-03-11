import { Buffer } from 'node:buffer'
import CryptoJS from 'crypto-js'

export function aesEncrypt(plainText: string = '', key: string = ''): string {
  if (!plainText || !key)
    return ''

  try {
    return CryptoJS.AES.encrypt(plainText, key).toString()
  }
  catch {
    return ''
  }
}

export function aesDecrypt(cipherText: string = '', key: string = ''): string {
  if (!cipherText || !key)
    return ''

  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key)
    return bytes.toString(CryptoJS.enc.Utf8)
  }
  catch {
    return ''
  }
}

export function encodeToBase64(plainText: string): string {
  return Buffer.from(plainText, 'utf8').toString('base64')
}

export function decodeFromBase64(base64String: string): string {
  return Buffer.from(base64String, 'base64').toString('utf8')
}
