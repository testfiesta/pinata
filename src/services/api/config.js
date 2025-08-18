export default function makeConfigService(api) {
  return {
    getConfigs: async function(handle){
      return api.get(`/${handle}/pinata/configs`)
    },
    getConfig: async function(handle, configId){
      return api.get(`/${handle}/pinata/configs/${configId}`)
    },
    createConfig: async function(handle, configData){
      return api.post(`/${handle}/pinata/configs`, configData)
    },
    updateConfig: async function(handle, configId, configData){
      return api.patch(`/${handle}/pinata/configs/${configId}`, configData)
    },
    deleteConfig: async function(handle, configId){
      return api.delete(`/${handle}/pinata/configs/${configId}`)
    }
  }
}