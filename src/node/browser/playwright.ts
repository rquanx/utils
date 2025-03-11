import type { Browser, BrowserContext } from 'playwright'
import fs from 'node:fs'
import os from 'node:os'
import { nanoid } from 'nanoid'
import path from 'pathe'
import { chromium } from 'playwright'
import { sleep } from '../../cross/timer'
import { chromeUserDir } from './chrome'

export async function clearContext(context: BrowserContext, clearLocalStorage = true) {
  const pages = context.pages()
  for (const page of pages) {
    try {
      if (clearLocalStorage) {
        try {
          await page.evaluate(() => `localStorage.clear()`)
        }
        catch {
        }
      }
      await page.close()
    }
    catch {
    }
  }
  await context.clearCookies()
}

export class BrowserInstance {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private tempDir: string | null = null
  private linkProfile(profileName: string) {
    // 创建临时目录
    const tempId = nanoid()
    this.tempDir = path.join(os.tmpdir(), 'suning-delivery-automatic', `chrome-profile-${tempId}`)
    fs.mkdirSync(this.tempDir, { recursive: true })

    const sourceProfileParentDir = chromeUserDir()
    // 创建软链接
    const sourceProfileDir = path.join(sourceProfileParentDir, profileName)
    const targetProfileDir = path.join(this.tempDir, profileName)

    const sourceLocalState = path.join(sourceProfileParentDir, 'Local State')
    const targetLocalState = path.join(this.tempDir, 'Local State')
    if (fs.existsSync(sourceLocalState)) {
      fs.copyFileSync(sourceLocalState, targetLocalState)
    }

    if (fs.existsSync(sourceProfileDir)) {
      if (os.platform() === 'win32') {
        fs.symlinkSync(sourceProfileDir, targetProfileDir, 'junction')
      }
      else {
        fs.symlinkSync(sourceProfileDir, targetProfileDir)
      }
      return
    }
    throw new Error('初始化失败')
  }

  async createContext(options: { profileName?: string, headless?: boolean, proxy?: string }) {
    const { profileName, headless, proxy } = options
    if (profileName) {
      this.linkProfile(profileName)
      const context = await chromium.launchPersistentContext(this.tempDir!, {
        channel: 'chrome',
        headless,
        proxy: proxy ? { server: proxy } : undefined,
        args: [`--profile-directory=${profileName}`, '--window-size=1920,1040'],
        ignoreDefaultArgs: ['--enable-automation', '--disable-extensions'],
      })
      this.context = context
      return context
    }
    else {
      const browser = await chromium.launch({
        headless,
        proxy: proxy ? { server: proxy } : undefined,
      })
      const context = await browser.newContext()
      this.browser = browser
      this.context = context
      return context
    }
  }

  async close() {
    try {
      if (this.context) {
        await this.context.close()
      }
      if (this.browser) {
        await this.browser.close()
      }
      await sleep(5000)
      // 清理临时目录
      if (this.tempDir && fs.existsSync(this.tempDir)) {
        try {
          // 删除软链接和临时目录
          fs.rmSync(this.tempDir, { recursive: true, force: true })
        }
        catch {
        }
      }
    }
    catch (e) {
      console.error(e)
    }
  }
}
