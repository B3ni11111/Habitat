import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  findAll(userId: string) {
    return this.categoryRepo.find({ where: { userId } });
  }

  async findOne(id: string, userId: string) {
    const cat = await this.categoryRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found');
    if (cat.userId !== userId) throw new ForbiddenException();
    return cat;
  }

  create(dto: CreateCategoryDto, userId: string) {
    const cat = this.categoryRepo.create({ ...dto, userId });
    return this.categoryRepo.save(cat);
  }

  async update(id: string, dto: Partial<CreateCategoryDto>, userId: string) {
    const cat = await this.findOne(id, userId);
    Object.assign(cat, dto);
    return this.categoryRepo.save(cat);
  }

  async remove(id: string, userId: string) {
    const cat = await this.findOne(id, userId);
    return this.categoryRepo.remove(cat);
  }
}
