const os = require('os');
const si = require('systeminformation');

async function getCurrentDateTime() {
  return new Date().toLocaleString('en-US', { timeZone: 'UTC' });
}

async function getComputerName() {
  return os.hostname();
}

async function getOperatingSystem() {
  const osInfo = await si.osInfo();
  return `${osInfo.distro} ${osInfo.release} ${osInfo.arch}`;
}

async function getSystemInfo() {
  const systemInfo = await si.system();
  return {
    manufacturer: systemInfo.manufacturer,
    model: systemInfo.model
  };
}

async function getBIOSVersion() {
  const biosInfo = await si.bios();
  return biosInfo.version;
}

async function getProcessor() {
  const cpuInfo = await si.cpu();
  return `${cpuInfo.manufacturer} ${cpuInfo.brand} (${cpuInfo.physicalCores} CPUs), ~${cpuInfo.speed}GHz`;
}

async function getMemory() {
  const memInfo = await si.mem();
  return `${(memInfo.total / 1024 / 1024).toFixed(0)}MB RAM`;
}

module.exports.getSystemInfo = async () => {
  try {
    const currentDateTime = await getCurrentDateTime();
    const computerName = await getComputerName();
    const operatingSystem = await getOperatingSystem();
    const systemInfo = await getSystemInfo(); // Store the result of getSystemInfo() in a variable
    const systemManufacturer = systemInfo.manufacturer;
    const systemModel = systemInfo.model;
    const biosVersion = await getBIOSVersion();
    const processor = await getProcessor();
    const memory = await getMemory();

    return {
      currentDateTime,
      computerName,
      operatingSystem,
      systemManufacturer,
      systemModel,
      biosVersion,
      processor,
      memory,

    };
  } catch (error) {
    console.error('Error fetching system information:', error);
    return null; // or handle the error in a different way as per your requirement
  }
}
