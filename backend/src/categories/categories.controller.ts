import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './schemas/category.schema';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories', // Save to this folder
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    console.log('Received file:', file);
    console.log('Received body:', createCategoryDto);

    return this.categoriesService.create({
      ...createCategoryDto,
      image: file?.filename || '',
    });
  }

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @Put(':id')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/categories',
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
  }),
)
async update(
  @Param('id') id: string,
  @UploadedFile() file: Express.Multer.File,
  @Body() updateData: any, // không dùng DTO ở đây vì FormData
): Promise<Category> {
  const updatePayload = {
    ...updateData,
    ...(file ? { image: file.filename } : {}),
  };

  return this.categoriesService.update(id, updatePayload);
}


  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }
  //  @Get(':id')
  //  @Get(':id')
  // async getCategoryById(@Param('id') id: string): Promise<Category> {
  //   const category = await this.categoriesService.findCategoryById(id);  // Đảm bảo sử dụng đúng tên service
  //   if (!category) {
  //     throw new Error('Category not found');
  //   }
  //   return category;
  // }
 
  
}
