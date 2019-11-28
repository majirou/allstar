import members from "~/assets/members.json";

export const state = () => ({
  authUser: null
})

export const mutations = {
  AUTHED_USER (state, data) {
    state.authUser = data;
  }
}

export const actions = {
  login({ commit }, { loginNumber, loginAccount }) {
    try {
      const member = members[loginNumber]

      if (member == null) {
        throw new Error("該当番号のユーザーが存在しません")
      }
      if (member.account !== loginAccount) {
        throw new Error("該当アカウントが存在しません。")
      }
      member.number = loginNumber
      commit("AUTHED_USER", member)
    } catch (e) {
      throw e;
    }
  }
}

export const getters = {
  authUser (state) {
    return state.authUser;
  }
}
