<template>
  <!-- Title -->
  <v-container>
    <v-row justify="center">
      <v-col cols="12" class="text-center">
        <h1 class="title-text" style="color: #d4af37;">
          CLASH OF CLANS LOYALTY RANKING
        </h1>
      </v-col>
    </v-row>
  </v-container>

  <!-- Filter Select -->
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
  </v-container>

  <!-- Table -->
  <v-container>
    <v-table hover="true">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="font-weight-bold" style="width: 3%;">Ranking</th>
            <th class="font-weight-bold" style="width: 15%;">Player Name</th>
            <th class="font-weight-bold" style="width: 15%;">Current Clan</th>
            <th class="font-weight-bold" style="width: 5%;">Total Duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in sortedFilteredUsers" :key="user.playerTag" @click="user.expanded = !user.expanded">
            <!-- Ranking -->
            <td>
              <span :style="{ color: getRankingColor(index, user.playerName) }">{{ index + 1 }} = </span>
            </td>
            <!-- Player Name -->
            <td>
              <v-chip :color="'#121212'">
                <v-icon :color="'#ffffff'" icon="mdi-account-circle"></v-icon>
                <span style="color: white">&nbsp;{{ user.playerName }}</span>
              </v-chip>
            </td>
            <!-- Current Clan -->
            <td>
              <span style="color: white">{{ user.currentClan }}</span>
            </td>
            <!-- Total Duration -->
            <td>
              <v-chip :color="'#121212'">
                <span style="color: #d4af37">{{ formatDuration(user.totalDuration) }} &nbsp; </span>
                <img src=".\assets\clock_icn.png" alt="Clock" class="clock-image">
              </v-chip>
            </td>
            <!-- Expanded Content -->
            <v-expand-transition>
              <v-slide-y-transition>
                <v-expand-panel v-if="user.expanded">
                  <v-card>
                    <v-card-text>
                      <!-- Expanded Table -->
                      <v-table class="smaller-table overflow-auto">
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
</template>

<script>
import axios from "axios";
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ClashOfClansLoyaltyRanking',
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
        return "#ffffff"; // Silver color for the second index (It is white but silver was too dark)
      } else if (index === 2) {
        return "#b47d49"; // Moderate orange color for the third index (Basically brown to resemble bronze)
      } else if (playerName === "FL • BluuBerry") {
        return "#4f86f7"; // Soft blue color for the founder BluuBerry
      } else {
        return "#5A5A5A"; // Default color for other indices (Dark gray so they are still visible but not overpowering)
      }
    },
  },
});
</script>

<style>
/* Main Title */
.title-text {
  color: #d4af37;
}

/* Table Styling */
.smaller-table {
  font-size: 12px;
  width: 100%; /* Set table width to 100% */
}

.smaller-table th,
.smaller-table td {
  padding: 5px;
  white-space: nowrap; /* Prevent table cell content from wrapping */
}

/* Custom Chip Styles */
.chip-custom {
  background-color: #121212;
  color: white;
}

/* Make the table scroll horizontally on small screens */
@media (max-width: 768px) {
  .smaller-table {
    overflow-x: auto;
  }
}
</style>
