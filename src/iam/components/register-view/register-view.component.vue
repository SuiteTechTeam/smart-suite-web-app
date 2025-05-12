<script>

import i18n from "../../../i18n.js";

export default {
  name: "register-view",
  computed: {
    i18n() {
      return i18n
    }
  },
  data() {
    return {
      company_name: "",
      ruc: "",
      email: "",
      name_and_lastname: "",
      password: "",
      terms: true,
    }
  }
}
</script>

<template>
  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="company_name" :label="i18n.global.t('login-view.signup-panel.company-name')" type="text"
                     class="w-12"/>
      <label slot="label">
        {{ i18n.global.t('login-view.signup-panel.company-name') }}
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="ruc" label="ruc" type="text" class="w-12"/>
      <label slot="label">
        RUC
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="email" :label="i18n.global.t('login-view.signup-panel.email')" type="mail" class="w-12"/>
      <label slot="label">
        {{ i18n.global.t('login-view.signup-panel.email') }}
      </label>
    </pv-float-label>
  </div>

  <div class="mb-4 mt-2">
    <pv-float-label class="w-full">
      <pv-input-text v-model="name_and_lastname" :label="i18n.global.t('login-view.signup-panel.name-lastname')"
                     type="mail" class="w-12"/>
      <label slot="label">
        {{ i18n.global.t('login-view.signup-panel.name-lastname') }}
      </label>
    </pv-float-label>
  </div>

  <div>
    <pv-float-label class="w-full">
      <pv-password v-model="password" :label="i18n.global.t('login-view.signup-panel.password')" type="password"
                   toggleMask :feedback="false" class="w-full"/>
      <label slot="label">
        {{ i18n.global.t('login-view.signup-panel.password') }}
      </label>
    </pv-float-label>
  </div>

  <div class="mt-4">
    <pv-checkbox v-model="terms" aria-label="Terms and conditions" id="terms-and-conditions" binary/>
    <label for="terms-and-conditions" class="ml-2">
      {{ i18n.global.t('login-view.signup-panel.terms.text') }}
      <a class="text-blue-600">
        {{ i18n.global.t('login-view.signup-panel.terms.link') }}
      </a>
    </label>
  </div>

  <div class="mt-4 text-center align-content-center">
    <pv-button class="w-10 border-round-3xl" :label="i18n.global.t('login-view.signup-panel.signup')"/>
  </div>
</template>

<style>

</style>