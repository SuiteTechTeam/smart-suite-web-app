<script>
import LanguageSwitcher from "./language-switcher.component.vue";
import {LoginService} from "../../iam/service/login-service.js";
import router from "../../router/index.js";

export default {
  name: "toolbar-component",
  components: {LanguageSwitcher},
  data() {
    return {
      loginService: null,
      items: [
        {label: 'Home', to: '/home'},
      ],
      user: null,
    }
  },
  created() {
    this.loginService = new LoginService();
    // if (this.is_logged) {
    //   this.loginService.getUser(this.getUser.id).then(response => {
    //     this.user = this.loginService.getUserFromResponse(response.data);
    //   });
    // }
  },
  computed: {
    is_logged() {
      return localStorage.getItem('token') !== null;
    },
    getUser() {
      // return localStorage.getItem('token');
      let user = this.loginService.getLocalUser();
      console.log(user)
      return this.loginService.getLocalUserFromResponse(user.data);
    },
  },
  methods: {
    logout() {
      this.loginService.logout();
      this.$router.push('/login');
    },
    sendToProfile() {
      router.push(
          {name: 'profile', params: {id: 1}}
      );
    },
    sendToCompany() {
      router.push(
          {name: 'company', params: {id: 1}}
      );
    },
    sendToRooms() {
      router.push(
          {name: 'rooms', params: {id: 1}}
      );
    },
    sendToSupply() {
      router.push(
          {name: 'supply', params: {id: 1}}
      );
    },
    getUser() {

    }
  }
}
</script>

<template>
  <pv-toolbar class="bg-primary pt-1 pb-1" style="border-radius: 0;">
    <template #start>
      <router-link v-if="is_logged" key="/" v-slot="{navigate, href}" to="/" class="ml-2">
        <pv-button :href="href" class="p-button-text text-white" @click="navigate">
          <h2> Sweet Manager</h2>
        </pv-button>
      </router-link>
      <router-link v-if="is_logged" key="panel" v-slot="{navigate, href}" to="/panel" class="ml-2">
        <pv-button :href="href" class="p-button-text text-white" @click="navigate">
          {{ $t('control-panel') }}
        </pv-button>
      </router-link>
    </template>

    <template #center>
      <language-switcher/>
    </template>

    <template #end>
      <div class="flex-column" v-if="is_logged">

        <pv-button class="p-button-text text-white" @click="sendToRooms()">
          Rooms
        </pv-button>

        <pv-button class="p-button-text text-white" @click="sendToSupply()">
          Supply
        </pv-button>

        <pv-button class="p-button-text text-white" @click="sendToCompany()">
          My Company
        </pv-button>

        <pv-button class="p-button-text text-white" @click="sendToProfile()">
          My Profile
        </pv-button>
      </div>
    </template>
  </pv-toolbar>
</template>

<style scoped>

</style>