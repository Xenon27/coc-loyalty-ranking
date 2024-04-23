<template>
  <!-- Main Content -->
  <v-app dark>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" 
      class="text-center" 
      >
      <h1 class="title-text" 
      style="color: #d4af37;"
      >
      CLASH OF CLANS LOYALTY RANKING
    </h1>
      </v-col>
    </v-row>
  </v-container>
  

  <v-container>
    <v-row justify="space-around">
      <v-col cols="12">
        <v-select
          v-model="selectedClans"
          label="Filter for Clans"
          :items="availableClans"
          multiple
          chips
          outlined
          clearable
          dense
        ></v-select>
      </v-col>
    </v-row>
    <v-table hover="True">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="font-weight-bold" style="width: 5%;">Ranking</th>
            <th class="font-weight-bold" style="width: 5%;">Player Name</th>
            <th class="font-weight-bold" style="width: 5%;">Current Clan</th>
            <th class="font-weight-bold" style="width: 5%;">Total Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in sortedFilteredUsers" :key="user.playerTag" @click="user.expanded = !user.expanded">
            <td>
              <span :style="{ color: getRankingColor(index, user.playerName) }">{{ index + 1 }} = </span>
            </td>
            <td>
                <v-icon icon="mdi-account-circle"></v-icon>
                <span style="color: white">&nbsp;{{ user.playerName }}</span>
            </td>
            <td>
                <span style="color: white">{{ user.currentClan }}</span>
            </td>
            <td>
                <span style="color: #d4af37">{{ formatDuration(user.totalDuration) }} &nbsp; </span>
                <img src=".\assets\clock_icn_dmode.png" alt="Clock" class="clock-image">
            </td>
            <!-- Expanded Content -->
            <v-expand-transition>
              <v-slide-y-transition>
                <v-expand-panel v-if="user.expanded">
                  <v-card>
                    <v-card-text>
                      <v-table class="smaller-table">
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="font-weight-bold">Clan Name</th>
                              <th class="font-weight-bold">Duration</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(entry, index) in user.history" :key="index">
                              <td>{{ entry.clanName }}</td>
                              <td>{{ formatDuration(entry.duration) }}</td>
                            </tr>
                          </tbody>
                        </template>
                      </v-table>
                    </v-card-text>
                  </v-card>
                </v-expand-panel>
              </v-slide-y-transition>
            </v-expand-transition>
          </tr>
        </tbody>
      </template>
    </v-table>
  </v-container>
</v-app>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      selectedClans: [],
      users: [],
      filteredUsers: [],
      dialog: false, // Dialog control
      dialogData: [], // Data for dialog
    };
  },
  async mounted() {
    try {
      const response = await axios.get("api/FruchtLabor");
      this.users = response.data;
      this.filteredUsers = response.data;
    } catch (error) {
      console.error(error);
    }
  },
  computed: {
    availableClans() {
      // Extract unique clan names from the user data
      const clansSet = new Set(this.users.map((user) => user.currentClan));
      return Array.from(clansSet);
    },
    sortedFilteredUsers() {
      // Sort filtered users by totalDuration in descending order
      return this.filteredUsers
        .slice()
        .sort((a, b) => b.totalDuration - a.totalDuration);
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
        this.filteredUsers = this.users.filter((user) =>
          this.selectedClans.includes(user.currentClan)
        );
      }
    },

    formatDuration(milliseconds) {
      // Function to format duration from milliseconds to years, months, and days
      const msInSecond = 1000;
      const secondsInMinute = 60;
      const minutesInHour = 60;
      const hoursInDay = 24;
      const daysInYear = 365.2425; // Average days in a year including leap years

      let days =
        milliseconds /
        (msInSecond * secondsInMinute * minutesInHour * hoursInDay);

      const years = Math.floor(days / daysInYear);
      let remainingDays = days % daysInYear;

      const averageDaysInMonth = daysInYear / 12;
      const months = Math.floor(remainingDays / averageDaysInMonth);
      remainingDays %= averageDaysInMonth;
      remainingDays = Math.round(remainingDays);

      let result = "";
      if (years > 0) {
        result += `${years} Year${years === 1 ? "" : "s"} `;
      }
      if (months > 0) {
        result += `${months} Month${months === 1 ? "" : "s"} `;
      }
      //Days
      result += `${remainingDays} Day${remainingDays === 1 ? "" : "s"} `;

      if (remainingDays === 0 && months === 0 && years === 0) {
        result = "< 1 day";
      }

      return result.trim();
    },

    openDialog(user) {
      // Open dialog with user's history data
      this.dialogData = user.history || []; // Set history data, or an empty array if not available
      this.dialog = true;
    },

    getRankingColor(index, playerName) {
      // Function to determine the color based on the index
      if (index === 0) {
        return "#d4af37"; // Gold color for the first index
      } else if (index === 1) {
        return "#C0C0C0"; // Silver color for the second index
      } else if (index === 2) {
        return "#804000"; // Bronze color for the third index
      } else if (playerName === "FL • BluuBerry") {
        return "#4f86f7"; // Bronze color for the third index
      }else {
        return "#ffffff"; // Default color for other indices
      }
    },
  },
};
</script>

<style>
.smaller-table {
  font-size: 12px; /* Adjust font size */
}

.smaller-table th,
.smaller-table td {
  padding: 5px; /* Adjust padding */
}

</style>
