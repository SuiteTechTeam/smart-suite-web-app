import {createRouter, createWebHistory} from "vue-router";
import AccessContentComponent from "../iam/components/access-view/access-content.component.vue";
import {LoginService} from "../iam/service/login-service.js";
import ControlPanelPageComponent from "../public/pages/control-panel-page.component.vue";
import ProfileViewComponent from "../profiles/components/profile-view/profile-view.component.vue";
import CompanyPage from "../profiles/pages/company-page.vue";
import ReportsViewComponent from "../analytics/components/reports-view/reports-view.component.vue";
import RoomManagementComponent from "../monitoring/room-managament/pages/room-management.component.vue";
import NotificationsContentComponent from "../interaction/components/notifications-content.component.vue";
import SuppliesContentComponent from "../supply/components/supplies-content.component.vue";

const loginService = new LoginService();

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path: '/', component: AccessContentComponent,},
        {path: '/panel', component: ControlPanelPageComponent, meta: {requiresAuth: true}, name: 'panel'},
        {path: '/profile/:id', component: ProfileViewComponent, meta: {requiresAuth: true}, name: 'profile'},
        {path: '/company', component: CompanyPage, meta: {requiresAuth: true}, name: 'company'},
        {path: '/charts', component: ReportsViewComponent, meta: {requiresAuth: true}, name: 'charts'},
        {path: '/rooms', component: RoomManagementComponent, meta: {requiresAuth: true}, name: 'rooms'},
        {path: '/notifications', component: NotificationsContentComponent, meta: {requiresAuth: true}, name: 'notifications'},
        {path: '/supply', component: SuppliesContentComponent, meta: {requiresAuth: true}, name: 'supply'},
    ]
});

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        const token = localStorage.getItem('token');
        if (!token) {
            next({path: '/'});
            return;
        }
        loginService.getUser(token).then(response => {
            if (response.status === 200) {
                next();
            } else {
                next({path: '/'});
            }
        })
    } else {
        next(); // make sure to always call next()!
    }
})

export default router;