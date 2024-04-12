<template>
  <!-- Main Content -->
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-select
          v-model="selectedClans"
          label="Clans"
          :items="availableClans"
          multiple
          chips
          outlined
          clearable
          dense
        ></v-select>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="12">
        <v-list>
          <!-- List Items -->
          <v-list-item
            v-for="user in sortedFilteredUsers"
            :key="user.playerTag"
            @click="openDialog(user)"
          >
            <v-list-item-content>
              <v-list-item-title style="display: flex; justify-content: center;">
                <v-btn variant="text" @click="user.expanded = !user.expanded">
                  <!-- User Name -->
                  <v-chip :color="'#949494a9'" label class="text-chip" style="flex-grow: 1;">
                    <span style="color: black">{{ user.playerName }}</span>
                  </v-chip> 
                  <!-- Current Clan -->
                  <v-chip :color="'#949494a9'" label class="text-chip" style="flex-grow: 1;">
                    <span style="color: black">{{ user.currentClan }}</span> 
                  </v-chip> 
                  <!-- Total Duration -->
                  <v-chip :color="'#FFE815'" label class="text-chip" style="flex-grow: 1;"> 
                    <span style="color: black">{{ formatDuration(user.totalDuration) }}</span>
                  </v-chip>
                </v-btn>
              </v-list-item-title>
            </v-list-item-content>
            <!-- Expanded Content -->
            <v-expand-transition>
              <v-slide-y-transition>
                <v-expand-panel v-if="user.expanded">
                  <v-card>
                    <v-card-text>
                      <v-list>
                        <v-list-item v-for="(entry, index) in user.history" :key="index">
                          <v-list-item-content>
                            <v-list-item-title>{{ entry.clanName }} - {{ formatDuration(entry.duration) }}</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-expand-panel>
              </v-slide-y-transition>
            </v-expand-transition>
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
      dialog: false, // Dialog control
      dialogData: [] // Data for dialog
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
  watch: {
    selectedClans: {
      handler() {
        this.filterUsers();
      },
      deep: true,
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
      remainingDays = Math.round(remainingDays);
  
      let result = "";
      if (years > 0) {
        result += `${years} Year${years === 1 ? '' : 's'} `;
      }
      if (months > 0) {
        result += `${months} Month${months === 1 ? '' : 's'} `;
      }
      //Days
      result += `${remainingDays} Day${remainingDays === 1 ? '' : 's'} `;
  
      if (remainingDays === 0) {
        result = "History is private or less than 1 day";
      }
  
      return result.trim();
    },
    openDialog(user) {
      // Open dialog with user's history data
      this.dialogData = user.history || []; // Set history data, or an empty array if not available
      this.dialog = true;
    }
  },
};
</script>

<style scoped>
/* Add your custom styles here */
</style>

