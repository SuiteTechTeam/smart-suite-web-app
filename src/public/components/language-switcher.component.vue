<script>
export default {
  name: "language-switcher",
  data() {
    return {
      languages: [
        "en",
        "es"
      ],
      languagesLabels: {
        en: "English",
        es: "Spanish"
      }
    }
  }
}
</script>

<template>
  <pv-dropdown v-model="$i18n.locale" :options="languages" style="background-color: transparent; border: none;">
    <template #value="slotProps">
      <div v-if="slotProps" class="flex align-items-center">
        <pv-flag class="m-auto" :country="slotProps.value === 'en' ? 'usa' : 'es'"/>
        <div>{{ languagesLabels[slotProps.value] }}</div>
      </div>
      <span v-else>
           ola
        </span>
    </template>
    <template #option="slotProps">
      <div class="flex align-items-center">
        <pv-flag class="m-auto" :country="slotProps.option === 'en' ? 'usa' : 'es'"/>
        <div>{{ languagesLabels[slotProps.option] }}</div>
      </div>
    </template>
  </pv-dropdown>
</template>
