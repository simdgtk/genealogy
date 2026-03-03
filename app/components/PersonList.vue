<template>
    <div class="person-list">
        <div v-for="person in persons" :key="person._id" class="person-item">
            <span>{{ person.surname }} {{ person.name }}</span>
            <img v-if="person.mediaUrl" :src="person.mediaUrl" alt="" />
            <div class="actions">
                <button @click="$emit('edit', person)" class="edit-btn">Editer</button>
                <button @click="$emit('delete', person._id!)" class="delete-btn">Supprimer</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Person } from '~/types/person'

defineProps<{
    persons: Person[]
}>()

defineEmits<{
    delete: [id: string],
    edit: [person: Person]
}>()
</script>

<style scoped>
.person-list {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.person-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border: 1px solid #000;
}

.actions {
    display: flex;
    gap: 0.5rem;
}

.edit-btn {
    background-color: #1890ff;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.edit-btn:hover {
    background-color: #40a9ff;
}

.delete-btn {
    background-color: #ff4d4f;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
}

.delete-btn:hover {
    background-color: #ff7875;
}
</style>
