<script setup lang="ts">
const { loggedIn, user } = useUserSession();

// Fetch feed data only if logged in
const { data: feedData, pending: feedPending } = await useFetch("/api/feed", {
  immediate: loggedIn.value,
});

// Fetch user's own entries only if logged in
const { data: myEntriesData, pending: myEntriesPending } = await useFetch(
  "/api/users/me/entries",
  {
    immediate: loggedIn.value,
  }
);

const feed = computed(() => feedData.value?.feed || []);
const myEntries = computed(() =>
  (myEntriesData.value?.entries || []).slice(0, 5)
);

function navigateToEdit(entryId: string) {
  return navigateTo({
    path: "/my-account",
    query: { editEntry: entryId },
  });
}
</script>

<template>
  <main class="main content">
    <!-- Logged Out State -->
    <div v-if="!loggedIn" class="home-page">
      <h1>Welcome to iHeartBourbon</h1>
      <p>Please register to join our community.</p>
    </div>

    <!-- Logged In State -->
    <div v-else class="page-container">
      <h1 class="page-title">Dashboard</h1>
      <p class="lead">Welcome back, {{ user?.name }}!</p>

      <div class="dashboard-grid">
        <!-- Community Feed -->
        <section class="section-container">
          <h2 class="section-title">Community Activity</h2>

          <div v-if="feedPending" class="loading-state">
            <span class="spinner" />
            Loading feed...
          </div>

          <div v-else-if="feed.length === 0" class="alert alert-info">
            No recent activity in your groups.
          </div>

          <div v-else class="item-list">
            <div
              v-for="item in feed"
              :key="item.id"
              class="item-card feed-card"
            >
              <div class="feed-header">
                <span class="feed-user">{{ item.user.name }}</span>
                <span class="feed-action">reviewed</span>
                <span class="feed-bourbon">{{ item.bourbon.name }}</span>
              </div>
              <div class="feed-groups">
                <small
                  v-for="group in item.groups"
                  :key="group.id"
                  class="badge"
                >
                  {{ group.name }}
                </small>
              </div>

              <div class="review-rating">
                <span class="star-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="{ 'star-empty': star > item.rating }"
                  >
                    ★
                  </span>
                </span>
              </div>

              <p v-if="item.comment" class="review-comment">
                "{{ item.comment }}"
              </p>

              <small class="feed-date">
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </small>
            </div>
          </div>
        </section>

        <!-- User's Recent Activity -->
        <section class="section-container">
          <h2 class="section-title">Your Recent Reviews</h2>

          <div v-if="myEntriesPending" class="loading-state">
            <span class="spinner" />
            Loading your reviews...
          </div>

          <div v-else-if="myEntries.length === 0" class="alert alert-info">
            You haven't reviewed any bourbons yet.
            <NuxtLink to="/bourbon/add" class="alert-link">
              Add a review
            </NuxtLink>
          </div>

          <div v-else class="item-list">
            <div
              v-for="entry in myEntries"
              :key="entry.id"
              class="item-card review-card clickable"
              role="button"
              tabindex="0"
              @click="navigateToEdit(entry.id)"
              @keydown.enter="navigateToEdit(entry.id)"
            >
              <div class="review-content">
                <h5 class="review-title">
                  {{ entry.bourbon.name }}
                </h5>
                <div class="review-rating">
                  <span class="star-rating">
                    <span
                      v-for="star in 5"
                      :key="star"
                      :class="{ 'star-empty': star > entry.rating }"
                    >
                      ★
                    </span>
                  </span>
                </div>
                <small class="review-date">
                  {{ new Date(entry.createdAt).toLocaleDateString() }}
                </small>
              </div>
              <div v-if="entry.bourbon.imageUrl" class="review-image">
                <img :src="entry.bourbon.imageUrl" :alt="entry.bourbon.name" />
              </div>
            </div>

            <div class="view-all-link">
              <NuxtLink to="/my-account" class="btn btn-outline btn-sm"
                >View All</NuxtLink
              >
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.home-page {
  padding: 2rem;
  text-align: center;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 900px) {
    grid-template-columns: 3fr 2fr;
  }
}

.lead {
  font-size: 1.25rem;
  color: var(--text-secondary, #666);
  margin-bottom: 2rem;
}

/* Feed Styling */
.feed-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feed-header {
  font-size: 1.1rem;
}

.feed-user {
  font-weight: 600;
  color: var(--primary-color, #d35400);
}

.feed-action {
  color: var(--text-secondary, #666);
  margin: 0 0.4rem;
}

.feed-bourbon {
  font-weight: 600;
  color: var(--text-primary, #1a1a1a);
}

.feed-groups {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.25rem;
}

.badge {
  background-color: #f0f0f0;
  color: #666;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.review-comment {
  font-style: italic;
  color: var(--text-secondary, #444);
  background: #f9f9f9;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 0.5rem;
}

.feed-date {
  align-self: flex-end;
  color: var(--text-secondary, #999);
  font-size: 0.8rem;
}

/* Review Card Reuse */
.review-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.review-content {
  flex: 1;
}

.review-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.review-image img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.view-all-link {
  margin-top: 1rem;
  text-align: center;
}
</style>
