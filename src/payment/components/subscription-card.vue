<script>
export default {
  name: "subscription-card",
  data() {
    return{
      basic: 'basic',
      regular: 'regular',
      premium: 'premium',
      chek: true
    }
  }
}

</script>
<template>
  <pv-card style="width: 70rem; overflow: hidden">
    <template #title>BASIC</template>
    <template #subtitle>Resumen del plan</template>
    <template #content>
      <p class="m-0">
        Info
        <pv-checkbox class="" v-model="chek" binary/>

        <br>
        Info
        <pv-checkbox class="" v-model="chek" binary/>
      </p>
    </template>
    <template #footer>
      <div class="flex gap-3 mt-1">
        <pv-button label=COMENZAR-PRUEBA sesion class="w-full" />
      </div>
    </template>
  </pv-card>
  <pv-card style="width: 70rem; overflow: hidden">
    <template #title>REGULAR</template>
    <template #subtitle>Resumen del plan</template>
    <template #content>
      <p class="m-0">
        Info
        <pv-checkbox class="" v-model="chek" binary/>

        <br>
        Info
        <pv-checkbox class="" v-model="chek" binary/>
      </p>
    </template>
    <template #footer>
      <div class="flex gap-3 mt-1">
        <pv-button label=COMENZAR-PRUEBA sesion class="w-full" />
      </div>
    </template>
  </pv-card>
  <pv-card style="width: 70rem; overflow: hidden">
    <template #title>PREMIUM</template>
    <template #subtitle>Resumen del plan</template>
    <template #content>
      <p class="m-0">
        Info
        <pv-checkbox class="" v-model="chek" binary/>

        <br>
        Info
        <pv-checkbox class="" v-model="chek" binary/>

      </p>
    </template>
    <template #footer>
      <div class="flex gap-3 mt-1">
        <pv-button label=COMENZAR-PRUEBA sesion class="w-full" />
¿      </div>
    </template>
  </pv-card>
</template>


<style scoped>

</style>