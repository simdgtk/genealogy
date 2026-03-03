<template>
    <form @submit.prevent="handleSubmit" class="person-form">
        <div class="form-group">
            <label>Nom</label>
            <input type="text" v-model="form.surname" placeholder="Nom" required />
        </div>

        <div class="form-group">
            <label>Prénom</label>
            <input type="text" v-model="form.name" placeholder="Prénom" />
        </div>

        <div class="form-group">
            <label>Date de naissance</label>
            <input type="date" v-model="form.birthDate" />
        </div>

        <div class="form-group">
            <label>Date de décès</label>
            <input type="date" v-model="form.deathDate" />
        </div>

        <div class="form-group">
            <label>Genre</label>
            <select v-model="form.gender">
                <option value="">Sélectionner le genre</option>
                <option value="Male">Homme</option>
                <option value="Female">Femme</option>
                <option value="Other">Autre / Inconnu / Non spécifié</option>
            </select>
        </div>

        <div class="form-group">
            <label>Parent</label>
            <select v-model="form.parent1Id">
                <option :value="null">Aucun</option>
                <option v-for="person in persons" :key="person._id" :value="person._id">
                    {{ person.surname }} {{ person.name }}
                </option>
            </select>
        </div>

        <div class="form-group">
            <label>Image</label>
            <input type="file" ref="fileInput" @change="handleFileUpload" accept="image/*" />
        </div>

        <div class="form-actions">
            <button type="submit" class="submit-btn">
                {{ person ? 'Modifier la personne' : 'Ajouter la personne' }}
            </button>
            <button v-if="person" type="button" @click="$emit('cancel')" class="cancel-btn">
                Annuler
            </button>
        </div>
    </form>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Person } from '~/types/person'

const props = defineProps<{
    persons: Person[],
    person?: Person | null
}>()

const emit = defineEmits<{
    submit: [data: Partial<Person> & { image?: File | null }],
    cancel: []
}>()

const form = ref<Partial<Person> & { image: File | null }>({
    surname: "",
    name: "",
    birthDate: "",
    deathDate: "",
    gender: "",
    parent1Id: null,
    relativeId: null,
    image: null,
})

watch(() => props.person, (newPerson) => {
    if (newPerson) {
        form.value = {
            surname: newPerson.surname || "",
            name: newPerson.name || "",
            birthDate: newPerson.birthDate ? new Date(newPerson.birthDate).toISOString().split('T')[0] : "",
            deathDate: newPerson.deathDate ? new Date(newPerson.deathDate).toISOString().split('T')[0] : "",
            gender: newPerson.gender || "",
            parent1Id: newPerson.parent1Id || null,
            relativeId: (newPerson as any).relativeId || null,
            image: null,
        }
    } else {
        form.value = {
            surname: "",
            name: "",
            birthDate: "",
            deathDate: "",
            gender: "",
            parent1Id: null,
            relativeId: null,
            image: null,
        }
    }
}, { immediate: true })

const fileInput = ref<HTMLInputElement | null>(null)

const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        form.value.image = file
    }
}

const handleSubmit = () => {
    // On envoie les données au parent (index.vue)
    emit('submit', { ...form.value })

    // On remet le formulaire à zéro
    form.value = {
        surname: "",
        name: "",
        birthDate: "",
        deathDate: "",
        gender: "",
        parent1Id: null,
        relativeId: null,
        image: null,
    }

    // On vide l'input de type file visuellement
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>

<style scoped>
.person-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 400px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.form-group label {
    font-weight: bold;
}

.form-group input,
.form-group select {
    padding: 0.5rem;
    border: 1px solid #000;
}

.form-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.submit-btn {
    background-color: #008412;
    color: white;
    border: none;
    padding: 0.75rem;
    cursor: pointer;
    font-weight: bold;
    flex: 1;
}

.cancel-btn {
    background-color: #666;
    color: white;
    border: none;
    padding: 0.75rem;
    cursor: pointer;
    font-weight: bold;
    flex: 1;
}

.submit-btn:hover {
    background-color: #006b0e;
}

.cancel-btn:hover {
    background-color: #444;
}
</style>