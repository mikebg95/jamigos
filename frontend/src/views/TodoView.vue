<script setup>
import { ref, onMounted } from 'vue'
import ItemService from "@/service/ItemService.js";

const items = ref([])
const newItem = ref('')
const error = ref('')

async function loadItems() {
  error.value = ''
  try {
    items.value = await ItemService.getItems()
  } catch (e) {
    error.value = e.message || 'Failed to load'
  }
}

async function addItem() {
  const text = newItem.value.toString().trim()
  if (!text) return
  try {
    await ItemService.addItem(text)   // create on server
    await loadItems()                 // then refresh the list
    newItem.value = ''
  } catch (e) {
    error.value = e.message || 'Failed to add'
  }
}

async function deleteItem(id) {
  try {
    await ItemService.deleteItem(id)
    await loadItems()
    // items.value = items.value.filter(i => i.id !== id)
  } catch (e) {
    error.value = e.message || 'Failed to delete'
  }
}

onMounted(loadItems)
</script>

<template>
  <div class="page">
    <div class="container">
      <h1>Items</h1>

      <div v-if="!items.length">No items yet</div>

      <ul v-else>
        <li v-for="item in items" :key="item.id">
          <div>
            <span>{{ item.text }}</span>
            <span><button @click="deleteItem(item.id)">DELETE</button></span>
          </div>
        </li>
      </ul>

      <div class="add-row">
        <input
            v-model="newItem"
            type="text"
            placeholder="Add a new item"
            autocomplete="off"
            @keyup.enter="addItem"
        />
        <button type="button" @click="addItem">Add</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>


<style scoped>

</style>