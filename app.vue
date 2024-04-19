<template>
  <!-- Main Content -->
  <v-card class="mx-auto" color="grey-lighten-3" max-width="488">
    <v-layout>
      <v-app-bar
        image=".\assets\AppBar.png"
        fixed
        scroll-behavior="hide"
        density="prominent"
        scroll-threshold="20"
        class="app-bar-container"
      >
        <!-- <v-app-bar-title>COC Loyalty Ranking</v-app-bar-title> -->
      </v-app-bar>
    </v-layout>
  </v-card>
  <br /><br /><br /><br /><br /><br />
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
    <v-row justify="space-evenly">
      <v-col cols="12">
        <v-list>
          <!-- List Items -->
          <v-list-item
            v-for="(user, index) in sortedFilteredUsers"
            :key="user.playerTag"
            @click="openDialog(user)"
          >
          <div class="text-left">
            <v-list-item-content>
              <v-list-item-title>
                <v-btn variant="text" @click="user.expanded = !user.expanded" block class="justify-space-between">
                  <v-sheet  class="pa-2">
                    <v-chip :color="'#949494a9'"  label>
                      <span style="color: black">{{ index + 1 }} = </span>
                    </v-chip>
                  </v-sheet>
                  <!-- User Name -->
                    <v-sheet  class="pa-2">
                    <v-chip :color="'#949494a9'"  label prepend-icon="mdi-account-circle">
                      <span style="color: black">{{ user.playerName }}</span>
                    </v-chip>
                  </v-sheet>
                    <!-- Current Clan -->
                    <v-sheet class="pa-2">
                    <v-chip :color="'#949494a9'" label >
                      <span style="color: black">{{ user.currentClan }}</span>
                    </v-chip>
                    </v-sheet>
                    <!-- Total Duration -->
                    <v-sheet class="pa-2">
                    <v-chip :color="'#FFE815'" label>
                      <span style="color: black">{{ formatDuration(user.totalDuration) }}</span>
                      <img src=".\assets\clock_icn.png" alt="Clock" class="clock-image">
                    </v-chip>
                    </v-sheet>
                </v-btn>

              </v-list-item-title>
            </v-list-item-content>
          </div>
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
  },
};
</script>

<style scoped>

.app-bar-container :deep(.ql-editor)  {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: auto; /* Automatische Breite basierend auf dem Inhalt */
}

.chip-container-left :deep(.ql-editor) {
  text-align: left;
  flex: 1;
}

.chip-container-center :deep(.ql-editor) {
  text-align: center;
  flex: 1;
}

.chip-container-right :deep(.ql-editor) {
  text-align: right;
  flex: 1;
}

</style>
