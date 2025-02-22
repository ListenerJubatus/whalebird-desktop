import { Module, MutationTree, ActionTree } from 'vuex'
import { RootState } from '@/store'
import { Notify } from '~/src/types/notify'
import { BaseConfig, Notification } from '~/src/types/preference'
import { MyWindow } from '~/src/types/global'

const win = window as any as MyWindow

export type NotificationState = {
  notification: Notification
}

const state: NotificationState = {
  notification: {
    notify: {
      reply: true,
      reblog: true,
      favourite: true,
      follow: true,
      follow_request: true,
      reaction: true,
      status: true,
      poll_vote: true,
      poll_expired: true
    }
  }
}

export const MUTATION_TYPES = {
  UPDATE_NOTIFICATION: 'updateNotification'
}

const mutations: MutationTree<NotificationState> = {
  [MUTATION_TYPES.UPDATE_NOTIFICATION]: (state, notification: Notification) => {
    state.notification = notification
  }
}

export const ACTION_TYPES = {
  LOAD_NOTIFICATION: 'loadNotification',
  UPDATE_NOTIFY: 'updateNotify'
}

const actions: ActionTree<NotificationState, RootState> = {
  [ACTION_TYPES.LOAD_NOTIFICATION]: async ({ commit }) => {
    const conf: BaseConfig = await win.ipcRenderer.invoke('get-preferences')
    commit(MUTATION_TYPES.UPDATE_NOTIFICATION, conf.notification)
    return conf
  },
  [ACTION_TYPES.UPDATE_NOTIFY]: async ({ commit, state, dispatch }, notify: object) => {
    const newNotify: Notify = Object.assign({}, state.notification.notify, notify)
    const newNotification: Notification = Object.assign({}, state.notification, {
      notify: newNotify
    })
    const config = {
      notification: newNotification
    }
    const conf: BaseConfig = await win.ipcRenderer.invoke('update-preferences', config)
    commit(MUTATION_TYPES.UPDATE_NOTIFICATION, conf.notification)
    dispatch('App/loadPreferences', null, { root: true })
  }
}

export default {
  namespaced: true,
  state: state,
  mutations: mutations,
  actions: actions
} as Module<NotificationState, RootState>
