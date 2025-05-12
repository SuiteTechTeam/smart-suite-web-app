<script>
import i18n from "../../../i18n.js";
import {LoginService} from "../../service/login-service.js";

export default {
  name: "login-view",
  computed: {
    i18n() {
      return i18n
    }
  },
  data() {
    return {
      email: "",
      password: "",
      remember: true,
      loginService: null
    }
  },
  created() {
    this.loginService = new LoginService();
  },
  methods: {
    checkEmail() {
      return this.email.includes('@')
    },
    login() {
      if (!this.checkEmail() || this.password.length < 5) {
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Verify your email or password',
          position: 'center',
          life: 3000
        })
      } else {
        this.loginService.getAllUsers().then((users) => {
          let user = users.data.find(user => user.email === this.email && user.password === this.password);
          if (user) {
            localStorage.setItem('token', user.id);
          //   reload page
            window.location.reload();
          } else {
            this.$toast.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Verify your email or password',
              position: 'center',
              life: 3000
            })
          }
        })
      }
    }
  }
}
</script>

<template>
  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="email" :label="i18n.global.t('login-view.login-panel.email')" type="email" class="w-12"/>
      <label slot="label">
        {{ i18n.global.t('login-view.login-panel.email') }}
      </label>
    </pv-float-label>
  </div>

  <div>
    <pv-float-label class="w-full">
      <pv-password v-model="password" :label="i18n.global.t('login-view.login-panel.password')" type="password"
                   toggleMask :feedback="false" class="w-full"/>
      <label slot="label">
        {{ i18n.global.t('login-view.login-panel.password') }}
      </label>
    </pv-float-label>
  </div>

  <div class="mt-4">
    <pv-checkbox v-model="remember" aria-label="Remember me" id="remember_me" binary/>
    <label for="remember_me" class="ml-2">
      {{ i18n.global.t('login-view.login-panel.remember') }}
    </label>
  </div>

  <div class="mt-4 text-center align-content-center ">
    <pv-button @click="login" class="w-10 border-round-3xl" :label="i18n.global.t('login-view.login-panel.login')"/>
  </div>

  <div>
    <p class="text-center">
      <a href="#" class="text-blue-700 underline">
        {{ i18n.global.t('login-view.login-panel.forgot') }}
      </a>
    </p>
  </div>
</template>
<style>
</style>