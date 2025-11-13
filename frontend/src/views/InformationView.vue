<script setup>
import {onMounted, ref} from "vue";
import ItemService from "@/service/ItemService.js";

const items = ref([]); // reactive list of items
const error = ref('')


async function getAllItems() {
  try {
    items.value = await ItemService.getAllItems();
    console.log(items.value)
  } catch (e) {
    console.log(e);
  }
}

async function deleteItem(id) {
  try {
    await ItemService.deleteItem(id)
    await getAllItems()
    // items.value = items.value.filter(i => i.id !== id)
  } catch (e) {
    error.value = e.message || 'Failed to delete'
  }
}

onMounted(getAllItems);
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Information</h1>

      <!-- render list -->
      <ul>
        <li v-for="item in items" :key="item.id">
          <span>{{ item.text }}</span>
          <span><button @click="deleteItem(item.id)">DELETE</button></span>
        </li>
      </ul>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
button {
  border: 2px solid red;
}
</style>
