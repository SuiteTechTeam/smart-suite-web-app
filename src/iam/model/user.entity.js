export class User {
    constructor(id, name, password, email, company, role) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.email = email;
        this.company = company;
        this.role = role;
        this.notifactions = true;
    }
}