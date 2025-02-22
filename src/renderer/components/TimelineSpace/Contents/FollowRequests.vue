<template>
  <div id="follow-requests">
    <template v-for="account in requests">
      <user :user="account" :request="true" @acceptRequest="accept" @rejectRequest="reject"></user>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18next } from 'vue3-i18next'
import generator, { Entity, MegalodonInterface } from 'megalodon'
import { useStore } from '@/store'
import User from '@/components/molecules/User.vue'
import { LocalAccount } from '~/src/types/localAccount'
import { LocalServer } from '~/src/types/localServer'
import { MyWindow } from '~/src/types/global'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'follow-requests',
  components: { User },
  setup() {
    const store = useStore()
    const route = useRoute()
    const i18n = useI18next()

    const win = (window as any) as MyWindow
    const id = computed(() => parseInt(route.params.id as string))
    const userAgent = computed(() => store.state.App.userAgent)

    const account = reactive<{ account: LocalAccount | null; server: LocalServer | null }>({
      account: null,
      server: null
    })
    const client = ref<MegalodonInterface | null>(null)

    const requests = ref<Array<Entity.Account>>([])

    onMounted(async () => {
      await initialize()
    })

    const initialize = async () => {
      const [a, s]: [LocalAccount, LocalServer] = await win.ipcRenderer.invoke('get-local-account', id.value)
      account.account = a
      account.server = s

      client.value = generator(s.sns, s.baseURL, a.accessToken, userAgent.value)
      const res = await client.value.getFollowRequests()
      requests.value = res.data
    }
    const accept = (user: Entity.Account) => {
      client.value
        ?.acceptFollowRequest(user.id)
        .then(() => {
          client.value?.getFollowRequests().then(res => {
            requests.value = res.data
          })
        })
        .catch(err => {
          console.error(err)
          ElMessage({
            message: i18n.t('message.follow_request_accept_error'),
            type: 'error'
          })
        })
    }
    const reject = (user: Entity.Account) => {
      client.value
        ?.rejectFollowRequest(user.id)
        .then(() => {
          client.value?.getFollowRequests().then(res => {
            requests.value = res.data
          })
        })
        .catch(err => {
          console.error(err)
          ElMessage({
            message: i18n.t('message.follow_request_reject_error'),
            type: 'error'
          })
        })
    }

    return {
      requests,
      accept,
      reject
    }
  }
})
</script>
