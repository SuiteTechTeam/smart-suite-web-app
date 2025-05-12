import http from "../../shared/services/http-common.js";

export class CompanyService {

        getAllCompanies() {
            return http.get('/companies');
        }

        getCompany(id) {
            return http.get(`/companies/${id}`);
        }
}