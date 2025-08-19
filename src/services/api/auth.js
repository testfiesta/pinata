export default function makeUserService(api) {
  return {
    getProfile: function () {
      return api.get(`/profile`);
    },
    getOrgs: function (userId) {
      return api.get(`/users/${userId}/orgs`);
    },
    logout: function () {
      return api.post(`/logout`);
    },
  };
}
