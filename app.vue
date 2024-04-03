<template>
  <v-container>
    <v-row>
      <v-col>
        <h2>Ranking</h2>
      </v-col>
      <v-col>
        <v-select
          v-model="selectedClans"
          :items="availableClans"
          label="Clans"
          multiple
          attach
          chips
          @change="filterUsers"
        >
          <template v-slot:item="{ item }">
            <v-list-item>
              <v-list-item-action>
                <v-checkbox :value="isSelected(item.title)" @click.stop.prevent="toggleClan(item.title)"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>{{ item.title }}</v-list-item-content>
            </v-list-item>
          </template>
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list>
          <v-list-item
            v-for="user in filteredUsers"
            :key="user.playerName"
          >
            <v-list-item-content>
              <v-list-item-title>{{ user.playerName }} - {{ user.currentClan }} - {{ user.totalDuration }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import userData from './test.json'; // Import the user data from the JSON file

export default {
  data() {
    return {
      selectedClans: [],
      users: [],
      filteredUsers: [],
    };
  },
  mounted() {
    // Set the user data from the imported JSON
    this.users = userData;
    this.filteredUsers = userData;
  },
  computed: {
    availableClans() {
      // Extract unique clan names from the user data
      const clansSet = new Set(this.users.map(user => user.currentClan));
      return Array.from(clansSet);
    },
  },
  methods: {
    filterUsers() {
      // Filter users based on selected clans
      if (!this.selectedClans.length) {
        this.filteredUsers = this.users;
      } else {
        this.filteredUsers = this.users.filter(user => this.selectedClans.includes(user.currentClan));
      }
    },
    toggleClan(clanName) {
      // Toggle selected clans
      const index = this.selectedClans.indexOf(clanName);
      if (index > -1) {
        this.selectedClans.splice(index, 1);
      } else {
        this.selectedClans.push(clanName);
      }
      this.filterUsers();
    },
    isSelected(clanName) {
      // Check if a clan is selected
      return this.selectedClans.includes(clanName);
    },
  },
};
</script>
