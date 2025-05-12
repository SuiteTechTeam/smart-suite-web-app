import {createApp} from 'vue'
import './style.css'
import App from './App.vue'

// PrimeVue
import PrimeVue from "primevue/config";

// PrimeVue services
import ConfirmationService from "primevue/confirmationservice";
import DialogService from "primevue/dialogservice";
import ToastService from "primevue/toastservice";

// Prime vue components
import Button from "primevue/button";
import Card from "primevue/card";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import Checkbox from "primevue/checkbox";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Menu from "primevue/menu";
import Rating from "primevue/rating";
import Row from "primevue/row";
import Sidebar from "primevue/sidebar";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import Toolbar from "primevue/toolbar";
import Toast from "primevue/toast";
import Chart from 'primevue/chart';
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Panel from "primevue/panel";
import Avatar from "primevue/avatar";
import Divider from "primevue/divider";
import SelectButton from "primevue/selectbutton";
import CountryFlagEsm from "vue-country-flag-next";
import Password from "primevue/password";
import Calendar from "primevue/calendar";

// PrimeIcons
import 'primeicons/primeicons.css';

// PrimeFlex
import 'primeflex/primeflex.css';

// Theme
import './assets/theme/theme-light.css';
import 'primevue/resources/primevue.min.css';

// i18n
import i18n from "./i18n.js";

// Router
import router from "./router/index.js";

const app = createApp(App);

// Add prime vue plugin
app
    .use(router)
    .use(PrimeVue, {ripple: true})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component("pv-button", Button)
    .component("pv-card", Card)
    .component("pv-column", Column)
    .component("pv-confirm-dialog", ConfirmDialog)
    .component('pv-select-button', SelectButton)
    .component('pv-dropdown ', Dropdown)
    .component("pv-checkbox", Checkbox)
    .component("pv-tab-view", TabView)
    .component("pv-tab-panel", TabPanel)
    .component("pv-data-table", DataTable)
    .component("pv-dialog", Dialog)
    .component("pv-dropdown", Dropdown)
    .component("pv-file-upload", FileUpload)
    .component("pv-float-label", FloatLabel)
    .component("pv-icon-field", IconField)
    .component("pv-input-icon", InputIcon)
    .component("pv-input-text", InputText)
    .component('pv-input-number', InputNumber)
    .component("pv-menu", Menu)
    .component("pv-rating", Rating)
    .component("pv-row", Row)
    .component("pv-sidebar", Sidebar)
    .component("pv-tag", Tag)
    .component('pv-textarea', Textarea)
    .component("pv-toolbar", Toolbar)
    .component('pv-toast', Toast)
    .component('pv-panel', Panel)
    .component('pv-avatar', Avatar)
    .component('pv-divider', Divider)
    .component('pv-chart', Chart)
    .component('pv-flag', CountryFlagEsm)
    .component('pv-password', Password)
    .component("pv-calendar", Calendar)

// Add i18n plugin
app.use(i18n);

// Mount the app
app.mount('#app')
