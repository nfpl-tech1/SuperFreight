"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDepartment = exports.Department = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var Department;
(function (Department) {
    Department["IMPORT"] = "IMPORT";
    Department["EXPORT"] = "EXPORT";
    Department["INTERNATIONAL"] = "INTERNATIONAL";
})(Department || (exports.Department = Department = {}));
let UserDepartment = class UserDepartment {
    id;
    userId;
    department;
    user;
};
exports.UserDepartment = UserDepartment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserDepartment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserDepartment.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Department }),
    __metadata("design:type", String)
], UserDepartment.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.departments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], UserDepartment.prototype, "user", void 0);
exports.UserDepartment = UserDepartment = __decorate([
    (0, typeorm_1.Index)('IDX_user_departments_userId', ['userId']),
    (0, typeorm_1.Unique)('UQ_user_departments_userId_department', ['userId', 'department']),
    (0, typeorm_1.Entity)('user_departments')
], UserDepartment);
//# sourceMappingURL=user-department.entity.js.map