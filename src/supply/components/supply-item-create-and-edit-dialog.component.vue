<script>
import CreateAndEdit from "../../shared/components/create-and-edit.component.vue";
import {Supply} from "../models/supply.entity.js";

export default {
  name: "supply-item-create-and-edit-dialog",
  components: { CreateAndEdit },
  props: {
    item: Supply,
    visible: Boolean
  },
  data() {
    return {
      submitted: false
    }
  },
  methods: {
    canceledEventHandler() {
      this.$emit('canceled');
    },
    savedEventHandler() {

    }
  }
}
</script>

<template>
  <create-and-edit :entity="item" :visible="visible" :entityName="$t('supply.title')" @canceled="canceledEventHandler"
                   @saved="savedEventHandler">
    <template #content>
      <div class="p-fluid">

        <div class="field mt-5">
          <pv-float-label>
            <label for="product">{{ $t('supply.product') }}</label>
            <pv-input-text id="product" v-model="item.product" :class="{'p-invalid': submitted && !item.product}"/>
            <small v-if="submitted && !item.product" class="p-invalid">{{$t('supply.product-required')}}</small>
          </pv-float-label>
        </div>

        <div class="field mt-5">
          <pv-float-label>
            <label for="quantity">{{ $t('supply.quantity') }}</label>
            <pv-input-text id="quantity" v-model="item.quantity" :class="{'p-invalid': submitted && !item.quantity}"/>
            <small v-if="submitted && !item.quantity" class="p-invalid">{{$t('supply.quantity-required')}}</small>
          </pv-float-label>
        </div>

        <div class="field mt-5">
          <pv-float-label>
            <label for="address">{{$t('supply.address')}}</label>
            <pv-input-text id="address" v-model="item.address" :class="{'p-invalid': submitted && !item.address}"/>
            <small v-if="submitted && !item.address" class="p-invalid">{{$t('supply.address-required')}}</small>
          </pv-float-label>
        </div>

        <div class="field mt-5">
          <pv-float-label>
            <label for="expire">{{$t('supply.expire')}}</label>
            <pv-calendar id="expire"  v-model="item.expire"  dateFormat="dd/mm/yy" :class="{'p-invalid': submitted && !item.expire}"/>
            <small v-if="submitted && !item.expire" class="p-invalid">{{$t('supply.expire-required')}}</small>
          </pv-float-label>
        </div>

      </div>
    </template>
  </create-and-edit>
</template>