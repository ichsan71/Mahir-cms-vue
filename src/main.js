import { createApp, provide, h } from "vue";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import App from "./App.vue";
import { router } from "./router";
import { apolloClient } from "./apollo/client";
import "./assets/main.css";

const app = createApp({
  // Sediakan Apollo client secara global agar useQuery/useMutation bekerja
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.use(createPinia());
app.use(router);
app.mount("#app");
