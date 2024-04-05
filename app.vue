<template>
  <v-container>
    <v-row>
      <v-col>
        <h1>Ranking</h1>
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
                <v-checkbox :value="item.title" @click="toggleClan(item.title)"></v-checkbox>
                <v-list-item-content>{{ item.title }}</v-list-item-content>
              </v-list-item-action>
            </v-list-item>
          </template>
        </v-select>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-list>
          <v-list-item
            v-for="user in sortedFilteredUsers"
            :key="user.playerTag">
            <v-list-item-content>
              <v-list-item-title>{{ user.playerName }} - {{ user.currentClan }} - {{ formatDuration(user.totalDuration) }}</v-list-item-title>
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
    sortedFilteredUsers() {
      // Sort filtered users by totalDuration in descending order
      return this.filteredUsers.slice().sort((a, b) => b.totalDuration - a.totalDuration);
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

  formatDuration(milliseconds) {
  // Function to format duration from milliseconds to years, months, and days
  const msInSecond = 1000;
  const secondsInMinute = 60;
  const minutesInHour = 60;
  const hoursInDay = 24;
  const daysInYear = 365.2425; // Average days in a year including leap years

  let days = milliseconds / (msInSecond * secondsInMinute * minutesInHour * hoursInDay);

  const years = Math.floor(days / daysInYear);
  let remainingDays = days % daysInYear;

  const averageDaysInMonth = daysInYear / 12;
  const months = Math.floor(remainingDays / averageDaysInMonth);
  remainingDays %= averageDaysInMonth;
  remainingDays = `${Math.round(remainingDays)}`;

  let result = "";
  if (years > 0) {
    result += `${years} Year${years === 1 ? '' : 's'} `;
  }
  if (months > 0) {
    result += `${months} Month${months === 1 ? '' : 's'} `;
  }
  //Days
  result += `${remainingDays} Day${remainingDays > 1 ? 's' : ''} `;

  if (remainingDays == 0) {
    result = "History is private or less than 1 day";
  }
  

  return result.trim();
},

},
};


</script>
