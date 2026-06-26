"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const fakedatabase_1 = require("./fakedatabase");
let UsersService = class UsersService {
    getAllUsers() {
        return fakedatabase_1.users;
    }
    findById(userId) {
        return fakedatabase_1.users.find((user) => user.id === userId);
    }
    create(user) {
        const newID = fakedatabase_1.users[fakedatabase_1.users.length - 1].id + 1;
        const newUser = { ...user, id: newID };
        fakedatabase_1.users.push(newUser);
        return newUser;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)()
], UsersService);
//# sourceMappingURL=users.service.js.map