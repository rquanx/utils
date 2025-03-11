import wmic from 'node-wmic'
import si from 'systeminformation'

export class Device {
  // private static async getCpuId(): Promise<string> {
  //   try {
  //     switch (platform()) {
  //       case 'win32':
  //         return Device.getWindowsCpuId()
  //       case 'darwin':
  //         return Device.getMacCpuId()
  //       case 'linux':
  //         return Device.getLinuxCpuId()
  //       default:
  //         return Device.getFallbackCpuId()
  //     }
  //   } catch (error) {
  //     console.error('Error getting CPU ID:', error)
  //     return Device.getFallbackCpuId()
  //   }
  // }

  // private static getWindowsCpuId(): string {
  //   try {
  //     // 使用 WMIC 命令获取 CPU ID
  //     const output = execSync('wmic cpu get ProcessorId').toString()
  //     const id = output
  //       .split('\n')[1] // 第二行包含 ID
  //       .trim()
  //     return id || Device.getFallbackCpuId()
  //   } catch (error) {
  //     console.error('Error getting Windows CPU ID:', error)
  //     return Device.getFallbackCpuId()
  //   }
  // }

  // private static getMacCpuId(): string {
  //   try {
  //     // 在 Mac 上获取硬件 UUID
  //     const output = execSync('system_profiler SPHardwareDataType').toString()
  //     const match = output.match(/Hardware UUID: (.*)/)?.[1]
  //     return match?.trim() || Device.getFallbackCpuId()
  //   } catch (error) {
  //     console.error('Error getting Mac CPU ID:', error)
  //     return Device.getFallbackCpuId()
  //   }
  // }

  // private static getLinuxCpuId(): string {
  //   try {
  //     // 在 Linux 上组合多个信息
  //     const serialOutput = execSync('cat /proc/cpuinfo | grep Serial').toString()
  //     const idOutput = execSync('cat /proc/cpuinfo | grep "physical id" | sort -u').toString()
  //     const modelOutput = execSync('cat /proc/cpuinfo | grep "model name" | sort -u').toString()

  //     const serial = serialOutput.split(':')[1]?.trim()
  //     const id = idOutput.split(':')[1]?.trim()
  //     const model = modelOutput.split(':')[1]?.trim()

  //     if (serial) return serial
  //     if (id && model) return `${id}-${model}`
  //     return Device.getFallbackCpuId()
  //   } catch (error) {
  //     console.error('Error getting Linux CPU ID:', error)
  //     return Device.getFallbackCpuId()
  //   }
  // }

  // private static async getFallbackCpuId(): Promise<string> {
  //   try {
  //     const cpu = await si.cpu()
  //     // 组合多个CPU特征值来生成唯一标识
  //     const identifier = [
  //       cpu.manufacturer,
  //       cpu.brand,
  //       cpu.stepping,
  //       cpu.revision,
  //       cpu.physicalCores,
  //       cpu.model,
  //       cpu.family
  //     ].join('-')
  //     return identifier.replace(/\s+/g, '-')
  //   } catch (error) {
  //     console.error('Error getting fallback CPU ID:', error)
  //     return ''
  //   }
  // }

  public static async getDeviceIdentifier(): Promise<string> {
    const cpuId = await Device.getCpuId()
    const diskId = await Device.getDiskId()
    return `${cpuId}-${diskId}`
  }

  private static async getCpuId(): Promise<string> {
    try {
      const cpu = await wmic.CPU()
      const cpuId = cpu[0].ProcessorId
      return cpuId
    }
    catch (error) {
      console.error('Error getting CPU ID:', error)
      return ''
    }
  }

  private static async getDiskId(): Promise<string> {
    try {
      const disks = await si.diskLayout()
      const firstValidDisk = disks.find(disk => !disk.name.includes('Microsoft'))
      if (firstValidDisk) {
        return firstValidDisk.serialNum || '' // 只取第一个硬盘序列号
      }
      return ''
    }
    catch (error) {
      console.error('Error getting Disk ID:', error)
      return ''
    }
  }
}
