<script>
import i18n from "../../../i18n.js";
import RegisterView from "../register-view/register-view.component.vue";
import LoginView from "../login-view/login-view.component.vue";

export default {
  name: "access-content",
  components: {LoginView, RegisterView},
  computed: {
    i18n() {
      return i18n
    }
  },
  created() {
    const token = localStorage.getItem('token');
    if (token) {
      this.$router.push('/panel');
    }
  }
}
</script>

<template>
  <div class="main-view flex align-content-center justify-content-center flex-wrap">
    <div class="mx-8 p-5 bg-white border-round-2xl">
      <div class="flex flex-column align-items-center justify-content-center ">
        <p class="font-bold text-2xl text-primary-800 mt-1 pt-1 pb-0 mb-0">
          {{ i18n.global.t('login-view.title') }}
        </p>
        <p> {{ i18n.global.t('login-view.sub.text') }}
          <a class="underline text-primary" href="#">
            {{ i18n.global.t('login-view.sub.link') }}
          </a>
        </p>
      </div>
      <pv-tab-view>
        <pv-tab-panel :header="i18n.global.t('login-view.login')">
                  <login-view/>
        </pv-tab-panel>
        <pv-tab-panel :header="i18n.global.t('login-view.signup')">
                  <register-view/>
        </pv-tab-panel>
      </pv-tab-view>
    </div>
  </div>
</template>

<style scoped>
.main-view {
  background-image: url("../../../assets/img/hotel-background.jpg");
  background-size: cover;
}

</style>