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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("./entities/category.entity");
let CategoriesService = class CategoriesService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async onModuleInit() {
        await this.seedCategories();
    }
    async seedCategories() {
        const count = await this.categoryRepository.count();
        if (count > 0) {
            return;
        }
        console.log('Seeding initial categories...');
        const categoriesToSeed = [
            { name: 'Parfume', description: 'Premium perfumes and fragrances' },
            { name: 'Body Mist', description: 'Body mists and sprays' },
            { name: 'Rhode Blush', description: 'Rhode blush products' },
        ];
        for (const cat of categoriesToSeed) {
            const newCategory = this.categoryRepository.create(cat);
            await this.categoryRepository.save(newCategory);
        }
        console.log('Successfully seeded categories!');
    }
    create(createCategoryDto) {
        const category = this.categoryRepository.create(createCategoryDto);
        return this.categoryRepository.save(category);
    }
    findAll() {
        return this.categoryRepository.find();
    }
    findOne(id) {
        return this.categoryRepository.findOne({ where: { id } });
    }
    update(id, updateCategoryDto) {
        return this.categoryRepository.update(id, updateCategoryDto);
    }
    remove(id) {
        return this.categoryRepository.delete(id);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map