import fs from 'node:fs'
import os from 'node:os'
import path from 'pathe'

export interface ChromeProfile {
  realName: string
  displayName: string
}

export interface LocalState {
  profile?: {
    info_cache?: Record<
      string,
      {
        shortcut_name?: string
      }
    >
  }
  last_active_profiles?: string[]
}

export const chromeUserDir = () => path.join(os.tmpdir(), '../Google', 'Chrome', 'User Data')

export function getLocalState() {
  const statePath = path.join(chromeUserDir(), 'Local State')
  if (fs.existsSync(statePath)) {
    const jsonContent = fs.readFileSync(statePath, 'utf-8')
    const doc = JSON.parse(jsonContent) as LocalState
    return doc
  }
}

export function getProfileNames(): ChromeProfile[] {
  const list: ChromeProfile[] = []
  try {
    const localState = getLocalState()
    if (!localState) {
      return list
    }
    const accountDic = localState?.profile?.info_cache
    if (accountDic) {
      Object.entries(accountDic).forEach(([profileKey, profileData]) => {
        list.push({
          realName: profileKey,
          displayName: profileData?.shortcut_name ?? profileKey,
        })
      })
    }
  }
  catch (error) {
    console.error(error)
  }
  return list
}

export function isProfileOpened(realName: string) {
  const localState = getLocalState()
  return localState?.last_active_profiles?.includes?.(realName)
}
