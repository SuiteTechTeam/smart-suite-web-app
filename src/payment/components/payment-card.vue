<script>
export default {
name: "payment-card",
  data(){
  return{
      plan1: 'basic',
      plan2: 'regular',
      plan3: 'premium'
    }
  }

}
</script>

<template>
  <pv-card style="width: 70rem; overflow: hidden">
    <template #title>CONFIRMAR COMPRA</template>
    <template #subtitle>Resumen de la compra</template>
    <template #content>
      <p class="m-0">
        Inicio de la suscripción:   06 de abril del 2024
        <br>
        Monto a pagar:                S/
      </p>
    </template>
    <template #footer>
      <div class="flex gap-3 mt-1">
        <pv-button label=COMENZAR sesion class="w-full" />
        <pv-button label=CANCELAR sesion class="w-full"/>
      </div>
    </template>
  </pv-card>
</template>

<style >


</style>